# Audit der physikalischen Grundlagen (21.11.2026)

Geprüft wurden die CORE-Blöcke aller fünf Module (Licht v2.7, Statik v1.8, Gefäß v1.15, Elektronik v3, Mechanik v1.6), die Urteilslogik in der Oberfläche, die Materialtabellen und die Modultexte „Modell & Gültigkeit“. Alle `*/test.js` sind grün. Zwei Befunde wurden mit kurzen Skripten gegen den echten Kern nachgerechnet (markiert mit **nachgerechnet**). Normwerte, die ich aus dem Gedächtnis zitiere, sind mit „(prüfen)“ gekennzeichnet.

**Gesamturteil:** Die Rechenverfahren sind durchweg sauber umgesetzt und gegen analytische Fälle getestet. Am stärksten sind Gefäß (Taschenmodell, exakte Geometrie) und Mechanik (Kinematik mit Zweigtreue). Die Schwächen liegen fast nie in der Mathematik, sondern an drei Stellen:
(a) **Modellgrenzen, die das Urteil nicht erreichen.** Das Modell rechnet einen Fall, den es gar nicht abdeckt, und meldet dann „passt“.
(b) **Grenzwerte ohne Bezug zur Lastdauer oder zum Lampentyp.**
(c) **Feste Eingangsgrößen, wo die Physik eine Kurve verlangt**, etwa die Entladekurve einer Batterie.
Die Tests sichern die Rechenrichtigkeit. Ob das Modell die Wirklichkeit trifft, prüft bisher kein Test (Roadmap-Punkt 7 „Realitätscheck“).

Schweregrade:
- **A**: Das Urteil kann „passt“ melden, obwohl der Entwurf real versagt (unsichere Seite).
- **B**: Die Größenordnung oder Richtung ist spürbar verzerrt, oder eine Aussage fehlt, die Persona A braucht.
- **C**: Eine bewusste, dokumentierte Abkürzung, für die Frühphase vertretbar.

## Rangfolge der Befunde

| # | Modul | Grad | Befund | Aufwand |
|---|---|---|---|---|
| 1 | Statik | A | Knicken nur um die Biegeachse gerechnet; die schwache Achse fehlt (**nachgerechnet**: Latte 20 × 60 mm stehend: Knicksicherheit 12,3 hochkant gegenüber 1,44 flach, angezeigt wird 12,3) | klein |
| 2 | Elektronik | A/B | Laufzeit = Nennkapazität / Strom bei konstanter Nennspannung: keine Entladekurve, keine Abschaltspannung des Verbrauchers, keine Abhängigkeit vom Entladestrom (**nachgerechnet**: Uno an 9-V-Block 11 h bei konstant 8,9 V) | mittel |
| 3 | Licht | A | Abschirmwinkel-Schwelle fest 15°, obwohl LED und klare Glühfäden nach der im Modul zitierten Tabelle 30° verlangen | klein |
| 4 | Licht | A | Leuchtdichte nur aus streuenden Anteilen: Spiegel und Klarglas zeigen das Lampenbild in voller Lampenleuchtdichte, gehen aber nicht in „max. Leuchtdichte“ ein | klein–mittel |
| 5 | Statik | A | Zielsicherheit unabhängig von der Lastdauer; bei MDF und Spanplatte unter Dauerlast deutlich zu niedrig | klein |
| 6 | Elektronik | A | IRLZ44N an 3,3-V-Gate (ESP32, Pico) gilt als voll durchgeschaltet (25 mΩ), ohne Warnung | klein |
| 7 | Statik | B | Druckstäbe ohne Vorkrümmung (Imperfektion): gerade Stütze zeigt σ = N/A | klein |
| 8 | Mechanik | B | Reibungsfrei und ohne Gelenkkräfte: „klemmt“ bedeutet nur kinematische Totlage | mittel |
| 9 | Elektronik | B | Erwärmung: 1-W-LED ohne Wärmepfad, freie Luft statt Gehäuse, 85 °C als Grenze „für die Hand“ | klein |
| 10 | Licht | B | Grenzwert 20 000 cd/m² für die Schirmleuchtdichte greift praktisch nie | klein |
| 11 | Licht | B | Lampe ohne Körper: zurückfallendes Licht wird nicht absorbiert, η in engen Reflektoren zu hoch | mittel |
| 12 | Elektronik | B | Motor als ohmscher Widerstand; Spitzenströme (WLAN) fehlen; Powerbank-Abschaltung bei kleinem Strom fehlt | klein–mittel |
| 13 | Gefäß | B | Umstoßkraft ohne Rutschen; Schwappen mit mittlerer Tiefe und rein waagrechtem Gang | klein |
| 14 | alle | B | Keine Unsicherheitsbänder, obwohl `konzept.md` sie verlangt | mittel |

