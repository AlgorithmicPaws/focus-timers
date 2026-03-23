import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Asegurar que el path del proyecto esté disponible
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.config import get_settings
from app.core.database import Base  # noqa: F401

# Importar todos los modelos para que Alembic los detecte
import app.models.user  # noqa: F401
import app.models.focus_session  # noqa: F401

config = context.config
fileConfig(config.config_file_name)  # type: ignore

# Inyectar DATABASE_URL desde la configuración (evita hardcodear en alembic.ini)
config.set_main_option("sqlalchemy.url", get_settings().DATABASE_URL)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()