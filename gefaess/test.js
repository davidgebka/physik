// Verifikation Gefäß-Kern gegen analytische Lösungen. Ausführen: node gefaess/test.js
const Core = require('../tools/load-core')(__dirname);
const check = require('../tools/check');
const P = a => a.map(([x, z]) => ({ x, z })), D = Math.PI / 180;
const setup = (a, smooth = false) => { const s = Core.trimLip(Core.sampled(P(a), smooth)); return { s, S: Core.buildSlices(Core.interiorPolygon(s), 500) }; };
const capAt = (g, deg) => Core.volBelow(g.S, Core.barrier(g.s, deg * D).L, deg * D) / 1000;

const cyl = setup([[0, 0], [40, 0], [40, 100]]);
check('Zylinder r40 h100 Volumen [ml]', capAt(cyl, 0), Math.PI * 1600 * 100 / 1000);
check('Zylinder voll, 20° gekippt [ml]', capAt(cyl, 20), Math.PI * 1600 * (100 - 40 * Math.tan(20 * D)) / 1000);
const curve = Core.tiltCurve(cyl.S, cyl.s, Math.PI * 1600 * 50, 3600);
let k = 0; while (curve[k] >= Math.PI * 1600 * 50 * 0.9999) k++;
check('Zylinder halbvoll, Ausgießbeginn [°]', k * 180 / 3600, Math.atan(1.25) / D, 2e-3);
check('Kegel r50 h100 Volumen [ml]', capAt(setup([[0, 0], [50, 100]]), 0), Math.PI * 2500 * 100 / 3 / 1000);
// Halbkugel r=50 (Polygon fein) → 2/3 π r³
const hs = []; for (let i = 0; i <= 400; i++) { const t = i / 400 * Math.PI / 2; hs.push([50 * Math.sin(t), 50 - 50 * Math.cos(t)]); }
check('Halbkugel r50 Volumen [ml]', capAt(setup(hs), 0), 2 / 3 * Math.PI * 125000 / 1000, 2e-3);
// Lippen-Trimmung: überhängende Lippe zählt nicht, eingerollte schon
const over = Core.trimLip(Core.sampled(P([[0, 0], [40, 0], [40, 100], [50, 90]]), false));
check('Überhängende Lippe abgeschnitten (Punkte)', over.length, 3, 0);
const inw = Core.trimLip(Core.sampled(P([[0, 0], [40, 0], [40, 100], [30, 95]]), false));
check('Eingerollte Lippe bleibt (Punkte)', inw.length, 4, 0);
// Glättung: jedes Segment bleibt im Rechteck seiner Kontrollpunkte (kein Über-/Unterschwingen)
check('Zylinder geglättet Volumen [ml]', capAt(setup([[0, 0], [40, 0], [40, 100]], true), 0), Math.PI * 1600 * 100 / 1000);
const kar = Core.sampled(P([[0,0],[40,0],[47,8],[53,45],[50,95],[36,140],[24,175],[22,205],[28,225]]), true);
check('Karaffe geglättet, min z [mm]', Math.min(...kar.map(p => p.z)), 0, 1e-9);
check('Karaffe geglättet, max r [mm]', Math.max(...kar.map(p => p.x)), 53, 1e-9);
let viol = 0, seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let n = 0; n < 200; n++) {
  const c = [[0, 0]]; for (let i = 0; i < 6; i++) c.push([rnd() * 80, rnd() * 200]);
  const sm = Core.sampled(P(c), true);
  for (let i = 0; i + 1 < c.length; i++) for (let s = 0; s <= 10; s++) {
    const q = sm[i * 10 + s], e = 1e-9;
    if (q.x < Math.min(c[i][0], c[i + 1][0]) - e || q.x > Math.max(c[i][0], c[i + 1][0]) + e ||
        q.z < Math.min(c[i][1], c[i + 1][1]) - e || q.z > Math.max(c[i][1], c[i + 1][1]) + e) viol++;
  }
}
check('Zufallsprofile: Punkte außerhalb Segment-Rechteck', viol, 0, 0);
// Schwerpunkt & Kippsicherheit
const cz = (g, V, th = 0) => { const [lo, hi] = Core.yRange(Core.sectionPolygon(g.s), th), M = Core.momentsBelow(g.S, Core.solveL(g.S, V, th, lo, hi), th); return { x: M.Mx / M.V, z: M.Mz / M.V }; };
check('Zylinder halbvoll, SP Flüssigkeit z [mm]', cz(cyl, Math.PI * 1600 * 50).z, 25);
check('Kegel (Spitze unten) voll, SP z [mm]', cz(setup([[0, 0], [50, 100]]), Math.PI * 2500 * 100 / 3 * 0.99999).z, 75, 2e-3);
check('Halbkugel voll, SP z [mm]', cz(setup(hs), 2 / 3 * Math.PI * 125000 * 0.99999).z, 50 - 3 * 50 / 8, 2e-3);
const tz = cz(cyl, Math.PI * 1600 * 50, 20 * D), tn = Math.tan(20 * D);
check('Zylinder h50 20° gekippt, SP x [mm]', tz.x, 1600 * tn / 200);
check('Zylinder h50 20° gekippt, SP z [mm]', tz.z, 25 + 1600 * tn * tn / 400);
const shC = Core.shell(cyl.s, 2, 5), Vw = Math.PI * (42 * 42 - 40 * 40) * 100, Vb = Math.PI * 42 * 42 * 5;
check('Schale Zylinder t2 tb5, Volumen exakt [mm³]', shC.vol, Vw + Vb);
check('Schale Zylinder t2 tb5, SP z [mm]', shC.z, (Vw * 50 + Vb * -2.5) / (Vw + Vb));
check('Kegelmantel dünn, SP z [mm]', Core.shell(P([[0, 0], [50, 100]]), 0.01, 0).z, 200 / 3);
// Hohlhalbkugel R1=50, R2=52: V = 2/3 π (R2³−R1³), SP 3/8 (R2⁴−R1⁴)/(R2³−R1³) unter dem Mittelpunkt
const shH = Core.shell(P(hs), 2, 0);
check('Hohlhalbkugel t2, Volumen [mm³]', shH.vol, 2 / 3 * Math.PI * (52 ** 3 - 50 ** 3), 2e-3);
check('Hohlhalbkugel t2, SP z [mm]', shH.z, 50 - 3 / 8 * (52 ** 4 - 50 ** 4) / (52 ** 3 - 50 ** 3), 2e-3);
check('Rundboden: kein flacher Boden erkannt', shH.flat ? 1 : 0, 0, 0);
check('Standfläche am tiefsten Punkt, nicht am ersten [mm]', Core.shell(P([[0, 10], [30, 0], [40, 100]]), 2, 5).zst, -5);
const mvC = 2.5 * shC.vol / 1000;
check('Zylinder leer, Kippwinkel [°]', Core.tipAngle(cyl.S, cyl.s, 0, mvC, shC.z, shC.rb, shC.zst), Math.atan(shC.rb / (shC.z - shC.zst)) / D, 2e-3);
const V60 = Math.PI * 1600 * 60, gF = Core.cog(cyl.S, Core.sectionPolygon(cyl.s), V60, 0, mvC, shC.z);
const tipF = Core.tipAngle(cyl.S, cyl.s, V60, mvC, shC.z, shC.rb, shC.zst);
check('Zylinder 60 % gefüllt: Kippwinkel kleiner als mit erstarrtem Inhalt', tipF < Math.atan(shC.rb / (gF.z - shC.zst)) / D ? 1 : 0, 1, 0);
check('Umstoßkraft 1 kg, r40, h100 [N]', Core.pushForce(1000, 40, 100), 9.81 * 0.4);
// Kippwinkel mit Flüssigkeit unabhängig: gekippter Zylinder h60, Standradius 25, SP-Formeln geschlossen,
// Nullstelle per Bisektion (gültig solange R·tanφ ≤ h und ≤ H−h, d. h. φ ≤ 45°)
const RF = 25, gAna = ph => { const tn = Math.tan(ph), mL = V60 / 1000, xL = 1600 * tn / 240, zL = 30 + 1600 * tn * tn / 480, m = mvC + mL;
  return (mL * xL / m - RF) * Math.cos(ph) + ((mvC * shC.z + mL * zL) / m - shC.zst) * Math.sin(ph); };
