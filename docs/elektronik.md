# Modul Elektronik (`elektronik/`) – Stand & Historie

Vom Modul-Chat gepflegt (Branch `modul/elektronik`). Verbindliche Konventionen stehen in `docs/konzept.md`.

**Stand:** v1 (21.11.2026), Key `elektronik`, Hash `#e=`. In `DP_MODULES` mit `ready: true`, Familie Elektrik `--elec` (style.css). Leitungen und Knoten in `--elec` (Editor und Galerie-Skizzen), Bauteile `--ink`, Leuchten `--light-a`.

## Entwurfsfrage
„Hält der Akku lange genug, reicht der Strom, wird etwas zu heiß?“ – Persona A entscheidet Batterie/Akku (Laufzeit, Bauraum, Gewicht), Netzteil, Leitungen, ob ein Mikrocontroller einen Verbraucher direkt schalten kann. Kein Schaltungssimulator, kein Lehrbaukasten.

## Abgrenzung (Recherche 21.11.2026)
| Werkzeug | Stärke | Übergabe von uns |
|---|---|---|
| Falstad / CircuitJS (GPL v2) | allgemeine Simulation, Transienten, AC | Schwingkreise, zeitlicher Verlauf |
| PhET Circuit Construction Kit | Unterricht, Batterie/Lampe/Schalter | – |
| Tinkercad Circuits, Wokwi | Arduino/ESP32/Pico mit echtem Code | Code testen |
| Fritzing, KiCad | Steckbrett/Schaltplan/Platine | Platine, Dokumentation |
| Einzelrechner (DigiKey, Adafruit Energy Budgets) | Laufzeit, Vorwiderstand | – (wir verknüpfen das) |

Lücke: keiner beantwortet Laufzeit + Strombelastung + Wärme + Bauraum zusammen in Designsprache.

## Umfang
- **Editor:** Schaltplan auf dem Punktraster, Bauteile ziehen und verbinden, Schalter per Klick. Kein Steckbrett-Look.
- **Bauteile mit Vorgabewerten:**
  - Quellen: AA, AAA, 9 V, CR2032, 18650, LiPo, USB 5 V, Netzteil 5/12/24 V – Nennspannung, Kapazität, Innenwiderstand, Gewicht, Maße.
  - Schalter, Taster, Widerstand (mit Belastbarkeit), Leitung (Länge, Querschnitt → Spannungsabfall, Erwärmung).
  - Verbraucher: LED je Farbe (U_F, I_max), Glühlampe, DC-Motor (Nenn- und Anlaufstrom), Summer, LED-Streifen je m.
  - Mikrocontroller als Blackbox (v2): Arduino Uno/Nano, ESP32, Pi Pico, Raspberry Pi 4/5 – Versorgung, Strom aktiv/Schlaf, Strom je Pin und gesamt. Kein Code.
  - v2: Transistor/MOSFET als Schalter, Spannungswandler (linear/Step-down, Wirkungsgrad).
- **Rechenkern:** Gleichstrom stationär, modifizierte Knotenanalyse; LED/Diode nichtlinear per Newton mit Spannungsbegrenzung; Schalter offen/zu. Kein AC, keine Transienten.
- **Urteil (Beispiele):** „LED brennt durch (35 mA > 20 mA)“ · „Widerstand wird heiß (0,4 W > 0,25 W)“ · „Pin liefert max. ~20 mA – Motor braucht Transistor“ · „Spannung bricht auf 3,1 V ein, ESP32 startet neu“ · „Akku hält ≈ 6 h“ · „Kurzschluss“.
- **Kennwerte:** Laufzeit (Kapazität × nutzbarer Anteil / Strom, v3 mit Lastprofil), Leistung, Ströme/Spannungen je Bauteil, Verlustleistung, Batteriegewicht und -volumen.

## Bewusst nicht
230 V Netzspannung und echte Trafos (Elektrofachkraft; „Trafo“ nur als Netzteil-Baustein) · Code ausführen (→ Wokwi/Tinkercad) · Platine (→ Fritzing/KiCad) · AC, Schwingkreise, Transienten (→ Falstad).

## Ausbaustufen
1. **v1:** Quellen, Schalter, Widerstand, LED, Lampe, Motor, Leitung; Löser; Urteil; Laufzeit; Vorlagen-Galerie (Taschenlampe, Nachtlicht, USB-Leuchte …).
2. **v2:** Mikrocontroller-Blöcke, Transistor, Spannungswandler.
3. **v3:** Lastprofil (Tastverhältnis/Schlaf), Akku-Bauraum und -Gewicht im Variantenvergleich, Erwärmung.

## Tests (geplant, analytisch)
Spannungsteiler · Reihen-/Parallelschaltung · Innenwiderstand (Klemmenspannung, Kurzschlussstrom) · LED-Vorwiderstand gegen Shockley-Lösung · Knotenregel Σ I = 0 an Zufallsschaltungen · Laufzeit = C/I.

## Offene Punkte
- Vorgabewerte gegen Datenblätter prüfen. Pin-Grenzen bisher nur aus Sekundärquellen: Uno R3 ~20 mA/Pin, Uno R4 Minima 8 mA (Handbuch ABX00080), Pi 4 16 mA max./8 mA empfohlen, ~50 mA gesamt, Pico offen (RP2040-Datenblatt).

