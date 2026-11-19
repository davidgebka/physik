// Verifikation gegen analytische Fälle. Ausführen: node <modul>/test.js
const Core = require('../tools/load-core')(__dirname);
const check = require('../tools/check');
check('Beispiel', Core.beispiel(2), 4);
