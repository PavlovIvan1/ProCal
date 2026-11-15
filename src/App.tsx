import { useEffect, useState } from "react";
import flame from "./assets/flame.svg";
import gauge from "./assets/gauge.svg";
import droplet from "./assets/droplet.svg";
import scanFrame from "./assets/scan-frame.svg";
import { yearDays } from "./data/yearDays";
import { CameraView } from "./components/CameraView";
import { ResultPage } from "./components/ResultPage";

/* ---- «Твой год в балансе»: окно последних 6 месяцев (крупные ячейки) ---- */
const HALF_START = 137; // day-of-year, May 17
const HALF_END = 318; // day-of-year, сегодня (Nov 14)
const windowStart = yearDays[HALF_START - 1].x;
const halfDays = yearDays
  .slice(HALF_START - 1, HALF_END)
  .map((d) => ({ ...d, x: d.x - windowStart }));

const MONTH_COLS: Array<[string, number]> = [
  ["Май", 0],
  ["Июн", yearDays[152 - 1].x - windowStart],
  ["Июл", yearDays[182 - 1].x - windowStart],
  ["Авг", yearDays[213 - 1].x - windowStart],
  ["Сен", yearDays[244 - 1].x - windowStart],
  ["Окт", yearDays[274 - 1].x - windowStart],
  ["Ноя", yearDays[305 - 1].x - windowStart],
];

const LEGEND = ["#efeeeb", "#f2dfe5", "#dba8b7", "#b75a75", "#8a0027"];

/** Figma vector icon: box > group(inset) > img(negative inset), exact export nesting. */
function FigIcon(props: {
  src: string;
  w: number;
  h?: number;
  group: string;
  img: string;
  className?: string;
}) {
  const { src, w, h = w, group, img, className } = props;
  return (
    <span className={"ficon" + (className ? " " + className : "")} style={{ width: w, height: h }}>
      <span style={{ inset: group }}>
        <span style={{ inset: img }}>
          <img src={src} alt="" />
        </span>
      </span>
    </span>
  );
}

function Greeting() {
  return (
    <section className="gr">
      <p className="gr-date">СУББОТА, 14 НОЯБРЯ</p>
      <h1 className="gr-title">Доброе утро.</h1>
      <p className="gr-sub">Маленькие шаги. Здоровый ты.</p>
      <div className="gr-badge">
        <FigIcon src={flame} w={17} group="12.5% 15.36% 14.39% 23.99%" img="-6.84% -8.25% -6.84% -8.24%" />
        <b>12 дней</b>
      </div>
    </section>
  );
}

