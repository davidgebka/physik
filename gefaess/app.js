// Designphysik · Gefäß & Kippen – Oberfläche (Vorlagen, Editor, Kippansicht, Schwappen, Kennwerte, Datei).
// Läuft nach dem Rechenkern in index.html (globales Core); aufgeteilt, weil index.html über die 1500-Zeilen-Grenze wuchs (konzept.md).
// Vorlagen: p = Innenkontur (Drehkörper) oder plan = Grundriss innen + H = Innenhöhe (senkrechte Wand).
// Designklassiker: Maße nach Hersteller-/Händlerangaben (Außenmaße), Innenkontur daraus nachempfunden – keine Werkszeichnung.
const PRESETS = {
  becher:  { n: 'Becher', p: [[0,0],[33,0],[36,3],[40,95]] },
  karaffe: { n: 'Karaffe', p: [[0,0],[40,0],[47,8],[53,45],[50,95],[36,140],[24,175],[22,205],[28,225]] },
  flasche: { n: 'Flasche', p: [[0,0],[37,0],[40,4],[40,150],[37,172],[18,195],[13,210],[13,245]] },
  schale:  { n: 'Schale', p: [[0,0],[30,0],[56,14],[80,38],[96,62]] },
  konisch: { n: 'Konischer Becher', p: [[0,0],[24,0],[26,2],[44,120]] },
  kammer:  { n: 'Kammergefäß', p: [[0,0],[36,0],[40,5],[40,70],[22,80],[16,92],[38,100],[42,110],[42,170],[30,185]] },
  // Chemex Classic 6 Tassen (Peter Schlumbohm, 1941): H 216, Ø 130, 885 ml; Ausgießrinne nicht modelliert
  chemex:  { n: 'Chemex · Schlumbohm 1941', g: 1, p: [[0,0],[50,0],[58,6],[61,22],[55,50],[40,80],[24,104],[20,114],[28,128],[46,160],[61,208]], t: 3, tb: 5, m: 'glas' },
  // Kartio Becher 40 cl (Kaj Franck, 1958): H 120, Ø 89, dicker Boden
  kartio:  { n: 'Kartio-Becher · Franck 1958', g: 1, p: [[0,0],[31,0],[32,2],[42,108]], t: 3, tb: 12, m: 'glas' },
  // Wasserkessel 9093, 2 l (Michael Graves, 1985): H 225, Ø 220 Boden; Kegelkörper bis zur Deckelöffnung, Tülle nicht modelliert
  kessel:  { n: 'Kessel 9093 · Graves 1985', g: 1, p: [[0,0],[104,0],[108,5],[104,20],[56,110],[50,116]], t: 1, tb: 1, m: 'edelstahl',
             sp: [[96,32],[122,58],[148,92]], sd: 12, hp: [[-50,118],[-38,178],[38,178],[50,118]], hd: 12, lid: true },
  // Grundform Teekanne: bauchiger Körper, Tülle vom unteren Drittel bis knapp unter den Rand, Ohrhenkel, Deckel
  teekanne: { n: 'Teekanne', p: [[0,0],[45,0],[60,14],[70,45],[66,80],[50,104],[40,112]], sp: [[66,35],[86,58],[100,86],[110,108]], sd: 12,
             hp: [[-62,96],[-96,94],[-106,60],[-90,30],[-68,24]], hd: 14, lid: true },
  // Tee-Extraktkännchen MT 49 (Marianne Brandt, 1924): Halbkugel auf Kreuzfuß, H 75 gesamt; Ø geschätzt, Messing ≈ Edelstahl
  brandt:  { n: 'Teekännchen MT 49 · Brandt 1924', g: 1, p: [[0,0],[10.7,1.1],[21,4.2],[30.6,9.3],[38.9,16.1],[45.7,24.4],[50.8,34],[53.9,44.3],[55,55]],
             sp: [[46,25],[60,38],[72,54]], sd: 8, hp: [[-50,48],[-66,62],[-80,72]], hd: 12, lid: true, r: 32, t: 1.5, tb: 0, m: 'edelstahl' },
  // Aalto-Vase 160 mm (Alvar Aalto, 1936): H 160, L 208, 1,55 kg; Grundriss nachempfunden, Tiefe geschätzt
  aalto:   { n: 'Aalto-Vase · Aalto 1936', g: 1, plan: [[-98,10],[-80,45],[-55,40],[-40,70],[-10,75],[5,50],[30,72],[60,65],[75,35],[98,20],[90,-15],[60,-25],[45,-60],[15,-75],[-5,-45],[-35,-60],[-65,-50],[-85,-25]], H: 150, sm: true, t: 4, tb: 10, m: 'glas' },
  // Kubus-Geschirr, großer Behälter (Wilhelm Wagenfeld, 1938): 184 × 184 × 83 mm, Pressglas, Ecken gerundet
  // Zwei Konturen: back = hinten, front = vorne (Ausgießseite), je Boden → Mündung
  kopf:    { n: 'Krug mit geneigtem Kopf', back: [[-55,0],[-85,9],[-89,54],[-79,97],[-45,131],[-41,151],[-52,180],[-42,220],[-11,249],[18,260]],
             front: [[55,0],[83,43],[82,86],[63,117],[38,143],[32,163],[41,180],[58,191],[83,199]], sm: true },
  schief:  { n: 'Schräges Glas', back: [[-35,0],[-5,110]], front: [[35,0],[65,110]], sm: false },
  // Grundform Kelchglas: Kelch auf Stiel, Fuß Ø 76 (Stiel nicht gerechnet)
  kelch:   { n: 'Kelchglas', p: [[0,90],[18,91],[33,102],[41,125],[40,160],[34,190]], r: 38, t: 1.5, tb: 3, m: 'glas' },
  // Grundform Schiffskaraffe: sehr breiter Boden, steile Schulter, enger Hals
  schiff:  { n: 'Schiffskaraffe', p: [[0,0],[105,0],[110,6],[100,40],[60,95],[24,140],[18,160],[18,200],[22,215]], t: 4, tb: 8, m: 'glas' },
  // Erlenmeyerkolben 250 ml, Enghals (Emil Erlenmeyer, 1860; Maße nach DIN ISO 1773): H 145, Ø 85, Hals Ø 34 außen
  erlen:   { n: 'Erlenmeyerkolben · Erlenmeyer 1860', g: 1, p: [[0,0],[38,0],[41,3],[41,6],[17,108],[16,112],[16,140],[18,144]], t: 1.3, tb: 1.5, m: 'glas' },
  // Picardie 25 cl (Duralex, 1954): H ≈ 90, Ø ≈ 85 (Händlerangaben, gerundet); Facetten als glatter Kegel
  picardie: { n: 'Picardie 25 cl · Duralex 1954', g: 1, p: [[0,0],[27,0],[29,3],[38,62],[39,64],[40,84]], t: 2.5, tb: 6, m: 'glas' },
  // Isolierkanne EM77, 1 l (Erik Magnussen, 1977): H ≈ 265 (geschätzt); Glaseinsatz als Innenkontur, Außenhülle und Kippverschluss fehlen
  em77:    { n: 'Isolierkanne EM77 · Magnussen 1977', g: 1, p: [[0,0],[40,0],[42,4],[42,180],[30,200],[22,210],[22,222]], t: 3, tb: 10, m: 'glas',
             hp: [[-56,200],[-92,190],[-92,70],[-56,50]], hd: 14, lid: true },
  kubus:   { n: 'Kubus-Behälter · Wagenfeld 1938', g: 1, plan: [[-88,-80],[-86,-86],[-80,-88],[80,-88],[86,-86],[88,-80],[88,80],[86,86],[80,88],[-80,88],[-86,86],[-88,80]], H: 78, sm: false, t: 4, tb: 5, m: 'glas' }
};
const toPts = a => a.map(([x, z]) => ({ x, z }));

const DEG = Math.PI / 180, STEPS = 360;

// kind 'rot' = Drehkörper (pts = Profil r,z); 'plan' = Grundriss (plan = Punkte x, z = Tiefe y), Innenhöhe H, Kipprichtung psi [°]
const S = { kind: 'rot', pts: toPts(PRESETS.karaffe.p), smooth: true, plan: toPts(PRESETS.kubus.plan), psmooth: false, H: 78, psi: 0,
  snap: 1, marks: true, mode: 'edit', fill: null, theta: 0, cur: 0, sel: -1, undo: [], lastPour: 0,
  t: 3, tb: 6, mat: 'glas', foot: null, // foot null = Standradius aus Geometrie
  spout: null, handle: null, lid: false, part: 'body', // Anbauteile (nur Drehkörper): {p: Mittellinie, d: Ø innen bzw. Stab-Ø}
  tA: toPts(PRESETS.kopf.back), tB: toPts(PRESETS.kopf.front), tsmooth: true, tPart: 'B', // Zwei Konturen: hinten, vorne
  slosh: false, wf: 1.8, wa: 10, sv: 1.4, sb: 0.3 }; // Schwappen: Schrittfrequenz [Hz], Hub [mm], Tempo [m/s], Bremszeit [s] (Schätzwerte)
const MATS = { glas: ['Glas', 2.5], porzellan: ['Porzellan', 2.4], steinzeug: ['Steinzeug', 2.3], pp: ['PP', 0.9], edelstahl: ['Edelstahl', 7.9] };
let G = {};
let REF = null; // gemerkter Stand: Schnappschuss {cap, fill, start, tip, push, mv, fc, kc, V …}; pending bis Kipplauf und Standsicherheit fertig
const isPlan = () => S.kind === 'plan', isRot = () => S.kind === 'rot', isTube = () => S.kind === 'tube';
const P = () => isPlan() ? S.plan : isTube() ? (S.tPart === 'A' ? S.tA : S.tB) : S.part === 'spout' ? S.spout.p : S.part === 'handle' ? S.handle.p : S.pts; // aktuell bearbeitete Punkte
const setP = a => { if (isPlan()) S.plan = a; else if (isTube()) { if (S.tPart === 'A') S.tA = a; else S.tB = a; } else if (S.part === 'spout') S.spout.p = a; else if (S.part === 'handle') S.handle.p = a; else S.pts = a; };
const mirror = () => isRot() && S.part === 'body'; // Profil wird gespiegelt; Tülle/Henkel liegen nur in der Seitenansicht
const minPts = () => isPlan() ? 3 : 2;
// Werte aus Datei/Link: nur bekannte Materialien, Zahlen im Reglerbereich
const matOk = m => Object.hasOwn(MATS, m) ? m : 'glas';
const ptsOk = (a, n, abs) => { const p = Array.isArray(a) ? a.slice(0, 1000).filter(q => Array.isArray(q) && Number.isFinite(+q[0]) && Number.isFinite(+q[1])).map(([x, z]) => ({ x: abs ? Math.max(0, +x) : +x, z: +z })) : [];
  return p.length >= n ? p : null; };
const prof = a => ptsOk(a, 2, true), planOk = a => ptsOk(a, 3, false);
const num = (v, def, lo, hi) => Number.isFinite(+v) && v !== null && v !== '' ? Math.min(hi, Math.max(lo, +v)) : def;

