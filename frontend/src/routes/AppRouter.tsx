import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LoginPage,
  RegisterPage,
  AdminUsersPage,
} from '@/features/auth';
import {CategoriasPage} from '@/features/categories';
import {ProductsPage} from '@/features/products';
import {IngredientesPage} from '@/features/ingredients';
import Navbar from '@/shared/components/Navbar';
import {UnauthorizedPage} from '@/shared/components/UnauthorizedPage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas protegidas para usuarios autenticados */}
        <Route element={<ProtectedRoute />}>
          <Route path="/categories" element={<CategoriasPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/ingredients" element={<IngredientesPage />} />
        </Route>

        {/* Ruta exclusiva para administradores */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default AppRouter;