import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import type { Categoria, CategoriaCreate } from "../types/categoria";

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoriaCreate) => void;
  categoriaEditar: Categoria | null;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export default function CategoriaModal({
  isOpen,
  onClose,
  onSubmit,
  categoriaEditar,
  isLoading = false,
  errorMessage = null,
}: CategoriaModalProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoriaEditar?.nombre || "",
      descripcion: categoriaEditar?.descripcion || "",
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
      });
    },
  });

  // Actualizar los valores del formulario cuando se abre para editar
  useEffect(() => {
    if (categoriaEditar) {
      form.setFieldValue("nombre", categoriaEditar.nombre);
      form.setFieldValue("descripcion", categoriaEditar.descripcion);
    } else {
      form.reset();
    }
  }, [categoriaEditar, isOpen, form]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {categoriaEditar ? "Editar Categoría" : "Nueva Categoría"}
        </h2>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
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
          {/* Campo Nombre*/}
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                !value || value.trim() === "" ? "El nombre es obligatorio" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Pizzas"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {field.state.meta.errors ? (
                  <p className="text-red-500 text-xs mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          {/* Campo Descripcion */}
          <form.Field
            name="descripcion"
            validators={{
              onChange: ({ value }) =>
                !value || value.trim() === "" ? "La descripción es obligatoria" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Pizzas artesanales con masa fresca"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {field.state.meta.errors ? (
                  <p className="text-red-500 text-xs mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}