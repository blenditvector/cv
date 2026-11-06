/* If you are prying, I see you. Let's talk: coatesc92@gmail.com | 876-532-9622 */
(function () {
  var stack = document.getElementById('stack');
  var PAGE_W = 816; // 8.5in at 96 css px/in

  // Scale the page stack down to fit narrow screens (print/export use 1:1).
  function fit() {
    var avail = stack.parentElement.clientWidth - 32;
    var s = Math.min(1, avail / PAGE_W);
    stack.style.transform = s < 1 ? 'scale(' + s + ')' : '';
    stack.style.height = s < 1 ? (stack.scrollHeight * s) + 'px' : '';
    stack.style.marginLeft = s < 1 ? '0' : '';
  }
  window.addEventListener('resize', fit);
  fit();

  document.getElementById('printBtn').addEventListener('click', function () { window.print(); });

  // Invisible, selectable text layer over the page image, so applicant tracking
  // systems (ATS) and copy/paste read real text. Lines are emitted in DOM order.
  // The PDF's built-in font covers Latin-1 only: map typographic characters to ASCII.
  function ascii(t) {
    return t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/[–—]/g, '-').replace(/·/g, '|').replace(/[^ -ÿ]/g, '').trim();
  }

  function addTextLayer(pdf, page, k) {
    var pr = page.getBoundingClientRect();
    var walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (n.parentElement.closest('[aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var range = document.createRange();
    var node;
    while ((node = walker.nextNode())) {
      var cs = getComputedStyle(node.parentElement);
      var upper = cs.textTransform === 'uppercase';
      var size = parseFloat(cs.fontSize) * k; // pt
      var text = node.nodeValue, re = /\S+/g, m, line = null;
      var flush = function () {
        if (!line) return;
        if (!ascii(line.words.join(' '))) { line = null; return; }
        var str = ascii(upper ? line.words.join(' ').toUpperCase() : line.words.join(' '));
        pdf.setFontSize(size);
        var natural = pdf.getTextWidth(str);
        var target = (line.right - line.left) * k;
        var cs2 = str.length > 1 ? (target - natural) / (str.length - 1) : 0;
        pdf.text(str, (line.left - pr.left) * k, (line.bottom - pr.top) * k - size * 0.22,
          { renderingMode: 'invisible', charSpace: cs2 });
        line = null;
      };
      while ((m = re.exec(text))) {
        range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
        var r = range.getBoundingClientRect();
        if (!r.width) continue;
        if (line && Math.abs(r.top - line.top) > r.height * 0.5) flush();
        if (!line) line = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, words: [] };
        line.words.push(m[0]); line.right = r.right; line.bottom = Math.max(line.bottom, r.bottom);
      }
      flush();
    }
  }

  var btn = document.getElementById('pdfBtn');
  btn.addEventListener('click', async function () {
    if (!window.html2canvas || !window.jspdf) { window.print(); return; }
    var label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Preparing…';
    var prev = { t: stack.style.transform, h: stack.style.height, m: stack.style.marginLeft };
    stack.style.transform = ''; stack.style.height = ''; stack.style.marginLeft = '';
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      var pdf = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait', compress: true });
      pdf.setFont('helvetica', 'normal');
      var pages = stack.querySelectorAll('.page');
      for (var i = 0; i < pages.length; i++) {
        var canvas = await html2canvas(pages[i], {
          scale: 3, backgroundColor: '#ffffff', useCORS: true, logging: false,
          width: pages[i].offsetWidth, height: pages[i].offsetHeight,
          windowWidth: Math.max(document.documentElement.clientWidth, PAGE_W + 40)
        });
        if (i > 0) pdf.addPage('letter', 'portrait');
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 612, 792, undefined, 'FAST');
        var pr = pages[i].getBoundingClientRect(), k = 612 / pr.width;
        addTextLayer(pdf, pages[i], k);
        // Keep links clickable in the PDF: overlay a link annotation on each anchor.
        pages[i].querySelectorAll('a[href]').forEach(function (a) {
          var r = a.getBoundingClientRect();
          pdf.link((r.left - pr.left) * k, (r.top - pr.top) * k, r.width * k, r.height * k, { url: a.href });
        });
      }
      var name = document.body.getAttribute('data-pdf-name') || 'Oshane_Coates_Resume';
      pdf.setProperties({ title: document.title, author: "O'shane Coates", subject: 'Resume' });
      pdf.save(name + '.pdf');
    } catch (err) {
      console.error(err);
      alert('Could not build the PDF here. Opening the print dialog instead: choose "Save as PDF".');
      window.print();
    } finally {
      stack.style.transform = prev.t; stack.style.height = prev.h; stack.style.marginLeft = prev.m;
      btn.disabled = false; btn.textContent = label;
    }
  });
})();
