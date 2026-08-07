import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import AppHeader from "@/components/AppHeader";
import OperarioWorkflow from "@/components/OperarioWorkflow";

export default async function IngresarPalletPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div>
      <AppHeader username={profile.username} roleLabel={profile.role} />
      <OperarioWorkflow userId={profile.id} />
    </div>
  );
}
