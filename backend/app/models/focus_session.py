import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Technique(str, enum.Enum):
    pomodoro = "pomodoro"
    flowtime = "flowtime"
    bolsa = "bolsa"


class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    # Técnica usada
    technique: Mapped[Technique] = mapped_column(Enum(Technique))

    # Descripción de la tarea
    task_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    task_tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    project: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Tiempos
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    total_work_seconds: Mapped[int] = mapped_column(Integer, default=0)
    total_break_seconds: Mapped[int] = mapped_column(Integer, default=0)

    # Estado
    completed: Mapped[bool] = mapped_column(default=False)

    # Datos de analítica — capturados desde Fase 1 aunque no se muestren en UI aún
    interruptions: Mapped[list[Any] | None] = mapped_column(JSON, nullable=True)
    technique_config: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    day_of_week: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 0=Lunes
    hour_of_day: Mapped[int | None] = mapped_column(Integer, nullable=True)
    mood_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship("User", back_populates="sessions")
    pomodoro_details: Mapped["PomodoroDetails | None"] = relationship(
        "PomodoroDetails", back_populates="session", cascade="all, delete-orphan", uselist=False
    )


class PomodoroDetails(Base):
    __tablename__ = "pomodoro_details"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("focus_sessions.id"), unique=True, index=True)

    focus_interval_sec: Mapped[int] = mapped_column(Integer, default=1500)   # 25 min
    short_break_sec: Mapped[int] = mapped_column(Integer, default=300)        # 5 min
    long_break_sec: Mapped[int] = mapped_column(Integer, default=900)         # 15 min
    pomodoros_target: Mapped[int] = mapped_column(Integer, default=4)
    pomodoros_completed: Mapped[int] = mapped_column(Integer, default=0)
    pomodoro_number: Mapped[int] = mapped_column(Integer, default=1)
    was_voided: Mapped[bool] = mapped_column(default=False)
    strict_mode: Mapped[bool] = mapped_column(default=False)

    session: Mapped["FocusSession"] = relationship("FocusSession", back_populates="pomodoro_details")
