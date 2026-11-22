# Modul Material (`material/`) – Stand & Historie

Verbindliche Konventionen stehen in `docs/konzept.md`.

**Entwurfsfrage:** Welches Material macht das Brett, den Balken, den Stab leichter, günstiger, klimafreundlicher, und wie fühlt es sich an? Kein Erkennungswerkzeug, sondern Werkstoffwahl nach Ashby für die frühe Entwurfsphase.

## v0.1 (22.11.2026, Startstand)
- **Karte:** doppelt logarithmisch, Achsen frei wählbar (Dichte, Steifigkeit, Festigkeit, Wärmeleitung, Berührgefühl, Höchsttemperatur, Preis, CO₂); jedes Material als Ellipse über seine Spanne (mindestens 5 px), Beschriftung ohne Überschneidung, antippen wählt aus. Bei Steifigkeit bzw. Festigkeit über Dichte und Ziel „leicht“: gestrichelte Linie gleicher Eignung durch das gewählte Material (Steigung 1/n).
- **Ziel:** Brett · Balken · Stab × steif · fest × leicht · günstig · wenig CO₂. Rangliste: Gewicht, Kosten bzw. CO₂ für ein gleich steifes bzw. festes Bauteil relativ zum gewählten Material, dazu das nötige Maß (Dicke, Kantenlänge, Durchmesser). Glas als „spröde“ markiert.
- **Kennwerte:** Urteil, Dichte, Steifigkeit, Festigkeit, Berührung (Hauttemperatur im ersten Moment), Preis; „Alle Werte“ mit Spannen, Verarbeitung, Quelle. Stand merken (`dpCompare`) zeigt Abweichungen in %, gemerktes Material gestrichelt in der Karte.
- **Datei:** Export/Import/Link `{type:"designphysik/material", version:1, k, part, prop, by, x, y}`, Hash `#w=`, Eingang validiert.
- **Daten:** 10 Materialien als Format- und Aufwandstest: Fichte, Eiche, Multiplex Birke, MDF, Stahl S235, Aluminium 6060, PP, PMMA, Floatglas, Silikon. Je Material ρ, E, f, λ, c, Höchsttemperatur, €/kg, CO₂/kg als Spanne [von, bis] plus Verarbeitung und Quelle; b = √(λρc) abgeleitet. **Die Werte sind Richtwerte aus dem Gedächtnis, gestützt auf die genannten Quellen (Wood Handbook, EN 338/10025/755-2/572, ICE, Datenblätter), und noch nicht einzeln gegen die Quelle geprüft.** Preis und CO₂ sind grobe Schätzungen.
- **CORE:** `effort` (Masse ∝ ρ·P^−n, × €/kg bzw. CO₂/kg), `size` (Maß ∝ P^d), `rank`, `contact`/`touch` (Berührtemperatur halbunendlicher Körper), `bOf`, `gm` (geometrisches Mittel der Spanne).
- **test.js:** 29 Prüfungen – Kennzahlen für alle Bauteile/Eigenschaften an zwei Kunstmaterialien (analytisch), Maß-Exponenten, Kosten/CO₂-Gewichtung, Rangliste, Berührtemperatur (Mitte, Grenzfälle), b von Stahl; Realitätschecks (Holz warm, Metall kalt, Glas dazwischen; Brett: Holz vor Alu vor Stahl; Stab auf Zug: Stahl ≈ Alu ≈ Holz); Datenprüfung (Spannen positiv und geordnet, Grenzen, Quelle, eindeutige Schlüssel).
- **Browser** (Chromium headless, file://, 1280 px und 390 px): Karte anklicken, Rangliste, Ziele, Stand merken, Link-Rundreise; kein Überlaufen, Konsole fehlerfrei.

## v0.2 (22.11.2026, 40 Materialien)
- Datensatz von 10 auf **40** erweitert: Massivholz (Fichte, Kiefer, Eiche, Buche, Esche, Ahorn, Birke, Nussbaum, Bambus verleimt, Balsa), Holzwerkstoffe (Multiplex Birke, MDF, Spanplatte), Metalle (Stahl S235, Edelstahl 1.4301, Aluminium 6060, Messing, Kupfer, Zinkdruckguss, Titan Grade 5), Kunststoffe (PP, PE-HD, ABS, PC, PMMA, PA6 GF30, POM, PETG, PLA), Elastomere (Silikon, TPU), Glas, Keramik, Stein (Floatglas, Borosilikatglas, Porzellan, Beton, Granit; alle „spröde“), Verbund (CFK, GFK, je Gewebe in der Plattenebene), Naturstoffe (Karton, Presskork).
- **Gleicher Vorbehalt wie v0.1:** Richtwerte aus dem Gedächtnis nach den genannten Quellen, noch nicht einzeln geprüft; Preis und CO₂ grob.
- Karte: Namen ohne freien Platz werden weggelassen (Auswahl immer beschriftet, antippen zeigt den Namen). Modelltext: Festigkeit von Beton/Stein als Biegezug, Verbund in der Plattenebene.
- Folge: Für „steifes Brett, leicht“ gewinnt jetzt Balsa, für Stab und Balken CFK. Das stimmt nach Ashby; ob Balsa/CFK im Urteil ausgenommen werden sollen (z. B. Schalter „nur übliche Materialien“), ist offen.
- Tests unverändert grün (29 Prüfungen, Datenprüfung über alle 40). Browser 1280/390 px, Konsole fehlerfrei.

## Urteilsschwellen (Herkunft)
- passt, wenn kein Material das Ziel um mehr als Faktor 1,5 besser erreicht; sonst knapp mit dem besten Material und Ersparnis in % (Heuristik).
- Berührgefühl: ≥ 28 °C „warm“, 24–28 °C „neutral bis kühl“, < 24 °C „kalt“ (Heuristik); Haut 33 °C, b_Haut = 1000 W·s½/(m²·K) (Literatur etwa 1000–1500).

## Offen (Pareto-Reihenfolge)
1. Werte der 40 Materialien gegen die Quellen prüfen und Quelle je Wert festhalten.
2. Nächste Kandidaten (erst bei Bedarf): OSB, HPL, Aluminium 6082, PA6 unverstärkt, Wellpappe, Leder, Filz, Gusseisen.
2a. Urteil: Sonderfälle (Balsa, CFK) ausnehmen oder Filter „übliche Materialien“?
3. Familien als Hüllflächen hinter den Ellipsen, sobald je Familie mehrere Materialien da sind.
4. Übergabe „In Statik verwenden“ (Material per Link) – Datensatz dann nach `shared/`.
5. Vorlagen-Galerie (z. B. Regalbrett leichter, Griff nicht kalt, Lampenschirm hitzefest).
