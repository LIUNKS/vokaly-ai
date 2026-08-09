"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { TRACKS } from "@/lib/tracks";
import { generateBlueprint } from "@/lib/blueprint";

export async function crearSesion(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const trackSlug = formData.get("trackSlug") as string;
  const jobDescription = (formData.get("jobDescription") as string) || undefined;

  if (!TRACKS.some((t) => t.slug === trackSlug)) {
    redirect("/nueva-sesion?error=Elige una especialidad válida");
  }

  const [profile] = await db
    .select({ yearsOfExperience: users.yearsOfExperience })
    .from(users)
    .where(eq(users.id, user.id));
  if (!profile?.yearsOfExperience) redirect("/profile");

  const blueprintContent = await generateBlueprint({
    trackSlug,
    jobDescription,
    candidateExperience: profile.yearsOfExperience,
  });

  const [session] = await db
    .insert(sessions)
    .values({
      candidateId: user.id,
      trackSlug,
      jobDescription: jobDescription ?? null,
      blueprintContent,
    })
    .returning({ id: sessions.id });

  redirect(`/nueva-sesion/${session.id}`);
}
