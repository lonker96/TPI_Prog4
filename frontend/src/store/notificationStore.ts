import { create } from 'zustand';

interface NotificationState {
  message: string | null;
  isVisible: boolean;
  showNotification: (message: string) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: null,
  isVisible: false,
  showNotification: (message: string) => {
    set({ message, isVisible: true });
  },
  hideNotification: () => {
    set({ isVisible: false });
  },
}));