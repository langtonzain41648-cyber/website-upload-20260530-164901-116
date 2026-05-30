(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var next = $('[data-hero-next]', hero);
    var prev = $('[data-hero-prev]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
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
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    $all('[data-filter-panel]').forEach(function (panel) {
      var input = $('[data-filter-input]', panel);
      var year = $('[data-filter-year]', panel);
      var region = $('[data-filter-region]', panel);
      var status = $('[data-filter-status]', panel);
      var container = panel.parentElement;
      var cards = $all('[data-movie-card]', container);

      function apply() {
        var keyword = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedRegion = normalize(region && region.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-category'),
            card.getAttribute('data-keywords')
          ].join(' '));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }
          if (selectedRegion && cardRegion !== selectedRegion) {
            matched = false;
          }
          card.classList.toggle('hidden-by-filter', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (status) {
          status.textContent = visible ? '筛选结果已更新' : '暂无匹配内容';
        }
      }

      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  var hlsLoaderPromise = null;

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoaderPromise) {
      return hlsLoaderPromise;
    }
    hlsLoaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('hls-load-error'));
      };
      document.head.appendChild(script);
    });
    return hlsLoaderPromise;
  }

  function setupPlayer(player) {
    var video = $('video[data-src]', player);
    var button = $('.player-button', player);
    var overlay = $('.player-overlay', player);
    var status = $('.player-status', player);
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    var attached = false;
    var hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function attachSource() {
      if (attached || !source) {
        return Promise.resolve();
      }
      attached = true;
      setStatus('加载中...');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('点击播放');
        return Promise.resolve();
      }
      return loadHlsScript().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus('点击播放');
          });
          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络连接异常');
              hlsInstance.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体恢复中');
              hlsInstance.recoverMediaError();
            } else {
              setStatus('播放暂不可用');
              hlsInstance.destroy();
            }
          });
        } else {
          setStatus('当前浏览器暂不支持播放');
        }
      }).catch(function () {
        setStatus('播放组件加载失败');
      });
    }

    function playVideo() {
      attachSource().then(function () {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            setStatus('点击播放');
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
      setStatus('再次播放');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function setupPlayers() {
    $all('[data-player]').forEach(setupPlayer);
  }

  function setupImages() {
    $all('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    setupImages();
  });
}());
