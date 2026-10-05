import { createCanvas, type CanvasRenderingContext2D as NodeCtx } from "canvas";

export const WIDTH = 1280;
export const HEIGHT = 720;
export const FPS = 60;
export const BG = "#0f1115";

export const PALETTE = {
  cyan: "#3ab8ff",
  blue: "#3b82f6",
  red: "#ff3b3b",
  redDark: "#dc2626",
  green: "#22c55e",
  purple: "#a855f7",
  gold: "#eab308",
  silver: "#cbd5e1",
  bronze: "#d97706",
  muted: "#949ba4",
  panel: "#16171b",
  panelBorder: "#2d3038",
};

export type Ctx = NodeCtx;

// -----------------------------------------------------------------
// Easing
// -----------------------------------------------------------------
export const easeOutExpo = (t: number): number => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * Math.max(0, Math.min(1, t))) - 1) / 2;
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
export const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const x = Math.max(0, Math.min(1, t));
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// Fade in/out window helper: 1 inside [start,end] with 0.4s crossfades, 0 outside.
export function windowAlpha(time: number, start: number, end: number, fade = 0.4): number {
  if (time < start || time > end) return 0;
  const fadeIn = Math.min(1, (time - start) / fade);
  const fadeOut = Math.min(1, (end - time) / fade);
  return Math.min(fadeIn, fadeOut);
}

export function stagger(localTime: number, index: number, delay: number, dur: number): number {
  return easeOutExpo(clamp01((localTime - index * delay) / dur));
}

// -----------------------------------------------------------------
// Caption overlay (burned-in subtitles, used for both NL and EN renders)
// -----------------------------------------------------------------
export interface Caption {
  start: number;
  end: number;
  text: string;
}

export function drawCaption(ctx: Ctx, time: number, captions: Caption[]) {
  let active: string | null = null;
  let alpha = 0;
  for (const cap of captions) {
    if (time >= cap.start && time <= cap.end) {
      active = cap.text;
      alpha = windowAlpha(time, cap.start, cap.end, 0.25);
      break;
    }
  }
  if (!active) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = "600 30px 'Arial', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const txtW = ctx.measureText(active).width;
  ctx.fillStyle = "rgba(10, 11, 14, 0.78)";
  ctx.beginPath();
  (ctx as any).roundRect(WIDTH / 2 - txtW / 2 - 24, HEIGHT - 92, txtW + 48, 46, 23);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillText(active, WIDTH / 2, HEIGHT - 69);
  ctx.restore();
}

// -----------------------------------------------------------------
// Shared chrome: logo wordmark watermark (small, top-left) for brand continuity
// -----------------------------------------------------------------
export function drawWatermark(ctx: Ctx, alpha = 0.55) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = "bold 20px 'Arial', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = PALETTE.cyan;
  ctx.fillText("david", 36, 32);
  const w = ctx.measureText("david").width;
  ctx.fillStyle = PALETTE.red;
  ctx.fillText("net", 36 + w, 32);
  ctx.restore();
}

function drawPill(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string) {
  ctx.beginPath();
  (ctx as any).roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// ===================================================================
// SCENES — each takes (ctx, localTime, alpha, params) and draws itself
// centered in the frame. alpha is the scene-level fade in/out (0..1).
// ===================================================================

export interface TitleParams {
  heading: string;
  sub?: string;
  accent: string;
}
export function titleScene(ctx: Ctx, localTime: number, alpha: number, p: TitleParams) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const pop = easeOutBack(clamp01(localTime / 0.6));
  ctx.save();
  ctx.translate(WIDTH / 2, HEIGHT / 2 - (p.sub ? 24 : 0));
  ctx.scale(0.85 + pop * 0.15, 0.85 + pop * 0.15);
  ctx.font = "bold 72px 'Arial', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(p.heading, 0, 0);
  ctx.restore();

  const underlineW = clamp01((localTime - 0.3) / 0.5) * 140;
  ctx.fillStyle = p.accent;
  ctx.fillRect(WIDTH / 2 - underlineW / 2, HEIGHT / 2 + (p.sub ? 24 : 54), underlineW, 5);

  if (p.sub) {
    const subAlpha = clamp01((localTime - 0.5) / 0.5);
    ctx.save();
    ctx.globalAlpha = alpha * subAlpha;
    ctx.font = "500 28px 'Arial', sans-serif";
    ctx.fillStyle = PALETTE.muted;
    ctx.textAlign = "center";
    ctx.fillText(p.sub, WIDTH / 2, HEIGHT / 2 + 70);
    ctx.restore();
  }
  ctx.restore();
}

