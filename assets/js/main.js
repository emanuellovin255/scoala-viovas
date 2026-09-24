/* ==========================================================================
   VIOVAS — interacțiuni
   Vanilla JS, fără dependențe. Fiecare modul iese elegant dacă lipsește DOM-ul.
   Sub „prefers-reduced-motion" nu pornește nimic din ce se mișcă singur.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     CONFIGURARE — singurele valori pe care trebuie să le editezi
     ------------------------------------------------------------------------ */
  var CONFIG = {
    // Cheia de acces Web3Forms pentru formularul de contact.
    // Se obține gratuit pe https://web3forms.com introducând contact@viovas.ro
    // și confirmând emailul. Lipește cheia primită între ghilimelele de mai jos.
    WEB3FORMS_KEY: ''
  };

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  var pageTop = function (el) { return el.getBoundingClientRect().top + window.scrollY; };

  /* ------------------------------------------------------------------------
     0. Intro — mașina Viovas pe drum (doar pe prima pagină, o dată pe sesiune)
     Coregrafia e în CSS (secțiunea 31); aici doar o pornim și o închidem.
     ------------------------------------------------------------------------ */
  (function intro() {
    var el = document.getElementById('intro');
    if (!el) return;
    if (!root.classList.contains('intro-on')) { el.parentNode.removeChild(el); return; }

    // Intro-ul pornește mereu de sus (dacă adresa nu cere o secțiune anume)
    if (!window.location.hash) {
      if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }

    // Literele titlului, fiecare în span-ul ei, ca să poată urca pe rând
    $$('[data-letters]', el).forEach(function (n) {
      var text = n.textContent;
      n.textContent = '';
      Array.prototype.forEach.call(text, function (ch, i) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.style.setProperty('--i', i);
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        n.appendChild(s);
      });
    });

    var started = false, done = false, timers = [];

    // La deschidere, filmarea din hero trebuie să ruleze (unele browsere o opresc
    // cât timp e acoperită)
    function wakeHero() {
      var v = document.getElementById('v-hero');
      if (!v || !v.paused || !v.muted) return;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }

    function finish() {
      if (done) return;
      done = true;
      timers.forEach(window.clearTimeout);
      root.classList.add('intro-open');
      root.classList.remove('intro-on');
      if (el.parentNode) el.parentNode.removeChild(el);
      wakeHero();
      try { window.sessionStorage.setItem('viovas-intro', '1'); } catch (e) {}
      document.removeEventListener('keydown', onKey);
    }
    function skip() {
      if (done) return;
      root.classList.add('intro-open');
      el.classList.add('is-skip');
      timers.push(window.setTimeout(finish, 450));
    }
    function onKey(e) { if (e.key === 'Escape') skip(); }
    function start() {
      if (started) return;
      started = true;
      root.classList.add('intro-play');
      // Cortina se despică la 3,4 s — atunci pornește și hero-ul din spate
      timers.push(window.setTimeout(function () { root.classList.add('intro-open'); wakeHero(); }, 3400));
      timers.push(window.setTimeout(finish, 4250));
    }

    el.addEventListener('click', skip);
    document.addEventListener('keydown', onKey);

    // Pornim doar când imaginea mașinii e decodată (cel mult 700 ms de așteptare)
    var img = $('.intro__body', el);
    var ready = (img && img.decode) ? img.decode() : Promise.resolve();
    var guard = new Promise(function (r) { window.setTimeout(r, 700); });
    Promise.race([ready, guard]).then(start, start);
  })();

  /* ------------------------------------------------------------------------
     1. Antet — lipit, ascuns la derulare în jos, pastilă sub linkuri
     ------------------------------------------------------------------------ */
  (function header() {
    var el = $('.header');
    if (!el) return;
    var ticking = false, lastY = window.scrollY;

    function update() {
      var y = Math.max(0, window.scrollY);
      el.classList.toggle('is-stuck', y > 40);
      var locked = document.body.classList.contains('is-locked') || root.classList.contains('intro-on');
      if (!locked && y > 320 && y > lastY + 6) el.classList.add('is-hidden');
      else if (y < lastY - 6 || y <= 320) el.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    el.addEventListener('focusin', function () { el.classList.remove('is-hidden'); });
    update();

    // Pastila care alunecă între linkurile de navigare
    var nav = $('.nav', el);
    if (!nav || reduced || !finePointer) return;
    var pill = document.createElement('span');
    pill.className = 'nav__pill';
    pill.setAttribute('aria-hidden', 'true');
    nav.appendChild(pill);

    function moveTo(link) {
      nav.style.setProperty('--px', link.offsetLeft + 'px');
      nav.style.setProperty('--pw', link.offsetWidth + 'px');
      nav.classList.add('has-pill');
    }
    $$('.nav__link', nav).forEach(function (link) {
      link.addEventListener('mouseenter', function () { moveTo(link); });
      link.addEventListener('focus', function () { moveTo(link); });
    });
    nav.addEventListener('mouseleave', function () { nav.classList.remove('has-pill'); });
  })();

  /* ------------------------------------------------------------------------
     2. Meniu mobil
     ------------------------------------------------------------------------ */
  (function drawer() {
    var btn = $('.burger');
    var panel = $('.drawer');
    if (!btn || !panel) return;

    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('is-locked', open);
      if (open) {
        var first = panel.querySelector('a, button');
        if (first) first.focus({ preventScroll: true });
      }
    }

    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });

    // Capcană de focus cât timp meniul e deschis
    panel.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var items = $$('a, button', panel).filter(function (n) { return n.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980 && btn.getAttribute('aria-expanded') === 'true') setOpen(false);
    });
  })();

  /* ------------------------------------------------------------------------
     3. Titluri pe cuvinte — fiecare cuvânt urcă dintr-o mască
     Textul rămâne același pentru cititoarele de ecran (doar se împachetează).
     ------------------------------------------------------------------------ */
  (function splitWords() {
    if (reduced) return;
    var heads = $$('[data-split], .sec-head h2, .pagehead h1, .band__content h2, .cta-band h2, .split h2');
    if (!heads.length) return;

    function wrap(content, i) {
      var w = document.createElement('span');
      w.className = 'w';
      var inner = document.createElement('span');
      inner.className = 'w__i';
      inner.style.setProperty('--i', i);
      inner.appendChild(content);
      w.appendChild(inner);
      return w;
    }

    heads.forEach(function (h) {
      if (h.classList.contains('split-w')) return;
      var i = 0;
      var frag = document.createDocumentFragment();
      Array.prototype.slice.call(h.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (!part.trim()) { frag.appendChild(document.createTextNode(' ')); return; }
            frag.appendChild(wrap(document.createTextNode(part), i++));
          });
        } else if (node.nodeType === 1) {
          frag.appendChild(wrap(node, i++));
        }
      });
      h.textContent = '';
      h.appendChild(frag);
      h.classList.add('split-w');
    });

    var rest = heads.filter(function (h) { return !h.closest('.hero'); });
    if (!hasIO) { rest.forEach(function (h) { h.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
    rest.forEach(function (h) { io.observe(h); });
  })();

  /* ------------------------------------------------------------------------
     4. Reveal la scroll
     ------------------------------------------------------------------------ */
  (function reveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (reduced || !hasIO) {
      items.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }

    // Decalaj automat pentru frații din același container
    items.forEach(function (n) {
      if (n.style.getPropertyValue('--d')) return;
      var group = n.parentElement ? $$('[data-reveal]', n.parentElement) : [];
      if (group.length > 1) {
        var i = group.indexOf(n);
        if (i > -1) n.style.setProperty('--d', Math.min(i, 6) * 90 + 'ms');
      }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (n) { io.observe(n); });
  })();

  /* ------------------------------------------------------------------------
     5. Odometru — cifrele se derulează ca la un kilometraj mecanic
     Se aplică pe [data-count] (bara de încredere) și pe prețurile din tarife.
     Numărul real rămâne în pagină, ascuns vizual, pentru cititoarele de ecran.
     ------------------------------------------------------------------------ */
  (function odometers() {
    if (reduced) return;
    var targets = [];

    function build(value) {
      var sr = document.createElement('span');
      sr.className = 'visually-hidden';
      sr.textContent = value;
      var odo = document.createElement('span');
      odo.className = 'odo';
      odo.setAttribute('aria-hidden', 'true');
      var k = 0;
      Array.prototype.forEach.call(value, function (ch) {
        if (!/\d/.test(ch)) {
          var s = document.createElement('span');
          s.className = 'odo__sep';
          s.textContent = ch;
          odo.appendChild(s);
          return;
        }
        var col = document.createElement('span');
        col.className = 'odo__col';
        var strip = document.createElement('span');
        strip.className = 'odo__strip';
        var html = '';
        // Două rotații de cifre: tamburul face un tur complet înainte să se oprească
        for (var n = 0; n < 20; n++) html += '<span>' + (n % 10) + '</span>';
        strip.innerHTML = html;
        strip.style.setProperty('--n', 10 + parseInt(ch, 10));
        strip.style.setProperty('--t', (1.3 + k * 0.3).toFixed(2) + 's');
        strip.style.setProperty('--td', (k * 0.07).toFixed(2) + 's');
        col.appendChild(strip);
        odo.appendChild(col);
        k++;
      });
      targets.push(odo);
      return [sr, odo];
    }

    $$('[data-count]').forEach(function (el) {
      var value = el.getAttribute('data-count');
      if (!value) return;
      el.textContent = '';
      build(value).forEach(function (n) { el.appendChild(n); });
    });

    $$('.price-card__amount').forEach(function (el) {
      var node = el.firstChild;
      if (!node || node.nodeType !== 3 || !/\d/.test(node.textContent)) return;
      var value = node.textContent.trim();
      var parts = build(value);
      el.insertBefore(parts[0], node);
      el.insertBefore(parts[1], node);
      el.removeChild(node);
    });

    if (!targets.length) return;
    function on(odo) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () { odo.classList.add('is-on'); });
      });
    }
    if (!hasIO) { targets.forEach(on); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        on(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    targets.forEach(function (t) { io.observe(t); });
  })();

  /* ------------------------------------------------------------------------
     6. Înclinare 3D pe carduri (doar pointer fin)
     ------------------------------------------------------------------------ */
  (function tilt() {
    if (reduced || !finePointer) return;
    $$('[data-tilt], .price-card').forEach(function (card) {
      var raf = null;
      function move(e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            'perspective(900px) rotateX(' + (-y * 6).toFixed(2) + 'deg) rotateY(' +
            (x * 6).toFixed(2) + 'deg) translateY(-6px)';
          raf = null;
        });
      }
      card.addEventListener('mouseenter', function () {
        card.style.transition = 'transform 0.15s ease-out, border-color 0.3s, background-color 0.3s';
      });
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        card.style.transform = '';
      });
    });
  })();

  /* ------------------------------------------------------------------------
     7. Filtre tarife — pastilă care alunecă, cardurile ies și intră animat
     ------------------------------------------------------------------------ */
  (function priceFilter() {
    var bar = $('.filters');
    if (!bar) return;
    var cards = $$('[data-cat]');
    var pill = null, timer = null;

    if (!reduced) {
      pill = document.createElement('span');
      pill.className = 'filters__pill';
      pill.setAttribute('aria-hidden', 'true');
      bar.appendChild(pill);
      bar.classList.add('has-pill');
    }
    function movePill(btn) {
      if (!pill || !btn) return;
      bar.style.setProperty('--fx', btn.offsetLeft + 'px');
      bar.style.setProperty('--fy', btn.offsetTop + 'px');
      bar.style.setProperty('--fw', btn.offsetWidth + 'px');
      bar.style.setProperty('--fh', btn.offsetHeight + 'px');
    }
    function pressed() { return $('.filter[aria-pressed="true"]', bar); }
    movePill(pressed());
    window.addEventListener('resize', function () { movePill(pressed()); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { movePill(pressed()); });

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      var val = btn.getAttribute('data-filter');

      $$('.filter', bar).forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      movePill(btn);

      function shows(c) { return val === 'all' || c.getAttribute('data-cat').split(' ').indexOf(val) > -1; }

      if (reduced) {
        cards.forEach(function (c) { c.hidden = !shows(c); });
        return;
      }

      window.clearTimeout(timer);
      cards.forEach(function (c) {
        c.classList.remove('is-back');
        if (!c.hidden) c.classList.add('is-out');
      });
      timer = window.setTimeout(function () {
        var n = 0;
        cards.forEach(function (c) {
          var vis = shows(c);
          c.classList.remove('is-out');
          c.hidden = !vis;
          if (vis) {
            c.style.animationDelay = (n++ * 60) + 'ms';
            void c.offsetWidth;
            c.classList.add('is-back');
          }
        });
      }, 260);
    });
  })();

  /* ------------------------------------------------------------------------
     8. Recenzii — „citește tot"
     ------------------------------------------------------------------------ */
  (function reviews() {
    $$('.review').forEach(function (card) {
      var body = $('.review__body', card);
      var btn = $('.review__more', card);
      if (!body || !btn) return;

      // Ascunde butonul dacă textul încape oricum
      if (body.scrollHeight <= body.clientHeight + 4) { btn.hidden = true; return; }

      btn.addEventListener('click', function () {
        var open = card.classList.toggle('is-open');
        btn.textContent = open ? 'Arată mai puțin' : 'Citește tot';
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  })();

  /* ------------------------------------------------------------------------
     9. Formular de contact
     ------------------------------------------------------------------------ */
  (function contactForm() {
    var form = $('#contact-form');
    if (!form) return;

    var btn = $('button[type="submit"]', form);
    var ok = $('.form__msg--ok', form);
    var err = $('.form__msg--err', form);

    function setError(field, message) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      wrap.classList.toggle('has-error', !!message);
      var slot = $('.field__err', wrap);
      if (slot) slot.textContent = message || '';
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validate(field) {
      var v = (field.value || '').trim();
      var name = field.name;

      if (field.required && !v) { setError(field, 'Acest câmp este obligatoriu.'); return false; }
      if (name === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        setError(field, 'Introdu o adresă de email validă.'); return false;
      }
      if (name === 'telefon' && v && !/^[0-9+\s().-]{9,20}$/.test(v)) {
        setError(field, 'Introdu un număr de telefon valid.'); return false;
      }
      setError(field, '');
      return true;
    }

    // O mașinuță traversează butonul după trimiterea reușită
    function driveAcross() {
      if (reduced) return;
      var ns = 'http://www.w3.org/2000/svg';
      var car = document.createElementNS(ns, 'svg');
      car.setAttribute('class', 'ico btn__car');
      car.setAttribute('aria-hidden', 'true');
      var use = document.createElementNS(ns, 'use');
      use.setAttribute('href', '#i-car');
      car.appendChild(use);
      btn.style.setProperty('--bw', btn.offsetWidth + 'px');
      btn.appendChild(car);
      window.setTimeout(function () { if (car.parentNode) car.parentNode.removeChild(car); }, 1600);
    }

    $$('input, select, textarea', form).forEach(function (f) {
      if (f.type === 'hidden' || f.closest('.hp')) return;
      f.addEventListener('blur', function () { validate(f); });
      f.addEventListener('input', function () {
        if (f.closest('.field') && f.closest('.field').classList.contains('has-error')) validate(f);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ok.classList.remove('is-visible');
      err.classList.remove('is-visible');

      var fields = $$('input, select, textarea', form).filter(function (f) {
        return f.type !== 'hidden' && !f.closest('.hp');
      });
      var valid = true, firstBad = null;
      fields.forEach(function (f) {
        if (!validate(f)) { valid = false; if (!firstBad) firstBad = f; }
      });
      if (!valid) { if (firstBad) firstBad.focus(); return; }

      // Capcană pentru boți
      var hp = $('input[name="botcheck"]', form);
      if (hp && hp.value) return;

      if (!CONFIG.WEB3FORMS_KEY) {
        err.querySelector('span').textContent =
          'Formularul nu este încă activat. Sună-ne la 0232 234 000 sau scrie la contact@viovas.ro.';
        err.classList.add('is-visible');
        return;
      }

      var data = new FormData(form);
      data.append('access_key', CONFIG.WEB3FORMS_KEY);
      data.append('subject', 'Mesaj nou de pe viovas.ro — ' + (data.get('subiect') || 'Contact'));
      data.append('from_name', 'Website Viovas');

      btn.classList.add('is-loading');
      btn.disabled = true;

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.success) {
            form.reset();
            ok.classList.add('is-visible');
            driveAcross();
            ok.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
          } else {
            throw new Error(res.message || 'Eroare');
          }
        })
        .catch(function () {
          err.classList.add('is-visible');
        })
        .finally(function () {
          btn.classList.remove('is-loading');
          btn.disabled = false;
        });
    });
  })();

  /* ------------------------------------------------------------------------
     10. Bară de cookie
     ------------------------------------------------------------------------ */
  (function cookiebar() {
    var bar = $('.cookiebar');
    if (!bar) return;
    var KEY = 'viovas-cookies';

    var stored = null;
    try { stored = window.localStorage.getItem(KEY); } catch (e) { stored = 'skip'; }
    if (stored) return;

    // Pe prima pagină apare după intro, nu peste el
    var wait = root.classList.contains('intro-on') ? 5200 : 1200;
    window.setTimeout(function () { bar.classList.add('is-visible'); }, wait);

    bar.addEventListener('click', function (e) {
      if (!e.target.closest('[data-cookie]')) return;
      try { window.localStorage.setItem(KEY, e.target.getAttribute('data-cookie')); } catch (err) {}
      bar.classList.remove('is-visible');
    });
  })();

  /* ------------------------------------------------------------------------
     11. Anul curent în subsol
     ------------------------------------------------------------------------ */
  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ------------------------------------------------------------------------
     12. Bandă derulantă — se dublează conținutul pentru buclă continuă
     ------------------------------------------------------------------------ */
  (function marqueeDouble() {
    $$('.marquee__track').forEach(function (track) {
      if (track.getAttribute('data-doubled') === 'true') return;
      // Copia e pur decorativă: se ascunde de la cititoarele de ecran.
      // Lista se fotografiază întâi: `children` e vie și ar crește la infinit.
      Array.prototype.slice.call(track.children).forEach(function (child) {
        var copy = child.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        track.appendChild(copy);
      });
      track.setAttribute('data-doubled', 'true');
    });
  })();

  /* ------------------------------------------------------------------------
     13. Întrebări frecvente — se închid celelalte la deschidere
     ------------------------------------------------------------------------ */
  (function faq() {
    var groups = $$('[data-faq]');
    if (!groups.length) return;

    groups.forEach(function (group) {
      var items = $$('details.faq__item', group);
      if (items.length < 2) return;

      items.forEach(function (item) {
        item.addEventListener('toggle', function () {
          if (!item.open) return;
          items.forEach(function (other) {
            if (other !== item) other.open = false;
          });
        });
      });
    });
  })();

  /* ------------------------------------------------------------------------
     14. Video — pornire fără sunet, control de sunet și de redare
     Toate filmările pornesc pe mut (cerință de autoplay în browsere). Butonul
     cu difuzor pornește sunetul doar când vizitatorul îl cere.
     ------------------------------------------------------------------------ */
  (function videos() {
    var vids = $$('video[data-autoplay]');
    var btns = $$('[data-sound], [data-play]');
    if (!vids.length && !btns.length) return;

    function target(btn) {
      return document.getElementById(btn.getAttribute('aria-controls'));
    }
    function play(v) {
      var p = v.play();
      if (p && typeof p.catch === 'function') { p.catch(function () {}); }
    }
    function syncPlayBtn(v) {
      $$('[data-play]').forEach(function (b) {
        if (target(b) === v) { b.setAttribute('aria-pressed', String(!v.paused)); }
      });
    }

    /* Sub „reduced motion" nimic nu pornește singur: rămâne posterul.
       Butonul hero dispare (nu are ce controla), iar cadrele .vid pot fi pornite manual. */
    if (reduced) {
      vids.forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
    }

    /* Butoanele apar doar când există JS care să le pună în funcțiune. */
    btns.forEach(function (btn) {
      var v = target(btn);
      if (!v) return;
      if (reduced && btn.classList.contains('sound-btn--hero')) return;
      btn.hidden = false;
    });
    $$('.vid__ctrls').forEach(function (box) { box.hidden = false; });

    btns.forEach(function (btn) {
      var v = target(btn);
      if (!v) return;

      if (btn.hasAttribute('data-sound')) {
        v.muted = true;
        btn.addEventListener('click', function () {
          v.muted = !v.muted;
          if (!v.muted) {
            v.volume = 1;
            // Dacă sunetul e cerut, filmarea trebuie și să ruleze.
            play(v);
            // Un singur film cu sunet la un moment dat.
            $$('video').forEach(function (other) { if (other !== v) { other.muted = true; } });
            $$('[data-sound]').forEach(function (b) {
              if (b !== btn) { b.setAttribute('aria-pressed', 'false'); setSoundLabel(b, false); }
            });
          }
          btn.setAttribute('aria-pressed', String(!v.muted));
          setSoundLabel(btn, !v.muted);
          syncPlayBtn(v);
        });
      }

      if (btn.hasAttribute('data-play')) {
        btn.addEventListener('click', function () {
          if (v.paused) { v._userPaused = false; play(v); } else { v._userPaused = true; v.pause(); }
          syncPlayBtn(v);
        });
        v.addEventListener('play', function () { syncPlayBtn(v); });
        v.addEventListener('pause', function () { syncPlayBtn(v); });
        btn.setAttribute('aria-pressed', String(!v.paused));
      }
    });

    function setSoundLabel(btn, on) {
      var lbl = $('.sound-btn__lbl', btn);
      if (lbl) { lbl.textContent = on ? 'Oprește sunetul' : 'Pornește sunetul'; }
    }

    if (reduced) return;

    /* Pornire la intrarea în ecran, pauză când ies din el — economisește baterie
       și lățime de bandă. Filmarea cu sunet pornit nu se oprește singură. */
    vids.forEach(function (v) {
      v.muted = true;
      if (!hasIO) { play(v); return; }

      var inView = false;
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          inView = entry.isIntersecting;
          if (inView && !v._userPaused) { play(v); }
          else if (!inView && v.muted) { v.pause(); }
        });
      }, { threshold: 0.25 }).observe(v);

      // Unele browsere opresc singure filmarea cât timp e acoperită (de exemplu
      // de intro). Dacă nu vizitatorul a oprit-o și e în ecran, o repornim.
      v.addEventListener('pause', function () {
        window.setTimeout(function () {
          if (v.paused && inView && v.muted && !v._userPaused && !document.hidden) play(v);
        }, 400);
      });
    });
  })();

  /* ------------------------------------------------------------------------
     15. Categorii — panouri cinematice
     Desktop: panoul peste care treci se lărgește și își pornește filmarea.
     Telefon: e activ panoul din mijlocul ecranului. Filmările se descarcă
     doar la prima activare, și deloc dacă vizitatorul are „economisire date".
     ------------------------------------------------------------------------ */
  (function panels() {
    var wrap = $('[data-panels]');
    if (!wrap) return;
    var list = $$('.cat-panel', wrap);
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    var mobile = window.matchMedia('(max-width: 860px)');
    var inView = false;
    var current = $('.cat-panel.is-active', wrap) || list[0];

    function sync() {
      list.forEach(function (p) {
        var on = p === current;
        p.classList.toggle('is-active', on);
        var v = $('video', p);
        if (!v) return;
        if (on && inView && !reduced && !saveData) {
          if (!v.getAttribute('src') && v.getAttribute('data-src')) v.setAttribute('src', v.getAttribute('data-src'));
          if (!v._viovas) {
            v._viovas = true;
            v.addEventListener('playing', function () {
              if (p === current) p.classList.add('is-playing');
            });
          }
          var pr = v.play();
          if (pr && pr.catch) pr.catch(function () {});
        } else {
          if (!v.paused) v.pause();
          p.classList.remove('is-playing');
        }
      });
    }
    function activate(p) {
      if (p === current) return;
      current = p;
      sync();
    }

    list.forEach(function (p) {
      p.addEventListener('mouseenter', function () { if (!mobile.matches) activate(p); });
      p.addEventListener('focusin', function () { activate(p); });
    });

    if (!hasIO) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { inView = e.isIntersecting; });
      sync();
    }, { threshold: 0.2 }).observe(wrap);

    // Pe telefon: panoul care trece prin banda din mijlocul ecranului
    var center = new IntersectionObserver(function (entries) {
      if (!mobile.matches) return;
      entries.forEach(function (e) { if (e.isIntersecting) activate(e.target); });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    list.forEach(function (p) { center.observe(p); });
  })();

  /* ------------------------------------------------------------------------
     16. Semafor pe benzile CTA — roșu, apoi verde, iar butonul „pornește"
     ------------------------------------------------------------------------ */
  (function semafor() {
    var bands = $$('.cta-band');
    if (!bands.length) return;
    bands.forEach(function (b) {
      var s = document.createElement('div');
      s.className = 'semafor';
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = '<i></i><i></i><i></i>';
      b.appendChild(s);
    });
    if (reduced || !hasIO) { bands.forEach(function (b) { b.classList.add('is-go'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var b = entry.target;
        io.unobserve(b);
        b.classList.add('is-red');
        window.setTimeout(function () { b.classList.remove('is-red'); b.classList.add('is-go'); }, 1100);
      });
    }, { threshold: 0.55 });
    bands.forEach(function (b) { io.observe(b); });
  })();

  /* ------------------------------------------------------------------------
     16b. Drumul din antetul paginilor interioare — marcajul din mijloc devine
     un element propriu, ca să alunece doar din transform (fără redesenare)
     ------------------------------------------------------------------------ */
  $$('.pagehead').forEach(function (h) {
    var road = document.createElement('div');
    road.className = 'pagehead__road';
    road.setAttribute('aria-hidden', 'true');
    road.appendChild(document.createElement('i'));
    h.insertBefore(road, h.firstChild);
    h.classList.add('has-road');
  });

  /* ------------------------------------------------------------------------
     17. Wordmark uriaș în subsol (decorativ)
     ------------------------------------------------------------------------ */
  (function footerMark() {
    var bar = $('.footer__bar');
    if (!bar) return;
    var m = document.createElement('p');
    m.className = 'footer__mark';
    m.setAttribute('aria-hidden', 'true');
    m.textContent = 'VIOVAS';
    // Umplerea roșie: o fereastră care urcă și textul care coboară la fel de mult
    var fill = document.createElement('span');
    fill.className = 'footer__fill';
    var inner = document.createElement('span');
    inner.textContent = 'VIOVAS';
    fill.appendChild(inner);
    m.appendChild(fill);
    bar.parentNode.insertBefore(m, bar);
    if (reduced) { fill.style.transform = 'none'; inner.style.transform = 'none'; }
  })();

  /* ------------------------------------------------------------------------
     18. Motorul de derulare — un singur requestAnimationFrame pentru tot ce
     urmează derularea: progres, vitezometru, hero, parallax, traseu, video,
     bandă, subsol. Pozițiile se măsoară o dată (și la redimensionare), iar
     în fiecare cadru se face doar matematică — fără citiri de layout.
     Bucla se oprește când nimic nu se mișcă și pornește la derulare; scrie
     doar transform/opacity direct pe elemente, fără variabile CSS moștenite.
     ------------------------------------------------------------------------ */
  var Engine = (function () {
    var tasks = [];
    var S = { y: Math.max(0, window.scrollY), vy: 0, vh: window.innerHeight, vw: window.innerWidth, docH: 1 };
    var started = false, raf = null, mt = null;

    function measure() {
      S.vh = window.innerHeight;
      S.vw = window.innerWidth;
      S.docH = document.documentElement.scrollHeight;
      tasks.forEach(function (t) { if (t.measure) t.measure(S); });
      wake();
    }
    function measureSoon() { window.clearTimeout(mt); mt = window.setTimeout(measure, 120); }
    function frame() {
      raf = null;
      var y = Math.max(0, window.scrollY);
      var dy = y - S.y;
      S.y = y;
      S.vy += (dy - S.vy) * 0.2;
      if (Math.abs(S.vy) < 0.02) S.vy = 0;
      // Un task întoarce true cât timp mai are nevoie de cadre (bandă, ac)
      var more = dy !== 0 || S.vy !== 0;
      for (var i = 0; i < tasks.length; i++) if (tasks[i].update(S)) more = true;
      if (more) raf = window.requestAnimationFrame(frame);
    }
    function wake() { if (!raf) raf = window.requestAnimationFrame(frame); }
    function add(task) {
      tasks.push(task);
      if (task.measure) task.measure(S);
      if (started) { wake(); return; }
      started = true;
      window.addEventListener('scroll', wake, { passive: true });
      window.addEventListener('resize', measureSoon);
      window.addEventListener('load', measure);
      if ('ResizeObserver' in window) new ResizeObserver(measureSoon).observe(document.body);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
      measure();
    }
    return { add: add, wake: wake };
  })();

  if (!reduced) {

    /* 18a. Bara de progres de sus + vitezometrul (click = înapoi sus) */
    (function progress() {
      var wrap = document.createElement('div');
      wrap.className = 'progress';
      wrap.setAttribute('aria-hidden', 'true');
      wrap.innerHTML = '<div class="progress__bar"></div>';
      document.body.appendChild(wrap);
      var bar = wrap.firstChild;

      var gauge = document.createElement('button');
      gauge.type = 'button';
      gauge.className = 'gauge';
      gauge.setAttribute('aria-label', 'Înapoi la începutul paginii');
      var ticks = '';
      for (var i = 0; i <= 9; i++) {
        var a = (-135 + i * 30) * Math.PI / 180;
        var sin = Math.sin(a), cos = Math.cos(a);
        ticks += '<line class="gauge__tick" x1="' + (50 + sin * 33).toFixed(1) + '" y1="' + (50 - cos * 33).toFixed(1) +
                 '" x2="' + (50 + sin * 38).toFixed(1) + '" y2="' + (50 - cos * 38).toFixed(1) + '"/>';
      }
      gauge.innerHTML =
        '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
          '<defs><linearGradient id="g-grad" x1="0" x2="1"><stop offset="0" stop-color="#F23535"/>' +
          '<stop offset=".7" stop-color="#FF5A3D"/><stop offset="1" stop-color="#FFC21A"/></linearGradient></defs>' +
          '<circle class="gauge__track" cx="50" cy="50" r="44" stroke-dasharray="207.3 276.5"/>' +
          '<circle class="gauge__fill" cx="50" cy="50" r="44" stroke-dasharray="0 276.5"/>' +
          ticks +
          '<line class="gauge__needle" x1="50" y1="50" x2="50" y2="20"/>' +
          '<circle class="gauge__hub" cx="50" cy="50" r="3.5"/>' +
        '</svg>' +
        '<span class="gauge__num" aria-hidden="true">0</span><span class="gauge__unit" aria-hidden="true">km/h</span>';
      document.body.appendChild(gauge);
      gauge.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

      var fill = $('.gauge__fill', gauge), needle = $('.gauge__needle', gauge), num = $('.gauge__num', gauge);
      var lastP = -1, kmh = 0, lastK = -1, shown = false;

      Engine.add({
        update: function (S) {
          var p = clamp(S.y / Math.max(1, S.docH - S.vh), 0, 1);
          if (Math.abs(p - lastP) > 0.0005) {
            bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
            fill.setAttribute('stroke-dasharray', (207.3 * p).toFixed(1) + ' 276.5');
            lastP = p;
          }
          var vis = S.y > S.vh * 0.6;
          if (vis !== shown) { gauge.classList.toggle('is-on', vis); shown = vis; }
          // Viteza de derulare, afișată în „km/h" (maxim 180)
          kmh += (Math.min(180, Math.abs(S.vy) * 4.5) - kmh) * 0.12;
          var k = Math.round(kmh);
          if (k !== lastK) {
            needle.style.transform = 'rotate(' + (-135 + 270 * kmh / 180).toFixed(1) + 'deg)';
            num.textContent = k;
            lastK = k;
          }
          return k !== 0;
        }
      });
    })();

    /* 18b. Hero — filmarea se strânge într-un cadru, textul urcă și se stinge */
    (function heroScrub() {
      var hero = $('.hero');
      if (!hero) return;
      var media = $('.hero__media', hero), content = $('.hero__content', hero), corners = $('.hero__frame', hero);
      var h = 1, last = -1, framed = false;
      Engine.add({
        measure: function () { h = hero.offsetHeight || 1; },
        update: function (S) {
          var hp = clamp(S.y / h, 0, 1);
          if (Math.abs(hp - last) < 0.001) return;
          last = hp;
          if (media) media.style.transform = 'scale(' + (1 - hp * 0.1).toFixed(4) + ')';
          if (content) {
            content.style.transform = 'translate3d(0,' + (hp * -90).toFixed(1) + 'px,0)';
            content.style.opacity = clamp(1 - hp * 1.35, 0, 1).toFixed(3);
          }
          if (corners) corners.style.opacity = clamp(0.9 - hp * 2, 0, 1).toFixed(3);
          var f = hp > 0.01;
          if (f !== framed) { hero.classList.toggle('is-framed', f); framed = f; }
        }
      });

      // Lumina de far urmărește cursorul (o pată care se mută, nu un gradient redesenat)
      var light = $('.hero__light', hero);
      if (!light || !finePointer) return;
      var lx = 0, ly = 0, lraf = null;
      hero.addEventListener('mousemove', function (e) {
        lx = e.clientX; ly = e.clientY;
        if (lraf) return;
        lraf = window.requestAnimationFrame(function () {
          lraf = null;
          var r = hero.getBoundingClientRect();
          light.style.transform = 'translate3d(' + (lx - r.left).toFixed(0) + 'px,' + (ly - r.top).toFixed(0) + 'px,0)';
        });
      }, { passive: true });
    })();

    /* 18c. Parallax — [data-parallax="0.12"]: pozitiv = mai lent (fundal), negativ = mai rapid */
    (function parallax() {
      var items = $$('[data-parallax]').map(function (el) {
        var box = (el.parentElement && el.parentElement.closest('section, div, figure')) || el.parentElement;
        return { el: el, box: box, speed: parseFloat(el.getAttribute('data-parallax')) || 0, c: 0, h: 0, last: null };
      });
      if (!items.length) return;
      Engine.add({
        measure: function () {
          items.forEach(function (it) { it.h = it.box.offsetHeight; it.c = pageTop(it.box) + it.h / 2; });
        },
        update: function (S) {
          items.forEach(function (it) {
            var dist = it.c - (S.y + S.vh / 2);
            if (Math.abs(dist) > S.vh + it.h) return;
            var py = Math.round(-dist * it.speed * 10) / 10;
            if (py === it.last) return;
            it.el.style.translate = '0 ' + py + 'px';
            it.last = py;
          });
        }
      });
    })();

    /* 18d. Traseul spre permis — mașinuța coboară, marcajul se desenează în urma ei */
    (function roadway() {
      var road = $('[data-roadway]');
      if (!road) return;
      var car = $('.roadway__car', road);
      var rail = $('.roadway__rail', road) || road;
      var steps = $$('.step', road);
      var top = 0, h = 1, carH = 0, marks = [], lastP = -1;
      road.classList.add('is-live');

      Engine.add({
        measure: function () {
          var r = road.getBoundingClientRect();
          top = r.top + window.scrollY;
          h = road.offsetHeight || 1;
          carH = car ? car.offsetHeight : 0;
          marks = steps.map(function (s) {
            var n = $('.step__num', s) || s;
            var nr = n.getBoundingClientRect();
            return nr.top - r.top + nr.height / 2;
          });
        },
        update: function (S) {
          var p = clamp((S.y + S.vh * 0.55 - top) / h, 0, 1);
          var tilt = clamp(S.vy * 0.35, -7, 7);
          if (Math.abs(p - lastP) < 0.0005 && Math.abs(tilt) < 0.05) return;
          lastP = p;
          var carY = p * (h - carH);
          rail.style.setProperty('--progress', p.toFixed(4));
          if (car) {
            car.style.translate = '0 ' + carY.toFixed(1) + 'px';
            car.style.rotate = tilt.toFixed(2) + 'deg';
          }
          var nose = carY + carH * 0.8;
          steps.forEach(function (s, i) { s.classList.toggle('is-passed', nose >= marks[i]); });
        }
      });
    })();

    /* 18e. Filmarea care se extinde până la marginile ecranului */
    (function expand() {
      var items = $$('[data-expand]').map(function (el) { return { el: el, c: 0, last: -1, framed: false }; });
      if (!items.length) return;
      Engine.add({
        measure: function () {
          // Centrul nu se schimbă la scale din centru, deci măsurătoarea e stabilă
          items.forEach(function (it) {
            var r = it.el.getBoundingClientRect();
            it.c = r.top + window.scrollY + r.height / 2;
          });
        },
        update: function (S) {
          items.forEach(function (it) {
            var dist = it.c - (S.y + S.vh / 2);
            var e = clamp(1 - Math.max(dist, 0) / (S.vh * 0.6), 0, 1);
            e = Math.round(e * 1000) / 1000;
            if (e === it.last) return;
            it.el.style.transform = e >= 1 ? 'none' : 'scale(' + (0.72 + 0.28 * e).toFixed(4) + ')';
            var fr = e < 0.995;
            if (fr !== it.framed) { it.el.classList.toggle('is-framed', fr); it.framed = fr; }
            it.last = e;
          });
        }
      });
    })();

    /* 18f. Banda cu parcul auto — viteza și înclinarea urmează derularea */
    (function marqueeLive() {
      var box = $('.marquee');
      if (!box || !hasIO) return;
      var rows = $$('.marquee__row', box).map(function (row, i) {
        return { track: $('.marquee__track', row), dir: i % 2 ? 1 : -1, x: 0, half: 1 };
      }).filter(function (r) { return r.track; });
      if (!rows.length) return;
      var visible = false, sign = 1, hover = false;
      box.classList.add('is-live');
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible = e.isIntersecting; });
        if (visible) Engine.wake();
      }).observe(box);
      box.addEventListener('mouseenter', function () { hover = true; });
      box.addEventListener('mouseleave', function () { hover = false; });

      Engine.add({
        measure: function () {
          rows.forEach(function (r) { r.half = r.track.scrollWidth / 2 || 1; });
        },
        update: function (S) {
          if (!visible) return;
          if (Math.abs(S.vy) > 0.5) sign = S.vy > 0 ? 1 : -1;
          var speed = (hover ? 0.25 : 0.9) + Math.abs(S.vy) * 0.55;
          var skew = clamp(-S.vy * 0.25, -12, 12);
          rows.forEach(function (r, i) {
            r.x += speed * sign * r.dir;
            if (r.x <= -r.half) r.x += r.half;
            if (r.x > 0) r.x -= r.half;
            r.track.style.transform = 'translate3d(' + r.x.toFixed(2) + 'px,0,0) skewX(' + (i ? -skew : skew).toFixed(2) + 'deg)';
          });
          return true;
        }
      });
    })();

    /* 18g. Wordmark-ul din subsol se umple pe măsură ce ajungi la final */
    (function footerFill() {
      var m = $('.footer__mark');
      var fill = m && $('.footer__fill', m);
      if (!fill) return;
      var inner = fill.firstChild;
      var top = 0, last = -1;
      Engine.add({
        measure: function () { top = pageTop(m); },
        update: function (S) {
          var f = clamp((S.y + S.vh - top) / Math.max(1, S.docH - top), 0, 1);
          f = Math.round(f * 1000) / 1000;
          if (f === last) return;
          var q = ((1 - f) * 100).toFixed(1);
          fill.style.transform = 'translate3d(0,' + q + '%,0)';
          inner.style.transform = 'translate3d(0,-' + q + '%,0)';
          last = f;
        }
      });
    })();

  } else {
    /* Fără animații: traseul apare desenat complet */
    $$('[data-roadway]').forEach(function (road) {
      road.style.setProperty('--progress', '1');
      $$('.step', road).forEach(function (s) { s.classList.add('is-passed'); });
    });
  }

  /* ------------------------------------------------------------------------
     20. Butoane magnetice — se trag ușor spre cursor
     ------------------------------------------------------------------------ */
  (function magnetic() {
    if (reduced || !finePointer) return;
    $$('.btn, .phone-xl, .wa-float, .socials a, .intro__skip').forEach(function (el) {
      el.classList.add('is-magnetic');
      var cx = 0, cy = 0, ex = 0, ey = 0, raf = null;
      el.addEventListener('mousemove', function (e) {
        ex = e.clientX; ey = e.clientY;
        if (!raf) raf = window.requestAnimationFrame(pull);
      }, { passive: true });
      function pull() {
        raf = null;
        var r = el.getBoundingClientRect();
        var k = r.width > 300 ? 0.08 : (el.classList.contains('phone-xl') ? 0.14 : 0.3);
        // Centrul real, fără deplasarea deja aplicată
        var x = ex - (r.left - cx + r.width / 2);
        var y = ey - (r.top - cy + r.height / 2);
        cx = x * k;
        cy = y * k * 1.2;
        el.classList.add('is-pulling');
        el.style.setProperty('--mgx', cx.toFixed(1) + 'px');
        el.style.setProperty('--mgy', cy.toFixed(1) + 'px');
      }
      el.addEventListener('mouseleave', function () {
        if (raf) { window.cancelAnimationFrame(raf); raf = null; }
        cx = cy = 0;
        el.classList.remove('is-pulling');
        el.style.setProperty('--mgx', '0px');
        el.style.setProperty('--mgy', '0px');
      });
    });
  })();

  /* ------------------------------------------------------------------------
     21. Carduri „spotlight" — o lumină moale urmărește cursorul
     ------------------------------------------------------------------------ */
  (function spotlight() {
    if (reduced || !finePointer) return;
    $$('.feat, .price-card, .review, .fleet, .doc, .step__body, .info-card, .age, .faq__item, .trust__item')
      .forEach(function (el) {
        el.classList.add('spot');
        var ex = 0, ey = 0, raf = null;
        el.addEventListener('mousemove', function (e) {
          ex = e.clientX; ey = e.clientY;
          if (raf) return;
          raf = window.requestAnimationFrame(function () {
            raf = null;
            var r = el.getBoundingClientRect();
            el.style.setProperty('--sx', (ex - r.left).toFixed(0) + 'px');
            el.style.setProperty('--sy', (ey - r.top).toFixed(0) + 'px');
          });
        }, { passive: true });
      });
  })();
})();
