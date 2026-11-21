// Verifikation Last-Kern gegen analytische Lösungen. Ausführen: node last/test.js
const Core = require('../tools/load-core')(__dirname);
const check = require('../tools/check');
const PI = Math.PI;
// Standardbalken: E = 10 000 N/mm², Rechteck 100 × 20 → I = 66 666,7 mm⁴, EI = 6,667e8 N·mm²
const E = 10000, sec = Core.section({ type: 'rect', b: 100, h: 20 }), EI = E * sec.I, L = 1000;
const base = o => Object.assign({ L, E, I: sec.I, A: sec.A, rhoA: 0, sec, sw: false, orient: 'h', N: 0, kdef: 0, sup: [], pl: [], ql: [], modes: false }, o);
const at = (r, arr, x) => { let b = 0; r.x.forEach((v, i) => { if (Math.abs(v - x) < Math.abs(r.x[b] - x)) b = i; }); return arr[b]; };
const wmin = r => Math.min(...r.wInst), Mmax = r => Math.max(...r.M), Mmin = r => Math.min(...r.M);
const pin = x => ({ x, t: 'pin' }), fix = x => ({ x, t: 'fix' });

// ---- Querschnitte ----
check('Rechteck 100×20: I = bh³/12', sec.I, 100 * 8000 / 12);
check('Rechteck: τ-Faktor S0/(I·b0) = 1,5/A', sec.S0 / (sec.I * sec.b0), 1.5 / sec.A);
const rhs = Core.section({ type: 'rhs', b: 40, h: 60, t: 3 });
check('Rechteckrohr 40×60×3: I', rhs.I, (40 * 60 ** 3 - 34 * 54 ** 3) / 12);
check('Rechteckrohr: A', rhs.A, 40 * 60 - 34 * 54);
const ci = Core.section({ type: 'circ', d: 30 });
check('Rundstab d30: I = πd⁴/64', ci.I, PI * 30 ** 4 / 64);
check('Rundstab: τmax = 4V/3A', ci.S0 / (ci.I * ci.b0), 4 / (3 * ci.A));
const tu = Core.section({ type: 'tube', d: 30, t: 2 });
check('Rundrohr 30×2: I', tu.I, PI * (30 ** 4 - 26 ** 4) / 64);
const ip = Core.section({ type: 'I', b: 100, h: 200, tw: 6, tf: 10 });
check('I 200×100×6×10: I', ip.I, (100 * 200 ** 3 - 94 * 180 ** 3) / 12);
check('I: S0 Gurt + halber Steg', ip.S0, 100 * 10 * 95 + 6 * 90 * 45);
check('U = I bei gleichen Maßen', Core.section({ type: 'U', b: 100, h: 200, tw: 6, tf: 10 }).I, ip.I);
// T 100×100×10×10 (Gurt oben): A = 1900, yc = (900·45 + 1000·95)/1900
const tp = Core.section({ type: 'T', b: 100, h: 100, tw: 10, tf: 10 }), yc = (900 * 45 + 1000 * 95) / 1900;
check('T: Schwerpunkt ab Unterkante', tp.yc, yc);
check('T: I (Steiner)', tp.I, 10 * 90 ** 3 / 12 + 900 * (45 - yc) ** 2 + 100 * 1000 / 12 + 1000 * (95 - yc) ** 2);
check('T: eT + eB = h', tp.eT + tp.eB, 100);
// umgedrehtes U 292×120, Bretter 21: Zargen 2 × 21 × 120 + Brett 250 × 21 dazwischen, I geschlossen über Steiner
const un = Core.section({ type: 'Un', b: 292, h: 120, t: 21 }), ycU = (2 * 21 * 120 * 60 + 250 * 21 * 109.5) / (2 * 21 * 120 + 250 * 21);
check('U umgedreht: A', un.A, 2 * 21 * 120 + 250 * 21);
check('U umgedreht: Schwerpunkt', un.yc, ycU);
check('U umgedreht: I (Steiner)', un.I, 2 * (21 * 120 ** 3 / 12 + 21 * 120 * (60 - ycU) ** 2) + 250 * 21 ** 3 / 12 + 250 * 21 * (109.5 - ycU) ** 2);
check('U umgedreht = T mit Steg 2t', un.I, Core.section({ type: 'T', b: 292, h: 120, tw: 42, tf: 21 }).I);
check('U umgedreht: Brett zu dick ungültig', Core.section({ type: 'Un', b: 40, h: 120, t: 21 }).err ? 1 : 0, 1, 0);
check('Ungültig: Wand zu dick', Core.section({ type: 'rhs', b: 20, h: 40, t: 10 }).err ? 1 : 0, 1, 0);

