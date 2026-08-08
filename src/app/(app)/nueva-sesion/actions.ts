"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { TRACKS } from "@/lib/tracks";

export async function crearSesion(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const trackSlug = formData.get("trackSlug") as string;
  const jobDescription = (formData.get("jobDescription") as string) || null;

  if (!TRACKS.some((t) => t.slug === trackSlug)) {
    redirect("/nueva-sesion?error=Elige una especialidad válida");
  }

  const [session] = await db
    .insert(sessions)
    .values({ candidateId: user.id, trackSlug, jobDescription })
    .returning({ id: sessions.id });

  redirect(`/sesion/${session.id}`);
}
