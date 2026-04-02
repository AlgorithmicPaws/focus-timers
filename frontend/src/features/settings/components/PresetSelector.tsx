import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import type { PresetCreate } from '../types/settings.types';

interface Props {
  technique: string;
  currentConfig: Record<string, unknown>;
  onApplyPreset: (config: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function PresetSelector({ technique, currentConfig, onApplyPreset, disabled }: Props) {
  const { presets, createPreset, isCreatingPreset } = useSettings();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');

  const techniquePresets = presets.filter((p) => p.technique === technique);

  const handleSave = () => {
    if (!presetName.trim()) return;
    const data: PresetCreate = {
      name: presetName.trim(),
      technique,
      config: currentConfig,
    };
    createPreset(data);
    setPresetName('');
    setShowSaveModal(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {techniquePresets.length > 0 && (
        <select
          disabled={disabled}
          onChange={(e) => {
            const preset = techniquePresets.find((p) => String(p.id) === e.target.value);
            if (preset) onApplyPreset(preset.config);
            e.target.value = '';
          }}
          defaultValue=""
          className="text-xs rounded-lg px-3 py-1.5"
          style={{
            background: 'var(--glass-panel-bg, var(--bg-card))',
            border: '1px solid var(--glass-panel-border, var(--border-soft))',
            color: 'var(--text-secondary)',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <option value="" disabled>
            Load preset...
          </option>
          {techniquePresets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      <button
        disabled={disabled}
        onClick={() => setShowSaveModal(true)}
        className="text-xs px-3 py-1.5 rounded-lg transition-opacity"
        style={{
          border: '1px solid var(--glass-panel-border, var(--border-soft))',
          color: 'var(--text-muted)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        + Save preset
      </button>

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div
            className="w-[min(94vw,360px)] rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
          >
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Save as preset
            </h3>
            <input
              type="text"
              placeholder="Preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              className="w-full text-sm rounded-lg px-3 py-2 outline-none"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-sm px-3 py-1.5 rounded-lg"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!presetName.trim() || isCreatingPreset}
                className="text-sm px-4 py-1.5 rounded-lg font-medium"
                style={{
                  background: 'var(--color-brand-tomato)',
                  color: 'white',
                  opacity: !presetName.trim() ? 0.5 : 1,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
