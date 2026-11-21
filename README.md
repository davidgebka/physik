# Designphysik

Browser-Werkzeuge für physikalische Abschätzungen im Produktdesign. Statische Dateien, kein Build-Schritt, keine externen Abhängigkeiten.

## Starten
Online (GitHub Pages, Stand `main`): https://davidgebka.github.io/physik/

Ordner auf einen beliebigen Webserver legen, oder lokal:
    python3 -m http.server 8000   →  http://localhost:8000
Funktioniert auch per Doppelklick auf index.html (file://).

## Struktur
    CLAUDE.md           Regeln für Claude-Sitzungen (Branches, Zuständigkeiten, Tests)
    docs/               konzept.md (zentral), styleguide.md, historie.md,
                        <modul>.md (Stand je Modul), licht-grundlagen.md
    index.html          Startseite (liest Modulliste aus shared/util.js)
    shared/style.css    gemeinsames Aussehen
    shared/util.js      Modul-Registry (DP_MODULES), Kopfzeile, Canvas-, Zahlen-, Export-Helfer
    shared/chart.js     Diagramme
    tools/              Testwerkzeuge für Node (load-core.js, check.js)
    _vorlage/           Gerüst für neue Module
    gefaess/            Modul Gefäß & Kippen (index.html Kern, app.js Oberfläche, + test.js)
    licht/              Modul Lampenschirm (+ test.js)
    mechanismus/        Modul Mechanismen (+ test.js)
    last/               Modul Belastung – Balken 2D (+ test.js)

## Neues Modul
1. _vorlage/ nach <modulkey>/ kopieren, MODULNAME/MODULKEY ersetzen
2. In shared/util.js bei DP_MODULES eintragen, ready: true sobald nutzbar
3. Physik nur im CORE-Block; test.js gegen analytische Fälle; `node <modulkey>/test.js` muss grün sein
4. Abschnitt „Modell & Gültigkeit“ ausfüllen, Ergebnisse in drei Ebenen (Urteil, Kennwerte, Details)
5. docs/<modulkey>.md anlegen (Stand & Historie)

## Tests
Laufen auch in der CI bei jedem Push (.github/workflows/test.yml).

    node gefaess/test.js
    node licht/test.js
    node mechanismus/test.js
    node last/test.js
