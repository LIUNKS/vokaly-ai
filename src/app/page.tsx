import { Button } from "@/components/ui/button";
import { logout } from "./actions";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-end p-4">
        <form action={logout}>
          <Button type="submit" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </header>
      <main className="flex items-center justify-center py-24">
        <h1 className="font-heading text-3xl font-medium text-foreground">
          Vokaly Prep
        </h1>
      </main>
    </div>
  );
}