function YearCard() {
  return (
    <section className="ycard">
      <h2 className="ycard-title">Твой год в балансе</h2>
      <span className="ycard-year">2026</span>
      <div className="ycard-months">
        {MONTH_COLS.map(([m, c]) => (
          <span key={m} style={{ gridColumn: c + 1 }}>
            {m}
          </span>
        ))}
      </div>
      <div className="ycard-grid">
        {halfDays.map((d, i) => (
          <span key={i} style={{ gridColumn: d.x + 1, gridRow: d.y + 1, background: d.c }} />
        ))}
      </div>
      <div className="ycard-foot">
        <p className="ycard-count">207 осознанных дней</p>
        <div className="ycard-legend">
          <span>Меньше</span>
          <div className="ycard-squares">
            {LEGEND.map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </div>
          <span>Больше</span>
        </div>
      </div>
    </section>
  );
}

function CalorieCard() {
  return (
    <section className="ccal">
      <h2 className="ccal-title">Калории</h2>
      <p className="ccal-sub">73% дневной цели</p>
      <img className="ccal-gauge" src={gauge} alt="" />
      <p className="ccal-num">1 460</p>
      <p className="ccal-of">из 2 000 ккал</p>
      <p className="ccal-left">540 ккал осталось</p>
    </section>
  );
}

function WaterCard() {
  return (
    <section className="cwat">
      <h2 className="cwat-title">Вода</h2>
      <FigIcon src={droplet} w={17} group="12.5% 20.83% 8.33% 20.83%" img="-6.32% -8.57%" className="cwat-drop" />
      <p className="cwat-num">1,2</p>
      <p className="cwat-of">из 2 л</p>
      <div className="cwat-bar">
        <span />
      </div>
      <p className="cwat-pct">60% нормы</p>
    </section>
  );
}

function MacrosCard() {
  const rows = [
    { label: "Белки", value: "82 / 120 г", frac: 82 / 120, color: "#8a0027", top: 47, barTop: 66 },
    { label: "Углеводы", value: "158 / 250 г", frac: 158 / 250, color: "#b76b80", top: 87, barTop: 106 },
    { label: "Жиры", value: "56 / 67 г", frac: 56 / 67, color: "#d8aebb", top: 127, barTop: 146 },
  ];
  return (
    <section className="cmac">
      <h2 className="cmac-title">Твои БЖУ</h2>
      {rows.map((m) => (
        <span key={m.label}>
          <p className="cmac-label" style={{ top: m.top }}>{m.label}</p>
          <p className="cmac-value" style={{ top: m.top }}>{m.value}</p>
          <div className="cmac-track" style={{ top: m.barTop }}>
            <span style={{ width: `${m.frac * 100}%`, background: m.color }} />
          </div>
        </span>
      ))}
    </section>
  );
}

function WeekCard() {
  const bars = [
    { d: "П", h: 35.76 },
    { d: "В", h: 38.64 },
    { d: "С", h: 33.12 },
    { d: "Ч", h: 41.52 },
    { d: "П", h: 37.68 },
    { d: "С", h: 35.04, today: true },
    { d: "В", h: 3, upcoming: true },
  ];
  return (
    <section className="cweek">
      <h2 className="cweek-title">Эта неделя</h2>
      <p className="cweek-num">1 540</p>
      <p className="cweek-avg">ккал в день, в среднем</p>
      <div className="cweek-bars">
        {bars.map((w, i) => (
          <span
            key={i}
            style={{ height: w.h, background: w.today ? "#8a0027" : w.upcoming ? "#eae6e4" : "#e5c9d2" }}
          />
        ))}
      </div>
      <div className="cweek-labels">
        {bars.map((w, i) => (
          <span key={i} className={w.today ? "today" : undefined}>{w.d}</span>
        ))}
      </div>
    </section>
  );
}

function HomePage({ onScan }: { onScan(): void }) {
  return (
    <main className="content">
      <Greeting />
      <YearCard />
      <div className="ovh">
        <h2>Обзор за сегодня</h2>
        <span>Твой ритм дня</span>
      </div>
      <div className="orow">
        <CalorieCard />
        <WaterCard />
      </div>
      <div className="mrow">
        <MacrosCard />
        <WeekCard />
      </div>
      <button className="scan" onClick={onScan}>
        <FigIcon src={scanFrame} w={19} group="12.5%" img="-5.96%" />
        Сканировать еду
      </button>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState<"home" | "camera" | "result">("home");
  const [ghost, setGhost] = useState<"home" | "camera" | "result" | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  /* плавный переход: уходящая страница доигрывает анимацию поверх */
  const go = (next: "home" | "camera" | "result", p?: string | null) => {
    setGhost(page);
    setPage(next);
    if (p !== undefined) setPhoto(p);
  };

  useEffect(() => {
    if (!ghost) return;
    const t = setTimeout(() => setGhost(null), 300);
    return () => clearTimeout(t);
  }, [ghost]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="phone">
      {page === "home" && (
        <div className="page-in" key="home">
          <HomePage onScan={() => go("camera")} />
        </div>
      )}
      {page === "camera" && (
        <CameraView onClose={() => go("home")} onCapture={(p) => go("result", p)} />
      )}
      {page === "result" && (
        <div className="page-in" key="result">
          <ResultPage photo={photo} onBack={() => go("home")} />
        </div>
      )}

      {ghost && ghost !== "camera" && (
        <div className="page-out" aria-hidden="true">
          {ghost === "home" ? (
            <HomePage onScan={() => undefined} />
          ) : (
            <ResultPage photo={photo} onBack={() => undefined} />
          )}
        </div>
      )}
      {ghost === "camera" && <div className="cam-ghost" aria-hidden="true" />}
    </div>
  );
}
