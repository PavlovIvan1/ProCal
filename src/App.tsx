"use client";

import { useEffect, useRef, useState } from "react";
import flame from "./assets/flame.svg";
import droplet from "./assets/droplet.svg";
import scanFrame from "./assets/scan-frame.svg";
import { useStore, takeCelebrate } from "./store";
import { Gauge } from "./components/Gauge";
import { CameraView } from "./components/CameraView";
import { ResultPage } from "./components/ResultPage";

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

const fmt = (n: number) => n.toLocaleString("ru-RU");

function Greeting({ streak }: { streak: number }) {
  // дата рендерится только на клиенте (иначе SSR-дата ≠ клиентская → hydration)
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const DOW = ["ВОСКРЕСЕНЬЕ", "ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА", "СУББОТА"];
  const MON = ["ЯНВАРЯ", "ФЕВРАЛЯ", "МАРТА", "АПРЕЛЯ", "МАЯ", "ИЮНЯ", "ИЮЛЯ", "АВГУСТА", "СЕНТЯБРЯ", "ОКТЯБРЯ", "НОЯБРЯ", "ДЕКАБРЯ"];
  return (
    <section className="gr">
      <p className="gr-date">
        {now
          ? `${DOW[now.getDay()]}, ${now.getDate()} ${MON[now.getMonth()]}`
          : "СЕГОДНЯ"}
      </p>
      <h1 className="gr-title">Доброе утро.</h1>
      <p className="gr-sub">Маленькие шаги. Здоровый ты.</p>
      <div className="gr-badge">
        <FigIcon src={flame.src} w={17} group="12.5% 15.36% 14.39% 23.99%" img="-6.84% -8.25% -6.84% -8.24%" />
        <b>{streak} дней</b>
      </div>
    </section>
  );
}

function YearCard({ months }: { months: ReturnType<typeof useStore>["months"] }) {
  return (
    <section className="ycard">
      <h2 className="ycard-title">Твой год в балансе</h2>
      <span className="ycard-year">2026</span>
      <div className="ycard-months">
        {months.months.map((m) => (
          <span key={m.name + m.col} style={{ gridColumn: m.col + 1 }}>
            {m.name}
          </span>
        ))}
      </div>
      <div className="ycard-grid">
        {months.cells.map((d, i) => (
          <span key={i} style={{ gridColumn: d.x + 1, gridRow: d.y + 1, background: d.c }} />
        ))}
      </div>
      <div className="ycard-foot">
        <p className="ycard-count">{months.mindful} осознанных дней</p>
        <div className="ycard-legend">
          <span>Меньше</span>
          <div className="ycard-squares">
            {["#efeeeb", "#f2dfe5", "#dba8b7", "#b75a75", "#8a0027"].map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </div>
          <span>Больше</span>
        </div>
      </div>
    </section>
  );
}

const CELEBRATE_COUNT_MS = 1150;

function CalorieCard({ celebrate }: { celebrate: number }) {
  const { today, goals, meals } = useStore();
  const [shown, setShown] = useState<number | null>(null); // анимируемая цифра
  const [phase, setPhase] = useState<"idle" | "pulse">("idle");

  useEffect(() => {
    if (!celebrate) return;
    let raf = 0;
    const timers: number[] = [];
    /* старт через макрозадержку: StrictMode двойным монтом не обрывает анимацию */
    const start = window.setTimeout(() => {
      if (!takeCelebrate()) return;
      const amount = meals.length ? meals[meals.length - 1].kcal : 0;
      const from = Math.max(0, today.kcal - amount);
      const to = today.kcal;
      if (to <= from) return;
      const t0 = performance.now();
      setShown(from);
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / CELEBRATE_COUNT_MS);
        const e = 1 - Math.pow(2, -10 * k); // easeOutExpo: быстро стартует, мягко доезжает
        setShown(from + (to - from) * e);
        if (k < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setShown(to);
          setPhase("pulse"); // цифра подпрыгивает и подсвечивается
          timers.push(window.setTimeout(() => setPhase("idle"), 900));
        }
      };
      raf = requestAnimationFrame(tick);
    }, 60);
    return () => {
      clearTimeout(start);
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
    // today/meals — снапшот на момент добавления, пересчитывать не нужно
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrate]);

  const v = shown ?? today.kcal;
  const pct = v / goals.kcal;
  /* цель дня закрыта — галочка живёт в углу карточки, а не мигает внизу */
  const reached = v >= goals.kcal;
  return (
    <section className="ccal">
      <h2 className="ccal-title">Калории</h2>
      <p className="ccal-sub">{Math.round(pct * 100)}% дневной цели</p>
      <Gauge className="ccal-gauge" pct={pct} />
      <p className={"ccal-num" + (phase === "pulse" ? " pulse" : "")}>{fmt(Math.round(v))}</p>
      <p className="ccal-of">из {fmt(goals.kcal)} ккал</p>
      {reached && (
        <div className="ccal-check" aria-hidden="true">
          <span>
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12.5 10 18 20 6.5" />
            </svg>
          </span>
        </div>
      )}
    </section>
  );
}

