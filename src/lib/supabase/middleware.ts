import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Excluir rutas públicas/técnicas (API, webhooks, assets) de cualquier sobrecosto de Auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // Archivos estáticos (.png, .svg, .ico, etc.)
  ) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si Supabase URL o Anon Key no están configuradas (modo local/mock), permitir navegación libre
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("tu-proyecto")) {
    return response;
  }

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes("auth-token") || c.name.startsWith("sb-")
  );

  // 2. Optimización Optimista: Si no hay cookies de Supabase y es ruta de Auth (login/signup), evitar llamada de red
  if (!hasAuthCookie && isAuthRoute) {
    return response;
  }

  // 3. Optimización Optimista: Si no hay cookies y es ruta protegida, redirigir a /login sin llamada de red
  if (!hasAuthCookie && !isAuthRoute && !pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 4. Instanciar cliente Supabase SSR para refrescar sesión cuando hay cookies presentes
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Validar token de usuario únicamente cuando existen cookies de sesión
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (!user && !isAuthRoute && !pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}
