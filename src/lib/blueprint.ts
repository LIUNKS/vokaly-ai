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

Rol de referencia: ${track.roleDescription}
Rúbrica: ${track.rubric}
Nivel de experiencia del candidato: ${candidateExperience} años — calibra la dificultad de las preguntas a este nivel.
${jobDescription ? `Oferta laboral de referencia (ajusta el rol/rúbrica, no la reemplaces):\n${jobDescription}` : ""}

Preguntas guía por fase (son ejemplos de tono/dificultad para cada "focus", no un guion literal — genera un escenario concreto propio para cada focus, no repitas la pregunta tal cual):
${track.guideQuestions.map((q) => `- [${q.phase}] focus "${q.focus}": ${q.question}`).join("\n")}

Restricción crítica: el entrevistador NUNCA evalúa en voz alta ni da feedback durante la llamada — ni tras cada respuesta, ni en un resumen final. Solo hace preguntas, escucha y profundiza si hace falta, y se despide al cerrar. La evaluación (puntajes, fortalezas, áreas de mejora) se genera aparte, después de terminada la sesión, a partir de la transcripción — nunca es tarea del entrevistador en vivo.

Devuelve únicamente ese texto final, listo para usarse como system prompt del agente entrevistador — sin explicaciones ni comentarios extra, sin envolverlo en JSON.`,
  });

  return text;
}
