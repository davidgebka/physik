# Modul Fertigung (`fertigung/`) – Stand & Historie

Vom Modul-Chat gepflegt (Branch `modul/fertigung`). Verbindliche Konventionen stehen in `docs/konzept.md`.

**Stand:** v1 (22.11.2026), Key `fertigung`, Hash `#f=`. Noch nicht in `DP_MODULES` (Wunsch an den zentralen Chat); Farbe vorläufig `--load`, eigene Familie Wunsch an den Style-Chat.

## Entwurfsfrage
„Lässt sich das so herstellen und verbinden, wie ich es gezeichnet habe?“ – Persona A legt im Entwurf Biegeradien, Schenkellängen, Lochabstände, Wanddicken und Verschraubungen fest; falsch gewählt fällt das erst beim Fertiger auf. Nachschlagewerk mit Urteil, keine Umform- oder Festigkeitssimulation.

**Satz für die Startseite (`desc`):** Nachschlagen für die Werkstatt: Biegeradien, Abwicklung, Kernlöcher und Verschraubungen passend zu Material und Dicke.

## Abgrenzung (Recherche 22.11.2026)
| Angebot | Stärke | Lücke |
|---|---|---|
| calculover, Omni, SkyCiv, Firgelli | Formeln für K-Faktor, Biegezugabe, Zuschnitt | setzen K-Faktor und Radius als bekannt voraus |
| SendCutSend-Biegerechner | Radius und Mindestschenkel je Material/Dicke | nur eigene Maschinen, Englisch, Zoll |
| TRUMPF-Biegewerkzeug-Handbuch | vollständig | für Abkanter, nicht für Entwurf |
| rechner-portal (DIN 13), miniwebtool, accu-components | Kernloch, Durchgangsloch, schneiden/formen | nur „welcher Bohrer?“ – nicht Wanddicke, Einschraubtiefe, Alternativen |
| AMES, Haas | Kernloch für Gewindeformer | Metall, Englisch |
| accu-components, McMaster | Bohrung für Einschmelzmuttern (3D-Druck) | herstellerabhängig |

Lücke: niemand fragt nur ab, was der Designer weiß (Material, Dicke, Form), und antwortet mit Urteil plus Alternative.

## Abgrenzung zum Modul Material
| | Material | Fertigung |
|---|---|---|
| Frage | Welcher Werkstoff? | Wie bearbeite und verbinde ich ihn? |
| Sicht | Eigenschaften im Vergleich (Ashby-Karte) | Regeln und Maße für ein konkretes Teil |
| Übergang | „In Fertigung öffnen“ (Material per Link) | „Material wechseln“ → Karte |

Fertigung ist der zweite Nutzer der Materialliste → gemeinsames Format jetzt festlegen (siehe „Wünsche an shared“ in `docs/konzept.md`). Vorschlag: in `shared/` nur Schlüssel, Name, Familie; fertigungsspezifische Werte (Mindestbiegeradius, Rückfederung, Einschraubtiefe) bleiben in einer Tabelle im Fertigungs-CORE, verknüpft über den Schlüssel. Fertigung braucht den **Werkstoffzustand** (Alu 5754 weich: r_min ≈ 0,5·s; 6061-T6: ≈ 2–3·s), Schlüssel also z. B. `alu-6061-t6`.

## Aufbau
Werkzeugkiste: oben Material und Dicke (gelten für alle Werkzeuge), darunter Reiter je Werkzeug. Werkzeuge, die zum Material nicht passen, ausgegraut mit Grund („Holz: nicht abkanten“). Jedes Werkzeug: Urteil · Kennwerte · Details, eigener Abschnitt „Modell & Gültigkeit“.

Technik: Tabellen und Formeln im CORE von `fertigung/index.html`; Oberfläche je Werkzeug in `fertigung/biegen.js`, `fertigung/gewinde.js` (Modulgröße < 1500 Zeilen je Datei). Export `{type:"designphysik/fertigung", version, tool, …}`.

