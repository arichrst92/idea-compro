// public/js/products-filter.js
// Category filter for /products. Defines a global function that the
// inline onclick handlers call directly — this means filtering works
// even if this file is cached out of date.

(function () {
  'use strict';

  // Global function bound to inline onclick attributes on filter buttons.
  // Signature: ideaFilterCat(catId, btnEl?) — btnEl is the clicked button.
  window.ideaFilterCat = function (cat, btnEl) {
    if (!cat) cat = 'all';

    var filterBar = document.getElementById('productsFilters');
    if (!filterBar) return;

    var buttons  = filterBar.querySelectorAll('.filter-btn');
    var sections = document.querySelectorAll('.product-category');

    // Toggle active class
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      var isActive = btnEl ? (b === btnEl) : (b.getAttribute('data-cat') === cat);
      if (isActive) b.classList.add('active');
      else b.classList.remove('active');
    }

    // Show / hide sections
    for (var j = 0; j < sections.length; j++) {
      var s = sections[j];
      var match = (cat === 'all' || s.getAttribute('data-cat') === cat);
      s.style.display = match ? '' : 'none';
    }

    // Scroll filter bar into view (below sticky navbar)
    var bar = document.querySelector('.products-filter-bar');
    if (bar && typeof bar.getBoundingClientRect === 'function') {
      var navHRaw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
      var navH = parseInt(navHRaw, 10) || 72;
      var top  = bar.getBoundingClientRect().top + (window.pageYOffset || window.scrollY) - navH - 8;
      if (top < 0) top = 0;
      try { window.scrollTo({ top: top, behavior: 'smooth' }); }
      catch (e) { window.scrollTo(0, top); }
    }

    // Sync URL hash for deep-linking
    try {
      if (cat === 'all') {
        if (location.hash) history.replaceState(null, '', location.pathname);
      } else {
        history.replaceState(null, '', '#' + cat);
      }
    } catch (e) { /* old browser fallback */ }
  };

  // Init from URL hash on page load (e.g. /products#cloud)
  function init() {
    var initial = (location.hash || '').replace('#', '');
    if (!initial) return;
    var btn = document.querySelector('#productsFilters .filter-btn[data-cat="' + initial + '"]');
    if (btn) window.ideaFilterCat(initial, btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