let lo = 0, hi = 45 * D; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (gAna(m) < 0) lo = m; else hi = m; }
const tip25 = Core.tipAngle(cyl.S, cyl.s, V60, mvC, shC.z, RF, shC.zst);
check('Zylinder 60 %, Standradius 25: Kippwinkel analytisch [°]', tip25, lo / D, 2e-3);
check('Kippwinkel: Schritt 1° gegen 0,05° [°]', tip25, Core.tipAngle(cyl.S, cyl.s, V60, mvC, shC.z, RF, shC.zst, 0.05), 1e-3);
// Kippwinkel mit Auslaufen, unabhängig: randvoller Zylinder, Spiegel läuft durch die tiefe Randkante,
// Achshöhe h = H − R·tanφ, SP wie gekippter Zylinder mit h (gültig bis R·tanφ ≤ h, φ ≤ 51,3°)
const VF = Math.PI * 1600 * 100, gSp = ph => { const tn = Math.tan(ph), h = 100 - 40 * tn, mL = Math.PI * 1600 * h / 1000,
  xL = 1600 * tn / (4 * h), zL = h / 2 + 1600 * tn * tn / (8 * h), m = mvC + mL;
  return (mL * xL / m - RF) * Math.cos(ph) + ((mvC * shC.z + mL * zL) / m - shC.zst) * Math.sin(ph); };
lo = 0; hi = 51 * D; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (gSp(m) < 0) lo = m; else hi = m; }
check('Zylinder randvoll, Standradius 25: Kippwinkel mit Auslaufen [°]', Core.tipAngle(cyl.S, cyl.s, VF * 0.99999, mvC, shC.z, RF, shC.zst), lo / D, 2e-3);
// ---- Grundriss-Modus (Prisma) ----
const rect = (a, b) => [{ x: -a / 2, y: -b / 2 }, { x: a / 2, y: -b / 2 }, { x: a / 2, y: b / 2 }, { x: -a / 2, y: b / 2 }];
const pr = Core.prism(rect(120, 80), 100), capP = (g, th) => g.vol(g.spill(th), th) / 1000;
check('Quader 120×80×100 Volumen [ml]', capP(pr, 0), 960);
check('Quader voll, 20° über die 120er-Seite [ml]', capP(pr, 20 * D), 120 * 80 * (100 - 60 * Math.tan(20 * D)) / 1000);
const pr90 = Core.prism(rect(80, 120), 100);
check('Quader um 90° gedreht, 20° gekippt [ml]', capP(pr90, 20 * D), 120 * 80 * (100 - 40 * Math.tan(20 * D)) / 1000);
const cP = Core.tiltCurveG(pr, 120 * 80 * 50, 3600); k = 0; while (cP[k] >= 120 * 80 * 50 * 0.9999) k++;
check('Quader halbvoll, Ausgießbeginn [°]', k * 180 / 3600, Math.atan(100 / 120) / D, 2e-3);
check('Quader jenseits 90°: leer [ml]', capP(pr, 120 * D), 0, 0);
// SP der Flüssigkeit im gekippten Quader (Trapez): x = m·a²/(12h), z = h/2 + m²a²/(24h), m = tanθ
const Mq = Core.cogG(pr, 120 * 80 * 50, 20 * D, 0, 0, 0);
check('Quader h50 20° gekippt, SP x [mm]', Mq.x, Math.tan(20 * D) * 14400 / 600);
check('Quader h50 20° gekippt, SP z [mm]', Mq.z, 25 + Math.tan(20 * D) ** 2 * 14400 / 1200);
const shQ = Core.prismShell(rect(120, 80), 100, 4, 5), band = 400 * 4 + Math.PI * 16;
check('Quader-Schale t4 tb5, Volumen [mm³]', shQ.vol, band * 100 + (9600 + band) * 5);
check('Quader-Schale, Standkante [mm]', shQ.rf, 64, 0);
// Kreis-Grundriss (720-Eck) = Zylinder aus dem Drehkörper-Kern: Volumen, Kippkapazität, Masse, Kippwinkel
const circ = []; for (let i = 0; i < 720; i++) { const t = i / 720 * 2 * Math.PI; circ.push({ x: 40 * Math.cos(t), y: 40 * Math.sin(t) }); }
const pc = Core.prism(circ, 100);
check('Kreis-Grundriss r40 h100 = Zylinder [ml]', capP(pc, 0), capAt(cyl, 0), 1e-4);
check('Kreis-Grundriss 20° gekippt = Zylinder [ml]', capP(pc, 20 * D), capAt(cyl, 20), 1e-3);
const shP = Core.prismShell(circ, 100, 2, 5);
check('Kreis-Grundriss Schale = Zylinderschale [mm³]', shP.vol, shC.vol, 1e-4);
check('Kreis-Grundriss Kippwinkel 60 % = Drehkörper [°]',
  Core.tipAngleG(pc, V60, mvC, shP.x, shP.z, 25, shP.zst), Core.tipAngle(cyl.S, cyl.s, V60, mvC, shC.z, 25, shC.zst), 2e-3);
