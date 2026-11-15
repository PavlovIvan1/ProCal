import { useEffect, useState } from "react";
import backIcon from "../assets/back.svg";
import moreIcon from "../assets/more.svg";
import scanSuccess from "../assets/scan-success.svg";
import editIcon from "../assets/edit.svg";
import addIcon from "../assets/add.svg";
import burger from "../assets/burger.png";
import coachArms from "../assets/coach-arms.svg";
import coachFeet from "../assets/coach-feet.svg";
import coachBody from "../assets/coach-body.svg";
import coachFace from "../assets/coach-face.svg";
import { recognizeMeal, type Analysis } from "../services/vision";
import { macroBars, type MealEstimate } from "../data/mock";
import { addMeal } from "../store";
import { sendFeedback, type FeedbackKind } from "../services/feedback";

function ThumbIcon({ down }: { down?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={down ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M7 10v10H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3zm0 0 4-8a2.4 2.4 0 0 1 2.4 2.4V9h5.2a1.8 1.8 0 0 1 1.77 2.1l-1.2 7A1.8 1.8 0 0 1 17.4 20H7" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

/** Grumpy coach mascot, rendered from the 100×100 Figma frame scaled to 78px
 *  so no layer gets cropped (the source design clipped the arms). */
function Mascot() {
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
            <img src={coachFace.src} alt="" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function ResultPage({ photo, onBack }: { photo: string | null; onBack(): void }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [fb, setFb] = useState<FeedbackKind | null>(null);

  useEffect(() => {
    let alive = true;
    setAnalysis(null);
    setFb(null);
    recognizeMeal(photo ?? "demo").then((a) => {
      if (alive) setAnalysis(a);
    });
    return () => {
      alive = false;
    };
  }, [photo]);

  const meal: MealEstimate | null = analysis?.meal ?? null;
  const bars = meal ? macroBars(meal) : [];

  const rate = (kind: FeedbackKind) => {
    if (fb || !analysis) return;
    setFb(kind);
    sendFeedback(kind, analysis.meal.name, analysis.meal.kcal, analysis.coach);
  };

  return (
    <main className="fs-scope">
      <div className="fs-nav">
        <button className="fs-nav-btn fs-nav-back" onClick={onBack} aria-label="Назад">
          <img src={backIcon.src} alt="" />
        </button>
        <button className="fs-nav-btn fs-nav-more" aria-label="Ещё">
          <img src={moreIcon.src} alt="" />
        </button>
      </div>

      {/* фото от края до края; карточка ниже наезжает на него при скролле */}
      <div className="fs-photo">
        <img className="fs-food" src={photo ?? burger.src} alt="Сфотографированная еда" />
        <div className="fs-badge">
          <img src={scanSuccess.src} alt="" />
          <span>{analysis ? "Скан готов" : "Анализирую фото…"}</span>
        </div>
        <div className="fs-caption">
          <span>1 порция</span>
        </div>
      </div>

      <div className="fs-sheet">
        {meal && analysis ? (
          <>
            <div className="fs-id">
              <h2>{meal.name}</h2>
              <p className="fs-id-sub">{meal.sub}</p>
              <button className="fs-id-edit" aria-label="Изменить детали">
                <img src={editIcon.src} alt="" />
              </button>
            </div>

            <div className="fs-nutri">
              <div className="fs-nutri-head">
                <div className="fs-kcal">
                  <p className="fs-kcal-num">{meal.kcal}</p>
                  <p className="fs-kcal-unit">ккал</p>
                </div>
                <span className="fs-est">≈ оценка по фото</span>
              </div>
              <div className="fs-rows">
                {bars.map((b) => (
                  <div className="fs-mrow" key={b.label}>
                    <span className="fs-mrow-label">{b.label}</span>
                    <div className="fs-mrow-track">
                      <span
                        style={{
                          width: `${b.frac * 100}%`,
                          background: b.color,
                          transition: "width 0.6s cubic-bezier(0.22, 0.8, 0.36, 1)",
                        }}
                      />
                    </div>
                    <span className="fs-mrow-val">{b.value}</span>
                  </div>
                ))}
              </div>
              <p className="fs-note">Оценка по фото может отличаться. Детали можно изменить.</p>
            </div>

            <section className="fs-coach">
              <h2 className="fs-coach-mode">Режим коуча</h2>
              <div className="fs-coach-row mad">
                <Mascot />
                <div className="fs-bubble">
                  <p className="fs-bubble-title">{analysis.coach}</p>
                </div>
              </div>
            </section>

            {analysis.tips.length > 0 && (
              <div className="fs-tips">
                <p className="fs-tips-head">Что улучшить</p>
                {analysis.tips.map((t) => (
                  <details className="fs-tip" key={t.title}>
                    <summary>
                      {t.title}
                      <Chevron />
                    </summary>
                    <p>{t.detail}</p>
                  </details>
                ))}
              </div>
            )}

            <div className="fs-feedback">
              <div className="fs-feedback-main">
                <p className="fs-feedback-q">Понравилась оценка блюда?</p>
                {fb && <p className="fs-feedback-thanks">Спасибо, учтём!</p>}
              </div>
              <div className="fs-feedback-btns">
                <button className={fb === "up" ? "on up" : ""} onClick={() => rate("up")} aria-label="Понравилось" disabled={!!fb}>
                  <ThumbIcon />
                </button>
                <button className={fb === "down" ? "on down" : ""} onClick={() => rate("down")} aria-label="Не понравилось" disabled={!!fb}>
                  <ThumbIcon down />
                </button>
              </div>
            </div>

            <button className="fs-cta" onClick={() => { addMeal(meal); onBack(); }}>
              Добавить в обед
              <img src={addIcon.src} alt="" />
            </button>
          </>
        ) : (
          <>
            <div className="fs-id">
              <h2 className="sk sk-line" style={{ width: "62%" }} />
              <p className="fs-id-sub">
                <span className="sk sk-line" style={{ width: "70%" }} />
              </p>
            </div>
            <div className="fs-nutri">
              <div className="fs-nutri-head">
                <div className="fs-kcal">
                  <p className="fs-kcal-num sk sk-line" style={{ width: 64 }} />
                  <p className="fs-kcal-unit">ккал</p>
                </div>
                <span className="fs-est">≈ оценка по фото</span>
              </div>
              <div className="fs-rows">
                {[0, 1, 2].map((i) => (
                  <div className="fs-mrow" key={i}>
                    <span className="sk sk-line" style={{ width: 52 }} />
                    <div className="fs-mrow-track" />
                    <span className="sk sk-line" style={{ width: 40 }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="fs-tips">
              {[0, 1, 2].map((i) => (
                <div className="fs-tip" key={i}>
                  <span className="sk sk-line" style={{ width: "55%" }} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
