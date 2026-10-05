# Davidnet marketing campaign — 20 videos, NL + EN

20 short motion-graphics ads (built with `bun`, `node-canvas` + `ffmpeg`, same pipeline as the
existing `davidnet-bumper-*.mp4` / `davidnet-quiz-final.mp4`), each rendered twice — once with
Dutch captions, once with English — all burned-in (hardcoded) so they work muted on any platform.
Every video opens with the existing colored `davidnet-bumper-colored.mp4` logo sting.

Output: `output/<slug>-nl.mp4` and `output/<slug>-en.mp4`, 1280x720 @ 60fps, 9–14s each
(short-form length — fits Reels / TikTok / Shorts / LinkedIn natively).

Run `direnv exec . bun render.ts` to regenerate all 40, or `bun render.ts <slug>` for one.
Source of truth for scenes + copy: `content/scripts.ts`. Shared drawing primitives: `lib/engine.ts`.

## Quiz app (6)

| slug | hook (EN) | hook (NL) |
|---|---|---|
| quiz-question-types | 9 ways to ask a question. | 9 manieren om een vraag te stellen. |
| quiz-live-collab | Build quizzes together, live. | Bouw quizzen samen, live. |
| quiz-night | Quiz night, leveled up. | Pubquiz, naar een hoger niveau. |
| quiz-training | Turn training into a game. | Maak van training een spel. |
| quiz-results | Results the moment the timer hits zero. | Resultaten zodra de tijd om is. |
| quiz-cta | Your questions. Your rules. Your quiz. | Jouw vragen. Jouw regels. Jouw quiz. |

## Community games (7)

| slug | hook (EN) | hook (NL) |
|---|---|---|
| games-hub | A whole arcade, one account. | Een hele arcade, één account. |
| games-upload | Built a game? Ship it to everyone. | Game gemaakt? Deel het met iedereen. |
| games-leaderboard | Chase the top spot. | Ga voor de eerste plek. |
| games-achievements | Unlock achievements as you play. | Unlock achievements terwijl je speelt. |
| games-profile | Your gamer profile, all in one place. | Jouw gamersprofiel, op één plek. |
| games-variety | Made by the community, for the community. | Gemaakt door de community, voor de community. |
| games-cta | Play more. Install nothing. | Speel meer. Installeer niets. |

## Shorts app (5)

| slug | hook (EN) | hook (NL) |
|---|---|---|
| shorts-feed | Swipe into something new. | Swipe naar iets nieuws. |
| shorts-engage | Like it. Comment. Share it. | Like het. Reageer. Deel het. |
| shorts-upload | Film it. Post it. Go viral. | Film het. Post het. Ga viral. |
| shorts-safe | Short-form, built responsibly. | Short-form, verantwoord gebouwd. |
| shorts-cta | Shorts that don't waste your time. | Shorts die je tijd niet verspillen. |

## Brand / umbrella (2)

| slug | hook (EN) | hook (NL) |
|---|---|---|
| brand-ecosystem | One account. Every app. | Één account. Elke app. |
| brand-cta | This is Davidnet. | Dit is Davidnet. |

## Posting notes

- **Captions are burned in** per the request — no reliance on platform auto-captions, so they
  survive reposts/downloads and work with sound off (most feed consumption).
- Each category ends on a `-cta` video that works as a standalone brand spot; the other videos
  in that category each carry their own feature-specific CTA scene too, so any single clip can be
  posted alone.
- Suggested cadence: post the matching NL/EN pair on different regional accounts (or NL on
  TikTok/Instagram NL, EN on the international handles), spaced a few days apart per category so
  the 7-video Community Games arc and 6-video Quiz arc each read as a short series.
- All copy lives in `content/scripts.ts` as plain data — editing a headline/caption does not
  require touching the animation code, just the `captions` arrays for that `id`.
