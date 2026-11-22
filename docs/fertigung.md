# Modul Fertigung (`fertigung/`) – Stand & Historie

Vom Modul-Chat gepflegt (Branch `modul/fertigung`). Verbindliche Konventionen stehen in `docs/konzept.md`.

**Stand:** v0 – Konzept (22.11.2026), noch kein Code. Key `fertigung`, Hash `#f=`, eigene Farbfamilie (Vorschlag `--fab`, Wunsch an Style-Chat).

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
(werden mit v1 eingetragen: Mindestbiegeradius je Werkstoff/Zustand, Mindestschenkel ≈ 4·s + r (Heuristik, Matrizenbreite), Lochabstand ≈ 2·s + r (Heuristik), Einschraubtiefe Stahl ≈ 1·d, Alu ≈ 2·d, Kunststoff herstellerabhängig.)

## Modell & Gültigkeit (Entwurf)
Faustregeln für Luftbiegen auf der Abkantbank und für Standardgewinde; keine Biegesimulation, keine Festigkeit der Verschraubung, keine Toleranzkette. Weiterführend: SendCutSend-Biegerechner, rechner-portal (DIN 13), TRUMPF-Biegewerkzeug-Handbuch, Datenblätter der Einpressmutter-Hersteller.
