import { apiClient } from '@/shared/lib/api-client';
import { ENDPOINTS } from '@/shared/constants/api';
import type { UserSettings, UserSettingsUpdate, Preset, PresetCreate } from '../types/settings.types';

export const settingsService = {
  getSettings: () =>
    apiClient.get<UserSettings>(ENDPOINTS.SETTINGS.BASE).then((r) => r.data),

  updateSettings: (data: UserSettingsUpdate) =>
    apiClient.put<UserSettings>(ENDPOINTS.SETTINGS.BASE, data).then((r) => r.data),

  getPresets: () =>
    apiClient.get<{ presets: Preset[] }>(ENDPOINTS.SETTINGS.PRESETS).then((r) => r.data),

  createPreset: (data: PresetCreate) =>
    apiClient.post<Preset>(ENDPOINTS.SETTINGS.PRESETS, data).then((r) => r.data),

  updatePreset: (id: number, data: Partial<PresetCreate>) =>
    apiClient.put<Preset>(`${ENDPOINTS.SETTINGS.PRESETS}/${id}`, data).then((r) => r.data),

  deletePreset: (id: number) =>
    apiClient.delete<void>(`${ENDPOINTS.SETTINGS.PRESETS}/${id}`).then((r) => r.data),
};
