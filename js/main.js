(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var slides = $$('.slide');
  var N = slides.length;
  var cur = -1;
  var names = $$('.team li').map(function (li) { return li.textContent.trim(); });

  /* ---------- Puntos de navegación ---------- */
  var dotsBox = $('#dots');
  slides.forEach(function (s, k) {
    var b = document.createElement('button');
    b.className = 'dot';
    b.dataset.p = s.dataset.presenter;
    b.title = (k + 1) + '. ' + s.dataset.title;
    b.setAttribute('aria-label', 'Ir a la diapositiva ' + (k + 1) + ': ' + s.dataset.title);
    b.addEventListener('click', function () { go(k); });
    dotsBox.appendChild(b);
  });
  var dots = $$('.dot');

  /* ---------- Temporizador ---------- */
  var timerEl = $('#timer');
  var elapsed = 0, tick = null;
  var LIMIT = 15 * 60;
  function fmt(t) {
    var m = Math.floor(t / 60), s = t % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function paintTimer() {
    timerEl.textContent = fmt(elapsed);
    timerEl.classList.toggle('over', elapsed > LIMIT);
    timerEl.classList.toggle('run', !!tick);
  }
  function startTimer() { if (tick) return; tick = setInterval(function () { elapsed++; paintTimer(); }, 1000); paintTimer(); }
  function pauseTimer() { clearInterval(tick); tick = null; paintTimer(); }
  function toggleTimer() { tick ? pauseTimer() : startTimer(); }
  function resetTimer() { pauseTimer(); elapsed = 0; paintTimer(); }
  timerEl.addEventListener('click', toggleTimer);

  /* ---------- Guion del expositor ---------- */
  var notesPanel = $('#notes'), notesBody = $('#notesBody'), notesBtn = $('#notesBtn');
  function showNotes(open) {
    notesPanel.hidden = !open;
    notesBtn.setAttribute('aria-expanded', String(open));
  }
  function toggleNotes() { showNotes(notesPanel.hidden); }
  notesBtn.addEventListener('click', toggleNotes);
  $('#notesClose').addEventListener('click', function () { showNotes(false); });

  /* ---------- Navegación ---------- */
  function go(n, fromHash) {
    n = Math.max(0, Math.min(N - 1, n));
    if (n === cur) return;
    var prev = cur;
    cur = n;
    slides.forEach(function (s, k) {
      s.classList.toggle('is-active', k === n);
      s.classList.toggle('is-before', k < n);
      if (k === n) { s.removeAttribute('inert'); s.setAttribute('aria-hidden', 'false'); }
      else { s.setAttribute('inert', ''); s.setAttribute('aria-hidden', 'true'); }
    });
    var s = slides[n];
    s.scrollTop = 0;
    $$('.flip.open, .card.open').forEach(function (e) { e.classList.remove('open'); });
    document.body.dataset.theme = s.classList.contains('dark') ? 'dark' : 'light';

    var p = parseInt(s.dataset.presenter, 10);
    var nm = names[p - 1];
    $('#pName').textContent = (nm && !/^Nombre del integrante/i.test(nm)) ? 'Expositor ' + p + ': ' + nm : 'Expositor ' + p;
    $('#pShape').className = 'shape ' + ['circle', 'square', 'triangle'][p - 1];

    dots.forEach(function (d, k) { d.classList.toggle('on', k === n); });
    $('#counter').textContent = (n + 1) + ' / ' + N;
    $('#bar').style.width = (N > 1 ? (n / (N - 1)) * 100 : 100) + '%';

    var aside = $('.notes', s);
    notesBody.innerHTML = aside ? aside.innerHTML : '';

    if (!fromHash) history.replaceState(null, '', '#' + (n + 1));
    if (prev === 0 && elapsed === 0 && !tick) startTimer();
  }
  function next() { go(cur + 1); }
  function prevS() { go(cur - 1); }
  $('#next').addEventListener('click', next);
  $('#prev').addEventListener('click', prevS);

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    var key = e.key;
    if (key === 'ArrowRight' || key === 'PageDown') { e.preventDefault(); next(); }
    else if (key === 'ArrowLeft' || key === 'PageUp') { e.preventDefault(); prevS(); }
    else if (key === ' ' && tag !== 'button' && tag !== 'input') { e.preventDefault(); e.shiftKey ? prevS() : next(); }
    else if (key === 'ArrowDown' && tag !== 'input') { if (!slideScrolls()) { e.preventDefault(); next(); } }
    else if (key === 'ArrowUp' && tag !== 'input') { if (!slideScrolls()) { e.preventDefault(); prevS(); } }
    else if (key === 'Home') { go(0); }
    else if (key === 'End') { go(N - 1); }
    else if (key === 'n' || key === 'N') { toggleNotes(); }
    else if (key === 't' || key === 'T') { toggleTimer(); }
    else if (key === 'r' || key === 'R') { resetTimer(); }
    else if (key === 'f' || key === 'F') { toggleFullscreen(); }
    else if (key === 'Escape') { showNotes(false); }
  });
  function slideScrolls() { var s = slides[cur]; return s.scrollHeight > s.clientHeight + 4; }
  function toggleFullscreen() {
    if (!document.fullscreenElement) { var d = document.documentElement; if (d.requestFullscreen) d.requestFullscreen(); }
    else if (document.exitFullscreen) document.exitFullscreen();
  }

  /* Gestos táctiles */
  var tx = null, ty = null;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { dx < 0 ? next() : prevS(); }
    tx = ty = null;
  }, { passive: true });

  window.addEventListener('hashchange', function () {
    var n = parseInt(location.hash.replace('#', ''), 10);
    if (!isNaN(n)) go(n - 1, true);
  });

  /* Tarjetas: en pantallas táctiles, tocar abre/cierra */
  $$('.flip, .card, .panel, .steps6 li').forEach(function (el) {
    el.addEventListener('click', function () { el.classList.toggle('open'); });
  });

  /* ---------- Pestañas de sectores ---------- */
  $$('.tab').forEach(function (t) {
    function activate() {
      $$('.tab').forEach(function (x) { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      $$('.tp').forEach(function (p) { p.classList.toggle('on', p.id === 'tp-' + t.dataset.t); });
    }
    t.addEventListener('click', activate);
    t.addEventListener('mouseenter', activate);
    t.addEventListener('focus', activate);
  });

  /* ---------- Imágenes: prueba varias extensiones y, si faltan, deja el marcador ---------- */
  $$('.shot').forEach(function (fig) {
    var name = fig.dataset.img;
    var exts = ['jpg', 'png', 'webp', 'jpeg'];
    var k = 0;
    var img = new Image();
    img.alt = fig.dataset.alt || '';
    img.onload = function () { fig.insertBefore(img, fig.firstChild); fig.classList.add('has-img'); };
    img.onerror = function () { k++; if (k < exts.length) img.src = 'images/' + name + '.' + exts[k]; };
    img.src = 'images/' + name + '.' + exts[0];
  });

  /* ---------- Demo del conector ---------- */
  var plug = $('#demoPlug');
  if (plug) {
    var shell = $('#demoShell'), keyPoly = $('#demoKey'), msg = $('#demoMsg');
    var toggle = $('#demoToggle'), btnR = $('#demoRotate'), btnI = $('#demoInsert');
    var D_KEY = 'M12 0H142L192 50V120a12 12 0 0 1-12 12H12a12 12 0 0 1-12-12V12A12 12 0 0 1 12 0Z';
    var D_PLAIN = 'M12 0H180a12 12 0 0 1 12 12V120a12 12 0 0 1-12 12H12a12 12 0 0 1-12-12V12A12 12 0 0 1 12 0Z';
    var X_OUT = -320, X_IN = 0, X_STOP = -52, X_BACK = -170;
    var rot = 0, busy = false, saved = 0, defects = 0;
    var timers = [];

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clearAll() { timers.forEach(clearTimeout); timers = []; }
    function setT(x, r, ms) {
      plug.style.transitionDuration = ms + 'ms';
      plug.style.transform = 'translate(' + x + 'px,0) rotate(' + r + 'deg)';
    }
    function say(text, cls) { msg.textContent = text; msg.className = 'demo-msg' + (cls ? ' ' + cls : ''); }
    function tint(c) { shell.style.fill = c || ''; }
    function isWrong() { return (rot / 180) % 2 !== 0; }

    function reset() {
      clearAll(); busy = false; tint('');
      setT(X_OUT, rot, 550);
      btnI.disabled = false; btnR.disabled = false;
    }

    btnR.addEventListener('click', function () {
      if (busy) return;
      rot += 180;
      setT(X_OUT, rot, 500);
      say(isWrong() ? 'Conector girado: ahora está al revés.' : 'Conector girado: ahora está en la posición correcta.');
    });

    btnI.addEventListener('click', function () {
      if (busy) return;
      busy = true; btnI.disabled = true; btnR.disabled = true;
      var wrong = isWrong(), guarded = toggle.checked;
      if (guarded && wrong) {
        setT(X_STOP, rot, 380);
        later(function () {
          tint('var(--bad)');
          say('No entra: la esquina cortada choca con la guía. Error evitado.', 'bad');
          saved++; $('#scSaved').textContent = saved;
          setT(X_BACK, rot, 320);
        }, 400);
        later(function () { reset(); }, 1800);
      } else {
        setT(X_IN, rot, 550);
        later(function () {
          if (wrong) {
            tint('var(--bad)');
            defects++; $('#scDefects').textContent = defects;
            say('Entró al revés. Sin guía, el error pasó y el equipo llegaría dañado al cliente.', 'bad');
          } else {
            tint('var(--ok)');
            say('Entró bien: posición correcta.', 'good');
          }
        }, 600);
        later(function () { reset(); }, 2400);
      }
    });

    toggle.addEventListener('change', function () {
      clearAll(); busy = false;
      shell.setAttribute('d', toggle.checked ? D_KEY : D_PLAIN);
      keyPoly.style.display = toggle.checked ? '' : 'none';
      say(toggle.checked ? 'Poka Yoke activado: el conector tiene la esquina cortada.' : 'Poka Yoke desactivado: el conector es simétrico y entra de cualquier lado.');
      reset();
    });
  }

  /* ---------- Inicio ---------- */
  paintTimer();
  var start = parseInt(location.hash.replace('#', ''), 10);
  go(!isNaN(start) ? start - 1 : 0, true);
})();
