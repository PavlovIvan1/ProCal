import { useEffect, useRef, useState } from "react";

/** Fullscreen camera view: corner viewfinder + shutter. Falls back to a mock
 *  viewfinder when no camera is available, the flow still works. */
export function CameraView({ onClose, onCapture }: { onClose(): void; onCapture(photo: string | null): void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [flash, setFlash] = useState(false);
  const [shot, setShot] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let cancelled = false;
    const request = navigator.mediaDevices?.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1920 },
      },
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

  /* Финал скана: вспышка + «заморозка» кадра прямо в рамке, потом переход */
  const finish = (url: string | null) => {
    if (!url) {
      onCapture(null);
      return;
    }
    setShot(url);
    setFlash(true);
    setTimeout(() => setFlash(false), 480);
    setTimeout(() => onCapture(url), 640);
  };

  const capture = () => {
    if (shot) return; // ждём перехода
    const v = videoRef.current;
    const fr = frameRef.current?.getBoundingClientRect();
    const vr = videoRef.current?.getBoundingClientRect();
    if (live && v && v.videoWidth > 0 && fr && vr && fr.width > 0) {
      /* Позицию рамки не считаем формулами — берём её реальный прямоугольник
       * из DOM (getBoundingClientRect), так что вырезка всегда строго по рамке,
       * независимо от тулбара Safari и translateY у .cam-center.
       * Врёт только videoWidth/Height — потому и две интерпретации. */
      const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(x, hi));

      const tryCrop = (swapped: boolean) => {
        let bw = v.videoWidth;
        let bh = v.videoHeight;
        if (swapped) [bw, bh] = [bh, bw];
        // object-fit: cover относительно реального бокса видео
        const scale = Math.max(vr.width / bw, vr.height / bh);
        const offX = (vr.width - bw * scale) / 2;
        const offY = (vr.height - bh * scale) / 2;
        const size = fr.width / scale;
        const sx = clamp((fr.left - vr.left - offX) / scale, 0, bw - size);
        const sy = clamp((fr.top - vr.top - offY) / scale, 0, bh - size);
        const c = document.createElement("canvas");
        c.width = 1080;
        c.height = 1080;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (!ctx) return null;
        ctx.drawImage(v, sx, sy, size, size, 0, 0, 1080, 1080);
        // проверка краёв: прозрачный или почти чёрный = вырезка мимо кадра
        const W = 1080;
        const m = 12;
        const d = ctx.getImageData(0, 0, W, W).data;
        const probes: Array<[number, number]> = [
          [m, m], [W - 1 - m, m], [m, W - 1 - m], [W - 1 - m, W - 1 - m],
          [W >> 1, m], [m, W >> 1], [W - 1 - m, W >> 1], [W >> 1, W - 1 - m],
        ];
        let bad = 0;
        for (const [x, y] of probes) {
          const i = (y * W + x) * 4;
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
        finish(result.canvas.toDataURL("image/jpeg", 0.9));
        return;
      }
    }
    finish(null); // no camera → demo photo on the result page
  };

  return (
    <div className="cam">
      <video ref={videoRef} playsInline muted />
      {!live && <div className="cam-fallback" />}
      {flash && <div className="cam-flash" />}
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
        <div className="cam-frame" ref={frameRef}>
          <div className="cam-veil" />
          {shot && <img className="cam-freeze" src={shot} alt="" />}
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
