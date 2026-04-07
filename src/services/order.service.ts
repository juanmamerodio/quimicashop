import { getServiceSupabase, type Pedido, type OrderStatus } from '@/lib/supabase';
import { CreateOrderInput, type Product } from '@/lib/schemas';
import { Resend } from 'resend';

/**
 * ORDER SERVICE
 * Gestiona la lógica de negocio para pedidos, incluyendo transacciones atómicas
 * y notificaciones externas (Webhooks).
 */
export class OrderService {
  /**
   * Crea un pedido utilizando una RPC atómica que valida el stock.
   */
  static async createOrderAtomic(input: CreateOrderInput): Promise<string> {
    const supabase = getServiceSupabase();

    // Llamada a la función RPC definida en PostgreSQL (crear_pedido_con_stock)
    // @ts-expect-error - RPC no está en el esquema generado pero existe en la DB
    const { data, error } = await supabase.rpc('crear_pedido_con_stock', {
      p_nombre: input.nombre_cliente,
      p_email: input.email,
      p_telefono: input.telefono || null,
      p_items: JSON.stringify(input.items), // RPC suele esperar JSON como string o obj
      p_total: input.total_ars,
    });

    if (error) {
      console.error('Error in atomic order creation:', error);
      throw new Error(error.message || 'Error al procesar el pedido y stock');
    }

    // Tras el éxito, enviamos el email en segundo plano
    this.getById(data as string).then(order => {
      if (order) this.sendInitialEmail(order);
    });

    return data as string;
  }

  /**
   * Obtiene un pedido por ID con privilegios de servicio.
   */
  static async getById(id: string): Promise<Pedido | null> {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching order: ${error.message}`);
    }

    return data as Pedido;
  }

  /**
   * Envía el email de instrucciones de pago inicial.
   */
  static async sendInitialEmail(order: Pedido): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return;

    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'quimica@eest1.edu.ar',
        to: order.email,
        subject: '🧪 Tu pedido en QuimicaShop - Instrucciones de Pago',
        html: `
          <div style="font-family: sans-serif; color: #1c1c1e; max-width: 600px; border: 1px solid #f0f0ee; padding: 24px; border-radius: 12px;">
            <h2 style="color: #3d8c6e;">¡Hola ${order.nombre_cliente}!</h2>
            <p>Hemos recibido tu pedido correctamente. Para que podamos procesarlo, por favor realiza la transferencia por el total de:</p>
            <h1 style="background: #f7f7f5; padding: 12px; border-radius: 8px; text-align: center;">$${order.total_ars} ARS</h1>
            
            <div style="background: #e8f3ef; border-left: 4px solid #3d8c6e; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Datos para la transferencia:</p>
              <p style="margin: 8px 0 0 0;"><strong>Alias:</strong> PRODUCTOS.QUIMICA.EEST1</p>
              <p style="margin: 4px 0 0 0;"><strong>CBU:</strong> 0000003100012345678901</p>
              <p style="margin: 4px 0 0 0;"><strong>Titular:</strong> Cooperadora EEST N1</p>
            </div>

            <p>Una vez realizada la transferencia, <strong>sube el comprobante</strong> en nuestra web para que la IA lo valide automáticamente.</p>
            <p style="font-size: 12px; color: #8e8e93; border-top: 1px solid #f0f0ee; margin-top: 20px; padding-top: 20px;">
              Este es un proyecto educativo de los alumnos de 7mo año - E.E.S.T N°1 Luciano Reyes.
            </p>
          </div>
        `
      });
    } catch (error) {
      console.error('Failed to send initial email:', error);
    }
  }

  /**
   * Verifica si un pedido ya tiene un proceso de verificación exitoso o iniciado.
   */
  static async isProcessed(id: string): Promise<boolean> {
    const order = await this.getById(id);
    if (!order) return false;

    const finalizedStates: OrderStatus[] = ['pre_aprobado', 'enviado'];
    return finalizedStates.includes(order.estado);
  }

  /**
   * Actualiza el estado de un pedido y dispara webhooks si es necesario.
   */
  static async updateStatus(id: string, status: OrderStatus, extraData: Record<string, unknown> = {}): Promise<void> {
    const supabase = getServiceSupabase();
    
    const updatePayload = { estado: status, ...extraData };
    
    const { error } = await supabase
      .from('pedidos')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw new Error(`Failed to update order status: ${error.message}`);

    if (status === 'pre_aprobado') {
      this.notifySheetsWebhook(id);
    }
  }

  /**
   * WEBHOOK: Notifica a Google Apps Script sobre un nuevo pedido pagado.
   */
  private static async notifySheetsWebhook(orderId: string) {
    const webhookUrl = process.env.SHEETS_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      const order = await this.getById(orderId);
      if (!order) return;

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'ORDER_PAID',
          order: order,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Failed to notify Sheets Webhook:', error);
    }
  }

  /**
   * Obtiene pedidos para sincronización.
   */
  static async getOrdersForSync(limit = 50) {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}
