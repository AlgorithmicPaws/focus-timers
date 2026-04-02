import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let _setToasts: React.Dispatch<React.SetStateAction<ToastItem[]>> | null = null;
let _counter = 0;

export function toast(message: string, type: ToastType = 'success') {
  if (!_setToasts) return;
  const id = ++_counter;
  _setToasts((prev) => [...prev, { id, message, type }]);
  setTimeout(() => {
    _setToasts?.((prev) => prev.filter((t) => t.id !== id));
  }, 3000);
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    _setToasts = setToasts;
    return () => { _setToasts = null; };
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in-up"
          style={{
            background: t.type === 'success' ? 'var(--color-brand-bl-work)' : '#ef4444',
            color: 'white',
          }}
        >
          {t.message}
        </div>
      ))}
    </div>,
    document.body,
  );
}
