# Flappy Forest Flight (`flappybirds`)

Browser **Flappy Bird** variants (HTML5 canvas + Tailwind CDN), plus an experimental modular hybrid shell (Flappy + Spin-to-Earn).

## Requirements

- Modern browser (Chrome, Firefox, Edge, Safari)
- Optional: Node.js (`npm start`) or Python 3 (static server)

No build step. CDN assets need network access.

## How to run

```bash
npm start
# http://localhost:3000

# or
python3 -m http.server 8000
# http://localhost:8000
```

Open **[menu.html](menu.html)** for the level picker, or **[index.html](index.html)** for the classic game.

### Controls

Click / tap / Space to flap. Later levels add extras (combat UI, etc.).

## Layout

```
.
├── menu.html                 # Level picker hub
├── index.html                # Classic Flappy Forest Flight
├── level1.html … level9.html # Standalone variants (level2 removed — was broken)
├── level11.html, level12.html
├── hybrid.html               # Modular Flappy + Spin-to-Earn demo
├── package.json
├── js/                       # Modules used by hybrid.html
└── docs/architecture.md
```

## Cleanup summary

- Added hub (`menu.html`), README, `.gitignore`, `package.json`
- Organized hybrid modules under `js/` with a working `hybrid.html` entry
- Removed unused AI scaffolding, scratch notes, truncated `level10.html`, typo `indexxx.html`
- Removed broken `level2.html` (Markdown-fenced, would not run in a browser)
- Moved architecture notes to `docs/`

## Notes / risks

- Levels are standalone AI-evolved copies, not a shared engine
- Hybrid auth/scores use localStorage only
- Removed modules had demo admin passwords / unfinished React login
- Online CDNs required for Tailwind / icons

## License

UNLICENSED / all rights reserved by the repository owner unless otherwise stated.
