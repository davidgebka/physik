// Verifikation gegen analytische Fälle. Ausführen: node ergonomie/test.js
const Core = require('../tools/load-core')(__dirname);
const check = require('../tools/check');
const { BODY, cdf, quant, cdfQ, quantQ, ncdf, nq } = Core;
const F = { w: 1, shoe: 0 }, M = { w: 0, shoe: 0 }, MIX = { w: 0.5, shoe: 0 };

// Normalverteilung und Quantil
check('Φ(0)', ncdf(0), 0.5, 1e-7);
check('Φ(1,645) = 0,95', ncdf(1.6448536269514722), 0.95, 1e-6);
check('Φ(−1,96) = 0,025', ncdf(-1.959963985), 0.025, 1e-5);
check('Φ⁻¹(0,975) = 1,95996', nq(0.975), 1.959963985, 1e-7);
check('Φ⁻¹(0,001) = −3,0902', nq(0.001), -3.090232306, 1e-7);
for (const z of [-2.5, -0.7, 0.3, 1.9]) check(`Φ⁻¹(Φ(${z}))`, nq(ncdf(z)), z, 1e-5);

// Verteilung trifft die Tabellenwerte exakt, Schuhe verschieben nur Höhen über dem Boden
for (const id of ['stature', 'popl', 'mass']) for (const [sx, i, p] of [['f', 0, 0.05], ['f', 1, 0.5], ['m', 2, 0.95]])
  check(`${id} ${sx} P${p * 100}`, quantQ(BODY[id][sx], p), BODY[id][sx][i], 1e-6);
check('Schuh +25 auf Körperhöhe P50 ♀', quant('stature', { w: 1, shoe: 25 }, 0.5), 1625 + 25, 1e-9);
check('Schuh zählt nicht bei Sitzhöhe', quant('sitH', { w: 1, shoe: 25 }, 0.5), 860, 1e-9);
check('Typfigur Mann P95 Kniekehle + Schuh', Core.val('popl', 'm', 95, 25), 515, 1e-9);
// symmetrisch → Normalverteilung: μ ± σ enthält 68,27 %
{ const q = [100, 200, 300], s = 100 / 1.6448536269514722; check('symmetrisch: μ ± σ = 68,27 %', cdfQ(q, 200 + s) - cdfQ(q, 200 - s), 0.682689, 1e-5); }
// schief (Körpermasse): je Hälfte genau 50 %, P95 trotzdem exakt
check('Masse ♂ P50 halbiert', cdfQ(BODY.mass.m, 84), 0.5, 1e-7);
// Mischung: F(Quantil) = p, w = 1 entspricht Frauen, Median zwischen beiden
for (const p of [0.01, 0.05, 0.5, 0.95, 0.99]) check(`Mischung F(q(${p}))`, cdf('stature', MIX, quant('stature', MIX, p)), p, 1e-6);
check('Mischung Median zwischen ♀ und ♂', +(quant('stature', MIX, 0.5) > 1625 && quant('stature', MIX, 0.5) < 1750), 1);
check('Mischung = Mittel der Verteilungen', cdf('stature', MIX, 1700), (cdf('stature', F, 1700) + cdf('stature', M, 1700)) / 2, 1e-12);

// Datenplausibilität: P5 < P50 < P95, Rangfolgen der Höhen
let bad = 0;
for (const [id, d] of Object.entries(BODY)) for (const s of ['f', 'm']) if (!(d[s][0] < d[s][1] && d[s][1] < d[s][2])) { bad++; console.log('  Reihenfolge falsch:', id, s); }
for (const s of ['f', 'm']) for (const [a, b] of [['eye', 'stature'], ['shoulder', 'eye'], ['elbow', 'shoulder'], ['crotch', 'elbow'], ['stature', 'reach'],
  ['eyeS', 'sitH'], ['shoulderS', 'eyeS'], ['elbowS', 'shoulderS'], ['popl', 'kneeS'], ['bpl', 'bkl'], ['forearm', 'reachF']])
  for (let i = 0; i < 3; i++) if (!(BODY[a][s][i] < BODY[b][s][i])) { bad++; console.log('  Rangfolge falsch:', a, '<', b, s, i); }
