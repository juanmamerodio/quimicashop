import { NextResponse } from 'next/server';
import { OrderService } from '@/services/order.service';
import { CreateOrderSchema } from '@/lib/schemas';

/**
 * GET: Obtener todos los pedidos (para el panel admin)
 * Protegido por el middleware de admin si se accede a /admin/api...
 */
export async function GET() {
  try {
    const orders = await OrderService.getOrdersForSync();
    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Error GET orders:", error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

/**
 * POST: Crear un nuevo pedido con validación atómica de stock.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. VALIDACIÓN CON ZOD (Runtime Safety)
    const result = CreateOrderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Datos de pedido inválidos', 
        details: result.error.format() 
      }, { status: 400 });
    }

    // 2. CREACIÓN ATÓMICA DE PEDIDO Y DECREMENTO DE STOCK
    // Delegamos la complejidad a la capa de servicios y la RPC de Postgres
    const orderId = await OrderService.createOrderAtomic(result.data);
    const order = await OrderService.getById(orderId);

    return NextResponse.json({ order }, { status: 201 });

  } catch (error: any) {
    console.error("Error POST orders:", error);
    
    // Manejo específico de errores de stock (provenientes de la RPC)
    if (error.message?.includes('Stock insuficiente')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: 'No se pudo procesar el pedido' }, { status: 500 });
  }
}

/**
 * PATCH: Actualizar el estado de un pedido.
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Falta id o status' }, { status: 400 });
    }

    await OrderService.updateStatus(id, status);
    const updatedOrder = await OrderService.getById(id);

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error("Error PATCH order:", error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
