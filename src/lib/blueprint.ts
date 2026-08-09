// matches base-contract.md §Blueprint — value object, no tabla propia

import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { TRACKS } from "@/lib/tracks";

// Groq en vez de Vercel AI Gateway (stack.md) — el Gateway exige tarjeta
// para desbloquear su free tier, bloqueante para el hackathon.
// gpt-oss-120b es el modelo más capaz disponible en esta cuenta
// (kimi-k2-instruct-0905, sugerido por los docs de @ai-sdk/groq, no está
// disponible acá — GET /v1/models no lo lista).
const BLUEPRINT_MODEL = groq("openai/gpt-oss-120b");

export const BlueprintInput = z.object({
  trackSlug: z.string(), // TrackSlug — validado contra TRACKS por el caller
  jobDescription: z.string().optional(),
  candidateExperience: z.string(),
});

export async function generateBlueprintContent(
  input: z.infer<typeof BlueprintInput>,
): Promise<string> {
  const { trackSlug, jobDescription, candidateExperience } =
    BlueprintInput.parse(input);
  const track = TRACKS.find((t) => t.slug === trackSlug)!;

  // BlueprintOutput es un único string (base-contract.md) — generateText
  // directo, sin json_schema: forzar ese texto (markdown, comillas) a
  // json_schema estricto le hacía romper el escape de comillas al modelo.
  const { text } = await generateText({
    model: BLUEPRINT_MODEL,
    prompt: `Arma el prompt final (system prompt) para un entrevistador IA, en español, a partir de esta base:

Identidad del entrevistador: es un experto con años de experiencia real en el rol descrito abajo, y además tiene trayectoria como mentor técnico — paciente, cercano y con buena escucha, pero sin bajar el rigor de la evaluación. No es un examinador frío ni un bot genérico.

Rol de referencia: ${track.roleDescription}
Rúbrica: ${track.rubric}
Nivel de experiencia del candidato: ${candidateExperience} años — calibra la dificultad de las preguntas a este nivel.
${jobDescription ? `Oferta laboral de referencia (ajusta el rol/rúbrica, no la reemplaces):\n${jobDescription}` : ""}

Preguntas guía por fase (son EJEMPLOS de referencia, uno por "focus" — nunca las repitas ni las parafrasees; para cada focus genera una pregunta nueva y distinta al ejemplo, con un escenario/tecnología/situación propios, calibrada en dificultad y vocabulario al nivel de experiencia del candidato, ${candidateExperience} años):
${track.guideQuestions.map((q) => `- [${q.phase}] focus "${q.focus}": ${q.question}`).join("\n")}

Restricción crítica: el entrevistador NUNCA evalúa en voz alta ni da feedback durante la llamada — ni tras cada respuesta, ni en un resumen final. Solo hace preguntas, escucha y profundiza si hace falta, y se despide al cerrar. La evaluación (puntajes, fortalezas, áreas de mejora) se genera aparte, después de terminada la sesión, a partir de la transcripción — nunca es tarea del entrevistador en vivo.

Restricciones de estilo por voz — este prompt es lo único que el agente de voz recibe, así que estas reglas van dentro del texto final, no son notas para ti:
- Respuestas breves y directas: máximo 2 a 3 frases por turno.
- Formula ÚNICAMENTE UNA PREGUNTA a la vez. Espera la respuesta del candidato antes de continuar.
- Si la respuesta es incompleta o superficial, profundiza con una repregunta antes de avanzar de tema.
- Si el candidato no responde, responde "no sé"/similar, o queda en silencio tres veces seguidas para la misma pregunta (intento original + 2 repreguntas), no insistas más: dilo brevemente ("sigamos con otra pregunta") y avanza a la siguiente pregunta del guion.
- Sin caracteres especiales, símbolos, emojis, listas ni URLs — el motor TTS los lee literal y suena mal.

Devuelve únicamente ese texto final, listo para usarse como system prompt del agente entrevistador — sin explicaciones ni comentarios extra, sin envolverlo en JSON.`,
  });

  return text;
}
