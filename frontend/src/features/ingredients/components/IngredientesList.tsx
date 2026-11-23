import { useMemo, useState } from "react";
import { useAuthStore } from "@/features/auth";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type { Ingrediente } from "../types/ingrediente";

interface IngredienteListProps {
  ingredientes: Ingrediente[];
  onEdit: (ingrediente: Ingrediente) => void;
  onDelete: (id: number) => void;
}

export default function IngredienteList({
  ingredientes,
  onEdit,
  onDelete,
}: IngredienteListProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { user } = useAuthStore();
  const isAdmin = user?.roles.includes("admin") ?? false;

  const columns = useMemo<ColumnDef<Ingrediente>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      {
        accessorKey: "nombre",
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 font-bold hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Nombre</span>
            <span>
              {column.getIsSorted() === "asc"
                ? " 🔼"
                : column.getIsSorted() === "desc"
                ? " 🔽"
                : ""}
            </span>
          </button>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            {isAdmin && (
              <button
                onClick={() => onEdit(row.original)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium cursor-pointer"
              >
                Editar
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onDelete(row.original.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium cursor-pointer"
              >
                Eliminar
              </button>
            )}
          </div>
        ),
      },
    ],
    [isAdmin, onEdit, onDelete]
  );

  const table = useReactTable({
    data: ingredientes,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (ingredientes.length === 0) {
    return (
      <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
        No hay ingredientes registrados. Haz clic en "+ Añadir Ingrediente" para crear uno.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 dark:text-slate-100 shadow-sm rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white dark:bg-slate-900 dark:text-slate-100 divide-y divide-slate-200 dark:divide-slate-800">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-200"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="px-6 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
        <div className="flex space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-slate-700 disabled:opacity-50 cursor-pointer"
          >
            Anterior
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-slate-700 disabled:opacity-50 cursor-pointer"
          >
            Siguiente
          </button>
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </span>
      </div>
    </div>
  );
}