## Historie
- **v1** (21.11.2026): Schaltplan-Editor auf dem Raster – Werkzeuge Ziehen / Leitung / Löschen, Bauteile Batterie, Schalter, Widerstand, LED, Lampe, Motor, Kabel (Länge 2 Raster, Drehen per Knopf oder R, Entf löscht). Leitungen ideal, verbinden nur an den Enden; Ziehen nimmt angeschlossene Leitungsenden mit; Schalter antippen schaltet; offene Anschlüsse als roter Ring, Knoten ab 3 Anschlüssen als Punkt. Beschriftung je Bauteil: Wert und Ergebnis (Strom, bei Batterie Klemmenspannung, bei Kabel ΔU); LED/Lampe leuchten in `--light-a` nach Helligkeit.
  - Quellen: AA Alkali, AA NiMH, AAA, 9-V-Block, CR2032, 18650, LiPo 1000 mAh (Zellen 1–12 in Reihe), USB 5 V, Netzteil 12 V/24 V – Spannung, Ri, Kapazität, Dauerstrom, Gewicht, Volumen, Maße (Richtwerte).
  - CORE: `netlist` (Rasterpunkte über Leitungen vereinigt → Knoten, offene Anschlüsse), `solve` (Knotenanalyse, Quellen als Norton-Ersatz, Newton; je Teilnetz ein Bezugsknoten, GMIN 1e-12), `analyze` (Urteil je Bauteil, Laufzeit = C/I, Anlauf mit Motoren als Ankerwiderstand, Batteriegewicht/-volumen). LED: v = I·Rs + n·U_T·ln(1 + I/Is), I(v) per Bisektion; Glühlampe I ∝ U^0,6, Licht ∝ U^3,4; Motor im Lauf R = Un/In (Last ∝ Drehzahl), Anlauf Un/Ia; Kabel ρ_Cu L/A; Schalter 10 mΩ. Schwellen im Abschnitt „Modell & Gültigkeit“.
  - Kennwerte: Urteil, Laufzeit (gegen „Laufzeit soll“), Strom aus der Quelle, Leistung, Batterien (g, cm³, Maße); „Alle Werte“: U · I · P je Bauteil mit Helligkeit/Drehzahl/Anlaufstrom und Warnung. Vergleich (`dpCompare`, rechnet den gemerkten Stand neu), Rückgängig (`dpHistory`), Galerie mit 12 Vorlagen (Prinzipien: LED mit/ohne Vorwiderstand, zwei LEDs an einem Widerstand, Lampen in Reihe, langes dünnes Kabel, Knopfzelle + LED; Produkte: Taschenlampe, USB-Leuchte, Nachtlicht, USB-Leselampe 1 W, Ventilator, Spielzeugauto). Export/Link `{type:"designphysik/elektronik", version:1, parts:[{t,x,y,r,…}], wires:[[x1,y1,x2,y2]], soll?}`, Eingang validiert (unbekannte Bauteile verworfen, ungültige Werte → Vorgabe).
  - test.js: 48 Prüfungen – Reihe, Spannungsteiler, Parallel, Innenwiderstand, Kurzschluss, LED I(Vf) = In je Farbe, LED + Vorwiderstand gegen unabhängige Bisektion (5 Fälle, auch ohne Widerstand), dI/dv gegen Differenzenquotient, Sperrrichtung, Glühlampe Nenn-/Halbspannung und Reihe, 4 × AA, Motor Lauf/Anlauf/Drehzahl, Kabelwiderstand, Schalter offen/zu, offener Anschluss, Urteile (LED 20 mA passt, ohne Widerstand kritisch, CR2032 überlastet, Kurzschluss, Lampe glimmt, Soll-Laufzeit), Laufzeit = C/I, 300 Zufallsnetze (alle konvergiert, Σ I je Knoten < 1e-9 A).
  - Browser (Chrome headless, file://, 1280 px und 390 px Touch): alle Vorlagen, Bauteile setzen, Leitung ziehen und antippen, Verschieben mit Leitungsenden, Schalter, Farbe, Drehen, Strg+Z, Vergleich, Link-Rundreise identisch, kaputter/ungültiger Link; kein Überlaufen, Konsole fehlerfrei.
  - Offen: Mikrocontroller-Blöcke, Transistor/MOSFET, Spannungswandler (v2) · Lastprofil, Bauraum im Vergleich (v3) · Wechsel-/Taster · Vorgabewerte gegen Datenblätter prüfen.
- **v1.1** (21.11.2026, zentraler Chat): Farbe Elektrik – Leitungen und Knoten in `--elec`, auch in den Galerie-Skizzen; Bauteile bleiben `--ink` (wie Gefäß/Mechanik: Medium in der Familienfarbe).
- **v1.2** (21.11.2026, Fehler vom Telefon): **Bauteil auf einer Leitung war überbrückt** – Leitungen verbanden nur an ihren Enden; ein Schalter, mitten auf eine Leitung gesetzt, lag parallel zu ihr und schaltete nichts. Neu `Core.tidy` nach jeder Bearbeitung und beim Laden: Leitungen werden an Anschlüssen und Leitungsenden auf ihrem Verlauf geteilt (T-Abzweig verbindet), das Stück unter einem Bauteil entfällt; Kreuzungen ohne Punkt bleiben getrennt. test.js 56 Prüfungen (+8: überbrückter Schalter vorher/nachher, offen/zu, idempotent, T-Abzweig, Diagonale, Kreuzung). Browser 390 px Touch: Schalter auf die Leitung der Vorlage „LED mit Vorwiderstand“ gesetzt, aus/ein, Rückgängig; alle Vorlagen unverändert.