// Proportion: Körperhöhe ≈ Sitzhöhe (Scheitel über Sitz) + Schritthöhe, je Perzentil auf ±40 mm
for (const s of ['f', 'm']) for (let i = 0; i < 3; i++) { const d = BODY.sitH[s][i] + BODY.crotch[s][i] - BODY.stature[s][i]; if (Math.abs(d) > 40) { bad++; console.log('  Proportion', s, i, d); } }
// Ankerwert KAN 2013: Sitzflächenhöhe P5 ♀ … P95 ♂ = 375 … 490 mm
check('Anker KAN P5 ♀ Kniekehle', BODY.popl.f[0], 375, 0); check('Anker KAN P95 ♂ Kniekehle', BODY.popl.m[2], 490, 0);
check('Daten plausibel', bad, 0);

// Sitzhöhe: Anteil = F(v/cos30) − F(v/cos5) (Parcells); v = P50 ♀ · cos 5° → genau die Hälfte zu klein
const SIT = { sh: [450, 450], fr: 0, sd: 420, sw: 460, arm: false, table: false, th: [740, 740], tu: 100 };
{ const v = 410 * Core.C5, r = Core.evalSit({ ...SIT, sh: [v, v] }, F).find(c => c.k === 'sh');
  check('Sitzhöhe: Kniekehle P50 → 50 % zu kurz', r.lo, 0.5, 1e-6);
  check('Sitzhöhe: Anteil analytisch', r.ok, cdfQ(BODY.popl.f, v / Core.C30) - cdfQ(BODY.popl.f, v / Core.C5), 1e-12);
  check('Sitzhöhe: ok + zu klein + zu groß = 1', r.ok + r.lo + r.hi, 1, 1e-12); }
// Fußstütze verschiebt das Kriterium genau um ihre Höhe
{ const a = Core.evalSit({ ...SIT, sh: [450, 450] }, MIX)[0], b = Core.evalSit({ ...SIT, sh: [750, 750], fr: 300 }, MIX)[0];
  check('Barhocker 750 mit Fußring 300 = Stuhl 450', b.ok, a.ok, 1e-12); }
// Verstellbereich aus der Empfehlung deckt genau P5–P95
{ const r0 = Core.evalSit(SIT, { w: 0.5, shoe: 25 })[0], [lo, hi] = r0.rec.range, r = Core.evalSit({ ...SIT, sh: [lo, hi] }, { w: 0.5, shoe: 25 })[0];
  check('Sitz verstellbar laut Empfehlung → 90 %', r.ok, 0.9, 1e-6);
  check('bester fester Sitz ≥ jeder Abtastwert', +[400, 420, 440, 460, 480].every(v => Core.evalSit({ ...SIT, sh: [v, v] }, { w: 0.5, shoe: 25 })[0].ok <= r0.rec.fixedOk + 1e-9), 1); }
// Sitztiefe: Band v/0,95 … v/0,80
{ const r = Core.evalSit(SIT, M).find(c => c.k === 'sd'); check('Sitztiefe analytisch', r.ok, 1 - cdfQ(BODY.bpl.m, 420 / 0.95), 1e-12); check('Sitztiefe: Empfehlung höchstens 0,95 × P5', r.rec.max, 0.95 * BODY.bpl.m[0], 1e-6); }
// Sitzbreite mit Armlehnen: Hüftbreite ≤ b/1,1; Empfehlung 1,1 × P95
{ const r = Core.evalSit({ ...SIT, arm: true, sw: 1.1 * BODY.hipS.f[2] }, F).find(c => c.k === 'sw');
  check('Sitzbreite = 1,1 × P95 ♀ → 95 %', r.ok, 0.95, 1e-6); check('Empfehlung Sitzbreite', r.rec.min, 1.1 * BODY.hipS.f[2], 1e-9); }

// Tisch, fester Sitz und fester Tisch: Integration = geschlossene Lösung
{ const P = { ...SIT, table: true, th: [730, 730], tu: 120 }, pop = { w: 0.5, shoe: 25 }, t = Core.tableEval(P, pop), d = 730 - 450;
  const want = 0.5 * (cdfQ(BODY.elbowS.f, d + 30) - cdfQ(BODY.elbowS.f, d - 70)) + 0.5 * (cdfQ(BODY.elbowS.m, d + 30) - cdfQ(BODY.elbowS.m, d - 70));
  check('Tisch fest: Anteil analytisch', t.tab.ok, want, 1e-12);
  const leg = 0.5 * cdfQ(BODY.thigh.f, d - 120 - 20) + 0.5 * cdfQ(BODY.thigh.m, d - 120 - 20);
  check('Beinfreiheit fest: Anteil analytisch', t.leg.ok, leg, 1e-12);
  check('Tisch: ok + zu hoch + zu niedrig = 1', t.tab.ok + t.tab.lo + t.tab.hi, 1, 1e-12); }
