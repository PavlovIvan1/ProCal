/* Мини-стор состояния приложения. Готов к замене моков на реальный бэкенд:
 * наружу — useStore() (reactive), addAction() и addWater(). */

import { useSyncExternalStore } from "react";
import {
  GOALS,
  INITIAL_TODAY,
  mockWeek,
  generateHalfYear,
  type DayTotals,
  type Goals,
  type Heatmap,
  type MealEstimate,
} from "./data/mock";
import { deviceId } from "./services/device";

export interface AppState {
  goals: Goals;
  today: DayTotals;
  week: Array<{ label: string; kcal: number | null }>;
  months: Heatmap;
  meals: MealEstimate[]; // съеденное за сегодня
}

let state: AppState = {
  goals: GOALS,
  today: { ...INITIAL_TODAY },
  week: mockWeek(INITIAL_TODAY.kcal),
  months: generateHalfYear(),
  meals: [],
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function set(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore(): AppState {
  // третий аргумент — снапшот для SSR (мок-данные детерминированы, hydration ок)
  return useSyncExternalStore(subscribe, () => state, () => state);
}

/* Добавить распознанное блюдо в «сегодня» (и в неделю), плюс лог в Supabase */
export function addMeal(meal: MealEstimate) {
  const today: DayTotals = {
    kcal: state.today.kcal + meal.kcal,
    water: state.today.water,
    protein: state.today.protein + meal.protein,
    carbs: state.today.carbs + meal.carbs,
    fat: state.today.fat + meal.fat,
  };
  const week = state.week.map((d, i) =>
    i === 5 ? { ...d, kcal: today.kcal } : d // 5 = сегодня (суббота)
  );
  set({ today, week, meals: [...state.meals, meal] });

  void fetch("/api/meals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId: deviceId(),
      name: meal.name,
      kcal: meal.kcal,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
    }),
  }).catch(() => {});
}

/* Вода: +N мл (кнопки на карточке позже) */
export function addWater(ml: number) {
  const water = Math.max(0, Math.min(state.goals.water, state.today.water + ml));
  set({ today: { ...state.today, water } });
}
