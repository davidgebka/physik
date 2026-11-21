// Designphysik – gemeinsame Hilfsfunktionen (globale Namen, kein Build-Schritt).
// Einbinden vor dem Modul-Skript:  <script src="../shared/util.js"></script>

// ---- Modul-Registry: einzige Stelle, an der Module angemeldet werden ----
const DP_MODULES = [
  { key: 'gefaess', name: 'Gefäß',  title: 'Gefäß & Kippen',  desc: 'Volumen, Eichstriche, Ausgießen über Neigung', ready: true, color: '--water' },
  { key: 'licht',   name: 'Licht',  title: 'Lampenschirm',    desc: 'Schirm zeichnen: Lichtverteilung, Beleuchtungsstärke, Leuchtdichte, Blendung', ready: true, color: '--light' },
  { key: 'mechanismus', name: 'Mechanik', title: 'Mechanismen', desc: 'Gelenkgetriebe skizzieren und bewegen: Bahnkurve, Totlagen, Übertragungswinkel, Haltemoment', ready: true, color: '--mech' },
  { key: 'last',    name: 'Last',   title: 'Belastung',       desc: 'Balken: Durchbiegung, Spannung, Sicherheit, Knicken, Eigenfrequenz', ready: true, color: '--load' }
];

// Kopfzeile mit Modulnavigation in <header id="dp-header"> rendern; Modulquadrat in der Familienfarbe (Styleguide § 4)
const dpMq = (m, off) => `<i class="mq${off ? ' off' : ''}" style="--c:var(${m.color})"></i>`;
function dpHeader(activeKey, subtitle) {
  const el = document.getElementById('dp-header'); if (!el) return;
  const cur = DP_MODULES.find(m => m.key === activeKey);
  const nav = DP_MODULES.map(m => m.ready
    ? `<a href="../${m.key}/index.html" class="${m.key === activeKey ? 'on' : ''}">${dpMq(m)}${m.name}</a>`
    : `<span title="folgt">${dpMq(m, true)}${m.name}</span>`).join('');
  el.innerHTML = `<h1><a href="../index.html">Designphysik</a> <small>${cur ? dpMq(cur) : ''}${subtitle || ''}</small></h1><nav>${nav}</nav>`;
}

// ---- DOM / Zahlen ----
const $ = id => document.getElementById(id);
const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
// Tokens ändern sich zur Laufzeit nicht (kein Dunkelmodus): einmal lesen, dann aus dem Speicher (Zeichnen ruft css() tausendfach)
const dpCss = new Map();
const css = v => { let c = dpCss.get(v); if (!c) { c = getComputedStyle(document.documentElement).getPropertyValue(v).trim(); if (c) dpCss.set(v, c); } return c; };

// ---- Canvas ----
// Passt Canvas an CSS-Größe × devicePixelRatio an, liefert {ctx, w, h} in CSS-Pixeln
function prep(cv) {
  const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  const W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, r.width, r.height);
  return { ctx, w: r.width, h: r.height };
}
// Punktraster in mm (Styleguide § 7): Bildschirm = ox + x·k, oy − y·k; fein 10 mm (--dot), grob 5 × fein (--mut).
// Feine Stufe verfünffacht sich, bis die Punkte ≥ 8 px auseinander liegen. Liefert die feine Stufe in mm.
function dpDots(ctx, w, h, k, ox, oy) {
  let f = 10; while (f * k < 8) f *= 5;
  const i0 = Math.ceil(-ox / (f * k)), i1 = Math.floor((w - ox) / (f * k));
  const j0 = Math.ceil((oy - h) / (f * k)), j1 = Math.floor(oy / (f * k));
  for (const big of [false, true]) { // je Stufe ein Pfad: ein fill() statt eines je Punkt
    ctx.beginPath();
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      if ((i % 5 === 0 && j % 5 === 0) !== big) continue;
      const x = Math.round(ox + i * f * k) + .5, y = Math.round(oy - j * f * k) + .5, r = big ? 1.5 : 1;
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 7);
    }
    ctx.fillStyle = css(big ? '--mut' : '--dot'); ctx.fill();
  }
  return f;
}
// Pfad aus Punkten; T: Punkt → [sx, sy]
function polyPath(ctx, pts, T) { ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = T(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); }

// ---- Datei & Teilen (Konvention: {type:"designphysik/<modul>", version, ...}) ----
function dpDownload(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); // sofortiges Freigeben bricht den Download in manchen Browsern ab
}
function dpHashGet(key) {
  const m = location.hash.match(new RegExp('^#' + key + '=(.+)$')); if (!m) return null;
  try { return JSON.parse(decodeURIComponent(m[1])); } catch { return null; }
}
function dpHashSet(key, obj) { history.replaceState(null, '', '#' + key + '=' + encodeURIComponent(JSON.stringify(obj))); return location.href; }

// ---- Entwurfshilfen (konzept.md: Ergebnisse in drei Ebenen, Roadmap „Jetzt“) – arbeiten nur auf dem Exportobjekt ----
// Urteil zuerst: level 0 passt, 1 knapp, 2 kritisch; text in Designsprache; extra z. B. Urteil des gemerkten Stands
function dpVerdict(level, text, extra) {
  return `<div class="stat verdict${level ? ' warn' : ''}" style="grid-column:1/-1"><b>${['✓ passt', '⚠ knapp', '⚠ kritisch'][level]}</b><span>${text}</span>${extra ? `<span>${extra}</span>` : ''}</div>`;
}
// Rückgängig: save(obj) nach jedem abgeschlossenen Schritt (gleicher Zustand → kein Schritt), Knopf und Strg+Z rufen apply(obj) mit dem Vorzustand
function dpHistory(btn, apply, max = 50) {
  const H = []; let last = null;
  const h = {
    save(o) { const j = JSON.stringify(o); if (j !== last) { if (last) H.push(last); if (H.length > max) H.shift(); last = j; } btn.disabled = !H.length; },
    undo() { if (!H.length) return; last = H.pop(); btn.disabled = !H.length; apply(JSON.parse(last)); }
  };
  btn.onclick = h.undo;
  window.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); h.undo(); } });
  return h;
}
// Variantenvergleich: Knopf merkt den aktuellen Zustand get() bzw. hebt den Vergleich auf; onChange(ref | null)
function dpCompare(btn, get, onChange) {
  let ref = null;
  const set = r => { ref = r; btn.textContent = ref ? '✕ Vergleich' : '◫ Stand merken'; btn.classList.toggle('on', !!ref); onChange(ref); };
  btn.textContent = '◫ Stand merken'; btn.title = 'Aktuellen Stand merken und Änderungen damit vergleichen';
  btn.onclick = () => set(ref ? null : JSON.parse(JSON.stringify(get())));
  return { get ref() { return ref; } };
}
// Abweichung zum gemerkten Wert: dpDelta(12, 10) → „+20 %“
function dpDelta(v, r) {
  if (!isFinite(v) || !isFinite(r) || r === 0) return '';
  const p = (v / r - 1) * 100; return Math.abs(p) < 0.5 ? '±0 %' : (p > 0 ? '+' : '−') + nf0.format(Math.abs(p)) + ' %';
}
// Auswahlliste mit Gruppen (Vorlagen): groups = [[Gruppe, [[key, Name], …]], …]
function dpOptions(groups, first = 'Vorlage …') {
  return (first ? `<option value="">${first}</option>` : '') + groups.map(([g, a]) => `<optgroup label="${g}">${a.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</optgroup>`).join('');
}
