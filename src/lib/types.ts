// src/lib/types.ts

export type CategoriaProducto = 'reactivos' | 'materiales' | 'equipos';
export type EstadoPedido = 'pendiente' | 'comprobante_subido' | 'pre_aprobado' | 'enviado' | 'rechazado';

export interface Producto {
  id: string;
  nombre_es: string;
  nombre_en: string;
  descripcion_es?: string;
  descripcion_en?: string;
  precio_ars: number;
  stock: number;
  categoria: CategoriaProducto;
  imagen_url?: string;
  activo: boolean;
  created_at: string;
}

export interface ItemCarrito {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  nombre: string;
}

export interface IAResponse {
  valid: boolean;
  amount_matches: boolean;
  recipient_matches: boolean;
  date_ok: boolean;
  amount_found: number;
  reason: string;
}

export interface Pedido {
  id: string;
  nombre_cliente: string;
  email: string;
  telefono?: string;
  items: ItemCarrito;
  total_ars: number;
  estado: EstadoPedido;
  comprobante_url?: string;
  log_ia?: IAResponse;
  created_at: string;
}

// Resolución del error: Sustitución de any por una interfaz genérica de diccionario
export interface Diccionario {
  nav: {
    home: string;
    cart: string;
    admin: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
  };
  categories: {
    reactivos: string;
    materiales: string;
    equipos: string;
  };
  checkout: {
    upload_instruction: string;
    verifying: string;
  };
}