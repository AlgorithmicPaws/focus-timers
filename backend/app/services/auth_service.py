from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth_schemas import LoginRequest, RegisterRequest, TokenResponse


class AuthService:
    def __init__(self, db: Session) -> None:
        self.repo = UserRepository(db)

    def register(self, data: RegisterRequest) -> TokenResponse:
        """Registra un nuevo usuario. Lanza 409 si el email ya existe."""
        if self.repo.get_by_email(data.email):
            raise ConflictError("El correo electrónico ya está registrado")

        user = self.repo.create(
            name=data.name,
            email=data.email,
            hashed_password=hash_password(data.password),
        )
        token = create_access_token(str(user.id))
        return TokenResponse(access_token=token)

    def login(self, data: LoginRequest) -> TokenResponse:
        """Autentica un usuario. Lanza 401 si las credenciales son incorrectas."""
        user = self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise UnauthorizedError("Correo o contraseña incorrectos")
        if not user.is_active:
            raise UnauthorizedError("Cuenta desactivada")

        token = create_access_token(str(user.id))
        return TokenResponse(access_token=token)

    def refresh(self, current_user: User) -> TokenResponse:
        """Genera un nuevo token para el usuario autenticado."""
        token = create_access_token(str(current_user.id))
        return TokenResponse(access_token=token)
