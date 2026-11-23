import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';

export function Toast() {
  const message = useNotificationStore((state) => state.message);
  const isVisible = useNotificationStore((state) => state.isVisible);
  const hideNotification = useNotificationStore((state) => state.hideNotification);

  useEffect(() => {
    if (!isVisible) return;

    const timer = window.setTimeout(() => {
      hideNotification();
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [isVisible, message, hideNotification]);

  if (!isVisible || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
    >
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        <button
          type="button"
          onClick={hideNotification}
          aria-label="Cerrar notificación"
          className="text-xs opacity-75 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default Toast;