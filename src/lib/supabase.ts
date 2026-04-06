import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. Verificá que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén definidas en .env.local'
  );
}

// Tipos auxiliares para componentes JSON
export interface PedidoItem {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
}

export interface RespuestaGemini {
  valid: boolean;
  amount_matches: boolean;
  recipient_matches: boolean;
  date_ok: boolean;
  amount_found: number;
  reason: string;
}

// Interfaces de tabla (Row)
export interface Producto {
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

export interface Pedido {
  id: string;
  nombre_cliente: string;
  email: string;
  telefono: string | null;
  items: PedidoItem[];
  total_ars: number;
  estado: 'pendiente' | 'comprobante_subido' | 'pre_aprobado' | 'enviado' | 'rechazado';
  comprobante_url: string | null;
  log_ia: RespuestaGemini | null;
  created_at: string;
}

export interface Verificacion {
  id: string;
  pedido_id: string;
  respuesta_gemini: RespuestaGemini | null;
  verificado: boolean | null;
  created_at: string;
}

// Interfaz general de la Base de Datos para el cliente tipado de Supabase
export interface Database {
  public: {
    Tables: {
      productos: {
        Row: Producto;
        Insert: Omit<Producto, 'id' | 'created_at' | 'stock' | 'activo'> & 
          Partial<Pick<Producto, 'id' | 'created_at' | 'stock' | 'activo'>>;
        Update: Partial<Producto>;
      };
      pedidos: {
        Row: Pedido;
        Insert: Omit<Pedido, 'id' | 'created_at' | 'estado'> & 
          Partial<Pick<Pedido, 'id' | 'created_at' | 'estado'>>;
        Update: Partial<Pedido>;
      };
      verificaciones: {
        Row: Verificacion;
        Insert: Omit<Verificacion, 'id' | 'created_at'> & 
          Partial<Pick<Verificacion, 'id' | 'created_at'>>;
        Update: Partial<Verificacion>;
      };
    };
  };
}

// Inicialización del cliente con tipado estricto
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
