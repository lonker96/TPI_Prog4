from typing import List, Optional, Tuple
from sqlalchemy import func
from sqlmodel import Session, select
from app.core.repository import BaseRepository
from app.modules.producto.model import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(Producto, session)

    def search(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
        solo_activos: bool = True,
    ) -> Tuple[int, List[Producto]]:
        conditions = []
        if solo_activos:
            conditions.append(Producto.activo == True)  
        if search and search.strip():
            conditions.append(Producto.nombre.ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            conditions.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            conditions.append(Producto.disponible == disponible)

        count_stmt = select(func.count()).select_from(Producto)
        items_stmt = select(Producto)

        for cond in conditions:
            count_stmt = count_stmt.where(cond)
            items_stmt = items_stmt.where(cond)

        total = int(self.session.exec(count_stmt).one())
        items = list(
            self.session.exec(items_stmt.order_by(Producto.id).offset(skip).limit(limit)).all()
        )
        return total, items