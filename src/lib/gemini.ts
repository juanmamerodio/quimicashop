// Tipos para la respuesta de Gemini
interface GeminiVerificationResult {
  valid: boolean;
  amount_matches: boolean;
  recipient_matches: boolean;
  date_ok: boolean;
  amount_found: number;
  reason: string;
}

/**
 * Envía una imagen de comprobante a Gemini 1.5 Flash para verificación.
 * Retorna el JSON parseado con el resultado de la validación.
 */
export async function verifyReceiptWithGemini(
  imageBase64: string,
  mimeType: string,
  totalEsperado: number
): Promise<GeminiVerificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en .env.local');
  }

  // Prompt de verificación — NO MODIFICAR sin autorización
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

  // Limpiamos el prefijo data:image/...;base64, si existe
  const cleanBase64 = imageBase64.includes(',')
    ? imageBase64.split(',')[1]
    : imageBase64;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1, // Baja creatividad para respuestas consistentes
          maxOutputTokens: 256,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();

  // Extraemos el texto de la respuesta de Gemini
  const rawText: string =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Parseamos el JSON de la respuesta (Gemini a veces agrega backticks)
  const jsonString = rawText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const result: GeminiVerificationResult = JSON.parse(jsonString);
  return result;
}
