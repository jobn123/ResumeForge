/* storage.js —— 自动保存（localStorage）与 JSON 数据导入导出 */
window.RE = window.RE || {};
RE.storage = (function () {
  const KEY = 'resumeforge:v2';

  function persist(root, settings) {
    try {
      const data = JSON.stringify({ html: root.outerHTML, settings: settings || {} });
      localStorage.setItem(KEY, data);
      return true;
    } catch (e) { return false; }
  }

  function getPersisted() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }

  return { persist, getPersisted, clear };
})();
