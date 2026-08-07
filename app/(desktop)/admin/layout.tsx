import { redirect } from "next/navigation";
import { getCurrentProfile, resolveHome, isMobileRequest } from "@/lib/auth/session";

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
    const mobile = await isMobileRequest();
    redirect(resolveHome(profile.role, mobile));
  }

  return <>{children}</>;
}
