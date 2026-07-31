from datetime import datetime

from fastapi.testclient import TestClient

from resolvehub_analytics.main import create_app


def test_health_endpoint_returns_service_status() -> None:
    client = TestClient(create_app())

    response = client.get("/analytics/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "resolvehub-analytics"
    assert datetime.fromisoformat(body["checked_at"].replace("Z", "+00:00"))