// Glättung geschlossen: 12-Eck auf dem Kreis r50 → Fläche nahe π r², Punkte bleiben nahe am Kreis
const dod = []; for (let i = 0; i < 12; i++) { const t = i / 12 * 2 * Math.PI; dod.push({ x: 50 * Math.cos(t), z: 50 * Math.sin(t) }); }
const sm12 = Core.closedSmooth(dod).map(p => ({ x: p.x, y: p.z }));
check('12-Eck geglättet, Fläche ≈ π·50² [mm²]', Core.prismShell(sm12, 1, 0, 0).A, Math.PI * 2500, 3e-3);
check('12-Eck geglättet läuft durch die Kontrollpunkte', Core.closedSmooth(dod)[30].x, dod[3].x, 1e-9);
// ---- Tülle, Deckel, Anbaumassen ----
// Zylinder r40 h100, gerade Tülle vom Ansatz (40,20) zur Spitze (60,70): kommunizierende Gefäße
const spT = P([[40, 20], [60, 70]]), capG = (g, th) => g.vol(g.spill(th), th) / 1000;
const gTu = Core.geoRot(cyl.S, cyl.s, null, { spout: spT });
check('Tülle unter Rand: Fassungsvermögen bis Spitze [ml]', capG(gTu, 0), Math.PI * 1600 * 70 / 1000);
check('Tülle über Rand (Spitze z120): Rand begrenzt [ml]', capG(Core.geoRot(cyl.S, cyl.s, null, { spout: P([[40, 20], [60, 120]]) }), 0), Math.PI * 1600 * 100 / 1000);
check('Tülle + Deckel: weiterhin bis Spitze [ml]', capG(Core.geoRot(cyl.S, cyl.s, null, { spout: spT, lid: true }), 0), Math.PI * 1600 * 70 / 1000);
// halbvoll: Spiegel z(x) = 50 + x·tanθ erreicht die Spitze (60,70) bei tanθ = 20/60
const cSp = Core.tiltCurveG(gTu, Math.PI * 1600 * 50, 3600); k = 0; while (cSp[k] >= Math.PI * 1600 * 50 * 0.9999) k++;
check('Tülle, halbvoll: Ausgießbeginn über die Spitze [°]', k * 180 / 3600, Math.atan(1 / 3) / D, 2e-3);
// Tülle mit Buckel: höchster Punkt des Weges (z 90) zählt, nicht die tiefere Spitze (z 70)
check('Tülle mit Buckel: höchster Wegpunkt begrenzt [ml]', capG(Core.geoRot(cyl.S, cyl.s, null, { spout: P([[40, 20], [55, 90], [70, 70]]) }), 0), Math.PI * 1600 * 90 / 1000);
const cLid = Core.tiltCurveG(Core.geoRot(cyl.S, cyl.s, null, { lid: true }), Math.PI * 1600 * 50, 360);
check('Deckel zu, ohne Tülle: bei 180° nichts ausgelaufen [ml]', cLid[360] / 1000, Math.PI * 1600 * 50 / 1000, 1e-9);
const tb = Core.tube(P([[0, 0], [0, 100]]), 10, 8);
check('Rohr l100 Ø10/8: Volumen [mm³]', tb.vol, 100 * Math.PI * 36 / 4);
check('Rohr: Schwerpunkt z [mm]', tb.z, 50);
// Kippen mit außermittigem Gefäß-SP (Henkel): leer = atan((rf − x)/(z − zst))
check('Leer, SP außermittig x −10: Kippwinkel [°]', Core.tipAngleG(Core.geoRot(cyl.S, cyl.s), 0, 500, -10, 40, 42, -5), Math.atan(52 / 45) / D, 2e-3);
// Umstoßkraft mit außermittigem Schwerpunkt: Hebelarm = Standkante − x_SP (leer, cogG liefert x)
{ const g = Core.cogG(Core.geoRot(cyl.S, cyl.s), 0, 0, 500, -10, 40);
  check('Umstoßkraft SP x −10, Kante 42, h 100 [N]', Core.pushForce(g.m, 42 - g.x, 100), 0.5 * 9.81 * 52 / 100); }
