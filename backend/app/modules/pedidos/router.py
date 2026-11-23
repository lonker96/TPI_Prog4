from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from app.core.security import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    ReglaNegocioError,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.model import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.crear_pedido(current_user, data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except (
        StockInsuficiente,
        ProductoNoDisponible,
        ProductoRepetido,
        ReglaNegocioError,
    ) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("", response_model=PedidosPaginados, status_code=status.HTTP_200_OK)
def listar_pedidos(
    estado: Optional[str] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:
    return service.listar_pedidos(
        usuario=current_user,
        estado=estado,
        skip=skip,
        limit=limit,
    )


@router.get("/resumen", response_model=ResumenPedidos, status_code=status.HTTP_200_OK)
def obtener_resumen_pedidos(
    current_user: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> ResumenPedidos:
    return service.obtener_resumen()


@router.get("/{id}", response_model=PedidoRead, status_code=status.HTTP_200_OK)
def obtener_pedido(
    id: int = Path(..., gt=0),
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.obtener_por_id(id, current_user)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except PedidoAjeno as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.patch("/{id}/estado", response_model=PedidoRead, status_code=status.HTTP_200_OK)
def cambiar_estado_pedido(
    data: CambioEstado,
    id: int = Path(..., gt=0),
    current_user: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cambiar_estado(id, data)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except TransicionInvalida as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.patch("/{id}/cancelar", response_model=PedidoRead, status_code=status.HTTP_200_OK)
def cancelar_pedido(
    id: int = Path(..., gt=0),
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cancelar_propio(id, current_user)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except PedidoAjeno as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    except TransicionInvalida as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))