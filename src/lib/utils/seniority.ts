export type SeniorityLevel = "junior" | "mid" | "senior" | "lead" | "principal";

export const SENIORITY_WEIGHTS: Record<SeniorityLevel, number> = {
  junior: 1,
  mid: 2,
  senior: 3,
  lead: 4,
  principal: 5,
};

/**
 * Valida si el seniority del entrevistador es igual o superior al del candidato (domain.md §6.2).
 */
export function isSeniorityAsymmetryValid(
  candidatoSeniority: SeniorityLevel,
  entrevistadorSeniority: SeniorityLevel
): boolean {
  const candidatoWeight = SENIORITY_WEIGHTS[candidatoSeniority] ?? 0;
  const entrevistadorWeight = SENIORITY_WEIGHTS[entrevistadorSeniority] ?? 0;

  return entrevistadorWeight >= candidatoWeight;
}
