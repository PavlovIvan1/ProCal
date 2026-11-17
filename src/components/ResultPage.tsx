import { useEffect, useLayoutEffect, useRef, useState } from "react";
import backIcon from "../assets/back.svg";
import addIcon from "../assets/add.svg";
import burger from "../assets/burger.png";
import coachArms from "../assets/coach-arms.svg";
import coachFeet from "../assets/coach-feet.svg";
import coachBody from "../assets/coach-body.svg";
import coachFace from "../assets/coach-face.svg";
import coachFaceCalm from "../assets/coach-face-calm.svg";
import flameIcon from "../assets/flame.svg";
import dropletIcon from "../assets/droplet.svg";
import { recognizeMeal, type Analysis } from "../services/vision";
import { macroBars, type MealEstimate } from "../data/mock";
import { addMeal } from "../store";
import { sendFeedback, type FeedbackKind } from "../services/feedback";

function ThumbIcon({ down, on }: { down?: boolean; on?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill={on ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={down ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M7 10v10H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3zm0 0 4-8a2.4 2.4 0 0 1 2.4 2.4V9h5.2a1.8 1.8 0 0 1 1.77 2.1l-1.2 7A1.8 1.8 0 0 1 17.4 20H7" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

/** Grumpy coach mascot, rendered from the 100×100 Figma frame scaled to 78px
 *  so no layer gets cropped (the source design clipped the arms). */
function Mascot({ mad }: { mad: boolean }) {
  return (
    <div className="fs-mascot" aria-hidden="true">
      <div className="fs-mascot-scale">
        <div className="fs-part body">
          <img src={coachBody.src} alt="" />
        </div>
        <div className="fs-part arms">
          <span style={{ inset: "-11.91% -3.51%" }}>
            <img src={coachArms.src} alt="" />
          </span>
        </div>
        <div className="fs-part feet">
          <span style={{ inset: "-35% -9.21%" }}>
            <img src={coachFeet.src} alt="" />
          </span>
        </div>
        <div className="fs-part face">
          <span style={{ inset: "-6.48% -5.15%" }}>
            <img src={mad ? coachFace.src : coachFaceCalm.src} alt="" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* Совет-«FAQ»: анимируется ТОЛЬКО высота (замер scrollHeight в px).
 * Никаких переходов текста/цвета внутри — поэтому ноль дёрганья. */
function TipItem({ title, detail, open, onToggle }: { title: string; detail: string; open: boolean; onToggle(): void }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);

  useLayoutEffect(() => {
    if (open && innerRef.current) setH(innerRef.current.scrollHeight);
  }, [open, detail]);

  return (
    <div className="fs-tip">
      <button className="fs-tip-head" onClick={onToggle}>
        <span>{title}</span>
        <Chevron />
      </button>
      <div className="fs-tip-body" style={{ height: open ? h : 0 }}>
        <div className="fs-tip-inner" ref={innerRef}>
          <p>{detail}</p>
        </div>
      </div>
    </div>
  );
}

export function ResultPage({ photo, onBack }: { photo: string | null; onBack(): void }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [mode, setMode] = useState<"angry" | "calm">("angry");
  const [openTip, setOpenTip] = useState<number | null>(0);
  const [fb, setFb] = useState<FeedbackKind | null>(null);

  useEffect(() => {
    let alive = true;
    setAnalysis(null);
    setFb(null);
    setOpenTip(0);
    recognizeMeal(photo ?? "demo").then((a) => {
      if (alive) setAnalysis(a);
    });
    return () => {
      alive = false;
    };
  }, [photo]);

  const meal: MealEstimate | null = analysis?.meal ?? null;
  const bars = meal ? macroBars(meal) : [];
  const quote = analysis ? (mode === "angry" ? analysis.coach : analysis.coachCalm) : "";

  const rate = (kind: FeedbackKind) => {
    if (!analysis) return;
    setFb(kind);
    sendFeedback(kind, analysis.meal.name, analysis.meal.kcal, analysis.coach);
  };

  return (
    <main className="fs-scope">
      <div className="fs-nav">
        <button className="fs-nav-btn fs-nav-back" onClick={onBack} aria-label="Назад">
          <img src={backIcon.src} alt="" />
        </button>
      </div>

      {/* фото от края до края; карточка ниже наезжает на него при скролле */}
      <div className="fs-photo">
        <img className="fs-food" src={photo ?? burger.src} alt="Сфотографированная еда" />
      </div>

      <div className="fs-sheet">
        {meal && analysis ? (
          <>
            {/* название слева, ккал справа — вместо иконки «изменить» */}
            <div className="fs-id">
              <div className="fs-id-row">
                <h2>{meal.name}</h2>
                <span className="fs-id-kcal">
                  {meal.kcal}
                  <em>ккал</em>
                </span>
              </div>
              <p className="fs-id-sub">{meal.sub}</p>
            </div>

            {/* БЖУ: сетка из трёх колонок, чистый текст */}
            <div className="fs-macros">
              {bars.map((b, i) => (
                <span className="fs-mcell" key={b.label}>
                  {i > 0 && <span className="fs-mcell-sep" />}
                  <span className="fs-mcell-label">{b.label}</span>
                  <span className="fs-mcell-val">
                    {b.value.replace(" г", "")}
                    <em> г</em>
                  </span>
                </span>
              ))}
            </div>

            <section className="fs-coach">
              <div className="fs-coach-head">
                <h2 className="fs-coach-mode">Режим коуча</h2>
                <div className="fs-mood">
                  <button
                    className={mode === "angry" ? "on" : ""}
                    onClick={() => setMode("angry")}
                    aria-label="Злой коуч"
                  >
                    <img src={flameIcon.src} alt="" />
                  </button>
                  <button
                    className={mode === "calm" ? "on" : ""}
                    onClick={() => setMode("calm")}
                    aria-label="Спокойный коуч"
                  >
                    <img src={dropletIcon.src} alt="" />
                  </button>
                </div>
              </div>
              <div className={"fs-coach-row" + (mode === "angry" ? " mad" : "")}>
                <Mascot mad={mode === "angry"} />
                <div className="fs-bubble">
                  <p className="fs-bubble-title fs-swap" key={mode + (meal.name ?? "")}>
                    {quote}
                  </p>
                </div>
              </div>
            </section>

            {analysis.tips.length > 0 && (
              <div className="fs-tips">
                {analysis.tips.map((t, i) => (
                  <TipItem
                    key={t.title + i}
                    title={t.title}
                    detail={t.detail}
                    open={openTip === i}
                    onToggle={() => setOpenTip(openTip === i ? null : i)}
                  />
                ))}
              </div>
            )}

            {/* оценка: после голоса вопрос и кнопки мягко сменяются строкой «спасибо» на том же месте */}
            <div className="fs-feedback">
              {fb ? (
                <p className="fs-feedback-thanks fs-swap" key="thanks">
                  {fb === "up" ? "Спасибо, учтём!" : "Учёл, поработаем над точностью."}
                </p>
              ) : (
                <>
                  <p className="fs-feedback-q">Понравилась оценка блюда?</p>
                  <div className="fs-feedback-btns">
                    <button className={fb === "up" ? "on" : ""} onClick={() => rate("up")} aria-label="Понравилось">
                      <ThumbIcon on={fb === "up"} />
                    </button>
                    <button className={fb === "down" ? "on" : ""} onClick={() => rate("down")} aria-label="Не понравилось">
                      <ThumbIcon down on={fb === "down"} />
                    </button>
                  </div>
                </>
              )}
            </div>

            <button className="fs-cta" onClick={() => { addMeal(meal); onBack(); }}>
              Добавить в обед
              <img src={addIcon.src} alt="" />
            </button>

            <p className="fs-note">Оценка по фото может отличаться. Точность растёт с каждым сканом.</p>
          </>
        ) : (
          <>
            <div className="fs-id">
              <div className="fs-id-row">
                <h2 className="sk sk-line" style={{ width: "55%" }} />
                <span className="sk sk-line" style={{ width: 70, height: 14 }} />
              </div>
              <p className="fs-id-sub">
                <span className="sk sk-line" style={{ width: "70%" }} />
              </p>
            </div>
            <div className="fs-macros">
              {[0, 1, 2].map((i) => (
                <span className="fs-mcell" key={i}>
                  {i > 0 && <span className="fs-mcell-sep" />}
                  <span className="sk sk-line" style={{ width: 46, height: 10 }} />
                  <span className="sk sk-line" style={{ width: 40, height: 13 }} />
                </span>
              ))}
            </div>
            <div className="fs-tips">
              {[0, 1].map((i) => (
                <div className="fs-tip" key={i}>
                  <span className="fs-tip-head">
                    <span className="sk sk-line" style={{ width: "55%" }} />
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
