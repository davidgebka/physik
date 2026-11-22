# Designphysik – Styleguide

Verbindlich für Startseite und alle Module. Technische Quelle der Wahrheit ist `shared/style.css`; dieses Dokument erklärt die Regeln dahinter. Änderungen an Tokens und style.css nur durch den Style-Chat (siehe `docs/konzept.md`, Arbeitsweise).

**Grundrichtung: F – Punktraster** (entschieden 20.11.2026, ersetzt D „Ulmer Raster“). Weißer Grund, alles Schwarz, ein dezentes Punktraster, an dem sich alles ausrichtet. Farbe trägt nur Bedeutung: welche Physik (Wasser, Licht, Bewegung …) und Warnung.

**Design-Audit 21.11.2026** (umgesetzt): Hierarchie umgedreht – das Urteil ist die größte Aussage, wenige Hauptkennwerte groß, alles Weitere aufklappbar; Schriftstufen 12/14/18/28; Segmente für sich ausschließende Wahl, leise Aktionen ohne Rahmen; Inline-SVG-Symbole; Seitenraster überall, aber heller (`--dot-bg`); Telefon mit Urteilsleiste. Einzelheiten in den Abschnitten unten.

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
- **Seite:** Punkte Ø 2 px in `--dot-bg` (heller als `--dot`, damit kleine Schrift darauf ruhig bleibt) im Abstand `--u` auf `--bg`, erster Punkt in der Ecke (0, 0). Das Raster liegt **überall**, auch hinter Text und Kennwerten (Entscheidung des Nutzers 21.11.2026). Kopfzeile 72 px (3 Einheiten), Seitenrand 24 px, Spaltenabstand 24 px.
- **Schrift im Raster:** jede Textzeile 24 px hoch (auch 11–13 px Schrift); große Kennzahl 48 px.
- **Senkrecht nur ganze Einheiten** (seit 20.11.2026): Höhen und senkrechte Abstände sind Vielfache von 24 px, auch zwischen Elementen. 12 px nur waagerecht (zwischen Gruppen einer Zeile); 6 px nur innerhalb eines Elements. Jede Oberkante liegt auf einer Punktreihe. **Ausnahme Telefon** (≤ 860 px): umgebrochene Werkzeugzeilen 12 px, sonst frisst die Leiste den Bildschirm.
- **Linien nehmen keinen Platz ein:** Trennlinien und Zellrahmen als `box-shadow` (`inset 0 1px var(--ink)` oben), nicht als `border` – sonst wandert alles darunter je Linie 1 px aus dem Raster. `border` nur an Elementen fester Höhe (Buttons, Felder, Navigation; `box-sizing: border-box`).
- **Zeichenflächen:** Höhe über `--ar` (Breite/Höhe) statt `aspect-ratio`, z. B. `#ed{--ar:calc(1/1.05)}`; style.css rundet die Höhe auf ein Vielfaches von 24 px ab (`round()` mit `cqw`, `.panel` ist Container). Ohne `--ar` gilt `aspect-ratio` – dann liegt alles darunter neben dem Raster.
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
| `--dot` | `#c8c8c8` | Rasterpunkte der Zeichenfläche (fein) und der Diagramme | – (nur Raster) |
| `--dot-bg` | `#dcdcdc` | Rasterpunkte der Seite (heller, liegt auch hinter Text) | – (nur Raster) |
| `--fill` | `#f0f0f0` | neutrale Fläche: ternäre Glieder, markierte Bereiche, Fortschritts-Hintergrund | – |
| `--ctl` | `#111111` | **Bedienung aktiv**: gewählter Button/Reiter, ausgewählter Griff, Freihandstrich, Antriebsglied, Regler, Häkchen | 18,9:1 |
| `--ctl-ink` | `#ffffff` | Schrift und Symbole auf `--ctl` | 18,9:1 |
| `--warn` | `#d32f2f` | Grenzwert überschritten, Modell ungültig, Fehler – **immer mit ⚠ und Text** | 5,0:1 |
| `--warn-a` | `rgba(211,47,47,.12)` | Fläche eines Grenzbereichs (z. B. μ < 40°) | – |

