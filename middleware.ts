import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import type { UserRole } from "@/types/database";

const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  supervisor: "/supervisor",
  operario: "/operario",
};

const PROTECTED_PREFIXES: Record<string, UserRole[]> = {
  "/admin": ["admin"],
  "/supervisor": ["admin", "supervisor"],
  "/operario": ["admin", "supervisor", "operario"],
};

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const matchedPrefix = Object.keys(PROTECTED_PREFIXES).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (matchedPrefix) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.active) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      const redirect = NextResponse.redirect(url);
      // preserve cookies cleared/refreshed by updateSession
      supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c));
      return redirect;
    }

    const allowedRoles = PROTECTED_PREFIXES[matchedPrefix];
    if (!allowedRoles.includes(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[profile.role];
      const redirect = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c));
      return redirect;
    }
  }

  if (pathname === "/login" && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", user.id)
      .single();

    if (profile?.active) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[profile.role];
      const redirect = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c));
      return redirect;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-.*\\.js).*)",
  ],
};
