/* Живая полукруговая шкала калорий: SVG-дуга с плавной анимацией. */

const R = 66;
const LEN = Math.PI * R; // длина полуокружности

export function Gauge({ pct, max = 1 }: { pct: number; max?: number }) {
  const p = Math.max(0, Math.min(max, pct));
  const offset = LEN * (1 - p / max);
  return (
    <svg className="gauge" viewBox="0 0 158 86" width="158" height="86" aria-hidden="true">
      <path
        d={`M13 79 A${R} ${R} 0 0 1 145 79`}
        fill="none"
        stroke="#ebc5cf"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d={`M13 79 A${R} ${R} 0 0 1 145 79`}
        fill="none"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={LEN}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.22, 0.8, 0.36, 1)" }}
      />
    </svg>
  );
}