**Physik-Familien** – je Familie genau zwei Tokens: `--<familie>` (Linie, Punkt, Text nie) und `--<familie>-a` (Fläche).
| Familie | Linie | Fläche | Module (★ = Idee aus konzept.md) | Bezug | Kontrast Linie |
|---|---|---|---|---|---|
| Fluid | `--water` `#1f6fe0` | `--water-a` `rgba(31,111,224,.28)` | Gefäß; ★ Nachtropfen, Schwimmen, Resonator | Wasser | 4,8:1 |
| Licht & Strahlung | `--light` `#d48a00` | `--light-a` `rgba(212,138,0,.28)` | Lampenschirm; ★ Sonnenstand, Lichtleiter | warmweißes Glühlicht; hellste Familie | 2,8:1 → Linien ≥ 2,5 px |
| Bewegung | `--mech` `#0a7e3a` | `--mech-a` `rgba(10,126,58,.25)` | Mechanismen; ★ Tasten-Haptik, Federn | Grün = „läuft frei“, Gegenpol zu „klemmt“ | 5,2:1 |
| Kraft & Festigkeit | `--load` `#712a94` | `--load-a` `rgba(113,42,148,.22)` | Last; ★ Schnapphaken, Festkörpergelenk, Holz | Purpur der Spannungsoptik; dunkelste Familie (Last ist schwer) | 8,5:1 |
| Elektrik | `--elec` `#03919d` | `--elec-a` `rgba(3,145,157,.22)` | Elektronik; ★ Energiebudget | Elektroblau: Funke, Lichtbogen, Statusanzeige | 3,8:1 |

**Farbschema vom 21.11.2026** (Entscheidung des Nutzers nach Vorschlag des Style-Chats): Farbtöne gemessen in OKLCH (wahrnehmungsgleich) – Licht 72°, Bewegung 150°, Elektrik 205°, Fluid 258°, Kraft 312°, Warnung 26°; Abstände 53–78°. Die Helligkeit trägt Bedeutung (Licht hell, Kraft dunkel) und trennt die Farben bei Farbfehlsichtigkeit: kleinster Abstand bei Protanopie/Deuteranopie ΔE 9/8 (OKLab ×100, Simulation Machado 2009), vorher 4 (Licht/Bewegung, Bewegung/Warnung). Geändert: `--mech` von `#12994a` (dunkler), `--load` von `#7b3fbf` (dunkler), `--elec` von `#c0189a` (Magenta lag 39° neben Kraft und 46° neben Warnung; Cyan füllt die Lücke zwischen Grün und Blau). Schwachstelle: Tritanopie (~0,01 %) Fluid/Elektrik ΔE 5 – vertretbar, weil Bedeutung nie nur über Farbe läuft. Frühere Verschiebung: `--load` 21.11.2026 von `#5b55c9` nach `#7b3fbf` (zu nah an `--water`).

**Warum Familien statt Modulfarben:** Neue Module bekommen die Farbe ihrer Physik, nicht eine neue. So reichen wenige Farben für viele Module. Eine **neue Familie** nur per Styleguide-Eintrag durch den Style-Chat und nur wenn: Farbton ≥ 30° Abstand in OKLCH zu allen Familien und zu `--warn`, bei Farbfehlsichtigkeit (Protan/Deutan) ΔE ≥ 8 zu allen, Linienkontrast ≥ 2,5:1, höchstens sechs Familien insgesamt.

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
- **Bedienung** ist immer `--ctl` (Schwarz), in drei Arten:
  - **Segment** (`.seg`): sich ausschließende Wahl (Modus, Werkzeug, Ansicht), Knöpfe ohne Lücke; aktiv = schwarz gefüllt mit `--ctl-ink`. Nur hier und in der Navigation volles Schwarz.
  - **Schalter** (einzelner Knopf mit `.on`, z. B. „Stand merken“, „Symmetrie“, „Schwappen“): Rahmen 1 px; an = Fläche `--fill` mit 2 px Unterstrich `--ink`.
  - **Leise Aktion** (`.q`): ohne Rahmen, Symbol + Wort (Rückgängig, Einpassen, Foto, Export, Import, Link); Hover = 1 px Unterstrich. `.ico` = auf dem Telefon nur Symbol – seit 22.11.2026 auch für Vorlage, Stand merken und Segmente mit Symbol (Gefäß-Art, Freihand/Punkte), damit die Editorleiste auf dem Telefon kurz bleibt.
