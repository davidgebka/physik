# Licht / Lampenschirm – Rechengrundlage (Key `licht`)

Stand 19.11.2026. Grundlage für den CORE-Block des Moduls. Alle Testformeln in §9 wurden mit einem Wegwerf-Prototyp (Node, 200 000 Photonen) gegengeprüft. §12 ordnet den Ansatz in den Stand der Technik ein.

## 1 Designfragen → Größen

| Frage | Größe | Einheit |
|---|---|---|
| Wie viel Licht verlässt die Leuchte? | Leuchtenbetriebswirkungsgrad η = Φ_aus / Φ_Quelle | – |
| Wohin geht es? | Lichtstärkeverteilung (LVK) I(C, γ) | cd, cd/klm |
| Direkt / indirekt? | Anteil unten (γ < 90°) / oben | % |
| Wie hell wird Tisch/Boden/Wand? | Beleuchtungsstärke E | lx |
| Wie sieht der Schirm aus? | Leuchtdichte L je Schirmsegment, innen/außen | cd/m² |
| Blendet es? | Abschirmwinkel; mittlere Leuchtdichte in Blickrichtung | °, cd/m² |

## 2 Modellwahl

**Profil wird 2D gezeichnet, gerechnet wird in 3D.** Das Profil r(z) wird um die Achse rotiert; Strahlen laufen im Raum. 2D-Strahlverfolgung in der Profilebene wäre falsch (Abfall ∝ 1/r statt 1/r², Strahlen außerhalb der Meridianebene fehlen) und spart kaum Rechenzeit: Der 3D-Schnitt Strahl–Kegelstumpf ist eine quadratische Gleichung.

**Verfahren: nichtsequentielle Vorwärts-Monte-Carlo-Photonenverfolgung mit Flussakkumulation** – dasselbe Prinzip wie TracePro, LightTools, Photopia (§12).

| Alternative | Urteil |
|---|---|
| Radiosity / Formfaktoren | nur diffus, keine Spiegel → nein |
| Sequentielles Raytracing (Linsendesign) | feste Flächenfolge, für Leuchten ungeeignet → nein |
| Analytische Reflektorformeln | nur Sonderfälle → dienen als Tests |
| Rendering (Pfadverfolgung vom Auge, ggf. differenzierbar) | liefert Bilder, keine Energiebilanz; Größenordnung GPU-Stunden → nicht nötig |
| **Monte Carlo vorwärts** | beliebige Mischungen diffus/spiegelnd/transluzent, Energie per Konstruktion erhalten, Fehler ∝ 1/√n vorhersagbar, ~150 Zeilen Kern |

## 3 Geometrie

- Profil: Polylinie (r_i, z_i), r ≥ 0, z nach oben, Maß mm. Offen oben und unten (Architekturentscheidung).
- Jedes Segment ist ein Kegelstumpf; Sonderfälle Zylinder (Δr = 0) und Kreisring (Δz = 0, Ebenenschnitt).
- Schnitt Strahl p + t·d mit Segment (r = r₁ + k(z − z₁), k = Δr/Δz):
  a₀ = r₁ + k(p_z − z₁), a₁ = k·d_z
  A = d_x² + d_y² − a₁², B = 2(p_x d_x + p_y d_y − a₀a₁), C = p_x² + p_y² − a₀²
  Kleinste Wurzel t > ε mit z ∈ [z_min, z_max] und a₀ + a₁t ≥ 0.
- Normale: ∇(x² + y² − r(z)²) ∝ (x, y, −r·k), normiert. Vorzeichen von n·d unterscheidet Innen- und Außenseite.
- Dünne Schale ohne Wandstärke. Bei ≤ 200 Segmenten genügt Brute Force über alle Segmente (so auch eulumdat-rt).

## 4 Lichtquelle

- Lichtstrom Φ in lm, Position (x, z) in der Meridianebene (y = 0), frei verschiebbar.
- Symmetrie folgt daraus: Quelle auf der Achse → rotationssymmetrisch; außerhalb → spiegelsymmetrisch zur Ebene C0–C180.
- v1-Typen: **Punkt isotrop** (klare Lampe, Filament); **Punkt Lambert, gerichtet** (LED-Modul, I = Φ/π · cos θ).
- v2: Kugelquelle (Opalbirne, Radius R) – wichtig für weiche Schattenkanten und Blendung; L = Φ / (4π²R²). Quelle aus LVK-Tabelle (LDT des Leuchtmittels, Abtastung über tabellierte Verteilungsfunktion γ → C).
- Quellleuchtdichte L_Q für die Blendbewertung bei Punktquellen: Eingabe; Presets erst nach Beleg.

