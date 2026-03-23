from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user_schemas import UpdateUserRequest, UserResponse


class UserService:
    def __init__(self, db: Session) -> None:
        self.repo = UserRepository(db)

    def get_profile(self, user: User) -> UserResponse:
        return UserResponse.model_validate(user)

    def update_profile(self, user: User, data: UpdateUserRequest) -> UserResponse:
        updates: dict = {}
        if data.name is not None:
            updates["name"] = data.name
        if data.password is not None:
            updates["hashed_password"] = hash_password(data.password)

        updated = self.repo.update(user, **updates)
        return UserResponse.model_validate(updated)

    def delete_account(self, user: User) -> None:
        self.repo.delete(user)
