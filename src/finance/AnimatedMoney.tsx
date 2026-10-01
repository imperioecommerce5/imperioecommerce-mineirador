import { useEffect, useRef, useState } from "react";
import { money } from "./model";

type Tag = "strong" | "b" | "span";

export function AnimatedMoney({
  cents,
  hidden = false,
  tag = "span",
  className,
  duration = 650,
}: {
  cents: number;
  hidden?: boolean;
  tag?: Tag;
  className?: string;
  duration?: number;
}) {
  const initial = hidden ? cents : 0;
  const previous = useRef(initial);
  const [display, setDisplay] = useState(initial);

  useEffect(() => {
    const startValue = previous.current;
    previous.current = cents;

    if (
      hidden ||
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !Number.isFinite(cents)
    ) {
      setDisplay(cents);
      return;
    }

    const delta = cents - startValue;
    if (delta === 0) {
      setDisplay(cents);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startValue + delta * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [cents, hidden, duration]);

  const Tag = tag;
  return (
    <Tag className={className} aria-label={hidden ? "Valor oculto" : money(cents)}>
      {hidden ? "R$ ••••" : money(display)}
    </Tag>
  );
}
