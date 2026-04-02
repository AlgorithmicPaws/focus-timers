import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';

export function PresetManager() {
  const { presets, deletePreset } = useSettings();
  const [confirmId, setConfirmId] = useState<number | null>(null);

  if (presets.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        No saved presets. Save a configuration from any timer.
      </p>
    );
  }

  const TECHNIQUE_LABELS: Record<string, string> = {
    pomodoro: 'Pomodoro',
    flowtime: 'Flowtime',
    bolsa: 'Time Budget',
  };

  return (
    <div className="flex flex-col gap-2">
      {presets.map((preset) => (
        <div
          key={preset.id}
          className="flex items-center justify-between rounded-lg px-4 py-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {preset.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {TECHNIQUE_LABELS[preset.technique] ?? preset.technique}
            </p>
          </div>

          {confirmId === preset.id ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  deletePreset(preset.id);
                  setConfirmId(null);
                }}
                className="text-xs px-2 py-1 rounded"
                style={{ background: 'var(--text-error)', color: 'white' }}
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="text-xs px-2 py-1 rounded"
                style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmId(preset.id)}
              className="text-xs px-2 py-1 rounded"
              style={{ border: '1px solid var(--text-error)', color: 'var(--text-error)' }}
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