// Gegenrichtung beim Drehkörper = gespiegelter Schwerpunkt: SP x −10 nach −x gekippt ≡ SP +10 nach +x
check('Gegenseite: SP x −10 zur −x-Kante [°]', Core.tipAngleG(Core.geoRot(cyl.S, cyl.s), 0, 500, 10, 40, 42, -5), Math.atan(32 / 45) / D, 2e-3);
// Konturprüfung: Selbstkreuzung (offen/geschlossen) und abwärts laufende Wand
check('Becher kreuzt sich nicht', +Core.selfCross(P([[0, 0], [33, 0], [36, 3], [40, 95]]), false), 0, 0);
check('Schleife kreuzt sich', +Core.selfCross(P([[0, 0], [40, 0], [40, 60], [10, 30], [60, 30]]), false), 1, 0);
check('Quadrat geschlossen ok', +Core.selfCross(P([[0, 0], [10, 0], [10, 10], [0, 10]]), true), 0, 0);
check('Achterschleife geschlossen kreuzt', +Core.selfCross(P([[0, 0], [10, 10], [10, 0], [0, 10]]), true), 1, 0);
// ---- Taschenmodell: getrennte Wasserkörper mit eigenem Spiegel (Schichten 250) ----
const pg = (a, opt = {}) => { const s = Core.trimLip(Core.sampled(P(a), false)); return Core.pocketGraph(Core.buildSlices(Core.interiorPolygon(s), 250), s, opt); };
const ml = l => l.map(x => x.W / 1000), gC = pg([[0, 0], [40, 0], [40, 100]]);
check('Taschen: Zylinder Fassungsvermögen [ml]', Core.lakeSum(Core.fillLakes(gC, 1e9).lakes) / 1000, Math.PI * 1600 * 100 / 1000);
check('Taschen: Zylinder voll, 20° [ml]', Core.tiltRun(gC, Math.PI * 1600 * 100, 360).ret[40] / 1000, Math.PI * 1600 * (100 - 40 * Math.tan(20 * D)) / 1000);
{ const r = Core.tiltRun(gC, Math.PI * 1600 * 50, 1800).ret; let k = 0; while (r[k] >= Math.PI * 1600 * 50 * 0.9999) k++;
  check('Taschen: Zylinder halbvoll, Ausgießbeginn [°]', k * 180 / 1800, Math.atan(1.25) / D, 2e-3); }
// Doppelbecken: Innenbecher r20 h50 (Wand 2 mm) in Ringrinne r22…40, Außenwand h100; Strahl fällt in den Becher
const gD = pg([[0, 0], [20, 0], [20, 50], [22, 50], [22, 0], [40, 0], [40, 100]]), A1 = Math.PI * 400, A2 = Math.PI * (1600 - 484);
{ const f = Core.fillLakes(gD, 40000).lakes;
  check('Doppelbecken 40 ml: ein See im Becher, Spiegel [mm]', f.length === 1 ? f[0].L : -1, 40000 / A1); }
{ const f = Core.fillLakes(gD, 100000).lakes.sort((a, b) => b.L - a.L);
  check('Doppelbecken 100 ml: Becher voll [ml]', f.length === 2 ? f[0].W / 1000 : -1, A1 * 50 / 1000);
  check('Doppelbecken 100 ml: Überlauf in der Rinne, Spiegel [mm]', f.length === 2 ? f[1].L : -1, (100000 - A1 * 50) / A2); }
check('Doppelbecken 300 ml: vereinigt, Spiegel [mm]', Core.fillLakes(gD, 300000).lakes[0].L, 50 + (300000 - (A1 + A2) * 50) / (Math.PI * 1600));
check('Doppelbecken Fassungsvermögen = Zylinder − Wand [ml]', Core.lakeSum(Core.fillLakes(gD, 1e9).lakes) / 1000, (Math.PI * 1600 * 100 - Math.PI * 84 * 50) / 1000);
// 40 ml, auf 50° gekippt: Becher hält π r²(h − r tanθ), der Rest läuft in die Rinne, nichts geht verloren
{ const t = Core.tiltRun(gD, 40000, 180).lakes[50], cup = t.reduce((m, l) => (l.L > m.L ? l : m)); // Becher = höherer Spiegel
  check('Doppelbecken 50°: Becher hält [ml]', cup.W / 1000, A1 * (50 - 20 * Math.tan(50 * D)) / 1000);
  check('Doppelbecken 50°: nichts ausgelaufen [ml]', Core.lakeSum(t) / 1000, 40); }
// Flasche 10° nach unten (100°): Bauch r40 h100, flache Schulter, Hals r10 bis z150. Der Bauch hält Wasser bis zur
// Halsunterkante (10|100), obwohl die Mündung tiefer liegt (alte Annahme „ein Becken am tiefsten Wandpunkt“ ergab leer)
{ const gB = pg([[0, 0], [40, 0], [40, 100], [10, 100], [10, 150]]), th = 100 * D, L = 100 * Math.cos(th) - 10 * Math.sin(th);
  const r = Core.tiltRun(gB, Math.PI * (1600 * 100 + 100 * 50), 180);
  check('Flasche 100°: Bauch hält bis zur Halsunterkante [ml]', r.ret[100] / 1000, Core.volBelow(cyl.S, L, th) / 1000, 3e-3); }
// Zickzackwand (Ringrinnen): Inhalt nimmt beim Kippen nie zu, am Anfang die Füllmenge
{ const gZ = pg([[0, 0], [15, 0], [25, 120], [35, 20], [45, 120], [55, 20], [65, 130]]), r = Core.tiltRun(gZ, 500000, 180).ret;
  let up = 0; for (let k = 1; k <= 180; k++) up = Math.max(up, r[k] - r[k - 1]);
  check('Zickzack: Füllmenge erhalten [ml]', r[0] / 1000, 500); check('Zickzack: Inhalt steigt nie [mm³]', up, 0, 1e-6); }