- **Serien in einem Diagramm** (höchstens 3): 1. Familie durchgezogen 2 px (Licht 2,5 px) · 2. `--ink` gestrichelt [4,4] · 3. `--mut` gestrichelt [3,4]. Aktueller Zustand: senkrechte Linie `--ink`.
- **Warnung:** Wert oder Linie in `--warn`, dazu immer ⚠ und ein Satz. Grenzbereich als `--warn-a`-Fläche. **Rot nur bei Überschreitung:** Grenzlinien sind `--ink` gestrichelt und werden erst rot, wenn der Wert sie überschreitet. In Kennwerten färbt `.warn` nur den Wert, nicht Label und Notiz. Familienfarben nie für Bedienung (Fortschrittsbalken `--ink`). Bewegung (Grün) und Warnung (Rot) treffen in Mechanismen aufeinander; deshalb nie Bedeutung nur über Farbe.
- **Falschfarbe** (Leuchtdichte): Verlauf `--mut` → Familie, ab Grenzwert `--warn` mit ⚠-Text.
- **Feldbild** (Lichtfeld, seit 20.11.2026): Verlauf `--ink` → Familie → `--bg` auf dunklem Grund – dunkel heißt wenig, hell viel, wie bei einer Belichtung. Darüber Konturen, Lampe und Beschriftung in `--bg`, Legende als Verlaufsbalken mit 0 und Bezugswert. Neben der Falschfarbe der einzige erlaubte Verlauf.
- **Modulkennung:** Quadrat 12 × 12 px in der Familienfarbe vor dem Modulnamen – Kopfzeile, Navigation, Startseite. Farbe kommt aus `DP_MODULES[].color`.

## 5. Typografie
- Stack: `--font` = `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif` (seit 21.11.2026; vorher Arial wegen einer lokalen Helvetica mit defektem Bold – `system-ui` greift diese nicht). Basis 14 px / 24 px.
- **Vier Stufen, nie unter 12 px:**
  | Stufe | Größe | Verwendung |
  |---|---|---|
  | Notiz | 12 px / 24 px | Labels der Kennwerte, Notizen, Reglerbeschriftung, Achsen und Canvas-Text |
  | Text | 14 px / 24 px | Fließtext, Bedienung, Tabellen, Abschnittstitel (13 px Versalien, Sperrung .06em) |
  | Aussage | 18 px / 24 px, 700 | Urteilssatz, Textwerte in Kennwerten, Modulname auf der Startseite |
  | Kennzahl | 28 px / 48 px, 700 | Hauptkennwert; Einheit dahinter 60 %, 400 |
- Wortmarke „Designphysik“: 14 px/700 Versalien, Sperrung .12em.
- Abschnittstitel höchstens zwei Wörter; Zusatz als `<small>` (12 px, normal, `--ink2`, `line-height:1` – sonst wird die Zeile 25 px hoch) daneben.
- Zahlen immer `font-variant-numeric: tabular-nums`.
- Canvas: `DP_CFONT` aus `chart.js` (12 px Systemschrift), `--ink2`; Kennwert im Canvas 700 18 px `--ink`.

