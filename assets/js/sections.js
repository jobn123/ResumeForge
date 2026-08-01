/* sections.js —— 模块显隐 / 删除 / 新增，以及条目增删 */
window.RE = window.RE || {};
RE.sections = (function () {
  function root() { return document.getElementById('resumeRoot'); }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function addBullet(ul) {
    const li = document.createElement('li');
    li.className = 'ed'; li.setAttribute('data-item', 'bullet'); li.setAttribute('data-dnd', 'item'); li.setAttribute('contenteditable', 'true');
    li.textContent = '新要点';
    const x = document.createElement('span');
    x.className = 'editor-only del-btn'; x.setAttribute('data-del', ''); x.setAttribute('contenteditable', 'false'); x.title = '删除'; x.textContent = '×';
    li.appendChild(x);
    ul.appendChild(li);
  }

  function addSkill(grid) {
    const row = document.createElement('div');
    row.className = 'skill-item'; row.setAttribute('data-item', 'skill'); row.setAttribute('data-dnd', 'item');
    row.innerHTML = '<span class="skill-cat ed" contenteditable="true">新分类</span><span class="skill-desc ed" contenteditable="true">描述</span><span class="editor-only del-btn" contenteditable="false" data-del title="删除">×</span>';
    grid.appendChild(row);
  }

  function addWork(section, btn) {
    const item = document.createElement('div');
    item.className = 'work-item';
    item.setAttribute('data-item', 'work');
    item.setAttribute('data-dnd', 'item');
    item.innerHTML =
      '<div class="work-header">' +
        '<span class="work-company ed ph" contenteditable="true">公司名称（例如：XX 科技有限公司）</span>' +
        '<span class="work-period ed ph" contenteditable="true">2020-01 ~ 2023-06</span>' +
      '</div>' +
      '<div class="work-role ed ph" contenteditable="true">职位名称（例如：前端开发工程师）</span>' +
      '<div class="work-desc ed ph" contenteditable="true">用「动作 + 方法 + 量化结果」描述你的职责与贡献，例如「负责 XX 模块，使 YY 指标提升 30%」。</div>' +
      '<span class="editor-only del-btn" data-del title="删除">×</span>';
    section.insertBefore(item, btn);
  }

  function addProject(section, btn) {
    const proj = document.createElement('div');
    proj.className = 'project';
    proj.setAttribute('data-item', 'project');
    proj.setAttribute('data-dnd', 'item');
    proj.innerHTML =
      '<div class="project-name"><span class="ed ph" contenteditable="true">项目名称（例如：XX 数据平台 / XX 管理系统）</span></div>' +
      '<div class="project-desc ed ph" contenteditable="true">一句话介绍项目背景、你的角色与项目目标，让招聘方快速理解你做了什么。</div>' +
      '<div class="project-tech ed ph" contenteditable="true">技术栈（例如：React + TypeScript + ECharts）</div>' +
      '<ul class="project-points">' +
        '<li class="ed ph" data-item="bullet" data-dnd="item">用「动作 + 方法 + 量化结果」描述核心贡献，例如「主导 XX 模块，使 YY 指标提升 30%」<span class="editor-only del-btn" data-del title="删除">×</span></li>' +
      '</ul>' +
      '<button class="editor-only add-btn" data-act="bullet">+ 要点</button>' +
      '<span class="editor-only del-btn section-del" data-del title="删除项目">×</span>';
    section.insertBefore(proj, btn);
  }

  function addCustomSection(title) {
    const content = root().querySelector('.content');
    const sec = document.createElement('section');
    sec.className = 'section section-fresh'; sec.setAttribute('data-section', 'custom'); sec.setAttribute('data-dnd', 'section');
    sec.innerHTML =
      '<div class="section-head">' +
        '<div class="section-title ed" contenteditable="true">' + escapeHtml(title) + '</div>' +
        '<div class="editor-only section-ctrls">' +
          '<span class="dnd-handle" title="拖拽排序">⠿</span>' +
          '<span class="eye-btn" data-act="toggle-hidden" title="显示/隐藏">👁</span>' +
          '<span class="del-btn" data-del-section title="删除整个版块">×</span>' +
        '</div>' +
      '</div>' +
      '<p class="summary-text ed" contenteditable="true" data-ph="在此填写模块内容……"></p>' +
      '<ul class="project-points"></ul>' +
      '<button class="editor-only add-btn block-add" data-act="bullet">+ 添加要点</button>';
    content.appendChild(sec);
    sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
    RE.dnd.refresh(); RE.app.afterChange();
  }

  function openAddSectionModal() {
    const input = document.getElementById('addSectionName');
    const modalEl = document.getElementById('addSectionModal');
    if (!modalEl || !window.bootstrap) { addCustomSection('自定义模块'); return; }
    if (input) input.value = '自定义模块';
    window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    if (input) setTimeout(() => { input.focus(); input.select(); }, 350);
  }

  function closeAddSectionModal() {
    const modalEl = document.getElementById('addSectionModal');
    if (modalEl && window.bootstrap) window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  }

  function bindAddSectionModal() {
    const input = document.getElementById('addSectionName');
    const ok = document.getElementById('addSectionOk');
    if (ok) ok.addEventListener('click', () => {
      const v = (input && input.value ? input.value : '').trim() || '自定义模块';
      closeAddSectionModal(); addCustomSection(v);
    });
    if (input) input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { const v = (input.value || '').trim() || '自定义模块'; closeAddSectionModal(); addCustomSection(v); }
    });
  }

  function toggleHidden(sec) { sec.classList.toggle('is-hidden'); RE.app.afterChange(); }

  function deleteSection(sec) {
    if (confirm('确定删除该模块？此操作不可撤销。')) { sec.remove(); RE.dnd.refresh(); RE.app.afterChange(); }
  }

  function onActivate(e) {
    const t = e.target;

    // 删除单个条目（要点 / 技能）
    if (t.classList.contains('del-btn') && t.hasAttribute('data-del')) {
      const item = t.closest('[data-item]');
      if (item) { item.remove(); RE.app.afterChange(); }
      return;
    }
    // 删除整个模块
    if (t.hasAttribute && t.hasAttribute('data-del-section')) {
      const sec = t.closest('.section');
      if (sec) deleteSection(sec);
      return;
    }
    // 显隐切换
    if (t.classList.contains('eye-btn')) {
      const sec = t.closest('.section');
      if (sec) toggleHidden(sec);
      return;
    }
    // 新增按钮
    const act = t.getAttribute && t.getAttribute('data-act');
    if (!act) return;
    if (act === 'bullet') { const ul = t.previousElementSibling; if (ul && ul.tagName === 'UL') addBullet(ul); }
    else if (act === 'skill') { const grid = t.previousElementSibling; if (grid && grid.classList.contains('skills-grid')) addSkill(grid); }
    else if (act === 'work') { const sec = t.closest('.section'); if (sec) addWork(sec, t); }
    else if (act === 'project') { const sec = t.closest('.section'); if (sec) addProject(sec, t); }
    else if (act === 'contact') {
      const infos = document.querySelectorAll('.header-info');
      const container = infos[infos.length - 1];
      if (container) {
        container.insertAdjacentHTML('beforeend',
          '<span class="ed" data-item="contact" data-dnd="item" contenteditable="true">📮 新联系方式<span class="editor-only del-btn" data-del title="删除" contenteditable="false">×</span></span>');
        RE.app.afterChange();
      }
    }
    else if (act === 'tag') {
      const container = document.querySelector('.header-tags');
      if (container) {
        container.insertAdjacentHTML('beforeend',
          '<span class="tag ed" data-item="tag" data-dnd="item" contenteditable="true">新标签<span class="editor-only del-btn" data-del title="删除" contenteditable="false">×</span></span>');
        RE.app.afterChange();
      }
    }
    RE.dnd.refresh(); RE.app.afterChange();
  }

  function init() {
    root().addEventListener('click', onActivate);
    // 首次输入即移除占位提示样式
    root().addEventListener('input', e => {
      const el = e.target;
      if (el && el.classList && el.classList.contains('ph')) el.classList.remove('ph');
    });
    const addBtn = document.getElementById('btnAddSection');
    if (addBtn) addBtn.addEventListener('click', openAddSectionModal);
    bindAddSectionModal();
  }

  return { init };
})();
