# Designphysik – Styleguide

Verbindlich für Startseite und alle Module. Technische Quelle der Wahrheit ist `shared/style.css`; dieses Dokument erklärt die Regeln dahinter. Änderungen an Tokens und style.css nur durch den Style-Chat auf Branch `style` (siehe `docs/konzept.md`, Arbeitsweise).

**Grundrichtung: D – Ulmer Raster** (entschieden 19.11.2026). Systematisch, kühl, „Braun-Gerät“: Grautöne, Arial (Helvetica-Anmutung), fast eckig, ein Bedien-Orange nur für aktive Elemente.

## 1. Prinzipien
1. **Werkzeug, nicht Lehrbuch.** Geometrie und Ergebnis dominieren, Text ist Beschriftung.
2. **Grau ist der Normalfall.** Farbe nur mit Funktion: Orange = aktiv/ausgewählt, Physik-Akzent = Medium, Rot = Warnung.
3. **Zahlen sind Produkt.** Tabellarische Ziffern, Einheit immer sichtbar, deutsche Formatierung.
4. **Ehrlichkeit vor Glanz.** Gültigkeitsgrenzen sichtbar (`--warn`), keine Scheinpräzision.
5. **Keine Abhängigkeiten.** Nur Systemschriften, keine CDNs, keine Icon-Fonts.

## 2. Farb-Tokens (aus style.css)
| Token | Wert | Verwendung |
|---|---|---|
| `--bg` | `#e9e9e7` | Seitenhintergrund |
| `--panel` | `#fff` | Panels, Karten, Kopfzeile, Buttons |
| `--ink` | `#222` | Text, Geometrie-Kontur |
| `--mut` | `#6e6e6e` | Sekundärtext, Achsen, Labels (5,1:1 auf Weiß) |
| `--line` | `#d2d2cf` | Rahmen, Trenner |
| `--grid` / `--grid2` | `#ececea` / `#d6d6d3` | Raster fein / grob |
| `--acc` | `#c2410c` | **Bedien-Orange**: aktive Buttons/Nav, Regler, ausgewählter Punkt, Freihandstrich (Weiß darauf 5,2:1) |
| `--warn` | `#c62828` | Grenzwert überschritten, Modell ungültig, Fehler – immer zusätzlich mit Text/⚠ |
| `--r` | `2px` | einziger Radius |
| Canvas-Grund | `#fcfcfb` | Zeichenfläche |

**Physik-Akzente** (im Modul als CSS-Variable in `:root`):
| Modul | Variable | Wert | Status |
|---|---|---|---|
| Gefäß | `--water` | `#3d86de` | fest |
| Licht | `--light` | `#e0a020` | Vorschlag (Gelb, klar getrennt vom Bedien-Orange) |
| Last | `--load` | `#5b55c9` | Vorschlag |

Regeln: Physik-Akzent nur für das simulierte Medium und dessen Kurven, Füllung mit Alpha 0.18–0.30. `--acc` nie für Daten/Kurven, Physik-Akzent nie für Bedienung. Vergleichskurven `--ink` gestrichelt oder `--mut`.

## 3. Typografie
- Stack: `Arial, sans-serif` (überall vorhanden; lokale Helvetica-Installationen mit defektem Bold-Schnitt führten zu hohlen Überschriften), Basis 14 px / 1.4.
- Stufen: Kopf h1 15 px/700 · Panel-h2 11.5 px Versalien/700, Sperrung .09em, `--mut` · Kennwert 17 px/600 · Body 14 px · Bedienelemente 13 px · Labels/Notizen 11–12 px.
- Zahlen immer `font-variant-numeric: tabular-nums`.
- Canvas-Beschriftung: `11px system-ui`, `--mut` (Canvas-Schrift ist noch nicht an den Stack gekoppelt).

## 4. Layout
- `header` (Titel + `nav`) → `main` 2-spaltiges Grid, max. 1400 px, Gap 12 px; unter 860 px einspaltig.
- Modulordnung: links Editor (Geometrie), rechts Ergebnis; `.wide` für volle Breite; „Modell & Gültigkeit“ als letztes `.panel.wide`.
- Abstände: 4 / 6 / 8 / 10 / 12 / 16 px – keine anderen Werte.
- Radius überall `var(--r)`; keine Pills, keine Schatten, keine Verläufe.

## 5. Komponenten
- `.panel` + `h2`: jede inhaltliche Einheit.
- `.row`: Werkzeugleiste; Gruppen mit `.sep` trennen.
- `button` / `button.on`: aktiv = Orange mit weißer Schrift. Nicht-aktive Buttons bleiben weiß.
- `.ctl` (label · range · output): jeder Parameter; output mit Einheit, z. B. `120 mm`.
- `.stats` / `.stat` (b = Wert+Einheit, span = Bezeichnung): Kennwerte; Überschreitung → Wert in `--warn` + ⚠.
- `.note`: Hinweise, Annahmen, Quellen.
- `label.chk`: Ein/Aus-Optionen.
- Startseite: `.card` / `.card.off`, `.badge` für Status.

## 6. Zeichenfläche (Editor-Canvas)
- Raster: fein `--grid` (10 mm), grob `--grid2` (50 mm); Maßstab immer mm.
- Geometrie: Kontur `--ink` 2–2.5 px; Hilfslinien `--mut` 1 px gestrichelt [3,4].
- Medium: Physik-Akzent, Füllung mit Alpha.
- Griffe: Kreis r 5, weiß mit `--ink`-Rand; ausgewählt `--acc` gefüllt.
- Bemaßungen: `--mut`, 11 px, Wert mit Einheit.
- Farben im Canvas nur über `css('--token')`, keine Hex-Werte im Modul.
- Immer `prep(cv)` (HiDPI) und `touch-action:none`.

## 7. Diagramme
- Nur über `chart()` aus `shared/chart.js`; Seitenverhältnis `.ch` 16:8.
- Achsen mit Größe und Einheit: `Volumen [ml]`, `Winkel [°]`.
- Hauptkurve: Physik-Akzent 2 px; Referenz: `--ink`/`--mut` gestrichelt; aktueller Zustand: `vlines` in `--ink`; Grenzwerte `--warn`.
- Max. 3 Serien pro Diagramm.

## 8. Text & Einheiten
- Deutsch, neutral, Imperativ in Hinweisen („Punkt ziehen, um …“).
- Einheiten: mm, ml, g, N, lm/cd/lx, ° – Leerzeichen vor der Einheit (außer °).
- Formatierung via `nf0` / `nf1` (de-DE). Nachkommastellen nach Aussagekraft.
- Begriffe aus der Produktsprache (Ausguss, Lippe, Schirm, Auflager); Fachbegriffe beim ersten Auftreten in `.note` erklären.

## 9. Zugänglichkeit & Zustände
- Kontrast Text ≥ 4.5:1 auf Weiß; `--mut` auf `--bg` nur für Sekundärinfo.
- Bedeutung nie nur über Farbe.
- Fokus sichtbar (Browser-Default nicht entfernen).
- Leerzustand: Canvas zeigt Startgeometrie, nie leer.

## 10. Verworfene Richtungen (Referenz)
A Werkstattpapier (vorheriger Stand) · B Cargo Index · C Technische Zeichnung · E Labor dunkel.

## Offene Punkte
- ~~`gefaess/index.html` nutzt warme Hex-Grautöne im Canvas~~ – erledigt in Gefäß v1.1.
- `_vorlage/index.html` setzt `--akzent:#e0a020` – Name an Modulkonvention angleichen (`--<medium>`).
