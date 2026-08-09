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
import { login } from "./actions";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="text-center space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={login} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-xs font-semibold flex items-center gap-1.5">
              <Lock className="size-3.5 text-primary" /> Contraseña
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-10 text-sm"
            />
          </div>
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center font-medium">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full h-10 font-semibold gap-2 text-sm shadow-md shadow-primary/20">
            Login <ArrowRight className="size-4" />
          </Button>
        </form>
        <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/50">
          ¿No tenés una cuenta?{" "}
          <Link
            href="/signup"
            className="text-primary font-semibold hover:underline underline-offset-4"
          >
            Registrate gratis
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