// ---------- derived geometry ----------
function recompute() {
  if (P().length < minPts()) return;
  const old = G;
  if (isPlan()) recomputePlan(); else if (isTube()) recomputeTube(); else recomputeRot();
  G.curve = old.curve; // bis zum neuen Kipplauf die alte Kurve zeigen
  if (S.fill == null) S.fill = Math.round(G.cap * 0.8);
  S.fill = Math.min(S.fill, Math.floor(G.cap));
  updateCurve();
  const f = $('fill'); f.max = Math.max(1, Math.floor(G.cap)); f.value = S.fill;
  $('foot').max = Math.ceil(Math.max(G.maxR + S.t, G.rf) + 20);
}
function recomputeRot() {
  const wall = Core.sampled(S.pts, S.smooth);
  const samp = Core.trimLip(wall);
  const poly = Core.interiorPolygon(samp);
  const sl = Core.buildSlices(poly, 500);
  const sec = Core.sectionPolygon(samp);
  const sp = S.spout && S.spout.p.length >= 2 ? S.spout.p : null;
  const geo = Core.geoRot(sl, samp, sec, { spout: sp, lid: S.lid });
  const cum = Core.cumTable(sl);
  let maxR = 0; samp.forEach(p => maxR = Math.max(maxR, p.x));
  // Taschenmodell auf 250 Schichten: mit Tülle/Deckel (Rechnung), nur Rand (Fassungsvermögen offen), Gegenseite (ohne Tülle)
  // gleiche Optionen → gleicher Graph: Gegenseite ohne Tülle = pg, Rand ohne Deckel = Gegenseite
  const slP = Core.buildSlices(poly, 250), pgOf = o => Core.pocketGraph(slP, samp, o), pg = pgOf({ spout: sp, lid: S.lid });
  const pgBack = sp ? pgOf({ lid: S.lid }) : pg, pgRim = !S.lid ? pgBack : pgOf({});
  const capOf = g => Core.lakeSum(Core.fillLakes(g, 1e15).lakes) / 1000, cap = capOf(pg);
  const multi0 = Core.basins(pg, 0) > 1, fc = multi0 ? Core.fillCurve(pg, cap * 1000, 120).L : null;
  G = { bad: Core.selfCross(samp, false) ? 'Kontur kreuzt sich selbst: Innenraum nicht eindeutig, Werte ungültig' : '',
        wall, samp, poly, sl, cum, sec, geo, pg, pgBack, multi0,
        cap, capRim: pgRim === pg ? cap : capOf(pgRim), maxR,
        rimR: samp[samp.length - 1].x, H: sl.zmax - sl.zmin, z0: sl.zmin, xc: 0,
        walls: [wall, wall.map(p => ({ x: -p.x, z: p.z }))],
        lipAt: () => sp && G.lastSp ? sp[sp.length - 1] : samp[samp.length - 1],
        // Füllkurve: mehrere Becken → Spiegel des Sees, in den der Strahl fällt (Portionen), sonst exakt aus den Schichten
        fillH: ml => { if (!fc) return Core.heightForVolume(sl, cum, ml * 1000);
          const u = Math.max(0, Math.min(1, ml / Math.max(cap, 1e-9))) * 120, i = Math.min(119, Math.floor(u)); return fc[i] + (fc[i + 1] - fc[i]) * (u - i); } };
  const sh = Core.shell(wall, S.t, S.tb);
  let ztop = -Infinity; wall.forEach(p => ztop = Math.max(ztop, p.z));
  // Anbauteile aus demselben Material: Tülle als Rohr (Wandstärke t), Henkel als Vollstab
  const parts = [{ vol: sh.vol, x: 0, z: sh.z }];
  if (sp) parts.push(Core.tube(sp, S.spout.d + 2 * S.t, S.spout.d));
  if (S.handle && S.handle.p.length >= 2) parts.push(Core.tube(S.handle.p, S.handle.d, 0));
  const Vt = parts.reduce((a, q) => a + q.vol, 0), avg = k => parts.reduce((a, q) => a + q.vol * q[k], 0) / Vt;
  Object.assign(G, { mv: MATS[S.mat][1] * Vt / 1000, xv: avg('x'), zv: avg('z'), zst: sh.zst, rf: S.foot ?? sh.rb, flat: sh.flat, hRim: ztop - sh.zst, ztop });
}
// Zwei Konturen: Abschnitte gleicher Bogenlänge; gespiegelt (hinten ↔ vorne) für das Kippen nach hinten
function recomputeTube() {
  const sm = a => S.tsmooth ? Core.smoothOpen(a) : a.map(p => ({ x: p.x, z: p.z })), A = sm(S.tA), B = sm(S.tB);
  const As = Core.resample(A, 250), Bs = Core.resample(B, 250), mir = a => a.map(p => ({ x: -p.x, z: p.z }));
  const pg = Core.tubeGraph(As, Bs), outline = As.concat(Bs.slice().reverse());
  const cap = Core.lakeSum(Core.fillLakes(pg, 1e15).lakes) / 1000, fc = Core.fillCurve(pg, cap * 1000, 100).L;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity; outline.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); });
  let maxD = 0; for (let k = 0; k < As.length; k++) maxD = Math.max(maxD, Math.hypot(Bs[k].x - As[k].x, Bs[k].z - As[k].z));
  const n = As.length - 1;
  G = { bad: Core.selfCross(outline, true) ? 'Konturen kreuzen sich: Innenraum nicht eindeutig, Werte ungültig' : pg.bad,
        A, B, As, Bs, outline, pg, pgBack: Core.tubeGraph(mir(Bs), mir(As)), multi0: true, geo: true, cap, capRim: cap,
        H: z1 - z0, z0, xc: (x0 + x1) / 2, maxR: (x1 - x0) / 2, maxD, mouthD: Math.hypot(Bs[n].x - As[n].x, Bs[n].z - As[n].z),
        walls: [A.slice().reverse().concat(B)], lipAt: th => { const y = p => p.z * Math.cos(th) - p.x * Math.sin(th); return y(As[n]) < y(Bs[n]) ? As[n] : Bs[n]; },
        fillH: ml => { const u = Math.max(0, Math.min(1, ml / Math.max(cap, 1e-9))) * 100, i = Math.min(99, Math.floor(u)); return fc[i] + (fc[i + 1] - fc[i]) * (u - i); } };
  const sh = Core.tubeShell(As, Bs, S.t, S.tb);
  Object.assign(G, { mv: MATS[S.mat][1] * sh.vol / 1000, xv: sh.x, zv: sh.z, zst: sh.zst, rf: sh.rf, rfB: sh.rfB, flat: sh.flat, hRim: z1 - sh.zst, ztop: z1 });
}
function recomputePlan() {
  const pl = S.psmooth ? Core.closedSmooth(S.plan) : S.plan.map(p => ({ x: p.x, z: p.z }));
  const c = Math.cos(S.psi * DEG), s = Math.sin(S.psi * DEG), H = S.H;
  const rp = pl.map(p => ({ x: p.x * c + p.z * s, y: -p.x * s + p.z * c })); // +x' = Kipprichtung
  const geo = Core.prism(rp, H), { xmin, xmax } = geo;
  let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
  pl.forEach(p => { bx0 = Math.min(bx0, p.x); bx1 = Math.max(bx1, p.x); by0 = Math.min(by0, p.z); by1 = Math.max(by1, p.z); });
  G = { bad: Core.selfCross(pl, true) ? 'Grundriss kreuzt sich selbst: Fläche nicht eindeutig, Werte ungültig' : '', planS: pl, geo, cap: geo.A * H / 1000, H, z0: 0, xc: (xmin + xmax) / 2, maxR: (xmax - xmin) / 2, L: bx1 - bx0, B: by1 - by0,
        sec: [{ x: xmin, z: 0 }, { x: xmax, z: 0 }, { x: xmax, z: H }, { x: xmin, z: H }],
        walls: [[{ x: xmin, z: H }, { x: xmin, z: 0 }, { x: xmax, z: 0 }, { x: xmax, z: H }]],
        lipAt: () => ({ x: xmax, z: H }), fillH: ml => Math.min(H, ml * 1000 / geo.A) };
  const sh = Core.prismShell(rp, H, S.t, S.tb);
  Object.assign(G, { mv: MATS[S.mat][1] * sh.vol / 1000, xv: sh.x, zv: sh.z, zst: sh.zst, rf: sh.rf, flat: true, hRim: H + S.tb });
}
const sumMl = l => Core.lakeSum(l) / 1000;
function updateCurve() {
  G.stab = null;
  if (isPlan()) {
    D.lim = null;
    G.curve = Core.tiltCurveG(G.geo, S.fill * 1000, STEPS);
    for (let i = 0; i < G.curve.length; i++) G.curve[i] /= 1000;
    S.cur = curveMinUpTo(S.theta); stabLater(); return;
  }
  // Drehkörper: Füllung sofort, Kipplauf 0…180° (~100 ms) nach kurzer Ruhe; bis dahin ohne Wasser in der Kippansicht
  G.lakes0 = Core.fillLakes(G.pg, S.fill * 1000).lakes; D.pl = [0, 0]; D.lim = null; // Kennwerte bis zur Neuberechnung „…“
  if (S.theta === 0) { S.lakes = G.lakes0; S.cur = sumMl(S.lakes); } else S.lakes = null;
  runLater(!G.curve);
}
let runT = 0;
function runLater(now) {
  clearTimeout(runT);
  const job = () => {
    if (isPlan()) return;
    const r = Core.tiltRun(G.pg, S.fill * 1000, STEPS);
    G.curve = Array.from(r.ret, v => v / 1000); G.runLakes = r.lakes;
    if (!S.lakes || S.theta > 0) { S.lakes = r.lakes[Math.round(S.theta / 180 * STEPS)]; S.cur = sumMl(S.lakes); }
    drawAll(); stabLater();
  };
  if (now) job(); else runT = setTimeout(job, 120);
}
// Kippwinkel: ~12 ms je Fall in Desktop-Chrome, auf Telefonen ein Mehrfaches → erst nach kurzer Ruhe rechnen
let stabT = 0;
function stabLater() {
  clearTimeout(stabT);
  stabT = setTimeout(() => {
    const V = S.fill * 1000, tip = isPlan() ? (v, xv) => Core.tipAngleG(G.geo, v, G.mv, xv, G.zv, G.rf, G.zst)
      : (v, xv, g = G.pg, rf = G.rf) => Core.tipAngleP(g, v, G.mv, xv, G.zv, rf, G.zst);
    const g = isPlan() ? Core.cogG(G.geo, V, 0, G.mv, G.xv, G.zv) : Core.cogLakes(G.pg, G.lakes0, 0, G.mv, G.xv, G.zv);
    G.stab = { xF: g.x, zF: g.z, mF: g.m, tipE: tip(0, G.xv), tipF: tip(V, G.xv) };
    // Drehkörper mit Tülle/Henkel: auch zur Gegenseite (−x) kippen. Körper symmetrisch → gespiegelt rechnen:
    // Schwerpunkt −x, Überlauf nur über den Rand (Tülle zeigt dann nach oben)
    if (isTube() || isRot() && (hasSpout() || Math.abs(G.xv) > 0.05)) {
      const rfB = isTube() ? G.rfB : G.rf; // Schlauch: eigene hintere Standkante, gespiegelte Form
      G.stab.backE = tip(0, -G.xv, G.pgBack, rfB);
      G.stab.backF = tip(V, -G.xv, G.pgBack, rfB);
    }
    if (S.slosh) sloshStats();
    drawEditor(); drawStats();
  }, 150);
}
function retainedAt(deg) { // Grundriss: Fassungsvermögen bei Neigung (ml), exakt
  const th = deg * DEG;
  return G.geo.vol(G.geo.spill(th), th) / 1000;
}
function curveMinUpTo(deg) {
  const k = Math.round(deg / 180 * STEPS); let m = S.fill;
  for (let i = 0; i <= k; i++) m = Math.min(m, G.curve[i]);
  return Math.min(m, retainedAt(deg));
}
const fillHeight = ml => G.fillH(ml);

// Seen zeichnen: je See Knotenstreifen beider Seiten als Maske, darin die Halbebene y ≤ L und die Spiegellinie.
// T: Gefäßkoordinaten → Bildschirm, th: Neigung
// waves[k] = {s, c} (Schwappen): Spiegel zusätzlich um die Eigenform ausgelenkt
function drawLakes(ctx, T, th, lakes, waves) {
  const g = G.pg, c = Math.cos(th), s = Math.sin(th), wet = new Uint8Array(g.n);
  if (waves) for (const lk of lakes || []) for (const i of lk.nodes) wet[i] = 1;
  (lakes || []).forEach((lk, k) => {
    // Maske: Knoten des Sees; beim Schwappen zusätzlich trockene Knoten im Band des Wellenbergs (sonst oben abgeschnitten)
    let nodes = lk.nodes; const wv = waves && waves[k];
    if (wv && wv.c && Math.abs(wv.s) > 1e-6) {
      const hi = lk.L + Math.abs(wv.s) * wv.c.kap * wv.c.a, u0 = wv.c.uc - wv.c.a, u1 = wv.c.uc + wv.c.a; nodes = lk.nodes.slice();
      for (let i = 0; i < g.n; i++) if (!wet[i]) {
        let y0 = Infinity, y1 = -Infinity, a = Infinity, b = -Infinity;
        for (const pl of g.poly(i)) for (const p of pl) { const y = p.z * c - p.x * s, u = p.x * c + p.z * s; y0 = Math.min(y0, y); y1 = Math.max(y1, y); a = Math.min(a, u); b = Math.max(b, u); }
        if (y0 <= hi && y1 >= lk.L && b >= u0 && a <= u1) nodes.push(i);
      }
    }
    ctx.save(); ctx.beginPath();
    for (const i of nodes) for (const pl of g.poly(i)) {
      const q = pl.map(T); ctx.moveTo(q[0][0], q[0][1]); for (let k = 1; k < q.length; k++) ctx.lineTo(q[k][0], q[k][1]); ctx.closePath();
    }
    ctx.clip(); surfFill(ctx, T, th, lk.L, wv); ctx.restore();
  });
}
// Wasser unter dem Spiegel (Pegel L) in der aktuellen Maske; wv = {s, c}: Auslenkung s·κ·a·Form((u − uc)/a)
function surfFill(ctx, T, th, L, wv) {
  const c = Math.cos(th), s = Math.sin(th), B = 1e4;
  // u entlang des Spiegels (waagrecht), v > 0 = unter dem Spiegel
  const p0 = { x: -L * s, z: L * c }, at = (u, v) => ({ x: p0.x + u * c + v * s, z: p0.z + u * s - v * c });
  let line = [at(-B, 0), at(B, 0)];
  if (wv && wv.c && Math.abs(wv.s) > 1e-6) {
    const { a, uc, kap } = wv.c, r = isPlan() ? false : true, eta = u => wv.s * kap * a * Core.modeShape(r, (u - uc) / a);
    line = [at(-B, -eta(uc - a))]; for (let k = 0; k <= 48; k++) { const u = uc - a + 2 * a * k / 48; line.push(at(u, -eta(u))); } line.push(at(B, -eta(uc + a)));
  }
  polyPath(ctx, [...line, at(B, B), at(-B, B)], T); ctx.closePath(); ctx.fillStyle = css('--water-a'); ctx.fill();
  polyPath(ctx, line, T); ctx.strokeStyle = css('--water'); ctx.lineWidth = 2; ctx.stroke();
}

