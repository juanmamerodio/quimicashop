// Tipo inferido del diccionario español (fuente de verdad)
import type esDict from '@/dictionaries/es.json';

export type Dictionary = typeof esDict;

export interface Product {
  id: string;
  nombre_es: string;
  nombre_en: string;
  descripcion_es: string | null;
  descripcion_en: string | null;
  precio_ars: number;
  stock: number;
  categoria: 'reactivos' | 'materiales' | 'equipos';
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
}

export interface OrderItem {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  nombre: string;
}

export interface Order {
  id?: string;
  nombre_cliente: string;
  email: string;
  telefono: string | null;
  items: OrderItem[];
  total_ars: number;
  estado: 'pendiente' | 'comprobante_subido' | 'pre_aprobado' | 'enviado' | 'rechazado';
  comprobante_url?: string | null;
  log_ia?: any;
  created_at?: string;
}
