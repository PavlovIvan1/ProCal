/* Клиент распознавания: фото уходит на СВОЙ бэкенд (/api/analyze),
 * где серверный роут дергает Polza.AI с секретным ключом.
 * Если бэкенд недоступен — детерминированный мок (гамбургер), флоу не ломается. */

import { MOCK_MEALS } from "../data/mock";

export interface Tip {
  title: string; // «Добавь салата» — нормальный тон
  detail: string; // раскрытие: ингредиенты / как сделать
}

export interface Analysis {
  meal: {
    name: string;
    sub: string;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  coach: string; // злая пассивно-агрессивная реплика коуча
  tips: Tip[];
}

async function analyze(photo: string): Promise<Analysis | null> {
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: photo }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.meal?.name && typeof data.meal.kcal === "number") {
      return data as Analysis;
    }
    return null;
  } catch {
    return null;
  }
}

/* Мок-дефолт: обычный гамбургер + злая реплика + советы */
function mockAnalysis(): Analysis {
  const meal = MOCK_MEALS[0]; // гамбургер
  return {
    meal,
    coach: "Ема. Бургер, значит. Ну удаляй сразу это приложение, я не знаю, о чём с тобой дальше разговаривать.",
    tips: [
      {
        title: "Добавь салата",
        detail: "Овощной салат 150–200 г рядом с бургером: листья, огурец, помидор. Клетчатка сбивает аппетит на второй бургер.",
      },
      {
        title: "Выпей стакан воды",
        detail: "Стакан воды 250–300 мл до еды — часто «голод» оказывается жаждой.",
      },
      {
        title: "В следующий раз — белок",
        detail: "Курица, рыба или творог 25–30 г белка держат сытость часа на три без перекусов.",
      },
    ],
  };
}

export async function recognizeMeal(photo: string): Promise<Analysis> {
  // небольшая «задумчивость» скелетона даже при мгновенном ответе
  const [real] = await Promise.all([
    analyze(photo),
    new Promise((r) => setTimeout(r, 1200)),
  ]);
  return real ?? mockAnalysis();
}
