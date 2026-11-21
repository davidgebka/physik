// Verifikation gegen analytische Fälle. Ausführen: node elektronik/test.js
const Core = require('../tools/load-core')(__dirname);
const check = require('../tools/check');
const ok = (name, c) => check(name, c ? 1 : 0, 1);
// Netz direkt: Knoten 0…n−1, Elemente wie Core.netlist
const S = (n, el) => Core.solve({ n, el });

// Spannungsteiler: 9 V (Ri 1 µΩ), 1 kΩ oben, 2 kΩ unten → 6 V
{ const r = S(2, [{ k: 'src', a: 1, b: 0, U: 9, Ri: 1e-6 }, { k: 'g', a: 1, b: 0, g: 1 / 3000 }]); check('Reihe 3 kΩ an 9 V: 3 mA', r.I[1], 0.003, 1e-6); }
{ const r = S(3, [{ k: 'src', a: 2, b: 0, U: 9, Ri: 1e-6 }, { k: 'g', a: 2, b: 1, g: 1e-3 }, { k: 'g', a: 1, b: 0, g: 5e-4 }]); check('Spannungsteiler 1k/2k: 6 V', r.V[1] - r.V[0], 6, 1e-6); }
// Parallel: 100 Ω ‖ 100 Ω an 5 V → 100 mA
{ const r = S(2, [{ k: 'src', a: 1, b: 0, U: 5, Ri: 1e-6 }, { k: 'g', a: 1, b: 0, g: 0.01 }, { k: 'g', a: 1, b: 0, g: 0.01 }]); check('Parallel 2 × 100 Ω an 5 V', r.I[0], 0.1, 1e-5); }
// Innenwiderstand: AA 1,5 V / 0,15 Ω an 1,35 Ω → 1 A, Klemmenspannung 1,35 V
{ const r = S(2, [{ k: 'src', a: 1, b: 0, U: 1.5, Ri: 0.15 }, { k: 'g', a: 1, b: 0, g: 1 / 1.35 }]); check('Innenwiderstand: Strom 1 A', r.I[0], 1, 1e-6); check('Innenwiderstand: Klemme 1,35 V', r.U[0], 1.35, 1e-6); }
// Kurzschluss über Leitung (beide Pole am selben Knoten) → U/Ri
{ const r = S(1, [{ k: 'src', a: 0, b: 0, U: 1.5, Ri: 0.15 }]); check('Kurzschluss: U/Ri = 10 A', r.I[0], 10, 1e-9); }

// LED: beim Nennstrom genau Vf
for (const [k, L] of Object.entries(Core.LEDS)) check(`LED ${L.n}: I(Vf) = In`, Core.ledIV(L, L.Vf)[0], L.In, 1e-9);
// LED + Vorwiderstand gegen unabhängige Bisektion von U = I·(R + Rs) + NVT·ln(1 + I/Is), Is aus I(Vf) = In
function ledRef(U, R, L) { const Is = L.In / Math.expm1((L.Vf - L.In * L.Rs) / Core.NVT); let lo = 0, hi = U / R;
  for (let i = 0; i < 200; i++) { const I = (lo + hi) / 2; (I * (R + L.Rs) + Core.NVT * Math.log1p(I / Is) > U ? hi = I : lo = I); } return (lo + hi) / 2; }
