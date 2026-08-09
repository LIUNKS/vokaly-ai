// matches base-contract.md §1 Track — hardcoded seed, no es tabla

export type PhaseSlug = "intro" | "tecnica_1" | "tecnica_2" | "conductual" | "cierre";

// pacing de los 10 min, compartido entre tracks — no se repite por track
export const PHASES: { slug: PhaseSlug; name: string; minutes: number }[] = [
  { slug: "intro", name: "Introducción", minutes: 1 },
  { slug: "tecnica_1", name: "Técnica — conceptual", minutes: 3 },
  { slug: "tecnica_2", name: "Técnica — aplicada", minutes: 3 },
  { slug: "conductual", name: "Conductual (STAR)", minutes: 2 },
  { slug: "cierre", name: "Cierre", minutes: 1 },
];

export type Track = {
  slug: string;
  name: string;
  empresaRef: string; // empresa real de referencia para el rol — no viene de una JD real, es solo ambientación
  roleDescription: string;
  rubric: string;
  guideQuestions: { phase: PhaseSlug; question: string; focus: string }[];
};

export const TRACKS: Track[] = [
  {
    slug: "backend",
    name: "Backend",
    empresaRef: "Stripe",
    roleDescription:
      "Ingeniero de Software Backend en una empresa de producto SaaS de tamaño medio — responsable de APIs, lógica de negocio y persistencia de datos.",
    rubric:
      "Evaluar razonamiento algorítmico, diseño de APIs y datos, manejo de casos límite y claridad al comunicar trade-offs. Tono profesional y directo.",
    guideQuestions: [
      { phase: "intro", question: "Cuéntame brevemente tu experiencia y en qué stack backend te sientes más cómodo.", focus: "contexto" },
      { phase: "tecnica_1", question: "¿Cómo diseñarías el modelo de datos para un sistema de reservas con alta concurrencia?", focus: "diseño de datos y concurrencia" },
      { phase: "tecnica_2", question: "Un endpoint empezó a responder lento bajo carga. ¿Cómo lo investigas?", focus: "debugging y rendimiento" },
      { phase: "conductual", question: "Cuéntame de una decisión técnica difícil que tomaste y qué aprendiste.", focus: "STAR" },
      { phase: "cierre", question: "¿Qué preguntas tienes sobre el rol?", focus: "cierre" },
    ],
  },
  {
    slug: "frontend",
    name: "Frontend",
    empresaRef: "Airbnb",
    roleDescription:
      "Frontend Engineer en un equipo de producto, dueño de la experiencia de usuario en una app web de uso diario.",
    rubric:
      "Evaluar manejo de estado, performance de render, accesibilidad y testing. Comunicación clara del trade-off UX vs complejidad.",
    guideQuestions: [
      { phase: "intro", question: "Cuéntame tu experiencia con frameworks frontend y qué proyecto te marcó más.", focus: "contexto" },
      { phase: "tecnica_1", question: "¿Cómo evitarías re-renders innecesarios en una lista grande que actualiza seguido?", focus: "estado y rendimiento" },
      { phase: "tecnica_2", question: "Un usuario reporta que la página tarda en cargar en 3G. ¿Por dónde empiezas a diagnosticar?", focus: "debugging y rendimiento" },
      { phase: "conductual", question: "Cuéntame de un conflicto de diseño con un compañero de equipo y cómo lo resolviste.", focus: "STAR" },
      { phase: "cierre", question: "¿Preguntas para mí sobre el equipo o el producto?", focus: "cierre" },
    ],
  },
  {
    slug: "data_engineering",
    name: "Data Engineering",
    empresaRef: "Netflix",
    roleDescription:
      "Data Engineer responsable de pipelines de ingesta y transformación para analítica interna.",
    rubric:
      "Evaluar dominio de SQL, diseño de pipelines, calidad de datos y justificación de decisiones de arquitectura de datos.",
    guideQuestions: [
      { phase: "intro", question: "Cuéntame tu experiencia con pipelines de datos y qué herramientas usas normalmente.", focus: "contexto" },
      { phase: "tecnica_1", question: "Describe una consulta para encontrar los top 3 clientes por mes usando window functions.", focus: "SQL" },
      { phase: "tecnica_2", question: "Un pipeline empezó a fallar silenciosamente y los datos llegan incompletos. ¿Cómo lo detectas y corriges?", focus: "calidad de datos y debugging" },
      { phase: "conductual", question: "Cuéntame de una vez que tuviste que justificar una decisión de arquitectura de datos ante el equipo.", focus: "STAR" },
      { phase: "cierre", question: "¿Qué preguntas tienes sobre el volumen o la stack de datos del equipo?", focus: "cierre" },
    ],
  },
  {
    slug: "data_science",
    name: "Data Science",
    empresaRef: "Google",
    roleDescription: "Data Scientist o ML Engineer trabajando en modelos predictivos para producto.",
    rubric:
      "Evaluar comprensión estadística, diseño de experimentos, criterio de modelado y comunicación de resultados a no-técnicos.",
    guideQuestions: [
      { phase: "intro", question: "Cuéntame tu experiencia con modelos de ML y en qué problema aplicaste alguno recientemente.", focus: "contexto" },
      { phase: "tecnica_1", question: "¿Cómo diseñarías un experimento controlado para validar un cambio de recomendación de producto?", focus: "diseño de experimentos" },
      { phase: "tecnica_2", question: "Tu modelo tiene buena métrica offline pero mal desempeño en producción. ¿Qué investigas primero?", focus: "debugging de modelos" },
      { phase: "conductual", question: "Cuéntame de una vez que tuviste que explicar un resultado técnico a alguien no técnico.", focus: "STAR" },
      { phase: "cierre", question: "¿Preguntas sobre los datos o el problema de negocio del equipo?", focus: "cierre" },
    ],
  },
  {
    slug: "cloud_engineer",
    name: "Cloud Engineer",
    empresaRef: "AWS",
    roleDescription: "Cloud Engineer a cargo de la infraestructura y confiabilidad de servicios en la nube.",
    rubric:
      "Evaluar conocimiento de servicios cloud, diseño para alta disponibilidad, seguridad básica y capacidad de troubleshooting.",
    guideQuestions: [
      { phase: "intro", question: "Cuéntame tu experiencia con proveedores cloud (AWS, GCP o Azure) y qué herramientas de IaC usas.", focus: "contexto" },
      { phase: "tecnica_1", question: "¿Cómo diseñarías la infraestructura para un servicio con picos de tráfico impredecibles?", focus: "diseño de infraestructura" },
      { phase: "tecnica_2", question: "Un servicio empezó a devolver errores 5xx intermitentes. ¿Cómo lo diagnosticas?", focus: "troubleshooting" },
      { phase: "conductual", question: "Cuéntame de un incidente de producción que manejaste y qué cambiaste después.", focus: "STAR" },
      { phase: "cierre", question: "¿Preguntas sobre la infraestructura actual del equipo?", focus: "cierre" },
    ],
  },
  {
    slug: "devops",
    name: "DevOps",
    empresaRef: "GitLab",
    roleDescription: "DevOps Engineer responsable de integración y despliegue continuos, automatización de despliegues y observabilidad.",
    rubric:
      "Evaluar diseño de pipelines de integración y despliegue continuos, automatización, prácticas de monitoreo y mentalidad de confiabilidad.",
    guideQuestions: [
      { phase: "intro", question: "Cuéntame tu experiencia con pipelines de integración y despliegue continuos y qué herramientas usas normalmente.", focus: "contexto" },
      { phase: "tecnica_1", question: "¿Cómo diseñarías un pipeline de despliegue con rollback automático?", focus: "integración y despliegue continuos" },
      { phase: "tecnica_2", question: "Un despliegue rompió producción y las alertas tardaron en avisar. ¿Qué cambiarías?", focus: "observabilidad" },
      { phase: "conductual", question: "Cuéntame de una vez que automatizaste algo manual y qué impacto tuvo.", focus: "STAR" },
      { phase: "cierre", question: "¿Preguntas sobre el proceso de despliegue del equipo?", focus: "cierre" },
    ],
  },
  {
    slug: "software_architect",
    name: "Software Architect",
    empresaRef: "Amazon",
    roleDescription: "Software Architect responsable del diseño técnico de alto nivel de un sistema en crecimiento.",
    rubric:
      "Evaluar levantamiento de requisitos, trade-offs arquitectónicos (escalabilidad, costo, consistencia) y claridad al justificar decisiones.",
    guideQuestions: [
      { phase: "intro", question: "Cuéntame tu experiencia liderando decisiones de arquitectura en proyectos anteriores.", focus: "contexto" },
      { phase: "tecnica_1", question: "Diseña a alto nivel un sistema de notificaciones que soporte millones de usuarios. ¿Por dónde empiezas?", focus: "diseño de sistemas" },
      { phase: "tecnica_2", question: "¿Qué trade-offs considerarías entre consistencia y disponibilidad para ese sistema?", focus: "trade-offs" },
      { phase: "conductual", question: "Cuéntame de una vez que tuviste que convencer al equipo de una decisión de arquitectura impopular.", focus: "STAR" },
      { phase: "cierre", question: "¿Preguntas sobre el sistema actual o sus restricciones?", focus: "cierre" },
    ],
  },
  {
    slug: "full_stack",
    name: "Full Stack",
    empresaRef: "Shopify",
    roleDescription: "Full Stack Engineer que trabaja tanto en frontend como backend de un producto chico.",
    rubric:
      "Evaluar versatilidad entre frontend y backend, criterio para priorizar y claridad de comunicación end-to-end.",
    guideQuestions: [
      { phase: "intro", question: "Cuéntame tu experiencia trabajando en frontend y backend, ¿en qué te sientes más fuerte?", focus: "contexto" },
      { phase: "tecnica_1", question: "¿Cómo diseñarías el flujo completo (API + UI) para que un usuario suba y vea el estado de un archivo?", focus: "diseño end-to-end" },
      { phase: "tecnica_2", question: "Un bug end-to-end solo aparece en producción. ¿Cómo lo aislas entre frontend y backend?", focus: "debugging" },
      { phase: "conductual", question: "Cuéntame de una vez que tuviste que priorizar entre trabajo de frontend y backend con tiempo limitado.", focus: "STAR" },
      { phase: "cierre", question: "¿Preguntas sobre el stack completo del producto?", focus: "cierre" },
    ],
  },
];

export type TrackSlug = (typeof TRACKS)[number]["slug"];
