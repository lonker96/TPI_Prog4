import { useAuthStore } from '@/features/auth';
import { useNotificationStore } from '@/store/notificationStore';
import { api } from './api';

let isInitialized = false;

export function setupInterceptors() {
  if (isInitialized) return;
  isInitialized = true;

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const url: string = error.config?.url ?? '';

      const isAuthEndpoint =
        url.includes('/auth/token') ||
        url.includes('/auth/me') ||
        url.includes('/auth/login') ||
        url.includes('/auth/register');

      const isOnAuthPage =
        window.location.pathname === '/login' ||
        window.location.pathname === '/register';

      if (status === 401 && !isAuthEndpoint) {
        useAuthStore.getState().clearSession();

        if (!isOnAuthPage) {
          window.location.href = '/login';
        }
      }

      if (status === 403) {
        useNotificationStore
          .getState()
          .showNotification('Acceso denegado: no tenés permisos para realizar esta acción.');
      }

      return Promise.reject(error);
    }
  );
}