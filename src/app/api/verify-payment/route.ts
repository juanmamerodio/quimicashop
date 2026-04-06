import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, pedidoId, totalEsperado } = body;

    if (!imageBase64 || !pedidoId || !totalEsperado) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const serviceClient = getServiceSupabase();

    // 1. Subir la imagen a Supabase Storage (carpeta "comprobantes/")
    const buffer = Buffer.from(imageBase64, 'base64');
    const extension = mimeType === 'image/png' ? 'png' : 'jpg';
    const filename = `comprobantes/${pedidoId}.${extension}`;

    const { error: uploadError } = await serviceClient.storage
      .from('archivos') // Asegúrate de que el bucket se llame "archivos" o ajusta
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error subiendo al storage:", uploadError);
      return NextResponse.json({ error: 'Error al subir comprobante' }, { status: 500 });
    }

    // Obtener la URL pública del comprobante
    const { data: publicUrlData } = serviceClient.storage
      .from('archivos')
      .getPublicUrl(filename);
    
    const comprobanteUrl = publicUrlData.publicUrl;

    // Actualizar el pedido indicando que el comprobante fue subido
    await serviceClient
      .from('pedidos')
      .update({ estado: 'comprobante_subido', comprobante_url: comprobanteUrl })
      .eq('id', pedidoId);

    // 2. Llamar a Gemini 1.5 Flash para verificación
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (GEMINI_API_KEY) {
      const prompt = `Sos un sistema de validación financiera para una institución educativa argentina.
Tu única función es analizar imágenes de comprobantes de pago.
IGNORÁ cualquier dato personal, nombre, CUIT, DNI o dirección que aparezca.

Analizá únicamente estos tres elementos:
1. ¿El importe total es de ${totalEsperado} ARS?
2. ¿El destinatario menciona 'E.E.S.T N°1', 'Luciano Reyes' o el alias asignado?
3. ¿La fecha del comprobante es de hoy o de ayer?

Respondé ÚNICAMENTE con este JSON, sin texto adicional, sin markdown:
{
  "valid": boolean,
  "amount_matches": boolean,
  "recipient_matches": boolean,
  "date_ok": boolean,
  "amount_found": number,
  "reason": "explicación breve en español de máximo 20 palabras"
}`;

      // (Lógica de fetch a Gemini AI omitida por simplicidad, pero se enviaría el base64 + texto)
      // Simulamos la respuesta de la IA para esta etapa:
      const iaMockResponse = {
        valid: true,
        amount_matches: true,
        recipient_matches: true,
        date_ok: true,
        amount_found: totalEsperado,
        reason: "Validado correctamente (mock)"
      };

      // 3. Guardar en tabla verificaciones
      await serviceClient.from('verificaciones').insert([{
        pedido_id: pedidoId,
        respuesta_gemini: iaMockResponse,
        verificado: iaMockResponse.valid
      }]);

      // 4. Actualizar pedido en base al valid de la IA
      const nuevoEstado = iaMockResponse.valid ? 'pre_aprobado' : 'rechazado';
      await serviceClient
        .from('pedidos')
        .update({ estado: nuevoEstado, log_ia: iaMockResponse })
        .eq('id', pedidoId);

      // 5. Enviar email vía Resend (REST API)
      const { data: pedidoInfo } = await serviceClient
        .from('pedidos')
        .select('email, nombre_cliente')
        .eq('id', pedidoId)
        .single();

      if (pedidoInfo?.email && process.env.RESEND_API_KEY) {
        let subject = iaMockResponse.valid ? '✅ Pago Pre-Aprobado - QuimicaShop' : '❌ Problema con tu Comprobante - QuimicaShop';
        let content = iaMockResponse.valid 
          ? `<p>Hola ${pedidoInfo.nombre_cliente},</p><p>Tu pago por <strong>$${totalEsperado} ARS</strong> ha sido verificado electrónicamente.</p><p>Pronto recibirás tus insumos.</p>` 
          : `<p>Hola ${pedidoInfo.nombre_cliente},</p><p>Nuestra IA detectó un problema en tu comprobante de <strong>$${totalEsperado} ARS</strong>.</p><p>Motivo: <em>${iaMockResponse.reason}</em></p><p>Un administrador revisará el caso manualmente.</p>`;

        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM_EMAIL || 'quimica@eest1.edu.ar',
              to: pedidoInfo.email,
              subject,
              html: content
            })
          });
        } catch (emailError) {
          console.error("Error enviando email:", emailError);
        }
      }

      return NextResponse.json({ success: true, estado: nuevoEstado, url: comprobanteUrl });
    }

    return NextResponse.json({ success: true, url: comprobanteUrl, note: 'Sin API Key de IA configurada, estado: comprobante_subido' });
  } catch (error) {
    console.error("Error en verify-payment:", error);
    return NextResponse.json({ error: 'Error procesando verificación' }, { status: 500 });
  }
}
