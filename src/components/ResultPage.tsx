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
import coachFaceCalm from "../assets/coach-face-calm.svg";
import flameIcon from "../assets/flame.svg";
import dropletIcon from "../assets/droplet.svg";
import { recognizeMeal } from "../services/vision";
import { macroBars, type MealEstimate } from "../data/mock";
import { addMeal } from "../store";

const COACH_LINES = {
  angry: {
    title: "Серьёзно?! Опять бургер.",
    lines: [
      "Ты вообще помнишь, как выглядит салат?",
      "И молчу про твои 1,2 литра воды — позор.",
      "Завтра жду овощи. Это не просьба.",
    ],
  },
  calm: {
    title: "Ну, сойдёт.",
    lines: ["Белок есть — уже неплохо.", "Но зелень на тарелке была бы кстати.", "Не переживай, я всё записал."],
  },
};

/** Grumpy coach mascot, rendered from the 100×100 Figma frame scaled to 78px
 *  so no layer gets cropped (the source design clipped the arms). */
function Mascot({ mad }: { mad: boolean }) {
  return (
    <div className="fs-mascot" aria-hidden="true">
      <div className="fs-mascot-scale">
        <div className="fs-part body">
          <img src={coachBody} alt="" />
        </div>
        <div className="fs-part arms">
          <span style={{ inset: "-11.91% -3.51%" }}>
            <img src={coachArms} alt="" />
          </span>
        </div>
        <div className="fs-part feet">
          <span style={{ inset: "-35% -9.21%" }}>
            <img src={coachFeet} alt="" />
          </span>
        </div>
        <div className="fs-part face">
          <span style={{ inset: "-6.48% -5.15%" }}>
            <img src={mad ? coachFace : coachFaceCalm} alt="" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function ResultPage({ photo, onBack }: { photo: string | null; onBack(): void }) {
  const [mode, setMode] = useState<"angry" | "calm">("angry");
  const [meal, setMeal] = useState<MealEstimate | null>(null);

  useEffect(() => {
    let alive = true;
    setMeal(null);
    recognizeMeal(photo ?? "demo").then((m) => {
      if (alive) setMeal(m);
    });
    return () => {
      alive = false;
    };
  }, [photo]);

  const quote = COACH_LINES[mode];
  const bars = meal ? macroBars(meal) : [];

  return (
    <main className="content fs-scope">
      <div className="fs-nav">
        <button className="fs-nav-btn fs-nav-back" onClick={onBack} aria-label="Назад">
          <img src={backIcon} alt="" />
        </button>
        <p className="fs-nav-title">Разбор твоей еды</p>
        <button className="fs-nav-btn fs-nav-more" aria-label="Ещё">
          <img src={moreIcon} alt="" />
        </button>
      </div>

      <div className="fs-photo">
        <img className="fs-food" src={photo ?? burger} alt="Сфотографированная еда" />
        <div className="fs-badge">
          <img src={scanSuccess} alt="" />
          <span>{meal ? "Скан готов" : "Анализирую фото…"}</span>
        </div>
        <div className="fs-caption">
          <span>1 порция</span>
        </div>
      </div>

      {meal ? (
        <>
          <div className="fs-id">
            <h2>{meal.name}</h2>
            <p className="fs-id-sub">{meal.sub}</p>
            <button className="fs-id-edit" aria-label="Изменить детали">
              <img src={editIcon} alt="" />
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
            <div className="fs-coach-head">
              <h2 className="fs-coach-mode">Режим коуча</h2>
              <div className="fs-mood">
                <button
                  className={mode === "angry" ? "on" : ""}
                  onClick={() => setMode("angry")}
                  aria-label="Злой коуч"
                >
                  <img src={flameIcon} alt="" />
                </button>
                <button
                  className={mode === "calm" ? "on" : ""}
                  onClick={() => setMode("calm")}
                  aria-label="Спокойный коуч"
                >
                  <img src={dropletIcon} alt="" />
                </button>
              </div>
            </div>
            <div className={"fs-coach-row" + (mode === "angry" ? " mad" : "")}>
              <Mascot mad={mode === "angry"} />
              <div className="fs-bubble">
                <p className="fs-bubble-title">{quote.title}</p>
                <div className="fs-bubble-text">
                  {quote.lines.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <button className="fs-cta" onClick={() => { addMeal(meal); onBack(); }}>
            Добавить в обед
            <img src={addIcon} alt="" />
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
        </>
      )}
    </main>
  );
}