---

## 1 Statik (`last/`)

**Modell:** Gerader ebener Balken, FEM mit Hermite- bzw. Timoshenko-Elementen. Knoten an allen Unstetigkeiten, dadurch sind die Knotenwerte exakt. Lastfälle ständig / veränderlich / Stoß. Kriechen über kdef, Stoß über die Energiemethode, Knicken als Eigenwertproblem (K − λK_G), Verstärkung nach Theorie II. Ordnung mit α = 1/(1 − 1/λ), Eigenfrequenzen per Unterraum-Iteration. Numerisch sehr gut abgesichert (112 Tests, Invarianten an Zufallsbalken).

### Fehler und Risiken
- **A – Knicken nur in der Zeichenebene.** `section()` liefert nur I um die Biegeachse; `analyze()` nimmt dieses I auch für den Knick-Eigenwert. Ein Rechteck mit b < h knickt aber um die schwache Achse. Nachgerechnet mit C24, 1000 mm, gelenkig, 3 kN: b × h = 20 × 60 ergibt λ = 12,3 (passt), 60 × 20 ergibt λ = 1,44 (kritisch). Das ist derselbe Stab, nur gedreht. Betroffen ist jede stehende Stütze aus Rechteck, Rechteckrohr, I-, T- oder U-Profil. Rund- und Quadratquerschnitte sind nicht betroffen, die Vorlagen deshalb zufällig auch nicht.
- **A – Dauerlast und Werkstoff.** Die Zielsicherheit S ist je Material fest, Lastdauer zählt nicht. Nach EC5 (Tab. 3.1, NKl 1, γ_M = 1,3; prüfen) wäre bei ständiger Last f/σ ≥ γ_M/k_mod nötig: Vollholz und Sperrholz 1,3/0,6 ≈ 2,2 (Modul: 2,5, passt); **Spanplatte 1,3/0,3 ≈ 4,3 (Modul: 3)**; **MDF 1,3/0,2 ≈ 6,5 (Modul: 3)**. Ein dauerhaft belasteter MDF-Boden darf im Modul also etwa doppelt so hoch beansprucht werden wie nach Norm. Langzeitbruch (Kriechbruch) fehlt, obwohl die Kriechverformung gerechnet wird. Ähnlich, aber unsicherer belegt: Floatglas und PMMA unter Dauerlast (prüfen, z. B. DIN 18008 k_mod für ständige Last).
- **B – Keine Imperfektion.** Ein gerader Druckstab ohne Querlast zeigt σ = N/A und α·M = 0. Die Spannungsprüfung „sieht“ das Knicken also erst über die Schwelle λ < 3. Reale Stäbe haben eine Vorkrümmung; Normen setzen dafür Ersatzimperfektionen an, Größenordnung L/300 (prüfen je Werkstoff). Zwischen λ ≈ 3 und 6 ist die Biegespannung aus N·e₀·α nicht vernachlässigbar.
- **B – Kippen (Biegedrillknicken) wird nicht erkannt.** Es ist dokumentiert, löst aber kein Urteil aus. Hochkante Bretter und Zargen (z. B. 18 × 120, h/b ≈ 7) werden als „passt“ gemeldet.
- **B – Spanplatte E = 2500 N/mm²** steht unter der Quelle „EN 312 P2 ≈ Mindestwerte“. f = 11 N/mm² entspricht dem P2-Mindestwert; der E-Mindestwert für P2 (13–20 mm) liegt bei etwa 1600 N/mm² (prüfen). E ist also eher ein Mittelwert, f ein Mindestwert. Entweder die Quelle angleichen oder E senken; die Durchbiegung ändert sich um bis zu Faktor 1,5.
- **B – Schub im Holz ohne Rissbeiwert** (EC5 k_cr = 0,67): τ ist bis Faktor 1,5 zu günstig. Die Zielsicherheit fängt das teilweise auf.
- **C – Stoß:** Die Energiemethode setzt die ganze Körpermasse als starre Fallmasse an, mit Polster in Reihe. Das liegt auf der sicheren Seite (Sitzbank: n ≈ 3); ein echter Körper federt in Beinen und Rumpf. So benennen.
- **C – dokumentierte Grenzen:** Querdruck an Auflagern, Verbindungen, Ermüdung, Feuchte, schiefe Biegung. Fehlt in der Liste: geschweißtes Aluminium (Festigkeit in der Wärmeeinflusszone etwa halbiert, prüfen).

