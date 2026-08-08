# Vokaly Prep — Estrategia de Entrevista (por qué 10 min, por qué esa estructura)

**Propósito:** justificar el diseño de sesión usado en `PHASES`/`guideQuestions` (`src/lib/tracks.ts`, contrato en `base-contract.md`) para que no se reabra sin motivo. Ver `domain.md` (modelo) — acá solo el *por qué*.

## Por qué 10 minutos

MVP de hackathon: una sesión de **práctica**, no un proceso de contratación real. El objetivo es dar señal útil rápido, no simular semanas de proceso. 10 min alcanza para 2 preguntas técnicas + 1 conductual con espacio de intro/cierre — suficiente para poblar las 5 dimensiones fijas del Scorecard (dominio técnico, estructura, comunicación, fortalezas, áreas de mejora) sin que el candidato tenga que reservar media hora para practicar.

## Por qué esa estructura (intro → técnica 1 → técnica 2 → conductual → cierre)

Es la versión condensada del patrón que se repite entrevista tras entrevista en la industria — comprimido a una sola sesión en vez de repartido en varias rondas con distintos entrevistadores:

- **Intro corta (1 min):** casi todo proceso arranca con contexto/motivación antes de lo técnico (el "screening" inicial). Acá es una fase, no una ronda separada de 15-30 min.
- **Dos preguntas técnicas (conceptual → aplicada/debugging):** refleja la separación típica entre "fundamentos" y "resolución de un problema real" que aparece en la mayoría de procesos técnicos. No llega a separar coding de system design como rondas independientes de 45-60 min — eso lo hacen las empresas grandes porque tienen tiempo y varios entrevistadores; no tiene sentido para una práctica de 10 min con un solo interlocutor.
- **1 pregunta conductual (STAR):** casi toda empresa evalúa esto en algún punto. Situación/Tarea/Acción/Resultado es el framework más repetido para estructurar la respuesta — no es específico de una empresa, es genérico y por eso vive en la rúbrica del Scorecard (`answer_structure` "espera estructura STAR").
- **Cierre (1 min):** espacio para que el candidato pregunte — práctica estándar en toda entrevista real, señal de interés más que parte evaluada.

## ¿La mayoría de empresas sigue este orden?

Sí, en términos generales: filtro/contexto → técnica → conductual → decisión aparece, con distintos nombres, en prácticamente toda empresa grande o mediana. Lo que varía es la **escala**, no el orden:

- Empresas grandes separan cada tipo de pregunta en una ronda propia de 45-60 min con un entrevistador distinto (a veces 4-7 rondas a lo largo de semanas, con comité de decisión al final).
- Empresas medianas comprimen más — menos rondas, a veces una sola persona cubre varias competencias — pero mantienen el mismo orden general.

Acá comprimimos un paso más: todo en una sola sesión de 10 min, un solo entrevistador (IA). Tiene sentido porque el objetivo no es decidir una contratación sino dar práctica y feedback rápido — no reemplaza el proceso real, lo simula en miniatura.

## Qué NO estamos modelando (a propósito)

- **Rondas separadas por competencia** (system design como ronda propia, "bar raiser", comité de hiring) — no aplica a una sesión de práctica individual con un solo entrevistador.
- **Estructura distinta por seniority** (más rondas de diseño para senior) — el candidato ya trae su nivel real (`years_of_experience`) y Blueprint-gen calibra la *dificultad* de las mismas 5 preguntas, no agrega fases nuevas. Ver nota sobre `seniorityDefault` en `base-contract.md`.
- **Live coding real** (pizarra/editor compartido) — fuera de alcance del MVP, la sesión es por voz (Vapi), sin editor de código compartido.

Cambiar duración/estructura = editar `PHASES` en `tracks.ts` (un solo lugar, todos los tracks lo comparten). No reabrir esto salvo que cambie el objetivo del producto (de práctica rápida a simulación de proceso completo).