// ---- Statik ----
const F = 1000, q = 2; // N, N/mm
let r = Core.analyze(base({ sup: [pin(0), pin(L)], pl: [{ x: L / 2, F }] }));
check('Einfeldträger Einzellast mittig: w = FL³/48EI', -wmin(r), F * L ** 3 / (48 * EI));
check('… M = FL/4', Mmax(r), F * L / 4);
check('… Auflager A = F/2', r.R[0].F, F / 2);
check('… Querkraft links = F/2', r.V[0], F / 2);
r = Core.analyze(base({ sup: [pin(0), pin(L)], ql: [{ a: 0, b: L, q }] }));
check('Einfeldträger Gleichlast: w = 5qL⁴/384EI', -wmin(r), 5 * q * L ** 4 / (384 * EI));
check('… M = qL²/8', Mmax(r), q * L * L / 8);
check('… w bei L/4 (Biegelinie zwischen Knoten)', -at(r, r.wInst, 250), q * 250 * (L ** 3 - 2 * L * 250 ** 2 + 250 ** 3) / (24 * EI));
r = Core.analyze(base({ sup: [pin(0), pin(L)], pl: [{ x: 300, F }] }));
const b = 300; // kürzerer Abstand zum Auflager
check('Einzellast außermittig (a = 300): w max = Fb(L² − b²)^1,5/(9√3·L·EI)', -wmin(r), F * b * (L * L - b * b) ** 1.5 / (9 * Math.sqrt(3) * L * EI), 1e-5);
check('… M = F·a·b/L', Mmax(r), F * 300 * 700 / L);
r = Core.analyze(base({ sup: [fix(0)], pl: [{ x: L, F }] }));
check('Kragarm Endlast: w = FL³/3EI', -wmin(r), F * L ** 3 / (3 * EI));
check('… Einspannmoment = −FL', Mmin(r), -F * L);
check('… M am freien Ende = 0 (bezogen auf FL)', r.M[r.M.length - 1] / (F * L), 0, 1e-9);
r = Core.analyze(base({ sup: [fix(0)], ql: [{ a: 0, b: L, q }] }));
check('Kragarm Gleichlast: w = qL⁴/8EI', -wmin(r), q * L ** 4 / (8 * EI));
r = Core.analyze(base({ sup: [fix(0), fix(L)], ql: [{ a: 0, b: L, q }] }));
check('Beidseitig eingespannt: w = qL⁴/384EI', -wmin(r), q * L ** 4 / (384 * EI));
check('… Einspannmoment −qL²/12', Mmin(r), -q * L * L / 12);
check('… Feldmoment qL²/24', Mmax(r), q * L * L / 24);
r = Core.analyze(base({ sup: [fix(0), pin(L)], ql: [{ a: 0, b: L, q }] }));
check('Eingespannt–gelenkig: Auflager B = 3qL/8', r.R[1].F, 3 * q * L / 8);
check('… Einspannmoment −qL²/8', Mmin(r), -q * L * L / 8);
check('… w max = qL⁴/185EI', -wmin(r), q * L ** 4 / (184.6 * EI), 1e-3);
r = Core.analyze(base({ L: 2000, sup: [pin(0), pin(1000), pin(2000)], ql: [{ a: 0, b: 2000, q }] }));
check('Zweifeldträger: Mittelauflager 1,25 qL', r.R[1].F, 1.25 * q * L);
check('… Stützmoment −qL²/8', Mmin(r), -q * L * L / 8);
r = Core.analyze(base({ L: 1300, sup: [pin(0), pin(L)], pl: [{ x: 1300, F }] }));
check('Überstand a = 300, Endlast: w = Fa²(L+a)/3EI', -at(r, r.wInst, 1300), F * 300 ** 2 * 1300 / (3 * EI));
check('… Auflager A = −F·a/L (abhebend)', r.R[0].F, -F * 300 / L);
r = Core.analyze(base({ sup: [pin(0), pin(L)], ql: [{ a: 200, b: 500, q }] }));
check('Teil-Streckenlast: A = q·c·(L − m)/L', r.R[0].F, q * 300 * (L - 350) / L);
check('Teil-Streckenlast: M bei 800 = B·200', at(r, r.M, 800), (q * 300 - r.R[0].F) * 200);
// Gleichgewicht und Randbedingungen bei Zufallsbalken
let seed = 7, bad = 0, badM = 0; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let k = 0; k < 60; k++) {
  const Lr = 300 + 2000 * rnd(), sup = [{ x: Lr * rnd() * 0.4, t: rnd() < .3 ? 'fix' : 'pin' }, { x: Lr * (0.6 + 0.4 * rnd()), t: 'pin' }];
  if (rnd() < .5) sup.push({ x: Lr * rnd(), t: 'pin' });
  const pl = [{ x: Lr * rnd(), F: 1000 * rnd() }, { x: Lr * rnd(), F: -300 * rnd() }], ql = [{ a: Lr * rnd(), b: Lr * rnd(), q: 3 * rnd() }];
  const rr = Core.analyze(base({ L: Lr, sup, pl, ql, sw: true, rhoA: 1e-9 * 600 * sec.A }));
  const tot = pl.reduce((s, p) => s + p.F, 0) + Math.abs(ql[0].b - ql[0].a) * ql[0].q + 1e-9 * 600 * sec.A * 9810 * Lr;
  if (Math.abs(rr.R.reduce((s, x) => s + x.F, 0) - tot) > 1e-6 * tot) bad++;
  if (Math.abs(rr.M[rr.M.length - 1]) > 1e-6 * Math.max(...rr.M.map(Math.abs)) || Math.abs(rr.M[0]) > 1e-6 * Math.max(...rr.M.map(Math.abs))) badM++;
}
check('60 Zufallsbalken: Σ Auflager = Σ Lasten (Fehler)', bad, 0, 0);
check('60 Zufallsbalken: M = 0 an freien Enden (Fehler)', badM, 0, 0);
check('Ein Gelenklager: beweglich erkannt', Core.analyze(base({ sup: [pin(500)] })).err ? 1 : 0, 1, 0);
check('Zwei Lager an gleicher Stelle: beweglich', Core.analyze(base({ sup: [pin(500), pin(500)] })).err ? 1 : 0, 1, 0);
check('Kein Auflager: Fehler', Core.analyze(base({})).err ? 1 : 0, 1, 0);

