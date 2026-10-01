import { CSSProperties, PointerEvent, useRef } from "react";

export function PercentageControl({
  label,
  value,
  onChange,
  maxAllowed = 100,
  color = "#8296bb",
  step = 1,
  amountLabel,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  maxAllowed?: number;
  color?: string;
  step?: number;
  amountLabel?: string;
}) {
  const dragging = useRef(false);
  const safeStep = Math.max(1, step);
  const max = Math.max(
    0,
    Math.min(100, Math.floor(maxAllowed / safeStep) * safeStep),
  );
  const snap = (v: number) =>
    Math.max(0, Math.min(max, Math.round(v / safeStep) * safeStep));
  const set = (v: number) => onChange(snap(v));
  const current = snap(value);
  const angle = (current / 100) * Math.PI * 2 - Math.PI / 2;
  const knobX = 60 + Math.cos(angle) * 45;
  const knobY = 60 + Math.sin(angle) * 45;

  function updateFromPointer(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    let deg = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    set((deg / 360) * 100);
  }

  return (
    <div
      className="percentage-control circular-percentage"
      style={{ "--slider-accent": color } as CSSProperties}
    >
      <div className="circular-label">{label.replace(/ percentual$/, "")}</div>
      <div
        className="circular-dial"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={`${current}% · máximo disponível ${max}%`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            set(current + safeStep);
          }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            set(current - safeStep);
          }
        }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          updateFromPointer(e);
        }}
        onPointerMove={(e) => {
          if (dragging.current) updateFromPointer(e);
        }}
        onPointerUp={(e) => {
          dragging.current = false;
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="dial-track" cx="60" cy="60" r="45" pathLength="100" />
          <circle
            className="dial-progress"
            cx="60"
            cy="60"
            r="45"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - current}
            transform="rotate(-90 60 60)"
          />
          <circle className="dial-knob" cx={knobX} cy={knobY} r="5.5" />
        </svg>
        <div className="dial-value">
          <strong>{current}%</strong>
          {amountLabel && <small>{amountLabel}</small>}
        </div>
      </div>
      <div className="circular-stepper" aria-hidden="true">
        <span>0%</span>
        <span>de {safeStep} em {safeStep}</span>
        <span>{max}%</span>
      </div>
      <input
        className="circular-range-fallback"
        type="range"
        min="0"
        max={max}
        step={safeStep}
        aria-label={`${label} valor`}
        value={current}
        onChange={(e) => set(Number(e.target.value))}
      />
    </div>
  );
}
