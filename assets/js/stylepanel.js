/* stylepanel.js —— 全局样式面板：字体 / 字号 / 行距 / 主题色 / 密度 */
window.RE = window.RE || {};
RE.stylePanel = (function () {
  function r() { return document.getElementById('resumeRoot'); }

  function h2r(hex) {
    hex = (hex || '').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function hexA(hex, a) { const { r, g, b } = h2r(hex); return `rgba(${r},${g},${b},${a})`; }
  function lighten(hex, f) {
    const { r, g, b } = h2r(hex);
    return `rgb(${Math.round(r + (255 - r) * f)},${Math.round(g + (255 - g) * f)},${Math.round(b + (255 - b) * f)})`;
  }
  function toHex(c) {
    if (!c) return '#5352ed';
    if (c.startsWith('#')) return c;
    const m = c.match(/\d+/g);
    if (m) return '#' + m.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join('');
    return '#5352ed';
  }

  function setFont(v) { r().setAttribute('data-font', v === 'sys' ? '' : v); }
  function setFontSize(v) { r().style.setProperty('--fs', v + 'px'); const el = document.getElementById('fsVal'); if (el) el.textContent = v + 'px'; }
  function setLineHeight(v) { r().style.setProperty('--lh', v); const el = document.getElementById('lhVal'); if (el) el.textContent = v; }
  function setAccent(hex) {
    const root = r();
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-soft', lighten(hex, 0.92));
    root.style.setProperty('--tag-fg', hex);
    root.style.setProperty('--tag-bg', hexA(hex, 0.15));
    root.style.setProperty('--tag-bd', hexA(hex, 0.35));
    root.style.setProperty('--link', hex);
  }
  function setDensity(v) { r().classList.toggle('dense', v === 'compact'); }

  function collect() {
    const root = r();
    return {
      theme: root.getAttribute('data-theme'),
      template: root.getAttribute('data-template'),
      font: root.getAttribute('data-font') || 'sys',
      fs: root.style.getPropertyValue('--fs') || '',
      lh: root.style.getPropertyValue('--lh') || '',
      accent: root.style.getPropertyValue('--accent') || '',
      density: root.classList.contains('dense') ? 'compact' : 'comfortable'
    };
  }

  function apply(s) {
    const root = r(); if (!s) return;
    if (s.theme) root.setAttribute('data-theme', s.theme);
    if (s.template) root.setAttribute('data-template', s.template);
    if (s.font !== undefined) root.setAttribute('data-font', s.font === 'sys' ? '' : s.font);
    if (s.fs) root.style.setProperty('--fs', s.fs);
    if (s.lh) root.style.setProperty('--lh', s.lh);
    if (s.accent) setAccent(s.accent);
    if (s.density) root.classList.toggle('dense', s.density === 'compact');
    syncControls();
  }

  function syncControls() {
    const s = collect();
    const f = document.getElementById('fontSel'); if (f) f.value = s.font === 'sys' ? 'sys' : s.font;
    const fs = document.getElementById('fontSize'); if (fs && s.fs) { fs.value = parseFloat(s.fs); document.getElementById('fsVal').textContent = s.fs; }
    const lh = document.getElementById('lineHeight'); if (lh && s.lh) { lh.value = parseFloat(s.lh); document.getElementById('lhVal').textContent = s.lh; }
    const ac = document.getElementById('accentColor'); if (ac && s.accent) ac.value = toHex(s.accent);
    const de = document.getElementById('densitySel'); if (de && s.density) de.value = s.density;
  }

  function init() {
    document.getElementById('fontSel').addEventListener('change', e => { setFont(e.target.value); RE.app.afterChange(); });
    document.getElementById('fontSize').addEventListener('input', e => { setFontSize(e.target.value); RE.app.afterChange(); });
    document.getElementById('lineHeight').addEventListener('input', e => { setLineHeight(e.target.value); RE.app.afterChange(); });
    document.getElementById('accentColor').addEventListener('input', e => { setAccent(e.target.value); RE.app.afterChange(); });
    document.getElementById('densitySel').addEventListener('change', e => { setDensity(e.target.value); RE.app.afterChange(); });
  }

  return { init, collect, apply, syncControls };
})();