export interface BulletParams {
  heading: string;
  bullets: string[];
  accent: string;
}
export function bulletScene(ctx: Ctx, localTime: number, alpha: number, p: BulletParams) {
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.font = "bold 44px 'Arial', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(p.heading, WIDTH / 2, 130);

  const rowH = 76;
  const totalH = p.bullets.length * rowH;
  const startY = HEIGHT / 2 - totalH / 2 + 30;
  const boxW = 560;
  const boxX = WIDTH / 2 - boxW / 2;

  p.bullets.forEach((text, i) => {
    const reveal = stagger(localTime, i, 0.25, 0.5);
    if (reveal <= 0) return;
    const y = startY + i * rowH;
    const slide = (1 - reveal) * 40;

    ctx.save();
    ctx.globalAlpha = alpha * reveal;
    ctx.translate(slide, 0);

    // checkmark badge
    ctx.beginPath();
    ctx.arc(boxX + 20, y + 20, 18, 0, Math.PI * 2);
    ctx.fillStyle = p.accent;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(boxX + 12, y + 20);
    ctx.lineTo(boxX + 18, y + 27);
    ctx.lineTo(boxX + 29, y + 11);
    ctx.stroke();

    ctx.font = "500 26px 'Arial', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e6e7ea";
    ctx.fillText(text, boxX + 52, y + 20);
    ctx.restore();
  });

  ctx.restore();
}

// ---- Quiz: 9 question-type modal grid (generalized from the original quiz bumper) ----
const QUESTION_CARDS = [
  { title: "Multiple choice", sub: "Classic multi-option question" },
  { title: "True / False", sub: "Simple binary choice" },
  { title: "Slider", sub: "Numeric sliding scale" },
  { title: "Puzzle", sub: "Order or sequence items" },
  { title: "Type answer", sub: "Short text input match" },
  { title: "Poll", sub: "Gather feedback or votes" },
  { title: "Word cloud", sub: "Open text aggregation" },
  { title: "Scale", sub: "Rating scale evaluation" },
  { title: "Information", sub: "Display info slide" },
];