// verstellbarer Sitz mit Bereich der Breite 0 = fester Sitz; verstellbarer Tisch schlägt jeden festen
{ const P = { ...SIT, table: true, th: [740, 740] }, pop = { w: 0.5, shoe: 25 };
  check('Sitz [450, 450] = fest (Raster)', Core.tableEval({ ...P, sh: [450, 450.0000001] }, pop).tab.ok, Core.tableEval(P, pop).tab.ok, 1e-2);
  check('Bürostuhl am festen Tisch: Fußstütze 50 mm hilft', +(Core.tableEval({ ...P, sh: [400, 510], fr: 50 }, pop).tab.ok > Core.tableEval({ ...P, sh: [400, 510] }, pop).tab.ok + 0.05), 1);
  { const c = Core.choose({ ...P, sh: [400, 510] }, 435, 230); check('Einstellung: Füße stehen (≤ Kniekehle·cos 5°)', +(c.SH <= 435 * Core.C5 + 1e-9 && c.SH >= 435 * Core.C30 - 1e-9), 1); }
  const fixedBest = Math.max(...[700, 720, 740, 760, 780].map(v => Core.tableEval({ ...P, th: [v, v] }, pop).tab.ok));
  check('Tisch verstellbar 650–850 ≥ bester fester', +(Core.tableEval({ ...P, th: [650, 850] }, pop).tab.ok >= fixedBest), 1);
  check('Tisch verstellbar 600–900 fast alle', Core.tableEval({ ...P, th: [600, 900] }, pop).tab.ok, 1, 1e-3);
  const tr = Core.evalSit(P, pop).find(c => c.k === 'tab'), [a, b] = tr.rec.range;
  check('Tisch-Empfehlung verstellbar → ≥ 90 %', +(Core.tableEval({ ...P, th: [a, b] }, pop).tab.ok >= 0.9 - 1e-9), 1); }
// verstellbarer Sitz: Anteil Sitzhöhe = F(hi/cos30) − F(lo/cos5)
{ const r = Core.evalSit({ ...SIT, sh: [400, 510] }, MIX)[0];
  check('Sitz verstellbar analytisch', r.ok, cdf('popl', MIX, 510 / Core.C30) - cdf('popl', MIX, 400 / Core.C5), 1e-12); }

// Stehen: Arbeitshöhe nach Grandjean, Reichweite, Kopffreiheit
const ST = { wh: [900, 900], work: 'leicht', shelf: 1800, over: false, head: 2000 };
{ const pop = { w: 0.5, shoe: 25 }, r = Core.evalStand(ST, pop), ah = r.find(c => c.k === 'ah');
  check('Arbeitshöhe leicht analytisch', ah.ok, cdf('elbow', pop, 900 + 175) - cdf('elbow', pop, 900 + 75), 1e-12);
  const fe = Core.evalStand({ ...ST, work: 'fein', wh: [1100, 1100] }, pop)[0];
  check('Arbeitshöhe fein: Fläche über dem Ellenbogen', fe.ok, cdf('elbow', pop, 1100 - 25) - cdf('elbow', pop, 1100 - 125), 1e-12);
  check('Reichweite: Fach + 50 mm', r.find(c => c.k === 'reach').ok, 1 - cdf('reach', pop, 1850), 1e-12);
  check('Reichweite über Arbeitsplatte: 150 mm weniger', Core.evalStand({ ...ST, over: true }, pop).find(c => c.k === 'reach').ok, 1 - cdf('reach', pop, 2000), 1e-12);
  const hq = quant('stature', pop, 0.99);
  check('Kopffreiheit = P99 → 99 %', Core.evalStand({ ...ST, head: hq }, pop).find(c => c.k === 'head').ok, 0.99, 1e-9);
  check('Kopffreiheit Empfehlung = P99', r.find(c => c.k === 'head').rec.min, hq, 1e-9);
  check('Kopffreiheit 99 % → passt', Core.level('sicher', 0.99), 0); check('Kopffreiheit 97 % → knapp', Core.level('sicher', 0.97), 1);
  check('Komfort 60 % → knapp', Core.level('komfort', 0.6), 1); check('Komfort 30 % → kritisch', Core.level('komfort', 0.3), 2);
  check('Hinweis nie kritisch', Core.level('hinweis', 0), 1);
  const [lo, hi] = ah.rec.range; check('Arbeitshöhe verstellbar laut Empfehlung → 90 %', Core.evalStand({ ...ST, wh: [lo, hi] }, pop)[0].ok, 0.9, 1e-6); }

