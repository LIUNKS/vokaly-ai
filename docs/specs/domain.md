# Vokaly Prep — Domain Model

**Documento:** Base Domain Spec (mental model, no implementación)
**Propósito:** definir los conceptos, actores, ciclos de vida y reglas del dominio de forma independiente de stack técnico, UI o alcance de una entrega puntual (hackathon u otra). Decisiones de "qué se construye primero" no viven en este documento.

---

## 1. Propósito del Dominio

Vokaly Prep modela **la práctica de entrevistas de trabajo como una sesión evaluada, en vivo, con audiencia opcional**. El dominio existe para responder tres preguntas: ¿quién entrevista a quién y con qué nivel de exigencia?, ¿quién puede ver/participar en qué momento de la sesión?, y ¿cómo se convierte una conversación en una evaluación comparable?

---

## 2. Conceptos Centrales (glosario)

| Concepto | Definición |
|---|---|
| **Candidato** | Persona que practica una entrevista. Tiene un perfil: especialidad, nivel de experiencia actual, objetivo profesional. |
| **Entrevistador** | Rol que conduce la entrevista. Puede ser encarnado por una **IA** o por un **Humano**. No es una identidad fija, es un rol asignado a una sesión. |
| **Blueprint de Entrevista** | La "forma" de la entrevista: rúbrica, tono, preguntas guía, empresa/rol de referencia. Existe independientemente de quién la ejecute. Se compone de un **track predeterminado** (obligatorio — todo Blueprint parte de uno, nunca está vacío) refinado opcionalmente por una **oferta laboral (JD)** que el candidato provee — el JD ajusta la rúbrica, no la reemplaza. |
| **Sesión** | Una ocurrencia concreta de una entrevista: un candidato, un entrevistador, un blueprint, en un momento dado. Es lo que tiene ciclo de vida. |
| **Visibilidad de Sesión** | Atributo de la sesión: **Privada** (solo participantes) o **Pública** (admite audiencia). |
| **Espectador** | Persona que observa una sesión pública sin ser participante. No entrevista ni es entrevistado. |
| **Reacción** | Señal efímera, no textual, emitida por cualquier persona presente en una sesión pública. No es un mensaje, es un pulso de sentimiento colectivo. |
| **Canal de Chat** | Espacio de mensajes de texto asociado a una sesión pública. Su visibilidad depende de rol + modo + fase de la sesión (ver §6). |
| **Scorecard** | Artefacto de evaluación generado al concluir una sesión. Vinculado 1:1 a una sesión. Tiene forma fija (mismos campos siempre), no es un texto libre. |

---

## 3. Actores

- **Candidato** — el sujeto evaluado. Siempre presente en toda sesión.
- **Entrevistador IA** — actor sintético que asume un blueprint y un nivel de seniority.
- **Entrevistador Humano** — par que asume el rol de entrevistador en una sesión humano-humano.
- **Espectador** — actor pasivo/semi-activo (puede reaccionar y, según reglas, chatear) que no altera el resultado evaluado de la sesión.

Un mismo usuario puede ocupar distintos actores en distintas sesiones (candidato hoy, entrevistador humano mañana), pero **nunca dos roles a la vez dentro de la misma sesión**.

---

## 4. Sub-dominios (bounded scopes)

El dominio se divide en cuatro áreas de responsabilidad conceptual. Cada una tiene su propio vocabulario y reglas; se comunican solo a través de la **Sesión**.

### 4.1 Configuración de Entrevista
Responde: *¿qué se va a preguntar y con qué exigencia?*
Entrada: perfil del candidato + track predeterminado (obligatorio) + oferta laboral (opcional, refina el track).
Salida: un Blueprint válido, listo para instanciar una Sesión. Un track sin JD ya es un Blueprint completo; un JD nunca aparece solo.
No sabe nada de audiencia, chat ni scorecard.

### 4.2 Sesión en Vivo
Responde: *¿qué está pasando ahora mismo entre candidato y entrevistador?*
Dueño del ciclo de vida de la Sesión (§5). Es el único sub-dominio que conecta con Configuración (consume un Blueprint) y con Evaluación (produce el input del Scorecard).

