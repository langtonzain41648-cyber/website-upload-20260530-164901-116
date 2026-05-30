(function () {
  function onReady(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function mount(shell) {
    var url = shell.getAttribute('data-video');
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var started = false;
    var hls = null;

    if (!url || !video || !cover) {
      return;
    }

    function bindSource() {
      if (started) {
        return;
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      bindSource();
      cover.classList.add('is-hidden');
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  onReady(function () {
    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(mount);
  });
})();
