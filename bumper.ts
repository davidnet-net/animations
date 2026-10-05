import { spawn } from "child_process";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { createCanvas } from "canvas";

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 60;
const DURATION = 2.2; // Slightly extended to let tagline settle
const FRAMES = Math.round(DURATION * FPS);

const TEXT = "Davidnet";
const CHARS = TEXT.split("");
const TAGLINE = "davidnet.net";

// Playful and bouncy overshoot easing function (backOut)
const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Smooth ease out for tagline fade/slide in
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

function drawFrame(frameNum: number, useLogoColors: boolean): Buffer {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const progress = frameNum / FRAMES;

  if (useLogoColors) {
    // Dynamic playful animated gradient shifting slightly over time
    const shift = Math.sin(progress * Math.PI * 1.5) * 40;
    const gradient = ctx.createLinearGradient(0 + shift, 0, WIDTH - shift, HEIGHT);
    gradient.addColorStop(0, "#fdfbf7");
    gradient.addColorStop(0.5, "#e8edf5");
    gradient.addColorStop(1, "#fef6f6");
    ctx.fillStyle = gradient;
  } else {
    // Pure black background for the monochrome version
    ctx.fillStyle = "#000000";
  }
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // --- Draw Main Title ---
  ctx.font = "bold 180px 'Arial', sans-serif";
  ctx.textBaseline = "middle";

  const totalWidth = ctx.measureText(TEXT).width;
  let currentX = (WIDTH - totalWidth) / 2;

  const revealDuration = 0.45;
  const staggerDelay = revealDuration / CHARS.length;
  const singleCharDuration = 0.3;

  let globalOpacity = 1;
  if (progress > 0.85) {
    globalOpacity = 1 - (progress - 0.85) / 0.15;
  }
  ctx.globalAlpha = globalOpacity;

  for (let i = 0; i < CHARS.length; i++) {
    const char = CHARS[i];
    const charWidth = ctx.measureText(char).width;

    const startTime = i * staggerDelay;
    let charProgress = 0;

    if (progress >= startTime) {
      charProgress = Math.min(1, (progress - startTime) / singleCharDuration);
    }

    if (charProgress > 0) {
      const charCenterX = currentX + charWidth / 2;
      const charCenterY = HEIGHT / 2 - 30; // Shifted slightly up to make room for tagline
      const easedProgress = easeOutBack(charProgress);

      ctx.save();

      ctx.translate(charCenterX, charCenterY);
      ctx.scale(easedProgress, easedProgress);
      ctx.translate(-charCenterX, -charCenterY);

      if (useLogoColors) {
        // Soft shadow only for colored version
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.fillText(char, currentX + 4, charCenterY + 6);

        // Split the text coloring using the logo's cyan and red
        const charGradient = ctx.createLinearGradient(currentX, 0, currentX + charWidth, 0);
        if (i < Math.floor(CHARS.length / 2)) {
          charGradient.addColorStop(0, "#3ab8ff");
          charGradient.addColorStop(1, "#1e90ff");
        } else {
          charGradient.addColorStop(0, "#ff3b3b");
          charGradient.addColorStop(1, "#dc2626");
        }
        ctx.fillStyle = charGradient;
      } else {
        // Fully white text with zero shadow for monochrome version
        ctx.fillStyle = "#ffffff";
      }

      ctx.fillText(char, currentX, charCenterY);
      ctx.restore();
    }

    currentX += charWidth;
  }

  // --- Draw Tagline (davidnet.net) ---
  const taglineStartProgress = 0.45; // Starts appearing after main letters bounce in
  if (progress >= taglineStartProgress) {
    const taglineProgress = Math.min(1, (progress - taglineStartProgress) / 0.35);
    const easedTagline = easeOutCubic(taglineProgress);

    ctx.save();
    ctx.globalAlpha = globalOpacity * easedTagline;
    ctx.font = "500 36px 'Arial', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Slight upward floating slide into place
    const slideOffset = (1 - easedTagline) * 15;

    if (useLogoColors) {
      ctx.fillStyle = "#64748b"; // Sleek muted slate for colored version
    } else {
      ctx.fillStyle = "#a1a1aa"; // Clean light gray for mono version
    }

    ctx.fillText(TAGLINE, WIDTH / 2, HEIGHT / 2 + 85 + slideOffset);
    ctx.restore();
  }

  return canvas.toBuffer("image/png");
}

async function renderVideo(outputFilename: string, useLogoColors: boolean) {
  const dir = useLogoColors ? "frames_color" : "frames_mono";
  try {
    rmSync(dir, { recursive: true });
  } catch {}
  mkdirSync(dir, { recursive: true });

  console.log(`🎬 Generating frames for ${outputFilename} (with playful gradient & tagline)...`);
  for (let i = 0; i < FRAMES; i++) {
    const buffer = drawFrame(i, useLogoColors);
    writeFileSync(`${dir}/frame_${String(i).padStart(6, "0")}.png`, buffer);

    if (i % 15 === 0) {
      process.stdout.write(`\r   Progress: ${Math.round((i / FRAMES) * 100)}%`);
    }
  }
  console.log("\n");

  return new Promise<void>((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-framerate",
      String(FPS),
      "-i",
      `${dir}/frame_%06d.png`,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "fast",
      "-y",
      outputFilename,
    ]);

    proc.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ Created: ${outputFilename}`);
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}

async function generateAll() {
  await renderVideo("davidnet-bumper-mono.mp4", false);
  await renderVideo("davidnet-bumper-colored.mp4", true);
  
  // Clean up frame folders
  try {
    rmSync("frames_mono", { recursive: true });
    rmSync("frames_color", { recursive: true });
  } catch {}

  console.log("✨ All updated bumpers generated successfully!");
}

generateAll().catch(console.error);