# Vokaly Prep — Roadmap MVP (hackathon, 3 devs)

**Propósito:** tracking de tareas para build en paralelo. Ver `domain.md` (modelo) y `stack.md` (stack) para contexto — no repetir acá.

---

## Día 0 — Contratos (los 3, ~1h, bloquea todo lo demás)

- [ ] tipo `Candidato` (perfil: especialidad, nivel de experiencia, objetivo profesional)
- [ ] tipo `Blueprint` (zod)
- [ ] tipo `Sesion` + enum estado (Configurando/En Vivo/Concluida)
- [ ] tipo `Scorecard` (campos fijos, domain.md §6.7)
- [ ] payload canal Portal / JWT (session_id, rol, fase)
- [ ] schema Drizzle (tablas base: candidato, track, blueprint, sesion, scorecard)

---

## Track A — Dev ___ — Auth/Perfil + Blueprint + Scorecard (4.1 + 4.4)

- [x] Supabase Auth (login candidato)
- [x] form perfil candidato (especialidad, nivel, objetivo) — input directo de Blueprint gen
- [x] seed tracks predeterminados (hardcoded/JSON)
- [x] página iniciar sesión (elegir track, pegar JD opcional, dispara Blueprint gen)
- [x] Blueprint gen vía AI Gateway (track + JD opcional → Blueprint)
- [ ] mock transcript (string, forma de contrato Día 0) → no esperar webhook real de B
- [ ] Scorecard gen vía AI Gateway (transcript → Scorecard)
- [ ] trigger sesión-concluida → Scorecard (mock hasta integración)
- [ ] página resultado (muestra Scorecard)

## Track B — Dev ___ — Sesión en Vivo (4.2) — ruta crítica

- [ ] mock perfil candidato (seniority, forma de contrato Día 0) → no esperar form real de A
- [ ] mock Blueprint content (string, forma de contrato Día 0) → no esperar Blueprint gen real de A
- [ ] Vapi call setup
- [ ] página sesión en vivo (host del widget Vapi, estado de la llamada)
- [ ] webhook route + validación zod (trust boundary)
- [ ] máquina de estados Configurando → En Vivo → Concluida
- [ ] chequeo asimetría seniority al crear sesión

## Track C — Dev ___ — Capa Social (4.3)

- [ ] mock session_id + phase (forma de contrato Día 0) → no esperar máquina de estados real de B
- [ ] canal Portal por sesión
- [ ] JWT scoping (sesión+rol+fase)
- [ ] Espectador join/leave UI
- [ ] Reacciones (universal, sin gating)
- [ ] Chat + reglas de visibilidad (candidato nunca ve chat en vivo, IA no participa)
- [ ] página mensajes post-sesión (candidato rejoin canal `session.id`, history backfill Portal — tips/sugerencias)

---

## Integración (después de los 3 tracks)

- [ ] B → A: sesión concluida dispara Scorecard real (reemplaza mock)
- [ ] B → C: session_id/rol real reemplaza mock
- [ ] correr flujo end-to-end (privado, solo candidato)

## Hardening demo

- [ ] UI polish (shadcn)
- [ ] estados de error (webhook, AI Gateway)
- [ ] Storage: copiar grabación Vapi

## Fuera de alcance

Ya excluido en `stack.md` §Pendiente — no re-litigar: monitoring, rate-limiting, cost modeling, rama Entrevistador Humano.
