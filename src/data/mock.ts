/* Мок-данные и генерация. Всё, что позже заменит реальный бэкенд / нейронка. */

export interface Goals {
  kcal: number;
  water: number; // мл
  protein: number;
  carbs: number;
  fat: number;
}

export interface DayTotals {
  kcal: number;
  water: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEstimate {
  name: string;
  sub: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface HeatCell {
  x: number; // колонка-неделя
  y: number; // ряд-день недели (0 = Пн)
  c: string; // цвет
}

export interface Heatmap {
  cells: HeatCell[];
  cols: number;
  months: Array<{ name: string; col: number }>;
  mindful: number; // «осознанные» дни в окне
}

export const GOALS: Goals = {
  kcal: 2000,
  water: 2000,
  protein: 120,
  carbs: 250,
  fat: 67,
};

/* Сидированный PRNG — heatmap стабильна между рендерами */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HEAT_PALETTE = ["#efeeeb", "#f2dfe5", "#dba8b7", "#b75a75", "#8a0027"];

/* Реалистичный GitHub-стайл heatmap: серии-стрики, выходные слабее,
 * редкие пропуски, изредка очень активные дни. */
export function generateHalfYear(days = 182): Heatmap {
  const rnd = mulberry32(20261114);
  const cells: HeatCell[] = [];
  const months: Array<{ name: string; col: number }> = [];
  let mindful = 0;

  const MONTH_NAMES = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
  const today = new Date(2026, 10, 14); // «сегодня» мока — 14 ноя 2026
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));

  let streak = 0;
  let col = 0;
  let lastMonth = -1;

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dow = (d.getDay() + 6) % 7; // Пн = 0 … Вс = 6

    if (d.getMonth() !== lastMonth) {
      months.push({ name: MONTH_NAMES[d.getMonth()], col });
      lastMonth = d.getMonth();
    }

    // вероятность активности: стрик поджигает, выходные остужают
    let p = 0.52 + Math.min(streak, 6) * 0.075;
    if (dow >= 5) p *= 0.62;
    if (i === days - 1) p = 1; // сегодня — точно был

    let level = 0;
    if (rnd() < p) {
      streak++;
      level = 1 + Math.floor(rnd() * 2.6);
      if (rnd() < 0.16) level = Math.min(4, level + 1);
      if (streak >= 4 && rnd() < 0.3) level = 4;
      level = Math.max(1, Math.min(4, level));
    } else {
      streak = 0;
    }

    if (level >= 2) mindful++;
    cells.push({ x: col, y: dow, c: HEAT_PALETTE[level] });
    if (dow === 6) col++;
  }

  return { cells, cols: col + 1, months, mindful };
}

/* Неделя: Пн–Пт история + сегодня (заполнено моком) + завтра (пусто) */
export function mockWeek(todayKcal: number): Array<{ label: string; kcal: number | null }> {
  return [
    { label: "П", kcal: 1520 },
    { label: "В", kcal: 1610 },
    { label: "С", kcal: 1380 },
    { label: "Ч", kcal: 1730 },
    { label: "П", kcal: 1570 },
    { label: "С", kcal: todayKcal }, // сегодня
    { label: "В", kcal: null }, // впереди
  ];
}

/* Стартовое состояние «сегодня» — согласовано с макетом Figma */
export const INITIAL_TODAY: DayTotals = {
  kcal: 1460,
  water: 1200,
  protein: 82,
  carbs: 158,
  fat: 56,
};

/* ---- Мок-база распознавания еды (потом заменит ответ нейронки) ---- */
export const MOCK_MEALS: MealEstimate[] = [
  {
    name: "Классический чизбургер",
    sub: "Булочка, котлета, чеддер и компания.",
    kcal: 640, protein: 32, carbs: 47, fat: 36,
  },
  {
    name: "Овсянка с бананом и мёдом",
    sub: "На воде, с щепоткой корицы.",
    kcal: 380, protein: 12, carbs: 68, fat: 7,
  },
  {
    name: "Куриная грудка с рисом",
    sub: "Гриль, с брокколи на пару.",
    kcal: 520, protein: 46, carbs: 54, fat: 12,
  },
  {
    name: "Лосось на гриле с овощами",
    sub: "Порция 180 г, лимон и травы.",
    kcal: 610, protein: 42, carbs: 18, fat: 38,
  },
  {
    name: "Паста карбонара",
    sub: "Сливки, панчетта, пармезан.",
    kcal: 780, protein: 29, carbs: 84, fat: 36,
  },
  {
    name: "Греческий салат с фетой",
    sub: "Огурцы, томаты, оливки, фета.",
    kcal: 320, protein: 11, carbs: 14, fat: 26,
  },
];

/* Доли калорий макросов в блюде (для полосок на странице результата),
 * нормированные на максимум — как договорились в дизайне. */
export function macroBars(m: MealEstimate) {
  const kcalP = m.protein * 4;
  const kcalC = m.carbs * 4;
  const kcalF = m.fat * 9;
  const max = Math.max(kcalP, kcalC, kcalF, 1);
  return [
    { label: "Белки", value: `${m.protein} г`, frac: kcalP / max, color: "#8a0027" },
    { label: "Углеводы", value: `${m.carbs} г`, frac: kcalC / max, color: "#b76b80" },
    { label: "Жиры", value: `${m.fat} г`, frac: kcalF / max, color: "#d8aebb" },
  ];
}
