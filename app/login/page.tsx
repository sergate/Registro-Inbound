import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getCurrentProfile, resolveHome, isMobileRequest } from "@/lib/auth/session";

export default async function LoginPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    const mobile = await isMobileRequest();
    redirect(resolveHome(profile.role, mobile));
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
