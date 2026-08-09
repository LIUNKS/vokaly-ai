import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" size="icon" aria-label="Cerrar sesión">
        <LogOut />
      </Button>
    </form>
  );
}
