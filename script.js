/* ============================================================
   Tümay Turhan — script.js
   ============================================================ */

(function () {
  'use strict';

  /* === Header scroll state ================================ */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () =>
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* === Close mobile nav on link click ==================== */
  document.querySelectorAll('.nav-drawer-panel a').forEach((link) => {
    link.addEventListener('click', () => {
      const drawer = link.closest('details');
      if (drawer) drawer.removeAttribute('open');
    });
  });

  /* === Work Slider ======================================== */
  const initWorkSlider = (el) => {
    const track      = el.querySelector('.work-track');
    const slides     = [...el.querySelectorAll('.work-slide')];
    const counter    = el.querySelector('.work-counter');
    const dotsWrap   = el.querySelector('.work-dots');
    const prevBtn    = el.querySelector('.work-arrow--prev');
    const nextBtn    = el.querySelector('.work-arrow--next');

    if (!track || slides.length === 0) return;

    let current = 0;
    const total = slides.length;

    /* Build dots */
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'work-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Project ${i + 1} of ${total}`);
      dot.setAttribute('aria-selected', String(i === 0));
      dot.addEventListener('click', () => goto(i));
      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.querySelectorAll('.work-dot')];

    /* Initial ARIA state */
    slides.forEach((s, i) => {
      s.setAttribute('aria-hidden', String(i !== 0));
    });

    const goto = (index) => {
      if (index === current) return;

      /* Deactivate current */
      slides[current].setAttribute('aria-hidden', 'true');
      dots[current].classList.remove('is-active');
      dots[current].setAttribute('aria-selected', 'false');

      current = Math.max(0, Math.min(index, total - 1));

      /* Activate next */
      slides[current].setAttribute('aria-hidden', 'false');
      dots[current].classList.add('is-active');
      dots[current].setAttribute('aria-selected', 'true');

      track.style.transform = `translateX(-${current * 100}%)`;

      if (counter) counter.textContent = `${current + 1} / ${total}`;
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === total - 1;
    };

    /* Init button states */
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = total <= 1;

    prevBtn?.addEventListener('click', () => goto(current - 1));
    nextBtn?.addEventListener('click', () => goto(current + 1));

    /* Keyboard navigation */
    el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goto(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goto(current + 1); }
      if (e.key === 'Home')       { e.preventDefault(); goto(0); }
      if (e.key === 'End')        { e.preventDefault(); goto(total - 1); }
    });

    /* Touch / swipe */
    let touchStartX = 0;
    el.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    el.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 44) goto(dx < 0 ? current + 1 : current - 1);
    });
  };

  document.querySelectorAll('[data-work-slider]').forEach(initWorkSlider);

  /* === Inner Image Carousel =============================== */
  const initCarousel = (el) => {
    const track        = el.querySelector('.project-carousel-track');
    const slides       = [...el.querySelectorAll('.project-carousel-slide')];
    const dotsWrap     = el.querySelector('.carousel-dots');
    const prevBtn      = el.querySelector('.carousel-prev');
    const nextBtn      = el.querySelector('.carousel-next');
    const controlsEl   = el.querySelector('.project-carousel-controls');

    if (!track || slides.length === 0) return;

    /* Hide controls if only one image */
    if (slides.length <= 1) {
      controlsEl?.remove();
      return;
    }

    let current = 0;
    const total = slides.length;
    const interval = parseInt(el.dataset.carouselInterval, 10) || 5500;
    let timer;

    /* Build dots */
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Screenshot ${i + 1} of ${total}`);
      dot.addEventListener('click', () => { goto(i); resetTimer(); });
      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.querySelectorAll('.carousel-dot')];

    const goto = (index) => {
      dots[current].classList.remove('is-active');
      current = ((index % total) + total) % total;
      dots[current].classList.add('is-active');
      track.style.transform = `translateX(-${current * 100}%)`;
    };

    const resetTimer = () => {
      clearInterval(timer);
      timer = setInterval(() => goto(current + 1), interval);
    };

    prevBtn?.addEventListener('click', () => { goto(current - 1); resetTimer(); });
    nextBtn?.addEventListener('click', () => { goto(current + 1); resetTimer(); });

    /* Pause on hover */
    el.addEventListener('mouseenter', () => clearInterval(timer));
    el.addEventListener('mouseleave', resetTimer);

    /* Start auto-advance */
    resetTimer();
  };

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  /* === Credentials Tab Switcher =========================== */
  const initCredSwitcher = (el) => {
    const tabs  = [...el.querySelectorAll('.cred-tab')];
    const track = el.querySelector('.cred-track');
    const panels = [...el.querySelectorAll('.cred-panel')];

    if (!track || tabs.length === 0) return;

    const activate = (index) => {
      tabs.forEach((t, i) => {
        const active = i === index;
        t.setAttribute('aria-selected', String(active));
        t.setAttribute('tabindex', active ? '0' : '-1');
      });
      panels.forEach((p, i) => {
        p.setAttribute('aria-hidden', String(i !== index));
      });
      track.style.transform = `translateX(-${index * 100}%)`;
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(i));
      /* Roving tabindex keyboard support */
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); activate((i + 1) % tabs.length); tabs[(i + 1) % tabs.length].focus(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); activate((i - 1 + tabs.length) % tabs.length); tabs[(i - 1 + tabs.length) % tabs.length].focus(); }
      });
    });
  };

  document.querySelectorAll('[data-cred-switcher]').forEach(initCredSwitcher);

  /* === Scroll Reveal ===================================== */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            /* Stagger children if the element has multiple direct children */
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  } else {
    /* Fallback: show everything immediately */
    document.querySelectorAll('.reveal').forEach((el) =>
      el.classList.add('is-visible')
    );
  }

})();