### Vorschläge
1. `section()` gibt zusätzlich `Iz` zurück (Bänder: Σ (y₁ − y₀)·w³/12; Kreis und Rohr: = I). Knicken (K_G-Eigenwert) mit EI_min rechnen oder als zweiten Eigenwert mit Iz, im Urteil das Minimum. Test: Rechteck b < h stehend, Euler-Fall 2 mit EIz.
2. Je Material `S` aufteilen in `Sp` (ständig) und `S` (kurz). Prüfung zweimal: σ aus Dauerlast gegen f/Sp, Gesamtspannung gegen f/S. Werte aus γ_M/k_mod ableiten und in `docs/last.md` belegen.
3. Ersatzimperfektion bei Längsdruck: Gleichlast q_e = 8·N·e₀/L² mit e₀ = L/300 im Lastfall „ständig“. Das kostet eine Zeile im Lastaufbau; Test gegen σ = N/A + N·e₀·α·e/I.
4. Kipp-Hinweis: Bei h/b > 4 und freier Länge über etwa 20·b „knapp: kann seitlich kippen“. Später M_cr nach der geschlossenen Formel für Rechteckquerschnitte.

---

## 2 Licht (`licht/`)

**Modell:** Vorwärts-Monte-Carlo, Punkt- oder Linienquelle, dünne Schalen (Kegelstümpfe bzw. Streifen) mit Anteilen ρd/ρs/τd/τs je Seite. Lichtstärke I(γ, C) im Fernfeld, E auf dem Tisch im Nahfeld (geometrisch korrekt), Leuchtdichte L = M/π je Segment und Seite, Abschirmwinkel geometrisch. Statistisch sauber (±σ, Abbruch erst bei ruhigem Ergebnis, `lost` wird gezählt) und umfangreich gegen Raumwinkel-Integrale getestet.

### Fehler und Risiken
- **A – Abschirmwinkel-Schwelle unabhängig von der Lampe.** Das Urteil prüft `sh < 15`. Laut der im Modul selbst zitierten Tabelle (EN 12464-1) gilt 15° nur für Lampen mit 20–50 kcd/m². Klare Glühfäden und LED-Punkte liegen weit über 500 kcd/m², dafür sind 30° verlangt. Die meisten heutigen Leuchtmittel sind LED-Filament oder klare Typen. Ein Schirm mit 20° Abschirmung heißt im Modul „passt“, nach Tabelle ist er knapp.
- **A – Gerichtete Anteile fehlen in der Leuchtdichte.** In `leave` landen nur ρd- und τd-Ereignisse. Spiegel (ρs) und Klarglas (τs) zeigen von außen das Bild der Lampe mit nahezu voller Lampenleuchtdichte. „Max. Leuchtdichte“ zeigt dort einen kleinen Wert oder nichts, das Blendurteil schlägt nicht an (Vorlagen Klarglas, Parabolreflektor, Arco-Reflektor).
- **B – 20 000 cd/m² als Blendgrenze für die Schirmleuchtdichte.** Das ist die *untere* Lampen-Leuchtdichtestufe der Tabelle, übertragen auf eine Streufläche. Grobe Rechnung: Opalkugel Ø 240 mm, 806 lm, τ ≈ 0,5: M ≈ 806·0,5/0,18 m² ≈ 2200 lm/m², also L ≈ 700 cd/m². Erst kleine, sehr helle Diffusoren erreichen 20 000. Bezugswerte aus derselben Norm für Leuchten im Blickfeld bei Bildschirmarbeit: 1500 bzw. 3000 cd/m² ab 65° (prüfen). Eine Stufe „knapp“ fehlt.
- **B – Lampe ohne Körper.** Licht, das der Schirm auf die Lampe zurückwirft, fliegt ungehindert durch. Reale Kolben und Fassungen absorbieren einen Teil davon. In engen Reflektoren (Parabol, Tiefstrahler, Golden Bell) ist η daher zu hoch, der Abschirmwinkel ist punktförmig, Schattenkanten sind hart.
- **B – Azimutale Mittelung.** In der Rotationsschale wird L über den ganzen Ring gemittelt. Bei Lampe neben der Achse verschmiert der Lichtfleck, L_max wird unterschätzt.
- **C – dokumentiert/vertretbar:** keine Raumreflexion (E im Raum real höher, sichere Seite) · Lambert-Quelle nur nach unten · Klarglas ohne Fresnel (τ bei streifendem Einfall zu hoch) · Papier und Stoff sind Schätzwerte · Langfeld ohne Endkappen, Abschirmwinkel nur quer.

