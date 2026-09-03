import logging

from fastapi.testclient import TestClient

from resolvehub_analytics.main import create_app


def test_duplicate_suggestion_returns_ranked_exact_match() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/analytics/suggestions/duplicates",
        json={
            "ticket": {
                "id": "ticket-100",
                "title": "VPN outage for agents",
                "description": "Agents cannot connect to the production VPN.",
                "category": "network",
                "priority": "URGENT",
            },
            "candidates": [
                {
                    "id": "ticket-102",
                    "title": "VPN outage for agents",
                    "description": "Production VPN is unavailable for support agents.",
                    "category": "network",
                    "priority": "URGENT",
                },
                {
                    "id": "ticket-103",
                    "title": "Invoice question",
                    "description": "Question about a billing invoice.",
                    "category": "billing",
                    "priority": "LOW",
                },
            ],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["advisory"] is True
    assert body["low_confidence"] is False
    assert [candidate["candidate_id"] for candidate in body["candidates"]] == ["ticket-102"]
    assert body["candidates"][0]["confidence"] >= 0.75
    assert body["candidates"][0]["matching_signals"] == [
        "exact_title",
        "shared_title_terms",
        "shared_description_terms",
        "shared_category",
        "shared_priority",
    ]


def test_duplicate_suggestion_returns_partial_low_confidence_match() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/analytics/suggestions/duplicates",
        json={
            "ticket": {
                "title": "Cannot reset password",
                "description": "Requester is blocked from account access after MFA reset.",
                "category": "account-access",
                "priority": "HIGH",
            },
            "candidates": [
                {
                    "id": "ticket-201",
                    "title": "Password reset problem",
                    "description": "Account access is blocked after a password reset.",
                    "category": "account-access",
                    "priority": "MEDIUM",
                }
            ],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["low_confidence"] is True
    assert body["candidates"][0]["candidate_id"] == "ticket-201"
    assert body["candidates"][0]["confidence"] < 0.55
    assert "shared_category" in body["candidates"][0]["matching_signals"]


def test_duplicate_suggestion_returns_no_matches_for_unrelated_candidates() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/analytics/suggestions/duplicates",
        json={
            "ticket": {
                "title": "Printer tray jam",
                "description": "Office printer tray fails on large paper jobs.",
                "category": "hardware",
                "priority": "LOW",
            },
            "candidates": [
                {
                    "id": "ticket-301",
                    "title": "Dashboard chart filter",
                    "description": "Workflow dashboard filter shows stale chart totals.",
                    "category": "workflow",
                    "priority": "MEDIUM",
                }
            ],
        },
    )

    assert response.status_code == 200
    assert response.json() == {"candidates": [], "low_confidence": True, "advisory": True}


def test_duplicate_suggestion_handles_empty_candidate_list() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/analytics/suggestions/duplicates",
        json={"ticket": {"title": "VPN outage", "category": "network"}, "candidates": []},
    )

    assert response.status_code == 200
    assert response.json() == {"candidates": [], "low_confidence": True, "advisory": True}


def test_duplicate_suggestion_rejects_candidate_lists_over_limit() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/analytics/suggestions/duplicates",
        json={
            "ticket": {"title": "VPN outage", "category": "network"},
            "candidates": [
                {
                    "id": f"ticket-{index:03}",
                    "title": "VPN outage",
                    "category": "network",
                    "priority": "HIGH",
                }
                for index in range(26)
            ],
        },
    )

    assert response.status_code == 422


def test_duplicate_suggestion_excludes_same_ticket_id() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/analytics/suggestions/duplicates",
        json={
            "ticket": {
                "id": "ticket-401",
                "title": "Billing invoice question",
                "category": "billing",
            },
            "candidates": [
                {
                    "id": "ticket-401",
                    "title": "Billing invoice question",
                    "category": "billing",
                }
            ],
        },
    )

    assert response.status_code == 200
    assert response.json()["candidates"] == []


def test_duplicate_suggestion_uses_stable_tie_breaking() -> None:
    client = TestClient(create_app())

    payload = {
        "ticket": {
            "title": "VPN outage",
            "description": "Network outage for agents.",
            "category": "network",
            "priority": "HIGH",
        },
        "candidates": [
            {
                "id": "ticket-b",
                "title": "VPN outage",
                "description": "Network outage for agents.",
                "category": "network",
                "priority": "HIGH",
            },
            {
                "id": "ticket-a",
                "title": "VPN outage",
                "description": "Network outage for agents.",
                "category": "network",
                "priority": "HIGH",
            },
        ],
    }

    response = client.post("/analytics/suggestions/duplicates", json=payload)

    assert response.status_code == 200
    assert [candidate["candidate_id"] for candidate in response.json()["candidates"]] == [
        "ticket-a",
        "ticket-b",
    ]


def test_duplicate_suggestion_rejects_malformed_request() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/analytics/suggestions/duplicates",
        json={
            "ticket": {"title": ["not", "a", "string"]},
            "candidates": [{"id": ""}],
            "unexpected": "field",
        },
    )

    assert response.status_code == 422


def test_duplicate_suggestion_does_not_echo_or_log_ticket_content(caplog) -> None:
    client = TestClient(create_app())
    private_phrase = "private secret-like incident narrative"

    with caplog.at_level(logging.INFO):
        response = client.post(
            "/analytics/suggestions/duplicates",
            json={
                "ticket": {
                    "id": "ticket-501",
                    "title": "Privacy incident",
                    "description": private_phrase,
                    "category": "privacy",
                    "priority": "HIGH",
                },
                "candidates": [
                    {
                        "id": "ticket-502",
                        "title": "Privacy incident",
                        "description": private_phrase,
                        "category": "privacy",
                        "priority": "HIGH",
                    }
                ],
            },
        )

    assert response.status_code == 200
    response_text = response.text
    assert private_phrase not in response_text
    assert "Privacy incident" not in response_text
    assert private_phrase not in caplog.text
