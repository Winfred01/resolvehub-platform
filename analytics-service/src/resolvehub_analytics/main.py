from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

from resolvehub_analytics.triage import router as triage_router


class HealthResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "ok",
                "service": "resolvehub-analytics",
                "checked_at": "2026-07-30T00:00:00Z",
            }
        }
    )

    status: Literal["ok"]
    service: Literal["resolvehub-analytics"]
    checked_at: datetime


def create_app() -> FastAPI:
    app = FastAPI(
        title="ResolveHub Analytics Service",
        version="0.1.0",
        summary="MVP analytics scaffold for future ticket suggestions.",
    )

    @app.get(
        "/analytics/health",
        response_model=HealthResponse,
        response_model_by_alias=True,
        tags=["health"],
        summary="Check analytics service health",
    )
    def health() -> HealthResponse:
        return HealthResponse(
            status="ok",
            service="resolvehub-analytics",
            checked_at=datetime.now(timezone.utc),
        )

    app.include_router(triage_router)

    return app


app = create_app()
