// src/features/products/components/ProductoList.tsx
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
import type { Producto } from "../types/producto";

interface ProductoListProps {
  productos: Producto[];
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
}

export default function ProductoList({
  productos,
  onEdit,
  onDelete,
}: ProductoListProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { user } = useAuthStore();
  const isAdmin = user?.roles.includes("admin") ?? false;

  const columns = useMemo<ColumnDef<Producto>[]>(
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
      { accessorKey: "descripcion", header: "Descripción" },
      {
        accessorKey: "precio_base",
        header: "Precio Base",
        cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
      },
      {
        accessorKey: "disponible",
        header: "Disponible",
        cell: ({ getValue }) =>
          getValue() ? (
            <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-950 rounded-full">
              Sí
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950 rounded-full">
              No
            </span>
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
    data: productos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (productos.length === 0) {
    return (
      <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
        No hay productos registrados. Haz clic en "+ Añadir Producto" para crear uno.
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
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
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