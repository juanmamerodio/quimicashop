import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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
  items: Json; 
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
 * SINGLETON LAZY INITIALIZATION
 * Deferimos la creación del cliente hasta que se necesite.
 * Esto evita errores durante el build en Vercel si las variables no están disponibles.
 */

let supabaseInstance: SupabaseClient<Database> | null = null;
let serviceSupabaseInstance: SupabaseClient<Database> | null = null;

const checkEnv = (name: string, value: string | undefined): string => {
  if (!value || value === 'undefined' || value === '') {
    throw new Error(
      `Falta la variable de entorno ${name}. Asegúrate de configurarla en el panel de Vercel (Settings > Environment Variables) y crear un nuevo despliegue.`
    );
  }
  return value;
};

/**
 * getSupabase() — Para uso en el cliente y componentes de servidor públicos.
 */
export const getSupabase = (): SupabaseClient<Database> => {
  if (!supabaseInstance) {
    const url = checkEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
    const key = checkEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    supabaseInstance = createClient<Database>(url, key);
  }
  return supabaseInstance;
};

/**
 * getServiceSupabase() — Solo para API routes o Server Actions que requieran Service Role (bypass RLS).
 */
export const getServiceSupabase = (): SupabaseClient<Database> => {
  if (!serviceSupabaseInstance) {
    const url = checkEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
    const key = checkEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
    serviceSupabaseInstance = createClient<Database>(url, key);
  }
  return serviceSupabaseInstance;
};