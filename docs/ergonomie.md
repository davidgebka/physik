# Modul Ergonomie (`ergonomie/`) – Stand & Historie

Vom Modul-Chat gepflegt (Branch `modul/ergonomie`). Verbindliche Konventionen stehen in `docs/konzept.md`.

**Stand:** v1.1 (22.11.2026), Key `ergonomie`, Hash `#er=`, Export `{type:"designphysik/ergonomie", version:1, scene, pop, shoe, sex, p, sit, stand}`. In `DP_MODULES` mit `ready: true`, Farbe vorerst Familie Bewegung `--mech` (Körperhaltung, Reichweite = Biomechanik; Styleguide: „neue Module bekommen die Farbe ihrer Physik“). Eigene Familie „Körper“ siehe Wünsche in `konzept.md`.

## Entwurfsfrage
„Für wie viele Menschen passt dieses Maß – und für wen nicht?“ Persona A legt Sitzhöhe, Sitztiefe, Tischhöhe, Zarge, Arbeitshöhe, oberstes Fach, Durchgangshöhe fest und entscheidet: für die Mitte, für ein Extrem oder verstellbar. Zugleich Nachschlagewerk (Körpermaße mit Perzentilen, Richtwerte mit Herkunft).

## Umfang v1
- **Editor** Seitenansicht [mm], zwei Szenen: *Sitzen* (Stuhl mit Sitzhöhe, Sitztiefe, Sitzbreite, Armlehnen, Fußstütze; Tisch mit Höhe und Platte + Zarge) und *Stehen* (Arbeitsfläche mit Tätigkeit fein/leicht/schwer, oberes Fach frei oder über der Arbeitsplatte, Kopffreiheit). Höhen fest oder verstellbar (von–bis). Griffe ziehen, Felder für genaue Werte.
- **Figur** aus den Körpermaßen eines Perzentils (Frau/Mann, P1–P99), dazu grau Frau P5 und Mann P95; zeigt hängende Füße, hochkommende Knie, fehlende Reichweite, Kopfstoß. Typfigur: alle Maße auf demselben Perzentil (in Wirklichkeit nicht kombinierbar, KAN) – die Anteile rechnet der Kern je Maß.
- **Nutzer:** gemischt (50/50), nur Frauen, nur Männer; barfuß / Schuhe +25 mm / Absatz +50 mm.
- **Ergebnis:** Urteil, Anteil je Kriterium mit „zu klein / zu groß für …“, „Alle Kriterien zugleich: höchstens …“ (Minimum), Empfehlungen (bester fester Wert, Verstellbereich für P5–P95, Grenzwerte für P5/P95/P99), Körpermasse P99 als Last für die Statik. „Wer passt“ mit Balken; Diagramm „Verteilung“ des maßgebenden Körpermaßes (alle, Frauen, Männer) mit Fläche = passt.
- **Nachschlagen:** Körpermaße (23 Maße, Frau/Mann P5/P50/P95 und beliebiges Perzentil der gewählten Nutzer), Richtwerte (Sitzen, Tische, Stehen und Greifen, Durchgänge, Hand, Gewicht und Last) – berechnete Zeilen folgen den gewählten Nutzern, die übrigen mit Norm bzw. „üblich“.
- **Vorlagen:** Sitzen (10), Stehen (10), Designklassiker (6: Ulmer Hocker, Thonet Nr. 214, Serie 7 in 44 und 46, Cesca, Bierzeltgarnitur; Maße gerundet nach Händlerangaben, Tisch dazu angenommen).

