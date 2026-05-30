(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

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
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  });

  document.querySelectorAll('[data-filter-input]').forEach(function (input) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        card.style.display = text.indexOf(query) > -1 ? '' : 'none';
      });
    });
  });

  document.querySelectorAll('[data-player-wrap]').forEach(function (wrap) {
    var video = wrap.querySelector('[data-player]');
    var panel = wrap.closest('.player-panel') || wrap;
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-player-trigger]'));
    if (!video || !buttons.length) {
      return;
    }

    function loadVideo(autoplay) {
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      if (video.getAttribute('data-ready') !== 'true') {
        if (stream.indexOf('.m3u8') > -1 && window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.hlsPlayer = hls;
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (autoplay) {
              video.play().catch(function () {});
            }
          });
        } else {
          video.src = stream;
          if (autoplay) {
            video.play().catch(function () {});
          }
        }
        video.setAttribute('data-ready', 'true');
      } else if (autoplay) {
        video.play().catch(function () {});
      }
      video.controls = true;
      wrap.classList.add('is-playing');
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        loadVideo(true);
      });
    });

    video.addEventListener('play', function () {
      wrap.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0) {
        wrap.classList.remove('is-playing');
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        loadVideo(true);
      }
    });
  });
})();
