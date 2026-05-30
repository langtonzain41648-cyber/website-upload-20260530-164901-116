(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var header = document.querySelector(".site-header");
    var menuButton = document.querySelector(".menu-toggle");

    if (header && menuButton) {
      menuButton.addEventListener("click", function () {
        var open = header.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var next = hero.querySelector("[data-hero-next]");
      var prev = hero.querySelector("[data-hero-prev]");
      var index = 0;
      var timer;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var root = form.closest("section") || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
      var queryInput = form.querySelector("input[name='q']");
      var typeSelect = form.querySelector("select[name='type']");
      var yearSelect = form.querySelector("select[name='year']");
      var params = new URLSearchParams(window.location.search);

      if (queryInput && params.get("q")) {
        queryInput.value = params.get("q");
      }

      function apply() {
        var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var ok = true;

          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (type && cardType !== type) {
            ok = false;
          }
          if (year && cardYear !== year) {
            ok = false;
          }

          card.classList.toggle("is-hidden-card", !ok);
        });
      }

      [queryInput, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var src = player.getAttribute("data-stream");
      var hlsInstance = null;
      var initialized = false;

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      function playVideo() {
        hideOverlay();
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      function init() {
        if (!video || !src) {
          return;
        }

        if (initialized) {
          playVideo();
          return;
        }

        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          playVideo();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              }
            }
          });
          return;
        }

        video.src = src;
        playVideo();
      }

      if (overlay) {
        overlay.addEventListener("click", init);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            init();
          }
        });
        video.addEventListener("play", hideOverlay);
      }
    });
  });
})();
