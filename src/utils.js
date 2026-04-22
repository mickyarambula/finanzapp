// Funciones de uso general compartidas en toda la app.
// Extraídas de App.jsx el 21-abr-2026 (primer paso del refactor).

export const fmt = (amount, currency = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount || 0);

export const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

export const today = () => new Date().toISOString().split("T")[0];

export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
