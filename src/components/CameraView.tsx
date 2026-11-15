import { useEffect, useRef, useState } from "react";

/** Fullscreen camera view: corner viewfinder + shutter. Falls back to a mock
 *  viewfinder when no camera is available, the flow still works. */
export function CameraView({ onClose, onCapture }: { onClose(): void; onCapture(photo: string | null): void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let cancelled = false;
    const request = navigator.mediaDevices?.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    request
      ?.then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const v = videoRef.current;
        if (v) {
          v.srcObject = s;
          v.play().catch(() => {});
        }
        setLive(true);
      })
      .catch(() => setLive(false));
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const v = videoRef.current;
    if (live && v && v.videoWidth > 0) {
      // размер и позиция рамки ровно как в CSS (.cam-frame, .cam-center):
      // контейнер (рамка + подсказка ~31px) центрирован на 50% экрана
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const side = Math.min(330, vw - 36); // .cam-frame: min(330px, 100% - 36px)
      const frameCenterY = vh / 2 - 16;

      // iOS отдаёт ландшафтный буфер при портретном отображении:
      // приводим кадр к ориентации экрана (поворот 90° по часовой)
      let src: HTMLVideoElement | HTMLCanvasElement = v;
      let bw = v.videoWidth;
      let bh = v.videoHeight;
      const mismatch = v.videoWidth > v.videoHeight !== vh >= vw;
      if (mismatch) {
        const norm = document.createElement("canvas");
        norm.width = v.videoHeight;
        norm.height = v.videoWidth;
        const nctx = norm.getContext("2d");
        if (nctx) {
          nctx.translate(norm.width, 0);
          nctx.rotate(Math.PI / 2);
          nctx.drawImage(v, 0, 0);
          src = norm;
          bw = norm.width;
          bh = norm.height;
        }
      }

      // пересчёт области экрана в пиксели видео (object-fit: cover)
      const scale = Math.max(vw / bw, vh / bh);
      const offX = (vw - bw * scale) / 2;
      const offY = (vh - bh * scale) / 2;
      let sx = (vw - side) / 2 - offX;
      let sy = frameCenterY - side / 2 - offY;
      const size = side / scale;
      sx = Math.max(0, Math.min(sx, bw - size));
      sy = Math.max(0, Math.min(sy, bh - size));

      const c = document.createElement("canvas");
      c.width = 720;
      c.height = 720;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(src, sx, sy, size, size, 0, 0, 720, 720);
        onCapture(c.toDataURL("image/jpeg", 0.85));
        return;
      }
    }
    onCapture(null); // no camera → demo photo on the result page
  };

  return (
    <div className="cam">
      <video ref={videoRef} playsInline muted />
      {!live && <div className="cam-fallback" />}
      <button className="cam-close" onClick={onClose} aria-label="Закрыть камеру">
        <svg viewBox="0 0 20 20" width="18" height="18">
          <path
            d="M5.5 5.5 L14.5 14.5 M14.5 5.5 L5.5 14.5"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </button>
      <div className="cam-center">
        <div className="cam-frame">
          <span className="cam-c tl" />
          <span className="cam-c tr" />
          <span className="cam-c bl" />
          <span className="cam-c br" />
        </div>
        <p className="cam-hint">Помести еду в рамку</p>
      </div>
      <button className="cam-shutter" onClick={capture} aria-label="Сделать фото">
        <span />
      </button>
    </div>
  );
}
