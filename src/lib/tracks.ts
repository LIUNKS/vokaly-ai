// slugs match base-contract.md TrackSlug — full Track (rubric/guideQuestions/etc) is Blueprint-gen's job, not this form's
export const TRACKS = [
  { slug: "devops", label: "DevOps" },
  { slug: "frontend", label: "Frontend" },
  { slug: "backend", label: "Backend" },
  { slug: "data_engineering", label: "Data Engineering" },
  { slug: "data_science", label: "Data Science" },
  { slug: "software_architect", label: "Software Architect" },
  { slug: "cloud_engineer", label: "Cloud Engineer" },
  { slug: "full_stack", label: "Full Stack" },
] as const;

export type TrackSlug = (typeof TRACKS)[number]["slug"];
