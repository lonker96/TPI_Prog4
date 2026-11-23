from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from app.core.security import require_role
from app.modules.producto.schema import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.producto.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
)
from app.modules.producto.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.model import Usuario

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados, status_code=status.HTTP_200_OK)
def listar_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    categoria_id: Optional[int] = Query(default=None, gt=0),
    disponible: Optional[bool] = Query(default=None),
    service: ProductoService = Depends(get_producto_service),
) -> ProductosPaginados:
    return service.listar(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get("/{id}", response_model=ProductoRead, status_code=status.HTTP_200_OK)
def obtener_producto(
    id: int = Path(..., gt=0),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.obtener_por_id(id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    current_user: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_categoria_service_if_needed(service=None)) if False else Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.put("/{id}", response_model=ProductoRead, status_code=status.HTTP_200_OK)
def actualizar_producto(
    data: ProductoUpdate,
    id: int = Path(..., gt=0),
    current_user: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.actualizar(id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.patch("/{id}/stock", response_model=ProductoRead, status_code=status.HTTP_200_OK)
def actualizar_stock_producto(
    data: ProductoStockUpdate,
    id: int = Path(..., gt=0),
    current_user: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.actualizar_stock(id, data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    id: int = Path(..., gt=0),
    current_user: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> None:
    try:
        service.baja_logica(id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    return None