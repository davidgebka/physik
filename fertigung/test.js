// Verifikation gegen Norm- und analytische Fälle. Ausführen: node fertigung/test.js
const Core = require('../tools/load-core')(__dirname);
const check0 = require("../tools/check");
const check = (n, g, w, t) => check0(n, +g, +w, t); // Wahrheitswerte als 0/1
const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;

// DIN 6935: Korrekturfaktor k
check('k bei r/s = 1', Core.kDin(1, 1), 0.65);
check('k bei r/s ≥ 5', Core.kDin(10, 2), 1);
check('k stetig bei r/s = 5', near(0.65 + 0.5 * Math.log10(4.999), 1, 1e-3), true);
check('k steigt mit r/s', Core.kDin(1, 2) < Core.kDin(2, 2) && Core.kDin(2, 2) < Core.kDin(6, 2), true);

// Bogen der neutralen Faser: 90°, r/s ≥ 5 → Mittellinie π/2·(r + s/2)
check('Bogen 90° r=10 s=1', near(Core.arc(10, 1, 90), Math.PI / 2 * 10.5), true);
// Abwicklung L-Winkel 90°: a + b − 2(r+s) + π/2(r + k·s/2)  (DIN 6935, Ausgleichswert v)
{ const r = 2, s = 2, u = Core.unfold([30, 20], 90, r, s), k = 0.65;
  check('Zuschnitt L-Winkel 90°', near(u.L, 50 - 2 * (r + s) + Math.PI / 2 * (r + k * s / 2)), true);
  check('Ausgleichswert v = L − Σ Außenmaße', near(u.v, u.L - 50), true);
  check('K-Faktor = k/2', u.K, 0.325);
  check('gerade Stücke', near(u.straight[0], 30 - (r + s)) && near(u.straight[1], 20 - (r + s)), true); }
// U-Profil: zwei Biegungen, Mittelschenkel verliert an beiden Enden
{ const u = Core.unfold([20, 40, 20], 90, 1.5, 1.5);
  check('U-Profil Mittelschenkel', near(u.straight[1], 40 - 2 * 3), true);
  check('U-Profil Zuschnitt', near(u.L, 80 + 2 * u.v), true); }
// Winkel 0 → nichts gebogen: Zuschnitt = Summe der Außenmaße
check('Winkel 0', near(Core.unfold([30, 20], 0, 2, 2).L, 50), true);
// Rücksprung (gedachte Kante) bei 90°: r + s
check('Rücksprung 90°', near(Core.setback(2, 1, 90), 3), true);

// Regeln
check('Mindestradius Alu T6 2 mm', Core.rMin('alu-6061-t6', 2), 5);
check('Mindestschenkel r + 4s', Core.flangeMin(1.5, 1.5), 7.5);
check('Rückfederung wächst linear mit r/s', near(Core.springback('dc01', 4, 1, 90), 4 * Core.springback('dc01', 1, 1, 90)), true);
check('Rückfederung bei r ≤ s = Tabellenwert', Core.springback('edelstahl-1.4301', 0.5, 1, 90), 2.5);

// Gewinde: Kernloch DIN 336 = Normbohrer ≈ d − P (höchstens 0,06 mm daneben)
check('Kernloch M10', Core.coreCut(10), 8.5);
check('Kernloch M3', Core.coreCut(3), 2.5);
check('Kernloch M8 (Normbohrer)', Core.coreCut(8), 6.8);
for (const [d, P] of Core.THR) check(`Kernloch M${d} ≈ d − P`, near(Core.coreCut(d), d - P, 0.06), true);
// Gewindeformer (Werkzeughersteller-Tabellen, ±0,1 mm)
const form = { 3: 2.8, 4: 3.7, 5: 4.6, 6: 5.5, 8: 7.4, 10: 9.3 };
for (const [d, v] of Object.entries(form)) check(`Kernloch geformt M${d}`, near(Core.coreForm(+d), v, 0.1 + 1e-9), true);
check('Durchgangsloch M4 mittel (ISO 273)', Core.CLR[4][1], 4.5);
check('Durchgangslöcher geordnet', Object.values(Core.CLR).every(([f, m, g]) => f < m && m < g), true);
check('Durchgangsloch > Nenndurchmesser', Core.THR.every(([d]) => Core.CLR[d][0] > d), true);
check('Senkung für alle Gewinde', Core.THR.every(([d]) => Core.CSK[d] > 1.8 * d), true);

// Urteil Gewinde
check('M4 in 4 mm Stahl hält', Core.thrLevel('dc01', 4, 4), 0);
check('M4 in 4 mm Alu weich: knapp', Core.thrLevel('alu-5754-h111', 4, 4), 1);
check('M4 in 1 mm Stahl: kritisch (< 3 Gänge)', Core.thrLevel('dc01', 4, 1), 2);
check('Kunststoff höchstens knapp', Core.thrLevel('abs', 3, 20), 1);
{ const a = Core.alts('dc01', 4, 1); check('Einpressmutter in 1 mm Stahl M4', a.find(x => x.n === 'Einpressmutter').ok, true);
  check('keine Einschmelzmutter in Stahl', a.find(x => x.n === 'Einschmelzmutter').ok, false); }
check('Einschmelzmutter in ABS 5 mm M3', Core.alts('abs', 3, 5).find(x => x.n === 'Einschmelzmutter').ok, true);

// Daten
for (const [k, m] of Object.entries(Core.MAT)) {
  check(`Daten ${k}`, m.E > 0 && m.Rp > 0 && m.ein >= 1 && (m.kind === 'kunst' || (m.rmin > 0 && m.sb > 0)) && /^(metall|kunst)$/.test(m.kind), true);
}
