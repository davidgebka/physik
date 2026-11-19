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
