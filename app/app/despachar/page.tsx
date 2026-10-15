import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import AppHeader from "@/components/AppHeader";
import DespachoWorkflow from "@/components/DespachoWorkflow";

export default async function DespacharPalletPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div>
      <AppHeader username={profile.username} roleLabel={profile.role} />
      <DespachoWorkflow userId={profile.id} />
    </div>
  );
}
