/* exporter.js —— 导出 PDF / PNG / HTML / Word / 打印 */
window.RE = window.RE || {};
RE.exporter = (function () {
  function root() { return document.getElementById('resumeRoot'); }

  function buildCleanClone() {
    const src = root();
    const clone = src.cloneNode(true);
    clone.classList.remove('edit-mode');
    clone.removeAttribute('id');
    clone.querySelectorAll('.page-guide').forEach(e => e.remove());
    clone.querySelectorAll('.editor-only').forEach(e => e.remove());
    clone.querySelectorAll('.ed').forEach(e => { e.removeAttribute('contenteditable'); e.classList.remove('ed'); });
    clone.querySelectorAll('.section.is-hidden').forEach(e => e.remove());
    clone.querySelectorAll('.dnd-handle, .eye-btn, .del-btn, .add-btn, .section-ctrls').forEach(e => e.remove());
    clone.style.position = 'absolute';
    clone.style.left = '-99999px';
    clone.style.top = '0';
    clone.style.width = '800px';
    clone.style.boxShadow = 'none';
    clone.style.margin = '0';
    document.body.appendChild(clone);
    return clone;
  }

  function resetClone(clone) {
    clone.style.position = ''; clone.style.left = ''; clone.style.top = '';
    clone.style.width = ''; clone.style.boxShadow = ''; clone.style.margin = '';
  }

  function capture() {
    const clone = buildCleanClone();
    return window.html2canvas(clone, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false })
      .then(canvas => { document.body.removeChild(clone); return canvas; });
  }

  function fileName(ext) {
    const map = { pdf: 'pdf', png: 'png', html: 'html', doc: 'doc' };
    const h1 = root().querySelector('h1');
    const name = (h1 && h1.textContent || '简历').trim();
    return name + '-前端工程师简历.' + map[ext];
  }

  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function exportPdf() {
    const btn = document.getElementById('btnPdf'); const old = btn.textContent;
    btn.textContent = '生成中…'; btn.disabled = true;
    Promise.resolve().then(() => {
      if (!window.jspdf) return Promise.reject(new Error('jsPDF 未加载'));
      const { jsPDF } = window.jspdf;
      return capture().then(canvas => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageW = 210, pageH = 297;
        const imgW = pageW;
        const imgH = canvas.height * imgW / canvas.width;
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        let heightLeft = imgH, position = 0;
        pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
        heightLeft -= pageH;
        const EPS = 3;
        while (heightLeft > EPS) { position -= pageH; pdf.addPage(); pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH); heightLeft -= pageH; }
        pdf.save(fileName('pdf'));
      });
    }).catch(err => { alert('PDF 生成失败：' + err.message + '\n可改用「一键打印」→ 另存为 PDF。'); })
      .then(() => { btn.textContent = old; btn.disabled = false; });
  }

  function exportPng() {
    const btn = document.getElementById('btnPng'); const old = btn.textContent;
    btn.textContent = '生成中…'; btn.disabled = true;
    capture()
      .then(canvas => { const a = document.createElement('a'); a.download = fileName('png'); a.href = canvas.toDataURL('image/png'); a.click(); })
      .catch(err => alert('PNG 生成失败：' + err.message))
      .then(() => { btn.textContent = old; btn.disabled = false; });
  }

  function exportHtml() {
    const clone = buildCleanClone();
    resetClone(clone);
    const h1 = root().querySelector('h1');
    const title = (h1 && h1.textContent || '简历') + '-前端工程师简历';
    const doc = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + '</title><link rel="stylesheet" href="assets/css/base.css"></head><body class="resume-view">' + clone.outerHTML + '</body></html>';
    document.body.removeChild(clone);
    download(new Blob([doc], { type: 'text/html;charset=utf-8' }), fileName('html'));
  }

  function readCss(url) {
    try { const x = new XMLHttpRequest(); x.open('GET', url, false); x.send(); return x.responseText; }
    catch (e) { return ''; }
  }

  function exportWord() {
    const clone = buildCleanClone();
    resetClone(clone);
    const css = readCss('assets/css/base.css');
    const doc = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>' + css + '</style></head><body class="resume-view">' + clone.outerHTML + '</body></html>';
    document.body.removeChild(clone);
    download(new Blob(['﻿' + doc], { type: 'application/msword;charset=utf-8' }), fileName('doc'));
  }

  function print() { window.print(); }

  return { exportPdf, exportPng, exportHtml, exportWord, print };
})();