## 6. Layout & Komponenten
- `header`: 72 px, Wortmarke links, Navigation rechts, unten 1 px `--ink`. Das Modul steht nur einmal: als aktives Segment (`dpHeader(key)`). Telefon: Navigation volle Breite, Segmente teilen die Breite nach Namenslänge; ab fünf Segmenten unter 480 px Namen 12 px und ohne Modulquadrat (passt bis 320 px).
- `nav`: Segmente in `--h` Höhe, 1 px `--ink`, ohne Lücke aneinander; aktiv `--ctl`. Jedes Segment mit Modulquadrat und dem einen Modulnamen aus `DP_MODULES[].name` (Gefäß · Licht · Mechanik · Statik · Elektronik); nicht verfügbare Module `--ink2`, Quadrat nur als Umriss.
- `main`: 2 Spalten, Abstand 24 px, Rand 24 px, max. 1440 px; unter 860 px einspaltig.
- `.panel`: **kein Kasten** – oben 1 px `--ink`, keine Seiten, kein Hintergrund (Punkte sichtbar), Abstand zwischen Inhalten 24 px. `h2` in der ersten Zeile.
- `.row`: Werkzeugleiste; Abstand 12 px zwischen Gruppen, 24 px zwischen umbrochenen Zeilen, Segmente einer Gruppe ohne Lücke (`.seg`). `.sep` = 12 px Leerraum.
- `button`, `select`, `input`: Höhe `--h`, 1 px `--ink`, Radius 0, `--bg`; aktiv `button.on` = `--ctl`/`--ctl-ink`. Kein Verschieben beim Drücken.
- `input[type=range]`, Checkbox: `accent-color: var(--ctl)`.
- `.ctl` (label · range · output): Zeile 24 px (Touch 48 px), output mit Einheit.
- **Ergebnisse in drei Ebenen** (`dpStats(dpVerdict(…), haupt, weitere, key)`):
  - **Urteil** `.verdict`: Marke (✓ passt = Rahmen `--ink`; ⚠ knapp = Fläche `--warn-a`, Schrift und Rahmen `--warn`; ⚠ kritisch = `--warn` gefüllt, Schrift weiß) und Satz 18 px/700, höchstens 60 Zeichen breit; Marke steht an der ersten Zeile, Urteil ohne Abstand oben (sonst liegen die Kennwerte 12 px neben dem Raster); gemerkter Stand 12 px `--ink2` darunter. Stufen damit auch ohne Farbsehen unterscheidbar (Fläche, Füllung, Wort).
  - **Hauptkennwerte** `.stat` in eigenem Raster `.sts` (3–5, Überschreitungen immer dazu; die Reihe füllt die Breite): Label 12 px **einzeilig** (Stelle, Bedingungen in die Notiz), Wert 28 px auf 48 px, Notiz 12 px `--ink2`. Zeilen per `subgrid`, damit Werte einer Reihe auf einer Linie stehen. Reiner Text als Wert 18 px.
  - **Alle Werte** `details.more` mit `table.kv` (14 px, Wert rechtsbündig fett, Notiz 12 px); Auf/zu bleibt beim Neuzeichnen erhalten.
