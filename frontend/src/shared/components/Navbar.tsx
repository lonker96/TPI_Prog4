import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth";
import { useThemeStore } from '@/store/themeStore';

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  if (!user) return null;

  const isAdmin = user.roles.includes("admin");

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button
              type="button"
              onClick={toggleTheme}
              className="rounded px-3 py-1.5 text-sm font-medium border border-slate-300 dark:border-slate-600"
            >
              {darkMode ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <Link to="/categories" className="text-xl font-bold tracking-tight">
            FoodStore
          </Link>

          <Link
            to="/categories"
            className={`text-sm font-medium transition-colors ${
              pathname === "/categories" ? "text-blue-400" : "text-slate-300 hover:text-white"
            }`}
          >
            Categorías
          </Link>

          <Link
            to="/products"
            className={`text-sm font-medium transition-colors ${
              pathname === "/products" ? "text-blue-400" : "text-slate-300 hover:text-white"
            }`}
          >
            Productos
          </Link>

          <Link
            to="/ingredients"
            className={`text-sm font-medium transition-colors ${
              pathname === "/ingredients" ? "text-blue-400" : "text-slate-300 hover:text-white"
            }`}
          >
            Ingredientes
          </Link>

          {isAdmin && (
            <Link
              to="/admin/users"
              className={`text-sm font-semibold transition-colors ${
                pathname === "/admin/users"
                  ? "text-yellow-300"
                  : "text-yellow-400/90 hover:text-yellow-300"
              }`}
            >
              Admin Usuarios
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">
            {user.nombre} {user.apellido} ({user.roles.join(", ")})
          </span>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}