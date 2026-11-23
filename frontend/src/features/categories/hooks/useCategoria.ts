import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { useNotificationStore } from '@/store/notificationStore';
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../types/categoria';

const RESOURCE = '/categorias';
const QUERY_KEY = ['categorias'];

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
  }
  return fallback;
}

async function getCategorias(): Promise<Categoria[]> {
  try {
    const response = await api.get<Categoria[]>(`${RESOURCE}/`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al obtener las categorías'));
  }
}

async function createCategoria(data: CategoriaCreate): Promise<Categoria> {
  try {
    const response = await api.post<Categoria>(`${RESOURCE}/`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al crear la categoría'));
  }
}

async function updateCategoria(id: number, data: CategoriaUpdate): Promise<Categoria> {
  try {
    const response = await api.put<Categoria>(`${RESOURCE}/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al actualizar la categoría'));
  }
}

async function deleteCategoria(id: number): Promise<void> {
  try {
    await api.delete(`${RESOURCE}/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al eliminar la categoría'));
  }
}

export function useCategories() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const categoriesQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getCategorias,
  });

  const createMutation = useMutation({
    mutationFn: createCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showNotification('Categoría creada correctamente.');
    },
    onError: (error: Error) => {
      showNotification(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) =>
      updateCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showNotification('Categoría actualizada correctamente.');
    },
    onError: (error: Error) => {
      showNotification(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showNotification('Categoría eliminada correctamente.');
    },
    onError: (error: Error) => {
      showNotification(error.message);
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}