for (const [U, R, c] of [[9, 330, 'rot'], [5, 100, 'weiss'], [3, 15, 'rot'], [12, 1000, 'blau'], [3.7, 1, 'w1']]) {
  const L = Core.LEDS[c], r = S(3, [{ k: 'src', a: 2, b: 0, U, Ri: 1e-6 }, { k: 'g', a: 2, b: 1, g: 1 / R }, { k: 'led', a: 1, b: 0, L }]);
  check(`LED ${L.n} an ${U} V über ${R} Ω`, r.I[2], ledRef(U, R + 1e-6, L), 1e-6);
}
// LED ohne Vorwiderstand an 9 V (Ri 1,7 Ω): Strom ≈ (9 − ~2,1 V)/(1,7 + 10 Ω)
{ const L = Core.LEDS.rot, r = S(2, [{ k: 'src', a: 1, b: 0, U: 9, Ri: 1.7 }, { k: 'led', a: 1, b: 0, L }]); check('LED direkt am 9-V-Block', r.I[1], ledRef(9, 1.7, L), 1e-6); }
// Ableitung der Kennlinie gegen Differenzenquotient
for (const v of [-0.5, 0.5, 1.8, 2.0, 2.5, 5]) { const L = Core.LEDS.rot, h = 1e-6, d = (Core.ledIV(L, v + h)[0] - Core.ledIV(L, v - h)[0]) / (2 * h); check(`LED dI/dv bei ${v} V`, Core.ledIV(L, v)[1], d, 1e-4); }
// LED verpolt: praktisch kein Strom
{ const r = S(2, [{ k: 'src', a: 1, b: 0, U: 5, Ri: 1 }, { k: 'led', a: 0, b: 1, L: Core.LEDS.rot }]); ok('LED verpolt sperrt', Math.abs(r.I[1]) < 1e-12); }

// Glühlampe: Nennstrom bei Nennspannung, I ∝ U^0,6
{ const r = S(2, [{ k: 'src', a: 1, b: 0, U: 6, Ri: 1e-6 }, { k: 'lamp', a: 1, b: 0, Un: 6, In: 0.5 }]); check('Glühlampe 6 V 3 W: 0,5 A', r.I[1], 0.5, 1e-6); }
{ const r = S(2, [{ k: 'src', a: 1, b: 0, U: 3, Ri: 1e-6 }, { k: 'lamp', a: 1, b: 0, Un: 6, In: 0.5 }]); check('Glühlampe halbe Spannung: 0,5·0,5^0,6', r.I[1], 0.5 * Math.pow(0.5, 0.6), 1e-6); }
// Zwei gleiche Lampen in Reihe teilen die Spannung je zur Hälfte
{ const r = S(3, [{ k: 'src', a: 2, b: 0, U: 12, Ri: 1e-6 }, { k: 'lamp', a: 2, b: 1, Un: 6, In: 0.5 }, { k: 'lamp', a: 1, b: 0, Un: 6, In: 0.5 }]); check('2 Lampen 6 V in Reihe an 12 V', r.I[0], 0.5, 1e-6); }

// Modell (Raster): Batterie + (0,0), − (2,0); Bauteil a (0,2), b (2,2); Leitungen schließen den Kreis
const loop = (bat, part, extra = []) => ({ parts: [{ t: 'bat', x: 0, y: 0, r: 0, ...bat }, { x: 0, y: 2, r: 0, ...part }, ...extra], wires: [[0, 0, 0, 2], [2, 0, 2, 2]] });
// Reihenschaltung von Zellen: 4 × AA = 6 V, 0,6 Ω
{ const c = Core.cell({ cell: 'aa', n: 4 }); check('4 × AA: 6 V', c.U, 6); check('4 × AA: Ri 0,6 Ω', c.Ri, 0.6); check('4 × AA: 92 g', c.g, 92); }
// Motor: Laufstrom bei Nennspannung, Anlaufstrom = Ia
{ const a = Core.analyze(loop({ cell: 'psu12' }, { t: 'mot', Un: 12, In: 0.1, Ia: 0.3 })); const Rt = 12 / 0.1 + 0.1;
  check('Motor 12 V: Laufstrom', a.parts[1].I, 12 / Rt, 1e-6); check('Motor 12 V: Anlaufstrom', a.parts[1].Is, 12 / (40 + 0.1), 1e-6); check('Motor 12 V: Drehzahl ≈ 100 %', a.parts[1].rel, (12 - 0.1 * 12 / Rt) / 12, 1e-6); }
