import { createClient } from '@supabase/supabase-js';

/**
 * TIPOS DE DATOS DE LA BASE DE DATOS
 * Basados estrictamente en el esquema SQL de Supabase
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
  descripcion_es?: string | null;
  descripcion_en?: string | null;
  precio_ars: number;
  stock?: number;
  categoria: ProductCategory;
  imagen_url?: string | null;
  activo?: boolean;
  created_at: string;
}

export interface Pedido {
  id: string;
  nombre_cliente: string;
  email: string;
  telefono?: string | null;
  items: Json; // Changed from CartItem[] to Json for database compatibility
  total_ars: number;
  estado?: OrderStatus;
  comprobante_url?: string | null;
  log_ia?: Json | null;
  created_at: string;
}

export interface Verificacion {
  id: string;
  pedido_id: string;
  respuesta_gemini: Json;
  verificado?: boolean | null;
  created_at: string;
}

export interface ProductoInsert {
  id?: string;
  nombre_es: string;
  nombre_en: string;
  descripcion_es?: string | null;
  descripcion_en?: string | null;
  precio_ars: number;
  stock?: number;
  categoria: ProductCategory;
  imagen_url?: string | null;
  activo?: boolean;
  created_at?: string;
}

export interface ProductoUpdate {
  id?: string;
  nombre_es?: string;
  nombre_en?: string;
  descripcion_es?: string | null;
  descripcion_en?: string | null;
  precio_ars?: number;
  stock?: number;
  categoria?: ProductCategory;
  imagen_url?: string | null;
  activo?: boolean;
  created_at?: string;
}

export interface PedidoInsert {
  id?: string;
  nombre_cliente: string;
  email: string;
  telefono?: string | null;
  items: Json;
  total_ars: number;
  estado?: OrderStatus;
  comprobante_url?: string | null;
  log_ia?: Json | null;
  created_at?: string;
}

export interface PedidoUpdate {
  id?: string;
  nombre_cliente?: string;
  email?: string;
  telefono?: string | null;
  items?: Json;
  total_ars?: number;
  estado?: OrderStatus;
  comprobante_url?: string | null;
  log_ia?: Json | null;
  created_at?: string;
}

export interface VerificacionInsert {
  id?: string;
  pedido_id: string;
  respuesta_gemini: Json;
  verificado?: boolean | null;
  created_at?: string;
}

export interface VerificacionUpdate {
  id?: string;
  pedido_id?: string;
  respuesta_gemini?: Json;
  verificado?: boolean | null;
  created_at?: string;
}

/**
 * DEFINICIÓN DEL ESQUEMA PARA EL CLIENTE DE SUPABASE
 */
export interface Database {
  public: {
    Tables: {
      productos: {
        Row: Producto;
        Insert: ProductoInsert;
        Update: ProductoUpdate;
      };
      pedidos: {
        Row: Pedido;
        Insert: PedidoInsert;
        Update: PedidoUpdate;
      };
      verificaciones: {
        Row: Verificacion;
        Insert: VerificacionInsert;
        Update: VerificacionUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
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

/**
 * CLIENTE DE SERVICIO (Service Role)
 * Usado solo en el backend para operaciones que requieren saltarse RLS.
 */
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Faltan las variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY'
    );
  }
  return createClient<Database>(supabaseUrl, serviceKey);
};