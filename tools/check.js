// Mini-Testrahmen: check(name, ist, soll, tol) – relativ |ist − soll| ≤ tol·|soll|; nur bei soll = 0 absolut ≤ tol
let fails = 0;
function check(name, got, want, tol = 1e-3) {
  const ok = Math.abs(got - want) <= tol * (want === 0 ? 1 : Math.abs(want));
  if (!ok) fails++;
  console.log((ok ? '✓ ' : '✗ ') + name + ': ' + got.toFixed(3) + ' (soll ' + want.toFixed(3) + ')');
}
process.on('exit', () => { if (fails) { console.log(fails + ' Fehler'); process.exitCode = 1; } else console.log('Alle Tests bestanden.'); });
module.exports = check;
