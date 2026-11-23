# Food Store — Trabajo Práctico Integrador (Programación IV - UTN)

Aplicación web full-stack para gestión de pedidos de alimentos construida con **FastAPI + SQLModel + PostgreSQL** en el backend y **React + TypeScript + Vite + Tailwind CSS + TanStack Query/Form/Table + Zustand** en el frontend.

## Enlaces de entrega
- **Repositorio de GitHub:** `https://github.com/USUARIO/REPOSITORIO`
- **Video de demostración (10–15 min):** `https://...`

## Arquitectura y funcionalidades
- **Backend modular:** `app/core/`, `app/modules/usuarios`, `app/modules/categoria`, `app/modules/producto` y `app/modules/pedidos`, aplicando `BaseRepository` y `UnitOfWork` (sin commits directos en servicios ni routers).
- **Seguridad y roles:** JWT en cookie `HttpOnly` (`access_token`), hash con `passlib[bcrypt]`, control de usuario activo y autorización por rol (`user` / `admin`).
- **Reglas de negocio de pedidos (RN-01 a RN-06):** validación de stock y disponibilidad, cálculo de totales/subtotales, descuento y restitución de stock en transacciones atómicas, máquina de estados y resumen administrativo (`/pedidos/resumen`).
- **Frontend por features:** `auth`, `categories`, `pedidos`, `products` y `usuarios`, con Zustand (`authStore` con `partialize`, `cartStore`, `notificationStore`), `axiosInstance` (`withCredentials: true`), TanStack Query, TanStack Form y TanStack Table.

## Requisitos previos
- Python 3.11–3.13 y PostgreSQL 15+ en ejecución.
- Node.js 20.19+ y `pnpm` 9+.

## Variables de entorno

### Backend (`backend/.env` a partir de `backend/.env.example`)
```env
    DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/foodstore_db
    SECRET_KEY=cambiar-esta-clave-de-al-menos-32-caracteres-seguros
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    FRONTEND_ORIGIN=http://localhost:5173
```

---

### Instalacion y ejecucion
    cd backend
    python -m venv .venv
    # Windows:
    .venv\Scripts\activate
    # Linux / macOS:
    source .venv/bin/activate

    pip install -r requirements.txt
    copy .env.example .env   # o cp .env.example .env en Linux/macOS
    python -m app.db.seed
    uvicorn app.main:app --reload

Documentación interactiva disponible en http://localhost:8000/docs y http://localhost:8000/redoc.

### FrontEnd
    cd frontend
    pnpm install
    copy .env.example .env   # o cp .env.example .env en Linux/macOS
    pnpm build
    pnpm dev

Aplicación disponible en http://localhost:5173.


### Usuario administrador inicial (seed)
    
    Usuario: admin
    Contraseña: Admin1234!
    Rol: admin

## Link del video
https://drive.google.com/drive/folders/1ZgHgPlyYf-d5voB-gVbS-urGIfdUdJD2?usp=drive_link

## Link del repositorio en github
https://github.com/lonker96/TPI_Prog4