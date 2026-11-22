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

## v0.3 (22.11.2026, 100 Materialien, Kategorien)
- **100 Materialien in 10 Kategorien:** Massivholz 17, Holzwerkstoff 9, Metall 17, Kunststoff 19, Schaumstoff 5, Elastomer 6, Glas & Keramik 8, Stein & Beton 8, Verbund 5, Naturstoff & Papier 6. Neu u. a. Lärche, Douglasie, Kirsche, Teak, Linde, Pappel, Robinie; OSB, HPL, Pappelsperrholz, Tischlerplatte, HDF, Furnierschichtholz; Alu 6082/7075/Druckguss, Grauguss, Federstahl, Cortenstahl, Bronze, Zinn, Magnesium, Silber; PE-LD, PS, PVC, PA6, PA12 (SLS), PET, PEEK, PTFE, Epoxid, UP-Harz; EPS, PU weich/hart, EVA, PE-Schaum; Naturkautschuk, EPDM, NBR, TPE; ESG, Glaskeramik, Steinzeug, Steingut, Aluminiumoxid; Marmor, Sandstein, Schiefer, Ziegel, Gips, Glasfaserbeton; Flachsfaser-Verbund, WPC, Alu-Verbundplatte; Papier, Wellpappe, Leder, Wollfilz.
- **Kategorien:** Knöpfe zum Ein-/Ausblenden (plus „alle/keine“), in Karte, Rangliste und Urteil wirksam; das gewählte Material bleibt immer sichtbar. Im Urteil steht, womit verglichen wurde. Karte: gepunktete konvexe Hülle je Kategorie mit Namen (wie bei Ashby). Export/Link um `off` (ausgeblendete Kategorien) erweitert, version bleibt 1.
- Rangliste zeigt die besten 10 und das gewählte, „Alle N zeigen“ klappt auf. Linker Kartenrand passt sich der längsten Achsenzahl an.
- **Vorbehalt unverändert:** Richtwerte aus dem Gedächtnis nach den genannten Quellen, nicht einzeln geprüft; Schaumstoffe, Naturstoffe, Silber, PEEK/PTFE und Preise/CO₂ besonders grob.
- test.js 32 Prüfungen (+3: 100 Materialien, alle 10 Kategorien belegt, EPS fühlt sich warm an; Datenprüfung erweitert auf die Kategorienliste). Browser 1280/390 px: Kategorien aus/ein, nur Holz + Metall, Rangliste aufklappen, Link-Rundreise mit Filter; kein Überlaufen, Konsole fehlerfrei.

## v0.4 (22.11.2026, Werte geprüft)
- **83 von 100 Materialien** gegen externe Quellen abgeglichen; je Material Feld `chk` mit Quelle und geprüften Werten, sichtbar unter „Alle Werte → Geprüft“ (ungeprüfte mit „–“ und Hinweis in Rot).
- Quellen: The Wood Database (16 Holzarten: Dichte, E, Biegefestigkeit), Wood Handbook (λ von Holz: λ = 0,243·G + 0,019, alle Holzarten innerhalb der Spanne), Herstellerdatenblätter (u. a. DEW/Outokumpu, Aurubis, Kemper, Dynacast, voestalpine, INEOS, BASF Ultramid, EOS, Perspex/Plexiglas, Schott, Pilkington, CoorsTek, Egger, Pfleiderer, Metsä Kerto, 3A Dibond, Gurit), Normwerte (EN 1561, EN 438-4, EN 12326, EN 12372, Eurocode 2), ICE (Nadelschnittholz 0,26 kg CO₂e/kg).
- **Korrigiert** (Auszug): Kiefer, Eiche, Ahorn, Pappel E bzw. Dichte niedriger; Linde E höher (7,5–12 GPa); Nuss, Kirsche fester; Multiplex f 60–100; Pappelsperrholz f 25–55, E 2,5–6,5 GPa; Grauguss f 200–300; Zinkdruckguss f 210–270; Federstahl f ab 900; Titan, Silber, Zinn E; Kupfer λ 380–395; PMMA E 3,0–3,3 GPa, f 65–80; PLA f 40–60; PET f 55–80; PE-HD E 0,6–1,4 GPa; ABS Gebrauch 80–95 °C; PA12 λ; PEEK λ; Epoxid Dichte; TPU f 10–50; EPS Biegefestigkeit 0,07–0,35; EVA Dichte; Borosilikat f 25–70; Glaskeramik f 110–160; Porzellan E 50–90 GPa, f 30–100; Aluminiumoxid E 300–340 GPa, λ 18–26; Beton f 2,5–6; Sandstein f 5–25; Schiefer f 35–75; Ziegel λ 0,4–0,9; MDF/Spanplatte E untere Grenze auf Norm-Mindestwerte; Furnierschichtholz E 13–14,5 GPa; CFK f 500–950; GFK f 200–550; Alu-Verbundplatte Dichte 1200–1400, E 30–40 GPa (aus Deckblechen gerechnet); WPC, Flachs-Verbund, Kork angepasst.
- **Nicht geprüft (17):** Stahl S235, Cortenstahl, Aluminium-Druckguss, PTFE, PU-Weich- und Hartschaum, Steinzeug, Steingut, Glasfaserbeton, Papier, Karton, Wellpappe, Leder, Wollfilz, OSB, Tischlerplatte, HDF – keine Quelle mit Zahlen gefunden (Normtexte hinter Bezahlschranke). **Preise** generell nicht geprüft; **CO₂** nur stichprobenartig (Nadelholz, Aluminium).
- Netz: MakeItFrom sperrt automatische Abrufe (403), daher Abgleich über Websuche und frei zugängliche Seiten; für diese Sitzung eigene Umgebung „physik“ mit freigegebenen Quellseiten.
- test.js 33 Prüfungen (+1: Prüfvermerke gültig). Browser 1280/390 px, Konsole fehlerfrei.

