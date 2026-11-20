# Designphysik – Styleguide

Verbindlich für Startseite und alle Module. Technische Quelle der Wahrheit ist `shared/style.css`; dieses Dokument erklärt die Regeln dahinter. Änderungen an Tokens und style.css nur durch den Style-Chat (siehe `docs/konzept.md`, Arbeitsweise).

**Grundrichtung: F – Punktraster** (entschieden 20.11.2026, ersetzt D „Ulmer Raster“). Weißer Grund, alles Schwarz, ein dezentes Punktraster, an dem sich alles ausrichtet. Farbe trägt nur Bedeutung: welche Physik (Wasser, Licht, Bewegung …) und Warnung.

## 1. Prinzipien
1. **Werkzeug, nicht Lehrbuch.** Geometrie und Ergebnis dominieren, Text ist Beschriftung.
2. **Schwarz auf Weiß ist der Normalfall.** Text, Konturen, Achsen, Rahmen, Bedienung: Schwarz.
3. **Farbe = Physik.** Jede Physik-Familie hat genau eine Farbe; sie färbt nur das simulierte Medium und seine Kurven. Einzige weitere Farbe: Rot für Warnungen.
4. **Das Raster ordnet alles.** Abstände, Höhen und Kanten sind Vielfache der Rastereinheit.
5. **Zahlen sind Produkt.** Tabellarische Ziffern, Einheit immer sichtbar, deutsche Formatierung.
6. **Ehrlichkeit vor Glanz.** Gültigkeitsgrenzen sichtbar (`--warn` + ⚠), keine Scheinpräzision.
7. **Keine Abhängigkeiten.** Nur Systemschriften, keine CDNs, keine Icon-Fonts.

## 2. Raster
| Größe | Wert | Verwendung |
|---|---|---|
| `--u` | `24px` | Rastereinheit: Punktabstand der Seite, Zeilenhöhe, Grundmaß aller Abstände |
| `--h` | `24px`, bei `pointer: coarse` `48px` | Höhe von Buttons, Auswahllisten, Eingabefeldern, Navigationssegmenten |

- **Erlaubte Maße:** 6 · 12 · 24 · 48 · 72 px und weitere Vielfache von 24. 6 px nur innerhalb eines Elements (Symbol–Text, Zellen-Innenabstand).
- **Seite:** Punkte Ø 2 px in `--dot` im Abstand `--u` auf `--bg`, erster Punkt in der Ecke (0, 0). Kopfzeile 72 px (3 Einheiten), Seitenrand 24 px, Spaltenabstand 24 px.
- **Schrift im Raster:** jede Textzeile 24 px hoch (auch 11–13 px Schrift); große Kennzahl 48 px.
- **Zeichenfläche:** deckend `--bg`, eigenes Punktraster in Millimetern (§ 7). Die Seitenpunkte laufen nicht hindurch, weil Zeichenflächen zoomen.
- Fließende Breiten (Spalten, Telefon) gehen nicht immer in ganzen Einheiten auf. Dann gilt: Höhen und senkrechte Abstände bleiben im Raster, Breiten dürfen fließen.

## 3. Farb-Tokens (vollständige Liste)
Nur diese Farben sind erlaubt. Module definieren **keine eigenen Farben** in `:root`; im Canvas nur über `css('--token')`.

**Neutral und Bedienung**
| Token | Wert | Rolle | Kontrast auf Weiß |
|---|---|---|---|
| `--bg` | `#ffffff` | Seite, Zeichenfläche, Füllung nicht aktiver Elemente | – |
| `--ink` | `#111111` | Text, Konturen, Achsen, Rahmen, Trennlinien | 18,9:1 |
| `--ink2` | `#4d4d4d` | Sekundärtext: Labels, Notizen, Achsbeschriftung | 8,5:1 |
| `--mut` | `#767676` | Tertiär: deaktiviert, Hilfslinien, Vergleichskurven, Spiegelseite | 4,5:1 |
| `--dot` | `#c8c8c8` | Rasterpunkte (Seite, Zeichenfläche fein, Diagramm) | – (nur Raster) |
| `--fill` | `#f0f0f0` | neutrale Fläche: ternäre Glieder, markierte Bereiche, Fortschritts-Hintergrund | – |
| `--ctl` | `#111111` | **Bedienung aktiv**: gewählter Button/Reiter, ausgewählter Griff, Freihandstrich, Antriebsglied, Regler, Häkchen | 18,9:1 |
| `--ctl-ink` | `#ffffff` | Schrift und Symbole auf `--ctl` | 18,9:1 |
| `--warn` | `#d32f2f` | Grenzwert überschritten, Modell ungültig, Fehler – **immer mit ⚠ und Text** | 5,0:1 |
| `--warn-a` | `rgba(211,47,47,.12)` | Fläche eines Grenzbereichs (z. B. μ < 40°) | – |

