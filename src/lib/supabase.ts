import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * TIPOS DE DATOS DE LA BASE DE DATOS
 * Basados estrictamente en el esquema SQL de Supabase (AGENTS.md)
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
  items: Json; // JSONB en Postgres
  total_ars: number;
  estado: OrderStatus;
  comprobante_url: string | null;
  log_ia: Json | null;
  created_at: string;
}

export interface Verificacion {
  id: string;
  pedido_id: string | null;
  respuesta_gemini: Json;
  verificado: boolean | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      productos: {
        Row: Producto;
        Insert: Omit<Producto, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Producto, 'id' | 'created_at'>>;
      };
      pedidos: {
        Row: Pedido;
        Insert: Omit<Pedido, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Pedido, 'id' | 'created_at'>>;
      };
      verificaciones: {
        Row: Verificacion;
        Insert: Omit<Verificacion, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Verificacion, 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

/**
 * SINGLETON LAZY INITIALIZATION
 * Deferimos la creación del cliente hasta que se necesite.
 */

let supabaseInstance: SupabaseClient<Database> | null = null;
let serviceSupabaseInstance: SupabaseClient<Database> | null = null;

const checkEnv = (name: string, value: string | undefined): string => {
  if (!value || value === 'undefined' || value === '') {
    // En desarrollo local a veces fallan los .env si no se reinicia el servidor
    console.warn(`[Supabase Handshake] Falta la variable ${name}`);
    return value || '';
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
 * getServiceSupabase() — Solo para API routes o Server Actions (bypass RLS).
 */
export const getServiceSupabase = (): SupabaseClient<Database> => {
  if (!serviceSupabaseInstance) {
    const url = checkEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
    const key = checkEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
    serviceSupabaseInstance = createClient<Database>(url, key);
  }
  return serviceSupabaseInstance;
};