// ---------- editor ----------
const ed = $('ed');
let V = null; // editor view {s, ox, oy}
// Fotovorlage zum Nachzeichnen: nur Anzeige, nicht in Export/Link/Rückgängig. x = Mitte, z = Unterkante, w = Breite [mm]
let PH = null;
const phBox = () => ({ x0: PH.x - PH.w / 2, x1: PH.x + PH.w / 2, z0: PH.z, z1: PH.z + PH.w * PH.ar });
function fitView() {
  fitGeo();
  if (!V || !PH || !PH.show) return;
  const r = ed.getBoundingClientRect(), a = s2w(0, r.height), b = s2w(r.width, 0), p = phBox(), m = 10 / V.s;
  const x0 = Math.min(a.x, p.x0 - m), x1 = Math.max(b.x, p.x1 + m), z0 = Math.min(a.z, p.z0 - m), z1 = Math.max(b.z, p.z1 + m);
  const sc = Math.min(r.width / (x1 - x0), r.height / (z1 - z0));
  V = { s: sc, ox: r.width / 2 - (x0 + x1) / 2 * sc, oy: r.height / 2 + (z0 + z1) / 2 * sc };
}
function fitGeo() {
  const r = ed.getBoundingClientRect(); if (!r.width) return; zoomed = false;
  if (isPlan()) {
    const s = S.psmooth ? Core.closedSmooth(S.plan) : S.plan;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    s.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.z); y1 = Math.max(y1, p.z); });
    const sc = Math.min(r.width / (x1 - x0 + 70), r.height / (y1 - y0 + 70));
    V = { s: sc, ox: r.width / 2 - (x0 + x1) / 2 * sc, oy: r.height / 2 + (y0 + y1) / 2 * sc };
    return;
  }
  if (isTube()) {
    const s = S.tA.concat(S.tB, G.A || [], G.B || []);
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity; s.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); });
    const sc = Math.min(r.width / (x1 - x0 + 110), r.height / (z1 - z0 + 60));
    V = { s: sc, ox: r.width / 2 - (x0 + x1) / 2 * sc, oy: r.height / 2 + (z0 + z1) / 2 * sc };
    return;
  }
  const s = Core.sampled(S.pts, S.smooth).concat(S.spout ? S.spout.p : [], S.handle ? S.handle.p : []);
  let mx = 30, zmin = 0, zmax = 60;
  s.forEach(p => { mx = Math.max(mx, Math.abs(p.x)); zmin = Math.min(zmin, p.z); zmax = Math.max(zmax, p.z); });
  const wW = 2 * (mx + 45), wH = (zmax - zmin) + 50;
  const sc = Math.min(r.width / wW, r.height / wH);
  V = { s: sc, ox: r.width / 2, oy: r.height / 2 + ((zmax + zmin) / 2) * sc };
}
const w2s = p => [V.ox + p.x * V.s, V.oy - p.z * V.s];
const s2w = (x, y) => ({ x: (x - V.ox) / V.s, z: (V.oy - y) / V.s });

let stroke = null, drag = -1, lastTap = { t: 0, i: -1 }, hov = null; // hov: Zeiger über Punkt {i} bzw. Einfügestelle {p} (nur Maus)
function drawEditor() {
  if (!V) fitView();
  const { ctx, w, h } = prep(ed);
  if (PH && PH.show) { const p = phBox(), [sx, sy] = w2s({ x: p.x0, z: p.z1 }); ctx.globalAlpha = PH.op; ctx.drawImage(PH.img, sx, sy, PH.w * V.s, PH.w * PH.ar * V.s); ctx.globalAlpha = 1; }
  // Punktraster (Styleguide § 7)
  const fDot = dpDots(ctx, w, h, V.s, V.ox, V.oy);
  ctx.font = DP_CFONT; ctx.fillStyle = css('--ink2'); ctx.textAlign = 'right';
  ctx.fillText('1 Punkt = ' + nf0.format(fDot) + ' mm', w - 6, h - 6); ctx.textAlign = 'left';
  if (isPlan()) drawPlan(ctx, w, h); else if (isTube()) drawTube(ctx, w, h); else drawProfile(ctx, w, h);
  if (stroke) {
    ctx.strokeStyle = css('--ctl'); ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    polyPath(ctx, stroke, w2s); ctx.stroke();
    if (mirror()) { polyPath(ctx, stroke.map(p => ({ x: -p.x, z: p.z })), w2s); ctx.globalAlpha = .4; ctx.stroke(); ctx.globalAlpha = 1; }
  }
  touchUi(ctx);
}
// Tülle (Rohr), Henkel (Stab) und Deckel; T = Abbildung Gefäß → Bildschirm, sc = Pixel je mm
function drawParts(ctx, T, sc) {
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (S.handle && S.handle.p.length >= 2) { ctx.strokeStyle = css('--ink'); ctx.lineWidth = Math.max(2, S.handle.d * sc); polyPath(ctx, S.handle.p, T); ctx.stroke(); }
  if (S.spout && S.spout.p.length >= 2) {
    ctx.strokeStyle = css('--ink'); ctx.lineWidth = Math.max(3, (S.spout.d + 2 * S.t) * sc); polyPath(ctx, S.spout.p, T); ctx.stroke();
    ctx.strokeStyle = css('--bg'); ctx.lineWidth = Math.max(1, S.spout.d * sc); ctx.stroke();
  }
  if (S.lid && G.samp) { const r = G.samp[G.samp.length - 1].x; ctx.strokeStyle = css('--ink'); ctx.lineWidth = 3; polyPath(ctx, [{ x: -r, z: G.ztop }, { x: r, z: G.ztop }], T); ctx.stroke(); }
}
function drawPoints(ctx, closed) {
  $('ptDel').disabled = !(S.mode === 'edit' && S.sel >= 0 && P().length > minPts());
  if (S.mode !== 'edit') return;
  const pts = P();
  if (isPlan() ? S.psmooth : isTube() ? S.tsmooth : mirror() && S.smooth) { ctx.strokeStyle = css('--mut'); ctx.lineWidth = 1; polyPath(ctx, pts, w2s); if (closed) ctx.closePath(); ctx.stroke(); }
  pts.forEach((p, i) => {
    const [sx, sy] = w2s(p);
    const a = i === S.sel ? 5 : 4; ctx.beginPath(); ctx.rect(Math.round(sx) - a, Math.round(sy) - a, 2 * a, 2 * a);
    ctx.fillStyle = i === S.sel ? css('--ctl') : css('--bg'); ctx.fill();
    if (i !== S.sel) { ctx.strokeStyle = css('--ink'); ctx.lineWidth = hov && hov.i === i ? 2.5 : 1.5; ctx.stroke(); }
  });
  if (hov && hov.p) { const [sx, sy] = w2s(hov.p); ctx.beginPath(); ctx.arc(sx, sy, 4, 0, 2 * Math.PI); ctx.strokeStyle = css('--ink'); ctx.lineWidth = 1.5; ctx.stroke(); }
}
function drawPlan(ctx, w, h) {
  if (!G.planS || stroke) return;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  polyPath(ctx, G.planS, w2s); ctx.closePath(); ctx.fillStyle = css('--water-a'); ctx.fill();
  ctx.strokeStyle = css('--ink'); ctx.lineWidth = 2.5; ctx.stroke();
  drawPoints(ctx, true);
  // Kipprichtung: Pfeil von der Mitte zur Seite, die beim Kippen absinkt
  const c = Math.cos(S.psi * DEG), s = Math.sin(S.psi * DEG);
  let cx = 0, cy = 0; G.planS.forEach(p => { cx += p.x; cy += p.z; }); cx /= G.planS.length; cy /= G.planS.length;
  const L = G.maxR + 18, [ax, ay] = w2s({ x: cx, z: cy }), [bx, by] = w2s({ x: cx + c * L, z: cy + s * L });
  ctx.strokeStyle = css('--mut'); ctx.fillStyle = css('--mut'); ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]);
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
  const ux = (bx - ax) / Math.hypot(bx - ax, by - ay), uy = (by - ay) / Math.hypot(bx - ax, by - ay);
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - 9 * ux - 5 * uy, by - 9 * uy + 5 * ux); ctx.lineTo(bx - 9 * ux + 5 * uy, by - 9 * uy - 5 * ux); ctx.fill();
  ctx.font = DP_CFONT; ctx.fillText('kippt', bx + 6, by - 6);
  ctx.fillText(nf0.format(G.L) + ' × ' + nf0.format(G.B) + ' mm innen · H ' + nf0.format(G.H) + ' mm', 8, h - 8);
}
function drawProfile(ctx, w, h) {
  // axis
  ctx.setLineDash([3, 4]); ctx.strokeStyle = css('--mut'); ctx.lineWidth = 1; ctx.beginPath();
  ctx.moveTo(V.ox + .5, 0); ctx.lineTo(V.ox + .5, h); ctx.stroke(); ctx.setLineDash([]);
  if (!G.samp || stroke) return;
  drawLakes(ctx, w2s, 0, G.lakes0); // Füllung aufrecht
  // calibration marks
  if (S.marks && G.cap > 0) {
    const step = niceStep(G.cap / 6);
    ctx.font = DP_CFONT; ctx.fillStyle = css('--ink2'); ctx.strokeStyle = css('--ink'); ctx.lineWidth = 1;
    let yLast = Infinity;
    for (let v = step; v <= G.cap + 1e-6; v += step) {
      const z = fillHeight(v), iv = Core.intervalsAt(G.poly, z);
      if (Math.abs(w2s({ x: 0, z })[1] - yLast) < 12) continue; // Spiegel steht still, während eine Nachbartasche vollläuft
      yLast = w2s({ x: 0, z })[1];
      if (!iv.length) continue;
      const r = iv[G.multi0 ? 0 : iv.length - 1][1]; // mehrere Becken: Strich am Becken unter der Öffnung
      const [sx, sy] = w2s({ x: r, z });
      ctx.beginPath(); ctx.moveTo(sx - 10, sy + .5); ctx.lineTo(sx, sy + .5); ctx.stroke();
      ctx.fillText(nf0.format(v) + ' ml', sx + 7, sy + 4);
    }
  }
  // walls
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = css('--mut'); ctx.lineWidth = 2.5;
  polyPath(ctx, G.wall.map(p => ({ x: -p.x, z: p.z })), w2s); ctx.stroke();
  ctx.strokeStyle = css('--ink'); ctx.lineWidth = 2.5;
  polyPath(ctx, G.wall, w2s); ctx.stroke();
  drawParts(ctx, w2s, V.s);
  drawPoints(ctx, false);
  // stand plane and centre of gravity (filled, upright)
  ctx.strokeStyle = css('--mut'); ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
  polyPath(ctx, [{ x: -G.rf, z: G.zst }, { x: G.rf, z: G.zst }], w2s); ctx.stroke(); ctx.setLineDash([]);
  if (G.stab) cross(ctx, w2s({ x: G.stab.xF, z: G.stab.zF }), css('--ink'), 'S');
  // dims
  ctx.fillStyle = css('--ink2'); ctx.font = DP_CFONT;
  const top = G.samp[G.samp.length - 1];
  const [, ry] = w2s({ x: top.x, z: top.z });
  ctx.fillText('Ø ' + nf0.format(2 * top.x) + ' mm', V.ox - 26, ry - 8);
  const [, by] = w2s({ x: 0, z: G.sl.zmin });
  ctx.fillText('H ' + nf0.format(G.H) + ' mm', 8, by - 6);
}