// ---- Eigengewicht, Kriechen, Spannung, Durchbiegungsgrenze ----
const rhoA = 1e-12 * 500 * sec.A; // Holz 500 kg/m³
r = Core.analyze(base({ sup: [pin(0), pin(L)], sw: true, rhoA }));
check('Eigengewicht = Gleichlast ρ·A·g', -wmin(r), 5 * rhoA * 9810 * L ** 4 / (384 * EI));
check('Masse [kg]', r.mass, 500 * 100 * 20 * 1000 * 1e-9);
r = Core.analyze(base({ sup: [pin(0), pin(L)], kdef: 0.6, pl: [{ x: L / 2, F, perm: true }, { x: L / 2, F: 500 }] }));
check('Kriechen: w_fin = w_ständig·(1 + kdef) + w_veränderlich', -Math.min(...r.wFin), (F * 1.6 + 500) * L ** 3 / (48 * EI));
check('… Grenze: w_fin / Stützweite', r.lim.r, (F * 1.6 + 500) * L ** 3 / (48 * EI) / L);
check('… σ = M/W', r.max.sig.v, 1500 * L / 4 / (sec.I / 10));
r = Core.analyze(base({ sup: [fix(0)], pl: [{ x: L, F }] }));
check('Kragarm: Bezugslänge 2·L', r.lim.ref, 2 * L);
check('Schub Rechteck τ = 1,5 V/A', r.max.tau.v, 1.5 * F / sec.A);
const rT = Core.analyze(base({ I: tp.I, A: tp.A, sec: tp, sup: [pin(0), pin(L)], pl: [{ x: L / 2, F }] }));
check('T-Profil: σ unten = M·eB/I (Zug)', Math.max(...rT.sB), F * L / 4 * tp.eB / tp.I);
check('T-Profil: σ oben = −M·eT/I (Druck)', Math.min(...rT.sT), -F * L / 4 * tp.eT / tp.I);

