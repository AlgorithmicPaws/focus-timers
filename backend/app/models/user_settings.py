from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )
    theme: Mapped[str] = mapped_column(String(10), default="dark")  # "dark" | "light"
    sound_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    ambient_sound: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    tick_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    daily_goal_min: Mapped[int] = mapped_column(Integer, default=120)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )