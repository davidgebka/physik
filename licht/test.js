// Verifikation Licht-Kern gegen analytische Fälle (claude/licht-grundlagen.md §9). Ausführen: node licht/test.js
// Monte Carlo: Toleranz 4σ aus der Photonenzahl. Bei Abweichung erst Seed/N prüfen, dann den Kern.
// T8 (Energiebilanz aus + abs + verl = N) läuft in run() bei jedem Fall mit.
const Core = require('../tools/load-core')(__dirname);
const check = require('../tools/check');
const D = Math.PI / 180, N = 200000, PHI = 1000;
const iso = { x: 0, z: 0, phi: PHI, type: 'iso' };
const mat = (rd, rs, td, ts) => ({ in: { rd, rs }, out: { rd, rs }, td, ts });
const black = mat(0, 0, 0, 0);
const run = o => { const r = Core.trace(Object.assign({ N, seed: 7 }, o)); check(o.name + ': Bilanz aus+abs+verl = N', r.out + r.abs + r.lost, N, 0); return r; };
// größte Abweichung über alle Bins in σ; frac(lo,hi) = erwarteter Flussanteil im γ-Band [rad]
function zmax(r, frac) {
  let z = 0;
  for (let c = 0; c < r.nC; c++) for (let g = 0; g < r.nG; g++) {
    const lo = Math.max(0, (g - 0.5) * r.dGamma) * D, hi = Math.min(180, (g + 0.5) * r.dGamma) * D;
    const e = N * frac(lo, hi) / r.nC, n = r.flux[c * r.nG + g];
    z = Math.max(z, e > 0 ? Math.abs(n - e) / Math.sqrt(e) : (n > 0 ? Infinity : 0));
  }
  return z;
}
const isoFrac = (lo, hi) => (Math.cos(lo) - Math.cos(hi)) / 2;
const sig = (p) => 4 * Math.sqrt(p * (1 - p) / N); // 4σ eines Anteils
// Maximum über ~37 Bins × ~15 Prüfungen: Schwelle nach Bonferroni 4,5σ statt 4σ (sonst ~5 % Fehlalarme je Lauf)
const ZMAX = 4.5;

// T1 ohne Schirm, isotrop: I = Φ/4π
let r = run({ name: 'T1', profile: [], source: iso, mat: black });
check('T1 η', r.eta, 1, 0);
check('T1 max. Abweichung LVK [σ]', zmax(r, isoFrac), 0, ZMAX);
// Normierung I = ΔΦ/ΔΩ: Σ I·ΔΩ = Φ·η exakt, und ein gut besetzter Bin (γ = 90°) gegen Φ/4π
const sumIOm = r => { let s = 0; for (let c = 0; c < r.nC; c++) for (let g = 0; g < r.nG; g++) s += r.I[c * r.nG + g] * 2 * Math.PI / r.nC * (Math.cos(Math.max(0, (g - 0.5) * r.dGamma) * D) - Math.cos(Math.min(180, (g + 0.5) * r.dGamma) * D)); return s; };
check('T1 Σ I·ΔΩ / (Φ·η)', sumIOm(r) / (PHI * r.eta), 1, 1e-9);
check('T1 I(90°)·4π/Φ', r.I[18] * 4 * Math.PI / PHI, 1, 4 / Math.sqrt(N * isoFrac(87.5 * D, 92.5 * D)));
// T1b C-Ebenen: Quelle außer Achse, 24 C-Ebenen, weiterhin isotrop.
// Viele kleine Bins → χ²-Test über die ganze Verteilung statt Maximum je Bin (das schlägt sonst zufällig an)
r = run({ name: 'T1b', profile: [], source: { ...iso, x: 30 }, mat: black, nC: 24, dGamma: 15 });
let chi = 0, k = 0;
for (let c = 0; c < 24; c++) for (let g = 0; g < r.nG; g++) {
  const e = N * isoFrac(Math.max(0, (g - 0.5) * 15) * D, Math.min(180, (g + 0.5) * 15) * D) / 24;
  chi += (r.flux[c * r.nG + g] - e) ** 2 / e; k++;
}
check('T1b χ²/Freiheitsgrad, 24 C-Ebenen', chi / (k - 1), 1, 4 * Math.sqrt(2 / (k - 1)));

