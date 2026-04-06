import { NextResponse } from 'next/server';
import { supabase, getServiceSupabase } from '@/lib/supabase';

// GET: Obtener todos los pedidos (para el panel admin o GAS)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({ orders: data });
  } catch (error) {
    console.error("Error GET orders:", error);
    return NextResponse.json({ error: 'Error interno al obtener pedidos' }, { status: 500 });
  }
}

// POST: Crear un nuevo pedido
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre_cliente, email, telefono, items, total_ars } = body;

    // Validación básica
    if (!nombre_cliente || !email || !items || !total_ars) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('pedidos')
      .insert([{ nombre_cliente, email, telefono, items, total_ars, estado: 'pendiente' }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ order: data }, { status: 201 });
  } catch (error) {
    console.error("Error POST orders:", error);
    return NextResponse.json({ error: 'Error interno al crear el pedido' }, { status: 500 });
  }
}

// PATCH: Actualizar el estado de un pedido (ej: desde el admin)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Falta id o status' }, { status: 400 });
    }

    const serviceClient = getServiceSupabase();
    const { data, error } = await serviceClient
      .from('pedidos')
      .update({ estado: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ order: data });
  } catch (error) {
    console.error("Error PATCH order:", error);
    return NextResponse.json({ error: 'Error interno al actualizar el pedido' }, { status: 500 });
  }
}
