import type { Pot } from "./model";
export const symbols = [
  ["pig", "Patrimônio"],
  ["baby", "Poupança infantil"],
  ["basket", "Compras"],
  ["car", "Transporte"],
  ["game", "Lazer"],
  ["man", "Pessoal dele"],
  ["woman", "Pessoal dela"],
  ["goal", "Meta"],
  ["wallet", "Carteira"],
  ["market", "Mercado Livre"],
  ["family", "Família"],
  ["health", "Saúde"],
  ["travel", "Viagens"],
  ["education", "Educação"],
  ["debts", "Dívidas"],
  ["investment", "Investimentos"],
  ["emergency", "Emergências"],
  ["pets", "Pets"],
  ["gifts", "Presentes"],
] as const;

// Ícones 3D foscos com fundo transparente, isolados da arte aprovada.
// Os assets estão em public/potes-3d/ e não contêm porcentagens/saldos.
const iconFiles: Record<string, string> = {
  pig: "patrimony", baby: "baby", basket: "basket", car: "car",
  game: "game", man: "game", woman: "gifts", goal: "investment",
  wallet: "investment", market: "market", family: "family", health: "health",
  travel: "travel", education: "education", debts: "debts",
  investment: "investment", emergency: "emergency", pets: "pets",
  gifts: "gifts",
};
export function potSymbol(p: Pot): string {
  const id = p.id.toLowerCase(),
    name = p.name.toLowerCase();
  if (id.includes("manuela") || name.includes("infantil")) return "baby";
  if (id.includes("mercado-livre") || id.includes("marketplace") || name.includes("mercado livre")) return "market";
  if (id.includes("patrimonio") || name.includes("patrimônio")) return "pig";
  // Preserva a escolha de ícone de outras categorias personalizadas.
  if (p.icon) return p.icon;
  if (name.includes("reserva")) return "pig";
  if (id.includes("familia") || name.includes("família") || name.includes("familia")) return "family";
  if (id.includes("supermercado") || name.includes("compras")) return "basket";
  if (name.includes("saúde") || name.includes("saude")) return "health";
  if (name.includes("viagem") || name.includes("férias")) return "travel";
  if (name.includes("educa") || name.includes("estudo")) return "education";
  if (name.includes("dívida") || name.includes("divida")) return "debts";
  if (name.includes("invest")) return "investment";
  if (name.includes("emergência") || name.includes("emergencia")) return "emergency";
  if (name.includes("pet") || name.includes("animal")) return "pets";
  if (name.includes("presente")) return "gifts";
  if (id.includes("transporte")) return "car";
  if (name.includes("lazer")) return "game";
  if (id.includes("dele")) return "man";
  if (id.includes("dela")) return "woman";
  if (id.startsWith("goal-")) return "goal";
  return "wallet";
}
export function PotSymbol({
  symbol,
  className = "",
}: {
  symbol: string;
  className?: string;
}) {
  const title = symbols.find(([key]) => key === symbol)?.[1] || "Pote";
  const asset = iconFiles[symbol] || "debts";
  return (
    <img
      className={`pot-symbol pot-symbol-3d ${className}`}
      src={`/potes-3d/${asset}.webp`}
      alt={`Ícone 3D: ${title}`}
      draggable={false}
      loading="lazy"
      decoding="async"
    />
  );

}
