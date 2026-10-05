import { spawn } from "child_process";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { createCanvas } from "canvas";

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 60;
const DURATION = 16.0; // Extended to 16s for the 4 scenes
const FRAMES = Math.round(DURATION * FPS);

const CAPTIONS = [
  { start: 0.5, end: 3.5, text: "Multiple question types." },
  { start: 4.5, end: 7.5, text: "From training staff..." },
  { start: 8.5, end: 11.5, text: "to having a quiz night." },
  { start: 12.5, end: 15.5, text: "With live collaboration." }
];

// Sleek, modern ease (No bouncing)
const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;

// Helpers for fade in / fade out sequences
function getSceneAlpha(time: number, start: number, end: number): number {
  if (time < start || time > end) return 0;
  const fadeIn = Math.min(1, (time - start) / 0.5);
  const fadeOut = Math.min(1, (end - time) / 0.5);
  return Math.min(fadeIn, fadeOut);
}

// -----------------------------------------------------------------
// UI Drawing Helpers based on image_282221.png
// -----------------------------------------------------------------
function drawCardWireframe(ctx: any, type: string, cx: number, cy: number) {
  const boxW = 50;
  const boxH = 10;
  const startY = cy - 25;

  // Header box for most cards
  if (type !== "Puzzle") {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(cx - boxW / 2, startY, boxW, boxH, 2);
    ctx.fill();
  }

  const contentY = startY + 16;

  if (type === "Multiple choice") {
    const colors = ["#7f1d1d", "#1e3a8a", "#4c1d95", "#064e3b"]; // Darkened versions from the screenshot
    const strokes = ["#ef4444", "#3b82f6", "#a855f7", "#10b981"];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = colors[i];
      ctx.strokeStyle = strokes[i];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx - 26 + (i % 2) * 28, contentY + Math.floor(i / 2) * 14, 24, 10, 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (type === "True / False") {
    ctx.fillStyle = "#1e3a8a"; ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - 26, contentY, 24, 24, 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#7f1d1d"; ctx.strokeStyle = "#ef4444";
    ctx.beginPath();
    ctx.roundRect(cx + 2, contentY, 24, 24, 2);
    ctx.fill(); ctx.stroke();
  } else if (type === "Slider") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - 25, contentY + 6, 50, 3);
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(cx + 5, contentY + 7.5, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "Puzzle") {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.roundRect(cx - 25, startY + i * 14, 50, 10, 2);
      ctx.fill();
    }
  } else if (type === "Type answer") {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 25, contentY, 50, 14, 2);
    ctx.fill();
    ctx.stroke();
  } else if (type === "Poll") {
    ctx.fillStyle = "#312e81";
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.roundRect(cx - 25, contentY + i * 10, 50, 6, 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (type === "Word cloud") {
    const pills = [[-15, 0, 15], [5, 0, 20], [-20, 12, 20], [5, 12, 15]];
    const colors = ["#1e3a8a", "#064e3b", "#7f1d1d", "#312e81"];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.roundRect(cx + pills[i][0], contentY + pills[i][1], pills[i][2], 8, 4);
      ctx.fill();
    }
  } else if (type === "Scale") {
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i === 2 ? "#1e3a8a" : "#ffffff";
      ctx.strokeStyle = i === 2 ? "#3b82f6" : "#ffffff";
      ctx.lineWidth = i === 2 ? 1 : 0;
      ctx.beginPath();
      ctx.roundRect(cx - 27 + i * 11, contentY + 2, 8, 12, 2);
      ctx.fill();
      if (i === 2) ctx.stroke();
    }
  } else if (type === "Information") {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(cx - 25, contentY, 50, 24, 2);
    ctx.fill();
  }
}

