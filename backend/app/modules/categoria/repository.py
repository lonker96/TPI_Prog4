from typing import List, Optional
from sqlmodel import Session, select
from app.core.repository import BaseRepository
from app.modules.categoria.model import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(Categoria, session)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        statement = select(Categoria).where(Categoria.nombre.ilike(nombre))
        return self.session.exec(statement).first()

    def get_all_activas(self) -> List[Categoria]:
        statement = (
            select(Categoria)
            .where(Categoria.activo == True) 
            .order_by(Categoria.id)
        )
        return list(self.session.exec(statement).all())