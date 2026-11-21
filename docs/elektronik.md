# Modul Elektronik (`elektronik/`) – Stand & Historie

Vom Modul-Chat gepflegt (Branch `modul/elektronik`). Verbindliche Konventionen stehen in `docs/konzept.md`.

**Stand:** Konzept (21.11.2026), noch kein Code. Wünsche an shared (Registry, Farbe `--elec`) sind in `docs/konzept.md` eingetragen.

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