// ---- Knicken (Euler) ----
const buck = (sup, k) => check('Knicken ' + k[0] + ': N_cr = ' + k[1] + '·π²EI/L²', Core.analyze(base({ sup, N: 100 })).lam * 100, k[2] * PI * PI * EI / (L * L), 1e-4);
buck([pin(0), pin(L)], ['gelenkig–gelenkig', '1', 1]);
buck([fix(0)], ['Kragstütze', '¼', 0.25]);
buck([fix(0), pin(L)], ['eingespannt–gelenkig', '2,046', 2.0457]);
buck([fix(0), fix(L)], ['eingespannt–eingespannt', '4', 4]);
r = Core.analyze(base({ sup: [pin(0), pin(L)], N: 0.25 * PI * PI * EI / (L * L), pl: [{ x: L / 2, F }] }));
check('II. Ordnung: α = 1/(1 − 1/λ) bei λ = 4', r.alpha, 4 / 3);
check('… w = α · FL³/48EI', -wmin(r), 4 / 3 * F * L ** 3 / (48 * EI), 1e-4);
check('… σ = N/A + α·M/W', r.max.sig.v, r.Nc[0] / sec.A + 4 / 3 * F * L / 4 / (sec.I / 10), 1e-4);
check('… V = α · F/2 (Querkraft mit verstärkt)', Math.abs(r.max.V.v), 4 / 3 * F / 2, 1e-4);
check('… τ = α · 1,5·(F/2)/A', r.max.tau.v, 4 / 3 * 1.5 * F / 2 / sec.A, 1e-4);
check('Über Knicklast: gemeldet', Core.analyze(base({ sup: [pin(0), pin(L)], N: 1.1 * PI * PI * EI / (L * L) })).buckled ? 1 : 0, 1, 0);
// Stehende Stütze, nur Eigengewicht: Kragstütze q·L³ = 7,837 EI (Greenhill)
r = Core.analyze(base({ orient: 'v', sw: true, rhoA, sup: [fix(0)] }));
check('Kragstütze unter Eigengewicht: λ·qL³ = 7,837 EI', r.lam * rhoA * 9810 * L ** 3, 7.837 * EI, 1e-3);

// Stehend, gelenkig–gelenkig, Eigengewicht + Zug oben (N < 0): Längskraft wechselt das Vorzeichen (Kg indefinit).
// Referenz unabhängig: Rayleigh-Ritz mit 24 Sinusgliedern (erfüllen die Randbedingungen, K diagonal), kleinstes positives λ.
{ const qg = rhoA * 9810, nT = 24, kappa = n => n * PI / L;
  for (const [Nt, tag] of [[-0.25 * qg * L, 'Zug oben ¼ qL'], [-0.6 * qg * L, 'Zug oben 0,6 qL (Zug überwiegt)']]) {
    const Kd = Array.from({ length: nT }, (_, i) => EI * kappa(i + 1) ** 4 * L / 2), C = new Float64Array(nT * nT), ns = 4000;
    for (let i = 0; i < nT; i++) for (let j = 0; j < nT; j++) { let s = 0; // ∫ N(x)·φi'·φj' dx, Simpson
      for (let k = 0; k <= ns; k++) { const x = L * k / ns, wgt = k === 0 || k === ns ? 1 : k % 2 ? 4 : 2;
        s += wgt * (Nt + qg * (L - x)) * kappa(i + 1) * Math.cos(kappa(i + 1) * x) * kappa(j + 1) * Math.cos(kappa(j + 1) * x); }
      C[i * nT + j] = s * L / ns / 3 / Math.sqrt(Kd[i] * Kd[j]); }
    const muMax = Math.max(...Core.jacobi(C, nT).d);
    r = Core.analyze(base({ orient: 'v', sw: true, rhoA, N: Nt, sup: [pin(0), pin(L)] }));
    check('Knicken stehend, ' + tag + ': λ gegen Ritz', r.lam, 1 / muMax, 2e-3); } }

// ---- Dynamik ----
const fq = (sup, bl) => Core.analyze(base({ sup, rhoA, modes: true }))
  .f.slice(0, bl.length).map((f, i) => [f, bl[i] ** 2 / (2 * PI * L * L) * Math.sqrt(EI / rhoA)]);