function drawCardWireframe(ctx: Ctx, type: string, cx: number, cy: number) {
  const boxW = 50;
  const boxH = 10;
  const startY = cy - 25;

  if (type !== "Puzzle") {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    (ctx as any).roundRect(cx - boxW / 2, startY, boxW, boxH, 2);
    ctx.fill();
  }
  const contentY = startY + 16;

  if (type === "Multiple choice") {
    const colors = ["#7f1d1d", "#1e3a8a", "#4c1d95", "#064e3b"];
    const strokes = ["#ef4444", "#3b82f6", "#a855f7", "#10b981"];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = colors[i];
      ctx.strokeStyle = strokes[i];
      ctx.lineWidth = 1;
      ctx.beginPath();
      (ctx as any).roundRect(cx - 26 + (i % 2) * 28, contentY + Math.floor(i / 2) * 14, 24, 10, 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (type === "True / False") {
    ctx.fillStyle = "#1e3a8a"; ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 1;
    ctx.beginPath(); (ctx as any).roundRect(cx - 26, contentY, 24, 24, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#7f1d1d"; ctx.strokeStyle = "#ef4444";
    ctx.beginPath(); (ctx as any).roundRect(cx + 2, contentY, 24, 24, 2); ctx.fill(); ctx.stroke();
  } else if (type === "Slider") {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - 25, contentY + 6, 50, 3);
    ctx.fillStyle = "#3b82f6"; ctx.beginPath(); ctx.arc(cx + 5, contentY + 7.5, 4, 0, Math.PI * 2); ctx.fill();
  } else if (type === "Puzzle") {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 3; i++) { ctx.beginPath(); (ctx as any).roundRect(cx - 25, startY + i * 14, 50, 10, 2); ctx.fill(); }
  } else if (type === "Type answer") {
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 1.5;
    ctx.beginPath(); (ctx as any).roundRect(cx - 25, contentY, 50, 14, 2); ctx.fill(); ctx.stroke();
  } else if (type === "Poll") {
    ctx.fillStyle = "#312e81"; ctx.strokeStyle = "#8b5cf6"; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); (ctx as any).roundRect(cx - 25, contentY + i * 10, 50, 6, 2); ctx.fill(); ctx.stroke(); }
  } else if (type === "Word cloud") {
    const pills = [[-15, 0, 15], [5, 0, 20], [-20, 12, 20], [5, 12, 15]];
    const colors = ["#1e3a8a", "#064e3b", "#7f1d1d", "#312e81"];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      (ctx as any).roundRect(cx + pills[i][0], contentY + pills[i][1], pills[i][2], 8, 4);
      ctx.fill();
    }
  } else if (type === "Scale") {
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i === 2 ? "#1e3a8a" : "#ffffff";
      ctx.strokeStyle = i === 2 ? "#3b82f6" : "#ffffff";
      ctx.lineWidth = i === 2 ? 1 : 0;
      ctx.beginPath();
      (ctx as any).roundRect(cx - 27 + i * 11, contentY + 2, 8, 12, 2);
      ctx.fill();
      if (i === 2) ctx.stroke();
    }
  } else if (type === "Information") {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); (ctx as any).roundRect(cx - 25, contentY, 50, 24, 2); ctx.fill();
  }
}

export function quizModalScene(ctx: Ctx, localTime: number, alpha: number, p: { heading: string }) {
  const modalW = 680, modalH = 580;
  const modalX = (WIDTH - modalW) / 2;
  const modalY = (HEIGHT - modalH) / 2 - 20;
  const slideIn = 1 - easeOutExpo(clamp01(localTime / 0.8));
  const currentY = modalY + slideIn * 40;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#22242a"; ctx.strokeStyle = "#333640"; ctx.lineWidth = 1;
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 30;
  ctx.beginPath(); (ctx as any).roundRect(modalX, currentY, modalW, modalH, 12); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px 'Arial', sans-serif";
  ctx.textBaseline = "top"; ctx.textAlign = "left";
  ctx.fillText(p.heading, modalX + 30, currentY + 25);

  const cardW = 190, cardH = 130, gap = 20;
  const startX = modalX + 30, startY = currentY + 70;

  for (let i = 0; i < QUESTION_CARDS.length; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    const cx = startX + col * (cardW + gap);
    const cy = startY + row * (cardH + gap);
    const cardAlpha = easeOutExpo(clamp01((localTime - (0.2 + i * 0.05)) / 0.5));
    if (cardAlpha <= 0) continue;

    ctx.save();
    ctx.globalAlpha = alpha * cardAlpha;
    ctx.fillStyle = "#16171b"; ctx.strokeStyle = "#2d3038"; ctx.lineWidth = 1;
    ctx.beginPath(); (ctx as any).roundRect(cx, cy, cardW, cardH, 8); ctx.fill(); ctx.stroke();
    drawCardWireframe(ctx, QUESTION_CARDS[i].title, cx + cardW / 2, cy + 45);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 13px 'Arial', sans-serif"; ctx.textAlign = "left";
    ctx.fillText(QUESTION_CARDS[i].title, cx + 15, cy + cardH - 35);
    ctx.fillStyle = PALETTE.muted; ctx.font = "11px 'Arial', sans-serif";
    ctx.fillText(QUESTION_CARDS[i].sub, cx + 15, cy + cardH - 18);
    ctx.restore();
  }
  ctx.restore();
}