// T2 Lambert nach unten: I(γ) = Φ/π·cos γ → Anteil im Band = sin²(hi) − sin²(lo), oben nichts
const lamFrac = (lo, hi) => lo >= Math.PI / 2 ? 0 : Math.sin(Math.min(hi, Math.PI / 2)) ** 2 - Math.sin(lo) ** 2;
r = run({ name: 'T2', profile: [], source: { ...iso, type: 'lambert' }, mat: black });
check('T2 max. Abweichung LVK [σ]', zmax(r, lamFrac), 0, ZMAX);
check('T2 Σ I·ΔΩ / Φ', sumIOm(r) / PHI, 1, 1e-9);

// T3 schwarzer Zylinder R50 h100, Quelle mittig: η = 1 − cos θc, θc = 45°; zwischen 47,5° und 132,5° kein Licht
const cyl = [[50, -50], [50, 50]], tc = Math.atan(2 * 50 / 100);
r = run({ name: 'T3', profile: cyl, source: iso, mat: black });
check('T3 η', r.eta, 1 - Math.cos(tc), sig(1 - Math.cos(tc)));
check('T3 max. Abweichung LVK mit harter Kante [σ]', zmax(r, (lo, hi) => isoFrac(Math.min(lo, tc), Math.min(hi, tc)) + isoFrac(Math.max(lo, Math.PI - tc), Math.max(hi, Math.PI - tc))), 0, ZMAX);
// T3b Seiten nicht vertauscht: innen schwarz, außen Spiegel → wie T3 (Quelle sieht nur die Innenseite)
r = run({ name: 'T3b', profile: cyl, source: iso, mat: { in: { rd: 0, rs: 0 }, out: { rd: 0, rs: 1 }, td: 0, ts: 0 } });
check('T3b η (Außenseite wirkungslos)', r.eta, 1 - Math.cos(tc), sig(1 - Math.cos(tc)));

// T4 Spiegelzylinder ρs = 1: z-Komponente bleibt erhalten → I = Φ/4π
r = run({ name: 'T4', profile: cyl, source: iso, mat: mat(0, 1, 0, 0) });
check('T4 max. Abweichung LVK [σ]', zmax(r, isoFrac), 0, ZMAX);
check('T4 verlorener Anteil (streifende Strahlen)', r.lost / N, 0, 1e-3);
// T4b innen Spiegel, außen schwarz → wie T4
r = run({ name: 'T4b', profile: cyl, source: iso, mat: { in: { rd: 0, rs: 1 }, out: { rd: 0, rs: 0 }, td: 0, ts: 0 } });
check('T4b max. Abweichung LVK [σ]', zmax(r, isoFrac), 0, ZMAX);
// T4c klar durchlässig τs = 1 → wie ohne Schirm
r = run({ name: 'T4c', profile: cyl, source: iso, mat: mat(0, 0, 0, 1) });
check('T4c η', r.eta, 1, 0);
check('T4c max. Abweichung LVK [σ]', zmax(r, isoFrac), 0, ZMAX);

// T5 Kugel R50 mit Öffnung oben (Halbwinkel 30°), ρd = 0,8: η = f / (1 − ρ(1 − f)).
// Prüft zugleich die Lambert-Abtastung um geneigte Normalen: Die Formel gilt nur bei Lambert-Reflexion.
const sphere = (R, tTop, n) => { const p = []; for (let i = 0; i <= n; i++) { const t = tTop * i / n; p.push([R * Math.sin(t), -R * Math.cos(t)]); } p[0][0] = 0; if (tTop === Math.PI) p[n][0] = 0; return p; };
const f = (1 - Math.cos(30 * D)) / 2, rho = 0.8, eta5 = f / (1 - rho * (1 - f));
r = run({ name: 'T5', profile: sphere(50, Math.PI - 30 * D, 120), source: iso, mat: mat(rho, 0, 0, 0) });
check('T5 η', r.eta, eta5, sig(eta5));