fq([pin(0), pin(L)], [PI, 2 * PI, 3 * PI]).forEach(([g, w], i) => check('Eigenfrequenz gelenkig f' + (i + 1), g, w, 1e-4));
fq([fix(0)], [1.875104, 4.694091, 7.854757]).forEach(([g, w], i) => check('Eigenfrequenz Kragarm f' + (i + 1), g, w, 1e-4));
fq([fix(0), fix(L)], [4.730041, 7.853205]).forEach(([g, w], i) => check('Eigenfrequenz eingespannt f' + (i + 1), g, w, 1e-4));
// Punktmasse (Dauerlast) mittig auf fast masselosem Balken: f = √(48EI/(mL³))/2π
const mP = 50 / 9810; // 50 N
r = Core.analyze(base({ sup: [pin(0), pin(L)], rhoA: 1e-9 * rhoA, modes: true, pl: [{ x: L / 2, F: 50, perm: true }] }));
check('Punktmasse mittig: f₁ = √(48EI/mL³)/2π', r.f[0], Math.sqrt(48 * EI / (mP * L ** 3)) / (2 * PI), 1e-5);
// Nach oben wirkende Dauerlast ist keine Masse: f₁ wie unbelastet
{ const fU = Core.analyze(base({ sup: [pin(0), pin(L)], rhoA, modes: true, ql: [{ a: 0, b: L, q: -0.5, perm: true }], pl: [{ x: L / 3, F: -200, perm: true }] })).f[0],
    fR = Core.analyze(base({ sup: [pin(0), pin(L)], rhoA, modes: true })).f[0];
  check('Dauerlast nach oben: f₁ wie unbelastet', fU, fR, 1e-6); }
// Kriechen entlastet (Dauerlast nach oben): Grenze gegen den ungünstigeren Zustand (sofort)
{ const qu = 0.3, rr = Core.analyze(base({ sup: [pin(0), pin(L)], kdef: 0.6, ql: [{ a: 0, b: L, q: -qu, perm: true }], pl: [{ x: L / 2, F }] }));
  check('Grenze l/x: sofort ungünstiger als Endzustand', rr.lim.r, (F * L ** 3 / (48 * EI) - 5 * qu * L ** 4 / (384 * EI)) / L); }
