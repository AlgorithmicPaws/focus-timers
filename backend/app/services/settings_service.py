from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError
from app.models.preset import Preset
from app.repositories.settings_repository import PresetRepository, SettingsRepository
from app.schemas.settings import PresetCreate, PresetUpdate, UserSettingsUpdate


class SettingsService:
    def get_settings(self, user_id: int, db: Session):
        """Retorna la configuración del usuario, creándola si no existe."""
        repo = SettingsRepository(db)
        return repo.get_or_create(user_id)

    def update_settings(self, user_id: int, data: UserSettingsUpdate, db: Session):
        """Actualiza solo los campos enviados (PATCH semántico)."""
        repo = SettingsRepository(db)
        settings = repo.get_or_create(user_id)
        return repo.update(settings, **data.model_dump(exclude_none=True))

    def get_presets(self, user_id: int, db: Session):
        repo = PresetRepository(db)
        return {"presets": repo.get_by_user(user_id)}

    def create_preset(self, user_id: int, data: PresetCreate, db: Session):
        repo = PresetRepository(db)
        preset = Preset(user_id=user_id, **data.model_dump())
        return repo.create(preset)

    def update_preset(self, preset_id: int, user_id: int, data: PresetUpdate, db: Session):
        repo = PresetRepository(db)
        preset = repo.get_by_id_and_user(preset_id, user_id)
        if not preset:
            raise ForbiddenError()
        return repo.update(preset, **data.model_dump(exclude_none=True))

    def delete_preset(self, preset_id: int, user_id: int, db: Session):
        repo = PresetRepository(db)
        preset = repo.get_by_id_and_user(preset_id, user_id)
        if not preset:
            raise ForbiddenError()
        repo.delete(preset)


settings_service = SettingsService()