function drawTube(ctx, w, h) {
  if (!G.As || stroke) return;
  drawLakes(ctx, w2s, 0, G.lakes0);
  // Querschnitte (Kreise von der Seite = Durchmesserlinien)
  ctx.strokeStyle = css('--mut'); ctx.lineWidth = 1;
  for (let k = 0; k < G.As.length; k += 25) { polyPath(ctx, [G.As[k], G.Bs[k]], w2s); ctx.stroke(); }
  // Eichstriche an der vorderen Kontur (äußerster Schnitt der Umrisslinie mit dem Spiegel)
  if (S.marks && G.cap > 0) {
    const step = niceStep(G.cap / 6); let yLast = Infinity;
    ctx.font = DP_CFONT; ctx.fillStyle = css('--ink2'); ctx.strokeStyle = css('--ink');
    for (let v = step; v <= G.cap + 1e-6; v += step) {
      const z = fillHeight(v), sy0 = w2s({ x: 0, z })[1]; if (Math.abs(sy0 - yLast) < 12) continue;
      let xr = -Infinity; const o = G.outline;
      for (let i = 0; i < o.length; i++) { const a = o[i], b = o[(i + 1) % o.length]; if ((a.z <= z) !== (b.z <= z)) xr = Math.max(xr, a.x + (z - a.z) * (b.x - a.x) / (b.z - a.z)); }
      if (!isFinite(xr)) continue; yLast = sy0;
      const [sx, sy] = w2s({ x: xr, z }); ctx.beginPath(); ctx.moveTo(sx - 10, sy + .5); ctx.lineTo(sx, sy + .5); ctx.stroke(); ctx.fillText(nf0.format(v) + ' ml', sx + 7, sy + 4);
    }
  }
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 2.5;
  ctx.strokeStyle = css('--mut'); polyPath(ctx, [G.A[0], G.B[0]], w2s); ctx.stroke(); // Boden
  [[G.A, 'A'], [G.B, 'B']].forEach(([c, k]) => { ctx.strokeStyle = css(k === S.tPart ? '--ink' : '--mut'); polyPath(ctx, c, w2s); ctx.stroke(); });
  drawPoints(ctx, false);
  if (G.flat) { ctx.strokeStyle = css('--mut'); ctx.lineWidth = 1; ctx.setLineDash([3, 4]); polyPath(ctx, [{ x: -G.rfB, z: G.zst }, { x: G.rf, z: G.zst }], w2s); ctx.stroke(); ctx.setLineDash([]); }
  if (G.stab) cross(ctx, w2s({ x: G.stab.xF, z: G.stab.zF }), css('--ink'), 'S');
  ctx.fillStyle = css('--ink2'); ctx.font = DP_CFONT;
  const [bx, by] = w2s(G.B[G.B.length - 1]); ctx.fillText('vorne', bx + 8, by + 4);
  const [ax, ay] = w2s(G.A[G.A.length - 1]); ctx.textAlign = 'right'; ctx.fillText('hinten', ax - 8, ay + 4); ctx.textAlign = 'left';
}
function cross(ctx, [x, y], col, label) {
  ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath();
  ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.stroke();
  ctx.fillStyle = css('--ink2'); ctx.font = DP_CFONT; ctx.fillText(label, x + 6, y - 6);
}
function snapP(p) {
  const g = S.snap; let x = mirror() ? Math.max(0, Math.abs(p.x)) : p.x, z = p.z;
  if (g) { x = Math.round(x / g) * g; z = Math.round(z / g) * g; }
  return { x, z };
}
const snap = () => JSON.stringify([S.kind, S.part, S.pts, S.plan, S.spout, S.handle, S.lid, S.H, S.psi, S.psmooth, S.smooth, S.tA, S.tB, S.tsmooth, S.tPart]);
function pushUndo(sn) { S.undo.push(sn || snap()); if (S.undo.length > 100) S.undo.shift(); }
let pend = null; // Schnappschuss beim Antippen; erst beim ersten Verschieben als Rückgängig-Schritt
function evPos(e) { const r = ed.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
function hitPoint(sx, sy) {
  let best = -1, bd = DP_HIT;
  P().forEach((p, i) => {
    for (const sg of mirror() ? [1, -1] : [1]) { const [px, py] = w2s({ x: sg * p.x, z: p.z }); const d = Math.hypot(px - sx, py - sy); if (d < bd) { bd = d; best = i; } }
  });
  return best;
}
function hitSegment(wp, any) { // any: nächstes Segment ohne Abstandsgrenze (Grundriss: neue Punkte immer einfügen)
  const pts = P(), n = pts.length, q = mirror() ? { x: Math.abs(wp.x), z: wp.z } : wp;
  let best = -1, bd = any ? Infinity : (DP_HIT - 4) / V.s;
  for (let i = 0; i < (isPlan() ? n : n - 1); i++) { const d = Core.distSeg(q, pts[i], pts[(i + 1) % n]); if (d < bd) { bd = d; best = i; } }
  return best;
}

// Finger (docs/mobil-editor.md): ins Leere wischen scrollt die Seite, zwei Finger zoomen/verschieben, Lupe beim Ziehen, Kontextleiste an der Auswahl
let zoomed = false, tpos = null; const ctxBar = dpCtxBar(ed);
dpTouchGuard(ed, () => drag >= 0 || !!stroke);
dpPinch(ed, () => { stroke = null; if (drag >= 0) { if (!pend) undo(); drag = -1; pend = null; } }, // Ein-Finger-Schritt zurücknehmen
  (f, cx, cy, dx, dy) => { V = { s: V.s * f, ox: cx - (cx - V.ox) * f + dx, oy: cy - (cy - V.oy) * f + dy }; zoomed = true; drawEditor(); });
ed.addEventListener('pointerdown', e => { tpos = e.pointerType === 'touch' ? evPos(e) : null; }, true);
ed.addEventListener('pointermove', e => { if (tpos) tpos = evPos(e); }, true);
function touchUi(ctx) {
  if (tpos && (drag >= 0 || stroke)) dpLoupe(ctx, ...tpos);
  if (S.mode === 'edit' && S.sel >= 0 && drag < 0 && !stroke && P()[S.sel] && P().length > minPts()) ctxBar.show(...w2s(P()[S.sel]), [['close', 'Löschen', delSel]]); else ctxBar.hide();
}
ed.addEventListener('pointerdown', e => {
  ed.setPointerCapture(e.pointerId);
  const [sx, sy] = evPos(e), wp = s2w(sx, sy);
  if (S.mode === 'draw') { stroke = [mirror() ? { x: Math.abs(wp.x), z: wp.z } : wp]; drawEditor(); return; }
  let i = hitPoint(sx, sy);
  const now = performance.now(), pts = P();
  if (i >= 0 && lastTap.i === i && now - lastTap.t < 350) {
    S.sel = i; delSel();
    lastTap = { t: 0, i: -1 }; return;
  }
  lastTap = { t: now, i };
  pend = snap();
  if (i < 0) { // auf der Linie einfügen; ins Leere nur anhängen, solange die Kontur noch unvollständig ist, sonst Auswahl aufheben
    const sgi = hitSegment(wp, false);
    if (sgi < 0 && pts.length >= minPts()) { pend = null; S.sel = -1; drawEditor(); return; }
    pushUndo(pend); pend = null;
    if (sgi >= 0) { pts.splice(sgi + 1, 0, snapP(wp)); i = sgi + 1; }
    else { pts.push(snapP(wp)); i = pts.length - 1; }
    changed();
  }
  drag = i; S.sel = i; hov = null; ed.style.cursor = S.mode === 'edit' ? 'grabbing' : 'crosshair'; drawEditor();
});
// Rückmeldung beim Überfahren (Maus): Cursor und Hervorhebung zeigen, was ein Klick tut
function hover(sx, sy, wp) {
  let h = null, c = 'crosshair';
  if (S.mode === 'edit') { const i = hitPoint(sx, sy);
    if (i >= 0) { h = { i }; c = 'grab'; }
    else { const q = snapP(wp), on = hitSegment(wp, false) >= 0; h = on ? { p: mirror() && wp.x < 0 ? { x: -q.x, z: q.z } : q } : null; c = on || P().length < minPts() ? 'copy' : 'default'; } }
  ed.style.cursor = c;
  if (JSON.stringify(h) !== JSON.stringify(hov)) { hov = h; drawEditor(); }
}
ed.addEventListener('pointerleave', () => { if (hov && drag < 0) { hov = null; drawEditor(); } });
ed.addEventListener('pointermove', e => {
  const [sx, sy] = evPos(e), wp = s2w(sx, sy);
  if (e.pointerType === 'mouse' && !stroke && drag < 0) return hover(sx, sy, wp);
  if (stroke) {
    const q = mirror() ? { x: Math.abs(wp.x), z: wp.z } : wp, l = stroke[stroke.length - 1];
    if (Math.hypot(q.x - l.x, q.z - l.z) > 0.8) { stroke.push(q); drawEditor(); }
  } else if (drag >= 0) {
    const q = snapP(wp), o = P()[drag]; if (q.x === o.x && q.z === o.z) return;
    if (pend) { pushUndo(pend); pend = null; }
    P()[drag] = q; changed(true);
  }
});
function endPointer() {
  if (stroke) {
    if (stroke.length > 3) {
      let p;
      if (isPlan()) { // geschlossen: Strich zum Anfang schließen, Endpunkt = Anfangspunkt weglassen
        p = Core.rdp(stroke.concat([stroke[0]]), 1.2).slice(0, -1);
      } else if (isTube()) { // Kontur hinten/vorne: offene Linie vom Boden zur Mündung
        p = Core.rdp(stroke, 1.2);
        if (p[0].z > p[p.length - 1].z) p.reverse();
      } else if (!mirror()) { // Tülle/Henkel: offene Linie; Tülle beginnt am achsnahen Ende (Ansatz)
        p = Core.rdp(stroke, 1.2);
        if (S.part === 'spout' && Math.abs(p[0].x) > Math.abs(p[p.length - 1].x)) p.reverse();
      } else {
        p = Core.rdp(stroke, 1.2);
        if (p[0].z > p[p.length - 1].z) p.reverse();
        if (p[0].x < 6) p[0].x = 0;
        // Freihand-Boden ist nie exakt waagrecht: flaches erstes Stück vom Achsenpunkt aus ebnen
        if (p.length > 2 && p[0].x === 0 && Math.abs(p[1].z - p[0].z) < Math.max(2, 0.1 * p[1].x)) p[0].z = p[1].z = Math.min(p[0].z, p[1].z);
      }
      if (mirror() || isPlan() ? Core.selfCross(p, isPlan()) : false) flash('⚠ Kontur kreuzt sich selbst – nicht übernommen. Bitte ohne Überkreuzen zeichnen.');
      else if (p.length >= minPts()) { pushUndo(); setP(p.map(q => ({ x: +q.x.toFixed(1), z: +q.z.toFixed(1) }))); if (isTube() && S.tPart === 'A') setTPart('B'); } // nach „hinten“ gleich „vorne“
      setMode('edit');
    }
    stroke = null; changed(); fitView(); drawAll();
  }
  if (drag >= 0) { drag = -1; pend = null; ed.style.cursor = 'grab'; if (dirty) changed(); const r = ed.getBoundingClientRect();
    if (!zoomed && P().some(p => { const [x, y] = w2s(p); return x < 10 || x > r.width - 10 || y < 10 || y > r.height - 10; })) { fitView(); drawAll(); } else drawEditor(); }
}
ed.addEventListener('pointerup', endPointer);
ed.addEventListener('pointercancel', endPointer);

window.addEventListener('keydown', e => {
  if (dpUndoKey(e)) { e.preventDefault(); undo(); }
  else if ((e.key === 'Delete' || e.key === 'Backspace') && !dpEditing()) delSel();
});
// ausgewählten Punkt löschen (Knopf „Punkt löschen“, Entf, Doppeltipp)
function delSel() { if (S.sel < 0 || P().length <= minPts()) return; pushUndo(); P().splice(S.sel, 1); S.sel = -1; changed(); }
$('ptDel').onclick = delSel;
function undo() {
  if (!S.undo.length) return;
  const [k, part, pts, plan, spout, handle, lid = S.lid, H = S.H, psi = S.psi, psmooth = S.psmooth, smooth = S.smooth,
    tA = S.tA, tB = S.tB, tsmooth = S.tsmooth, tPart = S.tPart] = JSON.parse(S.undo.pop());
  Object.assign(S, { pts, plan, spout, handle, lid, H, psi, psmooth, smooth, tA, tB, tsmooth, tPart });
  setKind(k, true); setPart(part); S.sel = -1; changed();
}

// kurze Meldung unter dem Editor, danach wieder die Bedienhinweise
let flashT = 0, noteTxt = '';
function flash(t) { clearTimeout(flashT); $('edNote').textContent = t; $('edNote').style.color = 'var(--warn)';
  flashT = setTimeout(() => { $('edNote').textContent = noteTxt; $('edNote').style.color = ''; }, 4000); }
// later: Ziehen/Regler – höchstens eine Neuberechnung je Bild (bei mehreren Becken bzw. zwei Konturen 10–80 ms)
let linkT = 0; // verzögert: Safari erlaubt nur ~100 replaceState je 30 s
function linkLater() { clearTimeout(linkT); linkT = setTimeout(() => dpHashSet('g', linkObj()), 400); }
let raf = 0, dirty = false;
function changed(later) {
  linkLater();
  if (later) dirty = true; else { dirty = false; recompute(); }
  if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (dirty) { dirty = false; recompute(); } drawAll(); });
}

// ---------- tilt view ----------
const tv = $('tv');
function drawTilt() {
  const { ctx, w, h } = prep(tv);
  if (!G.geo) return;
  const th = S.theta * DEG, c = Math.cos(th), s = Math.sin(th);
  const zc = G.z0 + G.H / 2, xc = G.xc;
  let R = 1; G.walls.flat().concat(!isRot() ? [] : [...(S.spout ? S.spout.p : []), ...(S.handle ? S.handle.p : [])]).forEach(p => R = Math.max(R, Math.hypot(p.x - xc, p.z - zc)));
  const sc = 0.40 * Math.min(w, h) / R, cy = h * 0.46;
  D.sc = sc; D.w = w; const cx = w / 2 + (S.slosh ? (D.stop ? D.Xd : D.X) : 0) * sc; // Schwappen: Gefäß waagrecht verschoben (beim Anhalten folgt die Ansicht)
  const T = p => { const X = (p.x - xc) * c + (p.z - zc) * s, Y = -(p.x - xc) * s + (p.z - zc) * c; return [cx + X * sc, cy - Y * sc]; };

  // horizon reference
  ctx.strokeStyle = css('--mut'); ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke(); ctx.setLineDash([]);
  ctx.font = DP_CFONT; ctx.fillStyle = css('--ink2'); ctx.textAlign = 'right'; ctx.fillText('Waagrechte durch den Drehpunkt', w - 6, cy - 6); ctx.textAlign = 'left';

  // liquid
  let L = null;
  if (!isPlan()) drawLakes(ctx, T, th, S.lakes, S.slosh && D.lk === S.lakes ? S.lakes.map((lk, k) => ({ s: D.sts[k][0], c: coefOf(lk, th) })) : null);
  else if (S.slosh && S.cur > 0.05) {
    const cf = coefPlan(th, S.cur * 1000);
    if (cf) { ctx.save(); polyPath(ctx, G.sec, T); ctx.closePath(); ctx.clip(); surfFill(ctx, T, th, cf.L, { s: D.pl[0], c: cf }); ctx.restore(); }
  } else if (S.cur > 0.05) {
    const [lo, hi] = G.geo.yr(th);
    L = Core.solveLG(G.geo, S.cur * 1000, th, lo, hi);
    const liq = Core.clip(G.sec, p => p.z * c - p.x * s - L);
    if (liq.length > 2) {
      polyPath(ctx, liq, T); ctx.closePath(); ctx.fillStyle = css('--water-a'); ctx.fill();
      // surface line
      const surf = liq.filter(p => Math.abs(p.z * c - p.x * s - L) < 1e-6 * Math.max(1, R));
      if (surf.length >= 2) {
        const sp = surf.map(T).sort((a, b) => a[0] - b[0]);
        ctx.strokeStyle = css('--water'); ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(sp[0][0], sp[0][1]); ctx.lineTo(sp[sp.length - 1][0], sp[sp.length - 1][1]); ctx.stroke();
      }
    }
  }
  // pour stream
  const pouring = (S.theta > 0 || S.slosh) && performance.now() - S.lastPour < 450 && S.cur > 0.05;
  if (pouring) {
    // Schwappen zur −u-Seite: Strahl an der Gegenseite (Drehkörper gespiegelte Lippe, Grundriss xmin, Schlauch tiefere Mündung)
    const sd = S.slosh && D.side < 0 ? -1 : 1, lp = G.lipAt(th + (sd < 0 ? -0.5 : 0));
    const [x0, y0] = T(sd > 0 || isTube() ? lp : isPlan() ? { x: G.geo.xmin, z: lp.z } : { x: -lp.x, z: lp.z });
    // seitlich mindestens bis außerhalb der Kontur unterhalb der Ausgussstelle, dann fallen
    let xr = x0; G.walls.flat().concat(!isRot() ? [] : [...(S.spout ? S.spout.p : []), ...(S.handle ? S.handle.p : [])])
      .forEach(p => { const [x, y] = T(p); if (y > y0 + 1) xr = sd > 0 ? Math.max(xr, x) : Math.min(xr, x); });
    const dx = Math.max(15 + 45 * Math.sqrt(Math.max(0, Math.sin(Math.abs(th)))), sd * (xr - x0) + 8);
    ctx.strokeStyle = css('--water'); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0);
    for (let u = 0; u <= 1.0001; u += 0.025) ctx.lineTo(x0 + sd * dx * Math.sqrt(u), y0 + (h - y0) * u * u);
    ctx.stroke();
  }
  // walls
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = css('--ink'); ctx.lineWidth = 3;
  G.walls.forEach(wl => { polyPath(ctx, wl, T); ctx.stroke(); });
  if (isRot()) drawParts(ctx, T, sc);
  // centre of gravity with plumb line; beyond the stand edge (+x side) the vessel would tip
  let tips = false;
  if (S.theta <= 90 && standOk() && (isPlan() || S.lakes)) {
    const g = isPlan() ? Core.cogG(G.geo, S.cur * 1000, th, G.mv, G.xv, G.zv) : Core.cogLakes(G.pg, S.lakes, th, G.mv, G.xv, G.zv);
    tips = Core.tipMargin(g, th, G.rf, G.zst) >= 0;
    const [gx, gy] = T(g), [ex, ey] = T({ x: G.rf, z: G.zst });
    ctx.strokeStyle = css(tips ? '--warn' : '--mut'); ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, Math.max(gy, ey) + 12); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(ex, ey, 3, 0, 7); ctx.fillStyle = css('--mut'); ctx.fill();
    cross(ctx, [gx, gy], css('--ink'), 'S');
  }
  // labels
  ctx.fillStyle = css('--ink'); ctx.font = '700 18px ' + DP_CFONT.slice(5);
  ctx.fillText(nf1.format(S.theta) + '°', 12, 22);
  ctx.font = DP_CFONT; ctx.fillStyle = css('--ink2');
  ctx.fillText(isPlan() || S.lakes ? nf0.format(S.cur) + ' ml im Gefäß' + (S.lakes && S.lakes.length > 1 ? ' · ' + S.lakes.length + ' Wasserkörper' : '') : 'rechnet …', 12, 40);
  ctx.fillText('↓ g', w - 30, 22);
  if (S.slosh && (D.walk || D.stop)) { ctx.textAlign = 'right'; ctx.fillText(D.walk ? 'Gehen ' + nf1.format(S.wf) + ' Hz' : 'Anhalten', w - 12, 40); ctx.textAlign = 'left'; }
  ctx.fillStyle = css('--warn');
  if (tips) ctx.fillText('⚠ kippt, wenn abgestellt', 12, 58);
  if (G.bad) ctx.fillText('⚠ ' + G.bad.split(':')[0], 12, tips ? 76 : 58);
  if (S.slosh && D.big) ctx.fillText('⚠ große Wellen: nur qualitativ', 12, 58 + (tips ? 18 : 0) + (G.bad ? 18 : 0));
}

