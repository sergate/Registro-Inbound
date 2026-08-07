import { redirect } from "next/navigation";
import { getCurrentProfile, resolveHome, isMobileRequest } from "@/lib/auth/session";

export default async function RootPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const mobile = await isMobileRequest();
  redirect(resolveHome(profile.role, mobile));
}
