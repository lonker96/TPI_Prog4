import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loginAction = useAuthStore((state) => state.login);
  const logoutAction = useAuthStore((state) => state.logout);
  const checkSession = useAuthStore((state) => state.checkSession);
  const showNotification = useNotificationStore((state) => state.showNotification);

  const login = async (email: string, password: string) => {
    try {
      await loginAction(email, password);
      showNotification('Sesión iniciada correctamente.');
    } catch {
      showNotification('Credenciales inválidas o error al iniciar sesión.');
      throw new Error('Error al iniciar sesión');
    }
  };

  const logout = async () => {
    await logoutAction();
    showNotification('Sesión cerrada.');
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user?.roles?.includes('admin'));

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    checkSession,
  };
}