export interface QuizCardParams {
  question: string;
  answers: string[];
  correctIdx: number;
}
export function quizCardScene(ctx: Ctx, localTime: number, alpha: number, p: QuizCardParams) {
  const w = 800, h = 460;
  const x = (WIDTH - w) / 2, y = (HEIGHT - h) / 2 - 20;
  const slideIn = 1 - easeOutExpo(clamp01(localTime / 0.8));
  const currentY = y + slideIn * 40;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PALETTE.panel;
  ctx.beginPath(); (ctx as any).roundRect(x, currentY, w, h, 12); ctx.fill();

  ctx.fillStyle = PALETTE.panelBorder;
  ctx.beginPath(); (ctx as any).roundRect(x + 50, currentY + 30, w - 100, 6, 3); ctx.fill();

  const timerProgress = Math.max(0, 1 - localTime / 2.5);
  ctx.fillStyle = PALETTE.cyan;
  ctx.beginPath(); (ctx as any).roundRect(x + 50, currentY + 30, (w - 100) * timerProgress, 6, 3); ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "500 24px 'Arial', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillText(p.question, x + w / 2, currentY + 80);

  const colors = ["#ef4444", "#3b82f6", "#eab308", "#22c55e"];
  for (let i = 0; i < 4; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const btnW = (w - 120) / 2, btnH = 90;
    const bx = x + 50 + col * (btnW + 20);
    const by = currentY + 160 + row * (btnH + 20);
    const isCorrect = i === p.correctIdx;
    const revealTime = 1.8;

    if (localTime > revealTime && isCorrect) { ctx.fillStyle = PALETTE.green; ctx.globalAlpha = alpha; }
    else if (localTime > revealTime && !isCorrect) { ctx.fillStyle = "#1e2025"; ctx.globalAlpha = alpha * 0.4; }
    else { ctx.fillStyle = "#1e2025"; ctx.globalAlpha = alpha; }

    ctx.strokeStyle = localTime <= revealTime ? colors[i] : isCorrect ? PALETTE.green : PALETTE.panelBorder;
    ctx.lineWidth = 1;
    ctx.beginPath(); (ctx as any).roundRect(bx, by, btnW, btnH, 8); ctx.fill(); ctx.stroke();

    ctx.fillStyle = localTime > revealTime && isCorrect ? "#000000" : "#ffffff";
    ctx.font = "500 18px 'Arial', sans-serif";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(p.answers[i], bx + 30, by + btnH / 2);
  }
  ctx.restore();
}

function drawCursor(ctx: Ctx, x: number, y: number, name: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = PALETTE.blue;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(16, 16); ctx.lineTo(7, 16); ctx.lineTo(0, 24);
  ctx.closePath(); ctx.fill();
  ctx.font = "bold 11px 'Arial', sans-serif";
  const tagW = ctx.measureText(name).width + 12;
  ctx.fillStyle = PALETTE.blue;
  ctx.beginPath(); (ctx as any).roundRect(14, 18, tagW, 18, 4); ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle"; ctx.textAlign = "left";
  ctx.fillText(name, 20, 27);
  ctx.restore();
}

export function collaborationScene(ctx: Ctx, localTime: number, alpha: number, p: { names: [string, string] }) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#111318";
  ctx.fillRect(0, 0, 250, HEIGHT);
  ctx.fillRect(WIDTH - 300, 0, 300, HEIGHT);
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(250, 0, WIDTH - 550, HEIGHT);

  const cx = 250 + (WIDTH - 550) / 2;
  ctx.fillStyle = "#1e2025";
  ctx.beginPath(); (ctx as any).roundRect(cx - 150, 150, 300, 200, 8); ctx.fill();

  const colors = ["#7f1d1d", "#1e3a8a", "#4c1d95", "#064e3b"];
  const strokes = ["#ef4444", "#3b82f6", "#a855f7", "#10b981"];
  for (let i = 0; i < 4; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const ax = cx - 210 + col * 220, ay = 400 + row * 100;
    ctx.fillStyle = colors[i]; ctx.strokeStyle = strokes[i]; ctx.lineWidth = 1;
    ctx.beginPath(); (ctx as any).roundRect(ax, ay, 200, 80, 6); ctx.fill(); ctx.stroke();
  }

  const moveProgress = clamp01((localTime - 0.5) / 2.0);
  const easedP = easeInOutSine(moveProgress);

  const dStartX = WIDTH - 200, dStartY = HEIGHT;
  const dEndX = cx + 80, dEndY = 450;
  drawCursor(ctx, dStartX + (dEndX - dStartX) * easedP, dStartY + (dEndY - dStartY) * easedP, p.names[0]);

  const tStartX = 100, tStartY = 50;
  const tEndX = cx - 120, tEndY = 180;
  drawCursor(ctx, tStartX + (tEndX - tStartX) * easedP, tStartY + (tEndY - tStartY) * easedP, p.names[1]);

  ctx.restore();
}

