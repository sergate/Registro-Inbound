import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getCurrentProfile, homeForRole } from "@/lib/auth/session";

export default async function LoginPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(homeForRole(profile.role));
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
