export interface UsuarioAuth {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular?: string | null;
  deleted_at?: string | null;
  roles: string[]; // Arreglo con los nombres de los roles vigentes (ej. ["user"], ["admin"])
}