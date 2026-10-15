import Link from "next/link";
import { PAGE_SIZE } from "@/lib/pagination";

// Paginador para listados que se piden de a paginas desde el servidor.
// `params` son los demas filtros de la URL, que se conservan al cambiar de pagina.
export default function Pager({
  basePath,
  page,
  total,
  params = {},
}: {
  basePath: string;
  page: number;
  total: number;
  params?: Record<string, string>;
}) {
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  function href(target: number) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div style={styles.wrapper}>
      <span style={{ color: "var(--text-dim)", fontVariantNumeric: "tabular-nums" }}>
        {from.toLocaleString("es-AR")}–{to.toLocaleString("es-AR")} de {total.toLocaleString("es-AR")}
      </span>
      <span style={styles.links}>
        {page > 1 ? (
          <Link href={href(page - 1)} style={styles.link}>
            ‹ Anterior
          </Link>
        ) : (
          <span style={styles.disabled}>‹ Anterior</span>
        )}
        {page < lastPage ? (
          <Link href={href(page + 1)} style={styles.link}>
            Siguiente ›
          </Link>
        ) : (
          <span style={styles.disabled}>Siguiente ›</span>
        )}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginTop: "1rem",
    fontSize: "0.9rem",
  },
  links: {
    display: "flex",
    gap: "1rem",
  },
  link: {
    color: "var(--text)",
    textDecoration: "none",
    padding: "0.35rem 0.75rem",
    border: "1px solid var(--border)",
    borderRadius: 6,
  },
  disabled: {
    color: "var(--text-dim)",
    padding: "0.35rem 0.75rem",
    border: "1px solid var(--border)",
    borderRadius: 6,
    opacity: 0.5,
  },
};
