import { spawn } from "child_process";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import {
  WIDTH,
  HEIGHT,
  FPS,
  newCanvas,
  fillBackground,
  drawCaption,
  drawWatermark,
  windowAlpha,
  titleScene,
  bulletScene,
  quizModalScene,
  quizCardScene,
  collaborationScene,
  gameGridScene,
  leaderboardScene,
  achievementScene,
  profileScene,
  phoneShortsScene,
  statScene,
  ctaScene,
  ecosystemScene,
  type Ctx,
} from "./lib/engine";
import { VIDEOS, type VideoSpec } from "./content/scripts";

type Lang = "nl" | "en";

const SCENE_DRAWERS: Record<string, (ctx: Ctx, localTime: number, alpha: number, params: any) => void> = {
  title: titleScene,
  bullet: bulletScene,
  quizModal: quizModalScene,
  quizCard: quizCardScene,
  collab: (ctx, lt, a, p) => collaborationScene(ctx, lt, a, p),
  gameGrid: gameGridScene,
  leaderboard: leaderboardScene,
  achievement: achievementScene,
  profile: profileScene,
  phoneShorts: phoneShortsScene,
  stat: statScene,
  cta: ctaScene,
  ecosystem: ecosystemScene,
};

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}: ${stderr.slice(-800)}`))));
  });
}

function buildTimeline(video: VideoSpec): { start: number; end: number }[] {
  let cursor = 0;
  return video.scenes.map((s) => {
    const entry = { start: cursor, end: cursor + s.duration };
    cursor += s.duration;
    return entry;
  });
}

async function renderOne(video: VideoSpec, lang: Lang) {
  const timeline = buildTimeline(video);
  const duration = timeline[timeline.length - 1].end;
  const frames = Math.round(duration * FPS);
  const framesDir = `tmp/frames_${video.id}_${lang}`;
  const contentMp4 = `tmp/${video.id}_${lang}_content.mp4`;
  const concatList = `tmp/${video.id}_${lang}_concat.txt`;
  const finalMp4 = `output/${video.id}-${lang}.mp4`;

  if (existsSync(framesDir)) rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });

  const captions = video.captions[lang];

  for (let i = 0; i < frames; i++) {
    const time = i / FPS;
    const { canvas, ctx } = newCanvas();
    fillBackground(ctx);

    for (let s = 0; s < video.scenes.length; s++) {
      const scene = video.scenes[s];
      const { start, end } = timeline[s];
      const alpha = windowAlpha(time, start, end, 0.4);
      if (alpha <= 0) continue;
      const drawer = SCENE_DRAWERS[scene.type];
      drawer(ctx, time - start, alpha, scene.params);
    }

    drawWatermark(ctx, 0.5);
    drawCaption(ctx, time, captions);

    const buf = canvas.toBuffer("image/png");
    writeFileSync(`${framesDir}/frame_${String(i).padStart(6, "0")}.png`, buf);
  }

  await run("ffmpeg", [
    "-framerate", String(FPS),
    "-i", `${framesDir}/frame_%06d.png`,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-preset", "fast",
    "-y", contentMp4,
  ]);

  writeFileSync(concatList, `file '${process.cwd()}/davidnet-bumper-colored.mp4'\nfile '${process.cwd()}/${contentMp4}'`);

  await run("ffmpeg", ["-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", "-y", finalMp4]);

  rmSync(framesDir, { recursive: true, force: true });
  rmSync(contentMp4, { force: true });
  rmSync(concatList, { force: true });
}

async function main() {
  mkdirSync("output", { recursive: true });
  mkdirSync("tmp", { recursive: true });

  const only = process.argv[2];
  const targets = only ? VIDEOS.filter((v) => v.id === only) : VIDEOS;
  if (targets.length === 0) {
    console.error(`No video spec matches "${only}"`);
    process.exit(1);
  }

  const total = targets.length * 2;
  let done = 0;
  const started = Date.now();

  for (const video of targets) {
    for (const lang of ["nl", "en"] as Lang[]) {
      await renderOne(video, lang);
      done++;
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      console.log(`[${done}/${total}] ${video.id}-${lang}.mp4 done (${elapsed}s elapsed)`);
    }
  }

  console.log(`\n✅ Rendered ${done} videos into output/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
