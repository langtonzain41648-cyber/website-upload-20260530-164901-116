(function () {
  var header = document.querySelector('[data-header]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  function setHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (menuToggle && mobilePanel && header) {
    menuToggle.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      header.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  function bindPlayer(root) {
    var video = root.querySelector('video[data-stream]');
    var button = root.querySelector('[data-play]');
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var ready = false;

    function attachStream() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hls = hls;
        ready = true;
        return;
      }
      video.src = stream;
      ready = true;
    }

    function play() {
      attachStream();
      button.classList.add('is-hidden');
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bindPlayer);

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (item) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[item];
    });
  }

  function renderSearch() {
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var input = document.querySelector('[data-search-input]');
    if (!results || !status || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = window.SEARCH_INDEX.filter(function (item) {
      var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 80);

    status.textContent = matches.length ? '为你找到相关内容' : '暂无匹配内容';
    results.innerHTML = matches.map(function (item) {
      return '<article class="movie-card">' +
        '<a class="poster-link" href="../movie/' + item.file + '" aria-label="观看' + escapeHtml(item.title) + '">' +
        '<img src="../' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="play-badge">▶</span>' +
        '<span class="year-badge">' + escapeHtml(item.year) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<div class="card-tags">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>' +
        '<h3><a href="../movie/' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  renderSearch();
})();