// Kabel: 10 m 0,14 mm² Kupfer → 1,25 Ω
{ const n = Core.netlist(loop({ cell: 'psu12' }, { t: 'cab', L: 10, A: 0.14 })); check('Kabel 10 m × 0,14 mm²: 1,25 Ω', 1 / n.el[1].g, 1.25, 1e-9); }
// Schalter offen: kein Strom; zu: Strom
{ const m = loop({ cell: 'aa', n: 2 }, { t: 'lamp', Un: 2.5, Pn: 0.75 }, [{ t: 'sw', x: 4, y: 0, r: 1, on: false }]);
  m.wires = [[0, 0, 4, 0], [4, 2, 0, 2], [2, 0, 2, 2]]; // Pluspol → Schalter → Lampe → Minuspol
  let a = Core.analyze(m); ok('Schalter offen: Lampe aus', Math.abs(a.parts[1].I) < 1e-6);
  m.parts[2].on = true; a = Core.analyze(m); ok('Schalter zu: Lampe an', a.parts[1].I > 0.1); }
// Offener Anschluss wird erkannt
{ const a = Core.analyze({ parts: [{ t: 'bat', x: 0, y: 0, r: 0, cell: 'aa', n: 1 }, { t: 'r', x: 2, y: 0, r: 0, R: 100, Pn: 0.25 }], wires: [] }); ok('offener Anschluss erkannt', a.parts[1].msg === 'Anschluss offen' && a.net.open[1][1] && !a.net.open[1][0]); }

// Urteile
{ const m = { parts: [{ t: 'bat', x: 0, y: 0, r: 0, cell: 'e9v' }, { t: 'r', x: 0, y: 2, r: 0, R: 330, Pn: 0.25 }, { t: 'led', x: 2, y: 2, r: 0, col: 'rot' }], wires: [[0, 0, 0, 2], [4, 2, 4, 0], [4, 0, 2, 0]] };
  const a = Core.analyze(m); ok('9 V + 330 Ω + rote LED: ≈ 20 mA, passt', a.issues.length === 0 && Math.abs(a.parts[2].I - 0.0205) < 0.001);
  check('Laufzeit 9-V-Block = C/I', a.h, 0.55 / a.parts[0].I, 1e-9);
  m.parts[1].R = 1e-3; ok('LED ohne Vorwiderstand: kritisch „brennt durch“', Core.analyze(m).issues[0][0] === 2); }
{ const a = Core.analyze(loop({ cell: 'cr2032' }, { t: 'led', col: 'rot' })); check('CR2032 + LED direkt: Strom über Ri + Rs', a.parts[1].I, ledRef(3, 15, Core.LEDS.rot), 1e-6); ok('CR2032 + LED: Zelle überlastet (kritisch)', a.issues[0][0] === 2 && a.issues[0][2] === 0); }
{ const a = Core.analyze(loop({ cell: 'aa', n: 2 }, { t: 'r', R: 0.01, Pn: 0.25 })); ok('Kurzschluss 2 × AA', a.issues[0][1].startsWith('Kurzschluss')); }
{ const a = Core.analyze(loop({ cell: 'aa', n: 1 }, { t: 'lamp', Un: 6, Pn: 3 })); ok('6-V-Lampe an 1,5 V glimmt', /glimmt/.test(a.issues[0][1])); }
{ const m = loop({ cell: 'aa', n: 2 }, { t: 'lamp', Un: 2.5, Pn: 0.75 }); m.soll = 10; const a = Core.analyze(m); ok('Taschenlampe: Soll 10 h nicht erreicht', a.issues.some(i => /Soll/.test(i[1]))); }

