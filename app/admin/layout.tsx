import { redirect } from "next/navigation";
import { getCurrentProfile, homeForRole } from "@/lib/auth/session";
import AppHeader from "@/components/AppHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }
  if (profile.role !== "admin") {
    redirect(homeForRole(profile.role));
  }

  return (
    <div>
      <AppHeader username={profile.username} roleLabel="Administrador" />
      {children}
    </div>
  );
}
