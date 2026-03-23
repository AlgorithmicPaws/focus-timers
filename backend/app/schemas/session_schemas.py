from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.focus_session import Technique


class PomodoroDetailsRequest(BaseModel):
    focus_interval_sec: int = Field(default=1500, ge=60)
    short_break_sec: int = Field(default=300, ge=30)
    long_break_sec: int = Field(default=900, ge=60)
    pomodoros_target: int = Field(default=4, ge=1, le=12)
    pomodoros_completed: int = Field(default=0, ge=0)
    pomodoro_number: int = Field(default=1, ge=1)
    was_voided: bool = False
    strict_mode: bool = False


class PomodoroDetailsResponse(PomodoroDetailsRequest):
    id: int
    session_id: int

    model_config = {"from_attributes": True}


class CreateSessionRequest(BaseModel):
    technique: Technique
    task_name: str | None = Field(None, max_length=255)
    task_tags: list[str] | None = None
    project: str | None = Field(None, max_length=100)
    started_at: datetime
    ended_at: datetime | None = None
    total_work_seconds: int = Field(ge=0)
    total_break_seconds: int = Field(default=0, ge=0)
    completed: bool = False
    interruptions: list[Any] | None = None
    technique_config: dict[str, Any] | None = None
    day_of_week: int | None = Field(None, ge=0, le=6)
    hour_of_day: int | None = Field(None, ge=0, le=23)
    mood_rating: int | None = Field(None, ge=1, le=5)
    pomodoro_details: PomodoroDetailsRequest | None = None


class SessionResponse(BaseModel):
    id: int
    user_id: int
    technique: Technique
    task_name: str | None
    task_tags: list[str] | None
    project: str | None
    started_at: datetime
    ended_at: datetime | None
    total_work_seconds: int
    total_break_seconds: int
    completed: bool
    interruptions: list[Any] | None
    technique_config: dict[str, Any] | None
    day_of_week: int | None
    hour_of_day: int | None
    mood_rating: int | None
    created_at: datetime
    pomodoro_details: PomodoroDetailsResponse | None = None

    model_config = {"from_attributes": True}


class SessionListResponse(BaseModel):
    sessions: list[SessionResponse]
    total: int
    limit: int
    offset: int
