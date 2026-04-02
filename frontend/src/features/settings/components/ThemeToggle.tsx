interface Props {
  value: 'dark' | 'light';
  onChange: (theme: 'dark' | 'light') => void;
}

export function ThemeToggle({ value, onChange }: Props) {
  const isDark = value === 'dark';

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    onChange(next);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {isDark ? 'Dark mode' : 'Light mode'}
      </span>
      <button
        onClick={toggle}
        role="switch"
        aria-checked={isDark}
        className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
        style={{ background: isDark ? 'var(--color-brand-tomato)' : 'var(--border-default)' }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            isDark ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