// Tülle (kommunizierende Gefäße) und Kippwinkel im Taschenmodell = bisherige Lösungen
check('Taschen: Tülle unter Rand, bis Spitze [ml]', Core.lakeSum(Core.fillLakes(pg([[0, 0], [40, 0], [40, 100]], { spout: spT }), 1e9).lakes) / 1000, Math.PI * 1600 * 70 / 1000, 3e-3);
{ const r = Core.tiltRun(pg([[0, 0], [40, 0], [40, 100]], { spout: spT }), Math.PI * 1600 * 50, 1800).ret; let k = 0; while (r[k] >= Math.PI * 1600 * 50 * 0.9999) k++;
  check('Taschen: Tülle halbvoll, Ausgießbeginn [°]', k * 180 / 1800, Math.atan(1 / 3) / D, 4e-3); } // 250 Schichten: ±0,07°
check('Taschen: Deckel ohne Tülle, 180° nichts verloren [ml]', Core.tiltRun(pg([[0, 0], [40, 0], [40, 100]], { lid: true }), Math.PI * 1600 * 50, 90).ret[90] / 1000, Math.PI * 1600 * 50 / 1000, 1e-6);
check('Taschen: Kippwinkel 60 % = geschlossene Lösung [°]', Core.tipAngleP(gC, V60, mvC, 0, shC.z, 25, shC.zst), Core.tipAngle(cyl.S, cyl.s, V60, mvC, shC.z, 25, shC.zst), 2e-3);
// ---- Zwei Konturen (Schlauch mit Kreisquerschnitten zwischen hinten A und vorne B) ----
const tgr = (A, B) => Core.tubeGraph(Core.resample(P(A), 250), Core.resample(P(B), 250));
const tvol = g => { const o = new Float64Array(4); let V = 0; for (let i = 0; i < g.n; i++) { g.vol(i, 1e9, 1, 0, o); V += o[0]; } return V / 1000; };
const gTc = tgr([[-40, 0], [-40, 100]], [[40, 0], [40, 100]]);
check('Schlauch symmetrisch = Zylinder, Fassungsvermögen [ml]', Core.lakeSum(Core.fillLakes(gTc, 1e9).lakes) / 1000, Math.PI * 1600 * 100 / 1000);
check('Schlauch symmetrisch, voll 20° [ml]', Core.tiltRun(gTc, Math.PI * 1600 * 100, 360).ret[40] / 1000, Math.PI * 1600 * (100 - 40 * Math.tan(20 * D)) / 1000);
{ const r = Core.tiltRun(gTc, Math.PI * 1600 * 50, 1800).ret; let k = 0; while (r[k] >= Math.PI * 1600 * 50 * 0.9999) k++;
  check('Schlauch symmetrisch, halbvoll Ausgießbeginn [°]', k / 10, Math.atan(1.25) / D, 2e-3); }
check('Schiefer Zylinder (waagrechte Kreise) = π r² h [ml]', tvol(tgr([[-40, 0], [-10, 100]], [[40, 0], [70, 100]])), Math.PI * 1600 * 100 / 1000);
{ const a = 20 * D, s = Math.sin(a), c = Math.cos(a); // Achse um 20° geneigt, Boden senkrecht dazu
  const g = tgr([[-40 * c, 40 * s], [-40 * c + 100 * s, 40 * s + 100 * c]], [[40 * c, -40 * s], [40 * c + 100 * s, -40 * s + 100 * c]]);
  check('Geneigter Zylinder: Fassungsvermögen π r²(h − r tanα) [ml]', Core.lakeSum(Core.fillLakes(g, 1e9).lakes) / 1000, Math.PI * 1600 * (100 - 40 * Math.tan(a)) / 1000); }
{ const tor = (Rc, r) => { const A = [], B = []; for (let i = 0; i <= 90; i++) { const t = i * D; A.push([(Rc - r) * Math.sin(t), Rc - (Rc - r) * Math.cos(t)]); B.push([(Rc + r) * Math.sin(t), Rc - (Rc + r) * Math.cos(t)]); } return tgr(A, B); };
  check('Viertel-Torus Rc100 r30: Volumen π r²·Rc·π/2 [ml]', tvol(tor(100, 30)), Math.PI * 900 * 100 * Math.PI / 2 / 1000, 2e-3);
  check('Zu eng gebogen (Rc20 < r30) wird erkannt', +!!tor(20, 30).bad, 1, 0); }
{ const sh = Core.tubeShell(Core.resample(P([[-40, 0], [-40, 100]]), 250), Core.resample(P([[40, 0], [40, 100]]), 250), 2, 5);
  check('Schlauch-Schale symmetrisch = Zylinderschale [mm³]', sh.vol, shC.vol, 1e-9); check('Schlauch-Schale SP z [mm]', sh.z, shC.z, 1e-9);
  check('Schlauch: Kippwinkel 60 % = geschlossene Lösung [°]', Core.tipAngleP(gTc, V60, mvC, 0, shC.z, 25, shC.zst), Core.tipAngle(cyl.S, cyl.s, V60, mvC, shC.z, 25, shC.zst), 2e-3); }
// Profil ohne Innenraum (flach bzw. nur auf der Achse): kein Absturz, Fassungsvermögen 0
for (const [name, a] of [['flach', [[0, 0], [40, 0], [40, 0]]], ['auf der Achse', [[0, 0], [0, 100]]]]) {
  const s0 = Core.trimLip(Core.sampled(P(a), true)), g0 = Core.pocketGraph(Core.buildSlices(Core.interiorPolygon(s0), 250), s0, {});
  check('Ohne Innenraum (' + name + '): Fassungsvermögen [ml]', Core.lakeSum(Core.fillLakes(g0, 1e6).lakes) / 1000, 0, 0);
  check('Ohne Innenraum (' + name + '): Kipplauf 180° [ml]', Core.tiltRun(g0, 1e5, 36).ret[36], 0, 0);
  check('Ohne Innenraum (' + name + '): Kippwinkel ohne Wasser = atan(40/10) [°]', Core.tipAngleP(g0, 1e5, 100, 0, 5, 40, -5), Math.atan(4) / D, 2e-3);
}

