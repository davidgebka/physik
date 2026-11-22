// Verifikation Mechanismen-Kern gegen analytische Fälle. Ausführen: node mechanismus/test.js
const Core = require('../tools/load-core')(__dirname);
const check = require('../tools/check');
const D = Math.PI / 180, ok = b => (b ? 1 : 0);
const wrap = x => ((x % 360) + 540) % 360 - 180; // auf ±180

// Viergelenk A0=(0,0), A, B, B0=(d,0) in Lage θ0, Zweig σ; Antrieb Glied 0, Abtrieb Glied 2
const fb = (a, b, c, d, th0, sig = 1) => {
  const r = Core.fourbarClosed(a, b, c, d, th0 * D, sig);
  return { pts: [{ x: 0, y: 0, fix: 1 }, { x: r.A[0], y: r.A[1] }, { x: r.B[0], y: r.B[1] }, { x: d, y: 0, fix: 1 }],
    links: [[0, 1], [1, 2], [2, 3]], drive: { link: 0 }, out: { link: 2 } };
};
const B = X => [X[4], X[5]], side = (X, d) => Math.sign((d - X[2]) * (X[5] - X[3]) - (0 - X[3]) * (X[4] - X[2]));

// 1 Grashof-Klassen (a, b Koppel, c, d Gestell)
check('Grashof Kurbelschwinge 40/120/80/100', ok(Core.grashof(40, 120, 80, 100) === 'Kurbelschwinge'), 1, 0);
check('Grashof Doppelkurbel 80/120/100/40', ok(Core.grashof(80, 120, 100, 40) === 'Doppelkurbel'), 1, 0);
check('Grashof Doppelschwinge 80/40/100/120', ok(Core.grashof(80, 40, 100, 120) === 'Doppelschwinge (Grashof)'), 1, 0);
check('Nicht-Grashof 80/60/70/100', ok(Core.grashof(80, 60, 70, 100) === 'Doppelschwinge (Nicht-Grashof)'), 1, 0);
check('Durchschlag-Grenzfall 60/90/70/100', ok(Core.grashof(60, 90, 70, 100) === 'Grenzfall (Durchschlag)'), 1, 0);
const tKS = Core.analyze(fb(40, 120, 80, 100, 0));
check('Topologie erkannt: Viergelenk, Kurbelschwinge', ok(tKS.T && tKS.T.kind === '4' && tKS.info.type === 'Kurbelschwinge'), 1, 0);

// 2 Viergelenk Newton = geschlossene Lösung über 360°
let e2 = 0; for (const s of tKS.smp) { const r = Core.fourbarClosed(40, 120, 80, 100, s.v * D, 1); e2 = Math.max(e2, Math.hypot(B(s.X)[0] - r.B[0], B(s.X)[1] - r.B[1])); }
check('Kurbelschwinge umlauffähig (360° ohne Blockade)', ok(tKS.full && tKS.smp.length === 361), 1, 0);
check('Viergelenk max. Abweichung Newton–geschlossen [mm] ≤ 1e-6', e2, 0, 1e-6);

// 3 Schubkurbel r40 l120 e0: Kolbenweg und Umkehrlagen (Totpunkte) bei 0° und 180°
const sk = (r, l, e, th0) => ({ pts: [{ x: 0, y: e, fix: 1 }, { x: r * Math.cos(th0 * D), y: r * Math.sin(th0 * D) }, { x: Core.sliderClosed(r, l, e, th0 * D), y: e }],
  links: [[0, 1], [1, 2]], slider: { p: 2, a: 0, ang: 0 }, drive: { link: 0 }, out: { slider: true } });
