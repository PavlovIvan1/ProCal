/* Сервис распознавания еды по фото.
 *
 * Заготовка под нейронку: если задан VITE_VISION_API_URL — ходим в реальный
 * API (ожидается POST { image: dataURL } → MealEstimate JSON). Пока он не
 * задан, работает детерминированный мок: блюдо подбирается по хэшу фото,
 * поэтому одно и то же фото всегда даёт один и тот же результат.
 */

import { MOCK_MEALS, type MealEstimate } from "../data/mock";

const API_URL = import.meta.env.VITE_VISION_API_URL as string | undefined;

export async function recognizeMeal(photo: string): Promise<MealEstimate> {
  if (API_URL) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photo }),
      });
      if (res.ok) return (await res.json()) as MealEstimate;
    } catch {
      // упадём в дефолт ниже
    }
  }

  // мок-дефолт: обычный гамбургер (первый в MOCK_MEALS), с небольшой «задумчивостью»
  await new Promise((r) => setTimeout(r, 1400));
  return MOCK_MEALS[0];
}
