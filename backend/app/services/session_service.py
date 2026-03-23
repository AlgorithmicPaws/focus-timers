from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.focus_session import Technique
from app.models.user import User
from app.repositories.session_repository import SessionRepository
from app.schemas.session_schemas import CreateSessionRequest, SessionListResponse, SessionResponse


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
        limit: int,
        offset: int,
    ) -> SessionListResponse:
        sessions, total = self.repo.list_by_user(
            user_id=user.id,
            technique=technique,
            limit=limit,
            offset=offset,
        )
        return SessionListResponse(
            sessions=[SessionResponse.model_validate(s) for s in sessions],
            total=total,
            limit=limit,
            offset=offset,
        )

    def delete_session(self, user: User, session_id: int) -> None:
        session = self.repo.get_by_id(session_id=session_id, user_id=user.id)
        if session is None:
            raise NotFoundError("Sesión no encontrada")
        # user_id ya fue verificado en el repo, pero por claridad:
        if session.user_id != user.id:
            raise ForbiddenError()
        self.repo.delete(session)