### Werkzeug „Biegen“ (v1)
- **Editor:** Profil im Querschnitt als Linienzug (L, U, Z, Hut; bis 4 Biegungen), Schenkel ziehen, Winkel rasten ein, Radius als Regler. Live darunter die **Abwicklung** mit Zuschnittmaß; Löcher/Schlitze darauf setzbar, Sperrzone neben jeder Biegelinie schraffiert.
- **Urteil:** ok „Lässt sich so kanten.“ · knapp/kritisch z. B. „Radius 0,5 mm in Alu 6061-T6 – reißt außen. Mindestens 3 mm oder weiches Alu.“ · „Schenkel zu kurz für die Abkantbank, mindestens 7,5 mm.“ · „Loch zu nah an der Biegung, verzieht sich.“
- **Kennwerte:** Innenradius vs. Mindestradius, Zuschnittlänge, Rückfederung („um ≈ 3° überbiegen“), kürzester Schenkel, Lochabstand.
- **Details:** K-Faktor (aus r/s geschätzt, mit Herkunft), Walzrichtung, Freischnitte; Formeln unter „Für Fachleute“.
- **Export:** Abwicklung als SVG (Laser/Plotter), Hinweis „Endgültige Werte macht der Fertiger“.

### Werkzeug „Gewinde“ (v1)
- **Eingabe:** Gewinde M2–M12 (Regelgewinde), Wanddicke bzw. Dom-Ø, Sack-/Durchgangsloch.
- **Editor:** maßstäblicher Schnitt durch Wand und Schraube; nötige vs. vorhandene Einschraubtiefe sichtbar.
- **Kennwerte:** Kernloch geschnitten/geformt, Durchgangsloch fein/mittel/grob (ISO 273), Senkung, nötige Einschraubtiefe.
- **Urteil mit Alternativen:** Wand zu dünn → Kacheln Durchzug · Einpressmutter · Nietmutter · Einschmelzmutter · Gewindeformschraube (Kunststoff: Dom ≈ 2–2,5·d), je mit Mindestwanddicke. Herstellerabhängige Werte als Band.

### Spätere Werkzeuge (je einzeln an der Prüffrage messen)
| Werkzeug | Entwurfsentscheidung |
|---|---|
| Verbinden (Holz) | vorbohren ja/nein, Bohrer-Ø, Randabstand |
| Schneiden (Laser, Fräse, Wasserstrahl) | Schnittbreite, kleinster Innenradius, Stegbreite, Steckverbindung mit Spiel |
| Passungen | „schiebt sich“ bis „presst“ als Alltagsübersetzung von H7/g6 usw. |
| 3D-Druck | Mindestwand, Überhang, Spiel bewegter Teile |
| Spritzguss | Wanddicke, Entformungsschräge, Rippe/Wand |

## Vorlagen-Galerie (Entwurf)
- Prinzipien: L-Winkel, U-Kanal, Hut-Profil, Gehäusedeckel mit Laschen, Durchzug M3, Dom für Gewindeformschraube in ABS.
- Designklassiker: gekantete Wandkonsole, Tablett mit Ecklaschen, Lampenschirm aus Lochblech, Hocker aus einem Blech, Platinenhalter im Alugehäuse.

## Umfang v1 und Tests
- Werkzeuge Biegen und Gewinde; 6–8 Werkstoffe mit Zustand (DC01, 1.4301, Alu 5754 weich, Alu 6061-T6, Messing, Kupfer; ABS, PLA für Gewinde).
- `test.js` (analytisch/Norm): Kernloch M3 → 2,5 mm, M10 → 8,5 mm (d − P); Abwicklung 90° mit K = 0,5 = Schenkel + Bogenlänge π/2·(r + s/2); Grenzfall r → 0; Datenprüfung (Spannen geordnet, Quelle je Wert, eindeutige Schlüssel).
- Daten: Werte aus Normen/Herstellerangaben übernehmen, nicht Tabellen abschreiben; Quelle je Wert.

