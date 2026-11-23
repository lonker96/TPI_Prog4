from sqlmodel import select
from app.core.database import create_all_tables, session_factory
from app.core.security import get_password_hash
from app.modules.categoria.model import Categoria
from app.modules.producto.model import Producto
from app.modules.usuarios.model import Usuario
from app.modules.pedidos.model import Pedido


def run_seed() -> None:
    create_all_tables()

    with session_factory() as session:
        admin_user = session.exec(select(Usuario).where(Usuario.username == "admin")).first()
        if not admin_user:
            admin_user = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=get_password_hash("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin_user)
            session.commit()
            session.refresh(admin_user)

        categorias_data = [
            ("Hamburguesas", "Hamburguesas artesanales a la parrilla"),
            ("Pizzas", "Pizzas al molde y a la piedra"),
            ("Bebidas", "Gaseosas, aguas y bebidas frías"),
            ("Acompañamientos", "Papas fritas, bastones y snacks"),
        ]

        categorias_por_nombre: dict[str, Categoria] = {}
        for nombre, descripcion in categorias_data:
            cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if not cat:
                cat = Categoria(nombre=nombre, descripcion=descripcion, activo=True)
                session.add(cat)
                session.commit()
                session.refresh(cat)
            categorias_por_nombre[nombre] = cat

        productos_data = [
            (
                "Hamburguesas",
                "Clásica Doble",
                "Doble medallón de carne, cheddar, lechuga y tomate",
                8500.0,
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
                25,
                True,
            ),
            (
                "Hamburguesas",
                "Bacon Crispy",
                "Doble carne, panceta ahumada, cebolla crispy y barbacoa",
                9400.0,
                "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600",
                20,
                True,
            ),
            (
                "Pizzas",
                "Muzzarella Clásica",
                "Salsa de tomate, abundante muzzarella y orégano",
                10500.0,
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
                15,
                True,
            ),
            (
                "Pizzas",
                "Napolitana",
                "Muzzarella, rodajas de tomate fresco, ajo y aceitunas",
                11200.0,
                "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
                15,
                True,
            ),
            (
                "Pizzas",
                "Fugazzeta Rellena",
                "Rellena con muzzarella y cubierta con cebolla morada y blanca",
                12400.0,
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
                12,
                True,
            ),
            (
                "Bebidas",
                "Gaseosa Cola 500ml",
                "Botella fría de 500 ml",
                2200.0,
                "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600",
                40,
                True,
            ),
            (
                "Bebidas",
                "Agua Mineral 500ml",
                "Agua sin gas de 500 ml",
                1800.0,
                "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600",
                35,
                True,
            ),
            (
                "Acompañamientos",
                "Papas Fritas Clásicas",
                "Porción de papas fritas crocantes",
                4200.0,
                "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
                30,
                True,
            ),
        ]

        for cat_nombre, nombre, desc, precio, img_url, stock, disponible in productos_data:
            cat = categorias_por_nombre[cat_nombre]
            prod = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if not prod:
                prod = Producto(
                    categoria_id=cat.id,
                    nombre=nombre,
                    descripcion=desc,
                    precio_base=precio,
                    imagen_url=img_url,
                    stock=stock,
                    disponible=disponible,
                    activo=True,
                )
                session.add(prod)
        session.commit()
        print("Seed de Food Store ejecutado correctamente.")


if __name__ == "__main__":
    run_seed()