### Vorschläge
1. Lampenauswahl um die Lampenleuchtdichte ergänzen (matt/opal etwa 10⁴–10⁵, klar/LED > 5·10⁵ cd/m²; Richtwerte, prüfen). Die Schwelle für den Abschirmwinkel daraus nach Tabelle ableiten (15/20/30°). Vorgabe ohne Angabe: 30°.
2. In `trace` einen Zähler für gerichtet austretendes Licht je Segment führen (ρs außen, τs). Ist er nicht null, im Urteil melden: „Lampe spiegelt sich bzw. ist durch das Glas sichtbar: Leuchtdichte ≈ Lampe × ρs bzw. τs“. Test: Klarglas-Zylinder gegen τs.
3. Stufen der Schirmleuchtdichte: knapp ab etwa 3000 cd/m², kritisch ab 20 000 cd/m²; im Realitätscheck kalibrieren.
4. Optional: Lampe als Kugel mit Radius r_L und Absorptionsgrad. Das ist im CORE ein zusätzlicher Kugelschnitt in `nearest` und verbessert η, Abschirmwinkel und Schatten zugleich.
5. Optional: Leuchtdichte im Rotationsfall in nC Sektoren zählen (wie bei `flux`).

---

## 3 Gefäß (`gefaess/`)

**Modell:** Exakte Rotations- bzw. Prismengeometrie in Schichten, Taschenmodell (getrennte Wasserkörper, Priority-Flood), quasistatisches Kippen mit mitlaufendem und auslaufendem Wasser, Schale dünnwandig (Pappus), kommunizierende Tülle. Schwappen als lineares Ein-Moden-Modell je Wasserkörper (Ersatzpendel, Grenzschichtdämpfung, Wehrformel für den Überlauf). Das ist das physikalisch reifste Modul; die Geometrie ist bis auf die Diskretisierung exakt und gegen geschlossene Lösungen getestet.

### Fehler und Risiken
- **B – Umstoßkraft ohne Rutschen.** F = m·g·a/h ist richtig fürs Kippen. Bei a/h > μ (breite Schale, flache Dose; μ Glas auf Holz etwa 0,3–0,5) rutscht das Gefäß aber vorher. Die Kennzahl gilt dann gar nicht, wirkt aber wie eine Kippgefahr.
- **B – Schwappfrequenz** mit mittlerer Tiefe h = V/A in tanh(kh). Exakt für zylindrische Wände; bei Kelch, Kegel und flacher Schale weicht die Eigenfrequenz ab. Das zählt nur bei kh ≲ 2, also bei flachen Gefäßen, und genau dort ist Schwappen relevant.
- **B – Gang als waagrechter Sinus** (10 mm, 1,8 Hz). Die Nickbewegung der Hand und der vertikale Anteil (parametrische Anregung) fehlen. Beide gelten in der Literatur zu „Kaffee beim Gehen“ als wesentlich (Mayer & Krechetnikov 2012). Die Dämpfung nur aus der Grenzschicht ist eher zu klein (sichere Seite).
- **C – dokumentiert/vertretbar:** Kippen quasistatisch (Standsicherheit, kein Anstoßen) · keine Oberflächenspannung (Nachtropfen, Menisken in engen Tüllen) · Wasser in der Tülle vernachlässigt · Deckel ohne Masse · Stiel beim Kelchglas nicht gerechnet · Standradius = Bodenplatte (konkaver Fußring real kleiner; manuell einstellbar).

