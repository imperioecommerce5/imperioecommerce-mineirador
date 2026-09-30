import { CSSProperties } from "react";
export function PercentageControl({
  label,
  value,
  onChange,
  maxAllowed = 100,
  color = "#8296bb",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  maxAllowed?: number;
  color?: string;
}) {
  const max = Math.max(0, Math.min(100, Math.round(maxAllowed * 100) / 100));
  const set = (v: number) =>
    onChange(Math.max(0, Math.min(max, Math.round(v * 100) / 100)));
  return (
    <div
      className="percentage-control"
      style={
        {
          "--slider-accent": color,
          "--progress": `${Math.max(0, Math.min(100, value))}%`,
        } as CSSProperties
      }
    >
      <div className="percentage-heading">
        <span>{label.replace(/ percentual$/, "")}</span>
        <div>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max={max}
            step="0.01"
            aria-label={`${label} valor`}
            value={value}
            onChange={(e) => set(Number(e.target.value))}
          />
          <b>%</b>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="0.01"
        aria-label={label}
        aria-valuetext={`${value}% · máximo disponível ${max}%`}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
      />
      <div className="percentage-scale">
        <span>0%</span>
        <span>Deslize · até {max}% disponíveis</span>
        <span>100%</span>
      </div>
    </div>
  );
}
