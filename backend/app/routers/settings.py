from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.settings import (
    PresetCreate,
    PresetListResponse,
    PresetResponse,
    PresetUpdate,
    UserSettingsResponse,
    UserSettingsUpdate,
)
from app.services.settings_service import settings_service

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/", response_model=UserSettingsResponse)
async def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return settings_service.get_settings(current_user.id, db)


@router.put("/", response_model=UserSettingsResponse)
async def update_settings(
    data: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return settings_service.update_settings(current_user.id, data, db)


@router.get("/presets", response_model=PresetListResponse)
async def get_presets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return settings_service.get_presets(current_user.id, db)


@router.post("/presets", response_model=PresetResponse, status_code=201)
async def create_preset(
    data: PresetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return settings_service.create_preset(current_user.id, data, db)


@router.put("/presets/{preset_id}", response_model=PresetResponse)
async def update_preset(
    preset_id: int,
    data: PresetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return settings_service.update_preset(preset_id, current_user.id, data, db)


@router.delete("/presets/{preset_id}", status_code=204)
async def delete_preset(
    preset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings_service.delete_preset(preset_id, current_user.id, db)
