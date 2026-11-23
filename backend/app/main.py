from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.categoria import model as categoria_model  
from app.modules.categoria.router import router as categoria_router
from app.modules.pedidos import model as pedidos_model  
from app.modules.pedidos.router import router as pedido_router
from app.modules.producto import model as producto_model  
from app.modules.producto.router import router as producto_router
from app.modules.usuarios import model as usuarios_model  
from app.modules.usuarios.router import admin_users_router, router as usuario_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    create_all_tables()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Food Store API",
        description="API REST para el sistema de pedidos Food Store - Programación 4",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_ORIGIN],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    api_prefix = "/api/v1"
    app.include_router(usuario_router, prefix=api_prefix)
    app.include_router(admin_users_router, prefix=api_prefix)
    app.include_router(categoria_router, prefix=api_prefix)
    app.include_router(producto_router, prefix=api_prefix)
    app.include_router(pedido_router, prefix=api_prefix)

    return app


app = create_app()