// ---------- charts ----------
function drawCharts() {
  if (!G.geo || !G.curve) return;
  const N = 120, fc = [];
  for (let i = 0; i <= N; i++) { const v = G.cap * i / N; fc.push([v, fillHeight(v) - G.z0]); }
  const F = REF && !REF.pending ? REF : null, gst = { color: css('--mut'), width: 1.5 }, gl = F ? [{ t: 'gemerkt', ...gst }] : [];
  chart($('c1'), { x0: 0, x1: Math.max(1, G.cap, F ? F.cap : 0), y0: 0, y1: Math.max(1, G.H, F ? F.H : 0), xl: 'Volumen [ml]', yl: 'Füllhöhe [mm]', legend: gl,
    series: [...(F ? [{ pts: F.fc, ...gst }] : []), { pts: fc, color: css('--ink') }], points: [[S.fill, fillHeight(S.fill) - G.z0, css('--water')]] });
  const kc = [], pc = [];
  for (let k = 0; k <= STEPS; k++) { kc.push([180 * k / STEPS, G.curve[k]]); pc.push([180 * k / STEPS, S.fill - G.curve[k]]); }
  chart($('c2'), { x0: 0, x1: 180, xs: 30, y0: 0, y1: Math.max(1, S.fill, F ? F.fill : 0), xl: 'Neigung [°]', yl: 'Volumen [ml]', legend: [{ t: 'im Gefäß', color: css('--water') }, { t: 'ausgegossen', color: css('--mut'), width: 1.5, dash: [5, 4] }, ...gl],
    series: [...(F ? [{ pts: F.kc, ...gst }] : []), { pts: kc, color: css('--water'), fill: css('--water-a') }, { pts: pc, color: css('--mut'), width: 1.5, dash: [5, 4] }],
    vlines: [{ x: S.theta, color: css('--ink') }], points: [[S.theta, S.cur, css('--ink')]] });
}

// ---------- stats ----------
// Standfläche bekannt: flacher Boden; nur im Drehkörper ersatzweise ein von Hand gesetzter Standradius
const standOk = () => G.flat || isRot() && S.foot != null;
const hasSpout = () => isRot() && !!S.spout && S.spout.p.length >= 2, hasHandle = () => isRot() && !!S.handle && S.handle.p.length >= 2;
function capItem() {
  const v = nf0.format(G.cap) + ' ml';
  // Spitze tiefer als Rand: mit Deckel üblich (Spitze = Füllgrenze), offen läuft die Tülle beim Befüllen über
  if (hasSpout() && G.cap < G.capRim - 1) return S.lid ? ['Fassungsvermögen', v, 'bis Tüllenspitze · Rand ' + nf0.format(G.capRim) + ' ml']
    : ['Fassungsvermögen', '⚠ ' + v, 'Tülle tiefer als Rand: läuft beim Befüllen über · Rand ' + nf0.format(G.capRim) + ' ml', true];
  if (hasSpout()) return ['Fassungsvermögen', v, 'bis Rand · Tülle reicht höher'];
  return ['Fassungsvermögen', v, S.lid && isRot() ? 'bis Rand · Deckel zu, keine Tülle' : isTube() ? 'bis zum tiefsten Punkt der Mündung' : 'bis Rand'];
}
// Kippwinkel/Umstoßkraft: ungünstigere Richtung; Drehkörper mit Tülle/Henkel zur Tülle (+x) und zur Gegenseite (−x)
const minDir = (a, b) => a == null ? [b, 1] : b == null || a <= b ? [a, 0] : [b, 1];
function tipItem(deg) {
  const st = G.stab; if (!st) return ['Kippwinkel', '…', ''];
  if (!('backF' in st)) return ['Kippwinkel', deg(st.tipF), 'gefüllt · leer ' + deg(st.tipE)];
  const [f, df] = minDir(st.tipF, st.backF), [e, de] = minDir(st.tipE, st.backE),
    side = d => isTube() ? (d ? 'nach hinten' : 'nach vorne') : d ? 'zur Gegenseite' : (hasSpout() ? 'zur Tülle' : 'nach +x');
  return ['Kippwinkel', deg(f), 'gefüllt ' + side(df) + ' · leer ' + deg(e) + ' ' + side(de)];
}
function pushN() {
  const st = G.stab; if (!standOk() || !st) return null;
  const a = isPlan() ? G.rf - st.xF : isTube() ? Math.min(G.rf - st.xF, G.rfB + st.xF) : G.rf - Math.abs(st.xF);
  return Core.pushForce(st.mF, a, G.hRim);
}
// kleinster Kippwinkel über gefüllt/leer und beide Richtungen [°] oder null
function tipMin() {
  const st = G.stab; if (!standOk() || !st) return null;
  const v = [st.tipF, st.tipE, st.backF, st.backE].filter(x => x != null && isFinite(x)); return v.length ? Math.min(...v) : null;
}
// Urteil in Designsprache aus den Kennzahlen k (siehe keyVals)
function verdict(k) {
  const c = [], w = [];
  if (k.bad) c.push('Geometrie prüfen: ' + k.bad);
  if (k.spillFill) c.push('läuft beim Befüllen über die Tülle über (Tülle tiefer als Rand)');
  if (!k.stand) w.push(k.tube ? 'steht nicht stabil: Boden nicht waagrecht' : 'steht nicht stabil: kein flacher Boden');
  else if (k.tip != null && k.tip < 10) c.push(`kippt leicht um: schon bei ${nf0.format(k.tip)}° Schräglage`);
  else if (k.tip != null && k.tip < 15) w.push(`kippt recht leicht: bei ${nf0.format(k.tip)}° Schräglage`);
  if (k.sloshOver) w.push('schwappt beim ' + k.sloshOver + ' über');
  const t = a => a.join(' · ').replace(/^./, x => x.toUpperCase());
  if (c.length) return [2, t(c.concat(w))]; if (w.length) return [1, t(w)];
  return [0, `Fasst ${nf0.format(k.cap)} ml, ${k.tip != null ? 'steht sicher (kippt erst bei ' + nf0.format(k.tip) + '°)' : 'steht'}${k.start != null ? ', gießt ab ' + nf0.format(k.start) + '° aus' : ''}`];
}
function pushItem() {
  if (!standOk()) return ['Umstoßkraft', '–', ''];
  const st = G.stab; if (!st) return ['Umstoßkraft', '…', ''];
  // Drehkörper: runde Standfläche, schwächste Richtung = vom Schwerpunkt weg (Arm rf − |x|); Grundriss: in Kipprichtung
  // Schlauch: kleinerer Arm von vorderer bzw. hinterer Standkante
  const a = isPlan() ? G.rf - st.xF : isTube() ? Math.min(G.rf - st.xF, G.rfB + st.xF) : G.rf - Math.abs(st.xF);
  // Rutschen: Haftreibung Glas/Keramik auf Tisch μ ≈ 0,3–0,5 (Richtwert) – ist a/h größer, rutscht das Gefäß, bevor es kippt
  return ['Umstoßkraft', nf1.format(Core.pushForce(st.mF, a, G.hRim)) + ' N', 'waagrecht am Rand, gefüllt' + (isPlan() ? ', in Kipprichtung' : isTube() ? ', vorne/hinten, ungünstigere' : Math.abs(st.xF) > 0.5 ? ', ungünstigste Richtung' : '') + (a / G.hRim > 0.4 ? ' · rutscht eher, als dass es kippt (breit und niedrig)' : '')];
}
function drawStats() {
  if (!G.geo || !G.curve) return;
  const V0 = S.fill, c = G.curve, d = 180 / STEPS;
  const first = pred => { for (let k = 0; k <= STEPS; k++) if (pred(c[k])) return k * d; return null; };
  const start = V0 > 0 ? first(v => v < V0 - Math.max(0.5, 0.003 * V0)) : null;
  const half = V0 > 0 ? first(v => v <= V0 / 2) : null;
  const empty = V0 > 0 ? first(v => v <= Math.max(1, 0.01 * V0)) : null;
  let rate = 0, rateAt = 0;
  for (let k = 1; k <= STEPS; k++) { const r = (c[k - 1] - c[k]) / d; if (r > rate) { rate = r; rateAt = k * d; } }
  const deg = v => v == null ? '–' : nf1.format(v) + '°';
  const items = [
    capItem(),
    ['Füllmenge', nf0.format(V0) + ' ml', nf0.format(G.cap ? 100 * V0 / G.cap : 0) + ' % · ' + nf0.format(fillHeight(V0) - G.z0) + ' mm hoch'],
    isTube() ? ['Abmessungen', nf0.format(G.H) + ' mm', 'Ø max ' + nf0.format(G.maxD) + ' mm · Mündung Ø ' + nf0.format(G.mouthD) + ' mm']
    : isPlan() ? ['Abmessungen', nf0.format(G.H) + ' mm', 'innen ' + nf0.format(G.L) + ' × ' + nf0.format(G.B) + ' mm · Kipprichtung ' + nf0.format(S.psi) + '°']
      : ['Abmessungen', nf0.format(G.H) + ' mm', 'Ø max ' + nf0.format(2 * G.maxR) + ' mm · Öffnung ' + nf0.format(2 * G.rimR) + ' mm'],
    ['Ausgießbeginn', deg(start), 'erster Tropfen bei langsamem Neigen' + (hasSpout() ? ', über die Tülle' : '')],
    ['50 % ausgegossen', deg(half), ''],
    ['Leer (≤ 1 %)', deg(empty), empty == null ? 'Rest bei 180°: ' + nf0.format(c[STEPS]) + ' ml' : ''],
    ['Max. Dosierrate', nf1.format(rate) + ' ml/°', rate > 0 ? 'bei ' + deg(rateAt) : ''],
    ['Gewicht Inhalt', nf0.format(S.cur) + ' g', 'Wasser, aktuell'],
    ['Gewicht Gefäß', nf0.format(G.mv) + ' g', MATS[S.mat][0] + ', ' + nf1.format(MATS[S.mat][1]) + ' g/cm³' + (hasSpout() || hasHandle() ? ', mit Tülle/Henkel' : '')],
    ['Schwerpunkt', G.stab ? nf0.format(G.stab.zF - G.zst) + ' mm' : '…', 'gefüllt, über Standfläche · leer ' + nf0.format(G.zv - G.zst) + ' mm'],
    !standOk()
      ? ['Kippwinkel', '⚠ –', isTube() ? 'Boden nicht waagrecht: keine Standfläche' : 'kein flacher Boden: Standradius setzen', true]
      : tipItem(deg),
    pushItem()
  ];
  const sl = S.slosh ? sloshItems() : [];
  if (S.slosh) items.push(...sl);
  if (G.bad) items.unshift(['Geometrie', '⚠ prüfen', G.bad, true]);
  // Urteil und Vergleich (gemerkter Stand = eingefrorener Schnappschuss der Kennzahlen und Kurven)
  const so = sl.filter(x => x[3] && /schwappt über/.test(x[2])).map(x => /^Gehen/.test(x[0]) ? 'Gehen' : 'Anhalten');
  const K = { bad: G.bad, spillFill: hasSpout() && G.cap < G.capRim - 1 && !S.lid, stand: standOk(), tube: isTube(), tip: tipMin(), start, fill: V0, cap: G.cap, H: G.H,
    half, empty, push: pushN(), mv: G.mv, sloshOver: so.join(' und '), ready: !!G.stab };
  if (REF && REF.pending && K.ready) { const fc = [], kc = [];
    for (let i = 0; i <= 120; i++) { const v = G.cap * i / 120; fc.push([v, fillHeight(v) - G.z0]); }
    for (let k = 0; k <= STEPS; k++) kc.push([180 * k / STEPS, c[k]]);
    REF = { ...K, V: verdict(K), fc, kc }; }
  const F = REF && !REF.pending ? REF : null, V = verdict(K);
  const vs = (cur, ref, fmt) => F && cur != null && ref != null && isFinite(cur) && isFinite(ref) ? ` · gemerkt ${fmt(ref)} (${dpDelta(cur, ref)})` : F && ref != null ? ` · gemerkt ${fmt(ref)}` : '';
  const ml = v => nf0.format(v) + ' ml', dg = v => nf1.format(v) + '°';
  const add = { 'Fassungsvermögen': vs(G.cap, F && F.cap, ml), 'Füllmenge': vs(V0, F && F.fill, ml), 'Ausgießbeginn': vs(start, F && F.start, dg), 'Kippwinkel': F ? ' · gemerkt min. ' + (F.tip != null ? dg(F.tip) : '–') : '',
    'Umstoßkraft': vs(K.push, F && F.push, v => nf1.format(v) + ' N'), 'Gewicht Gefäß': vs(G.mv, F && F.mv, v => nf0.format(v) + ' g') };
  // Ebene 2: die Entwurfsfragen (Fassung, Ausgießen, Kippen, Umstoßen; beim Schwappen Gehen/Anhalten) groß, Rest in der Tabelle;
  // Warnungen immer oben. Fachbegriffe mit Erklärung.
  const TM = { 'Kippwinkel': 'Schräglage um die Standkante, ab der das Gefäß von selbst umfällt (Wasser läuft mit).',
    'Umstoßkraft': 'Waagrechte Kraft am Rand, die das gefüllte Gefäß gerade ankippt. 1 N ≈ Gewicht von 100 g.',
    'Ausgießbeginn': 'Neigung, bei der der erste Tropfen über Rand oder Tülle läuft.', 'Freibord Schwappen': 'Wellenhöhe am Rand, ab der Wasser überläuft.',
    'Eigenfrequenz': 'So oft je Sekunde schwappt das Wasser hin und her.', 'Max. Dosierrate': 'Größte Ausgießmenge je Grad Neigung – je kleiner, desto feiner dosierbar.' };
  const MAIN = ['Geometrie', 'Fassungsvermögen', 'Ausgießbeginn', 'Kippwinkel', 'Umstoßkraft'], it = items.map(([l, v, n, w]) => ({ l, v, n: (n || '') + (add[l] || ''), w, t: TM[l] }));
  const isMain = x => x.w || MAIN.includes(x.l) || /^(Gehen|Anhalten)/.test(x.l);
  $('stats').innerHTML = dpStats(dpVerdict(V[0], (K.ready ? '' : 'Vorläufig: ') + V[1], F && 'Gemerkt: ' + DP_LV[F.V[0]] + ' – ' + F.V[1]), it.filter(isMain), it.filter(x => !isMain(x)), 'gefaess');
  $('fillO').textContent = nf0.format(V0) + ' ml';
  $('tiltO').textContent = nf1.format(S.theta) + '°';
  $('wtO').textContent = nf1.format(S.t) + ' mm'; $('btO').textContent = nf1.format(S.tb) + ' mm';
  $('footO').textContent = nf0.format(G.rf) + ' mm' + (S.foot == null ? ' (auto)' : '');
  if (S.spout) { $('sdO').textContent = nf0.format(S.spout.d) + ' mm'; $('sd').value = S.spout.d; }
  if (S.handle) { $('hdO').textContent = nf0.format(S.handle.d) + ' mm'; $('hd').value = S.handle.d; }
  $('hO').textContent = nf0.format(S.H) + ' mm'; $('psiO').textContent = nf0.format(S.psi) + '°'; $('hP').value = S.H; $('psi').value = S.psi;
  $('wt').value = S.t; $('bt').value = S.tb; $('foot').value = G.rf; $('mat').value = S.mat; $('footAuto').checked = S.foot == null;
  $('state').textContent = S.cur < V0 - 0.5 ? nf0.format(V0 - S.cur) + ' ml ausgegossen' : '';
}

