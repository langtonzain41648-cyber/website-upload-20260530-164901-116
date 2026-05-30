(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var index = 0;
      var timer;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          restart();
        });
      });

      show(0);
      restart();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var empty = document.querySelector('[data-empty]');

    if (filterInput && cards.length) {
      var query = new URLSearchParams(window.location.search).get('q') || '';
      if (query) {
        filterInput.value = query;
      }

      function applyFilter() {
        var value = filterInput.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var indexText = (card.getAttribute('data-index') || '').toLowerCase();
          var matched = !value || indexText.indexOf(value) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      filterInput.addEventListener('input', applyFilter);
      applyFilter();
    }
  });
})();
