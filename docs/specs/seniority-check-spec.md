# Vokaly Prep — Especificación de Asimetría de Seniority (`seniority-check-spec.md`)

**Documento:** Seniority Asymmetry Spec
**Propósito:** Definir la regla de negocio y algoritmo de validación de asimetría de experiencia entre el Entrevistador y el Candidato (`domain.md §6.2`).

---

## 1. Regla de Negocio (`domain.md §6.2`)

> *"El nivel de experiencia del Entrevistador (IA o Humano) debe ser igual o superior al del Candidato. Nunca al revés."*

Esta regla pertenece al área de Configuración de Entrevista y debe validarse en el servidor **antes** de que la `Sesión` pase a existir o cambie de estado a `en_vivo`.

---

## 2. Jerarquía de Seniority

La escala ordinal de niveles de experiencia es la siguiente (de menor a mayor):

| Valor Enum | Peso Numérico (`rank`) |
|---|---|
| `junior` | 1 |
| `mid` | 2 |
| `senior` | 3 |
| `lead` | 4 |
| `principal` | 5 |

---

## 3. Algoritmo de Validación (`src/lib/utils/seniority.ts`)

```typescript
export type SeniorityLevel = "junior" | "mid" | "senior" | "lead" | "principal";

export const SENIORITY_WEIGHTS: Record<SeniorityLevel, number> = {
  junior: 1,
  mid: 2,
  senior: 3,
  lead: 4,
  principal: 5,
};

/**
 * Valida si el seniority del entrevistador es válido frente al candidato.
 * Regla: Seniority(Entrevistador) >= Seniority(Candidato)
 */
export function isSeniorityAsymmetryValid(
  candidatoSeniority: SeniorityLevel,
  entrevistadorSeniority: SeniorityLevel
): boolean {
  const candidatoWeight = SENIORITY_WEIGHTS[candidatoSeniority] ?? 0;
  const entrevistadorWeight = SENIORITY_WEIGHTS[entrevistadorSeniority] ?? 0;
  
  return entrevistadorWeight >= candidatoWeight;
}
```

---

## 4. Puntos de Aplicación

1. **Al Crear la Sesión (API Server Action / Endpoint):**
   Si `isSeniorityAsymmetryValid(candidato.seniority, blueprint.seniorityExigido)` devuelve `false`, se rechaza la creación de la sesión con código HTTP 400 (`"El nivel del entrevistador debe ser igual o superior al del candidato"`).
2. **AI Gateway Prompting (Track A):**
   El prompt del sistema inyectará al menos el seniority del candidato para forzar que el agente adopte la postura de evaluador de mayor rango.
