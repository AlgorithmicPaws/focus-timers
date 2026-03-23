from sqlalchemy.orm import Session, selectinload

from app.models.focus_session import FocusSession, PomodoroDetails, Technique
from app.schemas.session_schemas import CreateSessionRequest


class SessionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

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

        if data.technique == Technique.pomodoro and data.pomodoro_details:
            details = PomodoroDetails(
                session_id=session.id,
                **data.pomodoro_details.model_dump(),
            )
            self.db.add(details)

        self.db.commit()
        self.db.refresh(session)
        return session

    def get_by_id(self, session_id: int, user_id: int) -> FocusSession | None:
        """Solo retorna la sesión si pertenece al usuario (seguridad por defecto)."""
        return (
            self.db.query(FocusSession)
            .options(selectinload(FocusSession.pomodoro_details))
            .filter(FocusSession.id == session_id, FocusSession.user_id == user_id)
            .first()
        )

    def list_by_user(
        self,
        user_id: int,
        technique: Technique | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[FocusSession], int]:
        query = (
            self.db.query(FocusSession)
            .options(selectinload(FocusSession.pomodoro_details))
            .filter(FocusSession.user_id == user_id)
        )
        if technique:
            query = query.filter(FocusSession.technique == technique)

        total = query.count()
        sessions = query.order_by(FocusSession.started_at.desc()).limit(limit).offset(offset).all()
        return sessions, total

    def delete(self, session: FocusSession) -> None:
        self.db.delete(session)
        self.db.commit()
