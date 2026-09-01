from __future__ import annotations

import re
from collections.abc import Iterable
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field, StrictStr

from resolvehub_analytics.triage import TicketCategory, TicketPriority


TicketStatus = Literal[
    "OPEN",
    "TRIAGED",
    "IN_PROGRESS",
    "WAITING_ON_REQUESTER",
    "RESOLVED",
    "CLOSED",
]
DuplicateSignal = Literal[
    "exact_title",
    "shared_title_terms",
    "shared_description_terms",
    "shared_category",
    "shared_priority",
]


class DuplicateTicketInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    id: StrictStr | None = Field(default=None, max_length=80)
    title: StrictStr | None = Field(default=None, max_length=120)
    description: StrictStr | None = Field(default=None, max_length=4000)
    category: TicketCategory | None = None
    priority: TicketPriority | None = None
    status: TicketStatus | None = None


class DuplicateCandidateInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    id: StrictStr = Field(min_length=1, max_length=80)
    title: StrictStr | None = Field(default=None, max_length=120)
    description: StrictStr | None = Field(default=None, max_length=4000)
    category: TicketCategory | None = None
    priority: TicketPriority | None = None
    status: TicketStatus | None = None


class DuplicateSuggestionRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    ticket: DuplicateTicketInput = Field(default_factory=DuplicateTicketInput)
    candidates: list[DuplicateCandidateInput] = Field(default_factory=list, max_length=25)


class DuplicateCandidateSuggestion(BaseModel):
    candidate_id: str
    confidence: float = Field(ge=0, le=1)
    matching_signals: list[DuplicateSignal] = Field(min_length=1)
    explanation: list[str] = Field(min_length=1)


class DuplicateSuggestionResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "candidates": [
                    {
                        "candidate_id": "ticket-102",
                        "confidence": 0.84,
                        "matching_signals": [
                            "exact_title",
                            "shared_category",
                            "shared_priority",
                        ],
                        "explanation": [
                            "Matched exact normalized title.",
                            "Matched category metadata.",
                            "Matched priority metadata.",
                            "Suggestion is advisory and does not merge or mutate tickets.",
                        ],
                    }
                ],
                "low_confidence": False,
                "advisory": True,
            }
        }
    )

    candidates: list[DuplicateCandidateSuggestion]
    low_confidence: bool
    advisory: Literal[True]


router = APIRouter(tags=["suggestions"])

TOKEN_PATTERN = re.compile(r"[a-z0-9]+")
STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "to",
    "with",
}
MIN_MATCH_CONFIDENCE = 0.35


@router.post(
    "/analytics/suggestions/duplicates",
    response_model=DuplicateSuggestionResponse,
    summary="Suggest possible duplicate tickets",
)
def suggest_duplicates(request: DuplicateSuggestionRequest) -> DuplicateSuggestionResponse:
    source = _normalized_ticket(request.ticket)
    suggestions = [
        suggestion
        for candidate in request.candidates
        if not _is_same_ticket(source.ticket_id, candidate.id)
        for suggestion in [_score_candidate(source, candidate)]
        if suggestion is not None
    ]

    suggestions.sort(
        key=lambda suggestion: (
            -suggestion.confidence,
            suggestion.candidate_id,
        )
    )

    return DuplicateSuggestionResponse(
        candidates=suggestions,
        low_confidence=not suggestions or suggestions[0].confidence < 0.55,
        advisory=True,
    )


class NormalizedTicket(BaseModel):
    ticket_id: str | None
    title_key: str
    title_tokens: frozenset[str]
    description_tokens: frozenset[str]
    all_tokens: frozenset[str]
    category: TicketCategory | None
    priority: TicketPriority | None


def _normalized_ticket(ticket: DuplicateTicketInput | DuplicateCandidateInput) -> NormalizedTicket:
    title = ticket.title or ""
    description = ticket.description or ""
    title_tokens = _meaningful_tokens(title)
    description_tokens = _meaningful_tokens(description)
    return NormalizedTicket(
        ticket_id=ticket.id,
        title_key=_normalized_title(title),
        title_tokens=title_tokens,
        description_tokens=description_tokens,
        all_tokens=title_tokens | description_tokens,
        category=ticket.category,
        priority=ticket.priority,
    )


def _score_candidate(
    source: NormalizedTicket,
    candidate: DuplicateCandidateInput,
) -> DuplicateCandidateSuggestion | None:
    normalized_candidate = _normalized_ticket(candidate)
    confidence = 0.0
    signals: list[DuplicateSignal] = []
    explanation: list[str] = []

    if source.title_key and source.title_key == normalized_candidate.title_key:
        confidence += 0.45
        signals.append("exact_title")
        explanation.append("Matched exact normalized title.")

    title_overlap = _overlap_ratio(source.title_tokens, normalized_candidate.title_tokens)
    if title_overlap >= 0.5:
        confidence += min(0.25, title_overlap * 0.25)
        signals.append("shared_title_terms")
        explanation.append("Matched safe title terms.")

    description_overlap = _overlap_ratio(source.all_tokens, normalized_candidate.all_tokens)
    if description_overlap >= 0.35:
        confidence += min(0.2, description_overlap * 0.2)
        signals.append("shared_description_terms")
        explanation.append("Matched safe ticket terms.")

    if source.category and source.category == normalized_candidate.category:
        confidence += 0.15
        signals.append("shared_category")
        explanation.append("Matched category metadata.")

    if source.priority and source.priority == normalized_candidate.priority:
        confidence += 0.1
        signals.append("shared_priority")
        explanation.append("Matched priority metadata.")

    confidence = round(min(confidence, 0.95), 2)
    if confidence < MIN_MATCH_CONFIDENCE:
        return None

    explanation.append("Suggestion is advisory and does not merge or mutate tickets.")
    return DuplicateCandidateSuggestion(
        candidate_id=candidate.id,
        confidence=confidence,
        matching_signals=signals,
        explanation=explanation,
    )


def _is_same_ticket(source_id: str | None, candidate_id: str) -> bool:
    return bool(source_id and source_id == candidate_id)


def _normalized_title(title: str) -> str:
    return " ".join(_tokens_for(title))


def _meaningful_tokens(text: str) -> frozenset[str]:
    return frozenset(token for token in _tokens_for(text) if token not in STOP_WORDS and len(token) > 2)


def _tokens_for(text: str) -> tuple[str, ...]:
    return tuple(TOKEN_PATTERN.findall(text.casefold()))


def _overlap_ratio(left: Iterable[str], right: Iterable[str]) -> float:
    left_set = set(left)
    right_set = set(right)
    if not left_set or not right_set:
        return 0.0
    return len(left_set & right_set) / len(left_set | right_set)