// ---- Schwappen (v1.10): lineares Modalmodell je Wasserkörper ----
{ const h = 1e-6; check('J1(1) [–]', Core.J1(1), 0.4400505857, 1e-9);
  check('J1′(ξ) = 0 bei ξ = 1,8412', (Core.J1(1.8411837813 + h) - Core.J1(1.8411837813 - h)) / (2 * h), 0, 1e-7); }
const XI = 1.8411837813, GM = Core.GMM, fCyl = (R, h) => Math.sqrt(GM * XI / R * Math.tanh(XI * h / R)) / (2 * Math.PI);
{ const lk = Core.fillLakes(gC, Math.PI * 1600 * 50).lakes[0], sf = Core.lakeSurf(gC, lk, 0), cf = Core.sloshCoef(sf, lk.W, true);
  check('Schwappen Zylinder r40 h50: Spiegelfläche [mm²]', sf.A, Math.PI * 1600, 2e-3);
  check('Schwappen Zylinder: zweites Moment π r⁴/4 [mm⁴]', sf.I, Math.PI * 40 ** 4 / 4, 3e-3);
  check('Schwappen Zylinder: f1 = √(gξ/R·tanh(ξh/R))/2π [Hz]', cf.f, fCyl(40, 50), 2e-3);
  check('Schwappen Zylinder: halbe Spiegelbreite [mm]', cf.a, 40, 3e-3);
  check('Schwappen Zylinder: Ersatzpendel dP = (2R/ξ)·tanh(ξh/2R) [mm]', cf.dP, 2 * 40 / XI * Math.tanh(XI * 50 / 80), 3e-3);
  check('Schwappen Zylinder: Dämpfung Wasser ζ (Mikishev) [%]', cf.ze * 100,
    4.98 * 40 ** -0.75 * GM ** -0.25 * (1 + 0.318 / Math.sinh(1.84 * 1.25) * (1 - 0.25 / Math.cosh(1.84 * 1.25))) / (2 * Math.PI) * 100, 3e-3); }
// 20° gekippt: Spiegel = Ellipse, Halbachsen a = R/cosθ (Kippebene) und R → A = π a R, I = π a³ R/4
{ const lk = Core.tiltRun(gC, Math.PI * 1600 * 50, 360).lakes[40][0], sf = Core.lakeSurf(gC, lk, 20 * D), a = 40 / Math.cos(20 * D);
  check('Schwappen Zylinder 20°: Spiegel-Ellipse Fläche [mm²]', sf.A, Math.PI * a * 40, 3e-3);
  check('Schwappen Zylinder 20°: Ellipse I = π a³ R/4 [mm⁴]', sf.I, Math.PI * a ** 3 * 40 / 4, 5e-3); }
{ const lk = Core.fillLakes(gTc, Math.PI * 1600 * 50).lakes[0], cf = Core.sloshCoef(Core.lakeSurf(gTc, lk, 0), lk.W, true);
  check('Schwappen Zwei Konturen symmetrisch = Zylinder f1 [Hz]', cf.f, fCyl(40, 50), 3e-3); }
{ const g = Core.prism(rect(160, 100), 100), L = Core.solveLG(g, 160 * 100 * 40, 0, 0, 100), cf = Core.sloshCoef(g.surf(L, 0), 160 * 100 * 40, false);
  check('Schwappen Quader 160×100, h40: f1 = √(gπ/L·tanh(πh/L))/2π [Hz]', cf.f, Math.sqrt(GM * Math.PI / 160 * Math.tanh(Math.PI * 40 / 160)) / (2 * Math.PI), 1e-3);
  check('Schwappen Quader: Randhubfaktor 8/π²', cf.kap, 8 / Math.PI ** 2, 1e-12);
  const cc = Core.sloshCoef(pc.surf(50, 0), Math.PI * 1600 * 50, false);
  check('Schwappen Kreis-Grundriss (Quader-Kalibrierung) ≈ Zylinder, ±1,5 % [Hz]', cc.f, fCyl(40, 50), 1.5e-2); }
// Zeitverhalten: exakter Schritt; ein großer Schritt = viele kleine; Gleichgewicht −a/g; Resonanzkurve; Anhalten (Rechteckstoß)
{ const om = 20, ze = 0.02, a = [0.1, 0.5], b = [0.1, 0.5];
  Core.sloshStep(a, om, ze, 0, 0.2, 0, 30, 1); for (let k = 0; k < 1000; k++) Core.sloshStep(b, om, ze, 0.2 * k / 1000, 0.2 * (k + 1) / 1000, 30 * k / 1000, 30 * (k + 1) / 1000, 1e-3);
  check('Schwappen: ein Schritt 1 s = 1000 Schritte 1 ms (s)', a[0], b[0], 1e-9); check('Schwappen: ein Schritt = viele (w)', a[1], b[1], 1e-9); }
{ const om = 18, ze = 0.05, acc = 2000, d = [0, 0]; for (let t = 0; t < 20; t += 1e-3) Core.sloshStep(d, om, ze, 0, 0, acc * t * t / 2, acc * (t + 1e-3) ** 2 / 2, 1e-3);
  check('Schwappen: konstante Beschleunigung 2 m/s² → s = −a/g [rad]', d[0], -acc / GM, 1e-4); }
{ const om = 21, ze = 0.01, A = 5, W = 19, d = [0, 0]; let m = 0;
  for (let t = 0; t < 60; t += 1e-3) { Core.sloshStep(d, om, ze, 0, 0, A * Math.sin(W * t), A * Math.sin(W * (t + 1e-3)), 1e-3); if (t > 52) m = Math.max(m, Math.abs(d[0])); }
  check('Schwappen: eingeschwungen bei 0,9·ω gegen Resonanzkurve [rad]', m, Core.sloshSteady(om, ze, A, W), 3e-3); }