// T6 Opalkugel τd = 1, Quelle mittig: η = 1, I isotrop, L = Φ / (4π²R²)
r = run({ name: 'T6', profile: sphere(50, Math.PI, 120), source: iso, mat: mat(0, 0, 1, 0) });
check('T6 η', r.eta, 1, 0);
check('T6 max. Abweichung LVK [σ]', zmax(r, isoFrac), 0, ZMAX);
const Lw = PHI / (4 * Math.PI ** 2 * 0.05 ** 2);
check('T6 Leuchtdichte Äquatorsegment außen / Soll', r.L[2 * 60 + 1] / Lw, 1, 4 / Math.sqrt(r.leave[2 * 60 + 1]));
check('T6 Leuchtdichte innen (nichts reflektiert)', r.L[2 * 60], 0, 0);

// T7 Boden 1 m unter nackter Quelle: Ringmittel E = Φ(cos θi − cos θi+1) / (2·A_Ring)
r = run({ name: 'T7', profile: [], source: iso, mat: black, floor: { z: -1000, rMax: 2000, n: 20 } });
let z7 = 0, e0 = 0;
for (let i = 0; i < 20; i++) {
  const ci = 1000 / Math.hypot(1000, i * 100), cj = 1000 / Math.hypot(1000, (i + 1) * 100), e = N * (ci - cj) / 2;
  z7 = Math.max(z7, Math.abs(r.ring[i] - e) / Math.sqrt(e));
  if (!i) e0 = PHI * (ci - cj) / 2 / (Math.PI * 0.1 ** 2);
}
check('T7 max. Abweichung Ringe [σ]', z7, 0, ZMAX);
check('T7 E innerster Ring [lx]', r.E[0], e0, 4 / Math.sqrt(N * (1 - 1000 / Math.hypot(1000, 100)) / 2));

// T9 Kreisring als schwarze Scheibe R100 in 50 mm unter der Quelle: η = 1 − (1 − cos atan(2))/2, ab 63,4° nach unten nichts
const disc = [[0, -50], [100, -50]], td9 = Math.atan(2), eta9 = 1 - (1 - Math.cos(td9)) / 2;
r = run({ name: 'T9', profile: disc, source: iso, mat: black });
check('T9 η', r.eta, eta9, sig(eta9));
check('T9 max. Abweichung LVK [σ]', zmax(r, (lo, hi) => isoFrac(Math.max(lo, td9), Math.max(hi, td9))), 0, ZMAX);

// T10 Eingaben: falsche Werte scheitern laut, entartete Segmente erzeugen kein NaN
const throws = (name, o) => { let t = 0; try { Core.trace(Object.assign({ N: 10, profile: cyl, source: iso, mat: black }, o)); } catch (e) { t = 1; } check('T10 wirft: ' + name, t, 1, 0); };
throws('Materialsumme > 1', { mat: mat(0.8, 0, 0, 0.8) });
throws('negativer Anteil', { mat: mat(-0.1, 0, 0, 0) });
throws('dGamma teilt 180 nicht', { dGamma: 40 });
throws('r < 0', { profile: [[-1, 0], [50, 50]] });
throws('unbekannter Quelltyp', { source: { ...iso, type: 'spot' } });
throws('Material ohne Außenseite', { mat: { in: { rd: 0, rs: 0 }, td: 0, ts: 0 } });
r = run({ name: 'T10', profile: [[50, -50], [50, -50], [0, 0], [0, 50]], source: iso, mat: mat(0.5, 0, 0, 0) });
check('T10 kein NaN bei Länge-0- und Achsensegment', [...r.I, ...r.L].some(Number.isNaN) ? 1 : 0, 0, 0);

// T11 Spiegelscheibe R100 m in 50 mm unter der Quelle (prüft Spiegelung mit z-Normale; T4 hat nur radiale):
// nach unten bis θd = atan(2000) wird nach oben gespiegelt (γ → 180° − γ), nach oben also doppelt
const thd = Math.atan(2000);
r = run({ name: 'T11', profile: [[0, -50], [100000, -50]], source: iso, mat: mat(0, 1, 0, 0) });
check('T11 max. Abweichung LVK [σ]', zmax(r, (lo, hi) => isoFrac(Math.max(lo, thd), Math.max(hi, thd)) + Math.max(0, isoFrac(Math.max(0, Math.PI - hi), Math.min(thd, Math.PI - lo)))), 0, ZMAX);

