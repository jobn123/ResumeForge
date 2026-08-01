/* dnd.js —— 模块 / 条目拖拽排序（HTML5 Drag & Drop） */
window.RE = window.RE || {};
RE.dnd = (function () {
  let dragEl = null;
  let dropTarget = null;

  function root() { return document.getElementById('resumeRoot'); }
  function isEdit() { return document.body.classList.contains('edit-mode'); }

  // 为可拖拽元素分配分组，保证只在同组（同模块 / 同列表）内排序
  function assignGroups() {
    const r = root(); if (!r) return;
    r.querySelectorAll('[data-dnd="section"]').forEach(s => s.setAttribute('data-dnd-group', 'sections'));
    r.querySelectorAll('.section').forEach(sec => {
      const type = sec.getAttribute('data-section');
      sec.querySelectorAll('[data-dnd="item"]').forEach(it => {
        const ul = it.closest('ul.project-points');
        if (ul) {
          if (!ul.hasAttribute('data-ulgroup')) ul.setAttribute('data-ulgroup', 'ul-' + Math.random().toString(36).slice(2, 8));
          it.setAttribute('data-dnd-group', ul.getAttribute('data-ulgroup'));
        } else {
          it.setAttribute('data-dnd-group', 'grp-' + type);
        }
      });
    });
  }

  function setDraggable(on) {
    const r = root(); if (!r) return;
    r.querySelectorAll('[data-dnd]').forEach(el => { el.draggable = !!on; });
  }

  function refresh() {
    if (isEdit()) { assignGroups(); setDraggable(true); }
    else setDraggable(false);
  }

  function clearIndicator() {
    if (dropTarget) { dropTarget.classList.remove('drop-indicator'); dropTarget = null; }
  }

  function onDragStart(e) {
    const el = e.target.closest('[data-dnd]');
    if (!el || !isEdit()) { e.preventDefault(); return; }
    dragEl = el;
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', ''); } catch (_) {}
  }

  function onDragOver(e) {
    if (!dragEl) return;
    const t = e.target.closest('[data-dnd]');
    if (!t || t === dragEl) return;
    if (t.getAttribute('data-dnd-group') !== dragEl.getAttribute('data-dnd-group')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (t !== dropTarget) { clearIndicator(); t.classList.add('drop-indicator'); dropTarget = t; }
  }

  function onDrop(e) {
    if (!dragEl || !dropTarget) return;
    e.preventDefault();
    const t = dropTarget;
    const rect = t.getBoundingClientRect();
    const before = (e.clientY - rect.top) < rect.height / 2;
    if (before) t.parentNode.insertBefore(dragEl, t);
    else t.parentNode.insertBefore(dragEl, t.nextSibling);
    cleanup();
    if (RE.app) RE.app.afterChange();
  }

  function onDragEnd() { cleanup(); }

  function cleanup() {
    if (dragEl) dragEl.classList.remove('dragging');
    clearIndicator();
    dragEl = null;
  }

  function init() {
    const r = root(); if (!r) return;
    r.addEventListener('dragstart', onDragStart);
    r.addEventListener('dragover', onDragOver);
    r.addEventListener('drop', onDrop);
    r.addEventListener('dragend', onDragEnd);
  }

  return { init, refresh };
})();