// Längsdruck senkt f: f(N)/f(0) = √(1 − N/N_cr) (gelenkig, Grundform)
const f0 = Core.analyze(base({ sup: [pin(0), pin(L)], rhoA, modes: true })).f[0];
const fN = Core.analyze(base({ sup: [pin(0), pin(L)], rhoA, modes: true, N: 0.5 * PI * PI * EI / (L * L) })).f[0];
check('Längsdruck halbe Knicklast: f/f₀ = √0,5', fN / f0, Math.sqrt(0.5), 1e-4);
// Stoß: fallende Last, Stoßfaktor n = 1 + √(1 + 2h/δ)
const dst = F * L ** 3 / (48 * EI);
r = Core.analyze(base({ sup: [pin(0), pin(L)], pl: [{ x: L / 2, F, h: 50 }] }));
check('Stoßfaktor n = 1 + √(1 + 2h/δ_st)', r.imp[0].n, 1 + Math.sqrt(1 + 100 / dst));
check('… w bei Stoß = n · δ_st', -Math.min(...r.wPeak), r.imp[0].n * dst);
check('… statische Durchbiegung unverändert', -wmin(r), dst);
check('… M bei Stoß = n · FL/4', Mmax(r), r.imp[0].n * F * L / 4);
// Jacobi: Eigenwerte einer 3×3-Matrix
const J = Core.jacobi([4, 1, 0, 1, 3, 1, 0, 1, 2], 3).d.sort((a, b) => a - b);
check('Jacobi 3×3 Spur', J[0] + J[1] + J[2], 9); check('Jacobi 3×3 kleinster Eigenwert', J[0], 3 - Math.sqrt(3));
// Netzunabhängigkeit: Knoten an Lastpunkten → Knotenwerte exakt, auch bei Last nahe am Auflager
r = Core.analyze(base({ sup: [pin(0), pin(L)], pl: [{ x: 1, F }] }));
check('Last 1 mm neben Auflager: A = F·999/1000', r.R[0].F, F * 0.999);
// Polster in Reihe: δ_st = δ_Balken + c
r = Core.analyze(base({ sup: [pin(0), pin(L)], pl: [{ x: L / 2, F, h: 50, c: 20 }] }));
check('Stoß mit Polster: n = 1 + √(1 + 2h/(δ_st + c))', r.imp[0].n, 1 + Math.sqrt(1 + 100 / (dst + 20)));
check('… Balkendurchbiegung beim Stoß = n · δ_st (ohne Polster)', -Math.min(...r.wPeak), r.imp[0].n * dst);
// ---- Runde 1: Invarianten an Zufallsbalken (auch statisch unbestimmt) ----
// EI·w'' = M im Elementinneren (zweite Differenz), w = 0 an jedem Lager; Einzellager bei jeder Länge beweglich
{ let s2 = 11, worst = 0, wsup = 0, n = 0, single = 0; const rr = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 200; k++) {
    const Lr = 300 + 3000 * rr(), ns = 1 + Math.floor(rr() * 4), sup = [];
    for (let i = 0; i < ns; i++) sup.push({ x: Math.round(Lr * rr()), t: rr() < .3 ? 'fix' : 'pin' });
    const pl = Array.from({ length: Math.floor(rr() * 4) }, () => ({ x: Lr * rr(), F: 2000 * (rr() - .3), perm: rr() < .5 }));
    const ql = Array.from({ length: Math.floor(rr() * 3) }, () => ({ a: Lr * rr(), b: Lr * rr(), q: 3 * (rr() - .2), perm: rr() < .5 }));
    const res = Core.analyze(base({ L: Lr, sup, pl, ql, sw: rr() < .5, rhoA }));
    const movable = new Set(sup.map(s => s.x)).size < 2 && !sup.some(s => s.t === 'fix');
    if (movable) { if (!res.err) single++; continue; }
    if (res.err) { single++; continue; } n++;
    const Mm = Math.max(1e-9, ...res.M.map(Math.abs)), wm = Math.max(1e-12, ...res.wInst.map(Math.abs));
    for (let i = 0; i + 6 < res.x.length; i += 7) for (let j = 2; j <= 4; j++) {
      const h = res.x[i + j + 1] - res.x[i + j], w2 = (res.wInst[i + j + 1] - 2 * res.wInst[i + j] + res.wInst[i + j - 1]) / (h * h);
      worst = Math.max(worst, Math.abs(EI * w2 - res.M[i + j]) / Mm); }
    for (const s of res.sup) wsup = Math.max(wsup, Math.abs(res.wInst[res.x.findIndex(x => Math.abs(x - s.x) < 1e-9 * Lr)]) / wm);
  }
  check(`${n} Zufallsbalken: max |EI·w'' − M| / max |M|`, worst, 0, 1e-3);
  check('… w an den Lagern / max w', wsup, 0, 1e-9);
  check('… Beweglichkeit richtig erkannt (Fehler)', single, 0, 0); }