## 5 Material

Ideale Mischung je Seite, als Wahrscheinlichkeiten pro Auftreffen:

| Anteil | Verhalten | messbar als |
|---|---|---|
| ρ_d | diffuse Reflexion (Lambert, kosinusgewichtet) | diffus-only-Reflexionsgrad |
| ρ_s | Spiegelreflexion d' = d − 2(d·n)n | gerichtet-hemisphärisch minus diffus-only |
| τ_d | diffuse Transmission (Lambert auf der Rückseite) | τ normal-diffus |
| τ_s | gerade Transmission (ohne Versatz) | τ normal-normal |
| α = 1 − Σ | Absorption, Photon endet | Rest |

- Diese Zerlegung entspricht der üblichen Messpraxis (Radiance BRTDfunc: Diffusanteil = diffus-only-Messung, Spiegelanteil = gerichtet-hemisphärisch minus diffus-only; Textil-Sonnenschutz: τ normal-normal / normal-diffus). Materialwerte lassen sich also aus Datenblättern oder einer einfachen Messung übernehmen.
- Analoge Auswahl (ein Zufallswert wählt das Ereignis, Gewicht bleibt 1): unverzerrt, einfach, Energiebilanz exakt. Die analoge Auswahl ersetzt Russisches Roulette.
- ρ darf je Seite verschieden sein (innen weiß, außen dunkel); τ beidseitig gleich.
- v2 (nur falls Bedarf): Halbglanz/Streukeule per Henyey-Greenstein (Parameter g), Fresnel nach Schlick für Klarmaterialien.
- Material-Presets: Werte vor der Umsetzung mit Quellen belegen und in der UI als Richtwerte kennzeichnen.

## 6 Auswertung (Tallies)

**a) LVK.** Entweichende Photonen nach Richtung (C, γ) einsortieren; γ = acos(−d_z), also 0° nach unten (Nadir, wie in EULUMDAT).
I = ΔΦ / ΔΩ mit ΔΩ = ΔC_rad · (cos γ₁ − cos γ₂). Die Raumwinkel-Normierung ist Pflicht und gehört in den CORE (nicht in die Anzeige).
Bins um die Stützwinkel zentriert (γ-Bin [γ − Δ/2, γ + Δ/2], an den Polen Halbbins), damit sie direkt als LDT-Stützwerte taugen. Bei Spiegelsymmetrie y → −y falten (doppelte Statistik).

**b) Kennzahlen.** η, Anteil unten/oben, absorbierter Anteil je Fläche.

**c) Beleuchtungsstärke.** Primär: entweichende Photonen direkt mit Ebenen schneiden (Boden, Tisch, Wand), E = ΔΦ / ΔA in Ring- bzw. Rasterzellen. Das ist auch im Nahfeld richtig – wichtig bei Tisch- und Pendelleuchten mit großem Schirm. Raum schwarz (keine Raumreflexion).
Kontrolle/glatte Kurve: Fernfeld E = I · cos ε / d². Gültig ab etwa dem 5-Fachen der größten leuchtenden Abmessung (≈ 1 % Fehler für eine leuchtende Scheibe; Ryer, *Light Measurement Handbook*, Kap. 6). Bei Tischleuchten wurden durch Missachten dieser Regel Abweichungen bis 32 % gemessen (JIES 1984) → Ebenen-Tally ist die Referenz.

**d) Leuchtdichte des Schirms.** Je Segment und Seite den diffus austretenden Fluss zählen: M = ΔΦ / A_seg, L = M / π. Exakt für Lambert-Anteile. Die Darstellung ist ein eingefärbtes Profil, keine Bildsynthese. Spiegelnde/klare Pfade sind Quellabbilder → gehen in die Blendung (e).

**e) Blendung.**
- *Abschirmwinkel* (EN 12464-1: Winkel zwischen Horizontale und Blickrichtung, unter der leuchtende Lampenteile gerade sichtbar werden). Photonen tragen ein Flag „Quelle sichtbar“ (Pfad nur aus ρ_s/τ_s-Ereignissen). Abschirmwinkel = 90° − größtes γ solcher Photonen (je C-Ebene).
- Vergleich mit den Mindestabschirmwinkeln nach Lampenleuchtdichte: < 20 kcd/m² keine; 20–50 kcd/m² 15°; 50–500 kcd/m² 20°; ≥ 500 kcd/m² 30°.
- *Mittlere Leuchtdichte in Blickrichtung*: L(γ) = I(γ) / A_proj(γ), A_proj numerisch aus der Silhouette (Schirm + Öffnung).
- UGR braucht Raum und Leuchtenanordnung (CIE 117) → nicht im Modul; dafür liefert der LDT-Export die Daten für DIALux/Relux.