function drawAll() { drawEditor(); drawTilt(); drawCharts(); drawStats(); }

// ---------- controls ----------
function setMode(m) { S.mode = m; $('mDraw').classList.toggle('on', m === 'draw'); $('mEdit').classList.toggle('on', m === 'edit'); drawEditor(); }
$('mDraw').onclick = () => setMode('draw');
$('mEdit').onclick = () => setMode('edit');
// Vorlagen-Galerie: Prinzipien und Designklassiker (g: 1); Designklassiker setzen auch Wand, Boden, Material. Name „Titel · Entwurf Jahr“
const PRINZIP = { becher: 'senkrechte Wand: gleichmäßige Eichstriche', konisch: 'nach oben weiter: Eichstriche rücken zusammen', karaffe: 'bauchig mit Hals',
  flasche: 'enger Hals: gießt erst bei starker Neigung', schale: 'flach und weit: schwappt leicht über', kammer: 'zwei Kammern: ein Rest bleibt hängen',
  teekanne: 'Tülle tief angesetzt, Deckel', kelch: 'Kelch auf Stiel: hoher Schwerpunkt', schiff: 'breiter Boden: kippt erst sehr spät',
  kopf: 'geneigter Kopf (zwei Konturen)', schief: 'schräge Wand (zwei Konturen)' };
// Skizze: Innenkontur gespiegelt mit Wasserfläche, Tülle und Henkel als Mittellinie; Grundriss von oben; zwei Konturen hinten/vorne
function presetSketch(v) {
  const body = v.plan ? v.plan : v.back ? [...v.back].reverse().concat(v.front) : v.p.map(([r, z]) => [-r, z]).reverse().concat(v.p);
  const out = [{ p: body, z: true, f: '--water-a', c: null }, { p: body, z: !!v.plan, w: 2 }];
  if (v.sp) out.push({ p: v.sp, w: 3 }); if (v.hp) out.push({ p: v.hp, w: 3 });
  if (v.lid) { const r = v.p[v.p.length - 1]; out.push({ p: [[-r[0], r[1]], [r[0], r[1]]], w: 3 }); }
  if (v.r) { const z = v.p[0][1]; out.push({ p: [[0, 0], [0, z]], w: 2 }, { p: [[-v.r, 0], [v.r, 0]], w: 2 }); } // Stiel und Fuß
  return out;
}
dpGallery($('preset'), [['Prinzipien', 0], ['Designklassiker', 1]].map(([t, g]) => [t, Object.entries(PRESETS).filter(([, v]) => (v.g || 0) === g).map(([k, v]) => {
  const [n, s] = v.n.split(' · '), zs = (v.p || v.back || []).concat(v.front || []).map(q => q[1]), H = v.plan ? v.H : zs.length ? Math.max(...zs) - Math.min(...zs) : 0;
  return { k, n, s: (s || PRINZIP[k]) + (H ? ' · H ' + nf0.format(H) + ' mm' : ''), d: () => presetSketch(v) }; })]), k => {
  const v = PRESETS[k];
  pushUndo();
  if (v.plan) { S.plan = toPts(v.plan); S.H = v.H; S.psmooth = v.sm; setKind('plan', true); }
  else if (v.back) { S.tA = toPts(v.back); S.tB = toPts(v.front); S.tsmooth = v.sm; setKind('tube', true); }
  else {
    S.pts = toPts(v.p); S.spout = v.sp ? { p: toPts(v.sp), d: v.sd } : null; S.handle = v.hp ? { p: toPts(v.hp), d: v.hd } : null; S.lid = !!v.lid;
    setKind('rot', true);
  }
  if (v.m) { S.t = v.t; S.tb = v.tb; S.mat = v.m; }
  S.fill = null; S.foot = v.r ?? null; S.theta = 0; $('tilt').value = 0; S.sel = -1; recompute(); fitView(); drawAll();
});
// Drehkörper ↔ Grundriss; beide Geometrien bleiben erhalten
function setKind(k, quiet) {
  S.kind = k; S.sel = -1; const p = k === 'plan', t = k === 'tube';
  $('partRow').hidden = k !== 'rot'; $('tubeRow').hidden = !t; setPart('body'); setTPart(S.tPart);
  $('kRot').classList.toggle('on', k === 'rot'); $('kPlan').classList.toggle('on', p); $('kTube').classList.toggle('on', t);
  $('planCtl').hidden = !p; $('marksL').hidden = p;
  ['footL', 'foot', 'footO', 'footAutoL'].forEach(id => $(id).hidden = k !== 'rot'); // Standkante folgt im Grundriss/Schlauch aus der Kontur
  $('smooth').checked = p ? S.psmooth : t ? S.tsmooth : S.smooth;
  $('edT').textContent = p ? 'Grundriss, senkrechte Wand' : t ? 'zwei Konturen, Kreisquerschnitte' : 'Innenkontur, rotationssymmetrisch';
  // kurzer Hinweis; ausführlich unter „Modell & Gültigkeit → Bedienung“
  noteTxt = $('edNote').textContent = p ? 'Geschlossene Kontur von oben zeichnen · Punkte ziehen, auf die Linie tippen fügt ein · Pfeil = Seite, die beim Kippen absinkt.'
    : t ? 'Erst „hinten“, dann „vorne“ (Ausgießseite) vom Boden zur Mündung zeichnen · Punkte wie beim Profil.'
    : 'Innenkontur vom Boden zum Rand zeichnen – sie wird gespiegelt · Punkte ziehen, auf die Linie tippen fügt ein.';
  if (!quiet) { S.fill = null; S.theta = 0; $('tilt').value = 0; recompute(); fitView(); drawAll(); }
}
// Bearbeitungsziel im Drehkörper: Körper, Tülle oder Henkel (fehlendes Teil wird mit Vorschlag angelegt)
function setPart(part) {
  if (part === 'spout' && !S.spout || part === 'handle' && !S.handle) {
    pushUndo(); const H = G.H || 100, z0 = G.z0 || 0, r = z => { const iv = G.poly ? Core.intervalsAt(G.poly, z0 + z * H) : []; return iv.length ? iv[iv.length - 1][1] : 40; };
    if (part === 'spout') S.spout = { p: toPts([[r(0.3), z0 + 0.3 * H], [r(0.3) + 0.3 * H, z0 + 0.6 * H], [r(0.3) + 0.45 * H, z0 + 0.95 * H]].map(q => q.map(Math.round))), d: 10 };
    else { const R = (G.maxR || 40) + 0.3 * H; S.handle = { p: toPts([[-r(0.75), z0 + 0.75 * H], [-R, z0 + 0.7 * H], [-R, z0 + 0.35 * H], [-r(0.3), z0 + 0.3 * H]].map(q => q.map(Math.round))), d: 12 }; }
    S.part = part; changed(); fitView();
  }
  S.part = part; S.sel = -1;
  ['body', 'spout', 'handle'].forEach(q => $('p_' + q).classList.toggle('on', q === part));
  $('pDel').hidden = part === 'body';
  $('sdL').hidden = $('sd').hidden = $('sdO').hidden = !S.spout; $('hdL').hidden = $('hd').hidden = $('hdO').hidden = !S.handle;
  $('partCtl').hidden = !isRot() || !S.spout && !S.handle; $('lid').checked = S.lid;
  drawEditor();
}
['body', 'spout', 'handle'].forEach(q => $('p_' + q).onclick = () => setPart(q));
$('pDel').onclick = () => { pushUndo(); if (S.part === 'spout') S.spout = null; else S.handle = null; setPart('body'); changed(); };
$('lid').onchange = e => { S.lid = e.target.checked; changed(); };
$('sd').oninput = e => { S.spout.d = +e.target.value; changed(true); };
$('hd').oninput = e => { S.handle.d = +e.target.value; changed(true); };
$('kRot').onclick = () => { if (!isRot()) setKind('rot'); };
$('kPlan').onclick = () => { if (!isPlan()) setKind('plan'); };
$('kTube').onclick = () => { if (!isTube()) setKind('tube'); };
// Zwei Konturen: welche Kontur bearbeitet wird
function setTPart(t) { S.tPart = t; S.sel = -1; $('t_A').classList.toggle('on', t === 'A'); $('t_B').classList.toggle('on', t === 'B'); drawEditor(); }
$('t_A').onclick = () => setTPart('A'); $('t_B').onclick = () => setTPart('B');
$('hP').oninput = e => { S.H = +e.target.value; changed(true); };
$('psi').oninput = e => { S.psi = +e.target.value; changed(true); };
$('undo').onclick = undo;
$('fitB').onclick = () => { fitView(); drawEditor(); };
// Fotovorlage: lokal geladen, auf max. 1600 px verkleinert (flüssiges Zeichnen auf dem Telefon)
$('photoB').onclick = () => $('photoF').click();
$('photoF').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  const url = URL.createObjectURL(f), im = new Image();
  try { im.src = url; await im.decode(); } catch { URL.revokeObjectURL(url); flash('⚠ Bild nicht lesbar.'); return; }
  const k = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight)), W = Math.max(1, Math.round(im.naturalWidth * k)), H = Math.max(1, Math.round(im.naturalHeight * k));
  // Handyfotos sind oft größer als die Grafiktextur des Telefons – drawImage zeichnet dann stumm nichts.
  // Deshalb schon beim Dekodieren verkleinern; ohne createImageBitmap direkt aus dem <img>.
  let src = im; try { src = await createImageBitmap(f, { resizeWidth: W, resizeHeight: H, resizeQuality: 'high', imageOrientation: 'from-image' }); } catch { }
  const c = document.createElement('canvas'), cx = c.getContext('2d', { willReadFrequently: true }); c.width = W; c.height = H; cx.drawImage(src, 0, 0, W, H);
  URL.revokeObjectURL(url); if (src.close) src.close();
  const d = cx.getImageData(0, 0, W, H).data; let any = false; for (let i = 3; i < d.length; i += 4 * 97) if (d[i]) { any = true; break; }
  if (!any) { flash('⚠ Foto konnte nicht dargestellt werden (zu groß?). Bitte verkleinert oder als Bildschirmfoto laden.'); return; }
  const ar = H / W, Hv = Math.max(60, G.H || 100) * 1.1; // Startgröße: Fotohöhe ≈ Gefäßhöhe, Mitte auf der Achse
  PH = { img: c, ar, w: Math.round(Math.min(1000, Math.max(20, Hv / ar))), x: 0, z: Math.round(G.z0 || 0), op: 0.5, show: true };
  photoUi(); fitView(); drawEditor();
};
function photoUi() {
  $('photoCtl').hidden = $('photoRow').hidden = !PH; if (!PH) return;
  $('phShow').checked = PH.show;
  [['phW', PH.w, ' mm'], ['phX', PH.x, ' mm'], ['phZ', PH.z, ' mm'], ['phO', Math.round(PH.op * 100), ' %']].forEach(([id, v, u]) => { $(id).value = v; $(id + 'O').textContent = nf0.format(v) + u; });
}
[['phW', v => PH.w = v], ['phX', v => PH.x = v], ['phZ', v => PH.z = v], ['phO', v => PH.op = v / 100]].forEach(([id, f]) =>
  $(id).oninput = e => { f(+e.target.value); photoUi(); drawEditor(); });
