import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import AppHeader from "@/components/AppHeader";
import MobileMenu from "@/components/MobileMenu";

export default async function MobileMenuPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div>
      <AppHeader username={profile.username} roleLabel={profile.role} />
      <MobileMenu />
    </div>
  );
}