// Hinweis: Führung durch A0 auf Höhe e → Kurbel liegt im Modell bei y=e, Kolbenweg relativ zur Führung
const tSK = Core.analyze(sk(40, 120, 0, 30));
let e3 = 0; for (const s of tSK.smp) e3 = Math.max(e3, Math.abs(s.out - Core.sliderClosed(40, 120, 0, s.v * D)));
check('Schubkurbel Kolbenweg max. Abweichung [mm]', e3, 0, 1e-6);
const rv = tSK.rev.map(r => wrap(r.v)).sort((a, b) => a - b);
check('Schubkurbel: 2 Umkehrlagen', rv.length, 2, 0);
check('Umkehrlage bei 0° [°]', rv.find(v => Math.abs(v) < 90), 0, 1e-2);
check('Umkehrlage bei 180° [°]', Math.abs(rv.find(v => Math.abs(v) > 90)), 180, 1e-4);
check('Umkehrlagen = Streck-/Decklage', ok(tSK.rev.every(r => r.kind !== 'Umkehrlage')), 1, 0);
// Schubkurbel mit Versatz: Kolbenweg analytisch (Führung y=e, Kurbel um (0,0))
const ske = { pts: [{ x: 0, y: 0, fix: 1 }, { x: 40 * Math.cos(30 * D), y: 40 * Math.sin(30 * D) }, { x: Core.sliderClosed(40, 120, 15, 30 * D), y: 15 }, { x: 0, y: 15, fix: 1 }],
  links: [[0, 1], [1, 2]], slider: { p: 2, a: 3, ang: 0 }, drive: { link: 0 }, out: { slider: true } };
const tSE = Core.analyze(ske); let e3b = 0; for (const s of tSE.smp) e3b = Math.max(e3b, Math.abs(s.out - Core.sliderClosed(40, 120, 15, s.v * D)));
check('Schubkurbel e=15 Kolbenweg max. Abweichung [mm]', e3b, 0, 1e-6);
check('Schubkurbel e=15 Typ umlauffähig', ok(tSE.T && tSE.info.type === 'Schubkurbel (umlauffähig)'), 1, 0);

// 4 Übertragungswinkel = Kosinussatz, Extrema bei θ = 0° und 180°
let e4 = 0, mn = { mu: 1e9 }, mx = { mu: -1e9 };
for (const s of tKS.smp) { e4 = Math.max(e4, Math.abs(s.mu - Core.transFourbar(40, 120, 80, 100, s.v * D))); if (s.mu < mn.mu) mn = s; if (s.mu > mx.mu) mx = s; }
check('μ max. Abweichung zur Kosinussatz-Formel [°]', e4, 0, 1e-6);
check('μ_min bei θ = 0° [°]', wrap(mn.v), 0, 0);
check('μ_max bei θ = 180° [°]', Math.abs(wrap(mx.v)), 180, 0);
check('μ_min Wert [°]', mn.mu, Math.acos(17200 / 19200) / D, 1e-9);

// 5 Übersetzung = numerische Ableitung (zentrale Differenz, h = 1e-3)
const dnum = (m, v) => { const S = Core.compile(m), h = 1e-3, X = Core.advance(S, S.X0, S.v0, v).X;
  const f = w => Core.outVal(S, Core.advance(S, X, v, w).X); return { an: Core.ratio(S, X), nu: (f(v + h) - f(v - h)) / (2 * h) }; };
for (const v of [37, 145, 260]) { const r = dnum(fb(40, 120, 80, 100, 0), v); check(`Viergelenk Übersetzung bei ${v}° rel. Fehler`, Math.abs(r.an - r.nu) / Math.abs(r.nu), 0, 1e-6); }
{ const r = dnum(sk(40, 120, 0, 30), 50); check('Schubkurbel Übersetzung bei 50° rel. Fehler', Math.abs(r.an - r.nu) / Math.abs(r.nu), 0, 1e-6); }

