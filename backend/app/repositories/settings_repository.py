from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.preset import Preset
from app.models.user_settings import UserSettings


class SettingsRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_user(self, user_id: int) -> Optional[UserSettings]:
        return self.db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

    def get_or_create(self, user_id: int) -> UserSettings:
        settings = self.get_by_user(user_id)
        if not settings:
            settings = UserSettings(user_id=user_id)
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
        return settings

    def update(self, settings: UserSettings, **kwargs) -> UserSettings:
        for key, value in kwargs.items():
            setattr(settings, key, value)
        self.db.commit()
        self.db.refresh(settings)
        return settings


class PresetRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_user(self, user_id: int) -> List[Preset]:
        return self.db.query(Preset).filter(Preset.user_id == user_id).all()

    def get_by_id_and_user(self, preset_id: int, user_id: int) -> Optional[Preset]:
        return (
            self.db.query(Preset)
            .filter(Preset.id == preset_id, Preset.user_id == user_id)
            .first()
        )

    def create(self, preset: Preset) -> Preset:
        self.db.add(preset)
        self.db.commit()
        self.db.refresh(preset)
        return preset

    def update(self, preset: Preset, **kwargs) -> Preset:
        for key, value in kwargs.items():
            setattr(preset, key, value)
        self.db.commit()
        self.db.refresh(preset)
        return preset

    def delete(self, preset: Preset) -> None:
        self.db.delete(preset)
        self.db.commit()