function WaterCard() {
  const { today, goals } = useStore();
  const pct = today.water / goals.water;
  return (
    <section className="cwat">
      <h2 className="cwat-title">Вода</h2>
      <FigIcon src={droplet.src} w={17} group="12.5% 20.83% 8.33% 20.83%" img="-6.32% -8.57%" className="cwat-drop" />
      <p className="cwat-num">{(today.water / 1000).toFixed(1).replace(".", ",")}</p>
      <p className="cwat-of">из {(goals.water / 1000).toFixed(0)} л</p>
      <div className="cwat-bar">
        <span style={{ width: `${pct * 100}%` }} />
      </div>
      <p className="cwat-pct">{Math.round(pct * 100)}% нормы</p>
    </section>
  );
}

function MacrosCard() {
  const { today, goals } = useStore();
  const rows = [
    { label: "Белки", value: `${today.protein} / ${goals.protein} г`, frac: today.protein / goals.protein, color: "#8a0027", top: 54, barTop: 74 },
    { label: "Углеводы", value: `${today.carbs} / ${goals.carbs} г`, frac: today.carbs / goals.carbs, color: "#b76b80", top: 100, barTop: 120 },
    { label: "Жиры", value: `${today.fat} / ${goals.fat} г`, frac: today.fat / goals.fat, color: "#d8aebb", top: 146, barTop: 166 },
  ];
  return (
    <section className="cmac">
      <h2 className="cmac-title">Твои БЖУ</h2>
      {rows.map((m) => (
        <span key={m.label}>
          <p className="cmac-label" style={{ top: m.top }}>{m.label}</p>
          <p className="cmac-value" style={{ top: m.top }}>{m.value}</p>
          <div className="cmac-track" style={{ top: m.barTop }}>
            <span
              style={{
                width: `${Math.min(100, m.frac * 100)}%`,
                background: m.color,
                transition: "width 0.7s cubic-bezier(0.22, 0.8, 0.36, 1)",
              }}
            />
          </div>
        </span>
      ))}
    </section>
  );
}

function WeekCard() {
  const { week } = useStore();
  const max = Math.max(...week.map((d) => d.kcal ?? 0), 1);
  return (
    <section className="cweek">
      <h2 className="cweek-title">Эта неделя</h2>
      <p className="cweek-num">{fmt(Math.round(week.slice(0, 6).reduce((s, d) => s + (d.kcal ?? 0), 0) / 6))}</p>
      <p className="cweek-avg">ккал в день, в среднем</p>
      <div className="cweek-bars">
        {week.map((d, i) => (
          <span
            key={i}
            className={i === 5 ? "today" : undefined}
            style={{
              height: d.kcal == null ? 3 : Math.max(8, Math.round(6 + 34 * (d.kcal / max))),
              background: d.kcal == null ? "#eae6e4" : undefined,
              transition: "height 0.7s cubic-bezier(0.22, 0.8, 0.36, 1)",
            }}
          />
        ))}
      </div>
      <div className="cweek-labels">
        {week.map((d, i) => (
          <span key={i} className={i === 5 ? "today" : undefined}>{d.label}</span>
        ))}
      </div>
    </section>
  );
}

function HomePage({ onScan, celebrate = 0 }: { onScan(): void; celebrate?: number }) {
  const { months } = useStore();
  // стрик: считаем подряд идущие активные дни в heatmap до сегодня
  let streak = 0;
  for (let i = months.cells.length - 1; i >= 0; i--) {
    if (months.cells[i].c !== "#efeeeb") streak++;
    else break;
  }
  return (
    <main className="content">
      <Greeting streak={Math.max(1, streak)} />
      <YearCard months={months} />
      <div className="ovh">
        <h2>Обзор за сегодня</h2>
        <span>Твой ритм дня</span>
      </div>
      <div className="orow">
        <CalorieCard celebrate={celebrate} />
        <WaterCard />
      </div>
      <div className="mrow">
        <MacrosCard />
        <WeekCard />
      </div>
      <button className="scan" onClick={onScan}>
        <FigIcon src={scanFrame.src} w={21} group="12.5%" img="-5.96%" />
        Сканировать еду
      </button>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState<"home" | "camera" | "result">("home");
  const [ghost, setGhost] = useState<"home" | "camera" | "result" | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(0);
  const { meals } = useStore();

  /* еда добавлена → главная при монтировании отыграет анимацию заливки */
  const prevMeals = useRef(meals.length);
  useEffect(() => {
    if (meals.length > prevMeals.current) setCelebrate((c) => c + 1);
    prevMeals.current = meals.length;
  }, [meals.length]);

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
          <HomePage onScan={() => go("camera")} celebrate={celebrate} />
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
            <HomePage onScan={() => undefined} celebrate={0} />
          ) : (
            <ResultPage photo={photo} onBack={() => undefined} />
          )}
        </div>
      )}
      {ghost === "camera" && <div className="cam-ghost" aria-hidden="true" />}
    </div>
  );
}
