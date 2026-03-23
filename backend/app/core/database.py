from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


def _build_engine():
    """Crea el engine con SSL condicional según entorno."""
    settings = get_settings()
    connect_args = {}
    if settings.is_production:
        connect_args["sslmode"] = "require"
    return create_engine(settings.DATABASE_URL, connect_args=connect_args)


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Session:
    """Dependency para inyectar sesión de BD en los routers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
