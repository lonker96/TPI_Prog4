export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  disponible: boolean;
  imagenes_url?: string[];
  categoria_id?: number;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  precio_base: number;
  disponible: boolean;
  imagenes_url?: string[];
  categoria_id?: number;
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string;
  precio_base?: number;
  disponible?: boolean;
  imagenes_url?: string[];
  categoria_id?: number;
}