for (const T of [0.05, 0.4]) { const om = 20, v = 1000, a = v / T;
  const pk = Core.sloshPeak(om, 0, t => t < T ? v * (t - t * t / (2 * T)) : v * T / 2, T + 2, v, 1e-4);
  check('Schwappen: Anhalten 1 m/s in ' + T + ' s, ungedämpft (a/g)·(ωT ≥ π ? 2 : 2 sin ωT/2) [rad]', pk, a / GM * (om * T >= Math.PI ? 2 : 2 * Math.sin(om * T / 2)), 2e-3); }
// Drehen um die Spiegelmitte (tiefe Füllung): s springt um δ·((ω²/g)·dP − 1), tief → δ (Spiegel kippt doppelt so weit wie das Gefäß)
{ const g = pg([[0, 0], [40, 0], [40, 260]]), lk = Core.fillLakes(g, Math.PI * 1600 * 200).lakes[0], cf = Core.sloshCoef(Core.lakeSurf(g, lk, 0), lk.W, true);
  const dl = 0.01, d = [0, 0], xw = th => -cf.dP * Math.sin(th); // Drehpunkt = Spiegelmitte, P liegt dP darunter
  Core.sloshStep(d, cf.om, cf.ze, 0, dl, 0, xw(dl), 1e-3);
  check('Schwappen: Drehen um Spiegelmitte, Sprung s/δ', d[0] / dl, cf.om ** 2 / GM * cf.dP - 1, 3e-2);
  check('Schwappen: tief (h/R = 5) → s/δ ≈ 1', cf.om ** 2 / GM * cf.dP - 1, 1, 1e-3); }
// Überschwappen: Zylinder r40 h100, 90 mm gefüllt → Freibord 10 mm = Randhub a·κ·s*; großer Hub → Rest = Fassung bei atan(κs)
{ const lk = Core.fillLakes(gC, Math.PI * 1600 * 90).lakes[0], cf = Core.sloshCoef(Core.lakeSurf(gC, lk, 0), lk.W, true);
  check('Schwappen: Freibord 10 mm = Randhub ab dem es überläuft [mm]', cf.kap * cf.a * Core.sloshLimit(gC, lk, 0, cf.kap, 1), 10, 2e-2);
  check('Schwappen: Freibord Gegenrichtung gleich (symmetrisch) [mm]', cf.kap * cf.a * Core.sloshLimit(gC, lk, 0, cf.kap, -1), 10, 2e-2);
  const s = 25 / 40 / cf.kap, r = Core.sloshSpill(gC, 0, [lk], [[s, 0]], cf.kap), left = Math.PI * 1600 * (100 - 25);
  check('Schwappen: Randhub 25 mm → im Gefäß bleibt π r²(H − 25) [ml]', Core.lakeSum(r.lakes) / 1000, left / 1000, 5e-3);
  check('Schwappen: Bilanz gehalten + übergeschwappt [ml]', (Core.lakeSum(r.lakes) + r.lost) / 1000, Math.PI * 1600 * 90 / 1000, 1e-6);
  check('Schwappen: Zustand bleibt erhalten', r.sts[0][0], s, 1e-12);
  const r0 = Core.sloshSpill(gC, 0, [lk], [[1e-4, 0]], cf.kap);
  check('Schwappen: kleiner Hub ändert nichts (gleiches Objekt)', +(r0.lakes[0] === lk), 1, 0); }
// Taschen: voller Innenbecher schwappt in die Ringrinne – nichts geht verloren, die Rinne nimmt es auf
{ const f = Core.fillLakes(gD, 100000).lakes.sort((a, b) => b.L - a.L), cup = f[0], ring = f[1];
  const r = Core.sloshSpill(gD, 0, f, [[0.1, 0], [0, 0]], 2 / (XI * XI - 1)), cup2 = r.lakes.find(l => l.nodes.includes(cup.nodes[0]));
  check('Schwappen Taschen: Becher → Rinne, nichts verloren [ml]', r.lost / 1000, 0, 1e-9);
  check('Schwappen Taschen: Gesamtmenge erhalten [ml]', Core.lakeSum(r.lakes) / 1000, 100, 1e-9);
  check('Schwappen Taschen: Becher verliert, was die Rinne gewinnt [ml]', (cup.W - cup2.W) / 1000, (Core.lakeSum(r.lakes) - cup2.W - ring.W) / 1000, 1e-9);
  check('Schwappen Taschen: Becher hat abgegeben', +(cup2.W < cup.W - 100), 1, 0);
  check('Schwappen Taschen: Ringrinne Spiegelfläche π(40² − 22²) [mm²]', Core.lakeSurf(gD, ring, 0).A, Math.PI * (1600 - 484), 5e-3);
  const kp = 2 / (XI * XI - 1), rise = kp * 20 * Core.sloshLimit(gD, cup, 0, kp, 1);
  check('Schwappen Taschen: voller Becher schwappt sofort über (Freibord < 1 Schicht 0,4 mm)', +(rise < 0.4), 1, 0); }
{ const old = [{ W: 1, nodes: [0, 1] }, { W: 3, nodes: [2] }, { W: 2, nodes: [5] }], sts = [[0.4, 1], [0, -1], [0.2, 0]];
  const n = Core.sloshInherit(6, old, sts, [{ nodes: [1, 2] }, { nodes: [5] }, { nodes: [4] }]);
  check('Schwappen: Vereinigen massengewichtet', n[0][0], 0.1, 1e-12); check('Schwappen: Teilen/Fortführen erbt', n[1][0], 0.2, 1e-12);
  check('Schwappen: neuer See ruht', n[2][0], 0, 0); }