### Vorschläge
1. Zur Umstoßkraft einen Satz: „rutscht eher, als dass es kippt“, wenn a/h > 0,4 (μ als Richtwert, prüfen).
2. Schwappen: Tiefe aus dem tatsächlichen Querschnittsverlauf unter dem Spiegel ableiten (z. B. eine Korrektur nach dem Rayleigh-Quotienten über die Tiefe) oder im Text auf zylindrische Wände begrenzen und bei stark konischen Seen ⚠ „Frequenz genähert“ zeigen.
3. Gang optional um Nicken ergänzen (Amplitude in Grad als Schätzwert). `sloshStep` kann θ(t) bereits verarbeiten, der Aufwand ist klein.

---

## 4 Elektronik (`elektronik/`)

**Modell:** Gleichstrom stationär, Knotenanalyse mit Newton und Rückfallwegen wie in SPICE (Quellenrampe, Gmin-Stufen). LED als Diode mit Bahnwiderstand, Glühlampe I ∝ U^0,6, Wandler über Energiebilanz, Transistoren als glatte Schaltermodelle, Erwärmung ΔT = P·R_th. Laufzeit = C / mittlerer Strom aus Betrieb und Ruhe.

### Fehler und Risiken
- **A/B – Laufzeit ohne Entladekurve.** Drei Effekte fehlen, und sie wirken alle in dieselbe Richtung (Laufzeit zu lang):
  1. *Abschaltspannung:* Die Quelle bleibt die ganze Laufzeit bei Nennspannung. Ein Uno an VIN braucht ≥ 7 V, ein 9-V-Block fällt deutlich vor seiner Nennkapazität darunter. **Nachgerechnet:** Das Modell meldet 11 h bei konstant 8,9 V; real dürfte es eher etwa die Hälfte sein (Schätzung, gegen Datenblatt prüfen). Ebenso: Boost-Wandler ziehen bei sinkender Zellspannung mehr Strom, LEDs mit Vorwiderstand werden dunkler.
  2. *Entladestrom:* C gilt „bei kleinem Strom“. Alkalizellen liefern bei 0,5–1 A nur einen Bruchteil davon (Größenordnung 40–60 %, prüfen), Li-Ionen- und NiMH-Zellen sind viel weniger empfindlich.
  3. *Selbstentladung:* Im Text erwähnt, aber nicht gerechnet. Bei NiMH und Laufzeiten von Monaten ist das der größte Posten.
- **A – MOSFET an 3,3 V.** Das Modell nimmt sig((Vgs − 2,0)/0,25) und R_on = 25 mΩ konstant. Bei 3,3 V gilt der IRLZ44N damit als voll durchgeschaltet, die Warnschwelle Vm + 4w = 3,0 V bleibt stumm. Das Datenblatt spezifiziert R_on erst ab 4 V (prüfen). „Logik-Pegel“ bedeutet hier 5-V-Logik. Mit ESP32 oder Pico ist das ein klassischer Fehler: Der MOSFET wird heiß, der Motor läuft schwach.
- **B – Erwärmung.**
  - Die 1-W-LED hat kein R_th; der häufigste Fehler im Leuchtendesign, Power-LED ohne Kühlfläche, wird nicht erkannt.
  - Gerechnet wird in freier Luft bei 25 °C, ohne Gehäuse.
  - „Über 85 °C zu heiß für Gehäuse und Hand“: Berührgrenzen (EN ISO 13732-1) liegen für Metall bei kurzer Berührung eher bei 50–60 °C (prüfen). Bauteilgrenze (Sperrschicht 125–150 °C) und Berührgrenze sind zwei verschiedene Kriterien.