## Urteilsschwellen (Herkunft)
- **Biegen kritisch:** Innenradius < r_min (Faktor × s je Werkstoff/Zustand: DC01 0,5 · 1.4301 1 · Alu 5754 H111 1 · Alu 6061-T6 2,5 · CuZn37 halbhart 1 · Cu weich 0,5; Heuristik nach Fertigertabellen, Luftbiegen quer zur Walzrichtung) · Schenkel (Außenmaß) < r + 4·s (Heuristik: Auflage auf Matrize V ≈ 8·s) · gerades Stück < 0 (geometrisch).
- **Biegen knapp:** r < 1,25·r_min (Heuristik) · Kunststoff (Gültigkeitswächter: nicht abkanten).
- **Lochabstand** ≥ r + 2·s vom Lochrand zur Innenseite des Nachbarschenkels (Heuristik); Sperrzone in der Abwicklung entsprechend.
- **Rückfederung:** Tabellenwert bei 90° und r ≤ s (DC01 1° · 1.4301 2,5° · Alu weich 1,5° · Alu T6 3° · Messing 1,5° · Cu 0,5°; Heuristik), linear mit r/s und β/90 (Gardiner, elastische Biegetheorie).
- **Gewinde passt:** Gewindelänge ≥ Einschraubtiefe = Faktor × d (Stahl 1 · Edelstahl 1 · Alu weich 2 · Alu T6 1,5 · Messing 1,25 · Kupfer 2 · Kunststoff 2,5; Richtwerte Schraubenhersteller für 8.8, Größenordnung VDI 2230). **Knapp:** ≥ 3 Gänge (Heuristik). **Kritisch:** < 3 Gänge. Kunststoff höchstens knapp (Verschleiß).
- **Normwerte:** Kernloch DIN 336, Gewindeformer ≈ d − P/2 (Werkzeughersteller), Durchgangsloch ISO 273, Senkung ISO 15065, Steigung DIN 13.
- **Alternativen** (Richtwerte, Herstellerangaben streuen): Einpressmutter ab Blech 0,8 (≤ M5) / 1,4 (M6–M8) / 2,3 mm (M10–M12); Durchzug 0,5–2,5 mm, ≤ M8; Nietmutter 0,5–4 mm; Drahtgewinde Wand ≥ 1,5·d; Einschmelzmutter ≥ 1,2·d; Gewindeformschraube Kunststoff Loch ≈ 0,8·d, Tiefe ≥ 2·d.

## Modell & Gültigkeit (Entwurf)
Faustregeln für Luftbiegen auf der Abkantbank und für Standardgewinde; keine Biegesimulation, keine Festigkeit der Verschraubung, keine Toleranzkette. Weiterführend: SendCutSend-Biegerechner, rechner-portal (DIN 13), TRUMPF-Biegewerkzeug-Handbuch, Datenblätter der Einpressmutter-Hersteller.

## v1 (22.11.2026)
- **Werkzeuge** Biegen und Gewinde, Material und Dicke oben gemeinsam; 8 Werkstoffe mit Zustand (6 Metalle, ABS, PA6).
- **Biegen:** Profil L/U/Z/Hut, Schenkel als Außenmaß, Winkel und Innenradius für alle Biegungen; Profil maßstäblich im Punktraster, zu kurze Schenkel und zu enge Radien rot. Abwicklung maßstäblich mit Biegebereich, Biegelinie und Sperrzone für Löcher; Export als SVG in mm (Umriss + Biegelinien). Materialwechsel setzt den Radius auf die sichere Seite.
- **Gewinde:** M2–M12, Schnitt durch die Wand mit fehlender Einschraubtiefe; Kennwerte Kernloch (geschnitten/geformt bzw. Formschraube in Kunststoff), Durchgangsloch, Einschraubtiefe, Gänge; Tabelle der Alternativen mit „geht“ je Dicke.
- **CORE:** `kDin`, `arc`, `setback`, `unfold`, `rMin`, `flangeMin`, `holeMin`, `springback`, `pitch`, `coreCut`, `coreForm`, `coreScrewPlastic`, `engage`, `thrLevel`, `alts`; Tabellen `MAT`, `THR`, `CLR`, `CSK`.
- **test.js:** DIN 6935 (k, Stetigkeit bei r/s = 5), Bogen der neutralen Faser, Zuschnitt L-Winkel und U-Profil gegen Formel, Winkel 0, Rücksprung; Mindestradius/-schenkel, Rückfederung linear; Kernloch M3/M8/M10 und ≈ d − P für alle, Gewindeformer ±0,1 mm, ISO 273 geordnet; Urteile Stahl/Alu/Kunststoff, Alternativen; Datenprüfung.
- **Browser** (Chromium headless, file://, 1280 und 390 px): beide Werkzeuge, Materialwechsel, Urteile, Link; kein Überlaufen, Konsole fehlerfrei.
- **Datei:** `{type:"designphysik/fertigung", version:1, tool, mat, s, prof, legs, ang, r, B, d}`, Eingang validiert.

## Offen (Pareto)
1. Registry-Eintrag, eigene Farbe (Wünsche an shared), gemeinsame Materialschlüssel mit Material.
2. Werte einzeln gegen Quellen prüfen (Mindestradien, Rückfederung, Einschraubtiefe), Quelle je Wert.
3. Vorlagen-Galerie, Rückgängig, Stand merken (`dpGallery`, `dpHistory`, `dpCompare`).
4. Editor direkt: Schenkel ziehen, Löcher auf der Abwicklung setzen und gegen die Sperrzone prüfen; Winkel je Biegung.
5. Weitere Werkzeuge nach Prüffrage (Holz verschrauben, Schneiden, Passungen, 3D-Druck, Spritzguss).
