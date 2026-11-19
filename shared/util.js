// Designphysik – gemeinsame Hilfsfunktionen (globale Namen, kein Build-Schritt).
// Einbinden vor dem Modul-Skript:  <script src="../shared/util.js"></script>

// ---- Modul-Registry: einzige Stelle, an der Module angemeldet werden ----
const DP_MODULES = [
  { key: 'gefaess', name: 'Gefäß',  title: 'Gefäß & Kippen',  desc: 'Volumen, Eichstriche, Ausgießen über Neigung', ready: true },
  { key: 'licht',   name: 'Licht',  title: 'Lampenschirm',    desc: 'Schirm zeichnen: Lichtverteilung, Beleuchtungsstärke, Leuchtdichte, Blendung', ready: true },
  { key: 'mechanismus', name: 'Mechanik', title: 'Mechanismen', desc: 'Gelenkgetriebe skizzieren und bewegen: Bahnkurve, Totlagen, Übertragungswinkel, Haltemoment', ready: true },
  { key: 'last',    name: 'Last',   title: 'Belastung',       desc: 'Durchbiegung, Spannung, Sicherheit', ready: false }
];

// Kopfzeile mit Modulnavigation in <header id="dp-header"> rendern
function dpHeader(activeKey, subtitle) {
  const el = document.getElementById('dp-header'); if (!el) return;
  const nav = DP_MODULES.map(m => m.ready
    ? `<a href="../${m.key}/index.html" class="${m.key === activeKey ? 'on' : ''}">${m.name}</a>`
    : `<span title="folgt">${m.name}</span>`).join('');
  el.innerHTML = `<h1><a href="../index.html">Designphysik</a> <small>· ${subtitle || ''}</small></h1><nav>${nav}</nav>`;
}

// ---- DOM / Zahlen ----
const $ = id => document.getElementById(id);
const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

// ---- Canvas ----
// Passt Canvas an CSS-Größe × devicePixelRatio an, liefert {ctx, w, h} in CSS-Pixeln
function prep(cv) {
  const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  const W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, r.width, r.height);
  return { ctx, w: r.width, h: r.height };
}
// Pfad aus Punkten; T: Punkt → [sx, sy]
function polyPath(ctx, pts, T) { ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = T(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); }

// ---- Datei & Teilen (Konvention: {type:"designphysik/<modul>", version, ...}) ----
function dpDownload(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}
function dpHashGet(key) {
  const m = location.hash.match(new RegExp('^#' + key + '=(.+)$')); if (!m) return null;
  try { return JSON.parse(decodeURIComponent(m[1])); } catch { return null; }
}
function dpHashSet(key, obj) { history.replaceState(null, '', '#' + key + '=' + encodeURIComponent(JSON.stringify(obj))); return location.href; }