- **B – Motor als Widerstand R = U_n/I_n.** Damit ist I ∝ U. Ein Gleichstrommotor unter festem Lastmoment zieht dagegen nahezu konstanten Strom; die Drehzahl folgt U − I·R_a. Bei Unter- oder Überspannung sind Strom und Laufzeit verzerrt, die Richtung der Drehzahl stimmt.
- **B – Spitzenströme fehlen.** ESP32 mit WLAN: Mittel 100 mA, Sendespitzen mehrere hundert mA (prüfen). An CR2032, AAA oder 9-V-Block bricht dann die Spannung ein (Brownout); das Modell sieht nur das Mittel. Der Motoranlauf ist dagegen schon abgedeckt.
- **B – Powerbank** schaltet bei kleinem Strom ab (typisch < 50–100 mA, prüfen). Schlafende Mikrocontroller laufen deshalb oft gar nicht an einer Powerbank.
- **C – vertretbar:** Ri konstant (steigt bei Entladung und Kälte) · LED ohne Temperaturgang · Kabel als ein Leiter (Hin- und Rückleiter selbst zeichnen; Vorlage macht es richtig) · Stromdichte-Grenzen 8/15 A/mm² sind grobe Richtwerte.

### Vorschläge
1. **Entladekurve je Zelltyp** als 5–8 Stützstellen U(Ladezustand) plus Kapazität bei zwei Strömen (Interpolation in log I). Laufzeit in etwa 10 Ladezustand-Stufen: je Stufe `solve()` mit U(SoC) und Ri(SoC), Strom integrieren, Abbruch, sobald ein Verbraucher seine Mindestspannung unterschreitet (Urteile schon vorhanden). Ergebnis: „hält 6 h, dann startet der Uno nicht mehr“. Test: konstanter Widerstand gegen das geschlossene Integral.
2. Selbstentladung als Zusatzstrom C·Rate/730 h je Zelltyp.
3. MOSFET: R_on(Vgs) aus 3 Stützstellen des Datenblatts; Warnung bei Vgs unter der kleinsten spezifizierten Gate-Spannung.
4. R_th für die 1-W-LED ohne Kühlfläche ergänzen; Gehäuse-Schalter (Umgebung +15–20 K, Richtwert); Kennwert „Berührtemperatur“ getrennt von „Bauteil überhitzt“, das koppelt an Roadmap-Punkt 3.
5. Motor als U = I·R_a + k·ω mit Lastmoment M₀ (bleibt algebraisch, Newton-tauglich). R_a = U_n/I_a ist schon vorhanden, k folgt aus dem Nennpunkt.
6. `Ipk` je Board und Brownout-Prüfung U_Quelle − Ipk·Ri < Vmin.

---

## 5 Mechanik (`mechanismus/`)

**Modell:** Ebene Gelenkgetriebe, Schließbedingungen mit Newton, zweigtreue Fortsetzung (Halbschritt-Kontrolle), Übersetzung aus der Geschwindigkeitsanalyse, Haltemoment über virtuelle Arbeit, Übertragungswinkel μ für Viergelenk und Schubkurbel. Kinematik exakt und geschlossen geprüft, Energiebilanz ∮M dθ = 0 getestet.

### Fehler und Risiken
- **B – „Klemmt“ ohne Reibung.** Das Modul erkennt kinematische Totlagen und nutzt μ < 20°/40° als Ersatzgröße. Reales Klemmen ist meist Selbsthemmung durch Reibung: Gelenkreibung bei kleinem μ, Verkanten in Führungen (Schubladeneffekt: Führungslänge zu Breite gegen Reibwert). Das wird nicht gerechnet. Für die Entwurfsfrage „Klemmt die Klappe?“ ist das die Hauptlücke.
- **B – Keine Gelenkkräfte.** Wie stark Bolzen, Scharnier und Gestell belastet sind, bleibt offen, obwohl die Jacobimatrix dafür schon vorliegt.
- **B – Haltemoment um Totlagen ausgeblendet** (±5 % des Bereichs). Beim Kniehebel liegt der Nutzen aber genau dort. Real begrenzen Elastizität und Spiel die Kraft; „→ ∞“ ist richtig als Grenzwert, praktisch aber nicht aussagekräftig.
- **C – vertretbar/dokumentiert:** Gliedmassen nur als Punktlasten von Hand · keine Federn (Roadmap 1) · keine Dynamik, kein Spiel, keine Elastizität, keine Kollision · μ nur für Getriebe mit vier Gliedern.