### 4.3 Capa Social / Audiencia
Responde: *¿quién más está mirando, y qué puede ver o decir?*
Dueño de Espectador, Reacción, Canal de Chat y las reglas de visibilidad. Es un anexo opcional a la Sesión — una Sesión Privada no lo activa.

### 4.4 Evaluación
Responde: *¿cómo salió, en términos comparables?*
Dueño del Scorecard. Consume la transcripción/resultado de la Sesión, no interactúa con Configuración ni con la Capa Social directamente.

```
Configuración ──(Blueprint)──▶ Sesión en Vivo ──(resultado)──▶ Evaluación
                                     │
                                     ▼
                              Capa Social (opcional)
```

---

## 5. Ciclo de Vida de una Sesión

```
[Configurando] → [En Vivo] → [Concluida]
```

- **Configurando:** el Blueprint se fija. Una vez que la sesión pasa a "En Vivo", el Blueprint es inmutable para esa sesión.
- **En Vivo:** candidato y entrevistador interactúan. Si es pública, Espectadores pueden unirse y salir libremente sin afectar el estado de la sesión.
- **Concluida:** la sesión termina (cuelgue de llamada). Dispara la generación del Scorecard. El Canal de Chat cambia de fase (ver §6) pero la sesión en sí ya no cambia de estado.

Una sesión concluida es inmutable: no se reabre, no se edita. Una nueva práctica es siempre una nueva Sesión, nunca una continuación.

---

## 6. Reglas e Invariantes del Dominio

1. **El Blueprint nunca está vacío:** el track predeterminado es la base obligatoria; la oferta laboral (JD) es una capa opcional que ajusta esa base, nunca la sustituye. Un track sin JD es un Blueprint válido; un JD sin track no existe como concepto de dominio.
2. **Asimetría de seniority:** el nivel de experiencia del Entrevistador (IA o Humano) debe ser igual o superior al del Candidato. Nunca al revés. Esta regla pertenece a Configuración, se resuelve antes de que la Sesión exista.
3. **Las Reacciones son universales:** cualquier persona presente en una Sesión Pública —candidato, entrevistador, espectador— puede emitir y ver Reacciones, sin excepción. No hay ninguna fase o rol que las oculte.
4. **La visibilidad del Chat depende de tres ejes, no de uno solo:** rol (candidato / entrevistador / espectador), tipo de sesión (IA-Humano / Humano-Humano) y fase (en vivo / concluida). El mismo rol puede ver el chat en un tipo de sesión y no en otro.
5. **El Candidato nunca ve el chat en vivo mientras es evaluado**, independientemente de si el entrevistador es IA o Humano — es una invariante de la Capa Social pensada para proteger la evaluación, no una preferencia de UI.
6. **El Entrevistador Humano sí ve el chat en vivo; el Entrevistador IA no interactúa con la Capa Social en absoluto** — su único input es la conversación de la Sesión. (Rama del Entrevistador Humano inactiva en el MVP del hackathon — el rol existe en el dominio pero no se instancia hasta que se construya el modo Humano vs. Humano, fuera del MVP actual.)
7. **Un Scorecard tiene forma fija:** el conjunto de campos que evalúa (dominio técnico, estructura de respuesta, claridad, fortalezas, áreas de mejora) es el mismo para toda sesión, para que dos scorecards sean comparables entre sí.
8. **Un Scorecard existe si y solo si una Sesión concluyó.** No hay evaluación parcial ni scorecard especulativo antes del cierre.
9. **La Capa Social es completamente opcional y no autoritativa:** ninguna Reacción, mensaje de chat o cantidad de Espectadores altera el Blueprint, el resultado de la Sesión o el contenido del Scorecard.

---

## 7. No-Objetivos de Este Documento

Este documento describe el **modelo mental**, no la construcción. Explícitamente fuera de alcance aquí:

- Stack técnico, protocolos de transporte, proveedores de IA o voz.
- Qué modos/entidades se construyen primero (alcance de entrega, no de dominio).
- Diseño de UI, esquemas de base de datos, contratos de API.
- Métricas de negocio y KPIs.
