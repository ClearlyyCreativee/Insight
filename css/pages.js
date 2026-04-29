/**
 * INSIGHT CARGO SOLUTIONS
 * js/pages.js — shared across all inner pages
 *
 * Modules:
 *  1. Theme toggle   — dark/light, persisted, no FOUC
 *  2. Custom cursor  — pointer devices only
 *  3. Click ripple   — water-drop ripple on click
 *  4. Mobile nav     — hamburger drawer, focus trap, ESC
 *  5. Scroll reveal  — IntersectionObserver for .reveal elements
 *  6. FAQ accordion  — contact.html
 *  7. Contact form   — EmailJS (contact.html)
 */

'use strict';

/* ─── EMAILJS CONFIG (fill in your values) ───────────────────────────────────
   1. Sign up at https://www.emailjs.com
   2. Add a Service  → copy Service ID
   3. Add a Template → copy Template ID
      Template variables: {{from_name}}, {{to_email}}, {{reply_to}},
                          {{subject}}, {{enquiry_type}}, {{message}}
   4. Copy Public Key from Account → API Keys
   ─────────────────────────────────────────────────────────────────────────── */
const EMAILJS_CONFIG = {
  publicKey:  'YOUR_PUBLIC_KEY',
  serviceId:  'YOUR_SERVICE_ID',
  templateId: 'YOUR_TEMPLATE_ID',
};

const isPointerDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ═══════════════════════════════════════════════════════════════════════════════
   1. THEME TOGGLE
   ═══════════════════════════════════════════════════════════════════════════════ */
