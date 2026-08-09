"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = formData.get("fullName") as string;
  const nickname = formData.get("nickname") as string;
  const careerPath = formData.get("careerPath") as string;
  const yearsOfExperience = formData.get("yearsOfExperience") as string;
  const description = formData.get("description") as string;
  const phone = (formData.get("phone") as string) || null;
  const skills = (formData.get("skills") as string) || null;

  if (!fullName || !nickname || !careerPath || !yearsOfExperience || !description) {
    redirect("/profile?error=Completa todos los campos");
  }

  await db
    .insert(users)
    .values({
      id: user.id,
      fullName,
      nickname,
      careerPath,
      yearsOfExperience,
      description,
      phone,
      skills,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { fullName, nickname, careerPath, yearsOfExperience, description, phone, skills },
    });

  redirect("/");
}
