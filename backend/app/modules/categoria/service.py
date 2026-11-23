from typing import List
from sqlmodel import select
from app.modules.categoria.model import Categoria
from app.modules.categoria.schema import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categoria.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar_activas(self) -> List[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_all_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener_por_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada.")
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            nombre_limpio = data.nombre.strip()
            if uow.categorias.get_by_nombre(nombre_limpio):
                raise NombreDuplicado("Ya existe una categoría con ese nombre.")

            nueva = Categoria(
                nombre=nombre_limpio,
                descripcion=data.descripcion,
                activo=True,
            )
            uow.session.add(nueva)
            uow.session.flush()
            uow.session.refresh(nueva)
            return CategoriaRead.model_validate(nueva)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada.")

            cambios = data.model_dump(exclude_unset=True)
            if "nombre" in cambios and cambios["nombre"] is not None:
                nombre_limpio = cambios["nombre"].strip()
                duplicada = uow.session.exec(
                    select(Categoria).where(
                        Categoria.nombre.ilike(nombre_limpio),
                        Categoria.id != categoria_id,
                    )
                ).first()
                if duplicada:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre.")
                cambios["nombre"] = nombre_limpio

            categoria.sqlmodel_update(cambios)
            uow.session.add(categoria)
            uow.session.flush()
            uow.session.refresh(categoria)
            return CategoriaRead.model_validate(categoria)

    def baja_logica(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada.")

            categoria.activo = False
            uow.session.add(categoria)
            uow.session.flush()