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
      const side = Math.min(360, vw - 24); // .cam-frame: var(--side)
      const frameCenterY = vh / 2 - 16;
      const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(x, hi));

      /* WebKit врёт с videoWidth/Height (может отдавать ориентацию буфера,
       * а рисовать повёрнутый кадр). Пробуем обе интерпретации и берём ту,
       * где вырезка не выходит за настоящий кадр (нет чёрных/прозрачных краёв). */
      const tryCrop = (swapped: boolean) => {
        let bw = v.videoWidth;
        let bh = v.videoHeight;
        if (swapped) [bw, bh] = [bh, bw];
        const scale = Math.max(vw / bw, vh / bh);
        const offX = (vw - bw * scale) / 2;
        const offY = (vh - bh * scale) / 2;
        const size = side / scale;
        const sx = clamp((vw - side) / 2 - offX, 0, bw - size);
        const sy = clamp(frameCenterY - side / 2 - offY, 0, bh - size);
        const c = document.createElement("canvas");
        c.width = 720;
        c.height = 720;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (!ctx) return null;
        ctx.drawImage(v, sx, sy, size, size, 0, 0, 720, 720);
        // проверка краёв: прозрачный или почти чёрный = вырезка мимо кадра
        const d = ctx.getImageData(0, 0, 720, 720).data;
        const probes = [
          [8, 8], [711, 8], [8, 711], [711, 711],
          [360, 8], [8, 360], [711, 360], [360, 711],
        ];
        let bad = 0;
        for (const [x, y] of probes) {
          const i = (y * 720 + x) * 4;
          const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
          if (d[i + 3] < 16 || lum < 6) bad++;
        }
        return { canvas: c, ok: bad <= 1 };
      };

      let result = tryCrop(false);
      if (!result || !result.ok) {
        const alt = tryCrop(true);
        if (alt && (result == null || alt.ok)) result = alt;
      }
      if (result) {
        onCapture(result.canvas.toDataURL("image/jpeg", 0.85));
        return;
      }
    }
    onCapture(null); // no camera → demo photo on the result page
  };

  return (
    <div className="cam">
      <video ref={videoRef} playsInline muted />
      {!live && <div className="cam-fallback" />}
      <div className="cam-blur cam-blur-top" />
      <div className="cam-blur cam-blur-bottom" />
      <div className="cam-blur cam-blur-left" />
      <div className="cam-blur cam-blur-right" />
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
