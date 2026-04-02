export interface UserSettings {
  id: number;
  user_id: number;
  theme: 'dark' | 'light';
  sound_enabled: boolean;
  ambient_sound: string | null;
  tick_enabled: boolean;
  daily_goal_min: number;
}

export interface UserSettingsUpdate {
  theme?: 'dark' | 'light';
  sound_enabled?: boolean;
  tick_enabled?: boolean;
  daily_goal_min?: number;
}

export interface Preset {
  id: number;
  user_id: number;
  name: string;
  technique: string;
  config: Record<string, unknown>;
}

export interface PresetCreate {
  name: string;
  technique: string;
  config: Record<string, unknown>;
}
