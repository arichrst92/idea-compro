// public/js/products-filter.js
// Category filter for /products — show/hide product-category sections.

(function () {
  'use strict';

  function init() {
    var filterBar = document.getElementById('productsFilters');
    if (!filterBar) return;

    var sections = document.querySelectorAll('.product-category');
    var buttons  = filterBar.querySelectorAll('.filter-btn');

    function apply(cat) {
      // Toggle active state
      for (var i = 0; i < buttons.length; i++) {
        var b = buttons[i];
        if (b.dataset.cat === cat) b.classList.add('active');
        else b.classList.remove('active');
      }

      // Show / hide category sections
      for (var j = 0; j < sections.length; j++) {
        var s = sections[j];
        var match = (cat === 'all' || s.dataset.cat === cat);
        s.style.display = match ? '' : 'none';
      }

      // Scroll into view of filter bar (account for sticky navbar)
      var bar = document.querySelector('.products-filter-bar');
      if (bar) {
        var navHRaw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
        var navH = parseInt(navHRaw, 10) || 72;
        var top  = bar.getBoundingClientRect().top + window.pageYOffset - navH - 8;
        if (top < 0) top = 0;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }

      // Sync URL hash (deep-linkable filter state)
      try {
        if (cat === 'all') {
          if (location.hash) history.replaceState(null, '', location.pathname);
        } else {
          history.replaceState(null, '', '#' + cat);
        }
      } catch (e) { /* old browsers without history.replaceState */ }
    }

    // Delegated click handler
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.filter-btn') : null;
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      apply(btn.dataset.cat || 'all');
    });

    // Init from URL hash (e.g. /products#cloud)
    var initial = (location.hash || '').replace('#', '');
    if (initial) {
      var found = false;
      for (var k = 0; k < buttons.length; k++) {
        if (buttons[k].dataset.cat === initial) { found = true; break; }
      }
      if (found) apply(initial);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
