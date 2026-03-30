from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session, selectinload

from app.models.focus_session import FocusSession, PomodoroDetails, Technique
from app.models.flowtime_details import FlowtimeDetails
from app.models.bolsa_details import BolsaDetails
from app.schemas.session_schemas import CreateSessionRequest


def _get_interval_start(interval: str) -> Optional[datetime]:
    now = datetime.now(timezone.utc)
    mapping = {"week": 7, "month": 30, "3months": 90, "year": 365}
    days = mapping.get(interval)
    return now - timedelta(days=days) if days else None


class SessionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _base_query(self):
        return (
            self.db.query(FocusSession)
            .options(
                selectinload(FocusSession.pomodoro_details),
                selectinload(FocusSession.flowtime_details),
                selectinload(FocusSession.bolsa_details),
            )
        )

    def create(self, user_id: int, data: CreateSessionRequest) -> FocusSession:
        """Crea una sesión con su detalle de técnica si aplica."""
        session = FocusSession(
            user_id=user_id,
            technique=data.technique,
            task_name=data.task_name,
            task_tags=data.task_tags,
            project=data.project,
            started_at=data.started_at,
            ended_at=data.ended_at,
            total_work_seconds=data.total_work_seconds,
            total_break_seconds=data.total_break_seconds,
            completed=data.completed,
            interruptions=data.interruptions,
            technique_config=data.technique_config,
            day_of_week=data.day_of_week,
            hour_of_day=data.hour_of_day,
            mood_rating=data.mood_rating,
        )
        self.db.add(session)
        self.db.flush()  # para obtener session.id antes del commit

        if data.pomodoro_details:
            self.db.add(PomodoroDetails(session_id=session.id, **data.pomodoro_details.model_dump()))

        if data.flowtime_details:
            self.db.add(FlowtimeDetails(session_id=session.id, **data.flowtime_details.model_dump()))

        if data.bolsa_details:
            self.db.add(BolsaDetails(session_id=session.id, **data.bolsa_details.model_dump()))

        self.db.commit()
        self.db.refresh(session)
        return session

    def get_by_id(self, session_id: int, user_id: int) -> FocusSession | None:
        """Solo retorna la sesión si pertenece al usuario (seguridad por defecto)."""
        return (
            self._base_query()
            .filter(FocusSession.id == session_id, FocusSession.user_id == user_id)
            .first()
        )

    def list_by_user(
        self,
        user_id: int,
        technique: Technique | None = None,
        interval: str | None = None,
        project: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[FocusSession], int]:
        query = self._base_query().filter(FocusSession.user_id == user_id)

        if technique:
            query = query.filter(FocusSession.technique == technique)
        if interval:
            start = _get_interval_start(interval)
            if start:
                query = query.filter(FocusSession.started_at >= start)
        if project:
            query = query.filter(FocusSession.project == project)

        total = query.count()
        sessions = query.order_by(FocusSession.started_at.desc()).limit(limit).offset(offset).all()
        return sessions, total

    def get_raw_stats_by_user(self, user_id: int, interval: str | None = None) -> dict:
        """Retorna datos crudos de sesiones agrupados por técnica. El cálculo de métricas se hace en el service."""
        query = self.db.query(FocusSession).filter(FocusSession.user_id == user_id)
        if interval:
            start = _get_interval_start(interval)
            if start:
                query = query.filter(FocusSession.started_at >= start)

        sessions = query.all()
        by_technique: dict[str, dict] = {}

        for technique in Technique:
            tech_sessions = [s for s in sessions if s.technique == technique]
            if not tech_sessions:
                continue
            by_technique[technique.value] = {
                "total_sessions": len(tech_sessions),
                "completed_sessions": sum(1 for s in tech_sessions if s.completed),
                "total_work_seconds": sum(s.total_work_seconds for s in tech_sessions),
            }

        return {
            "total_sessions": len(sessions),
            "total_work_seconds": sum(s.total_work_seconds for s in sessions),
            "by_technique": by_technique,
        }

    def delete(self, session: FocusSession) -> None:
        self.db.delete(session)
        self.db.commit()