// -----------------------------------------------------------------
// SCENE 1: The Question Types Modal (All 9 Types)
// -----------------------------------------------------------------
function drawSceneModal(ctx: any, time: number) {
  const alpha = getSceneAlpha(time, 0, 4.0);
  if (alpha <= 0) return;

  const modalW = 680;
  const modalH = 580; // Taller for 3 rows
  const modalX = (WIDTH - modalW) / 2;
  const modalY = (HEIGHT - modalH) / 2 - 20;

  const slideIn = 1 - easeOutExpo(Math.min(1, time / 0.8));
  const currentY = modalY + slideIn * 40;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.fillStyle = "#22242a"; 
  ctx.strokeStyle = "#333640";
  ctx.lineWidth = 1;
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.roundRect(modalX, currentY, modalW, modalH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px 'Arial', sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("Choose question type", modalX + 30, currentY + 25);
  ctx.fillStyle = "#949ba4";
  ctx.font = "18px 'Arial', sans-serif";
  ctx.fillText("✕", modalX + modalW - 40, currentY + 25);

  const cards = [
    { title: "Multiple choice", sub: "Classic multi-option question" },
    { title: "True / False", sub: "Simple binary choice" },
    { title: "Slider", sub: "Numeric sliding scale" },
    { title: "Puzzle", sub: "Order or sequence items" },
    { title: "Type answer", sub: "Short text input match" },
    { title: "Poll", sub: "Gather feedback or votes" },
    { title: "Word cloud", sub: "Open text aggregation" },
    { title: "Scale", sub: "Rating scale evaluation" },
    { title: "Information", sub: "Display info slide" }
  ];

  const cardW = 190;
  const cardH = 130;
  const gap = 20;
  const startX = modalX + 30;
  const startY = currentY + 70;

  for (let i = 0; i < cards.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = startX + col * (cardW + gap);
    const cy = startY + row * (cardH + gap);

    const cardAlpha = easeOutExpo(Math.max(0, Math.min(1, (time - (0.2 + i * 0.05)) / 0.5)));
    
    if (cardAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = alpha * cardAlpha;

      ctx.fillStyle = "#16171b";
      ctx.strokeStyle = "#2d3038";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cardW, cardH, 8);
      ctx.fill();
      ctx.stroke();

      drawCardWireframe(ctx, cards[i].title, cx + cardW / 2, cy + 45);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px 'Arial', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(cards[i].title, cx + 15, cy + cardH - 35);
      ctx.fillStyle = "#949ba4";
      ctx.font = "11px 'Arial', sans-serif";
      ctx.fillText(cards[i].sub, cx + 15, cy + cardH - 18);
      ctx.restore();
    }
  }
  ctx.restore();
}

// -----------------------------------------------------------------
// SCENE 2 & 3: Live Quiz View (Dynamic)
// -----------------------------------------------------------------
function drawGenericQuizCard(ctx: any, time: number, localTime: number, alpha: number, question: string, answers: string[], correctIdx: number) {
  const w = 800, h = 460;
  const x = (WIDTH - w) / 2, y = (HEIGHT - h) / 2 - 20;

  const slideIn = 1 - easeOutExpo(Math.min(1, localTime / 0.8));
  const currentY = y + slideIn * 40;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.fillStyle = "#16171b";
  ctx.beginPath();
  ctx.roundRect(x, currentY, w, h, 12);
  ctx.fill();
  
  ctx.fillStyle = "#2d3038";
  ctx.beginPath();
  ctx.roundRect(x + 50, currentY + 30, w - 100, 6, 3);
  ctx.fill();

  const timerProgress = Math.max(0, 1 - (localTime / 2.5));
  ctx.fillStyle = "#3ab8ff";
  ctx.beginPath();
  ctx.roundRect(x + 50, currentY + 30, (w - 100) * timerProgress, 6, 3);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "500 24px 'Arial', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(question, x + w / 2, currentY + 80);

  const colors = ["#ef4444", "#3b82f6", "#eab308", "#22c55e"];
  
  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const btnW = (w - 120) / 2;
    const btnH = 90;
    const bx = x + 50 + col * (btnW + 20);
    const by = currentY + 160 + row * (btnH + 20);

    const isCorrect = (i === correctIdx);
    const revealTime = 1.8;
    
    if (localTime > revealTime && isCorrect) {
      ctx.fillStyle = "#22c55e"; 
      ctx.globalAlpha = alpha; 
    } else if (localTime > revealTime && !isCorrect) {
      ctx.fillStyle = "#1e2025"; 
      ctx.globalAlpha = alpha * 0.4; 
    } else {
      ctx.fillStyle = "#1e2025";
      ctx.globalAlpha = alpha;
    }

    ctx.strokeStyle = localTime <= revealTime ? colors[i] : (isCorrect ? "#22c55e" : "#2d3038");
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, btnW, btnH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = (localTime > revealTime && isCorrect) ? "#000000" : "#ffffff";
    ctx.font = "500 18px 'Arial', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(answers[i], bx + 30, by + btnH / 2);
  }
  ctx.restore();
}

