import { useId } from "react";
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
] as const;
export function potSymbol(p: Pot): string {
  if (p.icon) return p.icon;
  const id = p.id.toLowerCase(),
    name = p.name.toLowerCase();
  if (id.includes("manuela") || name.includes("infantil")) return "baby";
  if (id.includes("patrimonio") || name.includes("reserva")) return "pig";
  if (id.includes("supermercado") || name.includes("compras")) return "basket";
  if (id.includes("transporte")) return "car";
  if (id.includes("familia") || name.includes("lazer")) return "game";
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
  const id = useId().replace(/:/g, "");
  const ref = (name: string) => `url(#${id}-${name})`;
  const title = symbols.find(([key]) => key === symbol)?.[1] || "Pote";
  return (
    <svg
      className={`pot-symbol ${className}`}
      viewBox="0 0 120 110"
      role="img"
      aria-label={`Símbolo com volume: ${title}`}
    >
      <defs>
        <radialGradient id={`${id}-pink`} cx="32%" cy="20%" r="86%">
          <stop stopColor="#ffdadf" />
          <stop offset=".5" stopColor="#efa1b4" />
          <stop offset="1" stopColor="#b66385" />
        </radialGradient>
        <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#d2e4ff" />
          <stop offset=".45" stopColor="#82a9e9" />
          <stop offset="1" stopColor="#425a9a" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffeac5" />
          <stop offset=".5" stopColor="#e6b164" />
          <stop offset="1" stopColor="#a76e34" />
        </linearGradient>
        <linearGradient id={`${id}-violet`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#e0d9fc" />
          <stop offset=".4" stopColor="#afa0de" />
          <stop offset="1" stopColor="#6a5f9c" />
        </linearGradient>
        <radialGradient id={`${id}-skin`} cx="30%" cy="20%" r="90%">
          <stop stopColor="#ffe1bb" />
          <stop offset=".55" stopColor="#e7b184" />
          <stop offset="1" stopColor="#a46d54" />
        </radialGradient>
        <linearGradient id={`${id}-white`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff" />
          <stop offset=".6" stopColor="#e0e8ee" />
          <stop offset="1" stopColor="#94a6b6" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop stopColor="#0a1225" stopOpacity=".26" />
          <stop offset="1" stopColor="#0a1225" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-premium`} x="-28%" y="-28%" width="156%" height="170%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="4" stdDeviation="3.2" floodColor="#07121c" floodOpacity=".30" />
          <feDropShadow dx="-1" dy="-1" stdDeviation="1.1" floodColor="#ffffff" floodOpacity=".22" />
        </filter>
      </defs>
      <ellipse cx="61" cy="97" rx="42" ry="8" fill={ref("shadow")} opacity=".82" />
      <g filter={ref("premium")} className="pot-symbol-object">
      {symbol === "pig" && (
        <g>
          <path
            d="M94 46c15-8 20 7 9 10"
            fill="none"
            stroke="#c87d98"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <ellipse cx="62" cy="63" rx="37" ry="28" fill={ref("pink")} />
          <path d="M42 41l-4-19c1-6 14-4 19 12" fill={ref("pink")} />
          <path d="M45 34l-3-8 9 5" fill="#c6839c" />
          <rect
            x="41"
            y="79"
            width="12"
            height="16"
            rx="6"
            fill={ref("pink")}
          />
          <rect
            x="76"
            y="79"
            width="12"
            height="16"
            rx="6"
            fill={ref("pink")}
          />
          <ellipse cx="30" cy="67" rx="13" ry="15" fill={ref("pink")} />
          <ellipse cx="28" cy="68" rx="8" ry="10" fill="#e49caf" />
          <ellipse cx="25" cy="68" rx="1.8" ry="3" fill="#a65e7b" />
          <ellipse cx="31" cy="68" rx="1.8" ry="3" fill="#a65e7b" />
          <circle cx="45" cy="54" r="3" fill="#3d3547" />
          <circle cx="44" cy="53" r="1" fill="#fff" />
          <path
            d="M62 37l15 3"
            stroke="#8a526c"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M58 47c6-3 13-3 18-1"
            stroke="#ffd5df"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )}
      {symbol === "baby" && (
        <g transform="rotate(-10 60 60)">
          <rect
            x="39"
            y="36"
            width="43"
            height="59"
            rx="14"
            fill={ref("white")}
          />
          <path
            d="M43 62h34v19c0 9-9 10-17 10s-17-1-17-10z"
            fill={ref("blue")}
            opacity=".65"
          />
          <rect
            x="37"
            y="33"
            width="47"
            height="15"
            rx="6"
            fill={ref("violet")}
          />
          <path d="M50 33v-7c0-8 4-14 11-14s11 6 11 14v7" fill={ref("skin")} />
          <path
            d="M58 19c1-2 3-3 5-2"
            stroke="#ffe4c3"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M69 54h7m-7 10h7m-7 10h7"
            stroke="#7595bd"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M46 53v24"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".65"
          />
        </g>
      )}
      {symbol === "basket" && (
        <g>
          <path d="M40 47c-7-14 3-25 13-18l4 6c4-12 16-8 17 6" fill="#75946b" />
          <ellipse cx="48" cy="49" rx="13" ry="17" fill={ref("pink")} />
          <rect
            x="73"
            y="28"
            width="14"
            height="45"
            rx="5"
            fill={ref("blue")}
            transform="rotate(12 80 50)"
          />
          <rect x="77" y="23" width="10" height="10" rx="2" fill="#a8bddc" />
          <path d="M22 54l75-6-12 42-49 5z" fill="#a46f3e" />
          <path d="M19 51l71-5-8 42-48 4z" fill={ref("gold")} />
          <path
            d="M34 60l7 22m9-23 3 24m11-26-1 24m13-26-4 23"
            stroke="#a7743c"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".8"
          />
          <path
            d="M30 52l15-27h26l13 25"
            fill="none"
            stroke="#e0b584"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <path
            d="M31 51l15-26h23"
            fill="none"
            stroke="#ffdfb2"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="18" y="48" width="76" height="8" rx="4" fill={ref("gold")} />
        </g>
      )}
      {symbol === "car" && (
        <g>
          <ellipse cx="36" cy="82" rx="10" ry="14" fill="#354158" />
          <ellipse cx="85" cy="78" rx="10" ry="14" fill="#354158" />
          <ellipse cx="36" cy="82" rx="5" ry="7" fill="#bac7d9" />
          <ellipse cx="85" cy="78" rx="5" ry="7" fill="#bac7d9" />
          <path
            d="M21 60l15-30 40-4 18 27 6 18c1 8-7 14-14 14l-57 4c-7 0-12-4-12-11z"
            fill={ref("blue")}
          />
          <path d="M39 34l32-3 13 20-55 4z" fill="#344965" />
          <path d="M42 36l-6 14 40-3-8-14z" fill="#afcfed" />
          <path d="M23 62l67-6 6 15-73 6z" fill="#749fda" />
          <path d="M22 65l13 1v8l-14-1z" fill={ref("white")} />
          <path d="M78 61l15-1 2 8-17 2z" fill={ref("white")} />
          <path
            d="M48 74l16-1"
            stroke="#344965"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M44 32l27-3"
            stroke="#d7e9ff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )}
      {symbol === "game" && (
        <g>
          <path
            d="M34 36c-12 4-17 28-16 45 1 18 18 13 29-4h26c12 16 28 19 29 2 1-19-8-40-18-44z"
            fill="#756997"
          />
          <path
            d="M33 30c-12 4-17 28-16 45 1 18 18 13 29-4h26c12 16 28 19 29 2 1-19-8-40-18-44z"
            fill={ref("violet")}
          />
          <path d="M30 44h9v9h9v9h-9v9h-9v-9h-9v-9h9z" fill="#5e5975" />
          <path d="M30 45h9v8h8" stroke="#9690aa" strokeWidth="2" fill="none" />
          <circle cx="79" cy="44" r="5" fill="#cf839e" />
          <circle cx="90" cy="55" r="5" fill="#95b791" />
          <circle cx="79" cy="66" r="5" fill="#e0bd75" />
          <circle cx="68" cy="55" r="5" fill="#829ac9" />
          <circle cx="50" cy="64" r="6" fill="#665c86" />
          <circle cx="63" cy="72" r="6" fill="#665c86" />
          <path
            d="M43 33l25-1"
            stroke="#e1d9f8"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )}
      {(symbol === "man" || symbol === "woman") && (
        <g>
          <path
            d="M26 96v-9c0-15 15-23 34-23s34 8 34 23v9"
            fill={ref(symbol === "woman" ? "violet" : "blue")}
          />
          <path d="M49 60h22v14c0 11-22 11-22 0z" fill={ref("skin")} />
          {symbol === "woman" && (
            <path
              d="M35 43c0-20 9-29 25-29s26 12 26 29l4 34-20 3-34-4z"
              fill="#614844"
            />
          )}
          <ellipse cx="59" cy="44" rx="22" ry="27" fill={ref("skin")} />
          {symbol === "man" ? (
            <path
              d="M38 44c-8-16 1-31 17-33 21-3 34 12 26 32l-6-20c-11 9-22-2-32 4z"
              fill="#574b47"
            />
          ) : (
            <path
              d="M37 45c-9-17 0-32 20-34 22-1 36 17 26 34l-7-21c-5 12-18 15-34 11z"
              fill="#69524b"
            />
          )}
          <circle cx="51" cy="45" r="2.3" fill="#493a36" />
          <circle cx="68" cy="45" r="2.3" fill="#493a36" />
          <path
            d="M55 57q5 4 10-1"
            stroke="#985f50"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M46 82q14 9 29-1"
            stroke={symbol === "woman" ? "#ddd2f3" : "#c8dafa"}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
      {symbol === "goal" && (
        <g>
          <ellipse cx="58" cy="54" rx="35" ry="36" fill="#91644e" />
          <ellipse cx="54" cy="50" rx="35" ry="36" fill={ref("gold")} />
          <ellipse cx="54" cy="50" rx="25" ry="26" fill={ref("white")} />
          <ellipse cx="54" cy="50" rx="16" ry="17" fill={ref("gold")} />
          <ellipse cx="54" cy="50" rx="7" ry="8" fill="#fff3da" />
          <path
            d="M54 50l44-28"
            stroke="#7c869f"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M88 29l1-13 17-4-8 15z" fill={ref("blue")} />
          <path
            d="M50 87v9m14-10v10"
            stroke="#aa7946"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
      )}
      {!symbols.some(([key]) => key === symbol) || symbol === "wallet" ? (
        <g>
          <rect x="24" y="33" width="74" height="58" rx="13" fill="#9a6b40" />
          <rect
            x="19"
            y="27"
            width="74"
            height="58"
            rx="13"
            fill={ref("gold")}
          />
          <path
            d="M28 36h55"
            stroke="#ffdbab"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="65" y="47" width="31" height="24" rx="7" fill="#b7834b" />
          <circle cx="76" cy="59" r="4" fill={ref("white")} />
          <ellipse cx="46" cy="20" rx="12" ry="13" fill={ref("gold")} />
          <path
            d="M43 14h5m-5 5h5m-5 5h5"
            stroke="#b28040"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      ) : null}
      </g>
    </svg>
  );
}
