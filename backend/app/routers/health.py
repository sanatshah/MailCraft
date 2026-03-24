from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()


@router.get("/api/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
