from datetime import datetime, time, timezone
from typing import List, Optional, Tuple
from sqlalchemy import func
from sqlmodel import Session, select
from app.core.repository import BaseRepository
from app.modules.pedidos.model import DetallePedido, Pedido
from app.modules.pedidos.schemas import ResumenPedidos


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(Pedido, session)

    def list_by_usuario(
        self,
        usuario_id: int,
        estado: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[int, List[Pedido]]:
        conditions = [Pedido.usuario_id == usuario_id]
        if estado:
            conditions.append(Pedido.estado == estado)

        count_stmt = select(func.count()).select_from(Pedido)
        items_stmt = select(Pedido)
        for cond in conditions:
            count_stmt = count_stmt.where(cond)
            items_stmt = items_stmt.where(cond)

        total = int(self.session.exec(count_stmt).one())
        items = list(
            self.session.exec(
                items_stmt.order_by(Pedido.created_at.desc(), Pedido.id.desc())
                .offset(skip)
                .limit(limit)
            ).all()
        )
        return total, items

    def list_all_filtered(
        self,
        estado: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[int, List[Pedido]]:
        conditions = []
        if estado:
            conditions.append(Pedido.estado == estado)

        count_stmt = select(func.count()).select_from(Pedido)
        items_stmt = select(Pedido)
        for cond in conditions:
            count_stmt = count_stmt.where(cond)
            items_stmt = items_stmt.where(cond)

        total = int(self.session.exec(count_stmt).one())
        items = list(
            self.session.exec(
                items_stmt.order_by(Pedido.created_at.desc(), Pedido.id.desc())
                .offset(skip)
                .limit(limit)
            ).all()
        )
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        rows = self.session.exec(
            select(Pedido.estado, func.count()).group_by(Pedido.estado)
        ).all()
        conteos = {
            "PENDIENTE": 0,
            "EN_PREPARACION": 0,
            "ENTREGADO": 0,
            "CANCELADO": 0,
        }
        for estado, cantidad in rows:
            conteos[estado] = int(cantidad)
        return conteos

    def obtener_resumen(self) -> ResumenPedidos:
        conteos = self.count_by_estado()

        now_utc = datetime.now(timezone.utc)
        inicio_hoy = datetime.combine(now_utc.date(), time.min, tzinfo=timezone.utc)
        fin_hoy = datetime.combine(now_utc.date(), time.max, tzinfo=timezone.utc)

        pedidos_hoy = int(
            self.session.exec(
                select(func.count())
                .select_from(Pedido)
                .where(Pedido.created_at >= inicio_hoy, Pedido.created_at <= fin_hoy)
            ).one()
        )

        ingresos_entregados = float(
            self.session.exec(
                select(func.coalesce(func.sum(Pedido.total), 0.0)).where(
                    Pedido.estado == "ENTREGADO"
                )
            ).one()
        )

        return ResumenPedidos(
            pendientes=conteos["PENDIENTE"],
            en_preparacion=conteos["EN_PREPARACION"],
            entregados=conteos["ENTREGADO"],
            cancelados=conteos["CANCELADO"],
            pedidos_hoy=pedidos_hoy,
            ingresos_entregados=ingresos_entregados,
        )


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(DetallePedido, session)