from typing import Optional
from app.modules.producto.model import Producto
from app.modules.producto.schema import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.producto.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class CategoriaNoEncontrada(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
                skip=skip,
                limit=limit,
                solo_activos=True,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in items],
            )

    def obtener_por_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado.")
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(data.categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("La categoría no existe o está inactiva.")

            nuevo = Producto(
                categoria_id=data.categoria_id,
                nombre=data.nombre.strip(),
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagen_url=data.imagen_url,
                stock=data.stock,
                disponible=data.disponible,
                activo=True,
            )
            uow.session.add(nuevo)
            uow.session.flush()
            uow.session.refresh(nuevo)
            return ProductoRead.model_validate(nuevo)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado.")

            cambios = data.model_dump(exclude_unset=True)
            if "categoria_id" in cambios and cambios["categoria_id"] is not None:
                categoria = uow.categorias.get_by_id(cambios["categoria_id"])
                if not categoria or not categoria.activo:
                    raise CategoriaNoEncontrada("La categoría no existe o está inactiva.")

            if "nombre" in cambios and cambios["nombre"] is not None:
                cambios["nombre"] = cambios["nombre"].strip()

            producto.sqlmodel_update(cambios)
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado.")

            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def baja_logica(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado.")

            producto.activo = False
            uow.session.add(producto)
            uow.session.flush()