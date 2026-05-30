(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
        menuButton.textContent = mobileMenu.classList.contains("open") ? "×" : "☰";
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;
      var timer;

      function setSlide(index) {
        if (!slides.length) return;
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === active);
        });
      }

      function step(offset) {
        setSlide(active + offset);
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          step(1);
        }, 5200);
      }

      function stop() {
        if (timer) window.clearInterval(timer);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          setSlide(i);
          start();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          step(-1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          step(1);
          start();
        });
      }
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      setSlide(0);
      start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
      var items = Array.prototype.slice.call(scope.querySelectorAll("[data-search-item]"));
      var empty = scope.querySelector("[data-empty-message]");

      function matches(item) {
        var query = text(input ? input.value : "");
        var haystack = text([
          item.getAttribute("data-title"),
          item.getAttribute("data-region"),
          item.getAttribute("data-type"),
          item.getAttribute("data-category"),
          item.getAttribute("data-tags"),
          item.getAttribute("data-year")
        ].join(" "));
        if (query && haystack.indexOf(query) === -1) return false;
        return selects.every(function (select) {
          var key = select.getAttribute("data-filter-select");
          var value = text(select.value);
          if (!value) return true;
          return text(item.getAttribute("data-" + key)) === value;
        });
      }

      function apply() {
        var visible = 0;
        items.forEach(function (item) {
          var ok = matches(item);
          item.style.display = ok ? "" : "none";
          if (ok) visible += 1;
        });
        if (empty) empty.classList.toggle("show", visible === 0);
      }

      if (input) input.addEventListener("input", apply);
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  });

  window.initMoviePlayer = function (src) {
    var video = document.getElementById("movie-player");
    if (!video || !src) return;
    var panel = video.closest(".player-panel");
    var overlay = document.getElementById("player-overlay");
    var playButtons = Array.prototype.slice.call(document.querySelectorAll("[data-player-play]"));
    var muteButtons = Array.prototype.slice.call(document.querySelectorAll("[data-player-mute]"));
    var fullButtons = Array.prototype.slice.call(document.querySelectorAll("[data-player-fullscreen]"));
    var hlsInstance = null;
    var started = false;

    function attach() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = src;
    }

    function update() {
      var playing = !video.paused && !video.ended;
      playButtons.forEach(function (button) {
        button.textContent = playing ? "Ⅱ" : "▶";
        button.setAttribute("aria-label", playing ? "暂停" : "播放");
      });
      muteButtons.forEach(function (button) {
        button.textContent = video.muted ? "🔇" : "🔊";
      });
      if (panel) panel.classList.toggle("is-active", playing);
      if (overlay) overlay.classList.toggle("is-hidden", started);
    }

    function play() {
      started = true;
      var result = video.play();
      if (result && result.catch) result.catch(function () {});
      update();
    }

    function toggle() {
      started = true;
      if (video.paused || video.ended) {
        play();
      } else {
        video.pause();
      }
      update();
    }

    attach();

    if (overlay) overlay.addEventListener("click", play);
    video.addEventListener("click", toggle);
    video.addEventListener("play", update);
    video.addEventListener("pause", update);
    video.addEventListener("ended", update);
    playButtons.forEach(function (button) {
      button.addEventListener("click", toggle);
    });
    muteButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        video.muted = !video.muted;
        update();
      });
    });
    fullButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var target = panel || video;
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (target.requestFullscreen) {
          target.requestFullscreen();
        }
      });
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) hlsInstance.destroy();
    });
    update();
  };
})();
