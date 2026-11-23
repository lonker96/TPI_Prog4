import { useState } from "react";
import { useCategories } from "../hooks/useCategoria";
import type { Categoria, CategoriaCreate } from "../types/categoria";
import CategoriaList from "../components/CategoriaList";
import CategoriaModal from "../components/CategoriaModal";
import { useAuthStore } from "@/features/auth";

export default function CategoriasPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles.includes("admin") ?? false;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<Categoria | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const {
    categories,
    isLoading,
    isError,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
  } = useCategories();

  const handleOpenCreate = () => {
    setCategoriaEditar(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (categoria: Categoria) => {
    setCategoriaEditar(categoria);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoriaEditar(null);
    setModalError(null);
  };

  const handleSubmitModal = async (data: CategoriaCreate) => {
    setModalError(null);
    try {
      if (categoriaEditar) {
        await updateCategory({ id: categoriaEditar.id, data });
      } else {
        await createCategory(data);
      }
      handleCloseModal();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Error al guardar la categoría"
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar esta categoría?")) {
      try {
        await deleteCategory(id);
      } catch {
        // El hook ya dispara showNotification con el error
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Categorías
          </h1>
          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              + Añadir Categoría
            </button>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            Cargando categorías...
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-900 dark:text-red-300">
            Error al cargar los datos: {(error as Error).message}
          </div>
        )}

        {!isLoading && !isError && (
          <CategoriaList
            categorias={categories}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}

        {isAdmin && (
          <CategoriaModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitModal}
            categoriaEditar={categoriaEditar}
            isLoading={isCreating || isUpdating}
            errorMessage={modalError}
          />
        )}
      </main>
    </div>
  );
}