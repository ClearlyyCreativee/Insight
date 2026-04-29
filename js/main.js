/**
 * INSIGHT CARGO SOLUTIONS — index.html
 * js/main.js (ES6+ Refactored)
 *
 * Modules:
 *  1. ThemeToggle       — dark/light, localStorage, no FOUC
 *  2. CustomCursor      — pointer devices, lagging ring, hover state
 *  3. ClickRipple       — water-drop ripple on every click
 *  4. MobileNav         — hamburger drawer, focus trap, ESC key
 *  5. ScrollReveal      — IntersectionObserver for .reveal elements
 *  6. RoutePaths        — stroke-dasharray for CSS draw-on animation
 *  7. ShipTraveller     — glowing circle travelling all route paths
 *  8. ParallaxBackground — subtle mouse movement on bg-canvas
 */

'use strict';

const isPointerDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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
    this.SELECTOR = 'a,button,input,label,[data-cursor-hover]';

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
   4B. SERVICES DROPDOWN — click to open/close (not hover-only)
   Keeps dropdown open so user can click a sub-item.
   Still closes when clicking outside or pressing ESC.
   ═════════════════════════════════════════════════════════════════════════════ */
class ServicesDropdown {
  constructor() {
    this.wrappers = document.querySelectorAll('.nav-item--has-dropdown');
    if (this.wrappers.length === 0) return;
    this.wrappers.forEach((wrapper) => new DropdownItem(wrapper));
  }
}

class DropdownItem {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.trigger = wrapper.querySelector('a');
    this.dropdown = wrapper.querySelector('.nav-dropdown');
    this.isOpen = false;

