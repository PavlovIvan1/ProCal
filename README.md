# ProCal — Nutrition Home (PWA)

PWA-экран «Nutrition home», свёрстанный 1:1 по фрейму Figma
(`iPhone 15 Pro · Nutrition home`, node `4-4`, файл `dLLi9tSJQS9IYTTAtLyIRV`).

Стек: **React 19 + Vite + TypeScript**, чистый CSS, шрифт **Inter** (400/500/600, бандлится локально — работает офлайн).

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
```

Прод:

```bash
npm run build    # dist/ + service worker + manifest
npm run preview  # проверить прод-сборку локально
```

## PWA

- Манифест и service worker генерируются `vite-plugin-pwa` (precache всех ассетов, офлайн-режим).
- Иконки: `public/icon.svg`, `icon-192.png`, `icon-512.png` (тёмно-красный квадрат #8a0027 с белым пламенем).
- Устанавливается как приложение (Add to Home Screen / Установить) — `display: standalone`, портрет.

## Структура

```
src/
  App.tsx            — все секции экрана (status bar, greeting, год, калории, вода, макросы, неделя)
  styles/global.css  — все стили, метрики перенесены из Figma 1:1
  data/yearDays.ts   — 365 ячеек годового календаря (позиция + цвет из Figma)
  assets/*.svg       — 8 иконок, экспортированы из Figma
```

## Адаптив

Базовая ширина макета — 393px. Колонка центрируется (`max-width: 393px`), на более узких
экранах карточки сжимаются пропорционально (flex), правые элементы привязаны к правому краю,
календарь/месяцы сжимаются через `1fr`-сетки.
