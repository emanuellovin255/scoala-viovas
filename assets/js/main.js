/* ==========================================================================
   VIOVAS — interacțiuni
   Vanilla JS, fără dependențe. Fiecare modul iese elegant dacă lipsește DOM-ul.
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
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. Antet lipit
     ------------------------------------------------------------------------ */
  (function header() {
    var el = $('.header');
    if (!el) return;
    var ticking = false;
    function update() {
      el.classList.toggle('is-stuck', window.scrollY > 40);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
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
     3. Reveal la scroll
     ------------------------------------------------------------------------ */
  (function reveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
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
     4. Contoare
     ------------------------------------------------------------------------ */
  (function counters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = (el.getAttribute('data-decimals') | 0);
      if (isNaN(target)) return;
      if (reduced) { el.textContent = target.toFixed(decimals).replace('.', ','); return; }

      var dur = 1500, t0 = null;
      function frame(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        el.textContent = (target * eased).toFixed(decimals).replace('.', ',');
        if (p < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    nodes.forEach(function (n) { io.observe(n); });
  })();

  /* ------------------------------------------------------------------------
     5. Titlul hero, animat pe cuvinte
     ------------------------------------------------------------------------ */
  (function splitTitle() {
    var h = $('[data-split]');
    if (!h || reduced) return;

    var out = [];
    Array.prototype.forEach.call(h.childNodes, function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part.trim()) { out.push(document.createTextNode(part)); return; }
          var span = document.createElement('span');
          span.className = 'word';
          span.textContent = part;
          out.push(span);
        });
      } else {
        node.classList.add('word');
        out.push(node);
      }
    });

    h.textContent = '';
    var i = 0;
    out.forEach(function (node) {
      if (node.nodeType === 1) { node.style.setProperty('--i', i); i++; }
      h.appendChild(node);
    });
  })();

  /* ------------------------------------------------------------------------
     6. Înclinare 3D pe carduri (doar pointer fin)
     ------------------------------------------------------------------------ */
  (function tilt() {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('[data-tilt]').forEach(function (card) {
      var raf = null;
      function move(e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' +
            (x * 5).toFixed(2) + 'deg) translateY(-6px)';
          raf = null;
        });
      }
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  })();

  /* ------------------------------------------------------------------------
     7. Filtre tarife
     ------------------------------------------------------------------------ */
  (function priceFilter() {
    var bar = $('.filters');
    if (!bar) return;
    var cards = $$('[data-cat]');

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      var val = btn.getAttribute('data-filter');

      $$('.filter', bar).forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      cards.forEach(function (c) {
        c.hidden = !(val === 'all' || c.getAttribute('data-cat').split(' ').indexOf(val) > -1);
      });
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

    window.setTimeout(function () { bar.classList.add('is-visible'); }, 1200);

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
     12. Video hero — pornire sigură, pauză când nu e vizibil
     ------------------------------------------------------------------------ */
  (function heroVideo() {
    var v = $('.hero__media video');
    if (!v) return;

    if (reduced) { v.remove(); return; }

    var p = v.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () { /* autoplay blocat: rămâne posterul */ });
    }

    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { var q = v.play(); if (q && q.catch) q.catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.05 }).observe(v);
  })();
})();
