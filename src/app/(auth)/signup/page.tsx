import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "./actions";
import { Lock, Mail, UserPlus, User, AtSign } from "lucide-react";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="text-center space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">Crear cuenta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={signup} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName" className="text-xs font-semibold flex items-center gap-1.5">
              <User className="size-3.5 text-primary" /> Nombre completo
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Juan Pérez"
              required
              autoComplete="name"
              className="h-10 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nickname" className="text-xs font-semibold flex items-center gap-1.5">
              <AtSign className="size-3.5 text-primary" /> Nombre de usuario
            </Label>
            <Input
              id="nickname"
              name="nickname"
              type="text"
              placeholder="juanperez"
              required
              autoComplete="username"
              className="h-10 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="size-3.5 text-primary" /> Correo electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              autoComplete="email"
              className="h-10 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-xs font-semibold flex items-center gap-1.5">
              <Lock className="size-3.5 text-primary" /> Contraseña
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              autoComplete="new-password"
              className="h-10 text-sm"
            />
          </div>
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center font-medium">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs text-center font-medium">
              {message}
            </div>
          )}
          <Button type="submit" className="w-full h-10 font-semibold gap-2 text-sm shadow-md shadow-primary/20 mt-1">
            Crear cuenta <UserPlus className="size-4" />
          </Button>
        </form>
        <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/50">
          ¿Ya tenés una cuenta?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline underline-offset-4"
          >
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