r = Core.analyze(base({ L: 413, sup: [pin(367)], pl: [{ x: 164, F: 26 }] }));
check('Ein Gelenklager, L = 413 (vorher als stabil gerechnet)', r.err ? 1 : 0, 1, 0);
r = Core.analyze(base({ sup: [pin(0), pin(L)], pl: [{ x: L, F, h: 50 }] }));
check('Stoß über dem Lager ohne Polster: als starr gemeldet', r.imp[0].rigid ? 1 : 0, 1, 0);
// ---- Runde 3: Schubverformung (Timoshenko) und federnde Lager ----
{ const G = 500, As = sec.As, GA = G * As; // weiches Holz quer, kurzer Balken L = 200, h = 20
  check('Schubfläche Rechteck = 5/6·A', As, 5 / 6 * sec.A);
  const Ls = 200, sh = o => Core.analyze(base(Object.assign({ L: Ls, G }, o)));
  r = sh({ sup: [pin(0), pin(Ls)], pl: [{ x: Ls / 2, F }] });
  check('Timoshenko Einzellast mittig: w = FL³/48EI + FL/4GAs', -wmin(r), F * Ls ** 3 / (48 * EI) + F * Ls / (4 * GA));
  check('… M unverändert FL/4', Mmax(r), F * Ls / 4);
  r = sh({ sup: [pin(0), pin(Ls)], ql: [{ a: 0, b: Ls, q }] });
  check('Timoshenko Gleichlast: w = 5qL⁴/384EI + qL²/8GAs', -wmin(r), 5 * q * Ls ** 4 / (384 * EI) + q * Ls * Ls / (8 * GA));
  check('… w bei L/4 zwischen Knoten', -at(r, r.wInst, 50), q * 50 * (Ls ** 3 - 2 * Ls * 2500 + 125000) / (24 * EI) + q * 50 * 150 / (2 * GA));
  r = sh({ sup: [fix(0)], pl: [{ x: Ls, F }] });
  check('Timoshenko Kragarm: w = FL³/3EI + FL/GAs', -wmin(r), F * Ls ** 3 / (3 * EI) + F * Ls / GA);
  // statisch unbestimmt: eingespannt–gelenkig, Einzellast am Ende des Kragteils? → Kraft am gelenkigen Lager bei Gleichlast
  // B = 3qL/8 · (1 + 4φ/3)/(1 + φ)… über Arbeitssatz: δ_B(q) = δ_B(B) → B = q·L·(L³/8EI + L/2GA)/(L³/3EI + L/GA)
  r = sh({ sup: [fix(0), pin(Ls)], ql: [{ a: 0, b: Ls, q }] });
  check('Timoshenko eingespannt–gelenkig: Auflager B (Arbeitssatz)', r.R[1].F, q * Ls * (Ls ** 3 / (8 * EI) + Ls / (2 * GA)) / (Ls ** 3 / (3 * EI) + Ls / GA));
  const fE = Core.analyze(base({ L: Ls, sup: [pin(0), pin(Ls)], rhoA, modes: true })).f, fT = Core.analyze(base({ L: Ls, G, sup: [pin(0), pin(Ls)], rhoA, modes: true })).f;
  [0, 1].forEach(i => check(`Timoshenko Eigenfrequenz f${i + 1}: f_EB/√(1 + (nπ/L)²·EI/GAs)`, fT[i], fE[i] / Math.sqrt(1 + ((i + 1) * PI / Ls) ** 2 * EI / GA), 2e-3));
  check('Ohne G: Euler-Bernoulli unverändert', -wmin(Core.analyze(base({ sup: [pin(0), pin(L)], pl: [{ x: L / 2, F }] }))), F * L ** 3 / (48 * EI)); }
{ const k = 50; // N/mm
  r = Core.analyze(base({ sup: [{ x: 0, t: 'spring', k }, { x: L, t: 'spring', k }], pl: [{ x: L / 2, F }] }));
  check('Federlager beidseitig: w = FL³/48EI + F/2k', -wmin(r), F * L ** 3 / (48 * EI) + F / (2 * k));
  check('… Federkraft = F/2', r.R[0].F, F / 2);
  r = Core.analyze(base({ sup: [pin(0), pin(L), { x: L / 2, t: 'spring', k }], pl: [{ x: L / 2, F }] }));
  check('Feder in Feldmitte: Federkraft = F·k/(k + 48EI/L³)', r.R.find(x => x.t === 'spring').F, F * k / (k + 48 * EI / L ** 3));
  check('Eine Feder allein: beweglich', Core.analyze(base({ sup: [{ x: 500, t: 'spring', k }] })).err ? 1 : 0, 1, 0);
  check('Feder ohne Steifigkeit trägt nicht', Core.analyze(base({ sup: [pin(0), { x: L, t: 'spring', k: 0 }] })).err ? 1 : 0, 1, 0);
  const mm = 2 / 9810; r = Core.analyze(base({ sup: [fix(0), { x: L, t: 'spring', k }], rhoA: 1e-9 * rhoA, modes: true, pl: [{ x: L, F: 2, perm: true }] }));
  check('Masse auf Kragarm mit Feder: f = √((3EI/L³ + k)/m)/2π', r.f[0], Math.sqrt((3 * EI / L ** 3 + k) / mm) / (2 * PI), 1e-5); }
{ const Ls = 200, G = 500, PE = PI * PI * EI / (Ls * Ls), GA = G * sec.As;
  check('Knicken mit Schub ≈ Engesser N_E/(1 + N_E/GAs) (N_E/GAs = 0,2)', Core.analyze(base({ L: Ls, G, N: 100, sup: [pin(0), pin(Ls)] })).lam * 100, PE / (1 + PE / GA), 1e-2); }