## 7 Genauigkeit und Aufwand

- **Energie** exakt: Jedes Photon wird absorbiert, entweicht oder – nach Erreichen der Höchstzahl an Stößen – als **„verloren“ gezählt und ausgewiesen**, nie stillschweigend verworfen (sonst Bias). Φ_aus + Φ_abs + Φ_verl = Φ; Φ_verl > 0,1 % → Warnung (z. B. ρ ≈ 1 in fast geschlossenem Schirm).
- **Statistik:** σ_rel ≈ 1/√n_Bin. Engpass sind die Polkappen: Ein 0–5°-Bin enthält bei isotroper Abstrahlung nur (1 − cos 5°)/2 ≈ 0,19 % der Photonen → für 3 % dort ≈ 600 000 Photonen. Ziel v1: progressiv bis ≈ 1 Mio. Photonen, die Anzeige zeigt ±σ. Für Isym 2 (Quelle außer Achse) gröbere C-Raster oder mehr Photonen.
- **Laufzeit gemessen** (Prototyp, 60 Segmente, unoptimiert mit Array-Allokationen): ≈ 0,7 s je 200 000 Photonen in Node ≈ 300 000 Photonen/s. Mit Float64Array und ohne Allokationen sollte ≥ 1 Mio./s erreichbar sein (Ziel, noch nicht gemessen).
- **Ablauf:** in Häppchen per requestAnimationFrame auf dem Haupt-Thread. Web Worker aus Dateien sind unter file:// blockiert (Konvention verlangt file://); Blob-Worker nur, falls nötig und geprüft. WebGPU erst, wenn CPU nachweislich nicht reicht (Konvention „WebGL/WebGPU nur, wo nötig“).
- **Reproduzierbar:** seedbarer RNG (mulberry32), Tests deterministisch.

## 8 Modell & Gültigkeit (Entwurf für die UI)

Gilt für: dünne, rotationssymmetrische Schirme; Punktquellen; ideale Mischungen aus diffus/spiegelnd/transluzent; photometrisch (eine Wellenlänge, lm); Umgebung schwarz.
Nicht erfasst: Wandstärke und Brechung, Fresnel-Effekte, Halbglanz (v1), Volumenstreuung, Farbe/Spektrum, Wärme, Raumreflexionen, UGR.
Unsicherheit: statistisch ±σ (angezeigt); Materialwerte sind Richtwerte und meist die größte Fehlerquelle (bestätigt durch die Literatur, §12).

## 9 Testfälle für test.js (analytisch, mit Prototyp geprüft)

| # | Fall | Erwartung | Prototyp (200 k) |
|---|---|---|---|
| T1 | ohne Schirm, isotrop | I = Φ/4π, η = 1 | – |
| T2 | ohne Schirm, Lambert nach unten | I(γ) = Φ/π · cos γ | – |
| T3 | schwarzer Zylinder R, Höhe h, Quelle mittig | η = 1 − cos θ_c, θ_c = atan(2R/h); harte Kante der LVK bei θ_c | 0,2926 / 0,2929 |
| T4 | Spiegelzylinder ρ_s = 1, Quelle auf Achse | I(γ) = Φ/4π (z-Komponente bleibt bei jeder Reflexion erhalten) | 0,971 … 1,021 |
| T5 | Kugel mit Öffnung (Flächenanteil f), ρ_d, Quelle mittig | η = f / (1 − ρ(1 − f)) | 0,2633 / 0,2642 (σ ≈ 0,001) |
| T6 | Opalkugel τ_d = 1, Quelle mittig | η = 1, I isotrop, L = Φ / (4π²R²) | I 0,985 … 1,029 |
| T7 | Boden in Höhe h unter nackter Quelle | E(r) = Φ/(4π) · h / (h² + r²)^{3/2} | – |
| T8 | jeder Fall | Φ_aus + Φ_abs + Φ_verl = Φ (exakt) | ✓ |

