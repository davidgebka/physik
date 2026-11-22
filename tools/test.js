// Modulübergreifende Konsistenz der Werkstoffe. Ausführen: node tools/test.js
// 1. shared/materials.js deckt sich mit dem Datensatz der Material-Karte (Schlüssel, Name, Familie).
// 2. Jede Modul-Materialtabelle im CORE (Core.MAT, Objekt oder Liste) verweist mit base auf einen bekannten Schlüssel
//    (base: null = bewusst ohne Werkstoff, z. B. „Stoff hell“ in Licht).
// 3. Führt ein Eintrag eine eigene Dichte rho [kg/m³], liegt sie in der Spanne der Material-Karte (±10 %).
const fs = require('fs'), path = require('path');
const loadCore = require('./load-core');
const DPM = require('../shared/materials.js');
const root = path.join(__dirname, '..');
let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.log('✗ ' + msg); } };

const KARTE = loadCore(path.join(root, 'material')).MAT, byK = Object.fromEntries(KARTE.map(m => [m.k, m]));
for (const m of KARTE) ok(DPM[m.k] && DPM[m.k][0] === m.n && DPM[m.k][1] === m.fam, `materials.js fehlt/abweichend: ${m.k} (${m.n}, ${m.fam})`);
for (const k of Object.keys(DPM)) ok(byK[k], `materials.js: ${k} nicht in der Material-Karte`);

const mods = fs.readdirSync(root).filter(d => d !== 'material' && fs.existsSync(path.join(root, d, 'index.html')) && /CORE START/.test(fs.readFileSync(path.join(root, d, 'index.html'), 'utf8')));
const stat = [];
for (const d of mods) {
  const T = loadCore(path.join(root, d)).MAT; if (!T || typeof T !== 'object') continue;
  const rows = Array.isArray(T) ? T.map(m => [m.k, m]) : Object.entries(T);
  let n = 0;
  for (const [k, m] of rows) {
    if (!('base' in m)) continue; n++;
    if (m.base === null) continue;
    ok(DPM[m.base], `${d}: ${k} → base '${m.base}' unbekannt`);
    const r = byK[m.base] && byK[m.base].rho;
    if (r && typeof m.rho === 'number') ok(m.rho >= 0.9 * r[0] && m.rho <= 1.1 * r[1], `${d}: ${k} Dichte ${m.rho} kg/m³ außerhalb ${r[0]}–${r[1]} (${m.base})`);
  }
  stat.push(`${d} ${n}/${rows.length}`);
}
console.log(`Werkstoffe: ${Object.keys(DPM).length} Schlüssel · Tabellen mit base: ${stat.join(', ') || '–'} · ${checks} Prüfungen`);
console.log(fails ? fails + ' Fehler' : 'Alle Tests bestanden.'); if (fails) process.exitCode = 1;
