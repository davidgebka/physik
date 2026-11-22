// Verifikation gegen analytische Fälle. Ausführen: node material/test.js
const Core = require('../tools/load-core')(__dirname);
const check = require('../tools/check');
const { MAT, gm, effort, size, rank, contact, touch, bOf } = Core;

// Zwei Kunstmaterialien mit festen Werten: B ist doppelt so dicht und 8-mal so steif wie A
const one = v => [v, v];
const A = { k: 'A', rho: one(1000), E: one(1000), f: one(100), eur: one(2), co2: one(1) };
const B = { k: 'B', rho: one(2000), E: one(8000), f: one(400), eur: one(1), co2: one(4) };
const rel = (part, prop, by = 'mass') => effort(B, part, prop, by) / effort(A, part, prop, by);
// Masse gleich steif: Brett ρ/E^(1/3), Balken ρ/E^(1/2), Stab ρ/E
check('Brett steif: B gleich schwer', rel('brett', 'steif'), 2 / 2);
check('Balken steif: B ×1/√2', rel('balken', 'steif'), 2 / Math.sqrt(8));
check('Stab steif: B ×1/4', rel('stab', 'steif'), 2 / 8);
// Masse gleich fest: Brett ρ/f^(1/2), Balken ρ/f^(2/3), Stab ρ/f
check('Brett fest: B ×1', rel('brett', 'fest'), 2 / 2);
check('Balken fest: B ×2/4^(2/3)', rel('balken', 'fest'), 2 / Math.pow(4, 2 / 3));
check('Stab fest: B ×1/2', rel('stab', 'fest'), 2 / 4);
// Kosten und CO₂: Masse × €/kg bzw. × CO₂/kg
check('Brett steif, Kosten: B ×1/2', rel('brett', 'steif', 'eur'), 1 * 1 / 2);
check('Brett steif, CO₂: B ×4', rel('brett', 'steif', 'co2'), 1 * 4 / 1);
// Maß: Brett-Dicke ∝ E^(−1/3), Balken-Kante ∝ E^(−1/4), Stab-Durchmesser ∝ E^(−1/2); fest: f^(−1/2), f^(−1/3), f^(−1/2)
check('Brett-Dicke steif ×1/2', size(B, 'brett', 'steif') / size(A, 'brett', 'steif'), 0.5);
check('Balken-Kante steif ×8^(−1/4)', size(B, 'balken', 'steif') / size(A, 'balken', 'steif'), Math.pow(8, -0.25));
check('Stab-Durchmesser steif ×8^(−1/2)', size(B, 'stab', 'steif') / size(A, 'stab', 'steif'), Math.pow(8, -0.5));
check('Brett-Dicke fest ×1/2', size(B, 'brett', 'fest') / size(A, 'brett', 'fest'), 0.5);
check('Balken-Kante fest ×4^(−1/3)', size(B, 'balken', 'fest') / size(A, 'balken', 'fest'), Math.pow(4, -1 / 3));
// Rangliste: aufsteigend, Bezug = 1
const R = rank([A, B], 'stab', 'steif', 'mass', A);
check('Rangliste: bestes zuerst (B ×0,25)', R[0].rel, 0.25);
check('Rangliste: Bezug ×1', R[1].rel, 1);
// Geometrisches Mittel
check('Mittel der Spanne 100–400', gm([100, 400]), 200);

// Berührtemperatur T = (b1T1 + b2T2)/(b1 + b2)
check('gleiches b → Mitte', contact(1000, 33, 1000, 20), 26.5);
check('b → 0: Haut bleibt 33 °C', touch(1e-9), 33);
check('b → ∞: Teil bestimmt 20 °C', touch(1e12), 20, 1e-6);
check('b Stahl λ50 ρ7850 c470', bOf(50, 7850, 470), Math.sqrt(50 * 7850 * 470));

// Realitätscheck: Holz fühlt sich warm an, Metall kalt, Glas dazwischen
const by = k => MAT.find(m => m.k === k), T = k => touch(gm(by(k).b));
check('Fichte warm (> 28 °C)', +(T('fichte') > 28), 1);
check('Stahl kalt (< 24 °C)', +(T('s235') < 24), 1);
check('Aluminium kälter als Stahl', +(T('al6060') < T('s235')), 1);
check('Glas zwischen Holz und Stahl', +(T('glas') < T('fichte') && T('glas') > T('s235')), 1);
// Bekannte Ashby-Aussagen: Brett steif und leicht → Holz vor Metall; Stab auf Zug steif und leicht → Stahl ≈ Alu ≈ Holz
const r = (k, part, prop) => effort(by(k), part, prop, 'mass') / effort(by('fichte'), part, prop, 'mass');
check('Brett steif: Alu schwerer als Fichte', +(r('al6060', 'brett', 'steif') > 2), 1);
check('Brett steif: Stahl schwerer als Alu', +(r('s235', 'brett', 'steif') > r('al6060', 'brett', 'steif')), 1);
check('Stab steif: Stahl, Alu, Fichte ähnlich (Faktor < 1,5)', +(Math.max(r('s235', 'stab', 'steif'), r('al6060', 'stab', 'steif'), 1) / Math.min(r('s235', 'stab', 'steif'), r('al6060', 'stab', 'steif'), 1) < 1.5), 1);

// Daten: jede Spanne positiv und geordnet, plausible Grenzen, Quelle vorhanden, Schlüssel eindeutig
const LIM = { rho: [50, 25000], E: [0.1, 500000], f: [0.1, 3000], lam: [0.01, 500], c: [100, 5000], tmax: [20, 3000], eur: [0.05, 500], co2: [0.01, 100] };
let bad = 0;
for (const m of MAT) {
  for (const [p, [lo, hi]] of Object.entries(LIM)) { const v = m[p];
    if (!Array.isArray(v) || !(v[0] > 0) || v[0] > v[1] || v[0] < lo || v[1] > hi) { bad++; console.log('  Wert ' + m.k + '.' + p + ' ungültig: ' + v); } }
  if (!m.n || !m.fam || !m.src || !m.proc) { bad++; console.log('  Angaben fehlen: ' + m.k); }
}
check('Datensätze gültig', bad, 0);
check('Schlüssel eindeutig', new Set(MAT.map(m => m.k)).size, MAT.length);
