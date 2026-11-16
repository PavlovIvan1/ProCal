import { useEffect, useState } from "react";
import backIcon from "../assets/back.svg";
import editIcon from "../assets/edit.svg";
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
      width="21"
      height="21"
      fill={on ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.2"
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
    const next = fb === kind ? null : kind;
    setFb(next);
    if (next) sendFeedback(next, analysis.meal.name, analysis.meal.kcal, analysis.coach);
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
            <div className="fs-id">
              <h2>{meal.name}</h2>
              <p className="fs-id-sub">{meal.sub}</p>
              <button className="fs-id-edit" aria-label="Изменить детали">
                <img src={editIcon.src} alt="" />
              </button>
            </div>

            {/* калории + БЖУ в одну минималистичную строку */}
            <div className="fs-line">
              <span className="fs-line-kcal">
                {meal.kcal}
                <em>ккал</em>
              </span>
              <span className="fs-line-sep" />
              <span className="fs-line-m">
                <i style={{ background: "#8a0027" }} />Б {meal.protein}
              </span>
              <span className="fs-line-m">
                <i style={{ background: "#b76b80" }} />У {meal.carbs}
              </span>
              <span className="fs-line-m">
                <i style={{ background: "#d8aebb" }} />Ж {meal.fat}
              </span>
              <span className="fs-line-est">≈ по фото</span>
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
                  <div className={"fs-tip" + (openTip === i ? " open" : "")} key={t.title + i}>
                    <button className="fs-tip-head" onClick={() => setOpenTip(openTip === i ? null : i)}>
                      <span>{t.title}</span>
                      <Chevron />
                    </button>
                    <div className="fs-tip-body">
                      <p>{t.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="fs-feedback">
              <div className="fs-feedback-main">
                <p className="fs-feedback-q">Понравилась оценка блюда?</p>
                {fb && (
                  <p className="fs-feedback-thanks fs-swap" key="fb">
                    {fb === "up" ? "Спасибо, учтём!" : "Понял, поработаю над точностью."}
                  </p>
                )}
              </div>
              <div className="fs-feedback-btns">
                <button className={fb === "up" ? "on up" : ""} onClick={() => rate("up")} aria-label="Понравилось">
                  <ThumbIcon on={fb === "up"} />
                </button>
                <button className={fb === "down" ? "on down" : ""} onClick={() => rate("down")} aria-label="Не понравилось">
                  <ThumbIcon down on={fb === "down"} />
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
            <div className="fs-line">
              <span className="fs-line-kcal sk sk-line" style={{ width: 90, height: 22 }} />
              <span className="fs-line-sep" />
              {[0, 1, 2].map((i) => (
                <span className="fs-line-m sk sk-line" key={i} style={{ width: 44, height: 12 }} />
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
