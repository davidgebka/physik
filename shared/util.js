// Designphysik – gemeinsame Hilfsfunktionen (globale Namen, kein Build-Schritt).
// Einbinden vor dem Modul-Skript:  <script src="../shared/util.js"></script>

// ---- Modul-Registry: einzige Stelle, an der Module angemeldet werden ----
const DP_MODULES = [
// name = einziger Modulname (Navigation, Titel, Startseite); q = Entwurfsfrage (Startseite); title = Untertitel nur auf der Startseite
  { key: 'gefaess', name: 'Gefäß',  q: 'Kippt es?',       title: 'Gefäß & Kippen', desc: 'Volumen, Eichstriche, Ausgießen, Kippen und Schwappen', ready: true, color: '--water' },
  { key: 'licht',   name: 'Licht',  q: 'Wie hell?',       title: 'Lampenschirm',   desc: 'Schirm zeichnen: Lichtverteilung, Helligkeit auf dem Tisch, Blendung', ready: true, color: '--light' },
  { key: 'mechanismus', name: 'Mechanik', q: 'Klemmt es?', title: 'Gelenkgetriebe', desc: 'Getriebe skizzieren und bewegen: Bahnkurve, Totlagen, Kraft am Antrieb', ready: true, color: '--mech' },
  { key: 'last',    name: 'Last',   q: 'Hält es?',        title: 'Balken & Bretter', desc: 'Durchbiegung, Sicherheit, Knicken, Schwingen', ready: true, color: '--load' },
  { key: 'elektronik', name: 'Elektronik', q: 'Hält der Akku?', title: 'Einfache Schaltungen', desc: 'Batterie, Schalter, LED, Motor, Mikrocontroller: Laufzeit, Strom, Wärme', ready: true, color: '--elec' }
];