**Physik-Familien** – je Familie genau zwei Tokens: `--<familie>` (Linie, Punkt, Text nie) und `--<familie>-a` (Fläche).
| Familie | Linie | Fläche | Module (★ = Idee aus konzept.md) | Kontrast Linie |
|---|---|---|---|---|
| Fluid | `--water` `#1f6fe0` | `--water-a` `rgba(31,111,224,.28)` | Gefäß; ★ Nachtropfen, Schwimmen, Resonator | 4,8:1 |
| Licht & Strahlung | `--light` `#d48a00` | `--light-a` `rgba(212,138,0,.28)` | Lampenschirm; ★ Sonnenstand, Lichtleiter | 2,8:1 → Linien ≥ 2,5 px |
| Bewegung | `--mech` `#12994a` | `--mech-a` `rgba(18,153,74,.25)` | Mechanismen; ★ Tasten-Haptik, Federn | 3,7:1 |
| Kraft & Festigkeit (reserviert) | `--load` `#5b55c9` | `--load-a` `rgba(91,85,201,.25)` | Last; ★ Schnapphaken, Festkörpergelenk, Holz | 5,9:1 |

**Warum Familien statt Modulfarben:** Neue Module bekommen die Farbe ihrer Physik, nicht eine neue. So reichen wenige Farben für viele Module. Eine **neue Familie** nur per Styleguide-Eintrag durch den Style-Chat und nur wenn: Farbton ≥ 30° Abstand zu allen Familien und zu `--warn`, Linienkontrast ≥ 2,5:1, höchstens sechs Familien insgesamt.

**Migration von D (ab 20.11.2026 nicht mehr verwenden)**
| alt | neu |
|---|---|
| `--panel` | `--bg` |
| `--line` | `--ink` (Rahmen) |
| `--grid` (Canvas-Raster) | `dpDots()` mit `--dot` |
| `--grid` (Fläche) | `--fill` |
| `--grid2` | `--mut` |
| `--acc` | `--ctl` |
| `--waterA`, `--lightA` | `--water-a`, `--light-a` |
| `--akzent` (Vorlage) | `--<familie>` |
| `--r` | entfällt (Radius 0) |

## 4. Farbregeln
- **Physik-Farbe** nur für das Medium und seine Größen: Wasser, Füll- und Kippkurve; Lichtstrahlen, Lampe, Leuchtdichte, Lichtverteilung, Beleuchtungsstärke; Bahnkurve, Koppelpunkt, Haltemoment, μ. Nie für Bedienung, nie für Text.
- **Bedienung** ist immer `--ctl` (Schwarz). Aktiv = schwarz gefüllt mit `--ctl-ink`; nicht aktiv = `--bg` mit 1 px `--ink`-Rahmen.
- **Serien in einem Diagramm** (höchstens 3): 1. Familie durchgezogen 2 px (Licht 2,5 px) · 2. `--ink` gestrichelt [4,4] · 3. `--mut` gestrichelt [3,4]. Aktueller Zustand: senkrechte Linie `--ink`.
- **Warnung:** Wert oder Linie in `--warn`, dazu immer ⚠ und ein Satz. Grenzbereich als `--warn-a`-Fläche. Bewegung (Grün) und Warnung (Rot) treffen in Mechanismen aufeinander; deshalb nie Bedeutung nur über Farbe.
- **Falschfarbe** (Leuchtdichte): Verlauf `--mut` → Familie, ab Grenzwert `--warn` mit ⚠-Text. Der einzige erlaubte Verlauf.
- **Modulkennung:** Quadrat 12 × 12 px in der Familienfarbe vor dem Modulnamen – Kopfzeile, Navigation, Startseite. Farbe kommt aus `DP_MODULES[].color`.

## 5. Typografie
- Stack: `Arial, sans-serif` (lokale Helvetica mit defektem Bold-Schnitt führte zu hohlen Überschriften). Basis 14 px / 24 px.
- Stufen: h1 15 px/700 · Abschnitt (`.panel h2`) 11 px Versalien/700, Sperrung .08em, `--ink` · Kennzahl 22 px/700 auf 48 px · Bedienelemente 13 px · Labels/Notizen 12 px `--ink2` · Kleinst 11 px.
- Zahlen immer `font-variant-numeric: tabular-nums`.
- Canvas: `11px Arial`, `--ink2`; Kennwert im Canvas `600 15px Arial`, `--ink`.

