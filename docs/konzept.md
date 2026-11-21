# Designphysik – Konzept, Architektur, Konventionen

Zentrales Dokument, kurz gehalten. Jede Sitzung liest es zuerst (siehe `CLAUDE.md`). Hier stehen nur Ziel, Regeln und Planung; Modulstände in `docs/<modul>.md`, Integrations-Historie in `docs/historie.md`.

## Ziel und Positionierung (21.11.2026)
Niederschwellige Browser-Werkzeugsuite für **Entwurfsentscheidungen im Produktdesign** (nicht Physikunterricht, nicht Fachplanung). Selbst gehostet, statische Dateien, kein Build-Schritt, keine externen Abhängigkeiten.

**Persona A (primär) – Designer/in bzw. Designstudent/in in der frühen Entwurfsphase.** Fragen: „Hält das?“, „Kippt das?“, „Wird es hell genug?“, „Klemmt die Klappe?“. Braucht Größenordnung und Richtung (besser/schlechter, welcher Parameter hilft), in Minuten, ohne Fachbegriffe vorauszusetzen. Arbeitet in Varianten, oft am Laptop, teils am Telefon/Tablet in Werkstatt oder Studio.
- Persona B (sekundär): Designer/in vor der Übergabe an Engineering – Plausibilität, Begründung im Gespräch.
- Persona C (sekundär): Lehrende – Zusammenhänge zeigen.
Bei Zielkonflikten entscheidet A.

**Positionierung:** Das Werkzeug deckt die Phase *vor* CAD, FEM, DIALux & Co. ab. Wo das Modell endet, sagt es das klar und übergibt (Export, Hinweis „ab hier Fachplanung/Ingenieur“) – es baut die Fachwerkzeuge nicht nach.

**Prüffrage für jede Erweiterung:** Ändert sie eine Entscheidung, die Persona A im Entwurf trifft? Wenn nein → zurückstellen (siehe Roadmap).

## Arbeitsweise (seit 19.11.2026 im Repository `davidgebka/physik`)
- **Zentraler Chat** (Orchestrator): Konzept, Konventionen, `shared/` (außer style.css), `tools/`, `_vorlage/`, Startseite, `docs/historie.md`; prüft Pull Requests und führt nach `main` zusammen.
- **Style-Chat**: Branch `style`; `docs/styleguide.md` und `shared/style.css` – sonst nichts in `shared/`. Token-Änderungen kurz im Styleguide begründen.
- **Ein Chat pro Modul**: Branch `modul/<key>`; ändert nur `<modul>/` und `docs/<modul>.md` (ggf. weitere `docs/<modul>-*.md`).
- `main` ist immer lauffähig; die CI (`.github/workflows/test.yml`) führt bei jedem Push alle `*/test.js` aus.

### Ablauf für einen Modul-Chat
1. `CLAUDE.md`, dieses Dokument, `docs/styleguide.md`, `docs/<modul>.md`, `README.md`, `shared/*` und `_vorlage/*` lesen; `gefaess/` dient als Referenzbeispiel.
2. Branch `modul/<key>` von `main` anlegen (neues Modul: `_vorlage/` nach `<key>/` kopieren, `docs/<key>.md` anlegen).
3. Entwickeln; `node <key>/test.js` grün; im Browser prüfen (Desktop und 390 px).
4. Stand in `docs/<modul>.md` eintragen (neueste Version unten, knapp: was, warum, Tests), Pull Request nach `main` öffnen.
5. **`shared/` nicht selbst ändern.** Bedarf unten unter „Wünsche an shared“ eintragen; bis dahin modul-lokal lösen.

## Architekturentscheidung (19.11.2026)
- **Kein gemeinsamer Profil-Editor.** Jedes Modul bekommt einen Editor, der zu seinem Problem passt (Licht: offene Schale + Lampe; Gefäß: geschlossener Hohlraum; Last: Querschnitt, Spannweite, Auflager, Lasten; Mechanismen: ebenes Gelenkgetriebe).
- **Gemeinsam ist, was die Zusammenführung billig macht:** Einheiten, Look & Feel, Diagramme, Dateiformat, Dateistruktur – und künftig alles, was nur auf dem **Zustandsobjekt** arbeitet statt auf der Geometrie (Rückgängig, Vorlagen-Menü, Variantenvergleich, Urteil/Ampel; siehe Roadmap).
- **Modulübergreifende Geometrie** (z. B. Gefäßprofil für Schwimmen/Nachtropfen, Schirm für Kühlkörper): gemeinsames Format erst festlegen, wenn der zweite Nutzer konkret entsteht – dann hier eintragen, kein drittes Profilformat erfinden.