    if (!this.trigger || !this.dropdown) return;
    this.init();
  }

  init() {
    this.trigger.addEventListener('click', (e) => this.handleTriggerClick(e));
    this.dropdown.querySelectorAll('a').forEach((item) => {
      item.addEventListener('click', () => this.close());
    });

    document.addEventListener('click', (e) => {
      if (!this.wrapper.contains(e.target)) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  handleTriggerClick(e) {
    e.preventDefault();
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.dropdown.classList.add('is-open');
    this.trigger.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.isOpen = false;
    this.dropdown.classList.remove('is-open');
    this.trigger.setAttribute('aria-expanded', 'false');
  }
}

new ServicesDropdown();




/* ═════════════════════════════════════════════════════════════════════════════
   SCROLL REVEAL — homepage sections animate in as they enter viewport
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
   6. ROUTE PATH SETUP
   Sets exact pixel length as stroke-dasharray so CSS draw-on animation is precise.
   ═════════════════════════════════════════════════════════════════════════════ */
class RoutePaths {
  constructor() {
    this.setup();
  }

  setup() {
    const paths = document.querySelectorAll('.bg-canvas .route-path');
    paths.forEach((path) => {
      try {
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
      } catch (e) {
        console.debug('CSS pathLength fallback applied');
      }
    });
  }
}

new RoutePaths();

/* ═════════════════════════════════════════════════════════════════════════════
   7. SHIP TRAVELLER
   Glowing orange circle traversing all route-paths in sequence, looping.
   Wake polyline trails behind.
   ═════════════════════════════════════════════════════════════════════════════ */
class ShipTraveller {
  constructor() {
    this.svg = null;
    this.routePaths = [];
    this.routeLengths = [];
    this.totalLen = 0;
    this.NS = 'http://www.w3.org/2000/svg';
    this.SPEED = 0.000008;
    this.WAKE_LEN = 60;
    this.wakeHistory = [];
    this.progress = 0.08;
    this.lastTime = null;
    this.prevRouteIdx = -1;

    setTimeout(() => this.setup(), 120);
  }

  setup() {
    this.svg = document.querySelector('.bg-canvas svg');
    if (!this.svg) return;

    this.routePaths = Array.from(this.svg.querySelectorAll('.route-path'));
    if (this.routePaths.length === 0) return;

    this.measurePaths();
    if (this.totalLen < 1) {
      requestAnimationFrame(() => this.setup());
      return;
    }

    this.createElements();
    this.animate();
  }

  measurePaths() {
    this.routeLengths = [];
    this.totalLen = 0;

    for (const path of this.routePaths) {
      let len = 0;
      try {
        len = path.getTotalLength();
      } catch (e) {
        len = 0;
      }
      if (len < 1) {
        requestAnimationFrame(() => this.setup());
        return;
      }
      this.routeLengths.push(len);
      this.totalLen += len;
    }
  }

  createElements() {
    const defs = document.createElementNS(this.NS, 'defs');
    defs.innerHTML = `
      <filter id="shipGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`;
    this.svg.insertBefore(defs, this.svg.firstChild);

    this.wake = document.createElementNS(this.NS, 'polyline');
    this.wake.setAttribute('id', 'ship-wake');
    this.wake.setAttribute('fill', 'none');
    this.wake.setAttribute('stroke', 'rgba(232,99,26,0.4)');
    this.wake.setAttribute('stroke-width', '2.2');
    this.wake.setAttribute('stroke-linecap', 'round');
    this.wake.setAttribute('stroke-linejoin', 'round');
    this.svg.appendChild(this.wake);

    this.ship = document.createElementNS(this.NS, 'circle');
    this.ship.setAttribute('id', 'ship-traveller');
    this.ship.setAttribute('r', '5');
    this.ship.setAttribute('fill', 'rgba(232,99,26,0.95)');
    this.ship.setAttribute('filter', 'url(#shipGlow)');
    this.svg.appendChild(this.ship);
  }

  animate = () => {
    if (this.lastTime === null) this.lastTime = performance.now();

    requestAnimationFrame((ts) => {
      const dt = ts - this.lastTime;
      this.lastTime = ts;

      this.progress = (this.progress + this.SPEED * dt) % 1;

      const { routeIdx, localProg } = this.getRoutePosition();

      if (routeIdx !== this.prevRouteIdx) {
        this.wakeHistory.length = 0;
        this.prevRouteIdx = routeIdx;
      }

      try {
        const point = this.routePaths[routeIdx].getPointAtLength(
          localProg * this.routeLengths[routeIdx]
        );

        this.ship.setAttribute('cx', point.x);
        this.ship.setAttribute('cy', point.y);

        this.wakeHistory.push({ x: point.x, y: point.y });
        if (this.wakeHistory.length > this.WAKE_LEN) this.wakeHistory.shift();

        const points = this.wakeHistory.map(({ x, y }) => `${x},${y}`).join(' ');
        this.wake.setAttribute('points', points);
      } catch (e) {
        console.debug('Ship animation error:', e);
      }

      this.animate();
    });
  }

  getRoutePosition() {
    let cumLen = 0;
    let routeIdx = 0;
    let localProg = 0;

    for (let i = 0; i < this.routeLengths.length; i++) {
      const start = cumLen / this.totalLen;
      const end = (cumLen + this.routeLengths[i]) / this.totalLen;

      if (this.progress >= start && this.progress < end) {
        routeIdx = i;
        localProg = (this.progress - start) / (end - start);
        break;
      }
      cumLen += this.routeLengths[i];
    }

    return { routeIdx, localProg };
  }
}

new ShipTraveller();

/* ═════════════════════════════════════════════════════════════════════════════
   8. PARALLAX BACKGROUND (pointer devices only)
   ═════════════════════════════════════════════════════════════════════════════ */
class ParallaxBackground {
  constructor() {
    if (!isPointerDevice) return;

    this.canvas = document.querySelector('.bg-canvas');
    if (!this.canvas) return;

    this.tx = 0;
    this.ty = 0;
    this.cx = 0;
    this.cy = 0;
    this.SPEED = 10;

    this.init();
  }

  init() {
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.animate();
  }

  onMouseMove({ clientX, clientY }) {
    this.tx = (clientX / window.innerWidth - 0.5) * 2;
    this.ty = (clientY / window.innerHeight - 0.5) * 2;
  }

  animate = () => {
    this.cx += (this.tx - this.cx) * 0.04;
    this.cy += (this.ty - this.cy) * 0.04;
    this.canvas.style.transform = `translate(${this.cx * this.SPEED}px, ${this.cy * this.SPEED}px) scale(1.04)`;
    requestAnimationFrame(this.animate);
  }
}

new ParallaxBackground();
