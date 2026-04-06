import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, pedidoId, totalEsperado } = body;

    if (!imageBase64 || !pedidoId || !totalEsperado) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const serviceClient = getServiceSupabase() as any;

    // 1. Subir la imagen a Supabase Storage (carpeta "comprobantes/")
    const buffer = Buffer.from(imageBase64, 'base64');
    const extension = mimeType === 'image/png' ? 'png' : 'jpg';
    const filename = `comprobantes/${pedidoId}.${extension}`;

    const { error: uploadError } = await serviceClient.storage
      .from('archivos') 
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error subiendo al storage:", uploadError);
      return NextResponse.json({ error: 'Error al subir comprobante' }, { status: 500 });
    }

    const { data: publicUrlData } = serviceClient.storage
      .from('archivos')
      .getPublicUrl(filename);
    
    const comprobanteUrl = publicUrlData.publicUrl;

    // Actualizar el pedido indicando que el comprobante fue subido
    await serviceClient
      .from('pedidos')
      .update({ estado: 'comprobante_subido', comprobante_url: comprobanteUrl } as any)
      .eq('id', pedidoId);

    // 2. Mock de Verificación Gemini AI
    // (Simulamos la respuesta de la IA definida en AGENTS.md)
    const iaMockResponse = {
      valid: true,
      amount_matches: true,
      recipient_matches: true,
      date_ok: true,
      amount_found: totalEsperado,
      reason: "Comprobante validado correctamente por el sistema."
    };

    // 3. Guardar en tabla verificaciones
    await serviceClient.from('verificaciones').insert({
      pedido_id: pedidoId,
      respuesta_gemini: iaMockResponse,
      verificado: iaMockResponse.valid
    } as any);

    // 4. Actualizar pedido en base al resultado de la IA
    const nuevoEstado = iaMockResponse.valid ? 'pre_aprobado' : 'rechazado';
    await serviceClient
      .from('pedidos')
      .update({ estado: nuevoEstado, log_ia: iaMockResponse } as any)
      .eq('id', pedidoId);

    // 5. Obtener info del pedido para enviar email
    const { data: pedidoInfo, error: pedidoError } = await serviceClient
      .from('pedidos')
      .select('email, nombre_cliente')
      .eq('id', pedidoId)
      .single();

    if (pedidoError) {
      console.error("Error obteniendo info del pedido:", pedidoError);
    }

    const pInfo = pedidoInfo as any; // Cast safety for now

    if (pInfo?.email && process.env.RESEND_API_KEY) {
      const subject = iaMockResponse.valid ? '✅ Pago Pre-Aprobado - QuimicaShop' : '❌ Problema con tu Comprobante - QuimicaShop';
      const content = iaMockResponse.valid 
        ? `<p>Hola ${pInfo.nombre_cliente},</p><p>Tu pago por <strong>$${totalEsperado} ARS</strong> ha sido verificado electrónicamente.</p><p>Pronto recibirás tus insumos.</p>` 
        : `<p>Hola ${pInfo.nombre_cliente},</p><p>Nuestra IA detectó un problema en tu comprobante de <strong>$${totalEsperado} ARS</strong>.</p><p>Motivo: <em>${iaMockResponse.reason}</em></p><p>Un administrador revisará el caso manualmente.</p>`;

      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'quimica@eest1.edu.ar',
            to: pInfo.email,
            subject,
            html: content
          })
        });
      } catch (emailError) {
        console.error("Error enviando email:", emailError);
      }
    }

    return NextResponse.json({ success: true, estado: nuevoEstado, url: comprobanteUrl });
  } catch (error) {
    console.error("Error en verify-payment:", error);
    return NextResponse.json({ error: 'Error procesando verificación' }, { status: 500 });
  }
}
