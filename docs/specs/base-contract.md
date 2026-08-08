# Base Contract

Dos capas separadas: **contratos** (tipos app/dominio, zod, no todos viven en DB) y **esquema DB** (tablas reales, Drizzle/Supabase). Ver `domain.md` para el porqué de cada decisión, no repetir acá.

---

## 1. Contratos (dominio/app)

### Track — hardcoded, NO es tabla

Set fijo, sin UI de edición (roadmap.md Track A: "seed tracks predeterminados hardcoded/JSON"). Vive en código, no en DB.

```ts
type TrackSlug = 'devops' | 'frontend' | 'backend' | 'data_engineering'
  | 'data_science' | 'software_architect' | 'cloud_engineer' | 'full_stack';

type Track = {
  slug: TrackSlug;
  name: string;
  roleDescription: string; // el "puesto pre cargado" — empresa/rol de referencia (domain.md glosario), default si el candidato no pega su propio JD
  seniorityDefault: 'junior' | 'mid' | 'senior';
  rubric: string;
  guideQuestions: string[];
};
```

domain.md glosario nombra 4 partes de la "forma": rúbrica, **tono**, preguntas guía, empresa/rol de referencia. Tono no tiene campo propio — si hace falta, entra como prosa dentro de `rubric`/`roleDescription`, no separado (MVP, no hay caso que necesite leerlo aparte). Decir si eso no alcanza.

### Blueprint — value object, NO es tabla

1:1 con Session, sin identidad propia, sin ciclo de vida fuera de la fase Configurando (domain.md §5). No `blueprint_id`, no tabla — vive como columnas en `sessions`. **No incluye perfil del candidato** — domain.md: Blueprint "existe independientemente de quién la ejecute" (perfil se usa aparte, para el chequeo de asimetría de seniority — regla 2).

Procedencia de cada campo:

| Campo | De dónde sale |
|---|---|
| `trackSlug` | elegido por el candidato de la lista hardcoded de Tracks |
| `jobDescription` | opcional, texto que el candidato pega/escribe |
| `content` | **generado**, no lo escribe nadie — AI Gateway toma `Track.roleDescription` + `Track.rubric` + `Track.guideQuestions` (seed, hardcoded) + `jobDescription` y devuelve el prompt final |

```ts
// input al AI Gateway
const BlueprintInput = z.object({
  trackSlug: z.enum([...]),           // TrackSlug — elegido por el candidato
  jobDescription: z.string().optional(), // pegado por el candidato, opcional — refina el track, nunca lo reemplaza
});

// output del AI Gateway, esto es lo que se guarda en sessions.blueprint_content
const BlueprintOutput = z.object({
  content: z.string(), // rúbrica + tono + preguntas guía + rol de referencia, merged en un solo prompt = system prompt del agente Vapi. Freeze una vez sale de "configurando"
});
```

### Scorecard — mismo razonamiento que Blueprint, NO es tabla

1:1 con Session, existe ssi la sesión concluyó (domain.md regla 8), nunca se consulta independiente de su sesión. Forma fija — domain.md regla 7: dominio técnico, estructura, comunicación, fortalezas, áreas de mejora.

```ts
const RatingFeedback = z.object({
  rating: z.number().min(1).max(10),
  feedback: z.string(),
});

const ScorecardSchema = z.object({
  technical_knowledge: RatingFeedback,
  answer_structure: RatingFeedback,      // espera estructura STAR
  communication_skill: RatingFeedback,
  strengths: z.string(),
  areas_to_improve: z.string(),
});
```

*(esquema previo tenía `communication_skill` duplicado en vez de fortalezas/áreas de mejora — fix)*

### Portal — canal = `session.id`, mensajes NO se guardan en nuestra DB

Portal (docs.useportal.co) ya persiste mensajes por canal server-side: `useChannel({ channelId, history: N })` hace backfill de los últimos N al conectar, `loadPrevious()` pagina hacia atrás. `channelId` es un string que nosotros elegimos — usamos `session.id` directo, no hace falta columna nueva ni tabla `messages`/`chat`. Reacciones = `send({ ephemeral: true })`, Portal nunca las guarda — matches 1:1 con domain.md (Reacción = "efímera, no se guarda").

Esto resuelve "poder ver mensajes después" (tips/sugerencias post-sesión) sin entidad nueva: el candidato simplemente se une al mismo canal (`session.id`) después de concluida, con `history` backfill Portal le da el log. Gating de **cuándo** puede unirse/leer (nunca en vivo — domain.md regla 5) se hace en el endpoint que emite el JWT de Portal, no en storage.

```ts
// contrato del endpoint que mintea el JWT de Portal — acá se aplica el gating de rol+fase
const PortalAuthPayload = z.object({
  session_id: z.string(), // = channelId en el cliente
  role: z.enum(['candidate', 'interviewer', 'spectator']),
  phase: z.enum(['configurando', 'en_vivo', 'concluida']),
});
```

Eventos que sí son nuestros (no Portal-nativos, van por notificación aparte, no por historial de canal):

```ts
type AppNotification =
  | { type: 'session_started'; sessionId: string }
  | { type: 'session_ended'; sessionId: string }
  | { type: 'scorecard_ready'; sessionId: string };
```

---

## 2. Esquema DB (Drizzle / Supabase)

### users

Perfil público, no auth. Supabase Auth ya maneja email/password — no duplicar acá.

```
id            uuid (FK auth.users)
phone         string
years_of_experience  string  ('1','1+','2','2+','3','3+')
career_path   string  -- TrackSlug validado en app (zod), no enum de DB
skills        string
description   string
```

### sessions

```
id                 uuid
candidate_id       FK users
track_slug         string     -- valida contra TrackSlug (app-level, no FK: Track no es tabla)
job_description    string?    -- input Blueprint
blueprint_content   string    -- output AI Gateway Blueprint-gen (track_slug + job_description → content), freeze cuando state != 'configurando'
state              string  -- 'configurando' | 'en_vivo' | 'concluida', validado en app (zod), no enum de DB
scorecard          jsonb?     -- ScorecardSchema, null hasta 'concluida'
created_at         timestamp
concluded_at       timestamp?
```

### messages / chat — no hay tabla

Ni `Chat` ni `Messages`. Portal ya persiste el historial por canal (ver §1 Portal) — duplicarlo en nuestra DB es la misma data dos veces sin dueño claro. `session.id` es el `channelId`, no hace falta guardar nada nuevo para relacionarlos.

Visibilidad (quién puede *unirse/leer* el canal, domain.md reglas 4-6) se resuelve al mintear el JWT de Portal (rol + phase de `sessions.state`), no con columnas ni queries nuestras.
