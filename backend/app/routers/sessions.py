from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.focus_session import Technique
from app.models.user import User
from app.schemas.session_schemas import (
    CreateSessionRequest,
    SessionListResponse,
    SessionResponse,
    StatsResponse,
)
from app.services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/", response_model=SessionResponse, status_code=201)
def create_session(
    data: CreateSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SessionResponse:
    return SessionService(db).create_session(current_user, data)


@router.get("/stats", response_model=StatsResponse)
def get_stats(
    interval: str | None = Query(None, description="week | month | 3months | year"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StatsResponse:
    return SessionService(db).get_stats(current_user, interval)


@router.get("/", response_model=SessionListResponse)
def list_sessions(
    technique: Technique | None = Query(None, description="pomodoro | flowtime | bolsa"),
    interval: str | None = Query(None, description="week | month | 3months | year"),
    project: str | None = Query(None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SessionListResponse:
    return SessionService(db).list_sessions(
        current_user, technique, interval, project, limit, offset
    )


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    SessionService(db).delete_session(current_user, session_id)
