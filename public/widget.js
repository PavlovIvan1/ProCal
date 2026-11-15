// ============================================================
// ProCal · In balance — виджет последнего месяца (GitHub-стайл)
// Установка:
//   1. Поставь Scriptable из App Store (бесплатно)
//   2. Скопируй этот скрипт в новый файл Scriptable (назови «ProCal»)
//   3. Добавь виджет Scriptable на экран → выбери скрипт «ProCal»
//      и семейство «Большой» (квадрат)
// ============================================================

const PALETTE = ["#efeeeb", "#f2dfe5", "#dba8b7", "#b75a75", "#8a0027"];
// [колонка-неделя, ряд-день_недели, индекс цвета] — последние 30 дней (Oct 16 – Nov 14)
const DATA = [[0,1,3],[0,2,1],[0,3,4],[0,4,3],[0,5,2],[0,6,4],[1,0,0],[1,1,0],[1,2,4],[1,3,2],[1,4,1],[1,5,4],[1,6,4],[2,0,0],[2,1,0],[2,2,4],[2,3,1],[2,4,2],[2,5,3],[2,6,4],[3,0,2],[3,1,4],[3,2,2],[3,3,1],[3,4,4],[3,5,1],[3,6,2],[4,0,4],[4,1,4],[4,2,4]];
const MONTH = "Окт 16 — Ноя 14";
const MINDFUL = 13;

// Дополнительно: если приложение ProCal доступно — подтянуть свежие данные
const LIVE_URL = "https://mine-page-pcs-consultancy.trycloudflare.com/widget-data.json";

let data = DATA;
try {
  const req = await fetch(LIVE_URL, { timeoutInterval: 2000 });
  const json = await req.json();
  if (Array.isArray(json[0])) data = json;
} catch (e) {
  // офлайн/нет туннеля — используем встроенные данные
}

const widget = new ListWidget();
widget.backgroundColor = new Color("#f3f2ef");
widget.padding = 14;

// --- шапка ---
const header = widget.addStack();
header.spacing = 4;
const title = header.addText("In balance");
title.font = Font.boldSystemFont(16);
title.textColor = new Color("#292626");
header.addSpacer();
const month = header.addText(MONTH);
month.font = Font.mediumSystemFont(10);
month.textColor = new Color("#77716f");
widget.addSpacer(10);

// --- сетка (рисуется в image) ---
const availW = config.widgetFamily === "medium" ? 155 - 28 : 329 - 28;
const availH = config.widgetFamily === "medium" ? 155 - 78 : 329 - 92;
const cols = 5;
const rows = 7;
const gap = 3;
const cell = Math.floor(Math.min((availW - gap * (cols - 1)) / cols, (availH - gap * (rows - 1)) / rows));
const gridW = cell * cols + gap * (cols - 1);
const gridH = cell * rows + gap * (rows - 1);

const ctx = new DrawContext();
ctx.size = new Size(gridW, gridH);
ctx.opaque = false;

for (const [x, y, ci] of data) {
  ctx.setFillColor(new Color(PALETTE[ci]));
  const r = cell * 0.22;
  const px = x * (cell + gap);
  const py = y * (cell + gap);
  const rect = new Rect(px, py, cell, cell);
  const path = new Path();
  path.addRoundedRect(rect, r);
  ctx.addPath(path);
  ctx.fillPath();
}
const gridImg = ctx.getImage();
widget.addImage(gridImg);
widget.addSpacer(8);

// --- подвал ---
const foot = widget.addStack();
foot.spacing = 4;
const dot = foot.addText("●");
dot.font = Font.systemFont(8);
dot.textColor = new Color("#8a0027");
const count = foot.addText(MINDFUL + " осознанных дней");
count.font = Font.mediumSystemFont(11);
count.textColor = new Color("#77716f");

Script.setWidget(widget);
Script.complete();