// -----------------------------------------------------------------
// SCENE 4: Live Collaboration (Editor View)
// -----------------------------------------------------------------
function drawCursor(ctx: any, x: number, y: number, name: string) {
  ctx.save();
  ctx.translate(x, y);
  
  // Draw classic cursor arrow pointing top-left
  ctx.fillStyle = "#3b82f6"; // Blue cursor
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(16, 16);
  ctx.lineTo(7, 16);
  ctx.lineTo(0, 24);
  ctx.closePath();
  ctx.fill();
  
  // Name Tag
  ctx.fillStyle = "#3b82f6";
  ctx.beginPath();
  ctx.roundRect(14, 18, ctx.measureText(name).width + 12, 18, 4);
  ctx.fill();
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11px 'Arial', sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(name, 20, 27);
  
  ctx.restore();
}

function drawSceneCollaboration(ctx: any, time: number) {
  const alpha = getSceneAlpha(time, 12.0, 16.0);
  if (alpha <= 0) return;
  const localTime = time - 12.0;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Background Editor Layout
  ctx.fillStyle = "#111318"; // Dark sidebars
  ctx.fillRect(0, 0, 250, HEIGHT);
  ctx.fillRect(WIDTH - 300, 0, 300, HEIGHT);
  
  ctx.fillStyle = "#16171b"; // Main center canvas
  ctx.fillRect(250, 0, WIDTH - 550, HEIGHT);

  const cx = 250 + (WIDTH - 550) / 2;

  // Center Question Image Placeholder
  ctx.fillStyle = "#1e2025";
  ctx.beginPath();
  ctx.roundRect(cx - 150, 150, 300, 200, 8);
  ctx.fill();

  // 4 Colored Answer Blocks below
  const colors = ["#7f1d1d", "#1e3a8a", "#4c1d95", "#064e3b"];
  const strokes = ["#ef4444", "#3b82f6", "#a855f7", "#10b981"];
  
  for(let i=0; i<4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ax = cx - 210 + col * 220;
    const ay = 400 + row * 100;
    
    ctx.fillStyle = colors[i];
    ctx.strokeStyle = strokes[i];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(ax, ay, 200, 80, 6);
    ctx.fill();
    ctx.stroke();
  }

  // Animate Cursors using Sine easing
  const moveProgress = Math.max(0, Math.min(1, (localTime - 0.5) / 2.0));
  const easedP = easeInOutSine(moveProgress);

  // Cursor 1 (David) moving to bottom right answer block
  const dStartX = WIDTH - 200, dStartY = HEIGHT;
  const dEndX = cx + 80, dEndY = 450;
  const dX = dStartX + (dEndX - dStartX) * easedP;
  const dY = dStartY + (dEndY - dStartY) * easedP;
  drawCursor(ctx, dX, dY, "David");

  // Cursor 2 (Tom) moving to question title
  const tStartX = 100, tStartY = 50;
  const tEndX = cx - 120, tEndY = 180;
  const tX = tStartX + (tEndX - tStartX) * easedP;
  const tY = tStartY + (tEndY - tStartY) * easedP;
  drawCursor(ctx, tX, tY, "Tom");

  ctx.restore();
}

