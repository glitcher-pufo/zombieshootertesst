[README.md](https://github.com/user-attachments/files/33013661/README.md)
# Golden Leaf Survivors

A 2D zombie survival game. It is one file (`index.html`) with no dependencies.

## Play it on your own PC
1. Download `index.html`.
2. Double-click it. It opens in your browser. Saves are kept in your browser (localStorage).

Some browsers are happier with a tiny local server:

    python -m http.server 8000

then open http://localhost:8000

## Put it on GitHub Pages (free hosting)
1. Create a new repository on GitHub (for example `golden-leaf-survivors`).
2. Upload `index.html` and this `README.md` to the repository root.
3. Go to Settings > Pages. Under "Build and deployment" choose "Deploy from a branch",
   pick the `main` branch and the `/ (root)` folder, then Save.
4. After a minute your game is live at `https://YOUR-USERNAME.github.io/golden-leaf-survivors/`.

## Notes
- Singleplayer, saves, cheats and everything else work offline.
- Multiplayer only works inside claude.ai (it uses claude.ai's room feature). On GitHub
  Pages or a local file the Host/Join buttons will say "Cannot connect".
- Cheat menu: Esc > Cheats, tick the checklist. In multiplayer, non-hosts need the password in the code.
