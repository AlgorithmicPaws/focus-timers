from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.focus_session import Technique


class Preset(Base):
    __tablename__ = "presets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(100))
    technique: Mapped[Technique] = mapped_column(SAEnum(Technique))
    config: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())