Toleranz: 4σ aus der Photonenzahl des jeweiligen Bins. Hinweis: Die Opalkugel mit außermittiger Quelle ist *nicht* isotrop (nähere Wand heller, im Prototyp 0,72 … 1,26) – nur als Plausibilitätstest verwenden.
Bezug zur Norm: CIE 171:2006 ist der übliche Validierungskatalog für Lichtsoftware (Punktquelle direkt, Interreflexion u. a.); T7 entspricht dem Punktquellen-Prinzip dort, T5 dem Interreflexions-Prinzip. CIE 171 enthält bekannte Fehler ohne offizielle Errata → bei Übernahme konkreter Referenzwerte die Fehlerliste (Ashdown) prüfen.

## 10 Export LDT (v2)

EULUMDAT (ASCII), I in cd/klm. Isym 1 bei Quelle auf der Achse, sonst 2 (Symmetrie zur Ebene C0–C180). Raster z. B. 24 C-Ebenen à 15°, γ 0–180° in 5°-Schritten. Feldreihenfolge bei der Umsetzung gegen die Spezifikation (Paul Bourke / DIAL / AGi32) prüfen.

## 11 Reihenfolge

- **v1:** Profil-Editor; Quelle isotrop/Lambert; Material ρ_d, ρ_s, τ_d, τ_s je Seite; LVK-Polardiagramm; η und Anteil unten/oben; E-Kurve Boden; Schirmleuchtdichte; Abschirmwinkel; Tests T1–T8.
- **v2:** LDT-Export, Kugelquelle, Quelle aus LVK-Tabelle, Wand- und Tischebene, belegte Material-Presets; bei Bedarf Henyey-Greenstein-Keule und Schlick-Fresnel.

## 12 Stand der Technik (Recherche 19.11.2026)

| Kategorie | Beispiele | Verfahren | Bezug zu uns |
|---|---|---|---|
| Professionelle Leuchtenentwicklung | TracePro, LightTools, Photopia, LucidShape | nichtsequentielles Monte-Carlo-Raytracing, Flussakkumulation, BSDF-Streumodelle; Ausgabe LVK, E, Wirkungsgrad, LDT/IES | gleiches Prinzip, wir reduzieren auf Rotationsschalen + ideale Materialien |
| Open-Source-Photometrie | eulumdat-rt (Rust/wgpu) | MC-Photonenverfolgung auf GPU; Rechteckflächen, Brute Force; Lambert/Spiegel als Überlebenswahrscheinlichkeit; dünne transluzente Platte mit Schlick-Fresnel + Henyey-Greenstein; Quellen isotrop/Lambert/aus LVK-Tabelle; C/γ-Detektor | nahezu identische Architektur → bestätigt Ansatz. Zwei Schwächen dort vermeiden: Photonen beim Bounce-Limit werden still verworfen (Bias); Raumwinkel-Normierung nicht im Kern |
| Browser-Optik (Lehre) | Ray Optics Simulation (ricktu288), Reflecta | 2D-Strahlenzeichnen, Reflexion/Brechung; keine Photometrie | nur UI-Inspiration; 2D-Rechnung für Lichtmengen ungeeignet (§2) |
| Browser-Rendering | WebGPU-/WebGL-Pfadtracer, Light Tracer | Bildsynthese vom Auge aus, progressiv | anderes Ziel (Bild statt Energiebilanz) |
| Forschung Lampenschirm | „Computational Design of Free-Form Lampshades“ (arXiv 2610.05770) | differenzierbares Rendering (Mitsuba 3), 3D-gedruckter PC-Schirm mit kalibrierter Volumenstreuung (HG g ≈ 0,48), Optimierung von Kavität und Lichtpositionen auf Zielbild | Obergrenze an Aufwand (≈ 10 h auf H100 je Lauf); bestätigt: größter Fehler liegt in Materialkalibrierung, nicht im Verfahren |
| Validierung | CIE 171:2006 (DIALux, Relux, Radiance validiert) | analytische und gemessene Referenzfälle, je ein Aspekt der Lichtausbreitung | Vorbild für test.js |
| Planerische Software | DIALux, Relux | Raumberechnung aus LDT/IES, UGR | Abnehmer unseres LDT-Exports |
| Plain-JS-Werkzeug | open-optical-designer | Vanilla JS, ohne Build, läuft von file://, Tests im Browser | gleiche Philosophie wie Designphysik (allerdings Linsendesign, sequentiell) |

Fazit: Kein browserbasiertes Werkzeug verbindet Formentwurf eines Lampenschirms mit Photometrie. Das Verfahren selbst ist Standard und bewährt; die Lücke ist die niederschwellige Kombination – genau das Ziel des Moduls.