// ---- Community games: grid of game tiles ----
export interface GameGridParams {
  heading: string;
  games: { name: string; color: string }[];
  accent: string;
}
export function gameGridScene(ctx: Ctx, localTime: number, alpha: number, p: GameGridParams) {
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.font = "bold 40px 'Arial', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(p.heading, WIDTH / 2, 90);

  const cols = 3;
  const cardW = 230, cardH = 170, gap = 26;
  const rows = Math.ceil(p.games.length / cols);
  const gridW = cols * cardW + (cols - 1) * gap;
  const gridH = rows * cardH + (rows - 1) * gap;
  const startX = (WIDTH - gridW) / 2;
  const startY = 190 + (HEIGHT - 190 - gridH) / 2 - 20;

  p.games.forEach((g, i) => {
    const reveal = stagger(localTime, i, 0.12, 0.55);
    if (reveal <= 0) return;
    const col = i % cols, row = Math.floor(i / cols);
    const cx = startX + col * (cardW + gap);
    const cy = startY + row * (cardH + gap);
    const pop = easeOutBack(reveal);

    ctx.save();
    ctx.globalAlpha = alpha * clamp01(reveal * 1.4);
    ctx.translate(cx + cardW / 2, cy + cardH / 2);
    ctx.scale(0.8 + pop * 0.2, 0.8 + pop * 0.2);
    ctx.translate(-(cx + cardW / 2), -(cy + cardH / 2));

    ctx.fillStyle = PALETTE.panel; ctx.strokeStyle = PALETTE.panelBorder; ctx.lineWidth = 1;
    ctx.beginPath(); (ctx as any).roundRect(cx, cy, cardW, cardH, 12); ctx.fill(); ctx.stroke();

    ctx.fillStyle = g.color;
    ctx.beginPath(); (ctx as any).roundRect(cx + 20, cy + 20, cardW - 40, 80, 8); ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px 'Arial', sans-serif";
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText(g.name, cx + 20, cy + cardH - 24);
    ctx.restore();
  });

  ctx.restore();
}

// ---- Community games: leaderboard ----
export interface LeaderboardParams {
  heading: string;
  entries: { name: string; score: string }[];
  accent: string;
}
export function leaderboardScene(ctx: Ctx, localTime: number, alpha: number, p: LeaderboardParams) {
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.font = "bold 40px 'Arial', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(p.heading, WIDTH / 2, 90);

  const panelW = 620, rowH = 72;
  const panelX = (WIDTH - panelW) / 2;
  const startY = 190;
  const medal = [PALETTE.gold, PALETTE.silver, PALETTE.bronze];

  p.entries.forEach((e, i) => {
    const reveal = stagger(localTime, i, 0.18, 0.5);
    if (reveal <= 0) return;
    const y = startY + i * (rowH + 12);
    const slide = (1 - reveal) * 120;

    ctx.save();
    ctx.globalAlpha = alpha * reveal;
    ctx.translate(slide, 0);

    ctx.fillStyle = PALETTE.panel; ctx.strokeStyle = PALETTE.panelBorder; ctx.lineWidth = 1;
    ctx.beginPath(); (ctx as any).roundRect(panelX, y, panelW, rowH, 10); ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.arc(panelX + 46, y + rowH / 2, 20, 0, Math.PI * 2);
    ctx.fillStyle = medal[i] ?? PALETTE.panelBorder;
    ctx.fill();
    ctx.fillStyle = i < 3 ? "#1a1a1a" : "#ffffff";
    ctx.font = "bold 18px 'Arial', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), panelX + 46, y + rowH / 2 + 1);

    ctx.fillStyle = "#ffffff";
    ctx.font = "500 22px 'Arial', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(e.name, panelX + 90, y + rowH / 2);

    ctx.fillStyle = p.accent;
    ctx.font = "bold 22px 'Arial', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(e.score, panelX + panelW - 30, y + rowH / 2);

    ctx.restore();
  });

  ctx.restore();
}

