from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import DetallePedidoRepository, PedidoRepository
from app.modules.producto.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    def __enter__(self) -> "PedidoUnitOfWork":
        super().__enter__()
        self.pedidos = PedidoRepository(self.session)
        self.detalles = DetallePedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self