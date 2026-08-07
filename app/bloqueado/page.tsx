import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import LogoutButton from "@/components/LogoutButton";

export default async function BloqueadoPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }
  if (profile.role !== "operario") {
    redirect("/");
  }

  return (
    <main style={styles.wrapper}>
      <h1 style={styles.title}>Usá el handheld</h1>
      <p style={styles.text}>
        Tu usuario está pensado para tareas operativas desde el dispositivo
        móvil. Ingresá desde el handheld para escanear pallets.
      </p>
      <LogoutButton />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    padding: "1.5rem",
    textAlign: "center",
  },
  title: {
    fontSize: "1.3rem",
    margin: 0,
  },
  text: {
    color: "var(--text-dim)",
    maxWidth: 360,
  },
};
