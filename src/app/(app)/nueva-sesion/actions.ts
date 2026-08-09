"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { TRACKS } from "@/lib/tracks";
import { generateBlueprintContent } from "@/lib/blueprint";

async function crearSesionRow(
  formData: FormData,
): Promise<{ error: string } | { id: string; blueprintContent: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const trackSlug = formData.get("trackSlug") as string;
  const jobDescription = (formData.get("jobDescription") as string) || undefined;

  if (!TRACKS.some((t) => t.slug === trackSlug)) {
    return { error: "Elige una especialidad válida" } as const;
  }

  const [profile] = await db
    .select({ yearsOfExperience: users.yearsOfExperience })
    .from(users)
    .where(eq(users.id, user.id));
  if (!profile?.yearsOfExperience) redirect("/profile");

  const blueprintContent = await generateBlueprintContent({
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

  return { id: session.id, blueprintContent } as const;
}

export async function crearSesion(formData: FormData) {
  const result = await crearSesionRow(formData);
  if ("error" in result) {
    redirect(`/nueva-sesion?error=${encodeURIComponent(result.error)}`);
  }
  redirect(`/nueva-sesion/${result.id}`);
}

export type CrearSesionModalState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "done"; sessionId: string; blueprintContent: string };

export async function crearSesionModal(
  _prev: CrearSesionModalState,
  formData: FormData,
): Promise<CrearSesionModalState> {
  const result = await crearSesionRow(formData);
  if ("error" in result) {
    return { status: "error", message: result.error };
  }
  return {
    status: "done",
    sessionId: result.id,
    blueprintContent: result.blueprintContent,
  };
}
