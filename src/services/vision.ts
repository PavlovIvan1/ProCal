/* Распознавание еды по фото через Polza.AI (агрегатор, OpenAI-совместимый API).
 *
 * Нужен ключ: VITE_POLZA_API_KEY (см. .env.local), модель — VITE_POLZA_MODEL
 * (по умолчанию openai/gpt-4o, умеет смотреть картинки).
 * Запасные варианты: VITE_VISION_API_URL — свой endpoint; иначе детерминированный
 * мок (гамбургер), чтобы флоу никогда не ломался.
 */

import { MOCK_MEALS, type MealEstimate } from "../data/mock";

export interface Tip {
  title: string; // «Добавь салата» — нормальный тон
  detail: string; // раскрытие: ингредиенты / как сделать
}

export interface Analysis {
  meal: MealEstimate;
  coach: string; // злая пассивно-агрессивная реплика коуча
  tips: Tip[];
}

const POLZA_URL = "https://polza.ai/api/v1/chat/completions";
const POLZA_KEY = import.meta.env.VITE_POLZA_API_KEY as string | undefined;
const POLZA_MODEL = (import.meta.env.VITE_POLZA_MODEL as string | undefined) || "openai/gpt-4o";
const CUSTOM_URL = import.meta.env.VITE_VISION_API_URL as string | undefined;

const SYSTEM_PROMPT = `Ты — вредный пассивно-агрессивный коуч по питанию в приложении ProCal.
Тебе присылают фото еды. Ты обязан:
1) Оценить блюдо и его КБЖУ (реалистично, по фото).
2) Ответить ОДНОЙ злой пассивно-агрессивной репликой на русском (1–2 предложения).
   Примеры тона: «Ну конечно, бургер. Удали приложение сразу, чего уж там.»,
   «Смело. Овощи у тебя в списке хотя бы существуют?» — ядовито, но без мата.
3) Дать 2–3 коротких СОВЕТА уже нормальным, доброжелательным тоном, как улучшить
   приём пищи (например «Добавь салата», «Выпей стакан воды»).
   У каждого совета detail — раскрытие на 1–2 предложения: что конкретно добавить
   (ингредиенты, объём, чем заменить).
Ответь СТРОГО одним JSON-объектом без markdown и пояснений:
{"name":"Название блюда","sub":"короткое описание состава","kcal":число,
 "protein":число,"carbs":число,"fat":число,
 "coach":"злая реплика","tips":[{"title":"…","detail":"…"}]}`;

function extractJson(text: string): Analysis | null {
  try {
    const cleaned = text.replace(/```json?|```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    const raw = JSON.parse(cleaned.slice(start, end + 1));
    if (typeof raw.name !== "string" || typeof raw.kcal !== "number") return null;
    return {
      meal: {
        name: raw.name,
        sub: String(raw.sub ?? ""),
        kcal: Math.round(raw.kcal),
        protein: Math.round(raw.protein ?? 0),
        carbs: Math.round(raw.carbs ?? 0),
        fat: Math.round(raw.fat ?? 0),
      },
      coach: typeof raw.coach === "string" && raw.coach.trim() ? raw.coach.trim() : "Ну что, опять ты со своей «сбалансированной» едой. Я даже комментировать не буду. Хотя нет — буду: ккал посчитал, твоей дисциплине поставил минус.",
      tips: Array.isArray(raw.tips)
        ? raw.tips
            .filter((t: unknown): t is Tip => !!t && typeof (t as Tip).title === "string")
            .slice(0, 3)
            .map((t: Tip) => ({ title: t.title, detail: String(t.detail ?? "") }))
        : [],
    };
  } catch {
    return null;
  }
}

async function askPolza(photo: string): Promise<Analysis | null> {
  if (!POLZA_KEY) return null;
  try {
    const res = await fetch(POLZA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${POLZA_KEY}`,
      },
      body: JSON.stringify({
        model: POLZA_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Вот фото моей еды. Оцени по схеме." },
              { type: "image_url", image_url: { url: photo } },
            ],
          },
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    return text ? extractJson(text) : null;
  } catch {
    return null;
  }
}

/* Свой бэкенд/endpoint, если когда-нибудь появится */
async function askCustom(photo: string): Promise<Analysis | null> {
  if (!CUSTOM_URL) return null;
  try {
    const res = await fetch(CUSTOM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: photo }),
    });
    if (!res.ok) return null;
    return extractJson(await res.text());
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
        title: "На следующей раз — белок",
        detail: "Курица, рыба или творог 25–30 г белка держат сытость часа на три без перекусов.",
      },
    ],
  };
}

export async function recognizeMeal(photo: string): Promise<Analysis> {
  // небольшая «задумчивость» скелетона даже в моке
  const [real] = await Promise.all([
    (async () => (await askPolza(photo)) ?? (await askCustom(photo)))(),
    new Promise((r) => setTimeout(r, 1200)),
  ]);
  return real ?? mockAnalysis();
}