// Knotenregel an Zufallsnetzen: Σ I = 0 je Knoten (GMIN mitgezählt)
let worst = 0, nconv = 0; const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(7);
for (let t = 0; t < 300; t++) {
  const n = 2 + Math.floor(rnd() * 5), el = [], pick = () => Math.floor(rnd() * n);
  el.push({ k: 'src', a: 1, b: 0, U: 1 + rnd() * 20, Ri: 0.01 + rnd() * 5 });
  for (let j = 0; j < 2 + n * 2; j++) { const a = pick(), b = pick(), u = rnd();
    el.push(u < 0.5 ? { k: 'g', a, b, g: 1 / (1 + rnd() * 1000) } : u < 0.8 ? { k: 'led', a, b, L: Object.values(Core.LEDS)[Math.floor(rnd() * 6)] } : { k: 'lamp', a, b, Un: 2 + rnd() * 10, In: 0.05 + rnd() }); }
  const r = S(n, el); if (r.err) { nconv++; continue; }
  const sum = new Array(n).fill(0); el.forEach((e, i) => { sum[e.a] -= r.I[i] * (e.k === 'src' ? -1 : 1); sum[e.b] += r.I[i] * (e.k === 'src' ? -1 : 1); });
  sum.forEach((s, i) => { if (r.V[i] !== 0) worst = Math.max(worst, Math.abs(s - 1e-12 * r.V[i])); });
}
check('300 Zufallsnetze: alle konvergiert', nconv, 0); check('300 Zufallsnetze: max |Σ I| je Knoten', worst, 0, 1e-9);

// Aufräumen der Leitungen: Bauteil auf einer Leitung wird eingefügt, T-Abzweig verbindet, Kreuzung nicht
{ const m = { parts: [{ t: 'bat', x: 0, y: 2, r: 1, cell: 'e9v', n: 1 }, { t: 'r', x: 2, y: 0, r: 0, R: 330, Pn: 0.25 }, { t: 'led', x: 6, y: 2, r: 1, col: 'rot' }, { t: 'sw', x: 2, y: 6, r: 0, on: false }],
    wires: [[0, 2, 0, 0], [0, 0, 2, 0], [4, 0, 6, 0], [6, 0, 6, 2], [0, 4, 0, 6], [0, 6, 6, 6], [6, 6, 6, 4]] }; // Schalter mitten auf der unteren Leitung
  let a = Core.analyze(m); ok('Schalter auf Leitung, ohne Aufräumen: überbrückt (Strom fließt)', a.parts[2].I > 0.01);
  m.wires = Core.tidy(m); a = Core.analyze(m);
  ok('Aufräumen: Leitung unter dem Schalter entfernt, Rest geteilt', JSON.stringify(m.wires.filter(w => w[1] === 6 && w[3] === 6)) === '[[0,6,2,6],[4,6,6,6]]');
  ok('Schalter offen trennt nach dem Aufräumen', Math.abs(a.parts[2].I) < 1e-9 && !a.net.open[3][0] && !a.net.open[3][1]);
  m.parts[3].on = true; ok('Schalter zu: LED an', Core.analyze(m).parts[2].I > 0.01);
  ok('Aufräumen ist idempotent', JSON.stringify(Core.tidy(m)) === JSON.stringify(m.wires)); }
{ const T = Core.tidy({ parts: [], wires: [[0, 0, 4, 0], [2, 0, 2, 3], [0, 2, 4, -2]] }); // T-Abzweig bei (2,0); Diagonale kreuzt (2,0)? Nein: läuft durch (2,0) → wird geteilt, (2,0) ist Punkt der Diagonale
  ok('T-Abzweig teilt die Leitung', T.some(w => w + '' === '0,0,2,0') && T.some(w => w + '' === '2,0,4,0'));
  ok('Diagonale durch den Abzweigpunkt wird ebenfalls geteilt', T.some(w => w + '' === '0,2,2,0')); }
{ const T = Core.tidy({ parts: [], wires: [[0, 1, 4, 1], [2, 0, 2, 3]] }); ok('Kreuzung ohne Endpunkt bleibt getrennt', T.length === 2); }
