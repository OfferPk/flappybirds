# Flappy Forest Flight (`flappybirds`)

Browser-based **Flappy Bird** variants (HTML5 canvas + Tailwind CDN). Multiple self-contained level files with different themes and extras (combat, store ideas, etc.), plus an experimental modular "hybrid" shell (Flappy + Spin-to-Earn).

## Requirements

- A modern browser (Chrome, Firefox, Edge, Safari)
- Optional: **Node.js** (for `npm start`) or **Python 3** (for a simple static server)

No build step. Levels load CDN assets (Tailwind, Font Awesome) when online.

## How to run

From the repo root:

```bash
# Option A — Node
npm start
# then open http://localhost:3000

# Option B — Python
python3 -m http.server 8000
# then open http://localhost:8000
```

Or open `index.html` / any `levels/*.html` directly in the browser (some browsers restrict modules/local quirks; a static server is preferred).

**Hub:** [`index.html`](index.html) lists all playable levels.  
**Classic game:** [`levels/classic.html`](levels/classic.html)  
**Hybrid demo:** [`hybrid.html`](hybrid.html)

### Controls

- **Click / tap / Space** — flap  
- Level-specific extras (shooting, store UI, etc.) appear only in later variants

## Layout

```
.
├── index.html              # Level picker hub
├── hybrid.html             # Modular Flappy + Spin-to-Earn shell
├── package.json            # npm start → static server
├── levels/                 # Self-contained playable HTML games
│   ├── classic.html
│   ├── level01.html … level09.html
│   ├── level11.html
│   └── level12.html
├── js/                     # Modules used by hybrid.html
│   ├── main.js
│   ├── game-manager.js
│   ├── data/storage.js
│   ├── user/auth.js
│   ├── leaderboard/scores.js
│   ├── flappy-bird/game.js
│   └── spin-to-earn/wheel.js
├── docs/
│   └── architecture.md     # Original hybrid architecture notes
└── archive/
    ├── incomplete/         # Truncated / unusable drafts
    ├── unused-modules/     # AI scaffolding not wired into any page
    └── notes/              # Old todolist / phase design dumps
```

## What changed in the cleanup

- Flat root of mixed HTML/JS/notes → clear folders
- Renamed levels (`level1.html` → `levels/level01.html`, original root `index.html` → `levels/classic.html`)
- Fixed `level2.html` (it was wrapped in Markdown fences and would not run)
- Wired hybrid scripts to the `js/` layout that `hybrid.html` already expected
- Moved unused AI modules and scratch notes into `archive/`
- Added README, `.gitignore`, and `package.json` serve scripts
- Archived truncated `level10.html` (file ends mid-source; use level 11/12 for combat)

## Notes / risks

- Levels are **standalone duplicates** evolved by AI — not a shared engine. Behavior differs per file.
- `archive/unused-modules/` includes hard-coded demo admin passwords and unfinished React/`LoginScreen.js` pointing at an old remote API — not used by the hub or levels.
- Hybrid auth/leaderboard use **localStorage** only; Firebase file is a stub.
- Online CDNs required for Tailwind/icons unless you vendor them later.

## License

UNLICENSED / all rights reserved by the repository owner unless otherwise stated.
