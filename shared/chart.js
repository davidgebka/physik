// Designphysik – Diagramme (gemeinsam). Benötigt shared/util.js (prep, css, nf0).
// chart(canvas, {x0,x1,y0,y1,xs?,xl,yl, series:[{pts:[[x,y]],color,width?,dash?,fill?}], vlines:[{x,color}], points:[[x,y,color]],
//   legend?: [{t: Text, color, width?, dash?}] – oben rechts, Strichmuster wie die Serie})
// Schrift für Canvas-Beschriftung (Styleguide § 5): 12 px, Systemschrift
const DP_CFONT = '12px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
function niceStep(raw) {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-9)))), m = raw / p;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 3.5 ? 2.5 : m < 7.5 ? 5 : 10) * p;
}
function chart(cv, o) {
  const { ctx, w, h } = prep(cv);
  const m = { l: 48, r: 12, t: o.legend && o.legend.length ? 30 : 10, b: 32 };
  const X = v => m.l + (v - o.x0) / (o.x1 - o.x0 || 1) * (w - m.l - m.r);
  const Y = v => h - m.b - (v - o.y0) / (o.y1 - o.y0 || 1) * (h - m.t - m.b);
  ctx.font = DP_CFONT; ctx.fillStyle = css('--ink2'); ctx.lineWidth = 1;
  const xt = [], yt = [];
  const sx = o.xs || niceStep((o.x1 - o.x0) / 6), sy = niceStep((o.y1 - o.y0) / 5 || 1);
  // Ticks als k·Schritt (keine Summenfehler), Nachkommastellen nach Schrittweite (0,25 → 2), kein „-0“
  const ticks = (a, b, s, f) => { const d = (String(+s.toPrecision(6)).split('.')[1] || '').length;
    const nf = new Intl.NumberFormat('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
    for (let k = Math.ceil(a / s - 1e-9); k * s <= b + 1e-9 * Math.abs(s); k++) f(k * s, nf.format(k ? k * s : 0)); };
  ticks(o.x0, o.x1, sx, (v, t) => {
    xt.push(X(v)); ctx.textAlign = 'center'; ctx.fillText(t, X(v), h - m.b + 15);
  });
  ticks(o.y0, o.y1, sy, (v, t) => {
    yt.push(Y(v)); ctx.textAlign = 'right'; ctx.fillText(t, m.l - 5, Y(v) + 4);
  });
  ctx.textAlign = 'center'; ctx.fillText(o.xl, (m.l + w - m.r) / 2, h - 3);
  ctx.save(); ctx.translate(10, (m.t + h - m.b) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(o.yl, 0, 0); ctx.restore();
  ctx.textAlign = 'left';
  // Achsen links und unten mit Teilstrichen; als Raster dient das durchlaufende Seitenraster (Styleguide § 8)
  ctx.strokeStyle = css('--ink'); ctx.beginPath(); ctx.moveTo(m.l + .5, m.t); ctx.lineTo(m.l + .5, h - m.b + .5); ctx.lineTo(w - m.r, h - m.b + .5);
  for (const x of xt) { const px = Math.round(x) + .5; ctx.moveTo(px, h - m.b + .5); ctx.lineTo(px, h - m.b + 4.5); }
  for (const y of yt) { const py = Math.round(y) + .5; ctx.moveTo(m.l + .5, py); ctx.lineTo(m.l - 3.5, py); } ctx.stroke();
  for (const sr of o.series) {
    if (!sr.pts.length) continue;
    ctx.beginPath(); sr.pts.forEach(([a, b], i) => i ? ctx.lineTo(X(a), Y(b)) : ctx.moveTo(X(a), Y(b)));
    if (sr.fill) { ctx.save(); ctx.lineTo(X(sr.pts[sr.pts.length - 1][0]), Y(o.y0)); ctx.lineTo(X(sr.pts[0][0]), Y(o.y0)); ctx.closePath(); ctx.fillStyle = sr.fill; ctx.fill(); ctx.restore();
      ctx.beginPath(); sr.pts.forEach(([a, b], i) => i ? ctx.lineTo(X(a), Y(b)) : ctx.moveTo(X(a), Y(b))); }
    ctx.strokeStyle = sr.color; ctx.lineWidth = sr.width || 2; ctx.setLineDash(sr.dash || []); ctx.stroke(); ctx.setLineDash([]);
  }
  for (const v of o.vlines || []) { ctx.strokeStyle = v.color; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X(v.x) + .5, m.t); ctx.lineTo(X(v.x) + .5, h - m.b); ctx.stroke(); ctx.setLineDash([]); }
  for (const p of o.points || []) { ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 4.5, 0, 7); ctx.fillStyle = p[2]; ctx.fill(); }
  // Legende oben rechts (rechtsbündig, Einträge von rechts nach links), Strich 18 px im Muster der Serie
  if (o.legend && o.legend.length) {
    ctx.font = DP_CFONT; ctx.textAlign = 'left'; let x = w - m.r;
    for (const e of o.legend.slice().reverse()) {
      const tw = ctx.measureText(e.t).width; x -= tw; ctx.fillStyle = css('--ink2'); ctx.fillText(e.t, x, 16);
      x -= 24; ctx.strokeStyle = e.color; ctx.lineWidth = e.width || 2; ctx.setLineDash(e.dash || []); ctx.beginPath(); ctx.moveTo(x, 12); ctx.lineTo(x + 18, 12); ctx.stroke(); ctx.setLineDash([]);
      x -= 18; if (x < m.l) break;
    }
  }
}
