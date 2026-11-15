/* Сбор оценки результата распознавания (лайк/дизлайк).
 * Пишем в localStorage (мгновенно) и отправляем на /api/feedback → Supabase. */

import { deviceId } from "./device";

export type FeedbackKind = "up" | "down";

export interface FeedbackEntry {
  at: string; // ISO time
  kind: FeedbackKind;
  meal: string;
  kcal: number;
  coach: string;
}

const KEY = "pcal-feedback";

export function sendFeedback(kind: FeedbackKind, meal: string, kcal: number, coach: string) {
  const entry: FeedbackEntry = {
    at: new Date().toISOString(),
    kind,
    meal,
    kcal,
    coach,
  };
  try {
    const log: FeedbackEntry[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    log.push(entry);
    localStorage.setItem(KEY, JSON.stringify(log.slice(-200)));
  } catch {
    // приватный режим и т.п. — просто игнорируем
  }
  void fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId: deviceId(),
      kind,
      meal,
      kcal,
      coach,
    }),
  }).catch(() => {});
}