- **Fachbegriff** `dpTerm(wort, erklärung)` bzw. `t` im Kennwert: gepunktet unterstrichen, Erklärung als `title`.
- **Modell & Gültigkeit** `.model`: aufklappbar, Unterpunkte als `h3` 14 px/700, Text 14 px `--ink` mit höchstens 68 Zeichen je Zeile, ab ~60em zweispaltig. Bedienhinweise unter den Editoren nur ein Satz je Werkzeug; Ausführliches unter „Bedienung“ im Modelltext.
- **Telefon** (≤ 860 px): Reihenfolge Editor → Kennwerte (`.kpi`) → Rest; feste Urteilsleiste `#dp-bar` (48 px) unten, solange die Kennwerte nicht im Blick sind; Nebenaktionen hinter „⋯“ (`dpMenu`).
- **Symbole** (`dpIco`, `dpBtn`, `<button data-i>` + `dpIcons()`): Inline-SVG 16 px, 1,5 px Strich, `currentColor`; keine Unicode-Ersatzzeichen (▦ ◫ ⟲ ✎ …), keine Icon-Schrift.
- **Datei**: in jedem Modul eigener Abschnitt „Datei“ vor „Modell & Gültigkeit“ mit Export · Import · Link kopieren (leise Aktionen).
- Fokus: `:focus-visible` 2 px `--ink`, Abstand 2 px (auch auf schwarzen Knöpfen sichtbar).
- `.note`: 12 px / 24 px `--ink2`.
- **Vorlagen-Galerie** (`dpGallery`, seit 21.11.2026): Knopf „▦ Vorlage …“ öffnet einen Dialog (1 px `--ink`, Hintergrund abgedunkelt), Kopfzeile bleibt stehen. Gruppen als Abschnitt (11 px Versalien, `--ink2`), Karten wie `.card` (oben 1 px `--ink`, ab 144 px Breite): Skizze 96 px, Name 13 px/700, Entwurf · Jahr bzw. Prinzip 11 px `--ink2`; Hover/Fokus `--fill`. Skizzen über `dpSketch`: Kontur `--ink`, Medium in der Familie (`-a`-Fläche bzw. Linie), Gestell `--mut`; jede Skizze einzeln eingepasst (kein gemeinsamer Maßstab).
- Startseite (Nomenklatur 21.11.2026, PR #35: keine Entwurfsfragen mehr): oben ein Satz (`.intro p`, `--ink2`). `.card` = oben 1 px `--ink`, ab 216 px breit (fünf Module in einer Reihe ab ~1200 px), Skizze 168 px (`dpSketch`, Medium in der Familienfarbe), Modulquadrat + Name 18 px/700, darunter ein Satz `DP_MODULES[].desc` in `--ink2`; `.card.off` in `--ink2` mit „in Arbeit“.
- Keine Radien, keine Schatten, keine Verläufe (außer Falschfarbe und Feldbild).

## 7. Zeichenfläche (Editor-Canvas)
- **Raster = Maßstab:** Punkte statt Linien über `dpDots(ctx, w, h, k, ox, oy)` aus `shared/util.js` (Bildschirm = `ox + x·k`, `oy − y·k`, mm). Fein alle 10 mm (Ø 2 px, `--dot`), grob alle 50 mm (Ø 3 px, `--mut`). Liegen feine Punkte enger als 8 px, wird die Stufe verfünffacht (50/250 mm …). Maßstab als Text in einer unteren Ecke: „1 Punkt = 10 mm“ (`dpDots` liefert die Stufe).
- Kontur `--ink` 2 px (Hauptkörper 2,5 px); Hilfslinien und Achse `--mut` 1 px [2,4].
- Medium: Familie, Fläche `--<familie>-a`.
- **Griffe** (Stützpunkte): Quadrat 8 × 8 px `--bg` mit 1,5 px `--ink`; ausgewählt 10 × 10 px `--ctl` gefüllt. **Gelenke** (Mechanismen): Kreis r 5, sonst wie Griffe.
- Bemaßung: 11 px `--ink2`, Wert mit Einheit.
- Immer `prep(cv)` (HiDPI) und `touch-action:none`; Editoren mit Fingerbedienung über `dpTouchGuard` (`pan-y`: ins Leere wischen scrollt die Seite, auf einem Objekt bearbeitet es).
- **Finger** (22.11.2026): Trefferzone 24 px (`DP_HIT`); beim Ziehen Lupe 96 px, zweifach, in der oberen Ecke gegenüber dem Finger, Rahmen 1 px `--ink`, Fadenkreuz `--ink2`; Kontextleiste `.dp-ctx` (normale Knöpfe ohne Lücke, Symbol + Wort) 30 px über der Auswahl, nur bei `pointer: coarse`. Zwei Finger zoomen/verschieben; „Einpassen“ setzt zurück.

## 8. Diagramme
- Nur über `chart()` aus `shared/chart.js`; Seitenverhältnis `.ch` 16:8.
- Keine Gitterlinien: Punkte `--dot` an den Tick-Kreuzungen, Achsen links und unten 1 px `--ink`, Beschriftung 11 px `--ink2`.
- Achsen mit Größe und Einheit: `Volumen [ml]`, `Winkel [°]`. Serien nach § 4.
- **Legende** über `legend: [{t, color, width?, dash?}]` oben rechts im Diagramm (Strich im Muster der Serie) – nicht an die Achsenbeschriftung anhängen.
- Linien in Zeichenflächen, die nicht selbsterklärend sind (Waagrechte, Geisterlagen), am Ende beschriften (12 px `--ink2`).

## 9. Text & Einheiten
- Deutsch, neutral, Imperativ in Hinweisen („Punkt ziehen, um …“).
- Einheiten: mm, ml, g, N, lm/cd/lx, ° – Leerzeichen vor der Einheit (außer °).
- Formatierung via `nf0` / `nf1` (de-DE). Nachkommastellen nach Aussagekraft.
- Begriffe aus der Produktsprache (Ausguss, Lippe, Schirm, Auflager); Fachbegriffe beim ersten Auftreten in `.note` erklären.

## 10. Zugänglichkeit & Zustände
- Text ≥ 4,5:1: für lesbaren Text `--ink` oder `--ink2`; `--mut` nur für Linien und Deaktiviertes. Physik-Farben nie für Text.
- Zeichenflächen mit `role="img"`; `dpVerdict` setzt den Urteilssatz als `aria-label`.
- Bedeutung nie nur über Farbe (⚠, Text, Strichart).
- Fokus sichtbar über `:focus-visible` (siehe § 6).
- Touch: `--h` = 48 px bei `pointer: coarse`.
- Leerzustand: Canvas zeigt Startgeometrie, nie leer.

## 11. Verworfene Richtungen (Referenz)
A Werkstattpapier · B Cargo Index · C Technische Zeichnung · D Ulmer Raster (19.–20.11.2026) · E Labor dunkel · Werkbank, Kennzahlen zuerst, Schrittfolge (Skizzen 20.11.2026).

## Offene Punkte
- Seitenraster und Zeichenflächen-Raster decken sich nicht (Zoom). Möglich später: Maßstab in Stufen, bei denen 10 mm = 24 px × n.
