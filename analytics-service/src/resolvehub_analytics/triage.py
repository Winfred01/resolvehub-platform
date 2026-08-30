from __future__ import annotations

from collections.abc import Iterable
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field, StrictStr


TicketCategory = Literal[
    "account-access",
    "billing",
    "general",
    "hardware",
    "network",
    "privacy",
    "workflow",
]
TicketPriority = Literal["LOW", "MEDIUM", "HIGH", "URGENT"]


class TriageSuggestionRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    title: StrictStr | None = Field(default=None, max_length=120)
    description: StrictStr | None = Field(default=None, max_length=4000)


class TriageSuggestionResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "category": "network",
                "priority": "URGENT",
                "confidence": 0.84,
                "explanation": [
                    "Matched network routing keywords.",
                    "Detected urgent service-impact language.",
                    "Suggestion is advisory and requires human review.",
                ],
                "low_confidence": False,
                "advisory": True,
            }
        }
    )

    category: TicketCategory
    priority: TicketPriority
    confidence: float = Field(ge=0, le=1)
    explanation: list[str] = Field(min_length=1)
    low_confidence: bool
    advisory: Literal[True]


router = APIRouter(tags=["suggestions"])


CATEGORY_RULES: dict[TicketCategory, tuple[str, ...]] = {
    "account-access": (
        "account",
        "access",
        "authentication",
        "login",
        "mfa",
        "password",
        "reset",
        "sign in",
    ),
    "billing": (
        "billing",
        "charge",
        "invoice",
        "payment",
        "refund",
        "subscription",
    ),
    "hardware": (
        "device",
        "hardware",
        "keyboard",
        "laptop",
        "monitor",
        "printer",
        "screen",
    ),
    "network": (
        "connection",
        "dns",
        "internet",
        "latency",
        "network",
        "outage",
        "vpn",
        "wifi",
    ),
    "privacy": (
        "data export",
        "data leak",
        "delete data",
        "gdpr",
        "personal data",
        "privacy",
        "security breach",
    ),
    "workflow": (
        "approval",
        "assignment",
        "automation",
        "kanban",
        "queue",
        "status",
        "workflow",
    ),
    "general": (),
}

PRIORITY_RULES: dict[TicketPriority, tuple[str, ...]] = {
    "URGENT": (
        "all users",
        "breach",
        "critical",
        "data leak",
        "down",
        "outage",
        "production",
        "security breach",
        "system unavailable",
    ),
    "HIGH": (
        "blocked",
        "cannot",
        "failed",
        "failing",
        "major",
        "unable",
    ),
    "MEDIUM": (
        "degraded",
        "error",
        "intermittent",
        "slow",
        "stuck",
    ),
    "LOW": (
        "cosmetic",
        "documentation",
        "minor",
        "question",
        "typo",
    ),
}


@router.post(
    "/analytics/suggestions/triage",
    response_model=TriageSuggestionResponse,
    summary="Suggest ticket category and priority",
)
def suggest_triage(request: TriageSuggestionRequest) -> TriageSuggestionResponse:
    text = _normalize_text((request.title, request.description))
    category, category_confidence, category_explanation = _suggest_category(text)
    priority, priority_confidence, priority_explanation = _suggest_priority(text)
    confidence = round(min(category_confidence, priority_confidence), 2)

    explanation = [
        category_explanation,
        priority_explanation,
        "Suggestion is advisory and requires human review.",
    ]

    return TriageSuggestionResponse(
        category=category,
        priority=priority,
        confidence=confidence,
        explanation=explanation,
        low_confidence=confidence < 0.55,
        advisory=True,
    )


def _normalize_text(parts: Iterable[str | None]) -> str:
    return " ".join(part.casefold() for part in parts if part).strip()


def _suggest_category(text: str) -> tuple[TicketCategory, float, str]:
    if not text:
        return "general", 0.2, "No ticket text was provided, so the safe fallback category was used."

    scores = {
        category: _keyword_score(text, keywords)
        for category, keywords in CATEGORY_RULES.items()
        if category != "general"
    }
    category, score = max(scores.items(), key=lambda item: (item[1], item[0]))
    if score == 0:
        return "general", 0.35, "No category-specific keywords matched, so the safe fallback category was used."

    tied = sum(1 for value in scores.values() if value == score)
    confidence = _confidence_from_score(score, tied)
    return category, confidence, f"Matched {category} keywords."


def _suggest_priority(text: str) -> tuple[TicketPriority, float, str]:
    if not text:
        return "MEDIUM", 0.2, "No ticket text was provided, so the safe fallback priority was used."

    for priority in ("URGENT", "HIGH", "MEDIUM", "LOW"):
        score = _keyword_score(text, PRIORITY_RULES[priority])
        if score > 0:
            confidence = _confidence_from_score(score, 1)
            return priority, confidence, f"Detected {priority.lower()} priority indicators."

    return "MEDIUM", 0.35, "No priority-specific keywords matched, so the safe fallback priority was used."


def _keyword_score(text: str, keywords: tuple[str, ...]) -> int:
    return sum(1 for keyword in keywords if keyword in text)


def _confidence_from_score(score: int, tied: int) -> float:
    confidence = 0.55 + min(score, 4) * 0.1
    if tied > 1:
        confidence -= 0.1
    return round(min(max(confidence, 0.0), 0.95), 2)
