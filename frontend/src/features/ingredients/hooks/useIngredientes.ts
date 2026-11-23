import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { useNotificationStore } from '@/store/notificationStore';
import type {
  Ingrediente,
  IngredienteCreate,
  IngredienteUpdate,
} from '../types/ingrediente';

const RESOURCE = '/ingredientes';
const QUERY_KEY = ['ingredientes'];

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
  }
  return fallback;
}

async function getIngredientes(): Promise<Ingrediente[]> {
  try {
    const response = await api.get<Ingrediente[]>(`${RESOURCE}/`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al obtener los ingredientes'));
  }
}

async function createIngrediente(data: IngredienteCreate): Promise<Ingrediente> {
  try {
    const response = await api.post<Ingrediente>(`${RESOURCE}/`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al crear el ingrediente'));
  }
}

async function updateIngrediente(
  id: number,
  data: IngredienteUpdate
): Promise<Ingrediente> {
  try {
    const response = await api.put<Ingrediente>(`${RESOURCE}/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al actualizar el ingrediente'));
  }
}

async function deleteIngrediente(id: number): Promise<void> {
  try {
    await api.delete(`${RESOURCE}/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Error al eliminar el ingrediente'));
  }
}

export function useIngredients() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const ingredientsQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getIngredientes,
  });

  const createMutation = useMutation({
    mutationFn: createIngrediente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showNotification('Ingrediente creado correctamente.');
    },
    onError: (error: Error) => {
      showNotification(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: IngredienteUpdate }) =>
      updateIngrediente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showNotification('Ingrediente actualizado correctamente.');
    },
    onError: (error: Error) => {
      showNotification(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIngrediente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showNotification('Ingrediente eliminado correctamente.');
    },
    onError: (error: Error) => {
      showNotification(error.message);
    },
  });

  return {
    ingredients: ingredientsQuery.data ?? [],
    isLoading: ingredientsQuery.isLoading,
    isError: ingredientsQuery.isError,
    error: ingredientsQuery.error,
    createIngredient: createMutation.mutateAsync,
    updateIngredient: updateMutation.mutateAsync,
    deleteIngredient: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}