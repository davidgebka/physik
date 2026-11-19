// Lädt den Rechenkern (// === CORE START … CORE END) eines Moduls in Node.
// Nutzung in <modul>/test.js:  const Core = require('../tools/load-core')(__dirname);
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function loadCore(dir) {
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  const m = html.match(/\/\/ === CORE START([\s\S]*?)\/\/ === CORE END/);
  if (!m) throw new Error('Kein CORE-Block in ' + dir);
  const ctx = { module: { exports: {} }, console }; // eigenes Math des Kontexts: fremdes Math optimiert V8 nicht (Licht-Test ~2,4× langsamer)
  vm.runInNewContext(m[1], ctx);
  return ctx.module.exports;
};