function drawFrame(frameNum: number): Buffer {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");
  const time = frameNum / FPS;

  // Global Background
  ctx.fillStyle = "#0f1115";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Render Scenes
  drawSceneModal(ctx, time);
  
  const alphaTraining = getSceneAlpha(time, 4.0, 8.0);
  if (alphaTraining > 0) {
    drawGenericQuizCard(ctx, time, time - 4.0, alphaTraining, 
      "What is the primary goal of our new compliance policy?", 
      ["Increase Sales", "Data Security", "Office Layout", "Lunch Breaks"], 1);
  }

  const alphaQuizNight = getSceneAlpha(time, 8.0, 12.0);
  if (alphaQuizNight > 0) {
    drawGenericQuizCard(ctx, time, time - 8.0, alphaQuizNight, 
      "Which movie won the Oscar for Best Picture in 1994?", 
      ["Pulp Fiction", "Shawshank Redemption", "Forrest Gump", "Lion King"], 2);
  }

  drawSceneCollaboration(ctx, time);

  // 3. Subtitles
  let activeCaption = null;
  let captionAlpha = 0;
  
  for (const cap of CAPTIONS) {
    if (time >= cap.start && time <= cap.end) {
      activeCaption = cap.text;
      captionAlpha = getSceneAlpha(time, cap.start, cap.end);
      break;
    }
  }

  if (activeCaption) {
    ctx.save();
    ctx.globalAlpha = captionAlpha;
    ctx.font = "500 28px 'Arial', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    
    // Draw subtitle over a subtle dark pill for readability in the collab scene
    const txtW = ctx.measureText(activeCaption).width;
    ctx.fillStyle = "rgba(15, 17, 21, 0.7)";
    ctx.beginPath();
    ctx.roundRect(WIDTH / 2 - txtW/2 - 20, HEIGHT - 80, txtW + 40, 40, 20);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillText(activeCaption, WIDTH / 2, HEIGHT - 60);
    ctx.restore();
  }

  return canvas.toBuffer("image/png");
}

async function generateSequence() {
  const dir = "frames_quiz_full";
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
  mkdirSync(dir, { recursive: true });

  console.log(`🎬 Generating full 4-part Quiz sequence (${DURATION} seconds)...`);
  for (let i = 0; i < FRAMES; i++) {
    const buffer = drawFrame(i);
    writeFileSync(`${dir}/frame_${String(i).padStart(6, "0")}.png`, buffer);

    if (i % 30 === 0) {
      process.stdout.write(`\r   Progress: ${Math.round((i / FRAMES) * 100)}%`);
    }
  }
  console.log("\n✅ Frames complete. Rendering main sequence...");

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-framerate", String(FPS),
      "-i", `${dir}/frame_%06d.png`,
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-preset", "fast",
      "-y", "davidnet-quiz-part.mp4"
    ]);
    proc.on("close", (code) => code === 0 ? resolve() : reject(new Error(`Code ${code}`)));
  });

  console.log("🔗 Concatenating with monochrome bumper...");
  writeFileSync("concat.txt", "file 'davidnet-quiz-part.mp4'\nfile 'davidnet-bumper-mono.mp4'");

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-f", "concat",
      "-safe", "0",
      "-i", "concat.txt",
      "-c", "copy",
      "-y", "davidnet-quiz-final.mp4"
    ]);

    proc.on("close", (code) => {
      if (code === 0) {
        console.log("🚀 Success! Final video created: davidnet-quiz-final.mp4");
        resolve();
      } else {
        reject(new Error(`FFmpeg concat exited with code ${code}`));
      }
    });
  });
  
  // Cleanup temp files
  try {
    rmSync(dir, { recursive: true, force: true });
    rmSync("concat.txt");
    rmSync("davidnet-quiz-part.mp4");
  } catch {}
}

generateSequence().catch(console.error);