// 6 Kein Zweigsprung bei 0,1°; Nicht-Grashof-Kurbel blockiert an der analytischen Grenze
const fine = Core.analyze(fb(40, 120, 80, 100, 0), 0.1);
check('0,1°-Lauf: Zweig σ konstant', ok(fine.full && fine.smp.every(s => side(s.X, 100) === 1)), 1, 0);
let e6 = 0; for (const s of fine.smp) { const r = Core.fourbarClosed(40, 120, 80, 100, s.v * D, 1); e6 = Math.max(e6, Math.hypot(B(s.X)[0] - r.B[0], B(s.X)[1] - r.B[1])); }
check('0,1°-Lauf max. Abweichung [mm]', e6, 0, 1e-6);
const ng = Core.analyze(fb(80, 60, 70, 100, 0), 0.1), thLim = Math.acos((80 ** 2 + 100 ** 2 - 130 ** 2) / (2 * 80 * 100)) / D;
check('Nicht-Grashof: Totlage vorwärts [°]', ng.lim[1], thLim, 1e-4);
check('Nicht-Grashof: Totlage rückwärts [°]', ng.lim[0], -thLim, 1e-4);
check('Nicht-Grashof: Zweig bis zur Grenze erhalten', ok(ng.smp.every(s => side(s.X, 100) === 1)), 1, 0);
const S6 = Core.compile(fb(80, 60, 70, 100, 0)), blk = Core.advance(S6, S6.X0, 0, 120);
check('Fahren über die Grenze: als blockiert gemeldet', ok(!blk.ok && Math.abs(blk.v - thLim) < 1e-2), 1, 0);
check('Ist-Lage am Anschlag erfüllt Schließbedingung [mm]', Math.abs(Math.hypot(blk.X[4] - 100, blk.X[5]) - 70) + Math.abs(Math.hypot(blk.X[4] - blk.X[2], blk.X[5] - blk.X[3]) - 60), 0, 1e-6);
check('Nicht-Grashof Typ erkannt', ok(ng.info.type === 'Doppelschwinge (Nicht-Grashof)'), 1, 0);

// 7 Scherenhub, 2 Stufen, L = 100: H = 2·L·sin α bei Schieberweg s = L·cos α (kollineare ternäre Glieder)
const sc = a0 => { const c = 100 * Math.cos(a0 * D), s = 100 * Math.sin(a0 * D);
  // 0 F, 1 S, 2 T1, 3 T2, 4 M1, 5 M2, 6 T3, 7 T4
  return { pts: [{ x: 0, y: 0, fix: 1 }, { x: c, y: 0 }, { x: c, y: s }, { x: 0, y: s }, { x: c / 2, y: s / 2 }, { x: c / 2, y: 1.5 * s }, { x: c, y: 2 * s }, { x: 0, y: 2 * s }],
    links: [[0, 2, 4], [1, 3, 4], [3, 6, 5], [2, 7, 5]], slider: { p: 1, a: 0, ang: 0 }, drive: { slider: true }, out: { slider: true } }; };
const tSC = Core.analyze(sc(40));
let e7 = 0, n7 = 0; for (const s of tSC.smp) if (s.v > 1 && s.v < 99) { n7++; e7 = Math.max(e7, Math.abs(s.X[13] - 2 * Math.sqrt(100 * 100 - s.v * s.v)), Math.abs(s.X[15] - s.X[13])); }
check('Scherenhub Höhe max. Abweichung [mm]', e7, 0, 1e-6);
check('Scherenhub: Stützstellen im Bereich 1…99 mm', ok(n7 > 50), 1, 0);
check('Scherenhub: Totlage bei s = L [mm]', tSC.lim[1], 100, 1e-4);
const SS = Core.compile(sc(40)), Xs = Core.advance(SS, SS.X0, SS.v0, 60).X;
check('Scherenhub: Mittelpunkt bleibt Mitte (starr, kollinear) [mm]', Math.hypot(Xs[8] - (Xs[0] + Xs[4]) / 2, Xs[9] - (Xs[1] + Xs[5]) / 2), 0, 1e-9);

