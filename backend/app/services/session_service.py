from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.focus_session import Technique
from app.models.user import User
from app.repositories.session_repository import SessionRepository
from app.schemas.session_schemas import (
    CreateSessionRequest,
    SessionListResponse,
    SessionResponse,
    StatsResponse,
    TechniqueStats,
)


class SessionService:
    def __init__(self, db: Session) -> None:
        self.repo = SessionRepository(db)

    def create_session(self, user: User, data: CreateSessionRequest) -> SessionResponse:
        session = self.repo.create(user_id=user.id, data=data)
        return SessionResponse.model_validate(session)

    def list_sessions(
        self,
        user: User,
        technique: Technique | None,
        interval: str | None,
        project: str | None,
        limit: int,
        offset: int,
    ) -> SessionListResponse:
        sessions, total = self.repo.list_by_user(
            user_id=user.id,
            technique=technique,
            interval=interval,
            project=project,
            limit=limit,
            offset=offset,
        )
        return SessionListResponse(
            sessions=[SessionResponse.model_validate(s) for s in sessions],
            total=total,
            limit=limit,
            offset=offset,
        )

    def get_stats(self, user: User, interval: str | None) -> StatsResponse:
        """Estadísticas agregadas por técnica para el usuario."""
        raw = self.repo.get_raw_stats_by_user(user_id=user.id, interval=interval)
        by_technique = {}
        for tech, data in raw["by_technique"].items():
            n = data["total_sessions"]
            total_work = data["total_work_seconds"]
            by_technique[tech] = TechniqueStats(
                total_sessions=n,
                completed_sessions=data["completed_sessions"],
                completion_rate=round(data["completed_sessions"] / n, 2) if n else 0.0,
                total_work_minutes=round(total_work / 60, 1),
                avg_work_minutes=round(total_work / n / 60, 1) if n else 0.0,
            )
        return StatsResponse(
            total_sessions=raw["total_sessions"],
            total_focus_minutes=round(raw["total_work_seconds"] / 60, 1),
            by_technique=by_technique,
            interval=interval or "all",
        )

    def delete_session(self, user: User, session_id: int) -> None:
        session = self.repo.get_by_id(session_id=session_id, user_id=user.id)
        if session is None:
            raise NotFoundError("Sesión no encontrada")
        self.repo.delete(session)
