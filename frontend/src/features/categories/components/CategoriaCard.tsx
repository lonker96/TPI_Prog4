import type { Categoria } from "../types/categoria";
import { useAuthStore } from "@/features/auth";

interface CategoriaCardProps {
  categoria: Categoria;
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => void;
}

export default function CategoriaCard({
  categoria,
  onEdit,
  onDelete,
}: CategoriaCardProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles.includes("admin") ?? false;

  return (
    <tr className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
      <td className="py-3.5 px-4 text-sm text-slate-600 dark:text-slate-300">
        {categoria.id}
      </td>
      <td className="py-3.5 px-4 text-sm font-medium text-slate-900 dark:text-slate-100">
        {categoria.nombre}
      </td>
      <td className="py-3.5 px-4 text-sm text-slate-600 dark:text-slate-300">
        {categoria.descripcion}
      </td>
      <td className="py-3.5 px-4 text-sm text-right space-x-3">
        {isAdmin && (
          <button
            onClick={() => onEdit(categoria)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium cursor-pointer"
          >
            Editar
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => onDelete(categoria.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium cursor-pointer"
          >
            Eliminar
          </button>
        )}
      </td>
    </tr>
  );
}