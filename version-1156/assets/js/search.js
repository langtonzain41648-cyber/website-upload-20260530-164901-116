(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-empty-state]');
  var data = window.MovieIndexData || [];

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card" data-movie-card>' +
      '<a class="poster-link" href="' + movie.url + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="play-float">▶</span>' +
      '<span class="score-badge">热度 ' + movie.heat.toFixed(1) + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<div class="card-tags">' + tags + '</div>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function runSearch(value) {
    var query = String(value || '').trim().toLowerCase();
    if (!query) {
      results.innerHTML = data.slice(0, 24).map(card).join('');
      empty.style.display = 'none';
      return;
    }
    var terms = query.split(/\s+/).filter(Boolean);
    var matched = data.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase();
      return terms.every(function (term) {
        return text.indexOf(term) > -1;
      });
    }).slice(0, 120);
    results.innerHTML = matched.map(card).join('');
    empty.style.display = matched.length ? 'none' : 'block';
  }

  if (form && input && results && empty) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch(input.value);
    });
    input.addEventListener('input', function () {
      runSearch(input.value);
    });
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q') || '';
    input.value = keyword;
    runSearch(keyword);
  }
})();
