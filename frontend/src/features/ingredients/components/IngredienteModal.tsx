import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import type { Ingrediente, IngredienteCreate } from "../types/ingrediente";

interface IngredienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IngredienteCreate) => void;
  ingredienteEditar: Ingrediente | null;
  isLoading: boolean;
  errorMessage: string | null;
}

export default function IngredienteModal({
  isOpen,
  onClose,
  onSubmit,
  ingredienteEditar,
  isLoading,
  errorMessage,
}: IngredienteModalProps) {
  

  const form = useForm({
    defaultValues: {
      nombre: ingredienteEditar?.nombre || "",
    },
    onSubmit: async ({ value }) => {
      onSubmit({ nombre: value.nombre.trim() });
    },
  });

   useEffect(() => {
      if (ingredienteEditar) {
        form.setFieldValue("nombre", ingredienteEditar.nombre);
      } else {
        form.reset();
      }
    }, [ingredienteEditar, isOpen, form]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 dark:text-slate-100 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {ingredienteEditar ? "Editar Ingrediente" : "Nuevo Ingrediente"}
        </h2>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                !value || value.trim() === "" ? "El nombre es obligatorio" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="Ej. Tomate"
                />
                {field.state.meta.errors ? (
                  <p className="text-red-500 text-xs mt-1">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}