// ---- Community games: achievements ----
export interface AchievementParams {
  heading: string;
  badges: string[];
  accent: string;
}
export function achievementScene(ctx: Ctx, localTime: number, alpha: number, p: AchievementParams) {
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.font = "bold 40px 'Arial', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(p.heading, WIDTH / 2, 110);

  const gap = 90;
  const totalW = (p.badges.length - 1) * (140 + gap) + 140;
  const startX = WIDTH / 2 - totalW / 2 + 70;
  const cy = HEIGHT / 2 + 40;

  p.badges.forEach((label, i) => {
    const reveal = stagger(localTime, i, 0.3, 0.6);
    if (reveal <= 0) return;
    const pop = easeOutBack(reveal);
    const cx = startX + i * (140 + gap);

    ctx.save();
    ctx.globalAlpha = alpha * clamp01(reveal * 1.4);
    ctx.translate(cx, cy);
    ctx.scale(pop, pop);

    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fillStyle = p.accent;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px 'Arial', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("★", 0, 2);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = alpha * clamp01(reveal * 1.4);
    ctx.font = "500 18px 'Arial', sans-serif";
    ctx.fillStyle = "#e6e7ea";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText(label, cx, cy + 80);
    ctx.restore();
  });

  ctx.restore();
}

// ---- Community games: player profile card ----
export interface ProfileParams {
  heading: string;
  name: string;
  stats: { label: string; value: string }[];
  accent: string;
}
export function profileScene(ctx: Ctx, localTime: number, alpha: number, p: ProfileParams) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const panelW = 640, panelH = 420;
  const x = (WIDTH - panelW) / 2, y = (HEIGHT - panelH) / 2;
  const slideIn = 1 - easeOutExpo(clamp01(localTime / 0.7));
  const currentY = y + slideIn * 30;

  ctx.fillStyle = PALETTE.panel; ctx.strokeStyle = PALETTE.panelBorder; ctx.lineWidth = 1;
  ctx.beginPath(); (ctx as any).roundRect(x, currentY, panelW, panelH, 16); ctx.fill(); ctx.stroke();

  ctx.beginPath();
  ctx.arc(x + panelW / 2, currentY + 100, 50, 0, Math.PI * 2);
  ctx.fillStyle = p.accent;
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px 'Arial', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(p.name.charAt(0).toUpperCase(), x + panelW / 2, currentY + 102);

  ctx.font = "bold 28px 'Arial', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(p.name, x + panelW / 2, currentY + 175);

  const statW = panelW / p.stats.length;
  p.stats.forEach((s, i) => {
    const reveal = stagger(localTime, i, 0.2, 0.5);
    if (reveal <= 0) return;
    const sx = x + statW * i + statW / 2;
    ctx.save();
    ctx.globalAlpha = alpha * reveal;
    ctx.font = "bold 34px 'Arial', sans-serif";
    ctx.fillStyle = p.accent;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(s.value, sx, currentY + 270);
    ctx.font = "500 16px 'Arial', sans-serif";
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText(s.label, sx, currentY + 305);
    ctx.restore();
  });

  ctx.font = "500 18px 'Arial', sans-serif";
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText(p.heading, x + panelW / 2, currentY + panelH - 30);

  ctx.restore();
}

