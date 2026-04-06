import { createClient } from '@supabase/supabase-js';

/**
 * TIPOS DE DATOS DE LA BASE DE DATOS
 * Basados estrictamente en el esquema SQL de Supabase
 */

export type ProductCategory = 'reactivos' | 'materiales' | 'equipos';

export type OrderStatus =
  | 'pendiente'
  | 'comprobante_subido'
  | 'pre_aprobado'
  | 'enviado'
  | 'rechazado';

export interface CartItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Producto {
  id: string;
  nombre_es: string;
  nombre_en: string;
  descripcion_es: string | null;
  descripcion_en: string | null;
  precio_ars: number;
  stock: number;
  categoria: ProductCategory;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
}

export interface Pedido {
  id: string;
  nombre_cliente: string;
  email: string;
  telefono: string | null;
  items: CartItem[];
  total_ars: number;
  estado: OrderStatus;
  comprobante_url: string | null;
  log_ia: Record<string, unknown> | null;
  created_at: string;
}

export interface Verificacion {
  id: string;
  pedido_id: string;
  respuesta_gemini: Record<string, unknown>;
  verificado: boolean;
  created_at: string;
}

/**
 * DEFINICIÓN DEL ESQUEMA PARA EL CLIENTE DE SUPABASE
 */
export interface Database {
  public: {
    Tables: {
      productos: {
        Row: Producto;
        Insert: Omit<Producto, 'id' | 'created_at'>;
        Update: Partial<Omit<Producto, 'id' | 'created_at'>>;
      };
      pedidos: {
        Row: Pedido;
        Insert: Omit<Pedido, 'id' | 'created_at'>;
        Update: Partial<Omit<Pedido, 'id' | 'created_at'>>;
      };
      verificaciones: {
        Row: Verificacion;
        Insert: Omit<Verificacion, 'id' | 'created_at'>;
        Update: Partial<Omit<Verificacion, 'id' | 'created_at'>>;
      };
    };
  };
}

/**
 * VALIDACIÓN DE VARIABLES DE ENTORNO
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * INSTANCIA DEL CLIENTE
 * Exportamos el cliente tipado para asegurar que todas las queries 
 * respeten la estructura de la base de datos.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);