# Frontend — Unidad 10: Arquitectura por Features y Rutas Protegidas

Refactorización del frontend (React + TypeScript + Vite + Tailwind CSS + TanStack Query + Zustand) hacia una arquitectura modular por dominio (*features*), con rutas protegidas por sesión y rol, manejo centralizado de errores HTTP y estado global de interfaz.

## Estructura del proyecto (`src/`)

- **`features/`**: Módulos independientes por dominio, cada uno con `components/`, `hooks/`, `types/`, `pages/` y su barrel export `index.ts`:
  - `auth/`: Autenticación, sesión con cookie `HttpOnly` (`/auth/me`, login, logout), `authStore`, `useAuth` y vistas (`LoginPage`, `RegisterPage`, `AdminUserPage`).
  - `categories/`: CRUD de categorías (`useCategories`, listas, modales y `CategoriasPage`).
  - `products/`: CRUD de productos (`useProducts`, listas, modales y `ProductsPage`).
  - `ingredients/`: CRUD de ingredientes (`useIngredients`, listas, modales y `IngredientesPage`).
- **`shared/`**: Elementos transversales reutilizados por más de una feature (`api.ts` con `withCredentials: true`, `setupInterceptors.ts` para 401/403, `Navbar.tsx`, `UnauthorizedPage.tsx` y `Toast.tsx`).
- **`store/`**: Estado global de interfaz con Zustand (`themeStore.ts` con `persist` en `theme-storage` y `notificationStore.ts`).
- **`routes/`**: Configuración de rutas en `AppRouter.tsx` y control de acceso en `ProtectedRoute.tsx` mediante `<Outlet />`.

## Reglas de arquitectura aplicadas

- Importaciones entre carpetas mediante el alias `@/` configurado en `vite.config.ts` y `tsconfig.app.json`.
- Comunicación entre features únicamente a través de sus respectivos `index.ts`.
- `authStore` sin `persist` (sesión verificada mediante `/auth/me`); `themeStore` persistido en `localStorage`.
- Interceptor de `401` (limpia sesión y redirige a `/login`, salvo en endpoints de auth) y `403` (muestra notificación de acceso denegado sin cerrar sesión).

## Ejecución

1. Instalar dependencias:
   ```bash
   pnpm install
2. Iniciar el servidor de desarrollo:
   ```bash
   pnpm dev

  