### Vorschläge
1. **Gelenkkräfte über Lagrange-Multiplikatoren:** Jᵀ·λ = −F_ext, mit J aus `evalF`. Damit sind die Abstandsgleichungen direkt die Stabkräfte. Aufwand ein Gleichungssystem je Lage; Test: Hebel und Kniehebel gegen Handrechnung.
2. Darauf **Reibung als Näherung:** Reibmoment je Gelenk μ_R·r_Bolzen·|F_Gelenk|, über virtuelle Arbeit zum Haltemoment addieren (je Bewegungsrichtung), dazu ein Klemmkriterium „Antriebsmoment mit Reibung → ∞ bzw. Vorzeichenwechsel“. Für Schubgelenke die Verkantbedingung mit Führungslänge. Das macht aus der Ersatzgröße μ eine echte Aussage.
3. Gliedmasse optional aus Länge × Profil × Dichte, Schwerpunkt in der Gliedmitte, als automatische Punktlast.

---

## 6 Übergreifend

1. **Unsicherheitsbänder fehlen (B).** `konzept.md` verlangt Bänder für unsichere Eingangswerte. Bisher zeigt nur Licht ±σ, und das ist Rauschen der Zufallsrechnung, keine Unsicherheit der Eingaben. Vorschlag: ein gemeinsamer Helfer in `shared/`, der eine Rechnung mit min/max der markierten Eingänge wiederholt (Holz E ±20 %, Papier τ ±?, Zellkapazität, Reibwert) und das Band im Kennwert zeigt. Das ist die Grundlage für Roadmap-Punkt 6 („Einfluss der Parameter“). Als Wunsch an shared eintragen.
2. **Gültigkeitswächter im Urteil (A).** Mehrere A-Befunde haben dieselbe Ursache: Der Fall liegt außerhalb des Modells, und das Urteil sagt trotzdem „passt“ (schwache Achse, Kippen hochkant, Spiegel/Klarglas, MOSFET unter spezifizierter Gate-Spannung). Regel vorschlagen: **Verlässt ein Fall den Gültigkeitsbereich, höchstens „knapp: Modell deckt X nicht ab“.** Je Modul eine kurze Liste solcher Prüfungen im Urteil.
3. **Schwellen mit Herkunft.** Jede Urteilsschwelle in `docs/<modul>.md` als Tabelle führen: Wert, Quelle (Norm, Literatur, Heuristik), Bezug (Lastdauer, Lampentyp …). Heute stehen Norm-Schwellen und Faustregeln (f₁ < 8 Hz, μ < 40°, Kippwinkel < 10°/15°, 85 °C) gleichrangig nebeneinander.
4. **Realitätscheck (Roadmap 7) vorziehen.** Die Tests beweisen die Mathematik, nicht das Modell. Günstige Messungen mit hoher Aussagekraft:
   - Statik: Durchbiegung eines Regalbretts mit Gewichten.
   - Licht: τ von Papier und Stoff mit dem Luxmeter; E unter einer Pendelleuchte.
   - Gefäß: Kippwinkel einer Flasche auf einer schiefen Ebene.
   - Elektronik: Laufzeit Uno an 9-V-Block.
   - Mechanik: Haltemoment eines Klappdeckels mit Federwaage.

