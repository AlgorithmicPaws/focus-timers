import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings.service';
import type { PresetCreate, UserSettings, UserSettingsUpdate } from '../types/settings.types';

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  const { data: presetsData } = useQuery({
    queryKey: ['presets'],
    queryFn: settingsService.getPresets,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserSettingsUpdate) => settingsService.updateSettings(data),
    // Optimistic update: actualiza el cache inmediatamente, revierte si falla
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['settings'] });
      const previous = queryClient.getQueryData<UserSettings>(['settings']);
      queryClient.setQueryData<UserSettings>(['settings'], (old) =>
        old ? { ...old, ...data } : old,
      );
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['settings'], context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const updateSettings = (
    data: UserSettingsUpdate,
    options?: { onSuccess?: () => void },
  ) => {
    updateMutation.mutate(data, { onSuccess: options?.onSuccess });
  };

  const createPresetMutation = useMutation({
    mutationFn: (data: PresetCreate) => settingsService.createPreset(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets'] }),
  });

  const deletePresetMutation = useMutation({
    mutationFn: (id: number) => settingsService.deletePreset(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets'] }),
  });

  return {
    settings,
    presets: presetsData?.presets ?? [],
    isLoading,
    updateSettings,
    createPreset: createPresetMutation.mutate,
    deletePreset: deletePresetMutation.mutate,
    isCreatingPreset: createPresetMutation.isPending,
  };
}
