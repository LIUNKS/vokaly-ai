import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserSessionsAction } from "@/app/(app)/sesion/actions";
import { HistorialClient } from "./historial-client";

export default async function HistorialPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Obtenemos los datos de seniority del candidato
  const [profile] = await db
    .select({ yearsOfExperience: users.yearsOfExperience })
    .from(users)
    .where(eq(users.id, user.id));

  // Cargar historial de sesiones del usuario
  const sessions = await getUserSessionsAction();

  const seniority = profile?.yearsOfExperience
    ? `${profile.yearsOfExperience} años`
    : "Senior";

  return <HistorialClient initialSessions={sessions} userSeniority={seniority} />;
}
