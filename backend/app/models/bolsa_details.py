from sqlalchemy import Integer, Boolean, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class BolsaDetails(Base):
    __tablename__ = "bolsa_details"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("focus_sessions.id", ondelete="CASCADE"),
        unique=True, index=True
    )
    budget_total_sec: Mapped[int] = mapped_column(Integer)
    budget_work_sec: Mapped[int] = mapped_column(Integer)
    budget_break_sec: Mapped[int] = mapped_column(Integer)
    budget_used_sec: Mapped[int] = mapped_column(Integer, default=0)
    breaks_taken: Mapped[list | None] = mapped_column(JSON, nullable=True)  # [{start, end, duration_sec}]
    budget_exhausted: Mapped[bool] = mapped_column(Boolean, default=False)

    session: Mapped["FocusSession"] = relationship(back_populates="bolsa_details")  # noqa: F821