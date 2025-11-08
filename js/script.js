(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // THEME
  const html = document.documentElement;
  const THEME_KEY = 'theme'; // 'light' | 'dark' | 'auto'

  const applyTheme = (pref) => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const active = pref === 'auto' ? (mq.matches ? 'dark' : 'light') : pref;
    html.dataset.theme = pref;
    html.dataset.themeActive = active;
  };

  const initTheme = () => {
    let pref = localStorage.getItem(THEME_KEY) || 'auto';
    applyTheme(pref);
    // Sync with OS if in auto mode
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      if ((localStorage.getItem(THEME_KEY) || 'auto') === 'auto') applyTheme('auto');
    });
    const btn = $('#theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const current = localStorage.getItem(THEME_KEY) || 'auto';
        const next = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light';
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
        btn.title = `Theme: ${next}`;
        btn.setAttribute('aria-label', `Toggle theme (current: ${next})`);
      });
    }
  };

  // NAV TOGGLE (mobile)
  const initNav = () => {
    const toggle = $('.nav-toggle');
    const nav = $('#site-nav');
    if (!toggle || !nav) return;
    const open = (v) => {
      nav.classList.toggle('open', v);
      toggle.classList.toggle('open', v);
      toggle.setAttribute('aria-expanded', String(v));
    };
    toggle.addEventListener('click', () => open(!nav.classList.contains('open')));
    // Close on link click
    $$('a[href^="#"]', nav).forEach((a) => a.addEventListener('click', () => open(false)));
  };

  // SMOOTH SCROLL for in-page links
  const initSmoothScroll = () => {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#' || id.startsWith('#!')) return;
        const el = $(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', id);
          el.focus({ preventScroll: true });
        }
      });
    });
  };

  // REVEAL on scroll
  const initReveal = () => {
    const els = $$('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('inview');
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  };

  // CONTACT FORM
  const initContact = () => {
    const form = $('#contact-form');
    const copyBtn = $('#copy-email');
    const status = $('#form-status');
    const emailAddress = 'sridhar.dev@example.com';

    const err = (field, msg) => {
      const p = field.closest('.form-field').querySelector('.field-error');
      p.textContent = msg || '';
    };

    const validate = () => {
      let ok = true;
      const name = $('#name');
      const email = $('#email');
      const message = $('#message');

      err(name, ''); err(email, ''); err(message, '');

      if (!name.value.trim() || name.value.trim().length < 2) {
        err(name, 'Please enter your name.');
        ok = false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
        err(email, 'Please enter a valid email address.');
        ok = false;
      }
      if (!message.value.trim() || message.value.trim().length < 10) {
        err(message, 'Please provide a few details (10+ characters).');
        ok = false;
      }
      return ok;
    };

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      status.textContent = '';
      if (!validate()) {
        const firstError = $$('.field-error').find((n) => n.textContent);
        if (firstError) firstError.previousElementSibling?.focus();
        return;
      }
      const name = encodeURIComponent($('#name').value.trim());
      const from = encodeURIComponent($('#email').value.trim());
      const msg = encodeURIComponent($('#message').value.trim());
      const subject = `Portfolio Contact - ${name}`;
      const body = `Name: ${name}%0AEmail: ${from}%0A%0A${msg}`;
      const mailto = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
      status.textContent = 'Opening your email client…';
      window.location.href = mailto;
      setTimeout(() => (status.textContent = 'If your email client did not open, please copy the email address and send manually.'), 1500);
      form.reset();
    });

    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(emailAddress);
        status.textContent = 'Email address copied to clipboard.';
        status.style.color = 'var(--success)';
      } catch {
        status.textContent = 'Press Ctrl/Cmd+C to copy: ' + emailAddress;
        status.style.color = 'var(--muted)';
      }
    });
  };

  // Footer year
  const setYear = () => {
    const y = new Date().getFullYear();
    const el = $('#year');
    if (el) el.textContent = y;
  };

  // INIT
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();
    initSmoothScroll();
    initReveal();
    initContact();
    setYear();
  });
})();
