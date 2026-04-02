import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useNavigationGuard } from '@/shared/hooks/useNavigationGuard';
import { ThemeToggle } from '@/features/settings/components/ThemeToggle';
import { SoundSettings } from '@/features/settings/components/SoundSettings';
import { DailyGoalSetter } from '@/features/settings/components/DailyGoalSetter';
import { PresetManager } from '@/features/settings/components/PresetManager';
import { Header } from '@/shared/components/layout/Header';
import { NavigationBlockerModal } from '@/shared/components/NavigationBlockerModal';
import { toast } from '@/shared/components/Toast';
import type { UserSettings } from '@/features/settings/types/settings.types';

type LocalSettings = Pick<UserSettings, 'theme' | 'sound_enabled' | 'tick_enabled' | 'daily_goal_min'>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
    >
      <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

const DEFAULTS: LocalSettings = {
  theme: 'dark',
  sound_enabled: true,
  tick_enabled: false,
  daily_goal_min: 120,
};

export default function SettingsPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { settings, updateSettings } = useSettings();

  const [local, setLocal] = useState<LocalSettings>(DEFAULTS);
  const [dirty, setDirty] = useState(false);

  const { blocker } = useNavigationGuard(dirty);

  useEffect(() => {
    if (settings) {
      setLocal({
        theme: settings.theme,
        sound_enabled: settings.sound_enabled,
        tick_enabled: settings.tick_enabled,
        daily_goal_min: settings.daily_goal_min,
      });
    }
  }, [settings]);

  const patch = (changes: Partial<LocalSettings>) => {
    setLocal((prev) => ({ ...prev, ...changes }));
    setDirty(true);
  };

  const handleSave = () => {
    localStorage.setItem('theme', local.theme);
    localStorage.setItem('tick_enabled', String(local.tick_enabled));
    localStorage.setItem('sound_enabled', String(local.sound_enabled));
    setDirty(false);
    toast('Settings saved');
    updateSettings(local);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Header />
      <NavigationBlockerModal
        blocker={blocker}
        title="Leave without saving?"
        description="You have unsaved changes. If you leave now they will be lost."
        cancelLabel="Stay"
        confirmLabel="Leave anyway"
      />

      <div className="max-w-xl mx-auto px-4 pt-28 pb-16 flex flex-col gap-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>

        <Section title="Appearance">
          <ThemeToggle value={local.theme} onChange={(t) => patch({ theme: t })} />
        </Section>

        <Section title="Sounds">
          <SoundSettings
            soundEnabled={local.sound_enabled}
            tickEnabled={local.tick_enabled}
            onChange={patch}
          />
        </Section>

        {isAuthenticated && (
          <>
            <Section title="Daily goal">
              <DailyGoalSetter value={local.daily_goal_min} onChange={(v) => patch({ daily_goal_min: v })} />
            </Section>

            <Section title="My presets">
              <PresetManager />
            </Section>
          </>
        )}

        {!isAuthenticated && (
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            Sign in to manage presets and daily goal.
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: dirty ? 'var(--color-brand-tomato)' : 'var(--border-default)',
              color: dirty ? 'white' : 'var(--text-muted)',
              cursor: dirty ? 'pointer' : 'default',
            }}
          >
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}
