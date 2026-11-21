# Designphysik – Regeln für jede Claude-Sitzung

Browser-Werkzeugsuite für physikalische Abschätzungen im Produktdesign. Statische Dateien, kein Build, keine Abhängigkeiten.

1. Vor jeder Arbeit `docs/konzept.md` lesen; Ziel (Persona A), Konventionen und Roadmap dort sind verbindlich. Für UI zusätzlich `docs/styleguide.md`.
2. Bei Programmieraufgaben, falls verfügbar, die Skills `karpathy-guidelines` und `ponytail` laden: kleinste vollständige Änderung, keine spekulativen Features, Annahmen offenlegen, überprüfbare Erfolgskriterien.
3. Physik nur im `// === CORE START … CORE END`-Block. Jede Änderung daran braucht einen grünen `<modul>/test.js` gegen analytische Fälle.
4. **Branches:** ein Modul = Branch `modul/<key>` (z. B. `modul/licht`), Styling = Branch `style`. Zurück nach `main` nur per Pull Request; der zentrale Chat prüft und führt zusammen.
5. **Zuständigkeit:** `shared/util.js`, `shared/chart.js`, `tools/`, `index.html`, `_vorlage/` ändert nur der zentrale Chat; `shared/style.css` und `docs/styleguide.md` der Style-Chat. Modul-Branches ändern nur `<modul>/` und `docs/<modul>.md`; Bedarf an shared unter „Wünsche an shared“ in `docs/konzept.md` eintragen.
6. Vor jedem PR: alle Tests grün (`for t in */test.js; do node "$t" || exit 1; done`), im Browser geprüft (Desktop und 390 px), Stand in `docs/<modul>.md` aktualisiert. Die CI führt die Tests bei jedem Push aus.
7. Antworten auf Deutsch, knapp und technisch präzise.
