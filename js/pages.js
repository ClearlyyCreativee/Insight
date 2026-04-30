/**
 * INSIGHT CARGO SOLUTIONS (ES6+ Refactored)
 * js/pages.js — shared across all inner pages
 *
 * Modules:
 *  1. ThemeToggle      — dark/light, persisted, no FOUC
 *  2. CustomCursor     — pointer devices only
 *  3. ClickRipple      — water-drop ripple on click
 *  4. MobileNav        — hamburger drawer, focus trap, ESC
 *  5. ScrollReveal     — IntersectionObserver for .reveal elements
 *  6. FaqAccordion     — contact.html
 *  7. ContactForm      — EmailJS integration
 */

'use strict';

const isPointerDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const EMAILJS_CONFIG = {
  publicKey: 'YOUR_PUBLIC_KEY',
  serviceId: 'YOUR_SERVICE_ID',
  templateId: 'YOUR_TEMPLATE_ID',
};

/* ═════════════════════════════════════════════════════════════════════════════
   1. THEME TOGGLE
   ═════════════════════════════════════════════════════════════════════════════ */
class ThemeToggle {
  constructor() {
    this.toggle = document.getElementById('themeToggle');
    this.root = document.documentElement;
    this.metaColor = document.getElementById('themeColorMeta');
    this.COLORS = { dark: '#162D33', light: '#F5F3EF' };
    this.KEY = 'insight-theme';

    if (this.toggle) this.init();
  }

  init() {
    this.toggle.addEventListener('click', () => this.toggleTheme());
  }

  applyTheme(theme) {
    this.root.setAttribute('data-theme', theme);
    if (this.metaColor) this.metaColor.content = this.COLORS[theme];

    try {
      localStorage.setItem(this.KEY, theme);
    } catch (e) {
      console.warn('localStorage not available:', e);
    }

    this.toggle.setAttribute('aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  toggleTheme() {
    const current = this.root.getAttribute('data-theme') ?? 'dark';
    this.applyTheme(current === 'dark' ? 'light' : 'dark');
  }
}

new ThemeToggle();

/* ═════════════════════════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
   ═════════════════════════════════════════════════════════════════════════════ */
class CustomCursor {
  constructor() {
    if (!isPointerDevice) return;

    this.el = document.getElementById('cursor');
    if (!this.el) return;

    this.dot = this.el.querySelector('.dot');
    this.ring = this.el.querySelector('.ring');
    this.mx = window.innerWidth / 2;
    this.my = window.innerHeight / 2;
    this.rx = this.mx;
    this.ry = this.my;
    this.SELECTOR = 'a,button,input,textarea,select,label,[data-cursor-hover]';

    this.init();
  }

  init() {
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mouseover', (e) => this.onMouseOver(e));
    document.addEventListener('mouseout', (e) => this.onMouseOut(e));
    this.animate();
  }

  onMouseMove({ clientX, clientY }) {
    this.mx = clientX;
    this.my = clientY;
  }

  onMouseOver(e) {
    if (e.target.closest(this.SELECTOR)) {
      this.el.classList.add('is-hovering');
    }
  }

  onMouseOut(e) {
    if (e.target.closest(this.SELECTOR)) {
      this.el.classList.remove('is-hovering');
    }
  }

  animate = () => {
    this.dot.style.transform = `translate(${this.mx}px, ${this.my}px) translate(-50%, -50%)`;
    this.rx += (this.mx - this.rx) * 0.11;
    this.ry += (this.my - this.ry) * 0.11;
    this.ring.style.transform = `translate(${this.rx}px, ${this.ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(this.animate);
  }
}

new CustomCursor();

/* ═════════════════════════════════════════════════════════════════════════════
   3. CLICK RIPPLE
   ═════════════════════════════════════════════════════════════════════════════ */
class ClickRipple {
  constructor() {
    document.addEventListener('click', (e) => this.createRipple(e));
  }

  createRipple({ clientX, clientY }) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${clientX}px`;
    ripple.style.top = `${clientY}px`;
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }
}

new ClickRipple();

/* ═════════════════════════════════════════════════════════════════════════════
   4. MOBILE NAV
   ═════════════════════════════════════════════════════════════════════════════ */
class MobileNav {
  constructor() {
    this.toggle = document.getElementById('navToggle');
    this.drawer = document.getElementById('navMobile');
    this.closeBtn = document.getElementById('navClose');

    if (!this.toggle || !this.drawer) return;
    this.init();
  }

  init() {
    this.toggle.addEventListener('click', () => this.openNav());
    this.closeBtn?.addEventListener('click', () => this.closeNav());

    this.drawer.querySelectorAll('[data-nav-link]').forEach((link) => {
      link.addEventListener('click', () => this.closeNav());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawer.classList.contains('is-open')) {
        this.closeNav();
      }
    });

    this.drawer.addEventListener('keydown', (e) => this.handleFocusTrap(e));
  }

  openNav() {
    this.toggle.classList.add('is-open');
    this.drawer.classList.add('is-open');
    this.toggle.setAttribute('aria-expanded', 'true');
    this.drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.closeBtn?.focus();
  }

  closeNav() {
    this.toggle.classList.remove('is-open');
    this.drawer.classList.remove('is-open');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.toggle.focus();
  }

