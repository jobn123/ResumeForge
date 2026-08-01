/* app.js —— 主控：初始化、模式切换、分页线、自动保存、导入导出、按钮接线 */
window.RE = window.RE || {};
RE.app = (function () {
  let saveTimer, rgTimer, igTimer;
  let INITIAL_HTML = '';
  // 初始示例简历对应的全局样式默认值（用于重置）
  const DEFAULTS = { theme: 'indigo', template: 'classic', font: 'sys', fs: '14px', lh: '1.7', accent: '#5352ed', density: 'comfortable' };

  function root() { return document.getElementById('resumeRoot'); }

  function pageH() { const w = root().clientWidth; return w * 297 / 210; }
  function pageCount() { const total = root().offsetHeight; return Math.max(1, Math.ceil(total / pageH())); }

  function renderPageGuides() {
    const root0 = root();
    const guide = document.getElementById('pageGuide');
    if (!guide || !root0) return;
    guide.innerHTML = '';
    const ph = pageH();
    const total = root0.offsetHeight;
    for (let i = 1; i * ph < total - 1; i++) {
      const line = document.createElement('div');
      line.className = 'pg-line';
      line.style.top = (i * ph) + 'px';
      const lab = document.createElement('span');
      lab.className = 'pg-label';
      lab.textContent = '第 ' + i + ' 页';
      line.appendChild(lab);
      guide.appendChild(line);
    }
  }

  function afterChange() {
    renderPageGuides();
    if (RE.dnd) RE.dnd.refresh();
    scheduleSave();
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    const hint = document.getElementById('saveHint');
    if (hint) hint.textContent = '保存中…';
    saveTimer = setTimeout(() => {
      const settings = RE.stylePanel ? RE.stylePanel.collect() : {};
      RE.storage.persist(root(), settings);
      if (hint) hint.textContent = '已自动保存';
    }, 600);
  }

  function toggleMode() {
    const editing = document.body.classList.toggle('edit-mode');
    root().classList.toggle('edit-mode', editing);
    document.querySelectorAll('.ed').forEach(e => e.setAttribute('contenteditable', editing ? 'true' : 'false'));
    document.getElementById('btnMode').textContent = editing ? '切换到预览' : '切换到编辑';
    if (RE.dnd) RE.dnd.refresh();
    renderPageGuides();
  }

  // 用持久化数据覆盖当前 #resumeRoot（保留节点，避免监听器失效）
  function applyHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html.trim();
    const el = tmp.firstElementChild;
    if (!el) return false;
    const old = root();
    [...el.attributes].forEach(a => { if (a.name !== 'id') old.setAttribute(a.name, a.value); });
    old.innerHTML = el.innerHTML;
    return true;
  }

  function loadPersisted() {
    const p = RE.storage.getPersisted();
    if (!p || !p.html) return false;
    if (!applyHtml(p.html)) return false;
    if (p.settings && RE.stylePanel) RE.stylePanel.apply(p.settings);
    return true;
  }

  function resetToInitial() {
    if (!INITIAL_HTML) return;
    applyHtml(INITIAL_HTML);                       // 还原内容（保留 #resumeRoot 元素，监听器不失效）
    if (RE.stylePanel) RE.stylePanel.apply(DEFAULTS); // 还原全局样式为默认
    const ts = document.getElementById('themeSel'); if (ts) ts.value = DEFAULTS.theme;
    const pl = document.getElementById('tplSel'); if (pl) pl.value = DEFAULTS.template;
    RE.storage.clear();                           // 清空已保存的修改
    if (RE.dnd) RE.dnd.refresh();
    renderPageGuides();
    const hint = document.getElementById('saveHint');
    if (hint) hint.textContent = '已重置为初始数据';
  }

  function togglePanel(id) {
    const p = document.getElementById(id);
    p.hidden = !p.hidden;
    if (id === 'stylePanel' && !p.hidden && RE.stylePanel) RE.stylePanel.syncControls();
  }

  function init() {
    // 捕获初始示例简历（用于「重置」功能），必须在 loadPersisted 覆盖前完成
    INITIAL_HTML = root().outerHTML;
    loadPersisted();

    RE.dnd.init();
    RE.stylePanel.init();
    RE.sections.init();
    if (RE.dnd) RE.dnd.refresh();

    document.getElementById('btnMode').addEventListener('click', toggleMode);
    document.getElementById('btnSave').addEventListener('click', () => RE.exporter.exportHtml());
    document.getElementById('btnPdf').addEventListener('click', () => RE.exporter.exportPdf());
    document.getElementById('btnPng').addEventListener('click', () => RE.exporter.exportPng());
    document.getElementById('btnWord').addEventListener('click', () => RE.exporter.exportWord());
    document.getElementById('btnPrint').addEventListener('click', () => RE.exporter.print());
    document.getElementById('themeSel').addEventListener('change', e => { root().setAttribute('data-theme', e.target.value); afterChange(); });
    document.getElementById('tplSel').addEventListener('change', e => { root().setAttribute('data-template', e.target.value); afterChange(); });
    document.getElementById('btnStyle').addEventListener('click', () => togglePanel('stylePanel'));
    document.getElementById('btnReset').addEventListener('click', () => { const m = document.getElementById('resetModal'); if (m && window.bootstrap) window.bootstrap.Modal.getOrCreateInstance(m).show(); });
    document.getElementById('resetOk').addEventListener('click', () => { resetToInitial(); const m = document.getElementById('resetModal'); if (m && window.bootstrap) window.bootstrap.Modal.getOrCreateInstance(m).hide(); });
    document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => { document.getElementById(b.getAttribute('data-close')).hidden = true; }));

    root().addEventListener('input', () => {
      clearTimeout(igTimer);
      igTimer = setTimeout(() => { renderPageGuides(); scheduleSave(); }, 250);
    });
    window.addEventListener('resize', () => { clearTimeout(rgTimer); rgTimer = setTimeout(renderPageGuides, 150); });

    renderPageGuides();
  }

  return { init, afterChange, renderPageGuides, pageCount };
})();

document.addEventListener('DOMContentLoaded', () => RE.app.init());
