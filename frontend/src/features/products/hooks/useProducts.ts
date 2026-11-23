import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { useNotificationStore } from '@/store/notificationStore';
import type { Producto, ProductoCreate, ProductoUpdate } from '../types/producto';

const RESOURCE = '/productos';
const QUERY_KEY = ['productos'];

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
  }
  return fallback;
}

async function getProductos(): Promise<Producto[]> {
  try {
    const response = await api.get<Producto[]>(`${RESOURCE}/`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al obtener los productos'));
  }
}

async function createProducto(data: ProductoCreate): Promise<Producto> {
  try {
    const response = await api.post<Producto>(`${RESOURCE}/`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al crear el producto'));
  }
}

async function updateProducto(id: number, data: ProductoUpdate): Promise<Producto> {
  try {
    const response = await api.put<Producto>(`${RESOURCE}/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al actualizar el producto'));
  }
}

async function deleteProducto(id: number): Promise<void> {
  try {
    await api.delete(`${RESOURCE}/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al eliminar el producto'));
  }
}

export function useProducts() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const productsQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getProductos,
  });

  const createMutation = useMutation({
    mutationFn: createProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showNotification('Producto creado correctamente.');
    },
    onError: (error: Error) => {
      showNotification(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) =>
      updateProducto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showNotification('Producto actualizado correctamente.');
    },
    onError: (error: Error) => {
      showNotification(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showNotification('Producto eliminado correctamente.');
    },
    onError: (error: Error) => {
      showNotification(error.message);
    },
  });

  return {
    products: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}