// Kippen nach −x (für Schwappen nötig): Drehkörper und Grundriss spiegelbildlich
{ let lakes = Core.fillLakes(gC, Math.PI * 1600 * 100).lakes; for (let a = 0; a > -20; a -= 0.5) lakes = Core.settle(gC, (a - 0.5) * D, lakes, a * D).lakes;
  check('Taschen: Zylinder voll, −20° = +20° [ml]', Core.lakeSum(lakes) / 1000, Math.PI * 1600 * (100 - 40 * Math.tan(20 * D)) / 1000);
  check('Taschen: −20° Schwerpunkt x spiegelbildlich [mm]', Core.lakeMoments(gC, lakes, -20 * D).Mx, -Core.lakeMoments(gC, Core.tiltRun(gC, Math.PI * 1600 * 100, 360).lakes[40], 20 * D).Mx, 2e-3); }
check('Quader voll, −20° über die 120er-Seite [ml]', capP(pr, -20 * D), 120 * 80 * (100 - 60 * Math.tan(20 * D)) / 1000);
check('Schwappen Quader halbvoll: Freibord 50 mm (Ebene bis Rand) [mm]', 8 / Math.PI ** 2 * 60 * Core.sloshLimitG(pr, 120 * 80 * 50, 0, 8 / Math.PI ** 2, 1), 50, 1e-3);
// Wehr: Keilvolumen über dem Kreisrand gegen numerisches Integral, Abfluss Q = 0,4·√(2g)·b·H^1,5 für kleine dt
{ const a = 40, m = 0.3, cap = dd => { let V = 0; const n = 20000; for (let k = 0; k < n; k++) { const x = a - dd + (k + 0.5) * dd / n; V += m * (x - a + dd) * 2 * Math.sqrt(a * a - x * x) * dd / n; } return V; };
  const dd = 2, V = cap(dd), dt = 1e-5, q = Core.weirOut(V, m, a, dt) / dt, Hq = m * dd, bq = 2 * Math.sqrt(2 * a * dd - dd * dd);
  check('Wehr: Keil δ = 2 mm über Kreisrand r40 → Abfluss wie mit exaktem δ [mm³/s]', q, 0.4 * Math.sqrt(2 * GM) * bq * Hq ** 1.5, 3e-2);
  check('Wehr: Tülle begrenzt die Breite auf Ø 10 mm [mm³/s]', Core.weirOut(V, m, a, dt, 10) / dt, 0.4 * Math.sqrt(2 * GM) * 10 * Hq ** 1.5, 3e-2);
  check('Wehr: höchstens der Keil selbst [mm³]', Core.weirOut(V, m, a, 100), V, 1e-12); }
{ const lk = Core.fillLakes(gC, Math.PI * 1600 * 90).lakes[0], kp = 2 / (XI * XI - 1), s = 25 / 40 / kp;
  const r = Core.sloshSpill(gC, 0, [lk], [[s, 0]], kp, 0.01, [40]), out = Math.PI * 1600 * 90 - Core.lakeSum(r.lakes);
  check('Schwappen mit Wehr: Bilanz gehalten + übergeschwappt [ml]', (Core.lakeSum(r.lakes) + r.lost) / 1000, Math.PI * 1600 * 90 / 1000, 1e-6);
  check('Schwappen mit Wehr: in 10 ms weniger als der ganze Keil', +(out > 0 && out < Math.PI * 1600 * 15 * 0.5), 1, 0); }
// Brechen: Resonanz ohne Grenze wächst über alle Maßen, mit smax bleibt |s| ≤ smax und ṡ = 0 an der Grenze
{ const om = 20, d = [0, 0], e = [0, 0]; let m = 0;
  for (let t = 0; t < 10; t += 1e-3) { const x0 = 10 * Math.sin(om * t), x1 = 10 * Math.sin(om * (t + 1e-3)); Core.sloshStep(d, om, 0.005, 0, 0, x0, x1, 1e-3); Core.sloshStep(e, om, 0.005, 0, 0, x0, x1, 1e-3, 0.5); m = Math.max(m, Math.abs(e[0])); }
  check('Brechen: ohne Grenze bei Resonanz |s| > 5', +(Math.abs(d[0]) > 5 || Math.abs(d[1]) > 100), 1, 0);
  check('Brechen: mit Grenze |s| ≤ 0,5', m, 0.5, 1e-12); }
// Randhubfaktor unabhängig: ebene Neigung r·cosφ auf die Eigenform projiziert, Randwert der Projektion / Randwert der Ebene
{ const n = 20000; let a = 0, b = 0; for (let k = 0; k < n; k++) { const r = (k + 0.5) / n, j = Core.J1(XI * r); a += r * j * r; b += j * j * r; }
  check('Randhubfaktor Kreis: Projektion von r·cosφ auf J1(ξr/R), Rand [–]', a / b * Core.J1(XI), Core.sloshCoef({ A: 1, I: 1, ua: 0, ub: 1, uc: 0 }, 1, true).kap, 1e-6);
  let c = 0, e = 0; for (let k = 0; k < n; k++) { const x = -0.5 + (k + 0.5) / n, f = Math.sin(Math.PI * x); c += x * f; e += f * f; }
  check('Randhubfaktor Rechteck: Projektion von x auf sin(πx/L), Rand / (L/2)', c / e * 2, Core.sloshCoef({ A: 1, I: 1, ua: 0, ub: 1, uc: 0 }, 1, false).kap, 1e-6); }
{ const g = pg([[0, 0], [40, 0], [40, 100]], { lid: true }), lk = Core.fillLakes(g, 1e9).lakes[0];
  check('Schwappen: Deckel zu, randvoll → kein freier Spiegel', +(Core.lakeSurf(g, lk, 0) === null), 1, 0); }
// Werkstoffe im CORE (Konvention „Werkstoffe“; Dichten prüft tools/test.js gegen die Material-Karte)
check('Gefäßwerkstoffe mit base', Object.values(Core.MAT).filter(m => m.base).length, 5, 0);
