from app.core.unit_of_work import UnitOfWork
from app.modules.categoria.repository import CategoriaRepository
from app.modules.producto.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    def __enter__(self) -> "ProductoUnitOfWork":
        super().__enter__()
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        return self