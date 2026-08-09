// matches base-contract.md §Blueprint — value object, no tabla propia

import { generateObject } from "ai";
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

// un campo obligatorio por fase — a diferencia de un string libre, el modelo
// no puede "olvidarse" de generar el escenario concreto para alguna fase
const QuestionsSchema = z.object({
  intro: z.string(),
  tecnica_1: z.string(),
  tecnica_2: z.string(),
  conductual: z.string(),
  cierre: z.string(),
});

export async function generateBlueprintContent(
  input: z.infer<typeof BlueprintInput>,
): Promise<string> {
  const { trackSlug, jobDescription, candidateExperience } =
    BlueprintInput.parse(input);
  const track = TRACKS.find((t) => t.slug === trackSlug)!;

  const { object: questions } = await generateObject({
    model: BLUEPRINT_MODEL,
    schema: QuestionsSchema,
    temperature: 1,
    prompt: `Escribe UNA pregunta concreta y original por fase para una entrevista técnica de ${track.name}, en español.

Rol de referencia: ${track.roleDescription}
Nivel de experiencia del candidato: ${candidateExperience} años — calibra dificultad y vocabulario a este nivel.
${jobDescription ? `Oferta laboral de referencia (ajusta el rol, no lo reemplaces):\n${jobDescription}` : ""}

Estos son EJEMPLOS de referencia por fase — fijan tono/dificultad, no el escenario exacto. Escribe una pregunta NUEVA y distinta para cada fase, con su propio escenario/tecnología/situación concretos. Nunca repitas ni parafrasees el ejemplo:
${track.guideQuestions.map((q) => `- [${q.phase}] focus "${q.focus}": ${q.question}`).join("\n")}`,
  });

  const guion = track.guideQuestions
    .map((q) => `- Fase ${q.phase}: ${questions[q.phase as keyof typeof questions]}`)
    .join("\n");

  // el resto es idéntico en cada sesión — texto fijo en vez de pedirle al
  // modelo que lo reescriba cada vez (nada que "generar" acá, cero riesgo
  // de que lo omita o lo parafrasee mal)
  return `Identidad del entrevistador: es un experto con años de experiencia real en el rol descrito abajo, y además tiene trayectoria como mentor técnico — paciente, cercano y con buena escucha, pero sin bajar el rigor de la evaluación. No es un examinador frío ni un bot genérico.

Rol de referencia: ${track.roleDescription}
Rúbrica: ${track.rubric}
Nivel de experiencia del candidato: ${candidateExperience} años — calibra la dificultad de las preguntas a este nivel.

Guion de preguntas por fase — haz UNA por fase, en este orden, espera la respuesta del candidato antes de pasar a la siguiente:
${guion}

Restricción crítica: el entrevistador NUNCA evalúa en voz alta ni da feedback durante la llamada — ni tras cada respuesta, ni en un resumen final. Solo hace preguntas, escucha y profundiza si hace falta, y se despide al cerrar. La evaluación (puntajes, fortalezas, áreas de mejora) se genera aparte, después de terminada la sesión, a partir de la transcripción — nunca es tarea del entrevistador en vivo.

Restricciones de estilo por voz:
- Respuestas breves y directas: máximo 2 a 3 frases por turno.
- Formula ÚNICAMENTE UNA PREGUNTA a la vez. Espera la respuesta del candidato antes de continuar.
- Si la respuesta es incompleta o superficial, profundiza con una repregunta antes de avanzar de tema.
- Si el candidato no responde, responde "no sé"/similar, o queda en silencio tres veces seguidas para la misma pregunta (intento original + 2 repreguntas), no insistas más: dilo brevemente ("sigamos con otra pregunta") y avanza a la siguiente pregunta del guion.
- Sin caracteres especiales, símbolos, emojis, listas ni URLs — el motor TTS los lee literal y suena mal.`;
}
