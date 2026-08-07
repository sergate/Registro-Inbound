import { redirect } from "next/navigation";
import { getCurrentProfile, isMobileRequest } from "@/lib/auth/session";
import DesktopSidebar from "@/components/DesktopSidebar";

export default async function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const mobile = await isMobileRequest();
  if (mobile) {
    redirect("/app");
  }

  if (profile.role === "operario") {
    redirect("/bloqueado");
  }

  return (
    <div style={{ display: "flex" }}>
      <DesktopSidebar role={profile.role} username={profile.username} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
