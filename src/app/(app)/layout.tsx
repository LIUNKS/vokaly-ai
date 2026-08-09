import { AppSidebar } from "@/components/app-sidebar";
import { AppMobileNav } from "@/components/app-mobile-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <AppMobileNav />
      <main className="md:pl-64">
        <div className="mx-auto max-w-4xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
