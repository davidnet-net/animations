import { PALETTE, type Caption } from "../lib/engine";

export type SceneType =
  | "title"
  | "bullet"
  | "quizModal"
  | "quizCard"
  | "collab"
  | "gameGrid"
  | "leaderboard"
  | "achievement"
  | "profile"
  | "phoneShorts"
  | "stat"
  | "cta"
  | "ecosystem";

export interface SceneSpec {
  type: SceneType;
  duration: number;
  params: Record<string, any>;
}

export interface VideoSpec {
  id: string;
  category: "quiz" | "games" | "shorts" | "brand";
  accent: string;
  scenes: SceneSpec[];
  captions: { nl: Caption[]; en: Caption[] };
}

const QUIZ = PALETTE.cyan;
const GAMES = PALETTE.purple;
const SHORTS = PALETTE.red;
const BRAND = PALETTE.gold;

export const VIDEOS: VideoSpec[] = [
  // ============================= QUIZ (6) =============================
  {
    id: "quiz-question-types",
    category: "quiz",
    accent: QUIZ,
    scenes: [
      { type: "quizModal", duration: 5.5, params: { heading: "Choose question type" } },
      { type: "cta", duration: 3.0, params: { heading: "Davidnet Quiz", sub: "9 ways to ask anything", accent: QUIZ } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 3.0, text: "9 manieren om een vraag te stellen." },
        { start: 3.2, end: 5.3, text: "Van multiple choice tot word clouds." },
        { start: 5.9, end: 8.3, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 3.0, text: "9 ways to ask a question." },
        { start: 3.2, end: 5.3, text: "From multiple choice to word clouds." },
        { start: 5.9, end: 8.3, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "quiz-live-collab",
    category: "quiz",
    accent: QUIZ,
    scenes: [
      { type: "title", duration: 2.2, params: { heading: "Build together", accent: QUIZ } },
      { type: "collab", duration: 5.0, params: { names: ["David", "Tom"] } },
      { type: "cta", duration: 2.8, params: { heading: "Davidnet Quiz", sub: "Real-time, no merge conflicts", accent: QUIZ } },
    ],
    captions: {
      nl: [
        { start: 0.3, end: 1.9, text: "Bouw quizzen samen, live." },
        { start: 2.6, end: 6.8, text: "Zie de cursors van je team in realtime." },
        { start: 7.4, end: 9.8, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.3, end: 1.9, text: "Build quizzes together, live." },
        { start: 2.6, end: 6.8, text: "See your team's cursors in real time." },
        { start: 7.4, end: 9.8, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "quiz-night",
    category: "quiz",
    accent: QUIZ,
    scenes: [
      { type: "quizCard", duration: 4.5, params: { question: "Which movie won Best Picture in 1994?", answers: ["Pulp Fiction", "Shawshank Redemption", "Forrest Gump", "The Lion King"], correctIdx: 2 } },
      { type: "stat", duration: 3.0, params: { heading: "Hosted so far", value: 10000, suffix: "+", label: "quiz nights and counting", accent: QUIZ } },
      { type: "cta", duration: 2.5, params: { heading: "Davidnet Quiz", sub: "Pub quiz night, upgraded", accent: QUIZ } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 3.9, text: "Pubquiz, naar een hoger niveau." },
        { start: 4.8, end: 7.3, text: "Duizenden quizavonden en tellen door." },
        { start: 7.9, end: 9.8, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 3.9, text: "Quiz night, leveled up." },
        { start: 4.8, end: 7.3, text: "Thousands of quiz nights and counting." },
        { start: 7.9, end: 9.8, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "quiz-training",
    category: "quiz",
    accent: QUIZ,
    scenes: [
      { type: "quizCard", duration: 4.5, params: { question: "What is the goal of our new compliance policy?", answers: ["Increase sales", "Data security", "Office layout", "Lunch breaks"], correctIdx: 1 } },
      { type: "bullet", duration: 3.6, params: { heading: "Built for teams", bullets: ["Track completion", "Instant scoring", "Export results"], accent: QUIZ } },
      { type: "cta", duration: 2.5, params: { heading: "Davidnet Quiz", sub: "Training that doesn't feel like training", accent: QUIZ } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 3.9, text: "Maak van training een spel." },
        { start: 4.5, end: 7.8, text: "Volg voortgang. Score direct. Exporteer resultaten." },
        { start: 8.4, end: 10.3, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 3.9, text: "Turn training into a game." },
        { start: 4.5, end: 7.8, text: "Track completion. Score instantly. Export results." },
        { start: 8.4, end: 10.3, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "quiz-results",
    category: "quiz",
    accent: QUIZ,
    scenes: [
      { type: "quizCard", duration: 4.5, params: { question: "The mitochondria is the powerhouse of the cell.", answers: ["True", "False", "Depends", "Unknown"], correctIdx: 0 } },
      { type: "stat", duration: 3.0, params: { heading: "Average reveal time", value: 0, suffix: "s", label: "zero waiting on results", accent: QUIZ } },
      { type: "cta", duration: 2.5, params: { heading: "Davidnet Quiz", sub: "Results the second time runs out", accent: QUIZ } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 3.9, text: "Resultaten zodra de tijd om is." },
        { start: 4.8, end: 7.3, text: "Geen wachten. Geen giswerk." },
        { start: 7.9, end: 9.8, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 3.9, text: "Results the moment the timer hits zero." },
        { start: 4.8, end: 7.3, text: "No waiting. No guessing." },
        { start: 7.9, end: 9.8, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "quiz-cta",
    category: "quiz",
    accent: QUIZ,
    scenes: [
      { type: "title", duration: 3.0, params: { heading: "Davidnet Quiz", sub: "Ask anything. Anyone can join.", accent: QUIZ } },
      { type: "cta", duration: 3.0, params: { heading: "Your quiz. Your rules.", sub: "davidnet.net", accent: QUIZ } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 2.9, text: "Jouw vragen. Jouw regels. Jouw quiz." },
        { start: 3.5, end: 5.7, text: "Start vandaag nog gratis." },
      ],
      en: [
        { start: 0.4, end: 2.9, text: "Your questions. Your rules. Your quiz." },
        { start: 3.5, end: 5.7, text: "Start free today." },
      ],
    },
  },

  // ============================= COMMUNITY GAMES (7) =============================
  {
    id: "games-hub",
    category: "games",
    accent: GAMES,
    scenes: [
      {
        type: "gameGrid",
        duration: 5.5,
        params: {
          heading: "One arcade. Every genre.",
          accent: GAMES,
          games: [
            { name: "Snake", color: "#064e3b" },
            { name: "Tower Stacker", color: "#1e3a8a" },
            { name: "Golf", color: "#4c1d95" },
            { name: "Breakout", color: "#7f1d1d" },
            { name: "Police Chase Drifter", color: "#92400e" },
            { name: "Roll Dodge", color: "#0f766e" },
          ],
        },
      },
      { type: "cta", duration: 3.0, params: { heading: "Davidnet Games", sub: "Dozens of games, zero downloads", accent: GAMES } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 3.0, text: "Een hele arcade, één account." },
        { start: 3.6, end: 5.3, text: "Tientallen games, geen downloads." },
        { start: 5.9, end: 8.3, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 3.0, text: "A whole arcade, one account." },
        { start: 3.6, end: 5.3, text: "Dozens of games, zero downloads." },
        { start: 5.9, end: 8.3, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "games-upload",
    category: "games",
    accent: GAMES,
    scenes: [
      { type: "phoneShorts", duration: 2.5, params: { heading: "Got a game?", mode: "feed", accent: GAMES } },
      { type: "bullet", duration: 3.5, params: { heading: "Ship it to everyone", bullets: ["Upload once", "Instant hosting", "Built-in leaderboard"], accent: GAMES } },
      { type: "cta", duration: 3.0, params: { heading: "Davidnet Games", sub: "Built something? Share it.", accent: GAMES } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 2.2, text: "Game gemaakt?" },
        { start: 2.8, end: 5.9, text: "Eén keer uploaden. Overal spelen." },
        { start: 6.5, end: 8.9, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 2.2, text: "Built a game?" },
        { start: 2.8, end: 5.9, text: "Upload once. Play everywhere." },
        { start: 6.5, end: 8.9, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "games-leaderboard",
    category: "games",
    accent: GAMES,
    scenes: [
      {
        type: "leaderboard",
        duration: 5.0,
        params: {
          heading: "Top of the board",
          accent: GAMES,
          entries: [
            { name: "David", score: "48,210" },
            { name: "Tom", score: "41,990" },
            { name: "Lena", score: "39,500" },
            { name: "Max", score: "33,120" },
          ],
        },
      },
      { type: "cta", duration: 3.0, params: { heading: "Davidnet Games", sub: "Every game has a leaderboard", accent: GAMES } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 3.0, text: "Ga voor de eerste plek." },
        { start: 3.6, end: 5.0, text: "Elke game heeft een leaderboard." },
        { start: 5.6, end: 8.0, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 3.0, text: "Chase the top spot." },
        { start: 3.6, end: 5.0, text: "Every game has a leaderboard." },
        { start: 5.6, end: 8.0, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "games-achievements",
    category: "games",
    accent: GAMES,
    scenes: [
      { type: "achievement", duration: 5.0, params: { heading: "Unlock as you play", accent: GAMES, badges: ["Speedrunner", "High Scorer", "Completionist"] } },
      { type: "cta", duration: 3.0, params: { heading: "Davidnet Games", sub: "A badge for every milestone", accent: GAMES } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 3.0, text: "Unlock achievements terwijl je speelt." },
        { start: 3.6, end: 5.0, text: "Badges voor elke mijlpaal." },
        { start: 5.6, end: 8.0, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 3.0, text: "Unlock achievements as you play." },
        { start: 3.6, end: 5.0, text: "A badge for every milestone." },
        { start: 5.6, end: 8.0, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "games-profile",
    category: "games",
    accent: GAMES,
    scenes: [
      {
        type: "profile",
        duration: 5.0,
        params: {
          heading: "Your Davidnet gamer card",
          name: "David",
          accent: GAMES,
          stats: [
            { label: "Games played", value: "128" },
            { label: "Badges", value: "14" },
            { label: "Global rank", value: "#92" },
          ],
        },
      },
      { type: "cta", duration: 3.0, params: { heading: "Davidnet Games", sub: "Stats, badges and bragging rights", accent: GAMES } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 3.0, text: "Jouw gamersprofiel, op één plek." },
        { start: 3.6, end: 5.0, text: "Statistieken, badges en bragging rights." },
        { start: 5.6, end: 8.0, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 3.0, text: "Your gamer profile, all in one place." },
        { start: 3.6, end: 5.0, text: "Stats, badges, and bragging rights." },
        { start: 5.6, end: 8.0, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "games-variety",
    category: "games",
    accent: GAMES,
    scenes: [
      {
        type: "gameGrid",
        duration: 5.5,
        params: {
          heading: "Made by the community",
          accent: GAMES,
          games: [
            { name: "Tower Defense", color: "#1e3a8a" },
            { name: "Crazy Ape", color: "#7f1d1d" },
            { name: "Wobble Towers", color: "#4c1d95" },
            { name: "Cola Fabriek", color: "#064e3b" },
            { name: "Clash of Kingdoms", color: "#92400e" },
            { name: "Crown Conflict", color: "#0f766e" },
          ],
        },
      },
      { type: "cta", duration: 3.0, params: { heading: "Davidnet Games", sub: "New community games every week", accent: GAMES } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 3.0, text: "Gemaakt door de community, voor de community." },
        { start: 3.6, end: 5.3, text: "Nieuwe games, elke week." },
        { start: 5.9, end: 8.3, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 3.0, text: "Made by the community, for the community." },
        { start: 3.6, end: 5.3, text: "New games, every week." },
        { start: 5.9, end: 8.3, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "games-cta",
    category: "games",
    accent: GAMES,
    scenes: [
      { type: "title", duration: 3.0, params: { heading: "Davidnet Games", sub: "Play more. Install nothing.", accent: GAMES } },
      { type: "cta", duration: 3.0, params: { heading: "Jump in free", sub: "davidnet.net", accent: GAMES } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 2.9, text: "Speel meer. Installeer niets." },
        { start: 3.5, end: 5.7, text: "Start vandaag nog gratis." },
      ],
      en: [
        { start: 0.4, end: 2.9, text: "Play more. Install nothing." },
        { start: 3.5, end: 5.7, text: "Start free today." },
      ],
    },
  },

  // ============================= SHORTS (5) =============================
  {
    id: "shorts-feed",
    category: "shorts",
    accent: SHORTS,
    scenes: [
      { type: "phoneShorts", duration: 5.0, params: { heading: "Endless discovery", mode: "feed", accent: SHORTS } },
      { type: "cta", duration: 3.0, params: { heading: "Davidnet Shorts", sub: "Your feed, your vibe", accent: SHORTS } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 3.0, text: "Swipe naar iets nieuws." },
        { start: 3.6, end: 5.0, text: "Jouw feed, jouw sfeer." },
        { start: 5.6, end: 8.0, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 3.0, text: "Swipe into something new." },
        { start: 3.6, end: 5.0, text: "Your feed, your vibe." },
        { start: 5.6, end: 8.0, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "shorts-engage",
    category: "shorts",
    accent: SHORTS,
    scenes: [
      { type: "phoneShorts", duration: 5.0, params: { heading: "One tap away", mode: "engage", accent: SHORTS } },
      { type: "cta", duration: 3.0, params: { heading: "Davidnet Shorts", sub: "Like it. Comment. Share it.", accent: SHORTS } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 3.0, text: "Like het. Reageer. Deel het." },
        { start: 3.6, end: 5.0, text: "Elke short, één tik verder." },
        { start: 5.6, end: 8.0, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 3.0, text: "Like it. Comment. Share it." },
        { start: 3.6, end: 5.0, text: "Every short, one tap away." },
        { start: 5.6, end: 8.0, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "shorts-upload",
    category: "shorts",
    accent: SHORTS,
    scenes: [
      { type: "phoneShorts", duration: 4.5, params: { heading: "Film it. Post it.", mode: "upload", accent: SHORTS } },
      { type: "cta", duration: 3.0, params: { heading: "Davidnet Shorts", sub: "Your moment, everyone's feed", accent: SHORTS } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 2.9, text: "Film het. Post het. Ga viral." },
        { start: 3.5, end: 4.9, text: "Jouw moment, iedereens feed." },
        { start: 5.5, end: 7.9, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 2.9, text: "Film it. Post it. Go viral." },
        { start: 3.5, end: 4.9, text: "Your moment, everyone's feed." },
        { start: 5.5, end: 7.9, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "shorts-safe",
    category: "shorts",
    accent: SHORTS,
    scenes: [
      { type: "phoneShorts", duration: 3.0, params: { heading: "Built responsibly", mode: "feed", accent: SHORTS } },
      { type: "bullet", duration: 3.8, params: { heading: "Safe by design", bullets: ["Moderated community", "Report in one tap", "Built for everyone"], accent: SHORTS } },
      { type: "cta", duration: 2.8, params: { heading: "Davidnet Shorts", sub: "Short-form, done right", accent: SHORTS } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 2.8, text: "Short-form, verantwoord gebouwd." },
        { start: 3.4, end: 6.6, text: "Een community die echt gemodereerd wordt." },
        { start: 7.2, end: 9.6, text: "Start gratis op davidnet.net" },
      ],
      en: [
        { start: 0.4, end: 2.8, text: "Short-form, built responsibly." },
        { start: 3.4, end: 6.6, text: "A community that's actually moderated." },
        { start: 7.2, end: 9.6, text: "Start free at davidnet.net" },
      ],
    },
  },
  {
    id: "shorts-cta",
    category: "shorts",
    accent: SHORTS,
    scenes: [
      { type: "title", duration: 3.0, params: { heading: "Davidnet Shorts", sub: "Short-form that respects your time", accent: SHORTS } },
      { type: "cta", duration: 3.0, params: { heading: "Watch. Post. Repeat.", sub: "davidnet.net", accent: SHORTS } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 2.9, text: "Shorts die je tijd niet verspillen." },
        { start: 3.5, end: 5.7, text: "Start vandaag nog gratis." },
      ],
      en: [
        { start: 0.4, end: 2.9, text: "Shorts that don't waste your time." },
        { start: 3.5, end: 5.7, text: "Start free today." },
      ],
    },
  },

  // ============================= BRAND (2) =============================
  {
    id: "brand-ecosystem",
    category: "brand",
    accent: BRAND,
    scenes: [
      {
        type: "ecosystem",
        duration: 5.5,
        params: {
          heading: "One account. Every app.",
          apps: [
            { name: "Quiz", color: QUIZ },
            { name: "Games", color: GAMES },
            { name: "Shorts", color: SHORTS },
            { name: "Social", color: BRAND },
          ],
        },
      },
      { type: "cta", duration: 3.0, params: { heading: "This is Davidnet", sub: "davidnet.net", accent: BRAND } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 3.0, text: "Één account. Elke app." },
        { start: 3.6, end: 5.3, text: "Quiz, Games, Shorts — allemaal Davidnet." },
        { start: 5.9, end: 8.3, text: "Word vandaag nog gratis lid." },
      ],
      en: [
        { start: 0.4, end: 3.0, text: "One account. Every app." },
        { start: 3.6, end: 5.3, text: "Quiz, Games, Shorts — all Davidnet." },
        { start: 5.9, end: 8.3, text: "Join for free today." },
      ],
    },
  },
  {
    id: "brand-cta",
    category: "brand",
    accent: BRAND,
    scenes: [
      { type: "title", duration: 2.8, params: { heading: "Davidnet", sub: "Quiz. Games. Shorts.", accent: BRAND } },
      { type: "stat", duration: 3.0, params: { heading: "All in", value: 1, suffix: " account", label: "no new app to download", accent: BRAND } },
      { type: "cta", duration: 3.0, params: { heading: "This is Davidnet", sub: "davidnet.net", accent: BRAND } },
    ],
    captions: {
      nl: [
        { start: 0.4, end: 2.5, text: "Dit is Davidnet." },
        { start: 3.2, end: 5.7, text: "Eén account. Geen nieuwe app nodig." },
        { start: 6.3, end: 8.7, text: "Word vandaag nog gratis lid." },
      ],
      en: [
        { start: 0.4, end: 2.5, text: "This is Davidnet." },
        { start: 3.2, end: 5.7, text: "One account. No new app needed." },
        { start: 6.3, end: 8.7, text: "Join for free today." },
      ],
    },
  },
];