## Rechenkern
- Je Geschlecht und Maß zweiseitige Normalverteilung durch P5/P50/P95 (σ links/rechts getrennt) → trifft die Tabellenwerte exakt, bildet die schiefe Körpermasse ab. Bevölkerung = Mischung; Quantil der Mischung per Bisektion. Φ nach Numerical Recipes (erfc), Φ⁻¹ nach Acklam.
- Kriterium = Band im Körpermaß, Anteil = F(oben) − F(unten); verstellbar: passt, wenn eine Stellung passt. Empfehlungen über die Umkehrfunktionen.
- Tisch/Beinfreiheit: Einstellung des Einzelnen (`choose`): verstellbarer Sitz so hoch, wie der feste Tisch verlangt, solange die Füße stehen (cos 30° … cos 5° der Kniekehle), sonst 0,95 × Kniekehle; verstellbarer Tisch folgt dem Ellenbogen + 20 mm. Mittelung über 64 × 96 Quantile (Kniekehle × Ellenbogen) je Geschlecht; alles fest → geschlossene Lösung.
- **Daten:** gerundete Richtwerte nach DIN 33402-2 und Pheasant & Haslegrave „Bodyspace“; Anker KAN-Leitfaden Anthropometrie 2013: Sitzflächenhöhe P5 ♀ … P95 ♂ = 375 … 490 mm. Abgleich mit den Gestaltungsgrenzen nach DIN EN ISO 14738:2005 (europäische Bevölkerung P5/P95, Tab. 1 im Gutachten Çakir & Çakir 2006 zur Neufassung DIN 33402-2:2005, vom Nutzer bereitgestellt): fast alle Werte innerhalb 2–5 %, Oberschenkel und Fußlänge gleich; Hüftbreite sitzend P95 ♀ daraufhin 460 → 440 mm. Die Wertetabelle der DIN 33402-2 selbst lag nicht vor → **offen: Werte gegen DIN 33402-2:2020 abgleichen.**
- `test.js`: 90 Prüfungen, < 1 s – Φ/Φ⁻¹, Tabellenwerte exakt, Schuhzuschlag, symmetrischer Fall (68,27 %), Mischquantil, Rangfolgen und Proportionen der Daten, jedes Kriterium gegen die geschlossene Formel, Fußstütze = höherer Boden, Verstellbereich aus der Empfehlung deckt genau 90 %, Tisch fest gegen geschlossene Lösung, verstellbar ≥ fest, Einstellung im Fußband, Kopffreiheit P99, Urteilsstufen.
- Browser (Chromium, file://, 1280 px und iPhone 13 mit Touch über CDP): alle 26 Vorlagen, Ziehen (Maus/Finger, Lupe), Rückgängig, Stand merken, verstellbar, Link-Rundreise identisch, kaputter/teilgültiger Link, Konsole fehlerfrei, kein Querscrollen.

## Urteilsschwellen (Herkunft)
| Schwelle | Wert | Herkunft |
|---|---|---|
| Komfort passt / knapp | ≥ 90 % (P5–P95) / ≥ ⅓ | Entwurfsregel P5–P95; Grenze knapp/kritisch Heuristik |
| Sicherheit (Kopffreiheit) passt / knapp | ≥ 99 % / ≥ 95 % | übliche Auslegung auf P99, Heuristik für knapp |
| Hinweis (Einsicht ins Fach) | geht nicht ins Urteil ein | – |
| Sitzhöhe | Kniekehle·cos 30° ≤ Sitz − Fußstütze ≤ Kniekehle·cos 5° | Parcells, Stommel, Hubbard 1999 (in Gouvali & Boudolos 2006) |
| Sitztiefe | ≤ 0,95 × Gesäß-Kniekehlen-Länge (≥ 0,80 nur Empfehlung) | Parcells u. a. 1999 |
| Sitzbreite | ≥ Hüftbreite, mit Armlehnen ≥ 1,1 × | Parcells u. a. 1999 |
| Tischhöhe | Tisch − Sitz − Ellenbogen sitzend in −30 … +70 mm | Heuristik (Schreiben, Essen, Tastatur) |
| Beinfreiheit | Unterkante − Sitz ≥ Oberschenkel + 20 mm | Parcells u. a. 1999 (Zugabe), gerundet |
| Arbeitshöhe stehend | Ellenbogen − Fläche: fein −100…−50, leicht 100…150, schwer 150…400 mm, je ±25 mm | Grandjean, Physiologische Arbeitsgestaltung; Toleranz Heuristik |
| Oberes Fach | Reichweite ≥ Fach + 50 mm (+150 mm über Arbeitsplatte) | Heuristik |
| Kopffreiheit | Körperhöhe + Schuh ≤ Höhe | geometrisch |
| Griffdurchmesser (Kraftgriff) | Optimum 19,7 % der Handlänge, passt bei ±5 mm | Edgren, Radwin, Irwin 2004; Toleranz Heuristik |
| Griffbreite (ganze Hand) | lichte Weite ≥ Handbreite + 25 mm | Heuristik |
| Gültigkeitswächter | Sitz − Fußstütze < 380 mm → höchstens knapp | Regeln gelten für aufrechtes Sitzen |

## v1.1 (22.11.2026, Wunsch des Nutzers: Referenzen)
- Neuer Abschnitt **Referenzen** mit drei Reitern, jede Zeile mit „passt für …“ für die gewählten Nutzer:
  - *Sitzhöhen* (15): Schulstuhl DIN EN 1729 Größe 6/7, Bürostuhl DIN EN 1335, Esstischstuhl, Designklassiker, WC, WC barrierefrei, Bettkante, Sofa, Barhocker. „Laden“ übernimmt die Höhe in die Seitenansicht.
  - *Griffe* (8): Handlauf DIN 18040, Fahrradgriff, Hammerstiel, Türdrücker, Kugelschreiber, Bügelgriffe 96/128/160 mm.
  - *Höhen im Raum* (10): Schreibtisch, Arbeitsplatte, Theke, Türdrücker, Lichtschalter, Steckdose, Oberschrank, Garderobe, Tür, Treppe.
- Kern: `gripDia` (Kraftgriff-Optimum nach Edgren u. a. 2004) und `gripWidth`; Richtwert „Griffdurchmesser“ berechnet statt fest.
- Daten: Abgleich ISO 14738 als Test, Hüftbreite korrigiert (siehe Rechenkern).
- Telefon: Referenzzeilen als Block (Name · Anteil · Laden, darunter Maß und Hinweis). Browser 1280/390 px, Konsole fehlerfrei.

## v1.2 (22.11.2026, Style-Chat: eigene Modulfarbe)
- Farbe `--ergo` `#60a06e` statt `--mech`: helleres, weicheres Grün in der Familie Bewegung (Mensch statt Maschine), unterscheidbar von Mechanik. Nur Farbtokens getauscht, Rechnung unverändert, Tests grün.

## Offen (Vorschläge)
- Daten gegen DIN 33402-2:2020 abgleichen, Altersgruppen (über 65), Kinder (DIN EN 1729 Größenklassen).
- Greifraum nach vorn/seitlich (Tischtiefe, Bedienfeld), Sichtlinie/Bildschirm, Rollstuhl (DIN 18040).
- Bedienkräfte (Drehen, Drücken, Ziehen) – koppelt an Mechanik; Sitzlast mit Stoß direkt an Statik übergeben.
- Lehne (Höhe, Neigung) und Polster; Sitzneigung.
