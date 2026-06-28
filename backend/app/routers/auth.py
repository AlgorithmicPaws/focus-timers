from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import get_settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth_schemas import LoginRequest, RegisterRequest, TokenResponse
from app.services.auth_service import AuthService

# El rate limit se desactiva en el entorno de test (E2E): la suite registra varios
# usuarios por minuto en chromium + webkit y el límite de 5/min la volvería inestable.
# En development y production sigue activo.
limiter = Limiter(
    key_func=get_remote_address,
    enabled=get_settings().ENVIRONMENT != "test",
)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, data: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return AuthService(db).register(data)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return AuthService(db).login(data)


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TokenResponse:
    return AuthService(db).refresh(current_user)
