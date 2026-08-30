from fastapi.testclient import TestClient

from resolvehub_analytics.main import create_app


def test_triage_suggestion_returns_category_priority_confidence_and_explanation() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/analytics/suggestions/triage",
        json={
            "title": "VPN outage for all users",
            "description": "Production network is down and agents cannot connect.",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["category"] == "network"
    assert body["priority"] == "URGENT"
    assert body["confidence"] >= 0.65
    assert body["low_confidence"] is False
    assert body["advisory"] is True
    assert body["explanation"] == [
        "Matched network keywords.",
        "Detected urgent priority indicators.",
        "Suggestion is advisory and requires human review.",
    ]


def test_triage_suggestion_is_deterministic_for_fixtures() -> None:
    client = TestClient(create_app())
    payload = {
        "title": "Invoice refund request",
        "description": "Customer has a billing question about a subscription charge.",
    }

    first = client.post("/analytics/suggestions/triage", json=payload)
    second = client.post("/analytics/suggestions/triage", json=payload)

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json() == second.json()


def test_triage_suggestion_does_not_match_partial_priority_tokens() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/analytics/suggestions/triage",
        json={"title": "Download problem", "description": "Download fails for one guide."},
    )

    assert response.status_code == 200
    assert response.json()["priority"] != "URGENT"


def test_triage_suggestion_does_not_match_partial_category_tokens() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/analytics/suggestions/triage",
        json={"title": "Accounting report issue", "description": "Monthly report totals look wrong."},
    )

    assert response.status_code == 200
    assert response.json()["category"] != "account-access"


def test_triage_suggestion_does_not_make_production_typo_urgent() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/analytics/suggestions/triage",
        json={"title": "Production documentation typo", "description": "Minor typo in a production runbook."},
    )

    assert response.status_code == 200
    assert response.json()["priority"] == "LOW"


def test_triage_suggestion_returns_low_confidence_safe_fallback_for_minimal_request() -> None:
    client = TestClient(create_app())

    response = client.post("/analytics/suggestions/triage", json={})

    assert response.status_code == 200
    body = response.json()
    assert body["category"] == "general"
    assert body["priority"] == "MEDIUM"
    assert body["confidence"] == 0.2
    assert body["low_confidence"] is True
    assert body["advisory"] is True


def test_triage_suggestion_rejects_malformed_request() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/analytics/suggestions/triage",
        json={"title": ["not", "a", "string"], "unexpected": "field"},
    )

    assert response.status_code == 422


def test_triage_suggestion_does_not_echo_ticket_content() -> None:
    client = TestClient(create_app())
    private_phrase = "private internal incident narrative"

    response = client.post(
        "/analytics/suggestions/triage",
        json={
            "title": "Privacy request",
            "description": f"{private_phrase} with personal data export details.",
        },
    )

    assert response.status_code == 200
    response_text = response.text
    assert private_phrase not in response_text
    assert "personal data export details" not in response_text