(function initThemeToggle() {
  const toggle    = document.getElementById('themeToggle');
  const root      = document.documentElement;
  const metaColor = document.getElementById('themeColorMeta');
  const COLORS    = { dark: '#162D33', light: '#F5F3EF' };
  const KEY       = 'insight-theme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (metaColor) metaColor.content = COLORS[theme];
    try { localStorage.setItem(KEY, theme); } catch (_) {}
    if (toggle) {
      toggle.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════════════════════════ */
(function initCursor() {
  if (!isPointerDevice) return;
  const el = document.getElementById('cursor');
  if (!el) return;

  const dot  = el.querySelector('.dot');
  const ring = el.querySelector('.ring');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  const sel = 'a,button,input,textarea,select,label,[data-cursor-hover]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(sel)) el.classList.add('is-hovering');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(sel)) el.classList.remove('is-hovering');
  });

  (function loop() {
    dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   3. CLICK RIPPLE
   ═══════════════════════════════════════════════════════════════════════════════ */
(function initClickRipple() {
  document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top  = e.clientY + 'px';
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   4. MOBILE NAV
   ═══════════════════════════════════════════════════════════════════════════════ */
(function initMobileNav() {
  const toggle   = document.getElementById('navToggle');
  const drawer   = document.getElementById('navMobile');
  const closeBtn = document.getElementById('navClose');
  if (!toggle || !drawer) return;

  function openNav() {
    toggle.classList.add('is-open');
    drawer.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeNav() {
    toggle.classList.remove('is-open');
    drawer.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    toggle.focus();
  }

  toggle.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);

  drawer.querySelectorAll('[data-nav-link]').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeNav();
  });

  // Focus trap inside drawer
  drawer.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [...drawer.querySelectorAll('a,button')].filter(
      (el) => el.offsetParent !== null
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
})();


/* ═══════════════════════════════════════════════════════════════════════════════
   4B. SERVICES DROPDOWN — click to open/close (not hover-only)
   ═══════════════════════════════════════════════════════════════════════════════ */
(function initServicesDropdown() {
  const dropdownWrappers = document.querySelectorAll('.nav-item--has-dropdown');
  if (!dropdownWrappers.length) return;

  dropdownWrappers.forEach((wrapper) => {
    const trigger  = wrapper.querySelector('a');
    const dropdown = wrapper.querySelector('.nav-dropdown');
    if (!trigger || !dropdown) return;

    let isOpen = false;

    function openDropdown()  { isOpen = true;  dropdown.classList.add('is-open');    trigger.setAttribute('aria-expanded','true');  }
    function closeDropdown() { isOpen = false; dropdown.classList.remove('is-open'); trigger.setAttribute('aria-expanded','false'); }

    trigger.addEventListener('click', (e) => { e.preventDefault(); isOpen ? closeDropdown() : openDropdown(); });
    dropdown.querySelectorAll('a').forEach((item) => item.addEventListener('click', () => closeDropdown()));
    document.addEventListener('click', (e) => { if (!wrapper.contains(e.target)) closeDropdown(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDropdown(); });
  });
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   5. SCROLL REVEAL  (IntersectionObserver)
   Elements with class="reveal" animate in when entering viewport.
   Add data-delay="1–6" for 0.1s stagger increments.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   6. FAQ ACCORDION
   ═══════════════════════════════════════════════════════════════════════════════ */
(function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.setAttribute('aria-expanded', 'false');
    answer.setAttribute('aria-hidden', 'true');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all others
      items.forEach((other) => {
        if (other === item) return;
        other.classList.remove('is-open');
        const ob = other.querySelector('.faq-question');
        const oa = other.querySelector('.faq-answer');
        if (ob) ob.setAttribute('aria-expanded', 'false');
        if (oa) oa.setAttribute('aria-hidden', 'true');
      });

      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.setAttribute('aria-hidden', String(isOpen));
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   7. CONTACT FORM  (EmailJS)
   ═══════════════════════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const successEl = document.getElementById('formSuccess');
  if (!form || !submitBtn) return;

  const ejsReady = (
    typeof emailjs !== 'undefined' &&
    EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY'
  );
  if (ejsReady) emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  function field(id) { return document.getElementById(id); }

  function setError(el, show) {
    if (!el) return;
    show ? el.setAttribute('aria-invalid', 'true') : el.removeAttribute('aria-invalid');
  }

  function validate() {
    let ok = true;
    const name    = field('contactName');
    const email   = field('contactEmail');
    const message = field('contactMessage');

    if (!name?.value.trim())          { setError(name, true);    ok = false; }
    else                               { setError(name, false);             }
    if (!isEmail(email?.value || '')) { setError(email, true);   ok = false; }
    else                               { setError(email, false);            }
    if (!message?.value.trim())       { setError(message, true); ok = false; }
    else                               { setError(message, false);           }
    return ok;
  }

  function setLoading(on) {
    submitBtn.disabled    = on;
    submitBtn.textContent = on ? 'Sending…' : 'Send Message →';
    submitBtn.style.opacity = on ? '0.65' : '1';
  }

  async function doSend(data) {
    if (!ejsReady) {
      console.warn(
        '[Insight Cargo] EmailJS not configured.\n' +
        'Fill in EMAILJS_CONFIG in js/pages.js.\n' +
        'https://www.emailjs.com'
      );
      return;
    }
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, data);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      from_name:    field('contactName')?.value.trim()    || '',
      to_email:     field('contactEmail')?.value.trim()   || '',
      reply_to:     field('contactEmail')?.value.trim()   || '',
      subject:      field('contactSubject')?.value.trim() || 'General Enquiry',
      enquiry_type: field('contactType')?.value           || '',
      message:      field('contactMessage')?.value.trim() || '',
    };

    setLoading(true);
    try {
      await doSend(data);
      form.style.opacity       = '0.35';
      form.style.pointerEvents = 'none';
      if (successEl) successEl.classList.add('is-visible');
    } catch (err) {
      console.error('[Insight Cargo] EmailJS error:', err);
      if (successEl) successEl.classList.add('is-visible');
    } finally {
      setLoading(false);
    }
  });

  ['contactName', 'contactEmail', 'contactMessage'].forEach((id) => {
    const el = field(id);
    if (el) el.addEventListener('input', () => setError(el, false));
  });
})();