## v0.5 (22.11.2026, Werkstoffliste; zentraler Chat)
- Datensatz ist Quelle für `shared/materials.js` (Schlüssel, Name, Kategorie; `tools/test.js` prüft die Übereinstimmung).
- **103 Materialien:** neu Stahlblech DC01, Aluminium 5754, Aluminium 6061 (Grundwerkstoffe für Fertigung), Werte nach EN 10130, EN 485-2, EN 573-3 – **nicht gegen externe Quellen abgeglichen** (kein `chk`, in der Karte als ungeprüft markiert). test.js: 103 Materialien.

## v0.6 (22.11.2026, zentraler Chat, Werte-Audit)
- Sieben bisher ungeprüfte Werkstoffe belegt und teils korrigiert (`chk`): HDF E 3000–5000 (vorher ab 3500; Pfleiderer, Kastamonu), PTFE λ 0,20–0,26 (Röchling, Curbell), Aluminium-Druckguss λ 100–150 (AlSi9Cu3 100–120), Glasfaserbeton Dichte 1900–2100, E 10–20 GPa, f 10–30 (vorher 2000–2300, 15–30 GPa, 10–25), Steinzeug λ 0,8–1,3 (vorher 1–1,6), OSB (EN 300 OSB/3: f 18–22, E 3500) und Cortenstahl (S355J2W) bestätigt. Weiter ungeprüft: S235, DC01, Alu 5754/6061, PU-Schäume, Steingut, Papier, Karton, Wellpappe, Leder, Wollfilz, Tischlerplatte; Preise und CO₂.

## Urteilsschwellen (Herkunft)
- passt, wenn kein Material das Ziel um mehr als Faktor 1,5 besser erreicht; sonst knapp mit dem besten Material und Ersparnis in % (Heuristik).
- Berührgefühl: ≥ 28 °C „warm“, 24–28 °C „neutral bis kühl“, < 24 °C „kalt“ (Heuristik); Haut 33 °C, b_Haut = 1000 W·s½/(m²·K) (Literatur etwa 1000–1500).

## Offen (Pareto-Reihenfolge)
1. Die 17 ungeprüften Materialien belegen (Normwerte EN 300, EN 13353, EN 10025, EN 1706); Preise und CO₂ systematisch (ICE-Tabelle, Händlerpreise).
2a. Urteil: Sonderfälle (Balsa, CFK) ausnehmen oder Filter „übliche Materialien“?
3. Telefon: Kategorie-Knöpfe belegen vier Zeilen – ggf. aufklappbar.
4. Übergabe „In Statik verwenden“ (Material per Link) – Datensatz dann nach `shared/`.
5. Vorlagen-Galerie (z. B. Regalbrett leichter, Griff nicht kalt, Lampenschirm hitzefest).