// ---- Shorts: vertical phone mockup ----
export interface PhoneShortsParams {
  heading: string;
  mode: "feed" | "engage" | "upload";
  accent: string;
}
export function phoneShortsScene(ctx: Ctx, localTime: number, alpha: number, p: PhoneShortsParams) {
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.font = "bold 36px 'Arial', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(p.heading, WIDTH / 2, 70);

  const phoneW = 290, phoneH = 560;
  const px = WIDTH / 2 - phoneW / 2, py = 120;
  const slideIn = 1 - easeOutExpo(clamp01(localTime / 0.6));

  ctx.save();
  ctx.translate(0, slideIn * 30);

  // bezel
  ctx.fillStyle = "#1a1b20"; ctx.strokeStyle = "#33353c"; ctx.lineWidth = 3;
  ctx.beginPath(); (ctx as any).roundRect(px - 10, py - 10, phoneW + 20, phoneH + 20, 36); ctx.fill(); ctx.stroke();

  // video surface - subtle animated gradient to suggest motion
  const shift = Math.sin(localTime * 1.3) * 30;
  const grad = ctx.createLinearGradient(px, py + shift, px + phoneW, py + phoneH - shift);
  grad.addColorStop(0, "#1e2a4a");
  grad.addColorStop(1, "#1a1b20");
  ctx.fillStyle = grad;
  ctx.beginPath(); (ctx as any).roundRect(px, py, phoneW, phoneH, 26); ctx.fill();

  // feed progress segments (top)
  if (p.mode === "feed") {
    const segW = (phoneW - 40) / 3;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath(); (ctx as any).roundRect(px + 20 + i * (segW + 5), py + 16, segW, 4, 2); ctx.fill();
    }
    const fillW = segW * clamp01(localTime / 2.2);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); (ctx as any).roundRect(px + 20, py + 16, fillW, 4, 2); ctx.fill();
  }

  // side action column: like / comment / share
  const icons: { symbol: string; label: string }[] = [
    { symbol: "♥", label: "2.4k" },
    { symbol: "◬", label: "318" },
    { symbol: "➤", label: "Share" },
  ];
  icons.forEach((icon, i) => {
    const iconReveal = p.mode === "engage" ? stagger(localTime, i, 0.3, 0.5) : clamp01((localTime - 0.3) / 0.5);
    if (iconReveal <= 0) return;
    const icx = px + phoneW - 36;
    const icy = py + phoneH - 280 + i * 70;
    const pop = p.mode === "engage" ? easeOutBack(iconReveal) : 1;

    ctx.save();
    ctx.globalAlpha = alpha * iconReveal;
    ctx.translate(icx, icy);
    ctx.scale(pop, pop);
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = p.mode === "engage" && iconReveal > 0.9 ? p.accent : "rgba(255,255,255,0.12)";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px 'Arial', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(icon.symbol, 0, -1);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = alpha * iconReveal;
    ctx.font = "500 12px 'Arial', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(icon.label, icx, icy + 34);
    ctx.restore();
  });

  if (p.mode === "upload") {
    const progress = clamp01(localTime / 2.0);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath(); (ctx as any).roundRect(px + 30, py + phoneH / 2 - 30, phoneW - 60, 60, 12); ctx.fill();
    ctx.fillStyle = p.accent;
    ctx.beginPath(); (ctx as any).roundRect(px + 30, py + phoneH / 2 - 30, (phoneW - 60) * progress, 60, 12); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px 'Arial', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(progress < 1 ? `Uploading ${Math.round(progress * 100)}%` : "Live ✓", px + phoneW / 2, py + phoneH / 2);
  }

  // caption line near bottom of the short, like real on-video captions
  ctx.font = "600 15px 'Arial', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillText("@davidnet", px + 20, py + phoneH - 50);

  ctx.restore();
  ctx.restore();
}

// ---- Stat counter ----
export interface StatParams {
  heading: string;
  value: number;
  suffix: string;
  label: string;
  accent: string;
}
export function statScene(ctx: Ctx, localTime: number, alpha: number, p: StatParams) {
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.font = "500 28px 'Arial', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText(p.heading, WIDTH / 2, 230);

  const progress = easeOutExpo(clamp01(localTime / 1.6));
  const current = Math.round(p.value * progress);

  ctx.font = "bold 120px 'Arial', sans-serif";
  ctx.fillStyle = p.accent;
  ctx.fillText(`${current.toLocaleString("en-US")}${p.suffix}`, WIDTH / 2, 280);

  ctx.font = "500 26px 'Arial', sans-serif";
  ctx.fillStyle = "#e6e7ea";
  ctx.fillText(p.label, WIDTH / 2, 430);

  ctx.restore();
}