$('phShow').onchange = e => { PH.show = e.target.checked; fitView(); drawEditor(); };
$('phDel').onclick = () => { PH = null; photoUi(); fitView(); drawEditor(); };
$('smooth').onchange = e => { if (isPlan()) S.psmooth = e.target.checked; else if (isTube()) S.tsmooth = e.target.checked; else S.smooth = e.target.checked; changed(); };
$('snap').onchange = e => { S.snap = +e.target.value; };
$('marks').onchange = e => { S.marks = e.target.checked; drawEditor(); };
$('mat').innerHTML = Object.entries(MATS).map(([k, [n]]) => `<option value="${k}">${n}</option>`).join('');
$('mat').onchange = e => { S.mat = e.target.value; changed(); };
$('wt').oninput = e => { S.t = +e.target.value; changed(true); };
$('bt').oninput = e => { S.tb = +e.target.value; changed(true); };
$('foot').oninput = e => { S.foot = +e.target.value; changed(true); };
$('footAuto').onchange = e => { S.foot = e.target.checked ? null : Math.round(G.rf); changed(); };
$('fill').oninput = e => { S.fill = +e.target.value; S.lastPour = 0; updateCurve(); drawAll(); linkLater(); };

function setTheta(t) {
  const prev = S.theta; S.theta = t;
  if (t < prev) S.lastPour = 0; // zurückkippen: Strahl reißt ab
  if (!isPlan()) { // Drehkörper: Zustand in Schritten ≤ 0,5° weiterdrehen (vor und zurück), Wasser verteilt sich auf die Taschen
    if (S.lakes) {
      for (let a = prev; a !== t;) {
        const b = t > a ? Math.min(t, a + 0.5) : Math.max(t, a - 0.5), r = Core.settle(G.pg, b * DEG, S.lakes, a * DEG);
        if (S.slosh && D.lk === S.lakes) { D.sts = Core.sloshInherit(G.pg.n, S.lakes, D.sts, r.lakes); D.lk = r.lakes; } // Schwingzustand mitnehmen
        S.lakes = r.lakes; if (r.lost > 1 && t > prev) { S.lastPour = performance.now(); G.lastSp = r.sp; D.side = 1; } a = b;
      }
      S.cur = sumMl(S.lakes);
    }
  } else if (t > prev) {
    const k0 = Math.round(prev / 180 * STEPS), k1 = Math.round(t / 180 * STEPS);
    let m = S.cur; for (let k = k0; k <= k1; k++) m = Math.min(m, G.curve[k]);
    m = Math.min(m, retainedAt(t));
    if (m < S.cur - 1e-6) { S.lastPour = performance.now(); D.side = 1; }
    S.cur = m;
  }
  $('tilt').value = t; if (S.slosh) sloshKick();
  drawTilt(); drawCharts(); drawStats();
  clearTimeout(tiltT); tiltT = setTimeout(drawTilt, 480); // Strahl nach dem Ausgießen ausblenden
}
let tiltT = 0;
$('tilt').oninput = e => setTheta(+e.target.value);
function refill() { S.lastPour = 0; S.theta = 0; $('tilt').value = 0; if (isPlan()) S.cur = S.fill; else { S.lakes = G.lakes0; S.cur = sumMl(S.lakes); } sloshReset(); }
$('refill').onclick = () => { stopPlay(); refill(); drawAll(); };
let playId = 0;
function stopPlay() { cancelAnimationFrame(playId); playId = 0; dpBtn($('play'), 'play', 'Durchkippen'); }
$('play').onclick = () => {
  if (playId) return stopPlay();
  refill(); dpBtn($('play'), 'stop', 'Stopp');
  const t0 = performance.now(), dur = 7000;
  const step = now => { const t = Math.min(1, (now - t0) / dur); setTheta(180 * t); if (t < 1) playId = requestAnimationFrame(step); else stopPlay(); };
  playId = requestAnimationFrame(step);
};

// ---------- Schwappen ----------
// Zustand je Wasserkörper [s, w] parallel zu S.lakes (D.sts gehört zu D.lk), Grundriss ein Zustand D.pl.
// X = waagrechte Lage des Gefäßes [mm] = Ziehen (Xd) + Gehen bzw. Anhalten; th = Neigung [°] beim letzten Schritt.
const D = { raf: 0, last: 0, t: 0, th: 0, X: 0, Xd: 0, drag: null, walk: false, wt: 0, env: 0, stop: null, lk: null, sts: [], pl: [0, 0],
  hist: [], quiet: 0, side: 1, lim: null, sc: 1, w: 300, pc: null };