// ohne Arbeitsfläche nur Fach und Kopffreiheit
check('Stehen ohne Arbeitsfläche', Core.evalStand({ ...ST, wh: null }, { w: 0.5, shoe: 25 }).length, 3);

// Griffe: Optimum 19,7 % der Handlänge ± 5 mm, lichte Breite = Handbreite + 25 mm
{ const pop = { w: 0.5, shoe: 0 }, g = Core.gripDia(35, 35, pop);
  check('Griff Ø 35 analytisch', g.ok, cdf('handL', pop, 40 / 0.197) - cdf('handL', pop, 30 / 0.197), 1e-12);
  const [a, b] = g.rec.range; check('Griff-Bereich laut Empfehlung → 90 %', Core.gripDia(a, b, pop).ok, 0.9, 1e-6);
  { const d = 0.197 * 175, r = Core.gripDia(d, d, { w: 1, shoe: 0 }); check('Griff = Optimum P50 ♀ → zu dünn für die größere Hälfte', r.hi, 1 - cdfQ(BODY.handL.f, 175 + 5 / 0.197), 1e-12); check('Griff P50 ♀ symmetrisch um den Median', r.lo + r.ok / 2, 0.5, 2e-2); }
  check('Griffbreite 118 mm analytisch', Core.gripWidth(118, pop).ok, cdf('handB', pop, 93), 1e-12);
  check('Griffbreite Empfehlung = P95 + 25', Core.gripWidth(100, pop).rec.min, quant('handB', pop, 0.95) + 25, 1e-9); }

// Abgleich mit DIN EN ISO 14738:2005, Gestaltungsgrenzen europäische Bevölkerung (Tab. 1 in Çakir & Çakir 2006):
// unser P5 ♀ bzw. P95 ♂ höchstens 5 % daneben (Europa streut etwas weiter), Oberschenkel und Fuß genau
for (const [id, i, sx, iso, tol] of [['elbow', 0, 'f', 930, 0.05], ['elbow', 2, 'm', 1195, 0.05], ['crotch', 0, 'f', 665, 0.06], ['crotch', 2, 'm', 900, 0.05],
  ['sitH', 0, 'f', 790, 0.05], ['sitH', 2, 'm', 1000, 0.05], ['eyeS', 0, 'f', 680, 0.05], ['eyeS', 2, 'm', 870, 0.05], ['shoulderS', 0, 'f', 505, 0.05],
  ['thigh', 0, 'f', 125, 0], ['thigh', 2, 'm', 185, 0], ['bkl', 2, 'm', 687, 0.05], ['footL', 2, 'm', 285, 0], ['stature', 2, 'm', 1881, 0.05],
  ['popl', 0, 'f', 340, 0.12], ['popl', 2, 'm', 505, 0.05], ['hipS', 2, 'f', 440, 0], ['reachF', 0, 'f', 605, 0.06]])
  check(`ISO 14738 ${id} ${sx === 'f' ? 'P5 ♀' : 'P95 ♂'}`, BODY[id][sx][i], iso, tol);

// Modulor: Reihen aus 1130 · φⁿ und 2260 · φⁿ gegen die veröffentlichten Werte (Le Corbusier, auf ganze mm gerundet; 1829 ist 6 Fuß, 1130 · φ = 1828,4)
{ const M = Core.modulor(5, 2300), near = (a, v) => a.reduce((b, x) => Math.abs(x - v) < Math.abs(b - v) ? x : b);
  for (const v of [6, 9, 15, 24, 39, 63, 102, 165, 267, 432, 698, 1130, 1829]) check(`Modulor rot ${v}`, near(M.red, v), v, v === 1829 ? 1 / 1829 : 0.6 / v);
  for (const v of [11, 18, 30, 48, 78, 126, 204, 330, 534, 863, 1397, 2260]) check(`Modulor blau ${v}`, near(M.blue, v), v, 0.6 / v);
  check('blau = 2 × rot', near(M.blue, 863) / near(M.red, 432), 2, 1e-12); check('rot: Summe zweier Nachbarn = nächster', M.red[5] + M.red[6], M.red[7], 1e-9); }
