/* Сбор оценки результата распознавания (лайк/дизлайк).
 * Пока пишем в localStorage — когда появится бэкенд, поменяем на POST. */

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
  // TODO: POST на бэкенд, когда появится
  console.info("[feedback]", entry);
}