// 8 Kräfte über virtuelle Arbeit
// Hebel r = 100 mit Gewicht W = 10 N am Ende: Haltemoment M = W·r·cos θ [N·m]
const lev = { pts: [{ x: 0, y: 0, fix: 1 }, { x: 100, y: 0 }], links: [[0, 1]], drive: { link: 0 }, out: { link: 0 }, loads: [{ p: 1, fx: 0, fy: -10 }] };
let e8 = 0; for (const s of Core.analyze(lev).smp) e8 = Math.max(e8, Math.abs(s.Q - 10 * 0.1 * Math.cos(s.v * D)));
check('Hebel: Haltemoment = W·r·cos θ, max. Abweichung [N·m]', e8, 0, 1e-9);
// Schubkurbel r40 l120 e0, Kolbenlast P = 50 N gegen +x: M = P·dx/dθ, dx/dθ = −r sin θ − r² sin θ cos θ / √(l² − r² sin² θ)
const skL = { ...sk(40, 120, 0, 30), loads: [{ p: 2, fx: -50, fy: 0 }] };
let e8b = 0; for (const s of Core.analyze(skL).smp) { const t = s.v * D, dx = -40 * Math.sin(t) - 1600 * Math.sin(t) * Math.cos(t) / Math.sqrt(14400 - 1600 * Math.sin(t) ** 2);
  e8b = Math.max(e8b, Math.abs(s.Q - 50 * dx / 1000)); }
check('Schubkurbel: Antriebsmoment gegen Kolbenlast, max. Abweichung [N·m]', e8b, 0, 1e-9);
// Scherenhub: Last W = 100 N oben, Haltekraft am Schieber F = W·dH/ds = −2·W·s/√(L² − s²) [N]
const scL = { ...sc(40), loads: [{ p: 6, fx: 0, fy: -100 }] };
let e8c = 0; for (const s of Core.analyze(scL).smp) if (s.v > 1 && s.v < 99) e8c = Math.max(e8c, Math.abs(s.Q + 200 * s.v / Math.sqrt(10000 - s.v * s.v)) / Math.max(1, Math.abs(s.Q)));
check('Scherenhub: Haltekraft am Schieber, max. rel. Abweichung', e8c, 0, 1e-9);
// Energiebilanz Kurbelschwinge, Gewicht 20 N am Koppelpunkt: ∫ M dθ = W·Δy (Trapez, 0,1°), Umlauf ∮ = 0
const ksL = (() => { const m = fb(40, 120, 80, 100, 0), A_ = [m.pts[1].x, m.pts[1].y], B_ = [m.pts[2].x, m.pts[2].y];
  m.pts.push({ x: A_[0] + 0.5 * (B_[0] - A_[0]) - 0.5 * (B_[1] - A_[1]), y: A_[1] + 0.5 * (B_[1] - A_[1]) + 0.5 * (B_[0] - A_[0]) });
  m.links[1] = [1, 2, 4]; m.loads = [{ p: 4, fx: 0, fy: -20 }]; return m; })();
const en = Core.analyze(ksL, 0.1).smp; let Wk = 0, k90 = 0;
for (let k = 1; k < en.length; k++) { Wk += (en[k].Q + en[k - 1].Q) / 2 * (en[k].v - en[k - 1].v) * D; if (Math.abs(en[k].v - 90) < 1e-6) k90 = k; }
let W90 = 0; for (let k = 1; k <= k90; k++) W90 += (en[k].Q + en[k - 1].Q) / 2 * (en[k].v - en[k - 1].v) * D;
check('Energie 0…90°: ∫M dθ = W·Δy [N·m]', W90, 20 * (en[k90].X[9] - en[0].X[9]) / 1000, 1e-5);
check('Energie Umlauf: ∮M dθ [N·m]', Wk, 0, 1e-6);
// Ist-Lage nach vielen Umdrehungen: gleiche Lage wie nach dem Rest modulo 360°, Antriebswert bleibt stetig
{ const m = fb(40, 120, 80, 100, 60), a1 = Core.analyze({ ...m, at: 90 }), a2 = Core.analyze({ ...m, at: 90 + 360 * 100 });
  let e = 0; for (let i = 0; i < a1.cur.X.length; i++) e = Math.max(e, Math.abs(a1.cur.X[i] - a2.cur.X[i]));
  check('Umlauf: Lage bei 90° + 100 Umdrehungen = Lage bei 90° [mm]', e, 0, 1e-6);
  check('… Antriebswert stetig (36 090°)', a2.cur.v, 90 + 36000, 1e-12);
  const a3 = Core.analyze({ ...m, at: 90 - 360 * 3 }); let e3 = 0; for (let i = 0; i < a1.cur.X.length; i++) e3 = Math.max(e3, Math.abs(a1.cur.X[i] - a3.cur.X[i]));
  check('… auch rückwärts (−990°) [mm]', e3, 0, 1e-6); }