// Kopfzeile mit Modulnavigation in <header id="dp-header"> rendern; Modulquadrat in der Familienfarbe (Styleguide § 4)
const dpMq = (m, off) => `<i class="mq${off ? ' off' : ''}" style="--c:var(${m.color})"></i>`;
// Das Modul steht nur einmal in der Kopfzeile: als aktives Segment der Navigation (zweiter Parameter wird nicht mehr angezeigt)
function dpHeader(activeKey) {
  const el = document.getElementById('dp-header'); if (!el) return;
  const cur = DP_MODULES.find(m => m.key === activeKey);
  const nav = DP_MODULES.map(m => m.ready
    ? `<a href="../${m.key}/index.html" class="${m.key === activeKey ? 'on' : ''}"${m.key === activeKey ? ' aria-current="page"' : ''}>${dpMq(m)}${m.name}</a>`
    : `<span title="folgt">${dpMq(m, true)}${m.name}</span>`).join('');
  el.innerHTML = `<h1><a href="../index.html">Designphysik</a></h1><nav aria-label="Module">${nav}</nav>`;
  if (cur) document.title = 'Designphysik · ' + cur.name;
}
// ---- Symbole: Inline-SVG 16 px, 1,5 px Strich, currentColor (keine Icon-Schrift, keine Unicode-Ersatzzeichen) ----
const DP_ICONS = {
  undo: '<path d="M5 6H10a3.5 3.5 0 0 1 0 7H6"/><path d="M7.5 3.5 5 6l2.5 2.5"/>',
  tpl: '<rect x="2.5" y="2.5" width="4.5" height="4.5"/><rect x="9" y="2.5" width="4.5" height="4.5"/><rect x="2.5" y="9" width="4.5" height="4.5"/><rect x="9" y="9" width="4.5" height="4.5"/>',
  cmp: '<rect x="2.5" y="3" width="11" height="10"/><path d="M8 3v10"/>',
  close: '<path d="m4 4 8 8M12 4l-8 8"/>',
  fit: '<path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"/>',
  photo: '<rect x="2" y="4" width="12" height="9"/><circle cx="8" cy="8.5" r="2.3"/><path d="M5.5 4l1-1.5h3l1 1.5"/>',
  pen: '<path d="M3 13l1-3.5 6.5-6.5 2.5 2.5L6.5 12z"/>',
  pts: '<path d="M3 12 8 4l5 6"/><rect x="1.8" y="10.8" width="2.4" height="2.4"/><rect x="6.8" y="2.8" width="2.4" height="2.4"/><rect x="11.8" y="8.8" width="2.4" height="2.4"/>',
  rot: '<path d="M5.5 2.5C3.5 6 3.5 10.5 5 13.5h6c1.5-3 1.5-7.5-.5-11"/><path d="M8 1v14" stroke-dasharray="1.5 2"/>',
  plan: '<path d="M4 4h9l-1 8H3z"/>',
  tube: '<path d="M4 14C3 9 4 5 6 2M12 14c1-4 0-7-2-12"/>',
  play: '<path d="M5 3.5v9l7-4.5z"/>',
  stop: '<rect x="4" y="4" width="8" height="8"/>',
  sym: '<path d="M8 2v12" stroke-dasharray="1.5 2"/><path d="M6 4 3 12M10 4l3 8"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  minus: '<path d="M3 8h10"/>',
  down: '<path d="M8 2.5v7.5M5 7l3 3 3-3M3 13.5h10"/>',
  up: '<path d="M8 10V2.5M5 5.5l3-3 3 3M3 13.5h10"/>',
  link: '<path d="M7 9a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.8.8M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.8-.8"/>',
  wave: '<path d="M2 9c2-3 4-3 6 0s4 3 6 0"/><path d="M2 13h12"/>',
  more: '<circle cx="3.5" cy="8" r=".8"/><circle cx="8" cy="8" r=".8"/><circle cx="12.5" cy="8" r=".8"/>',
  check: '<path d="m3 8.5 3 3 7-7"/>'
};
const dpIco = n => `<svg class="i" viewBox="0 0 16 16" aria-hidden="true">${DP_ICONS[n] || ''}</svg>`;
// Knopf mit Symbol und Beschriftung; Beschriftung als .lbl (auf dem Telefon bei leisen Knöpfen ausgeblendet)
function dpBtn(el, icon, text) { el.innerHTML = dpIco(icon) + (text ? `<span class="lbl">${text}</span>` : ''); if (text && !el.title) el.title = text; return el; }
// Alle <button data-i="name">Text</button> einmalig mit Symbol versehen
function dpIcons(root = document) { root.querySelectorAll('button[data-i]').forEach(b => { if (!b.querySelector('svg')) dpBtn(b, b.dataset.i, b.textContent.trim()); }); }
// Fachbegriff mit Erklärung: gepunktet unterstrichen, Erklärung als title (Glossar, konzept.md Roadmap)
const dpTerm = (w, t) => t ? `<span class="term" title="${t.replace(/"/g, '&quot;')}">${w}</span>` : w;

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
// Darstellung: Marke (passt: Rahmen · knapp: rote Fläche hell · kritisch: rot gefüllt) und Satz als Hauptaussage.
// Nebenbei: Telefon-Leiste #dp-bar und Textalternative der Zeichenflächen (canvas[role=img]) aktualisieren.
const DP_LV = ['✓ passt', '⚠ knapp', '⚠ kritisch'];
function dpVerdict(level, text, extra) {
  dpBar(level, text);
  document.querySelectorAll('canvas[role=img]').forEach(c => c.setAttribute('aria-label', DP_LV[level] + ': ' + String(text).replace(/<[^>]*>/g, '')));
  return `<div class="verdict l${level}" role="status"><span class="lv">${DP_LV[level]}</span><span class="vt">${text}</span>${extra ? `<span class="vx">${extra}</span>` : ''}</div>`;
}
// Telefon: feste Leiste unten mit dem Urteil, solange die Kennwerte nicht im Blick sind; antippen springt hin
let dpBarEl = null;
function dpBar(level, text) {
  const st = document.getElementById('stats'); if (!st) return;
  if (!dpBarEl) {
    dpBarEl = document.createElement('button'); dpBarEl.id = 'dp-bar'; dpBarEl.type = 'button'; dpBarEl.hidden = true;
    dpBarEl.onclick = () => st.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.body.append(dpBarEl); document.body.classList.add('has-bar');
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { dpBarEl.hidden = es[0].isIntersecting; }).observe(st); else dpBarEl.hidden = false;
  }
  dpBarEl.innerHTML = `<span class="verdict l${level}"><span class="lv">${DP_LV[level]}</span></span><span class="vt">${String(text).replace(/<[^>]*>/g, '')}</span>`;
}
// Kennwerte nach Styleguide: it = {l: Label, v: Wert, n?: Notiz, w?: Warnung, t?: Erklärung des Begriffs, s?: langer Wert klein}.
// Einheit hinter der Zahl wird kleiner gesetzt; reiner Text als Wert (z. B. Getriebetyp) in 18 px.
function dpStat(it) {
  let v = String(it.v);
  const m = v.match(/^(.*\d)\s+([^\d\s<>]+(?:\/[^\d\s<>]+)?)$/); if (m) v = `${m[1]}<small>${m[2]}</small>`;
  const txt = it.s || !/\d|∞|–/.test(String(it.v)); // s: langer Wert (z. B. Bereich) in 18 px
  return `<div class="stat${it.w ? ' warn' : ''}"><span${it.t ? '' : ` title="${String(it.l).replace(/<[^>]*>/g, '').replace(/"/g, '&quot;')}"`}>${dpTerm(it.l, it.t)}</span><b${txt ? ' class="txt"' : ''}>${v}</b>${it.n ? `<span>${it.n}</span>` : ''}</div>`;
}
// Ebenen 1–3 (konzept.md): Urteil, Hauptkennwerte groß, alle weiteren Werte als aufklappbare Tabelle (Zustand bleibt beim Neuzeichnen)
const dpOpen = {};
document.addEventListener('toggle', e => { const d = e.target; if (d.matches && d.matches('details[data-k]')) dpOpen[d.dataset.k] = d.open; }, true);
function dpStats(verdictHtml, main, more = [], key = 'more') {
  const rows = more.map(it => `<tr${it.w ? ' class="warn"' : ''}><td>${dpTerm(it.l, it.t)}</td><td>${it.v}</td><td>${it.n || ''}</td></tr>`).join('');
  return verdictHtml + main.map(dpStat).join('') +
    (more.length ? `<details class="more" data-k="${key}"${dpOpen[key] ? ' open' : ''}><summary>Alle Werte (${more.length})</summary><table class="kv">${rows}</table></details>` : '');
}
// Telefon: Nebenaktionen (Elemente) hinter „⋯“ in ein Menü am Ende der Zeile row; Desktop: an ihrem Platz
function dpMenu(row, els) {
  const mq = matchMedia('(max-width: 860px)'), home = els.map(e => [e, e.parentNode, e.nextSibling]);
  const menu = document.createElement('details'); menu.className = 'menu'; menu.innerHTML = `<summary aria-label="Weitere Aktionen">${dpIco('more')}</summary><div></div>`;
  const box = menu.lastChild;
  box.addEventListener('click', e => { if (e.target.closest('button')) menu.open = false; });
  const place = () => {
    if (mq.matches) { els.forEach(e => box.append(e)); row.append(menu); }
    else { home.forEach(([e, p, n]) => p.insertBefore(e, n && n.parentNode === p ? n : null)); menu.remove(); }
  };
  (mq.addEventListener ? mq.addEventListener('change', place) : mq.addListener(place)); place();
}
// Tastatur: Fokus in einem Textfeld (Zahl, Text) – dort gehören Strg+Z und Rücktaste dem Feld; Regler, Knöpfe, Häkchen nicht
function dpEditing() {
  const t = document.activeElement; if (!t) return false;
  return t.isContentEditable || t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && !/^(range|checkbox|radio|button|submit|file|color)$/.test(t.type));
}
// Strg+Z (ohne Umschalt: Strg+Umschalt+Z ist „Wiederholen“), nicht beim Tippen in einem Feld
const dpUndoKey = e => (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'z' && !dpEditing();
// Rückgängig: save(obj) nach jedem abgeschlossenen Schritt (gleicher Zustand → kein Schritt), Knopf und Strg+Z rufen apply(obj) mit dem Vorzustand
function dpHistory(btn, apply, max = 50) {
  const H = []; let last = null;
  const h = {
    save(o) { const j = JSON.stringify(o); if (j !== last) { if (last) H.push(last); if (H.length > max) H.shift(); last = j; } btn.disabled = !H.length; },
    undo() { if (!H.length) return; last = H.pop(); btn.disabled = !H.length; apply(JSON.parse(last)); }
  };
  btn.onclick = h.undo;
  window.addEventListener('keydown', e => { if (dpUndoKey(e)) { e.preventDefault(); h.undo(); } });
  return h;
}
// Variantenvergleich: Knopf merkt den aktuellen Zustand get() bzw. hebt den Vergleich auf; onChange(ref | null)
function dpCompare(btn, get, onChange) {
  let ref = null;
  const set = r => { ref = r; dpBtn(btn, ref ? 'close' : 'cmp', ref ? 'Vergleich beenden' : 'Stand merken'); btn.classList.toggle('on', !!ref); onChange(ref); };
  btn.title = 'Aktuellen Stand merken und Änderungen damit vergleichen'; dpBtn(btn, 'cmp', 'Stand merken');
  btn.onclick = () => set(ref ? null : JSON.parse(JSON.stringify(get())));
  return { get ref() { return ref; } };
}
// Abweichung zum gemerkten Wert: dpDelta(12, 10) → „+20 %“
function dpDelta(v, r) {
  if (!isFinite(v) || !isFinite(r) || r === 0) return '';
  const p = (v / r - 1) * 100; return Math.abs(p) < 0.5 ? '±0 %' : (p > 0 ? '+' : '−') + nf0.format(Math.abs(p)) + ' %';
}
// Vorlagen-Galerie (ersetzt die Textliste): groups = [[Gruppe, [{k, n, s?, d}, …]], …] – k Schlüssel, n Name, s Zusatz (Entwurf · Jahr bzw. Prinzip),
// d() liefert die Skizze für dpSketch (erst beim ersten Öffnen gerufen). Wahl → onPick(k). Der Knopf öffnet die Galerie.
function dpGallery(btn, groups, onPick, title = 'Vorlage wählen') {
  const dlg = document.createElement('dialog'), items = groups.flatMap(([, a]) => a);
  dlg.className = 'gal'; dlg.setAttribute('aria-label', title);
  dlg.innerHTML = `<div class="row galtop"><h2>${title}</h2><button type="button" class="q" data-x aria-label="Schließen">${dpIco('close')}</button></div>` + groups.map(([g, a]) =>
    `<h3>${g}</h3><div class="galgrid">${a.map(it => `<button type="button" data-k="${it.k}"><canvas></canvas><b>${it.n}</b>${it.s ? `<span>${it.s}</span>` : ''}</button>`).join('')}</div>`).join('');
  document.body.append(dlg);
  let drawn = false;
  btn.title = 'Vorlagen: Prinzipien und Designklassiker'; dpBtn(btn, 'tpl', 'Vorlage …');
  btn.onclick = () => {
    dlg.showModal();
    if (!drawn) { drawn = true; dlg.querySelectorAll('[data-k] canvas').forEach((cv, i) => { try { dpSketch(cv, items[i].d()); } catch (e) { /* Skizze fehlt, Name bleibt */ } }); }
  };
  dlg.onclick = e => {
    if (e.target === dlg || e.target.closest('[data-x]')) return dlg.close(); // Klick neben den Inhalt oder ✕ schließt
    const b = e.target.closest('[data-k]'); if (b) { dlg.close(); onPick(b.dataset.k); }
  };
  return dlg;
}
// Skizze in mm, y nach oben, auf die Fläche eingepasst: shapes = [{p: [[x, y], …], z?: geschlossen, f?: Füll-Token, c?: Linien-Token (null = keine), w?: Breite, r?: Punktradius px, dash?}]
function dpSketch(cv, shapes) {
  const { ctx, w, h } = prep(cv), all = shapes.flatMap(s => s.p);
  if (!all.length) return;
  const xs = all.map(q => q[0]), ys = all.map(q => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const m = 12, k = Math.min((w - 2 * m) / Math.max(x1 - x0, 1e-9), (h - 2 * m) / Math.max(y1 - y0, 1e-9));
  const T = q => [w / 2 + (q[0] - (x0 + x1) / 2) * k, h / 2 - (q[1] - (y0 + y1) / 2) * k];
  ctx.lineJoin = ctx.lineCap = 'round';
  for (const s of shapes) {
    if (s.r) { for (const q of s.p) { const [x, y] = T(q); ctx.beginPath(); ctx.arc(x, y, s.r, 0, 7); ctx.fillStyle = css(s.f || '--ink'); ctx.fill(); if (s.c) { ctx.strokeStyle = css(s.c); ctx.lineWidth = 1; ctx.stroke(); } } continue; }
    polyPath(ctx, s.p, T); if (s.z) ctx.closePath();
    if (s.f) { ctx.fillStyle = css(s.f); ctx.fill(); }
    if (s.c !== null) { ctx.strokeStyle = css(s.c || '--ink'); ctx.lineWidth = s.w || 1.5; ctx.setLineDash(s.dash || []); ctx.stroke(); ctx.setLineDash([]); }
  }
}
