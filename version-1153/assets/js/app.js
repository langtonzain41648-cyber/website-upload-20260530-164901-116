(function () {
  var nav = document.querySelector('[data-nav]');
  var toggle = document.querySelector('[data-nav-toggle]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var grid = document.querySelector('[data-card-grid]');
  var input = document.querySelector('[data-filter-input]');
  var year = document.querySelector('[data-filter-year]');
  var type = document.querySelector('[data-filter-type]');
  var sort = document.querySelector('[data-sort]');
  var empty = document.querySelector('[data-empty-state]');

  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQ = params.get('q');

    if (input && initialQ) {
      input.value = initialQ;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var q = normalize(input ? input.value : '');
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }

        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }

        if (t && card.getAttribute('data-type') !== t) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    function applySort() {
      var mode = sort ? sort.value : 'year';
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'title') {
          return normalize(a.getAttribute('data-search')).localeCompare(normalize(b.getAttribute('data-search')), 'zh-CN');
        }
        if (mode === 'score') {
          return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
        }
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      applyFilters();
    }

    [input, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });

    if (sort) {
      sort.addEventListener('change', applySort);
    }

    applySort();
  }
})();
