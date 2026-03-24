from __future__ import annotations

from fastapi import FastAPI

from app.routers.health import router as health_router
from app.routers.templates import router as templates_router


def register_routers(app: FastAPI) -> None:
    app.include_router(health_router)
    app.include_router(templates_router)
