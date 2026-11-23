import { useState } from "react";
import { useAuthStore } from "@/features/auth";
import { useCategories } from "@/features/categories";
import { useProducts } from "../hooks/useProducts";
import type { Producto, ProductoCreate } from "../types/producto";
import ProductoList from "../components/ProductoList";
import ProductoModal from "../components/ProductoModal";

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const isAdmin = user?.roles.includes("admin") ?? false;

  const {
    products,
    isLoading: isLoadingProductos,
    isError: isErrorProductos,
    error: errorProductos,
    createProduct,
    updateProduct,
    deleteProduct,
    isCreating,
    isUpdating,
  } = useProducts();

  const { categories } = useCategories();

  const handleOpenCreate = () => {
    setProductoEditar(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (producto: Producto) => {
    setProductoEditar(producto);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductoEditar(null);
    setModalError(null);
  };

  const handleSubmitModal = async (data: ProductoCreate) => {
    setModalError(null);
    try {
      if (productoEditar) {
        await updateProduct({ id: productoEditar.id, data });
      } else {
        await createProduct(data);
      }
      handleCloseModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Error al guardar el producto");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteProduct(id);
      } catch {
        // El hook ya dispara showNotification con el mensaje de error
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Gestión de Productos
          </h1>
          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              + Añadir Producto
            </button>
          )}
        </div>

        {isLoadingProductos && (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            Cargando productos...
          </div>
        )}

        {isErrorProductos && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-900 dark:text-red-300">
            Error al cargar los datos: {(errorProductos as Error).message}
          </div>
        )}

        {!isLoadingProductos && !isErrorProductos && (
          <ProductoList
            productos={products}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}

        {isAdmin && (
          <ProductoModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitModal}
            productoEditar={productoEditar}
            categorias={categories}
            isLoading={isCreating || isUpdating}
            errorMessage={modalError}
          />
        )}
      </main>
    </div>
  );
}