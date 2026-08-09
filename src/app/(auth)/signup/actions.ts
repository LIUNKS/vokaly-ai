"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function signup(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const nickname = (formData.get("nickname") as string)?.trim();

  if (!email || !password || !fullName || !nickname) {
    redirect(`/signup?error=${encodeURIComponent("Por favor completá todos los campos requeridos")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        full_name: fullName,
        nickname: nickname,
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user?.id) {
    try {
      await db
        .insert(users)
        .values({
          id: data.user.id,
          fullName,
          nickname,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: { fullName, nickname },
        });
    } catch (dbErr) {
      console.warn("[Signup] Error al guardar perfil en DB:", dbErr);
    }
  }

  redirect("/signup?message=¡Cuenta creada con éxito! Revisá tu correo para confirmar la cuenta.");
}
