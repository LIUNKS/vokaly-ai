import { VapiSessionConfig } from "@/types/vapi";

export interface CandidatoMock {
  id: string;
  userId: string;
  nombre: string;
  especialidad: string;
  seniority: "junior" | "mid" | "senior" | "lead" | "principal";
  objetivoProfesional: string;
}

export const CANDIDATO_MOCK: CandidatoMock = {
  id: "cnd-1234-5678",
  userId: "usr-1234-5678",
  nombre: "Johan",
  especialidad: "Frontend Development",
  seniority: "senior",
  objetivoProfesional: "Preparar entrevistas para roles de Senior Frontend Engineer en empresas Tech global.",
};

export interface BlueprintMock {
  id: string;
  trackSlug: string;
  trackNombre: string;
  empresaRolRef: string;
  seniorityExigido: "junior" | "mid" | "senior" | "lead" | "principal";
  instruccionesVapi: string;
  preguntasGuia: string[];
  rubrica: Array<{ nombre: string; descripcion: string; peso: number }>;
}

export const BLUEPRINT_MOCK: BlueprintMock = {
  id: "blp-9876-5432",
  trackSlug: "frontend",
  trackNombre: "Frontend React Developer",
  empresaRolRef: "Tech Corp",
  seniorityExigido: "senior",
  instruccionesVapi: `Eres un Entrevistador Técnico Senior especialista en Frontend React.
Tu objetivo es evaluar a Johan para la posición de Senior Frontend Developer.
Haz 1 pregunta a la vez sobre React Server Components, State Management y Rendimiento Web.
Mantén respuestas breves (máximo 3 frases) y tono profesional.`,
  preguntasGuia: [
    "¿Cómo funcionan los React Server Components y qué problema resuelven?",
    "Explicar una arquitectura de manejo de estado en aplicaciones complejas.",
    "¿Qué estrategias usas para optimizar el Core Web Vitals (INP/LCP)?",
  ],
  rubrica: [
    { nombre: "Dominio Técnico", descripcion: "Conocimiento en React 19 y Next.js App Router", peso: 0.4 },
    { nombre: "Estructura de Respuesta", descripcion: "Claridad en respuestas usando formato STAR", peso: 0.3 },
    { nombre: "Comunicación", descripcion: "Concisión y capacidad de explicación técnica", peso: 0.3 },
  ],
};

export interface VapiMockSession {
  sessionId: string;
  candidatoNombre: string;
  trackSlug: string;
  trackNombre: string;
  empresaRef: string;
  seniorityCandidato: string;
  config: VapiSessionConfig;
}

export const VAPI_SESSION_MOCK: VapiMockSession = {
  sessionId: "b4e2d3c4-1234-5678-9abc-def123456789",
  candidatoNombre: CANDIDATO_MOCK.nombre,
  trackSlug: BLUEPRINT_MOCK.trackSlug,
  trackNombre: BLUEPRINT_MOCK.trackNombre,
  empresaRef: BLUEPRINT_MOCK.empresaRolRef,
  seniorityCandidato: CANDIDATO_MOCK.seniority,
  config: {
    firstMessage: `Hola ${CANDIDATO_MOCK.nombre}, bienvenido/a a tu sesión de práctica para la posición de ${BLUEPRINT_MOCK.trackNombre} en ${BLUEPRINT_MOCK.empresaRolRef}. Soy tu entrevistador/a hoy. ¿Listo/a para comenzar?`,
    systemPrompt: BLUEPRINT_MOCK.instruccionesVapi,
    variableValues: {
      first_message: `Hola ${CANDIDATO_MOCK.nombre}, bienvenido/a a tu sesión de práctica para la posición de ${BLUEPRINT_MOCK.trackNombre} en ${BLUEPRINT_MOCK.empresaRolRef}. Soy tu entrevistador/a hoy. ¿Listo/a para comenzar?`,
      blueprint_content: BLUEPRINT_MOCK.instruccionesVapi,
    },
    metadata: {
      sessionId: "b4e2d3c4-1234-5678-9abc-def123456789",
      candidatoId: CANDIDATO_MOCK.id,
      trackSlug: BLUEPRINT_MOCK.trackSlug,
    },
  },
};

export interface PortalAuthMock {
  sessionId: string;
  role: "candidate" | "interviewer" | "spectator";
  phase: "configurando" | "en_vivo" | "concluida";
  token: string;
}

export const PORTAL_AUTH_MOCK: PortalAuthMock = {
  sessionId: VAPI_SESSION_MOCK.sessionId,
  role: "candidate",
  phase: "en_vivo",
  token: "mock-portal-jwt-token-123456",
};
