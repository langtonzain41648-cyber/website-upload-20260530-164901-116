(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let currentSlide = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startHeroTimer() {
    if (heroTimer || slides.length <= 1) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function restartHeroTimer() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
      heroTimer = null;
    }
    startHeroTimer();
  }

  if (slides.length) {
    showSlide(0);
    startHeroTimer();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      restartHeroTimer();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      restartHeroTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.dataset.heroDot || 0));
      restartHeroTimer();
    });
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardMatches(card, query, typeValue, categoryValue) {
    const text = normalize([
      card.dataset.title,
      card.dataset.year,
      card.dataset.region,
      card.dataset.type,
      card.dataset.genre,
      card.dataset.category,
      card.textContent
    ].join(' '));

    const queryOk = !query || text.includes(query);
    const typeOk = !typeValue || typeValue === 'all' || normalize(card.dataset.type) === normalize(typeValue);
    const categoryOk = !categoryValue || categoryValue === 'all' || text.includes(normalize(categoryValue));

    return queryOk && typeOk && categoryOk;
  }

  document.querySelectorAll('[data-card-filter]').forEach(function (filterRoot) {
    const input = filterRoot.querySelector('[data-filter-input]');
    const grid = document.querySelector('[data-filter-grid]');
    const cards = grid ? Array.from(grid.querySelectorAll('[data-movie-card]')) : [];
    const emptyState = document.querySelector('[data-empty-state]');
    let activeType = 'all';

    function applyFilter() {
      const query = normalize(input ? input.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const isVisible = cardMatches(card, query, activeType, 'all');
        card.hidden = !isVisible;
        if (isVisible) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    filterRoot.querySelectorAll('[data-filter-type]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.dataset.filterType || 'all';
        filterRoot.querySelectorAll('[data-filter-type]').forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });

    applyFilter();
  });

  const searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    const input = searchPage.querySelector('[data-search-input]');
    const category = searchPage.querySelector('[data-search-category]');
    const resultGrid = document.querySelector('[data-search-results]');
    const cards = resultGrid ? Array.from(resultGrid.querySelectorAll('[data-movie-card]')) : [];
    const emptyState = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function applySearch() {
      const query = normalize(input ? input.value : '');
      const categoryValue = category ? category.value : 'all';
      let visible = 0;

      cards.forEach(function (card) {
        const isVisible = cardMatches(card, query, 'all', categoryValue);
        card.hidden = !isVisible;
        if (isVisible) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applySearch);
    }

    if (category) {
      category.addEventListener('change', applySearch);
    }

    applySearch();
  }
})();
