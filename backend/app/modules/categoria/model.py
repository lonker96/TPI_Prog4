from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.producto.model import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, nullable=False)
    descripcion: str = Field(default="", nullable=False)
    activo: bool = Field(default=True, nullable=False)

    productos: List["Producto"] = Relationship(back_populates="categoria")