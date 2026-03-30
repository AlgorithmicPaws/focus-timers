from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class FlowtimeDetails(Base):
    __tablename__ = "flowtime_details"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("focus_sessions.id", ondelete="CASCADE"),
        unique=True, index=True
    )
    break_model: Mapped[str] = mapped_column(String(20))  # "proportional" | "stepped"
    break_ratio: Mapped[int] = mapped_column(Integer)     # divisor, ej. 5 para ÷5
    break_recommended_sec: Mapped[int] = mapped_column(Integer)
    break_actual_sec: Mapped[int | None] = mapped_column(Integer, nullable=True)

    session: Mapped["FocusSession"] = relationship(back_populates="flowtime_details")  # noqa: F821