from typing import Any, List, Optional

from pydantic import BaseModel

from app.models.focus_session import Technique


class UserSettingsResponse(BaseModel):
    id: int
    user_id: int
    theme: str
    sound_enabled: bool
    ambient_sound: Optional[str]
    tick_enabled: bool
    daily_goal_min: int

    model_config = {"from_attributes": True}


class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    sound_enabled: Optional[bool] = None
    ambient_sound: Optional[str] = None
    tick_enabled: Optional[bool] = None
    daily_goal_min: Optional[int] = None


class PresetCreate(BaseModel):
    name: str
    technique: Technique
    config: dict[str, Any]


class PresetUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[dict[str, Any]] = None


class PresetResponse(BaseModel):
    id: int
    user_id: int
    name: str
    technique: Technique
    config: dict[str, Any]

    model_config = {"from_attributes": True}


class PresetListResponse(BaseModel):
    presets: List[PresetResponse]
