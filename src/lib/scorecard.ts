// genera ScorecardData (src/components/scorecard-view.tsx) a partir del transcript — mismo approach que blueprint.ts

import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { TRACKS } from "@/lib/tracks";

const SCORECARD_MODEL = groq("openai/gpt-oss-120b");

const RatingFeedback = z.object({
  rating: z.number().min(1).max(10),
  feedback: z.string(),
});

export const ScorecardSchema = z.object({
  globalScore: z.number().min(1).max(100),
  technicalKnowledge: RatingFeedback,
  answerStructure: RatingFeedback, // espera estructura STAR
  communicationSkill: RatingFeedback,
  strengths: z.array(z.string()),
  areasToImprove: z.array(z.string()),
  executiveSummary: z.string(),
});

export async function generateScorecard(input: {
  transcript: string;
  trackSlug: string;
}): Promise<z.infer<typeof ScorecardSchema>> {
  const track = TRACKS.find((t) => t.slug === input.trackSlug);
  const trackName = track?.name || input.trackSlug;

  const { object } = await generateObject({
    model: SCORECARD_MODEL,
    schema: ScorecardSchema,
    prompt: `Evalúa esta transcripción de entrevista técnica para el rol "${trackName}" y devuelve un scorecard.

Rúbrica del track: ${track?.rubric || "N/A"}

Criterios (base-contract.md):
- technicalKnowledge: dominio técnico del área evaluada.
- answerStructure: qué tan estructuradas están las respuestas (espera método STAR en preguntas conductuales).
- communicationSkill: claridad, fluidez y vocabulario técnico.
- strengths / areasToImprove: puntos concretos observados en la transcripción, no genéricos.
- globalScore: 1-100, combinación ponderada de los tres ratings anteriores.
- executiveSummary: 2-3 frases resumiendo el desempeño general.

Transcripción:
${input.transcript}`,
  });

  return object;
}
