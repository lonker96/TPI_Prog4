from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.producto.model import Producto
    from app.modules.usuarios.model import Usuario


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", nullable=False)
    estado: str = Field(default="PENDIENTE", nullable=False)
    forma_pago: str = Field(nullable=False)
    direccion_entrega: str = Field(nullable=False)
    notas: Optional[str] = Field(default=None, nullable=True)
    total: float = Field(default=0.0, nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    items: List["DetallePedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", nullable=False)
    producto_id: int = Field(foreign_key="productos.id", nullable=False)
    cantidad: int = Field(nullable=False)
    nombre_producto: str = Field(nullable=False)
    precio_unitario: float = Field(nullable=False)
    subtotal: float = Field(nullable=False)

    pedido: Optional["Pedido"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")