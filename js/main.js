(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  var slides = $$('.slide');
  var N = slides.length;
  var cur = -1;

  var team = $$('.team li').map(function (li) {
    return { short: li.dataset.short, full: li.dataset.full, code: li.dataset.code };
  });
  var SHAPE = ['diamond', 'circle', 'square', 'triangle'];
  var GROUPS = {
    1: 'Parte 1: concepto y origen',
    2: 'Parte 2: enfoque aplicado',
    3: 'Parte 3: ejemplos, usos y herramientas',
    0: 'Material de consulta'
  };

  /* ---------- Avisos breves ---------- */
  var toastEl = $('#toast'), toastT = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 2400);
  }

  /* ---------- Diseño según el tamaño (también cuando se gira la vista) ---------- */
  var nativeLocked = false;
  function layout() {
    var forced = root.classList.contains('force-landscape');
    if (forced && window.innerWidth > window.innerHeight) { setForce(false); return; }
    var w = forced ? window.innerHeight : window.innerWidth;
    var h = forced ? window.innerWidth : window.innerHeight;
    root.classList.toggle('stack', w < 820);
    root.classList.toggle('narrow', w < 560);
    root.classList.toggle('compact', h < 520);
    root.classList.toggle('native-landscape', nativeLocked && window.innerWidth > window.innerHeight);
    updateHint();
  }
  function setForce(on) {
    root.classList.toggle('force-landscape', on);
    try { sessionStorage.setItem('pyForce', on ? '1' : '0'); } catch (e) {}
    layout();
  }
  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', function () { setTimeout(layout, 120); });
  if (screen.orientation && screen.orientation.addEventListener) {
    screen.orientation.addEventListener('change', function () { setTimeout(layout, 120); });
  }

  function tryNativeLandscape() {
    return new Promise(function (resolve) {
      if (!(screen.orientation && screen.orientation.lock)) { resolve(false); return; }
      var el = document.documentElement, p;
      try { p = el.requestFullscreen ? el.requestFullscreen() : (el.webkitRequestFullscreen ? el.webkitRequestFullscreen() : null); } catch (e) { p = null; }
      Promise.resolve(p).then(function () {
        return screen.orientation.lock('landscape');
      }).then(function () { resolve(true); }).catch(function () {
        try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (e) {}
        resolve(false);
      });
    });
  }
  function unlockNative() {
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (e) {}
    nativeLocked = false;
    layout();
  }
  function toggleLandscape() {
    if (root.classList.contains('force-landscape')) { setForce(false); toast('Vista normal'); return; }
    if (nativeLocked) { unlockNative(); toast('Vista normal'); return; }
    if (window.innerWidth > window.innerHeight) { toast('Ya estás en horizontal'); return; }
    tryNativeLandscape().then(function (ok) {
      if (ok) { nativeLocked = true; layout(); toast('Vista horizontal activada'); }
      else { setForce(true); toast('Gira el celular hacia la izquierda para leer mejor'); }
    });
    closeDrawer();
    hideHint(true);
  }

  /* Aviso al entrar desde un celular en vertical */
  var hintEl = $('#rotateHint'), hintDone = false;
  try { hintDone = sessionStorage.getItem('pyHint') === '1'; } catch (e) {}
  function updateHint() {
    var portraitPhone = root.classList.contains('stack') && window.innerHeight > window.innerWidth && !root.classList.contains('force-landscape');
    if (!portraitPhone) hintEl.hidden = true;
  }
  function showHintLater() {
    setTimeout(function () {
      var portraitPhone = root.classList.contains('stack') && window.innerHeight > window.innerWidth && !root.classList.contains('force-landscape');
      if (portraitPhone && !hintDone && !openDrawerEl) hintEl.hidden = false;
    }, 1400);
  }
  function hideHint(remember) {
    hintEl.hidden = true;
    if (remember) { hintDone = true; try { sessionStorage.setItem('pyHint', '1'); } catch (e) {} }
  }
  $('#hintRotate').addEventListener('click', toggleLandscape);
  $('#hintClose').addEventListener('click', function () { hideHint(true); });
  $('#rotateBtn').addEventListener('click', toggleLandscape);
  $('#mtRotate').addEventListener('click', toggleLandscape);

  /* ---------- Pantalla completa ---------- */
  var fsOk = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  if (!fsOk) { $('#fsBtn').style.display = 'none'; $('#mtFs').style.display = 'none'; }
  function toggleFullscreen() {
    if (!fsOk) return;
    var d = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (d.requestFullscreen) d.requestFullscreen(); else if (d.webkitRequestFullscreen) d.webkitRequestFullscreen();
    } else if (document.exitFullscreen) { document.exitFullscreen(); }
    else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
  }
  $('#fsBtn').addEventListener('click', toggleFullscreen);
  $('#mtFs').addEventListener('click', function () { closeDrawer(); toggleFullscreen(); });

  /* ---------- Cronómetro opcional ---------- */
  var timerChip = $('#timerChip');
  var elapsed = 0, tick = null;
  function fmt(t) { var m = Math.floor(t / 60), s = t % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  function paintTimer() {
    var t = fmt(elapsed);
    timerChip.textContent = (tick ? '\u23F8 ' : '\u25B6 ') + t;
    timerChip.hidden = !(tick || elapsed > 0);
    $('#menuTime').textContent = t;
    $('#mtToggle').textContent = tick ? 'Pausar' : (elapsed > 0 ? 'Reanudar' : 'Iniciar');
  }
  function startTimer() { if (tick) return; tick = setInterval(function () { elapsed++; paintTimer(); }, 1000); paintTimer(); }
  function pauseTimer() { clearInterval(tick); tick = null; paintTimer(); }
  function toggleTimer() { tick ? pauseTimer() : startTimer(); }
  function resetTimer() { pauseTimer(); elapsed = 0; paintTimer(); }
  timerChip.addEventListener('click', toggleTimer);
  $('#mtToggle').addEventListener('click', toggleTimer);
  $('#mtReset').addEventListener('click', resetTimer);

  /* ---------- Guion del expositor ---------- */
  var notesPanel = $('#notes'), notesBody = $('#notesBody');
  function showNotes(open) { notesPanel.hidden = !open; }
  function toggleNotes() { showNotes(notesPanel.hidden); }
  $('#notesClose').addEventListener('click', function () { showNotes(false); });
  $('#mtNotes').addEventListener('click', function () { closeDrawer(); toggleNotes(); });

  /* ---------- Paneles laterales (menú y detalles) ---------- */
  var scrim = $('#scrim'), menuEl = $('#menu'), detailEl = $('#detail');
  var menuBtn = $('#menuBtn'), detailBtn = $('#detailBtn');
  var openDrawerEl = null, lastFocus = null;

  function setInert(on, includeBottom) {
    ['deck', 'topbar'].concat(includeBottom ? ['botbar'] : []).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
    if (!on) { var b = document.getElementById('botbar'); if (b) b.removeAttribute('inert'); }
  }
  function openDrawer(el) {
    if (openDrawerEl === el) return;
    if (openDrawerEl) closeDrawer(true);
    lastFocus = document.activeElement;
    openDrawerEl = el;
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    scrim.classList.add('on');
    setInert(true, el === menuEl);
    menuBtn.setAttribute('aria-expanded', String(el === menuEl));
    detailBtn.setAttribute('aria-expanded', String(el === detailEl));
    hideHint(false);
    setTimeout(function () { var c = $('.icon-btn', el); if (c) c.focus(); }, 60);
  }
  function closeDrawer(keepFocus) {
    if (!openDrawerEl) return;
    openDrawerEl.classList.remove('open');
    openDrawerEl.setAttribute('aria-hidden', 'true');
    openDrawerEl = null;
    scrim.classList.remove('on');
    setInert(false);
    menuBtn.setAttribute('aria-expanded', 'false');
    detailBtn.setAttribute('aria-expanded', 'false');
    if (!keepFocus && lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  scrim.addEventListener('click', function () { closeDrawer(); });
  menuBtn.addEventListener('click', function () { openDrawerEl === menuEl ? closeDrawer() : openDrawer(menuEl); });
  $('#menuClose').addEventListener('click', function () { closeDrawer(); });
  $('#detailClose').addEventListener('click', function () { closeDrawer(); });
  detailBtn.addEventListener('click', toggleDetail);

  function templateOf(i) { return $('template.detail', slides[i]); }
  function fillDetail() {
    var tpl = templateOf(cur);
    if (!tpl) return false;
    var h = $('h2', slides[cur]);
    $('#detailTitle').textContent = h ? h.textContent : slides[cur].dataset.title;
    $('#detailKicker').textContent = 'Para saber más \u00B7 Diapositiva ' + (cur + 1);
    var body = $('#detailBody');
    body.innerHTML = tpl.innerHTML;
    body.scrollTop = 0;
    return true;
  }
  function toggleDetail() {
    if (openDrawerEl === detailEl) { closeDrawer(); return; }
    if (!fillDetail()) { toast('Esta diapositiva no tiene detalles'); return; }
    openDrawer(detailEl);
  }

  /* ---------- Menú: índice y equipo ---------- */
  function buildMenu() {
    var box = $('#menuIndex');
    [1, 2, 3, 0].forEach(function (p) {
      var g = document.createElement('div');
      g.className = 'm-group';
      var head = document.createElement('b');
      var sh = document.createElement('span');
      sh.className = 'shape ' + SHAPE[p];
      head.appendChild(sh);
      var label = GROUPS[p];
      if (p > 0 && team[p - 1]) label += ' (' + team[p - 1].short + ')';
      head.appendChild(document.createTextNode(label));
      g.appendChild(head);
      slides.forEach(function (s, k) {
        if (parseInt(s.dataset.presenter, 10) !== p) return;
        var b = document.createElement('button');
        b.className = 'm-item';
        b.dataset.i = k;
        b.innerHTML = '<i>' + (k + 1) + '</i><span></span>';
        $('span', b).textContent = s.dataset.title;
        b.addEventListener('click', function () { go(k); closeDrawer(true); });
        g.appendChild(b);
      });
      box.appendChild(g);
    });
    var ul = $('#menuTeam');
    team.forEach(function (t, i) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="shape ' + SHAPE[i + 1] + '"></span><span></span>';
      li.lastChild.innerHTML = t.full + ' <span class="c">' + t.code + '</span>';
      ul.appendChild(li);
    });
  }

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

  /* ---------- Navegación ---------- */
  function go(n, fromHash) {
    n = Math.max(0, Math.min(N - 1, n));
    if (n === cur) return;
    cur = n;
    slides.forEach(function (s, k) {
      s.classList.toggle('is-active', k === n);
      s.classList.toggle('is-before', k < n);
      if (k === n) { s.removeAttribute('inert'); s.setAttribute('aria-hidden', 'false'); }
      else { s.setAttribute('inert', ''); s.setAttribute('aria-hidden', 'true'); }
    });
    var s = slides[n];
    s.scrollTop = 0;
    $$('.slide .open').forEach(function (e) { e.classList.remove('open'); });
    document.body.dataset.theme = s.classList.contains('dark') ? 'dark' : 'light';

    var p = parseInt(s.dataset.presenter, 10);
    var nm = p > 0 && team[p - 1] ? team[p - 1].short : '';
    $('#pName').textContent = p > 0 ? 'Expositor ' + p + (nm ? ': ' + nm : '') : 'Material de consulta';
    $('#pShape').className = 'shape ' + SHAPE[p];

    dots.forEach(function (d, k) { d.classList.toggle('on', k === n); });
    $$('.m-item').forEach(function (m) { m.classList.toggle('on', parseInt(m.dataset.i, 10) === n); });
    $('#counter').textContent = (n + 1) + ' / ' + N;
    $('#bar').style.width = (N > 1 ? (n / (N - 1)) * 100 : 100) + '%';

    var aside = $('.notes', s);
    notesBody.innerHTML = aside ? aside.innerHTML : '<p>Esta diapositiva no tiene guion.</p>';

    detailBtn.hidden = !templateOf(n);
    if (openDrawerEl === detailEl) { if (!fillDetail()) closeDrawer(true); }

    if (!fromHash) history.replaceState(null, '', '#' + (n + 1));
  }
  function next() { go(cur + 1); }
  function prevS() { go(cur - 1); }
  $('#next').addEventListener('click', next);
  $('#prev').addEventListener('click', prevS);

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    var key = e.key;
    if (key === 'Escape') { if (openDrawerEl) closeDrawer(); else showNotes(false); return; }
    if (openDrawerEl === menuEl) return;
    if (key === 'ArrowRight' || key === 'PageDown') { e.preventDefault(); next(); }
    else if (key === 'ArrowLeft' || key === 'PageUp') { e.preventDefault(); prevS(); }
    else if (key === ' ' && tag !== 'button' && tag !== 'input' && !openDrawerEl) { e.preventDefault(); e.shiftKey ? prevS() : next(); }
    else if (key === 'ArrowDown' && !openDrawerEl) { if (!slideScrolls()) { e.preventDefault(); next(); } }
    else if (key === 'ArrowUp' && !openDrawerEl) { if (!slideScrolls()) { e.preventDefault(); prevS(); } }
    else if (key === 'Home') { go(0); }
    else if (key === 'End') { go(N - 1); }
    else if (key === 'd' || key === 'D') { toggleDetail(); }
    else if (key === 'm' || key === 'M') { openDrawer(menuEl); }
    else if (key === 'n' || key === 'N') { toggleNotes(); }
    else if (key === 't' || key === 'T') { toggleTimer(); }
    else if (key === 'r' || key === 'R') { resetTimer(); }
    else if (key === 'f' || key === 'F') { toggleFullscreen(); }
  });
  function slideScrolls() { var s = slides[cur]; return s.scrollHeight > s.clientHeight + 4; }

  /* Gestos táctiles (se adaptan a la vista girada) */
  var tx = null, ty = null, tBlock = false;
  document.addEventListener('touchstart', function (e) {
    tBlock = !!(e.target.closest && e.target.closest('.drawer, .notes-panel, .rotate-hint, .quiz, .biblio, .tools, .sectors'));
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx === null || tBlock || openDrawerEl) { tx = ty = null; return; }
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    var forced = root.classList.contains('force-landscape');
    var along = forced ? dy : dx, across = forced ? dx : dy;
    if (Math.abs(along) > 60 && Math.abs(along) > Math.abs(across) * 1.5) { along < 0 ? next() : prevS(); }
    tx = ty = null;
  }, { passive: true });

  window.addEventListener('hashchange', function () {
    var n = parseInt(location.hash.replace('#', ''), 10);
    if (!isNaN(n)) go(n - 1, true);
  });

  /* Botones con acción dentro de las diapositivas */
  $$('[data-act]').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var a = b.dataset.act;
      if (a === 'next') next();
      else if (a === 'menu') openDrawer(menuEl);
      else if (a === 'detail') toggleDetail();
    });
  });

  /* Tarjetas: en pantallas táctiles, tocar abre o cierra */
  $$('.flip, .card, .panel, .steps6 li').forEach(function (el) {
    el.addEventListener('click', function () { el.classList.toggle('open'); });
  });

  /* ---------- Compartir e imprimir ---------- */
  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      toast(ok ? 'Enlace copiado' : 'No se pudo copiar el enlace');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Enlace copiado'); }, fallback);
    } else { fallback(); }
  }
  $('#mtShare').addEventListener('click', function () {
    closeDrawer(true);
    var url = location.href;
    if (navigator.share) {
      navigator.share({ title: document.title, text: 'Poka Yoke: diseñar para que el error no ocurra', url: url }).catch(function () {});
    } else { copyText(url); }
  });
  $('#mtPrint').addEventListener('click', function () { closeDrawer(true); setTimeout(function () { window.print(); }, 350); });

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

  /* ---------- Imágenes: busca la extensión disponible; si falta, deja el marcador ---------- */
  $$('.shot').forEach(function (fig) {
    var name = fig.dataset.img;
    var exts = ['webp', 'jpg', 'png', 'jpeg'];
    var k = 0;
    var img = new Image();
    img.alt = fig.dataset.alt || '';
    img.decoding = 'async';
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
    var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
    var clearAll = function () { timers.forEach(clearTimeout); timers = []; };
    var setT = function (x, r, ms) {
      plug.style.transitionDuration = ms + 'ms';
      plug.style.transform = 'translate(' + x + 'px,0) rotate(' + r + 'deg)';
    };
    var say = function (text, cls) { msg.textContent = text; msg.className = 'demo-msg' + (cls ? ' ' + cls : ''); };
    var tint = function (c) { shell.style.fill = c || ''; };
    var isWrong = function () { return (rot / 180) % 2 !== 0; };

    var resetDemo = function () {
      clearAll(); busy = false; tint('');
      setT(X_OUT, rot, 550);
      btnI.disabled = false; btnR.disabled = false;
    };
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
        later(resetDemo, 1800);
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
        later(resetDemo, 2400);
      }
    });
    toggle.addEventListener('change', function () {
      clearAll(); busy = false;
      shell.setAttribute('d', toggle.checked ? D_KEY : D_PLAIN);
      keyPoly.style.display = toggle.checked ? '' : 'none';
      say(toggle.checked ? 'Poka Yoke activado: el conector tiene la esquina cortada.' : 'Poka Yoke desactivado: el conector es simétrico y entra de cualquier lado.');
      resetDemo();
    });
  }

  /* ---------- Autoevaluación ---------- */
  var QUIZ = [
    { q: '¿Qué significa «poka» en Poka Yoke?', o: ['Herramienta', 'Error inadvertido', 'Calidad', 'Rápido'], a: 1,
      e: 'Poka es un error inadvertido o descuido; yoke viene de «evitar».' },
    { q: '¿Quién formalizó el Poka Yoke dentro del Control de Calidad Cero?', o: ['Taiichi Ohno', 'Kaoru Ishikawa', 'Shigeo Shingo', 'W. Edwards Deming'], a: 2,
      e: 'Shigeo Shingo, ingeniero industrial japonés y asesor de Toyota.' },
    { q: '¿Por qué Shingo cambió «baka-yoke» por «poka-yoke»?', o: ['Porque era difícil de pronunciar', 'Porque el primer nombre resultaba ofensivo para los operarios', 'Porque lo exigió una norma ISO', 'Porque se perdió la traducción'], a: 1,
      e: 'Baka-yoke significaba «a prueba de tontos», y los operarios lo consideraron ofensivo.' },
    { q: 'Un método que revisa la forma, el tamaño o el color de la pieza es el método de:', o: ['Contacto', 'Valor fijo', 'Paso a paso', 'Mitigación'], a: 0,
      e: 'El método de contacto comprueba características físicas de la pieza, como forma, tamaño o color.' },
    { q: 'Una alarma que avisa del error pero no detiene el proceso corresponde a un poka-yoke de:', o: ['Control', 'Advertencia', 'Eliminación', 'Reemplazo'], a: 1,
      e: 'El de advertencia avisa y depende de que una persona reaccione; el de control detiene o bloquea el proceso.' },
    { q: 'En la clasificación de seis estrategias, ¿cuál se considera de mayor prioridad?', o: ['Mitigación', 'Detección', 'Eliminación', 'Facilitación'], a: 2,
      e: 'Eliminación: rediseñar para que la tarea propensa al error ya no sea necesaria.' },
    { q: 'La diferencia de diámetro entre las boquillas de diésel y de gasolina protege sobre todo de:', o: ['Poner gasolina en un carro diésel', 'Poner diésel en un carro a gasolina', 'Las dos cosas por igual', 'Ninguna de las dos'], a: 1,
      e: 'La boquilla de diésel es más ancha y no cabe en la mayoría de tanques de gasolina; la de gasolina sí cabe en uno diésel.' }
  ];
  (function buildQuiz() {
    var box = $('#quiz');
    if (!box) return;
    var answered = 0, correct = 0;
    var score = document.createElement('div');
    score.className = 'qscore';
    function paintScore() {
      score.innerHTML = '';
      var t = document.createElement('span');
      t.textContent = answered < QUIZ.length ? 'Aciertos: ' + correct + ' de ' + answered : 'Resultado final: ' + correct + ' de ' + QUIZ.length;
      score.appendChild(t);
      var b = document.createElement('button');
      b.className = 'chip'; b.textContent = 'Reiniciar';
      b.addEventListener('click', build);
      score.appendChild(b);
    }
    function build() {
      box.innerHTML = ''; answered = 0; correct = 0;
      QUIZ.forEach(function (item, qi) {
        var card = document.createElement('div');
        card.className = 'qcard';
        var h = document.createElement('h3');
        h.textContent = (qi + 1) + '. ' + item.q;
        card.appendChild(h);
        var opts = document.createElement('div');
        opts.className = 'qopts';
        item.o.forEach(function (txt, oi) {
          var b = document.createElement('button');
          b.className = 'qopt'; b.textContent = txt;
          b.addEventListener('click', function () {
            if (card.classList.contains('done')) return;
            card.classList.add('done');
            answered++;
            $$('.qopt', opts).forEach(function (x, xi) {
              x.disabled = true;
              if (xi === item.a) x.classList.add('ok');
            });
            if (oi === item.a) correct++; else b.classList.add('bad');
            exp.textContent = (oi === item.a ? 'Correcto. ' : 'No es esa. ') + item.e;
            paintScore();
          });
          opts.appendChild(b);
        });
        card.appendChild(opts);
        var exp = document.createElement('p');
        exp.className = 'qexp';
        card.appendChild(exp);
        box.appendChild(card);
      });
      paintScore();
      box.appendChild(score);
    }
    build();
  })();

  /* ---------- Inicio ---------- */
  try { if (sessionStorage.getItem('pyForce') === '1' && window.innerHeight > window.innerWidth) root.classList.add('force-landscape'); } catch (e) {}
  buildMenu();
  paintTimer();
  layout();
  var start = parseInt(location.hash.replace('#', ''), 10);
  go(!isNaN(start) ? start - 1 : 0, true);
  showHintLater();
})();
