(function () {
  "use strict";

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var menu = document.querySelector(".mobile-menu");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = !menu.classList.contains("hidden");
      menu.classList.toggle("hidden", isOpen);
      button.setAttribute("aria-expanded", String(!isOpen));
      button.textContent = isOpen ? "☰" : "×";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restartTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restartTimer();
      });
    }

    showSlide(0);
    restartTimer();
  }

  function setupFilters() {
    var panels = selectAll("[data-filter-panel]");

    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var cards = selectAll("[data-filter-grid] [data-title]", scope);
      var keywordInput = panel.querySelector("[data-filter-keyword]");
      var yearInput = panel.querySelector("[data-filter-year]");
      var typeInput = panel.querySelector("[data-filter-type]");
      var result = panel.querySelector("[data-filter-result]");

      function applyFilter() {
        var keyword = (keywordInput && keywordInput.value || "").trim().toLowerCase();
        var year = yearInput && yearInput.value || "";
        var type = typeInput && typeInput.value || "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !year || card.getAttribute("data-year") === year;
          var matchesType = !type || (card.getAttribute("data-type") || "").indexOf(type) !== -1;
          var shouldShow = matchesKeyword && matchesYear && matchesType;

          card.classList.toggle("hidden-by-filter", !shouldShow);

          if (shouldShow) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = "当前显示 " + visible + " 部影片";
        }
      }

      [keywordInput, yearInput, typeInput].forEach(function (input) {
        if (input) {
          input.addEventListener("input", applyFilter);
          input.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    });
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");

    if (!page || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var queryInput = page.querySelector("[data-search-query]");
    var categoryInput = page.querySelector("[data-search-category]");
    var button = page.querySelector("[data-search-button]");
    var summary = page.querySelector("[data-search-summary]");
    var results = document.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (queryInput) {
      queryInput.value = initialQuery;
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function cardTemplate(movie) {
      return [
        '<article class="movie-card group">',
        '  <a href="' + escapeHtml(movie.url) + '" class="block h-full">',
        '    <div class="relative overflow-hidden rounded-t-2xl bg-neutral-900 h-60">',
        '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy">',
        '      <div class="absolute inset-0 poster-fade"></div>',
        '      <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-semibold">' + escapeHtml(movie.category_name) + '</span>',
        '      <span class="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-white text-xs font-medium">' + escapeHtml(movie.year) + '</span>',
        '    </div>',
        '    <div class="p-4">',
        '      <h2 class="text-lg font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">' + escapeHtml(movie.title) + '</h2>',
        '      <p class="text-neutral-600 text-sm line-clamp-3 mb-4">' + escapeHtml(movie.one_line) + '</p>',
        '      <div class="flex items-center justify-between text-sm text-neutral-500">',
        '        <span>' + escapeHtml(movie.type) + '</span>',
        '        <span>' + escapeHtml(movie.region) + '</span>',
        '      </div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join("");
    }

    function applySearch() {
      var query = (queryInput && queryInput.value || "").trim().toLowerCase();
      var category = categoryInput && categoryInput.value || "";
      var filtered = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.one_line,
          movie.summary
        ].join(" ").toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesCategory = !category || movie.category_slug === category;

        return matchesQuery && matchesCategory;
      });

      var limited = filtered.slice(0, 120);

      if (summary) {
        summary.textContent = "共找到 " + filtered.length + " 部影片，当前展示前 " + limited.length + " 部。";
      }

      if (results) {
        results.innerHTML = limited.map(cardTemplate).join("");
      }
    }

    if (button) {
      button.addEventListener("click", applySearch);
    }

    [queryInput, categoryInput].forEach(function (input) {
      if (input) {
        input.addEventListener("input", applySearch);
        input.addEventListener("change", applySearch);
      }
    });

    applySearch();
  }

  function setupPlayers() {
    selectAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector("[data-play-overlay]");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector("[data-player-status]");
      var started = false;
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || "";
        }
      }

      function startPlayback() {
        if (started) {
          video.play();
          return;
        }

        var source = video.getAttribute("data-src");

        if (!source) {
          setStatus("未找到播放源");
          return;
        }

        started = true;
        video.controls = true;

        if (overlay) {
          overlay.classList.add("is-hidden");
        }

        setStatus("正在加载播放源...");

        if (source.indexOf(".m3u8") !== -1 && window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setStatus("浏览器阻止了自动播放，请再次点击视频播放。");
            });
            setStatus("");
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus("播放线路加载失败，请刷新页面重试。");
            }
          });
          return;
        }

        if (source.indexOf(".m3u8") !== -1 && !video.canPlayType("application/vnd.apple.mpegurl") && !window.Hls) {
          started = false;
          setStatus("播放器组件加载中，请稍候再试。");
          window.addEventListener("hls-ready", startPlayback, { once: true });
          return;
        }

        video.src = source;
        video.play().catch(function () {
          setStatus("浏览器阻止了自动播放，请再次点击视频播放。");
        });
      }

      button.addEventListener("click", startPlayback);
      video.addEventListener("click", function () {
        if (!started) {
          startPlayback();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
