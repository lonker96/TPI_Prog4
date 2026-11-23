from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categoria.model import Categoria
    from app.modules.pedidos.model import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categorias.id", nullable=False)
    nombre: str = Field(index=True, nullable=False)
    descripcion: str = Field(default="", nullable=False)
    precio_base: float = Field(nullable=False)
    imagen_url: str = Field(default="", nullable=False)
    stock: int = Field(default=0, nullable=False)
    disponible: bool = Field(default=True, nullable=False)
    activo: bool = Field(default=True, nullable=False)

    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    detalles: List["DetallePedido"] = Relationship(back_populates="producto")