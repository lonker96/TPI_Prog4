import { useState } from "react";
import { useAuthStore } from "@/features/auth";
import { useIngredients } from "../hooks/useIngredientes";
import type { Ingrediente, IngredienteCreate } from "../types/ingrediente";
import IngredienteList from "../components/IngredientesList";
import IngredienteModal from "../components/IngredienteModal";

export default function IngredientesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ingredienteEditar, setIngredienteEditar] = useState<Ingrediente | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const isAdmin = user?.roles.includes("admin") ?? false;

  const {
    ingredients,
    isLoading,
    isError,
    error,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    isCreating,
    isUpdating,
  } = useIngredients();

  const handleOpenCreate = () => {
    setIngredienteEditar(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ingrediente: Ingrediente) => {
    setIngredienteEditar(ingrediente);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIngredienteEditar(null);
    setModalError(null);
  };

  const handleSubmitModal = async (data: IngredienteCreate) => {
    setModalError(null);
    try {
      if (ingredienteEditar) {
        await updateIngredient({ id: ingredienteEditar.id, data });
      } else {
        await createIngredient(data);
      }
      handleCloseModal();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Error al guardar el ingrediente"
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este ingrediente?")) {
      try {
        await deleteIngredient(id);
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
            Ingredientes
          </h1>
          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              + Añadir Ingrediente
            </button>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            Cargando ingredientes...
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-900 dark:text-red-300">
            Error al cargar los datos: {(error as Error).message}
          </div>
        )}

        {!isLoading && !isError && (
          <IngredienteList
            ingredientes={ingredients}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}

        {isAdmin && (
          <IngredienteModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitModal}
            ingredienteEditar={ingredienteEditar}
            isLoading={isCreating || isUpdating}
            errorMessage={modalError}
          />
        )}
      </main>
    </div>
  );
}