// 9 Gelenkkräfte (Lagrange-Multiplikatoren) und Reibung (Audit 22.11.2026)
{ const S9 = Core.compile(lev), f = Core.forces(S9, S9.X0, lev.loads);
  check('Hebel: Lagerkraft am Drehpunkt = W', f.pin[0], 10, 1e-9); check('Hebel: Lastpunkt ist kein Gelenk', f.pin[1], 0, 0);
  check('Hebel: Reibmoment = μ·d/2·W (0,2 · 3 mm · 10 N) [N·m]', Core.friction(S9, S9.X0, lev.loads, { mu: 0.2, d: 6 }), 0.2 * 3 * 10 / 1000, 1e-9); }
// Schubkurbel r40 l120 e0, Kolbenlast P = 50 N: Koppelkraft P/cos φ, sin φ = r·sin θ/l; Führung quer P·tan φ
{ let e1 = 0, e2 = 0, e3 = 0;
  for (const s of Core.analyze(skL).smp) { const t = s.v * D, ph = Math.asin(40 * Math.sin(t) / 120), S9 = Core.compile({ ...skL }), f = Core.forces(S9, s.X, skL.loads);
    e1 = Math.max(e1, Math.abs(f.pin[1] - 50 / Math.cos(ph))); e2 = Math.max(e2, Math.abs(f.pin[0] - 50 / Math.cos(ph))); e3 = Math.max(e3, Math.abs(f.N - 50 * Math.abs(Math.tan(ph)))); }
  check('Schubkurbel: Kurbelzapfen = P/cos φ, max. Abweichung [N]', e1, 0, 1e-6);
  check('Schubkurbel: Kurbellager = P/cos φ, max. Abweichung [N]', e2, 0, 1e-6);
  check('Schubkurbel: Führungskraft quer = P·tan φ, max. Abweichung [N]', e3, 0, 1e-6); }
// Viergelenk mit Gewicht: Gleichgewicht jedes beweglichen Glieds ist in λ enthalten → Summe der Lagerkräfte = Gewicht (ohne Antrieb: Moment, keine Kraft)
{ const S9 = Core.compile(ksL), X9 = Core.advance(S9, S9.X0, S9.v0, 50).X, f = Core.forces(S9, X9, ksL.loads);
  check('Viergelenk: Lager A0 und B0 tragen zusammen mindestens das Gewicht', f.pin[0] + f.pin[3] >= 20 - 1e-9 ? 1 : 0, 1, 0); }
// Reibung kostet immer Arbeit: Umlauf mit Reibung ∮ Qf dθ > 0, ohne Reibung keine
{ const a = Core.analyze({ ...ksL, fric: { mu: 0.2, d: 6 } }, 1); let Wf = 0; for (let k = 1; k < a.smp.length; k++) Wf += (a.smp[k].Qf + a.smp[k - 1].Qf) / 2 * (a.smp[k].v - a.smp[k - 1].v) * D;
  check('Reibung Umlauf: ∮ Qf dθ > 0', Wf > 0 ? 1 : 0, 1, 0); check('ohne μ keine Reibungswerte', Core.analyze({ ...ksL, fric: { mu: 0, d: 6 } }).smp[0].Qf === undefined ? 1 : 0, 1, 0); }
