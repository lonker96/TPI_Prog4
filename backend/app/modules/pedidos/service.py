from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.modules.pedidos.model import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.model import Usuario


class PedidoNoEncontrado(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ReglaNegocioError(Exception):
    pass


TRANSICIONES_VALIDAS: Dict[str, List[str]] = {
    "PENDIENTE": ["EN_PREPARACION", "CANCELADO"],
    "EN_PREPARACION": ["ENTREGADO", "CANCELADO"],
    "ENTREGADO": [],
    "CANCELADO": [],
}

FORMAS_PAGO_VALIDAS = {"EFECTIVO", "TRANSFERENCIA"}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def _restituir_stock(self, pedido: Pedido, uow: PedidoUnitOfWork) -> None:
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.session.add(producto)

    def crear_pedido(self, usuario: Usuario, data: PedidoCreate) -> PedidoRead:
        if not data.items:
            raise ReglaNegocioError("El pedido debe contener al menos un ítem.")

        if data.forma_pago not in FORMAS_PAGO_VALIDAS:
            raise ReglaNegocioError("Forma de pago inválida.")

        direccion = data.direccion_entrega.strip()
        if not (5 <= len(direccion) <= 200):
            raise ReglaNegocioError("La dirección de entrega debe tener entre 5 y 200 caracteres.")

        with self.uow as uow:
            ids_vistos: set[int] = set()
            for item in data.items:
                if item.producto_id in ids_vistos:
                    raise ProductoRepetido("No se permite repetir el mismo producto en el pedido.")
                ids_vistos.add(item.producto_id)

            now = datetime.now(timezone.utc)
            pedido = Pedido(
                usuario_id=usuario.id,  # type: ignore[arg-type]
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=direccion,
                notas=data.notas,
                total=0.0,
                created_at=now,
                updated_at=now,
            )
            uow.session.add(pedido)
            uow.session.flush()

            total_pedido = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"El producto {item.producto_id} no existe o está inactivo."
                    )

                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible."
                    )

                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock})."
                    )

                producto.stock -= item.cantidad
                uow.session.add(producto)

                subtotal = float(producto.precio_base) * item.cantidad
                detalle = DetallePedido(
                    pedido_id=pedido.id,  # type: ignore[arg-type]
                    producto_id=producto.id,  # type: ignore[arg-type]
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=float(producto.precio_base),
                    subtotal=subtotal,
                )
                uow.session.add(detalle)
                total_pedido += subtotal

            pedido.total = total_pedido
            pedido.updated_at = datetime.now(timezone.utc)
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def listar_pedidos(
        self,
        usuario: Usuario,
        estado: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                total, items = uow.pedidos.list_all_filtered(
                    estado=estado,
                    skip=skip,
                    limit=limit,
                )
            else:
                total, items = uow.pedidos.list_by_usuario(
                    usuario_id=usuario.id,  # type: ignore[arg-type]
                    estado=estado,
                    skip=skip,
                    limit=limit,
                )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in items],
            )

    def obtener_por_id(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado.")

            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No tiene permiso para acceder a este pedido.")

            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado.")

            permitidos = TRANSICIONES_VALIDAS.get(pedido.estado, [])
            if data.estado not in permitidos:
                raise TransicionInvalida(
                    f"No es posible pasar un pedido de '{pedido.estado}' a '{data.estado}'."
                )

            if data.estado == "CANCELADO":
                self._restituir_stock(pedido, uow)

            pedido.estado = data.estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado.")

            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("Solo el dueño del pedido puede cancelarlo.")

            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo se puede cancelar un pedido que se encuentre en estado PENDIENTE."
                )

            self._restituir_stock(pedido, uow)
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            return uow.pedidos.obtener_resumen()