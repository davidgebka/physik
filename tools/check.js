// Mini-Testrahmen: check(name, ist, soll, relTol)
let fails = 0;
function check(name, got, want, tol = 1e-3) {
  const ok = Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  if (!ok) fails++;
  console.log((ok ? '✓ ' : '✗ ') + name + ': ' + got.toFixed(3) + ' (soll ' + want.toFixed(3) + ')');
}
process.on('exit', () => { if (fails) { console.log(fails + ' Fehler'); process.exitCode = 1; } else console.log('Alle Tests bestanden.'); });
module.exports = check;