  handleFocusTrap(e) {
    if (e.key !== 'Tab') return;

    const focusable = [...this.drawer.querySelectorAll('a,button')]
      .filter((el) => el.offsetParent !== null);

    if (focusable.length === 0) return;

    const [first, last] = [focusable[0], focusable[focusable.length - 1]];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

new MobileNav();

/* ═════════════════════════════════════════════════════════════════════════════
   5. SCROLL REVEAL (IntersectionObserver)
   Elements with class="reveal" animate in when entering viewport.
   ═════════════════════════════════════════════════════════════════════════════ */
class ScrollReveal {
  constructor() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      return;
    }
    this.init();
  }

  init() {
    const observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }
}

new ScrollReveal();

/* ═════════════════════════════════════════════════════════════════════════════
   6. FAQ ACCORDION
   ═════════════════════════════════════════════════════════════════════════════ */
class FaqAccordion {
  constructor() {
    this.items = document.querySelectorAll('.faq-item');
    if (this.items.length === 0) return;
    this.init();
  }

  init() {
    this.items.forEach((item) => new FaqItem(item, this.items));
  }
}

class FaqItem {
  constructor(item, allItems) {
    this.item = item;
    this.allItems = allItems;
    this.btn = item.querySelector('.faq-question');
    this.answer = item.querySelector('.faq-answer');

    if (!this.btn || !this.answer) return;

    this.btn.setAttribute('aria-expanded', 'false');
    this.answer.setAttribute('aria-hidden', 'true');

    this.btn.addEventListener('click', () => this.toggle());
  }

  toggle() {
    const isOpen = this.item.classList.contains('is-open');

    // Close all others
    this.allItems.forEach((other) => {
      if (other === this.item) return;
      other.classList.remove('is-open');

      const otherBtn = other.querySelector('.faq-question');
      const otherAnswer = other.querySelector('.faq-answer');

      otherBtn?.setAttribute('aria-expanded', 'false');
      otherAnswer?.setAttribute('aria-hidden', 'true');
    });

    this.item.classList.toggle('is-open', !isOpen);
    this.btn.setAttribute('aria-expanded', String(!isOpen));
    this.answer.setAttribute('aria-hidden', String(isOpen));
  }
}

new FaqAccordion();

/* ═════════════════════════════════════════════════════════════════════════════
   7. CONTACT FORM (EmailJS Integration)
   ═════════════════════════════════════════════════════════════════════════════ */
class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.submitBtn = document.getElementById('submitBtn');
    this.successEl = document.getElementById('formSuccess');

    if (!this.form || !this.submitBtn) return;

    this.ejsReady = typeof emailjs !== 'undefined' &&
                    EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY';

    if (this.ejsReady) {
      emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    }

    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    ['contactName', 'contactEmail', 'contactMessage'].forEach((id) => {
      const el = document.getElementById(id);
      el?.addEventListener('input', () => this.clearError(el));
    });
  }

  isValidEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(value.trim());
  }

  getField(id) {
    return document.getElementById(id);
  }

  setError(el, show) {
    if (!el) return;
    show
      ? el.setAttribute('aria-invalid', 'true')
      : el.removeAttribute('aria-invalid');
  }

  clearError(el) {
    this.setError(el, false);
  }

  validate() {
    const name = this.getField('contactName');
    const email = this.getField('contactEmail');
    const message = this.getField('contactMessage');

    let isValid = true;

    if (!name?.value.trim()) {
      this.setError(name, true);
      isValid = false;
    } else {
      this.setError(name, false);
    }

    if (!this.isValidEmail(email?.value ?? '')) {
      this.setError(email, true);
      isValid = false;
    } else {
      this.setError(email, false);
    }

    if (!message?.value.trim()) {
      this.setError(message, true);
      isValid = false;
    } else {
      this.setError(message, false);
    }

    return isValid;
  }

  setLoading(loading) {
    this.submitBtn.disabled = loading;
    this.submitBtn.textContent = loading ? 'Sending…' : 'Send Message →';
    this.submitBtn.style.opacity = loading ? '0.65' : '1';
  }

  async sendEmail(data) {
    if (!this.ejsReady) {
      console.warn(
        '[Insight Cargo] EmailJS not configured.\n' +
        'Fill in EMAILJS_CONFIG in js/pages.js.\n' +
        'https://www.emailjs.com'
      );
      return;
    }

    return emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, data);
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validate()) return;

    const data = {
      from_name: this.getField('contactName')?.value.trim() ?? '',
      to_email: this.getField('contactEmail')?.value.trim() ?? '',
      reply_to: this.getField('contactEmail')?.value.trim() ?? '',
      subject: this.getField('contactSubject')?.value.trim() ?? 'General Enquiry',
      enquiry_type: this.getField('contactType')?.value ?? '',
      message: this.getField('contactMessage')?.value.trim() ?? '',
    };

    this.setLoading(true);

    try {
      await this.sendEmail(data);
      this.form.style.opacity = '0.35';
      this.form.style.pointerEvents = 'none';
      this.successEl?.classList.add('is-visible');
    } catch (error) {
      console.error('[Insight Cargo] EmailJS error:', error);
      this.successEl?.classList.add('is-visible');
    } finally {
      this.setLoading(false);
    }
  }
}

new ContactForm();

/* ═════════════════════════════════════════════════════════════════════════════
   8. BACK TO TOP
   ═════════════════════════════════════════════════════════════════════════════ */
class BackToTop {
  constructor() {
    this.btn = document.createElement('button');
    this.btn.className = 'back-to-top';
    this.btn.setAttribute('aria-label', 'Back to top');
    this.btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>`;
    document.body.appendChild(this.btn);

    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  onScroll() {
    this.btn.classList.toggle('is-visible', window.scrollY > 100);
  }
}

new BackToTop();