const coefC = new WeakMap(); // See → {th, c}
function coefOf(lk, th) {
  const e = coefC.get(lk); if (e && e.th === th) return e.c;
  const sf = Core.lakeSurf(G.pg, lk, th), c = sf && sf.I > 0 ? Core.sloshCoef(sf, lk.W, true) : null;
  if (c) c.P = Core.sloshP(c, lk.L, th);
  coefC.set(lk, { th, c }); return c;
}
function coefPlan(th, V) {
  if (D.pc && D.pc.th === th && D.pc.V === V && D.pc.geo === G.geo) return D.pc.c;
  const [lo, hi] = G.geo.yr(th), L = Core.solveLG(G.geo, V, th, lo, hi), sf = G.geo.surf(L, th), c = sf && sf.I > 0 ? Core.sloshCoef(sf, V, false) : null;
  if (c) { c.L = L; c.P = Core.sloshP(c, L, th); }
  D.pc = { th, V, geo: G.geo, c }; return c;
}
// waagrechte Weltlage [mm] des Gefäßpunkts P bei Neigung th [rad] und Verschiebung X; Drehpunkt = Mitte der Kippansicht
const xwOf = (P, th, X) => (P.x - G.xc) * Math.cos(th) + (P.z - G.z0 - G.H / 2) * Math.sin(th) + X;
const KAPR = 2 / (Core.XI ** 2 - 1);
function sloshReset() { D.sts = S.lakes ? S.lakes.map(() => [0, 0]) : []; D.lk = S.lakes; D.pl = [0, 0]; D.X = D.Xd = 0; D.walk = false; D.env = 0; D.stop = null; D.hist = []; D.th = S.theta; sloshButtons(); }
// Zustände gehören zu S.lakes (nach Neuberechnung/Füllen: neue Seen ruhen)
function syncSts() { if (S.lakes && D.lk !== S.lakes) { D.sts = S.lakes.map(() => [0, 0]); D.lk = S.lakes; } }
function sloshKick() { D.quiet = 0; if (!D.raf && S.slosh) { D.last = performance.now(); D.raf = requestAnimationFrame(sloshTick); } }
// Anhalten: Tempo v [mm/s] bis t = 0, dann gleichmäßig bremsen über T
const stopX = (st, t) => st.x0 + (t < st.T ? st.v * (t - t * t / (2 * st.T)) : st.v * st.T / 2);
function sloshTick(now) {
  D.raf = 0; if (!S.slosh || !G.geo) return;
  const dt = Math.min(0.05, Math.max(0, (now - D.last) / 1000)); D.last = now; D.t += dt;
  let X1 = D.Xd;
  // Gehen über 1 s ein- und ausblenden: kein Geschwindigkeitssprung (Ruck) beim Losgehen und Stehenbleiben
  if (D.walk || D.env > 0) { D.wt += dt; D.env = Math.max(0, Math.min(1, D.env + (D.walk ? dt : -dt))); X1 = D.Xd + D.env * S.wa * Math.sin(2 * Math.PI * S.wf * D.wt); }
  else if (D.stop) { D.stop.t += dt; if (D.stop.t > D.stop.T + 4) { D.stop = null; D.X = D.Xd; sloshButtons(); } else X1 = stopX(D.stop, D.stop.t); } // danach Lage neu bezogen (ändert nichts an der Physik)
  const th0 = D.th * DEG, th1 = S.theta * DEG, X0 = D.X;
  let lost = 0, act = false, rise = 0;
  if (isPlan()) {
    const V = S.cur * 1000, c = V > 1 ? coefPlan(th1, V) : null;
    if (c) {
      Core.sloshStep(D.pl, c.om, c.ze, th0, th1, xwOf(c.P, th0, X0), xwOf(c.P, th1, X1), dt, 1 / c.kap);
      const e = th1 + Math.atan(c.kap * D.pl[0]), cap = G.geo.vol(G.geo.spill(e), e) / 1000;
      if (cap < S.cur - 1e-3) { lost = Core.weirOut((S.cur - cap) * 1000, Math.abs(c.kap * D.pl[0]), c.a, dt) / 1000; S.cur -= lost; D.side = Math.sign(D.pl[0]); }
      act = Math.abs(D.pl[0]) > 1e-4 || Math.abs(D.pl[1]) > 1e-3; rise = c.kap * c.a * D.pl[0]; D.a = c.a;
    } else D.pl = [0, 0];
  } else if (S.lakes) {
    syncSts(); let big = -1;
    S.lakes.forEach((lk, i) => {
      const c = coefOf(lk, th1), d = D.sts[i]; if (!c) { d[0] = d[1] = 0; return; }
      Core.sloshStep(d, c.om, c.ze, th0, th1, xwOf(c.P, th0, X0), xwOf(c.P, th1, X1), dt, 1 / c.kap); // Brechen: Randhub ≤ halbe Spiegelbreite
      if (Math.abs(d[0]) > 1e-4 || Math.abs(d[1]) > 1e-3) act = true;
      if (big < 0 || lk.W > S.lakes[big].W) { big = i; rise = c.kap * c.a * d[0]; D.a = c.a; }
    });
    const r = Core.sloshSpill(G.pg, th1, S.lakes, D.sts, KAPR, dt, S.lakes.map(lk => { const c = coefOf(lk, th1); return c ? c.a : 1; }), hasSpout() ? S.spout.d : Infinity);
    if (r.lakes !== S.lakes) {
      lost = r.lost / 1000; let m = 0; S.lakes.forEach((_, i) => { if (Math.abs(D.sts[i][0]) > Math.abs(m)) m = D.sts[i][0]; });
      if (lost > 1e-3) { D.side = Math.sign(m); G.lastSp = r.sp; }
      S.lakes = r.lakes; D.sts = r.sts; D.lk = r.lakes; S.cur = sumMl(S.lakes);
    }
  }
  D.th = S.theta; D.X = X1;
  D.hist.push([D.t, rise]); while (D.hist.length && D.hist[0][0] < D.t - 6) D.hist.shift();
  if (lost > 1e-3) { S.lastPour = now; drawCharts(); drawStats(); }
  drawTilt(); drawSloshChart();
  D.big = Math.abs(rise) > 0.25 * (D.a || Infinity); // Randhub > 25 % der halben Spiegelbreite: außerhalb des linearen Bereichs
  if (D.walk || D.env > 0 || D.stop || D.drag || playId || act) D.quiet = 0; else D.quiet++;
  if (D.quiet < 20) D.raf = requestAnimationFrame(sloshTick);
}
function drawSloshChart() {
  if (!S.slosh) return;
  const fb = S.theta === 0 && D.lim && D.lim.main && Number.isFinite(D.lim.main.free) ? D.lim.main.free : null;
  let m = 2; D.hist.forEach(([, r]) => m = Math.max(m, Math.abs(r))); if (fb && fb < 4 * m) m = Math.max(m, fb); // ferner Freibord staucht sonst die Kurve
  const t0 = D.t - 6, pts = D.hist.map(([t, r]) => [t - t0, r]), series = [{ pts, color: css('--water') }];
  if (fb && fb <= m) series.push({ pts: [[0, fb], [6, fb]], color: css('--ink'), width: 1, dash: [4, 4] }, { pts: [[0, -fb], [6, -fb]], color: css('--ink'), width: 1, dash: [4, 4] });
  chart($('c3'), { x0: 0, x1: 6, xs: 1, y0: -1.15 * m, y1: 1.15 * m, xl: 'Zeit [s]', yl: 'Randhub [mm]', series });
}
// Kennwerte aufrecht (θ = 0, Füllung frisch): je Wasserkörper f₁, ζ, Freibord, Randhub beim Gehen und Anhalten
// Freibord je Wasserkörper hängt nur von Geometrie und Füllung ab (Bisektion, einige ms); Gehen/Anhalten bei jedem Regler neu
function sloshStats(keep) {
  const V0 = S.fill * 1000, stop = { x0: 0, v: S.sv * 1000, T: S.sb };
  let L = keep && D.lim ? D.lim.L : null;
  if (!L) {
    L = [];
    if (isPlan()) { const c = V0 > 1 ? coefPlan(0, V0) : null; if (c) L.push({ c, W: V0, free: c.kap * c.a * Math.min(Core.sloshLimitG(G.geo, V0, 0, c.kap, 1), Core.sloshLimitG(G.geo, V0, 0, c.kap, -1)) }); }
    else for (const lk of G.lakes0 || []) { const c = coefOf(lk, 0); if (c) L.push({ c, W: lk.W, free: c.kap * c.a * Math.min(Core.sloshLimit(G.pg, lk, 0, c.kap, 1), Core.sloshLimit(G.pg, lk, 0, c.kap, -1)), approx: shallowSlope(lk, c) }); }
  }
  for (const q of L) {
    const c = q.c, ss = Core.sloshSteady(c.om, c.ze, S.wa, 2 * Math.PI * S.wf), pk = Core.sloshPeak(c.om, c.ze, t => stopX(stop, t), S.sb + 3, stop.v);
    Object.assign(q, { walk: Math.min(c.a, c.kap * c.a * ss), stop: Math.min(c.a, c.kap * c.a * pk), nlW: c.kap * ss > 0.25, nlS: c.kap * pk > 0.25 }); // ≤ a: Brechen
  }
  const main = L.reduce((a, b) => !a || b.W > a.W ? b : a, null);
  // kritischster Wasserkörper je Fall: größtes Verhältnis Randhub/Freibord
  const worst = k => L.reduce((a, b) => !a || b[k] / b.free > a[k] / a.free ? b : a, null);
  D.lim = { L, main, walk: worst('walk'), stop: worst('stop') };
}
// Frequenz aus der mittleren Tiefe V/A ist exakt für senkrechte Wände; flacher See (kh < 2) mit stark schräger Wand
// (mittlere Tiefe < 75 % der größten) → nur genähert. Größte Tiefe aus den Schichten des Drehkörpers (aufrecht).
function shallowSlope(lk, c) {
  const g = G.pg; if (!g || !g.z || !lk.nodes || !lk.nodes.length) return false;
  let z0 = Infinity; for (const i of lk.nodes) z0 = Math.min(z0, g.z[i] - g.dz / 2);
  const hT = lk.L - z0; return c.k * c.h < 2 && hT > 0 && c.h / hT < 0.75;
}
function sloshItems() {
  const Q = D.lim; if (!Q) return [['Eigenfrequenz', '…', '']];
  if (!Q.main) return [['Eigenfrequenz', '–', 'kein Wasser mit freiem Spiegel']];
  const mm = v => nf1.format(v) + ' mm', m = Q.main, more = Q.L.length > 1 ? ' · weitere: ' + Q.L.filter(q => q !== m).map(q => nf1.format(q.c.f)).join(' / ') + ' Hz' : '';
  // rot nur mit ⚠ am Wert: Überschwappen oder außerhalb des linearen Bereichs; Resonanzhinweis nur in der Notiz
  const verdict = (q, k, nl) => {
    const over = q[k] >= q.free, which = Q.L.length > 1 ? ' (Wasserkörper ' + nf1.format(q.c.f) + ' Hz)' : '';
    return [(over || nl ? '⚠ ' : '') + '±' + mm(q[k]), (over ? 'schwappt über' : Number.isFinite(q.free) ? 'Freibord ' + mm(q.free) : 'läuft nicht über') + which + (nl ? ' · ⚠ große Wellen, nur qualitativ' : ''), over || nl];
  };
  const fw = Q.walk.c.f, res = Math.abs(S.wf / fw - 1) < 0.15 ? ' · ⚠ nahe Resonanz' : Math.abs(2 * S.wf / fw - 1) < 0.15 ? ' · ⚠ f₁ ≈ 2 × Schrittfrequenz (Oberschwingung)' : '';
  const [wv, wn, ww] = verdict(Q.walk, 'walk', Q.walk.nlW), [sv, sn, sw] = verdict(Q.stop, 'stop', Q.stop.nlS);
  return [
    ['Eigenfrequenz', nf1.format(m.c.f) + ' Hz', 'Periode ' + nf0.format(1000 / m.c.f) + ' ms · Dämpfung ' + nf1.format(m.c.ze * 100) + ' %' + more + (m.approx ? ' · ⚠ flache Schale mit schräger Wand: Frequenz nur genähert' : '')],
    ['Freibord Schwappen', Number.isFinite(m.free) ? mm(m.free) : '–', Number.isFinite(m.free) ? 'aufrecht: Randhub, ab dem Wasser hinaus oder in eine andere Tasche läuft' : 'läuft auch bei großen Wellen nicht über'],
    ['Gehen ' + nf1.format(S.wf) + ' Hz, Hub ±' + nf0.format(S.wa) + ' mm', wv, 'aufrecht, eingeschwungen · ' + wn + res, ww],
    ['Anhalten ' + nf1.format(S.sv) + ' m/s in ' + nf1.format(S.sb) + ' s', sv, 'aufrecht, größter Randhub · ' + sn, sw]
  ];
}
dpCompare($('cmp'), () => ({}), ref => { REF = ref ? { pending: true } : null; drawStats(); drawCharts(); });
function sloshButtons() {
  const on = S.slosh;
  $('slosh').classList.toggle('on', on); ['walkB', 'stopB', 'sloshCtl', 'sloshNote', 'c3'].forEach(id => $(id).hidden = !on);
  $('walkB').classList.toggle('on', D.walk); dpBtn($('walkB'), D.walk ? 'stop' : 'play', 'Gehen');
  $('stopB').classList.toggle('on', !!D.stop);
  [['wf', nf1.format(S.wf) + ' Hz'], ['wa', nf0.format(S.wa) + ' mm'], ['sv', nf1.format(S.sv) + ' m/s'], ['sb', S.sb.toFixed(2).replace('.', ',') + ' s']].forEach(([id, t]) => {
    $(id).value = S[id]; $(id + 'O').textContent = t; });
}
$('slosh').onclick = () => {
  S.slosh = !S.slosh; cancelAnimationFrame(D.raf); D.raf = 0; sloshReset();
  D.lim = null; if (S.slosh) { if (G.curve && (isPlan() || G.lakes0)) sloshStats(); sloshKick(); requestAnimationFrame(drawSloshChart); }
  drawStats();
  drawTilt();
};
$('walkB').onclick = () => { D.stop = null; if (D.walk) D.walk = false; else { if (D.env === 0) D.wt = 0; D.walk = true; } sloshButtons(); sloshKick(); };
$('stopB').onclick = () => {
  D.walk = false; D.env = 0; D.Xd = D.X; syncSts(); const v = S.sv * 1000;
  // vorher gleichmäßig unterwegs: Flüssigkeit ruht relativ zum Gefäß (w = ṡ + (ω²/g)·v)
  const kick = c => c ? c.om * c.om / Core.GMM * v : 0;
  if (isPlan()) D.pl[1] += kick(coefPlan(S.theta * DEG, S.cur * 1000)); else if (S.lakes && D.lk === S.lakes) S.lakes.forEach((lk, i) => D.sts[i][1] += kick(coefOf(lk, S.theta * DEG)));
  D.stop = { t: 0, x0: D.X, v, T: S.sb }; sloshButtons(); sloshKick();
};
['wf', 'wa', 'sv', 'sb'].forEach(k => $(k).oninput = e => { S[k] = +e.target.value; sloshButtons(); if (D.lim) { sloshStats(true); drawStats(); } });
// Gefäß in der Kippansicht waagrecht ziehen (nur im Schwapp-Modus)
tv.addEventListener('pointerdown', e => { if (!S.slosh) return; tv.setPointerCapture(e.pointerId); D.drag = { x: e.clientX, X0: D.Xd }; sloshKick(); });
tv.addEventListener('pointermove', e => { if (!D.drag) return; const lim = 0.4 * D.w / D.sc; D.Xd = Math.max(-lim, Math.min(lim, D.drag.X0 + (e.clientX - D.drag.x) / D.sc)); sloshKick(); });
['pointerup', 'pointercancel'].forEach(t => tv.addEventListener(t, () => { D.drag = null; }));

// export / import / share (Grundriss-Felder optional, version bleibt 1)
$('exp').onclick = () => dpDownload({ type: 'designphysik/gefaess', version: 1, kind: S.kind, smooth: S.smooth, fill: S.fill, wall: S.t, bottom: S.tb, material: S.mat, foot: S.foot,
  profile: S.pts.map(p => [p.x, p.z]), plan: S.plan.map(p => [p.x, p.z]), planSmooth: S.psmooth, height: S.H, direction: S.psi,
  spout: S.spout && { p: S.spout.p.map(p => [p.x, p.z]), d: S.spout.d }, handle: S.handle && { p: S.handle.p.map(p => [p.x, p.z]), d: S.handle.d }, lid: S.lid,
  back: S.tA.map(p => [p.x, p.z]), front: S.tB.map(p => [p.x, p.z]), tubeSmooth: S.tsmooth }, 'gefaess.json');
$('imp').onclick = () => $('file').click();
$('file').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try { load(JSON.parse(await f.text())); } catch (err) { alert('Datei nicht lesbar: ' + err.message); }
  e.target.value = '';
};
// gemeinsame Übernahme aus Datei (lange Namen) und Link (kurze Namen); false = nichts Gültiges
function apply(d, long) {
  const g = (a, b) => d[long ? a : b];
  const kind = ['plan', 'tube'].includes(g('kind', 'k')) ? g('kind', 'k') : 'rot', plan = kind === 'plan';
  const p = prof(g('profile', 'p')), q = planOk(g('plan', 'q')), ua = ptsOk(g('back', 'ua'), 2, false), ub = ptsOk(g('front', 'ub'), 2, false);
  if (plan ? !q : kind === 'tube' ? !(ua && ub) : !p) return false;
  if (p) S.pts = p;
  if (q) S.plan = q;
  if (ua && ub) { S.tA = ua; S.tB = ub; S.tsmooth = long ? g('tubeSmooth') !== false : !!g('', 'us'); }
  S.smooth = long ? g('smooth') !== false : !!g('', 's'); S.psmooth = !!g('planSmooth', 'ps');
  S.H = num(g('height', 'h'), 80, 10, 400); S.psi = num(g('direction', 'a'), 0, 0, 359);
  S.fill = num(g('fill', 'f'), null, 0, 1e7); S.t = num(g('wall', 't'), 3, 0.5, 10); S.tb = num(g('bottom', 'b'), 6, 0, 20);
  S.mat = matOk(g('material', 'm')); S.foot = num(g('foot', 'r'), null, 1, 1000);
  const part = (o, lo, hi, def) => { const q = o && ptsOk(o.p, 2, false); return q ? { p: q, d: num(o.d, def, lo, hi) } : null; };
  S.spout = part(long ? d.spout : d.sp && { p: d.sp, d: d.sd }, 4, 30, 10); S.handle = part(long ? d.handle : d.hp && { p: d.hp, d: d.hd }, 5, 30, 12);
  S.lid = !!g('lid', 'ld');
  setKind(kind, true); return true;
}
function load(d) {
  const keep = snap();
  if (!d || d.type !== 'designphysik/gefaess') throw new Error('keine Gefäß-Datei');
  if (!apply(d, true)) throw new Error(d.kind === 'plan' ? 'kein gültiger Grundriss' : d.kind === 'tube' ? 'keine gültigen Konturen' : 'kein gültiges Profil');
  S.undo.push(keep); S.theta = 0; $('tilt').value = 0; recompute(); fitView(); drawAll();
}
// Link (kurze Namen); wird laufend verzögert in die Adresszeile geschrieben wie bei Last/Mechanismen
function linkObj() {
  const r1 = a => a.map(p => [+p.x.toFixed(1), +p.z.toFixed(1)]);
  return Object.assign({ s: S.smooth ? 1 : 0, f: S.fill, t: S.t, b: S.tb, m: S.mat, r: S.foot, p: r1(S.pts) },
    isPlan() ? { k: 'plan', q: r1(S.plan), ps: S.psmooth ? 1 : 0, h: S.H, a: S.psi } : {},
    isTube() ? { k: 'tube', ua: r1(S.tA), ub: r1(S.tB), us: S.tsmooth ? 1 : 0 } : {},
    S.spout ? { sp: r1(S.spout.p), sd: S.spout.d } : {}, S.handle ? { hp: r1(S.handle.p), hd: S.handle.d } : {}, S.lid ? { ld: 1 } : {});
}
$('share').onclick = async () => {
  clearTimeout(linkT); dpHashSet('g', linkObj());
  try { await navigator.clipboard.writeText(location.href); dpBtn($('share'), 'check', 'Kopiert'); } catch { dpBtn($('share'), 'check', 'Steht in der Adresszeile'); }
  setTimeout(() => dpBtn($('share'), 'link', 'Link kopieren'), 1500);
};
function fromHash() { const d = dpHashGet('g'); return !!d && apply(d, false); }
// Link im selben Tab eingefügt (nur der Hash ändert sich): übernehmen, Rückgängig möglich
window.addEventListener('hashchange', () => { const keep = snap(); if (fromHash()) { pushUndo(keep); S.theta = 0; $('tilt').value = 0; recompute(); fitView(); drawAll(); } });
let lastW = 0; // Telefon: Adressleiste ändert beim Scrollen nur die Höhe – dann Zoom behalten
window.addEventListener('resize', () => { if (ed.clientWidth === lastW) return; lastW = ed.clientWidth; fitView(); drawAll(); });
dpHeader('gefaess'); dpIcons(); dpMenu($('fitB').parentNode, [$('fitB'), $('photoB')]);
if (!fromHash()) setKind('rot', true);
recompute(); sloshButtons();
requestAnimationFrame(() => { fitView(); drawAll(); });
