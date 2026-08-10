/* ==========================================================================
   Southern Bloom Bakery Co. — theme.js
   No dependencies. Everything is progressive: the page works without JS.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* Mobile navigation drawer                                            */
  /* ------------------------------------------------------------------ */
  function initMobileNav() {
    var nav = document.querySelector('[data-mobile-nav]');
    var toggle = document.querySelector('[data-menu-toggle]');
    if (!nav || !toggle) return;

    var lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      nav.hidden = false;
      // next frame so the transition runs
      requestAnimationFrame(function () { nav.classList.add('is-open'); });
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    }

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      window.setTimeout(function () { nav.hidden = true; }, 320);
      if (lastFocused) lastFocused.focus();
    }

    toggle.addEventListener('click', open);
    nav.querySelectorAll('[data-menu-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) close();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Sticky header                                                        */
  /* Native `position: sticky` doesn't work here: Shopify wraps the header */
  /* in its own <section> sized exactly to the header's height, leaving   */
  /* zero travel room for sticky to hold. Fixed + a JS-toggled class, with */
  /* a spacer to prevent the content jump, does the same job instead.     */
  /* ------------------------------------------------------------------ */
  function initStickyHeader() {
    var header = document.querySelector('.header--sticky');
    var spacer = document.querySelector('[data-header-spacer]');
    if (!header || !spacer) return;
    // init() re-runs on shopify:section:load; this only needs to bind once.
    if (window.__sbStickyHeaderBound) return;
    window.__sbStickyHeaderBound = true;

    var pinPoint = 0;

    function measure() {
      // Document-relative offset, valid however far the page is already
      // scrolled — only meaningful while NOT pinned (fixed positioning
      // would otherwise make the header its own reference point).
      if (!header.classList.contains('is-pinned')) {
        pinPoint = header.getBoundingClientRect().top + window.scrollY;
      }
    }

    function update() {
      var shouldPin = window.scrollY > pinPoint;
      var isPinned = header.classList.contains('is-pinned');
      if (shouldPin && !isPinned) {
        spacer.style.height = header.getBoundingClientRect().height + 'px';
        spacer.hidden = false;
        header.classList.add('is-pinned');
      } else if (!shouldPin && isPinned) {
        header.classList.remove('is-pinned');
        spacer.hidden = true;
      } else if (isPinned) {
        // keep the spacer in step if the header's own height changes while
        // pinned (a web font swapping in, the window growing/shrinking)
        spacer.style.height = header.getBoundingClientRect().height + 'px';
      }
    }

    measure();
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', function () {
      measure();
      update();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Rotating announcement bar                                           */
  /* ------------------------------------------------------------------ */
  function initAnnouncement() {
    document.querySelectorAll('[data-announcement]').forEach(function (bar) {
      var items = bar.querySelectorAll('.announcement__item');
      if (items.length < 2 || prefersReduced) return;

      var i = 0;
      var speed = (parseInt(bar.dataset.speed, 10) || 5) * 1000;
      window.setInterval(function () {
        items[i].classList.remove('is-active');
        i = (i + 1) % items.length;
        items[i].classList.add('is-active');
      }, speed);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero slideshow                                                      */
  /* ------------------------------------------------------------------ */
  function initHero() {
    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = hero.querySelectorAll('[data-hero-slide]');
      if (slides.length < 2) return;

      var dots = hero.querySelectorAll('[data-hero-dot]');
      var current = 0;
      var timer = null;
      var interval = parseInt(hero.dataset.interval, 10) || 7000;
      var autoplay = hero.dataset.autoplay === 'true' && !prefersReduced;

      function go(next) {
        next = (next + slides.length) % slides.length;
        slides[current].classList.remove('is-active');
        slides[current].setAttribute('aria-hidden', 'true');
        slides[next].classList.add('is-active');
        slides[next].removeAttribute('aria-hidden');

        if (dots.length) {
          dots[current].classList.remove('is-active');
          dots[current].setAttribute('aria-selected', 'false');
          dots[next].classList.add('is-active');
          dots[next].setAttribute('aria-selected', 'true');
        }
        current = next;
      }

      function start() { if (autoplay) timer = window.setInterval(function () { go(current + 1); }, interval); }
      function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
      function restart() { stop(); start(); }

      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      if (prev) prev.addEventListener('click', function () { go(current - 1); restart(); });
      if (next) next.addEventListener('click', function () { go(current + 1); restart(); });

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          go(parseInt(dot.dataset.index, 10));
          restart();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      hero.addEventListener('focusin', stop);

      // Touch swipe
      var startX = null;
      hero.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
      hero.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 45) { go(dx < 0 ? current + 1 : current - 1); restart(); }
        startX = null;
      }, { passive: true });

      // Pause while off-screen
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries[0].isIntersecting ? start() : stop();
        }, { threshold: 0.15 }).observe(hero);
      } else {
        start();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Gallery filtering + lightbox                                        */
  /* ------------------------------------------------------------------ */
  function initGallery() {
    var filters = document.querySelectorAll('[data-gallery-filter]');
    var items = document.querySelectorAll('[data-gallery-item]');

    if (filters.length && items.length) {
      filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var cat = btn.dataset.category;
          filters.forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          });
          items.forEach(function (item) {
            var show = cat === 'all' || item.dataset.category === cat;
            item.hidden = !show;
          });
          // Reset any "load more" trimming so filtered results are all visible
          document.querySelectorAll('[data-gallery-more]').forEach(function (b) {
            b.hidden = true;
          });
        });
      });
    }

    // "Load more" — hides overflow items until asked for
    document.querySelectorAll('[data-gallery-more]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-gallery-item].is-hidden-overflow').forEach(function (el) {
          el.classList.remove('is-hidden-overflow');
        });
        btn.hidden = true;
      });
    });

    initLightbox(items);
  }

  function initLightbox(items) {
    var triggers = Array.prototype.filter.call(items, function (i) {
      return i.querySelector('[data-lightbox]');
    });
    if (!triggers.length) return;

    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.hidden = true;
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/></svg>' +
      '</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>' +
      '</button>' +
      '<figure class="lightbox__figure"><img class="lightbox__img" alt=""><figcaption class="lightbox__caption"></figcaption></figure>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>' +
      '</button>';
    document.body.appendChild(box);

    var img = box.querySelector('.lightbox__img');
    var cap = box.querySelector('.lightbox__caption');
    var index = 0;

    function visible() {
      return triggers.filter(function (t) { return !t.hidden && !t.classList.contains('is-hidden-overflow'); });
    }

    function show(list, i) {
      index = (i + list.length) % list.length;
      var trigger = list[index].querySelector('[data-lightbox]');
      img.src = trigger.dataset.lightbox;
      img.alt = trigger.dataset.alt || '';
      cap.textContent = trigger.dataset.caption || '';
      cap.hidden = !trigger.dataset.caption;
    }

    function open(i) {
      show(visible(), i);
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      box.querySelector('.lightbox__close').focus();
    }
    function close() {
      box.hidden = true;
      document.body.style.overflow = '';
    }

    triggers.forEach(function (item, i) {
      var trigger = item.querySelector('[data-lightbox]');
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var list = visible();
        open(list.indexOf(item) === -1 ? 0 : list.indexOf(item));
      });
    });

    box.querySelector('.lightbox__close').addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    box.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(visible(), index - 1); });
    box.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(visible(), index + 1); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(visible(), index - 1);
      if (e.key === 'ArrowRight') show(visible(), index + 1);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Cart drawer                                                         */
  /* ------------------------------------------------------------------ */
  function initCartDrawer() {
    var drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer) return;

    function open(e) {
      if (e) e.preventDefault();
      drawer.hidden = false;
      requestAnimationFrame(function () { drawer.classList.add('is-open'); });
      document.body.style.overflow = 'hidden';
    }
    function close() {
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
      window.setTimeout(function () { drawer.hidden = true; }, 320);
    }

    document.querySelectorAll('[data-cart-open]').forEach(function (el) {
      el.addEventListener('click', open);
    });
    drawer.querySelectorAll('[data-cart-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Product gallery (product page thumbnails)                           */
  /* ------------------------------------------------------------------ */
  function initProductMedia() {
    document.querySelectorAll('[data-product-media]').forEach(function (root) {
      var main = root.querySelector('[data-product-main-img]');
      if (!main) return;
      root.querySelectorAll('[data-product-thumb]').forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          main.src = thumb.dataset.full;
          main.srcset = '';
          main.alt = thumb.dataset.alt || '';
          root.querySelectorAll('[data-product-thumb]').forEach(function (t) {
            t.classList.toggle('is-active', t === thumb);
          });
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Quantity steppers                                                   */
  /* ------------------------------------------------------------------ */
  function initQuantity() {
    document.querySelectorAll('[data-qty]').forEach(function (root) {
      var input = root.querySelector('input');
      if (!input) return;
      root.querySelectorAll('[data-qty-change]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var step = parseInt(btn.dataset.qtyChange, 10);
          var min = parseInt(input.min, 10) || 0;
          var val = (parseInt(input.value, 10) || 0) + step;
          input.value = Math.max(min, val);
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reveal-on-scroll                                                    */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* Smooth momentum scrolling                                           */
  /* A lerp'd wheel handler gives the page some weight without touching  */
  /* layout, position:sticky, or the native scrollbar — every frame still */
  /* calls window.scrollTo with a real scrollY, so the scrollbar thumb    */
  /* (pink, styled in base.css) tracks it exactly like a native scroll.   */
  /* Deliberately desktop-only: touchscreens already have native          */
  /* momentum scrolling that this would only fight with.                  */
  /* ------------------------------------------------------------------ */
  function initSmoothScroll() {
    if (prefersReduced) return;
    if (document.documentElement.dataset.smoothScroll !== 'true') return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (!('requestAnimationFrame' in window)) return;
    // init() re-runs on shopify:section:load (theme editor re-renders a
    // section); the listeners below are page-level and must attach once.
    if (window.__sbSmoothScrollBound) return;
    window.__sbSmoothScrollBound = true;

    var EASE = 0.09;      // lower = heavier, slower to catch up to the target
    var EPSILON = 0.4;    // px; below this the lerp snaps instead of creeping forever

    var current = window.scrollY;
    var target = current;
    var expected = current;
    var raf = null;

    function maxScroll() {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    // Elements with their own vertical scrollbar (cart drawer, mobile nav
    // panel) should scroll natively — only take over the wheel event when
    // no scrollable ancestor between it and <body> can still move.
    function hasOwnScroll(el, deltaY) {
      // e.target is an Element for real wheel events, but can be the document
      // (or, in synthetic/edge cases, something else entirely) — getComputedStyle
      // throws on anything that isn't one, so bail out to "no nested scroller".
      if (!(el instanceof Element)) return false;
      while (el && el !== document.body && el !== document.documentElement) {
        var style = window.getComputedStyle(el);
        if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight) {
          var atTop = el.scrollTop <= 0;
          var atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
          if (!(deltaY < 0 && atTop) && !(deltaY > 0 && atBottom)) return true;
        }
        el = el.parentElement;
      }
      return false;
    }

    function step() {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < EPSILON) {
        current = target;
        raf = null;
      } else {
        raf = requestAnimationFrame(step);
      }
      expected = current;
      // behavior:'instant' overrides the CSS `scroll-behavior: smooth` on
      // <html> (used for anchor links) — without it every one of our own
      // per-frame calls would itself be smoothed, doubling up the motion.
      window.scrollTo({ top: current, left: 0, behavior: 'instant' });
    }

    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey) return;                               // pinch-zoom gesture
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;  // horizontal swipe row
      if (hasOwnScroll(e.target, e.deltaY)) return;         // nested scroller has room

      var dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 18;                      // "line" mode -> px
      else if (e.deltaMode === 2) dy *= window.innerHeight; // "page" mode -> px

      e.preventDefault();
      target = Math.min(maxScroll(), Math.max(0, target + dy));
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: false });

    // Keyboard scrolling, scrollbar-thumb dragging, and anchor-link jumps
    // move window.scrollY without going through the wheel handler above.
    // If a scroll happens that we did not just cause ourselves, adopt the
    // new position instantly rather than snapping back to a stale target.
    window.addEventListener('scroll', function () {
      if (Math.abs(window.scrollY - expected) > 2) {
        current = target = window.scrollY;
      }
    }, { passive: true });

    window.addEventListener('resize', function () {
      target = Math.min(target, maxScroll());
    });
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */
  function init() {
    initMobileNav();
    initStickyHeader();
    initAnnouncement();
    initHero();
    initGallery();
    initCartDrawer();
    initProductMedia();
    initQuantity();
    initReveal();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run when a section is re-rendered in the Shopify theme editor
  document.addEventListener('shopify:section:load', init);
})();