// ---- CTA closing card ----
export interface CtaParams {
  heading: string;
  sub: string;
  accent: string;
}
export function ctaScene(ctx: Ctx, localTime: number, alpha: number, p: CtaParams) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const pop = easeOutBack(clamp01(localTime / 0.5));
  ctx.save();
  ctx.translate(WIDTH / 2, HEIGHT / 2 - 50);
  ctx.scale(0.85 + pop * 0.15, 0.85 + pop * 0.15);
  ctx.font = "bold 50px 'Arial', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(p.heading, 0, 0);
  ctx.restore();

  const subAlpha = clamp01((localTime - 0.3) / 0.4);
  ctx.save();
  ctx.globalAlpha = alpha * subAlpha;
  ctx.font = "500 26px 'Arial', sans-serif";
  ctx.fillStyle = PALETTE.muted;
  ctx.textAlign = "center";
  ctx.fillText(p.sub, WIDTH / 2, HEIGHT / 2 + 20);
  ctx.restore();

  const btnAlpha = clamp01((localTime - 0.6) / 0.4);
  if (btnAlpha > 0) {
    const btnW = 320, btnH = 64;
    const bx = WIDTH / 2 - btnW / 2, by = HEIGHT / 2 + 60;
    ctx.save();
    ctx.globalAlpha = alpha * btnAlpha;
    ctx.fillStyle = p.accent;
    ctx.beginPath(); (ctx as any).roundRect(bx, by, btnW, btnH, 32); ctx.fill();
    ctx.fillStyle = "#0b0c0f";
    ctx.font = "bold 24px 'Arial', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("davidnet.net", bx + btnW / 2, by + btnH / 2 + 1);
    ctx.restore();
  }

  ctx.restore();
}

// ---- Brand ecosystem: four app chips converging ----
export interface EcosystemParams {
  heading: string;
  apps: { name: string; color: string }[];
}
export function ecosystemScene(ctx: Ctx, localTime: number, alpha: number, p: EcosystemParams) {
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.font = "bold 40px 'Arial', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(p.heading, WIDTH / 2, 100);

  const centerX = WIDTH / 2, centerY = HEIGHT / 2 + 40;
  const converge = easeOutExpo(clamp01((localTime - 0.4) / 1.4));
  const radius = 260 * (1 - converge * 0.72);

  p.apps.forEach((app, i) => {
    const angle = (Math.PI * 2 * i) / p.apps.length - Math.PI / 2;
    const reveal = stagger(localTime, i, 0.1, 0.4);
    if (reveal <= 0) return;
    const cx = centerX + Math.cos(angle) * radius;
    const cy = centerY + Math.sin(angle) * radius;

    ctx.save();
    ctx.globalAlpha = alpha * reveal;
    ctx.beginPath();
    ctx.arc(cx, cy, 64, 0, Math.PI * 2);
    ctx.fillStyle = app.color;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px 'Arial', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(app.name, cx, cy);
    ctx.restore();
  });

  if (converge > 0.85) {
    const logoAlpha = clamp01((converge - 0.85) / 0.15);
    ctx.save();
    ctx.globalAlpha = alpha * logoAlpha;
    ctx.font = "bold 34px 'Arial', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = PALETTE.cyan;
    const w1 = ctx.measureText("david").width;
    ctx.fillText("david", centerX - w1 / 2, centerY);
    ctx.fillStyle = PALETTE.red;
    ctx.fillText("net", centerX - w1 / 2 + w1 + ctx.measureText("net").width / 2, centerY);
    ctx.restore();
  }

  ctx.restore();
}

// -----------------------------------------------------------------
// Frame factory
// -----------------------------------------------------------------
export function newCanvas() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d") as unknown as Ctx;
  return { canvas, ctx };
}

export function fillBackground(ctx: Ctx) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}
