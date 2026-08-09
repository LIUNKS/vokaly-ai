import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // must call getUser() (not getSession()) — validates the token against
  // Supabase's server instead of trusting the cookie, refreshing it if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (!user && !isAuthRoute && !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const isProfileRoute = request.nextUrl.pathname.startsWith("/profile");
  if (user && !isAuthRoute && !isProfileRoute) {
    const [profile] = await db
      .select({
        fullName: users.fullName,
        nickname: users.nickname,
        careerPath: users.careerPath,
        yearsOfExperience: users.yearsOfExperience,
        description: users.description,
      })
      .from(users)
      .where(eq(users.id, user.id));

    const profileIncomplete =
      !profile?.fullName ||
      !profile?.nickname ||
      !profile?.careerPath ||
      !profile?.yearsOfExperience ||
      !profile?.description;

    if (profileIncomplete) {
      const url = request.nextUrl.clone();
      url.pathname = "/profile";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
