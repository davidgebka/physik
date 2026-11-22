# Editoren auf dem Telefon – Plan (22.11.2026)

Ziel: Persona A skizziert in Werkstatt oder Studio am Telefon eine Variante in unter einer Minute, ohne Fehlgriffe und ohne Desktop-Wissen (Hover, Entf-Taste, Doppelklick).

## Befund (iPhone 13, 390 × 664 px sichtbar, Playwright-Emulation)

| Modul | Editor beginnt bei | Editorhöhe | Zeilen über dem Editor |
|---|---|---|---|
| Gefäß | 573 px | 384 px | 6 (Art, Freihand/Punkte, Aktionen, ⋯, Bearbeiten) |
| Licht | 456 px | 384 px | 4 |
| Statik | 335 px | 264 px | 2 |
| Mechanik | 441 px | 264 px | 4 |
| Elektronik | 500 px | 264 px | 5 |

1. **Editor unter der Falz.** Beim Öffnen sieht man fast nur Knöpfe; bei Gefäß ragen nur 90 px des Editors in den Bildschirm.
2. **Scroll-Falle.** Der Canvas hat `touch-action: none` und ist 366 von 390 px breit. Wer die Seite über den Editor hinweg scrollen will, verschiebt stattdessen Punkte oder legt welche an; scrollen geht nur auf 12 px Rand.
3. **Trefferzonen zu klein.** Gefäß/Licht 14 px (Linie 10 px), Mechanik 12 px (Glied 7 px); nur Statik nimmt 24 px bei `pointer: coarse`. Styleguide verlangt 48 px Bedienhöhe für Finger.
4. **Finger verdeckt den Punkt** beim Ziehen; man sieht weder Punkt noch Maß.
5. **Kein Zoom, kein Verschieben.** Feine Konturen (Gefäßhals, Gelenke nahe beieinander) sind am Telefon nicht greifbar.
6. **Desktop-Gesten ohne Ersatz.** Rückmeldung beim Überfahren gibt es auf Touch nicht; Doppeltipp zum Löschen ist unsichtbar (seit 22.11. teilweise ersetzt durch „Punkt löschen“); Elektronik dreht mit „R“ (Knopf vorhanden).
7. **Leisten brechen unkontrolliert um** (Gefäß: „⋯“ allein in einer Zeile, Mechanik: „Löschen“ allein).

## Maßnahmen

**Stufe 1 – Grundlage (klein, gemeinsam in `shared/`, danach je Modul einbinden)**

1. **Scrollen und Bearbeiten trennen.** Canvas `touch-action: pan-y`; ein `touchstart`-Hörer (`passive: false`) ruft `preventDefault()` nur, wenn der Finger auf einem Griff/Objekt beginnt oder ein Setz-/Freihandwerkzeug aktiv ist. Tippen/Wischen ins Leere scrollt die Seite. Helfer `dpTouchGuard(cv, grabs)`; `grabs(x, y)` liefert das Modul aus seinen vorhandenen Treffertests.
2. **Trefferzonen nach Zeigerart.** `DP_HIT` = 14 px (Maus) bzw. 24 px (Finger) aus `matchMedia('(pointer: coarse)')`; alle `hitPoint`/`hitSegment`/`hitLink` nutzen es (Statik hat es schon).
3. **Kompakte Telefonleiste (≤ 2 Zeilen).** Zeile 1: Modus/Werkzeug als ein Segment, Beschriftung kurz oder nur Symbol; Zeile 2: Vorlage, Stand merken, Rückgängig, Löschen als Symbole, alles Seltene hinter „⋯“ (`dpMenu`). Gefäß: Art (Drehkörper/Grundriss/Zwei Konturen) und „Bearbeiten“ ins „⋯“ oder in eine Auswahlliste.
   Erfolgskriterium: Editor beginnt in allen Modulen bei ≤ 300 px, kein Knopf allein in einer Zeile.

**Stufe 2 – Bedienung mit dem Finger**

4. **Kontextleiste an der Auswahl.** Ist ein Punkt, Bauteil oder Glied gewählt, erscheint direkt daneben eine kleine Leiste (Löschen, bei Elektronik Drehen, ggf. „Werte …“). Ersetzt Doppeltipp, Entf und R auf dem Telefon; auf dem Desktop optional.
5. **Versatz beim Ziehen.** Auf Touch folgt der Punkt dem Finger mit Abstand nach oben (ca. 40 px) oder eine Lupe (Ausschnitt ×2, 96 px) zeigt die Umgebung in der oberen Ecke; dazu das Maß (x/z in mm) am Punkt.
6. **Zwei Finger zoomen und verschieben** (`dpPanZoom`: Pinch + Zwei-Finger-Pan auf die vorhandene Ansicht `V` bzw. `UI.view`); „Einpassen“ setzt zurück. Ein Finger bleibt dem Bearbeiten vorbehalten.

