import type { Categoria } from "../types/categoria";
import CategoriaCard from "./CategoriaCard";

interface CategoriaListProps {
  categorias: Categoria[];
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => void;
}

export default function CategoriaList({
  categorias,
  onEdit,
  onDelete,
}: CategoriaListProps) {
  if (categorias.length === 0) {
    return (
      <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
        No hay categorías registradas. Haz clic en "+ Añadir Categoría" para crear una.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <th className="py-3 px-4">Número</th>
            <th className="py-3 px-4">Nombre</th>
            <th className="py-3 px-4">Descripción</th>
            <th className="py-3 px-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {categorias.map((cat) => (
            <CategoriaCard
              key={cat.id}
              categoria={cat}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}