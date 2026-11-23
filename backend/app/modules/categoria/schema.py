from typing import Optional
from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = Field(default="")


class CategoriaUpdate(SQLModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    activo: bool

    model_config = {"from_attributes": True}