**Stufe 3 – größerer Umbau, erst nach Rückmeldung**

7. **Editor im Vollbild** (Knopf ⛶ nur auf dem Telefon): Editor füllt den Bildschirm, Werkzeuge unten als Daumenleiste, Urteilsleiste `#dp-bar` bleibt; Zurück per ✕. Löst Befund 1 grundsätzlich.
8. **Werte eintippen statt fummeln:** gewählter Punkt zeigt Felder x/z (wie die Auswahlzeile in Statik/Elektronik), für präzise Maße ohne Feinmotorik.
9. **Querformat:** Editor links, Kennwerte rechts ab 640 px Breite und geringer Höhe.

## Stand 22.11.2026 (Stufe 1–2 umgesetzt)

Entscheidungen: Lupe statt Versatz (Punkt bleibt unter dem Finger wie am Desktop), Symbole statt Beschriftung in der Telefonleiste, Vollbild-Editor zurückgestellt bis zum Test auf echten Geräten.

| Maßnahme | Stand |
|---|---|
| 1 Scrollen/Bearbeiten trennen | alle Module (`dpTouchGuard`): `busy()` = das Modul hat bei pointerdown ein Ziehen/Zeichnen begonnen; Setzwerkzeuge setzen beim Antippen, Wischen scrollt |
| 2 Trefferzonen | alle Module 24 px (`DP_HIT`; Elektronik in Rastereinheiten umgerechnet) |
| 3 Telefonleiste | Symbole für Vorlage/Stand merken überall, Art und Freihand/Punkte in Gefäß/Licht. Editor-Oberkante (iPhone 13): Gefäß 573 → 407, Licht 456 → 336, Statik 335, Mechanik 441, Elektronik 500 px. Das Kriterium ≤ 300 px ist mit Kopfzeile und zwei Leistenzeilen nicht erreichbar (≈ 336 px); Mechanik und Elektronik bleiben wegen ihrer Werkzeugpaletten höher → Vollbild-Editor (7) |
| 4 Kontextleiste | alle Module (`dpCtxBar`, nur Finger): Löschen; Elektronik zusätzlich Drehen |
| 5 Lupe | alle Module (`dpLoupe`) beim Ziehen und Freihandzeichnen |
| 6 Zwei Finger | Gefäß, Licht, Mechanik, Elektronik (`dpPinch`); Statik ohne Zoom. Nach dem Zoomen passt sich die Ansicht nicht mehr von selbst an; „Einpassen“ (neu in Mechanik und Elektronik) setzt zurück. Ein-Finger-Schritt, der beim Aufsetzen des zweiten Fingers begonnen hatte, wird in Gefäß/Licht zurückgenommen, in den anderen Modulen übernommen |

Geprüft mit Playwright (iPhone 13, Touch-Ereignisse über CDP) und Desktop 1400 px. Offen: echte Geräte (iOS Safari: Reihenfolge pointerdown vor touchstart, auf die `dpTouchGuard` baut), Stufe 3.

## Reihenfolge und Prüfung

- Reihenfolge 1 → 2 → 3 → 4 → 5 → 6; 7–9 nach Test auf echten Geräten (Roadmap „Danach“ Punkt 8).
- Je Schritt: Playwright mit `devices['iPhone 13']` (Taps, Ziehen, Scrollen über den Editor), Messung der Editor-Oberkante; Desktop unverändert (Rückmeldung beim Überfahren, Tastatur).
- Abnahme auf einem echten Telefon (iOS Safari, Android Chrome): eine Gefäßvariante aus einer Vorlage ändern, Hals schmaler ziehen, einen Punkt löschen, Seite bis zu den Kennwerten scrollen – ohne Fehlgriff.

## Offene Entscheidungen (Nutzer)

- Vollbild-Editor (7) gleich mit einplanen oder erst Stufe 1–2?
- Versatz (Punkt über dem Finger) oder Lupe (5)?
- Darf die Telefonleiste Beschriftungen zugunsten von Symbolen weglassen (3)? Styleguide erlaubt `.ico` bisher nur für leise Aktionen.
