import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuthStore();

  // Mientras valida la sesión (por ejemplo, al recargar la página), muestra un indicador
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg font-medium text-gray-600">Cargando sesión...</span>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requieren roles específicos y el usuario no los tiene, redirige a /unauthorized
  if (allowedRoles && !allowedRoles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si pasa todas las validaciones, renderiza la ruta hija
  return <Outlet />;
};