## Empfohlene Reihenfolge
1. Kleine A-Korrekturen, je eine Sitzung im Modul-Branch mit Test: Statik schwache Achse (#1) und Dauerlast (#5), Licht Abschirmschwelle (#3) und gerichtete Leuchtdichte (#4), Elektronik MOSFET (#6).
2. Elektronik-Entladekurve (#2); sie betrifft die erste Entwurfsfrage des Moduls direkt.
3. Statik-Imperfektion (#7), Elektronik-Erwärmung (#9), Licht-Leuchtdichtestufen (#10).
4. Mechanik-Gelenkkräfte und Reibung (#8), zusammen mit dem Roadmap-Punkt Federn.
5. Übergreifend: Gültigkeitswächter, Schwellentabelle, Bänder als Wunsch an shared.

Für jede Korrektur gilt `CLAUDE.md` Regel 3: Änderung nur im CORE-Block, mit neuem analytischem Testfall, der gegen den alten Stand fehlschlägt.

---

## Umsetzung (22.11.2026)

Alle Befunde A und B wurden bearbeitet; jede Kernänderung hat neue analytische Tests. Je Modul steht das Detail in `docs/<modul>.md`.

| # | Befund | Stand |
|---|---|---|
| 1 | Statik: Knicken schwache Achse | umgesetzt: `Iz`/`ez` je Querschnitt, zweiter Knick-Eigenwert mit E·Iz, λ = min |
| 2 | Elektronik: Laufzeit | umgesetzt: Entladekurve, Kapazität nach Strom, Selbstentladung, Ende beim Ausfall eines Verbrauchers (Uno an 9-V-Block 8,8 → 3,9 h). Entladekurven sind Richtwerte und noch nicht gegen Messung geprüft |
| 3 | Licht: Abschirmschwelle | umgesetzt: Auswahl „Leuchtmittel“ → 15/20/30°, Vorgabe „klar“ (30°) |
| 4 | Licht: gerichtete Leuchtdichte | umgesetzt: Zähler „Bild der Lampe“ im CORE, Urteil knapp |
| 5 | Statik: Dauerlast | umgesetzt: `Sp` = γM/kmod (MDF 6,5, Spanplatte 4,3, Glas 7), Spannung aus ständiger Last |
| 6 | Elektronik: MOSFET 3,3 V | umgesetzt als Hinweis (`Vspec`). Der Leitwert unter Vspec bleibt modelliert wie bisher, weil es keine Datenblattwerte gibt |
| 7 | Statik: Imperfektion | umgesetzt: e₀ = L/300 als Zusatzspannung (sichere Seite) |
| 8 | Mechanik: Reibung/Gelenkkräfte | umgesetzt: Gelenkkräfte exakt (Lagrange); Reibung als Näherung 1. Ordnung. Offen: Selbsthemmung und Verkanten |
| 9 | Elektronik: Erwärmung | umgesetzt: LED-Rth, Schalter „im Gehäuse“, Berührgrenze 60 °C getrennt von 85 °C |
| 10 | Licht: Leuchtdichtegrenze | **korrigiert**: Die Audit-Aussage „20 000 greift praktisch nie“ war falsch. Weiß lackierte Reflektoren erreichen nahe der Lampe 5 000–19 000 cd/m² (Semi, Uplight). Die vorgeschlagene Stufe 3000 traf 8 von 20 Vorlagen; umgesetzt ist „hell“ ab 10 000 cd/m² (Heuristik, im Realitätscheck kalibrieren) |
| 11 | Licht: Lampenkörper | umgesetzt: Kugel/Röhre r = 15 mm, schluckt 30 % (Richtwerte) |
| 12 | Elektronik: Motor, Spitzen, Powerbank | umgesetzt (Motor mit festem Lastmoment, `Ipk`, `Imin`) |
| 13 | Gefäß: Rutschen, Schwappen | umgesetzt als Hinweise. **Zurückgestellt:** Nicken der Hand beim Gehen, weil eine gemessene Amplitude fehlt und der Wert sonst geraten wäre |
| 14 | Unsicherheitsbänder | Statik: Band der Durchbiegung aus der Streuung von E. Übrige Module: Schätzwerte sind gekennzeichnet; ein gemeinsamer Helfer lohnt sich erst mit Roadmap-Punkt 6 („Einfluss der Parameter“) |
| B (Statik) | Kippen, k_cr, Spanplatte E | umgesetzt (Hinweis, Rissbeiwert, Quelle klargestellt) |
| B (Licht) | Sektoren | umgesetzt (12 Sektoren bei Lampe neben der Achse) |

Übergreifend:
- Gültigkeitswächter und Schwellen mit Herkunft sind als Regel in `konzept.md` eingetragen.
- Jedes `docs/<modul>.md` hat jetzt eine Liste „Urteilsschwellen (Herkunft)“.
- Der Realitätscheck bleibt offen (Roadmap 7); er braucht Messungen.
