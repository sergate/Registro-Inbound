"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton({
  style,
}: {
  style?: React.CSSProperties;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button style={{ ...defaultStyle, ...style }} onClick={handleLogout}>
      Salir
    </button>
  );
}

const defaultStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "transparent",
  color: "var(--text)",
};
