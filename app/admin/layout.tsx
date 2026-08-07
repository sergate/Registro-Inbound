import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import AppHeader from "@/components/AppHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }

  return (
    <div>
      <AppHeader username={profile.username} roleLabel="Administrador" />
      {children}
    </div>
  );
}