// T12 C-Abhängigkeit: Quelle bei x = 30 über schwarzer Scheibe R100 in 50 mm Tiefe. Erwartung je (C,γ)-Bin
// per Mittelpunkt-Quadratur (40×40 je Bin): Strahl frei, wenn er nach oben geht oder die Scheibe verfehlt.
{
  const nC = 12, dG = 15, nG = 13, dCd = 360 / nC;
  r = run({ name: 'T12', profile: disc, source: { ...iso, x: 30 }, mat: black, nC, dGamma: dG });
  let chi = 0, k = 0, stray = 0;
  for (let c = 0; c < nC; c++) for (let g = 0; g < nG; g++) {
    const g0 = Math.max(0, (g - 0.5) * dG) * D, g1 = Math.min(180, (g + 0.5) * dG) * D, c0 = (c - 0.5) * dCd * D;
    let e = 0;
    for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) {
      const gm = g0 + (i + 0.5) / 40 * (g1 - g0), cm = c0 + (j + 0.5) / 40 * dCd * D;
      const free = gm >= Math.PI / 2 || Math.hypot(30 + 50 * Math.tan(gm) * Math.cos(cm), 50 * Math.tan(gm) * Math.sin(cm)) > 100;
      if (free) e += Math.sin(gm) * (g1 - g0) / 40 * dCd * D / 40;
    }
    e *= N / (4 * Math.PI);
    const n = r.flux[c * nG + g];
    if (e >= 5) { chi += (n - e) ** 2 / e; k++; } else if (e === 0) stray += n;
  }
  check('T12 χ²/Freiheitsgrad, C-abhängig', chi / (k - 1), 1, 4 * Math.sqrt(2 / (k - 1)));
  check('T12 Photonen in voll abgeschatteten Bins', stray, 0, 0);
}

// T13 Maßstabsinvarianz: Kugel aus T5 mit R = 0,5 mm und R = 5 m → gleiches η (fängt ε- und Skalenfehler)
for (const R of [0.5, 5000]) {
  r = run({ name: 'T13 R=' + R, profile: sphere(R, Math.PI - 30 * D, 120), source: iso, mat: mat(rho, 0, 0, 0) });
  check('T13 η bei R = ' + R + ' mm', r.eta, eta5, sig(eta5));
}

// T14 normalize(): reproduziert trace() exakt; aufsummierte Pakete (wie aus dem Worker) bleiben normiert
{
  const o = { profile: sphere(50, Math.PI - 30 * D, 120), source: iso, mat: mat(rho, 0, 0, 0), floor: { z: -300, rMax: 600, n: 12 } };
  const a = Core.trace({ ...o, N: 50000, seed: 1 }), b = Core.trace({ ...o, N: 50000, seed: 2 });
  const same = (u, v) => u.every((x, i) => x === v[i]) ? 1 : 0;
  const re = Core.normalize(a, o);
  check('T14 normalize(trace) = trace (I, L, E bitgleich)', same(re.I, a.I) * same(re.L, a.L) * same(re.E, a.E), 1, 0);
  const add = (u, v) => u.map((x, i) => x + v[i]);
  const m = Core.normalize({ N: a.N + b.N, out: a.out + b.out, abs: a.abs + b.abs, lost: a.lost + b.lost, flux: add(a.flux, b.flux), leave: add(a.leave, b.leave), ring: add(a.ring, b.ring) }, o);
  check('T14 Pakete summiert: Σ I·ΔΩ / (Φ·η)', sumIOm(m) / (PHI * m.eta), 1, 1e-9);
  check('T14 Pakete summiert: η', m.eta, eta5, sig(eta5) * Math.sqrt(N / 100000));
}

// T15 Abschirmwinkel (geometrisch): α = 90° − größtes sichtbares γ, ungünstigste C-Ebene
const sh = (profile, source) => Core.shield({ profile, source }).alpha;
check('T15 Zylinder R50 h100, Quelle mittig: 45°', sh(cyl, iso), 45, 1e-4);
check('T15 Quelle bei x = 30: 90° − atan(1,6) (C = 180°)', sh(cyl, { ...iso, x: 30 }), 90 - Math.atan(1.6) / D, 1e-4);
check('T15 geschlossene Opalkugel: 90° (nie sichtbar)', sh(sphere(50, Math.PI, 120), iso), 90, 0);
check('T15 ohne Schirm: 0°', sh([], iso), 0, 0);
check('T15 Scheibe unter der Quelle: 0° (seitlich sichtbar)', sh(disc, iso), 0, 0);
