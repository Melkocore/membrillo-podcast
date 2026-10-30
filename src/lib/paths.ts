/**
 * Prefija una ruta interna con el `base` configurado en Astro.
 * Útil para despliegues en subpath (ej. GitHub Pages project page).
 */
export function withBase(path: string): string {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}