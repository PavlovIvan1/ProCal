import { useState } from "react";
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
  const quote = COACH_LINES[mode];

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
          <span>Скан готов</span>
        </div>
        <div className="fs-caption">
          <span>1 бургер</span>
        </div>
      </div>

      <div className="fs-id">
        <h2>Классический чизбургер</h2>
        <p className="fs-id-sub">Булочка, котлета, чеддер и компания.</p>
        <button className="fs-id-edit" aria-label="Изменить детали">
          <img src={editIcon} alt="" />
        </button>
      </div>

      <div className="fs-nutri">
        <div className="fs-nutri-head">
          <div className="fs-kcal">
            <p className="fs-kcal-num">640</p>
            <p className="fs-kcal-unit">ккал</p>
          </div>
          <span className="fs-est">≈ оценка по фото</span>
        </div>
        <div className="fs-rows">
          <div className="fs-mrow">
            <span className="fs-mrow-label">Белки</span>
            <div className="fs-mrow-track">
              <span style={{ width: "39%", background: "#8a0027" }} />
            </div>
            <span className="fs-mrow-val">32 г</span>
          </div>
          <div className="fs-mrow">
            <span className="fs-mrow-label">Углеводы</span>
            <div className="fs-mrow-track">
              <span style={{ width: "57%", background: "#b76b80" }} />
            </div>
            <span className="fs-mrow-val">47 г</span>
          </div>
          <div className="fs-mrow">
            <span className="fs-mrow-label">Жиры</span>
            <div className="fs-mrow-track">
              <span style={{ width: "100%", background: "#d8aebb" }} />
            </div>
            <span className="fs-mrow-val">36 г</span>
          </div>
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

      <button className="fs-cta" onClick={onBack}>
        Добавить в обед
        <img src={addIcon} alt="" />
      </button>
    </main>
  );
}