## 6. Layout & Komponenten
- `header`: 72 px, Titel mit Modulquadrat links, Navigation rechts, unten 1 px `--ink`.
- `nav`: Segmente in `--h` Höhe, 1 px `--ink`, ohne Lücke aneinander; aktiv `--ctl`. Jedes Segment mit Modulquadrat; nicht verfügbare Module `--mut`, Quadrat nur als Umriss.
- `main`: 2 Spalten, Abstand 24 px, Rand 24 px, max. 1440 px; unter 860 px einspaltig.
- `.panel`: **kein Kasten** – oben 1 px `--ink`, keine Seiten, kein Hintergrund (Punkte sichtbar), Inhalt im 12-px-Takt. `h2` in der ersten Zeile.
- `.row`: Werkzeugleiste; Abstand 12 px zwischen Gruppen, Segmente einer Gruppe ohne Lücke (`.seg`). `.sep` = 12 px Leerraum.
- `button`, `select`, `input`: Höhe `--h`, 1 px `--ink`, Radius 0, `--bg`; aktiv `button.on` = `--ctl`/`--ctl-ink`. Kein Verschieben beim Drücken.
- `input[type=range]`, Checkbox: `accent-color: var(--ctl)`.
- `.ctl` (label · range · output): Zeile 24 px (Touch 48 px), output mit Einheit.
- `.stats`/`.stat`: Zellen ohne Außenkasten, oben und unten 1 px `--ink`, zwischen Zellen 1 px `--ink`; Label 11 px, Wert 22 px auf 48 px, Notiz 11 px `--ink2`. Überschreitung: `.stat.warn` → Wert `--warn` mit ⚠.
- `.note`: 12 px / 24 px `--ink2`.
- Startseite: `.card` = oben 1 px `--ink`, Modulquadrat + Titel, Beschreibung `--ink2`; `.card.off` in `--mut`.
- Keine Radien, keine Schatten, keine Verläufe (außer Falschfarbe).

## 7. Zeichenfläche (Editor-Canvas)
- **Raster = Maßstab:** Punkte statt Linien über `dpDots(ctx, w, h, k, ox, oy)` aus `shared/util.js` (Bildschirm = `ox + x·k`, `oy − y·k`, mm). Fein alle 10 mm (Ø 2 px, `--dot`), grob alle 50 mm (Ø 3 px, `--mut`). Liegen feine Punkte enger als 8 px, wird die Stufe verfünffacht (50/250 mm …). Maßstab als Text in einer unteren Ecke: „1 Punkt = 10 mm“ (`dpDots` liefert die Stufe).
- Kontur `--ink` 2 px (Hauptkörper 2,5 px); Hilfslinien und Achse `--mut` 1 px [2,4].
- Medium: Familie, Fläche `--<familie>-a`.
- **Griffe** (Stützpunkte): Quadrat 8 × 8 px `--bg` mit 1,5 px `--ink`; ausgewählt 10 × 10 px `--ctl` gefüllt. **Gelenke** (Mechanismen): Kreis r 5, sonst wie Griffe.
- Bemaßung: 11 px `--ink2`, Wert mit Einheit.
- Immer `prep(cv)` (HiDPI) und `touch-action:none`.

## 8. Diagramme
- Nur über `chart()` aus `shared/chart.js`; Seitenverhältnis `.ch` 16:8.
- Keine Gitterlinien: Punkte `--dot` an den Tick-Kreuzungen, Achsen links und unten 1 px `--ink`, Beschriftung 11 px `--ink2`.
- Achsen mit Größe und Einheit: `Volumen [ml]`, `Winkel [°]`. Serien nach § 4.

## 9. Text & Einheiten
- Deutsch, neutral, Imperativ in Hinweisen („Punkt ziehen, um …“).
- Einheiten: mm, ml, g, N, lm/cd/lx, ° – Leerzeichen vor der Einheit (außer °).
- Formatierung via `nf0` / `nf1` (de-DE). Nachkommastellen nach Aussagekraft.
- Begriffe aus der Produktsprache (Ausguss, Lippe, Schirm, Auflager); Fachbegriffe beim ersten Auftreten in `.note` erklären.

## 10. Zugänglichkeit & Zustände
- Text ≥ 4,5:1 (`--ink`, `--ink2`, `--mut`). Physik-Farben nie für Text.
- Bedeutung nie nur über Farbe (⚠, Text, Strichart).
- Fokus sichtbar (Browser-Default nicht entfernen).
- Touch: `--h` = 48 px bei `pointer: coarse`.
- Leerzustand: Canvas zeigt Startgeometrie, nie leer.

## 11. Verworfene Richtungen (Referenz)
A Werkstattpapier · B Cargo Index · C Technische Zeichnung · D Ulmer Raster (19.–20.11.2026) · E Labor dunkel · Werkbank, Kennzahlen zuerst, Schrittfolge (Skizzen 20.11.2026).

## Offene Punkte
- Seitenraster und Zeichenflächen-Raster decken sich nicht (Zoom). Möglich später: Maßstab in Stufen, bei denen 10 mm = 24 px × n.
