// src/components/ProductoModal.tsx
import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import type { Producto, ProductoCreate } from "../types/producto";
import type { Categoria } from "@/features/categories";

interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductoCreate) => void;
  productoEditar: Producto | null;
  categorias: Categoria[];
  isLoading?: boolean;
  errorMessage?: string | null;
}

export default function ProductoModal({
  isOpen,
  onClose,
  onSubmit,
  productoEditar,
  categorias,
  isLoading = false,
  errorMessage = null,
}: ProductoModalProps) {
  const form = useForm({
    defaultValues: {
      nombre: productoEditar?.nombre || "",
      descripcion: productoEditar?.descripcion || "",
      precio_base: productoEditar?.precio_base ?? 0,
      disponible: productoEditar?.disponible ?? true,
      categoria_id: productoEditar?.categoria_id ? String(productoEditar.categoria_id) : "",
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        precio_base: Number(value.precio_base),
        disponible: Boolean(value.disponible),
        categoria_id: value.categoria_id ? Number(value.categoria_id) : undefined,
      });
    },
  });

  useEffect(() => {
    if (productoEditar) {
      form.setFieldValue("nombre", productoEditar.nombre);
      form.setFieldValue("descripcion", productoEditar.descripcion || "");
      form.setFieldValue("precio_base", productoEditar.precio_base);
      form.setFieldValue("disponible", productoEditar.disponible);
      form.setFieldValue("categoria_id", productoEditar.categoria_id ? String(productoEditar.categoria_id) : "");
    } else {
      form.reset();
    }
  }, [productoEditar, isOpen, form]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {productoEditar ? "Editar Producto" : "Nuevo Producto"}
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
          {/* Nombre */}
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
                  placeholder="Ej. Super Pancho"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {field.state.meta.errors ? (
                  <p className="text-red-500 text-xs mt-1">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          {/* Descripción */}
          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej. Super pancho con papitas"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}
          </form.Field>

          {/* Precio Base */}
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                Number(value) < 0 ? "El precio base no puede ser negativo" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio Base</label>
                <input
                  type="number"
                  step="0.01"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {field.state.meta.errors ? (
                  <p className="text-red-500 text-xs mt-1">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          {/* Categoría */}
          <form.Field name="categoria_id">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="">Seleccione una categoría (opcional)</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          {/* Disponible */}
          <form.Field name="disponible">
            {(field) => (
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="disponible" className="text-sm font-medium text-slate-700">
                  Disponible para la venta
                </label>
              </div>
            )}
          </form.Field>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
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