import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase"; // tabla auth.users ya existe (Supabase Auth) — solo referenciamos su PK, no la manejamos

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  fullName: text("full_name"),
  nickname: text("nickname"), // usado en salas de chat
  phone: text("phone"),
  yearsOfExperience: text("years_of_experience"), // '1' | '1+' | '2' | '2+' | '3' | '3+', validado en app
  careerPath: text("career_path"), // TrackSlug, validado en app (zod) — no enum de DB
  skills: text("skills"),
  description: text("description"),
}).enableRLS(); // sin policies = deny-all para anon/authenticated vía PostgREST; backend usa el rol postgres (bypassa RLS)

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  trackSlug: text("track_slug").notNull(), // TrackSlug, validado en app — Track no es tabla
  jobDescription: text("job_description"),
  blueprintContent: text("blueprint_content"), // output AI Gateway Blueprint-gen, freeze cuando state != 'configurando'
  state: text("state").notNull().default("configurando"), // 'configurando' | 'en_vivo' | 'concluida', validado en app (zod)
  vapiCallId: text("vapi_call_id"), // ID exacto de la llamada en Vapi API
  transcript: text("transcript"), // Transcripción completa de la llamada de esta sesión
  scorecard: jsonb("scorecard"), // ScorecardSchema, null hasta 'concluida'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  concludedAt: timestamp("concluded_at", { withTimezone: true }),
}).enableRLS();