## Konventionen (verbindlich)
- **Struktur:** `index.html` (Startseite) · `shared/` (style.css, util.js, chart.js) · `tools/` (load-core.js, check.js) · `_vorlage/` · `<modul>/index.html` (Rechenkern; Oberfläche bei Bedarf in weiteren Skripten im Modulordner, z. B. `gefaess/app.js`) + `<modul>/test.js` · `docs/` (konzept, styleguide, historie, `<modul>.md`)
- **Modul-Registry:** `DP_MODULES` in `shared/util.js` – einzige Stelle (`name` = einziger Modulname überall, `q` = Entwurfsfrage, `title` nur Startseite); Kopfzeile per `dpHeader(key)`
- **Shared-Globale:** `dpEditing`/`dpUndoKey` (Tastatur: Strg+Z nicht beim Tippen), `$`, `nf0`, `nf1`, `css` (Token-Werte gecacht in `dpCss`), `prep`, `polyPath`, `dpDots`, `dpMq`, `dpDownload`, `dpHashGet/Set`, `niceStep`, `chart`; Entwurfshilfen `dpVerdict` (Urteil), `dpHistory` (Rückgängig, Strg+Z), `dpCompare` + `dpDelta` (Variantenvergleich), `dpOptions` (Vorlagen als Textliste, Last), `dpGallery` + `dpSketch` (Vorlagen-Galerie mit Skizze, Name, Entwurf/Prinzip; alle vier Module); Darstellung (Design-Audit 21.11.2026): `dpStats` + `dpStat` (Urteil, Hauptkennwerte, „Alle Werte“), `dpTerm` (Fachbegriff mit Erklärung), `dpIco`/`dpBtn`/`dpIcons` (SVG-Symbole), `dpMenu` (Telefon „⋯“), `DP_LV`; `legend` in `chart()`, `DP_CFONT`
- **Links** immer explizit auf `…/index.html` (damit file:// funktioniert)
- **Technik:** Vanilla JS, Canvas 2D (WebGL/WebGPU nur, wo nötig), keine CDNs
- **Einheiten:** mm, ml, g, N, lm/cd/lx, Winkel in Grad in der UI; deutsche Zahlenformatierung; Alltagsbezug mitgeben, wo er hilft (N ≈ kg)
- **Sprache:** nur Deutsch (bewusst, keine i18n-Vorbereitung)
- **Rechenkern** im Block `// === CORE START … CORE END`, ohne DOM, endet mit `if (typeof module !== 'undefined') module.exports = Core;`. Jede Physik wird gegen analytische Fälle verifiziert (test.js).
- **Ergebnisse in drei Ebenen** (neu 21.11.2026, Vorbild Last v1.2; bestehende Module ziehen nach):
  1. **Urteil** zuerst: ok / knapp / kritisch (knapp/kritisch mit `--warn` + ⚠) und ein Satz in Designsprache („Brett hängt sichtbar durch“, „Lampe blendet seitlich“, „Klappe klemmt bei 80°“).
  2. **Kennwerte** mit Einheit; Fachbegriffe (LVK, λ, μ, N_cr …) beim ersten Auftreten kurz erklärt (`title` bzw. Glossar).
  3. **Details** (Diagramme, Eigenformen, Rohwerte, „Modell & Gültigkeit“) – erreichbar, aber nicht im Weg.
- **Gültigkeit:** Jedes Modul hat einen Abschnitt „Modell & Gültigkeit“ und nennt, ab wann Fachplanung nötig ist. Unsichere Eingangswerte (Schätzmaterialien, Streuung) als solche kennzeichnen, wo möglich als Band statt Einzelwert.
- **Export:** JSON `{type:"designphysik/<modul>", version, …}`; Teilen per URL-Hash `#<kürzel>=…`
- **Look:** Grundrichtung F „Punktraster“ (20.11.2026), verbindlich nach `docs/styleguide.md`. Farbe nur je **Physik-Familie** (`--water` Fluid, `--light` Licht, `--mech` Bewegung, reserviert `--load` Kraft & Festigkeit; jeweils `-a` für Flächen) und `--warn`. Alle Farben in style.css, Module definieren keine eigenen; Modulfarbe in `DP_MODULES[].color`. Canvas-Raster über `dpDots()`.
- **Modulgröße:** wächst ein `index.html` über ~1500 Zeilen, vor der nächsten Erweiterung Aufteilen oder eigenes Modul prüfen.

## Module (Stand 21.11.2026; Details in `docs/<modul>.md`)
| Modul | Key | Stand | Entwurfsfrage |
|---|---|---|---|
| Gefäß & Kippen | `gefaess` | v1.14 | Wie viel passt rein, wo sind Eichstriche, wann gießt es aus, kippt es um, schwappt es beim Tragen über? |
| Licht / Lampenschirm | `licht` | v2.6 | Wie verteilt der Schirm das Licht, wird der Tisch hell genug, blendet es? |
| Last / Statik | `last` | v1.6 | Hält das Brett/der Balken, wie stark hängt es durch, schwingt es? |
| Mechanismen | `mechanismus` | v1.5 | Wie bewegt sich das Getriebe, wo klemmt es, welche Kraft braucht es? |
| Elektronik | `elektronik` | v1 | Hält der Akku lange genug, reicht der Strom, wird etwas zu heiß? |

## Roadmap (21.11.2026, nach Persona A)
**Moratorium auf Tiefe:** In Gefäß und Licht keine neuen Physik-Verfeinerungen, bis die Punkte „Jetzt“ erledigt sind. Fehlerbehebungen und Bedienung gehen immer.

**Jetzt – Grundlage für Persona A (shared + Nachziehen der Module)**
1. ~~**Urteil/Ampel**~~ – erledigt 21.11.2026 in allen vier Modulen (`dpVerdict`); Schwellen je Modul in `docs/<modul>.md`.
2. ~~**Variantenvergleich**~~ – erledigt 21.11.2026 in allen vier Modulen (`dpCompare`/`dpDelta`): Last und Mechanismen rechnen den gemerkten Stand neu, Licht und Gefäß frieren Kennwerte und Kurven ein (Gefäß: globale Geometrie, Licht: Monte-Carlo-Lauf). Geist in den Diagrammen; offen: Geist im Editor.
3. **Rückgängig** und **Vorlagen-Menü** – `dpHistory`/`dpOptions` in Last und Mechanismen (neu dort: Rückgängig). Gefäß und Licht behalten ihre eigene, geprüfte Umsetzung (Schnappschuss vor der Änderung, Ziehen als ein Schritt); Umstellen nur, wenn dort ohnehin umgebaut wird. **Vorlagen-Galerie** (21.11.2026) statt Textliste in Gefäß, Licht, Mechanismen: je 20 Vorlagen in „Prinzipien“ und „Designklassiker“, Skizze aus den Vorlagendaten (Modul liefert `d()` → `dpSketch`); Last behält vorerst `dpOptions`.
4. ~~**Glossar/Tooltips**~~ – erledigt 21.11.2026: `dpTerm` bzw. `t` im Kennwert, Erklärungen an den Hauptbegriffen aller Module; weitere Begriffe nach Bedarf im Modul ergänzen.
5. ~~**Startseite nach Fragen**~~ – erledigt 21.11.2026: „Kippt es? Wie hell? Klemmt es? Hält es?“ als Einstieg, Karten mit Skizze.

**Danach – Breite statt Tiefe** (Reihenfolge = Priorität)
0. ~~**Neues Modul Elektronik**~~ – v1 integriert 21.11.2026; v2/v3 nach `docs/elektronik.md`.
1. Mechanismen: **Federn/Gasdruckfedern** (Klappen, Deckel; baut auf v1.1 auf)
2. **Kippsicherheit allgemeiner Körper/Möbel** (hohe Regale, Leuchten auf Fuß; sicherheitsrelevant)
3. **Berührtemperatur** (Wärmeeindringkoeffizient; wenig Aufwand, typisch Design)
4. **Schnapphaken** (Füge-/Lösekraft, Dehnung)
5. **Bemessen statt nachweisen** in Last: „kleinste Dicke für l/x bzw. Sicherheit“ (Löser auf vorhandenem Kennwert)
6. **Einfluss der Parameter** („größter Hebel: …“, finite Differenzen im CORE)
7. **Realitätscheck** je Modul: wenige Vergleiche gegen Messung/Herstellerangabe in `docs/<modul>.md` (u. a. Papier/Stoff messen)
8. Echte Geräte prüfen: Telefon/Touch, Safari, Firefox

**Ideen (unpriorisiert, Prüffrage oben anwenden):** Rutschen vs. Kippen · Festkörpergelenk/Filmscharnier · Tasten-Haptik · Bedienkräfte (Schraubdeckel, Hebel, DIN 33411) · Fall & Stoß · Seil & Abhängung · Biegen (K-Faktor, Rückfederung) · Abkühlen/Warmhalten · Kühlkörper LED (koppelt an Licht) · Nachtropfen am Ausguss (koppelt an Gefäß) · Schwimmen/Metazentrum · Helmholtz-Resonator · Sonnenstand & Schatten · Lichtleiter · Holz arbeitet/Wärmedehnung · Energiebudget · Gewicht/Material/CO₂

**Zurückgestellt (Fachplanung, widerspricht Positionierung):** LDT-Export nur als Übergabe, keine Raumberechnung · Fresnel/Spektrum/Brechung im Licht · Ausflussdynamik, eingeschlossene Luft im Gefäß · EC5-Nachweis, Rahmen als Stabwerk in Last · Dynamik, Synthese in Mechanismen. Die „Offen“-Listen in `docs/<modul>.md` bleiben als Sammlung; umgesetzt wird nach dieser Roadmap.

## Wünsche an shared
(Modul-Chats tragen hier ein; der zentrale Chat bzw. der Style-Chat arbeitet sie ab. Erledigtes wandert nach `docs/historie.md`.)

Offen:
- (keine)
