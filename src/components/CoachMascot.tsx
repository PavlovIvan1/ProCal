import coachArms from "../assets/coach-arms.svg";
import coachFeet from "../assets/coach-feet.svg";
import coachBody from "../assets/coach-body.svg";
import coachFace from "../assets/coach-face.svg";
import coachFaceCalm from "../assets/coach-face-calm.svg";

/** Grumpy coach mascot, rendered from the 100×100 Figma frame.
 *  Layers are absolutely positioned inside a 96×104 box (.fs-mascot),
 *  so no layer gets cropped (the source design clipped the arms). */
export function Mascot({ mad }: { mad?: boolean }) {
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
