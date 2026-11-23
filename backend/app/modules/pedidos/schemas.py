from datetime import datetime
from typing import List, Literal, Optional
from pydantic import model_validator
from sqlmodel import Field, SQLModel

FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]
EstadoPedido = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]


class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: List[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: Optional[str] = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validar_items_sin_repetidos(self) -> "PedidoCreate":
        ids = [item.producto_id for item in self.items]
        if len(ids) != len(set(ids)):
            raise ValueError("No se permite repetir productos dentro del mismo pedido.")
        return self


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float

    model_config = {"from_attributes": True}


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str] = None
    total: float
    created_at: datetime
    updated_at: datetime
    items: List[DetallePedidoRead] = []

    model_config = {"from_attributes": True}


class PedidosPaginados(SQLModel):
    total: int
    items: List[PedidoRead]


class CambioEstado(SQLModel):
    estado: EstadoPedido


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float