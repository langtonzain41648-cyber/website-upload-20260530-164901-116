(function () {
  function loadLibrary(done) {
    if (window.Hls) {
      done();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', done, { once: true });
      existing.addEventListener('error', done, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', '1');
    script.addEventListener('load', done, { once: true });
    script.addEventListener('error', done, { once: true });
    document.head.appendChild(script);
  }

  function playVideo(video) {
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  window.initPlayback = function (streamUrl) {
    var video = document.getElementById('movie-video');
    var trigger = document.getElementById('play-trigger');
    var started = false;

    function start() {
      if (!video || started) {
        if (video) {
          playVideo(video);
        }
        return;
      }

      started = true;
      if (trigger) {
        trigger.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        playVideo(video);
        return;
      }

      loadLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo(video);
          });
        } else {
          video.src = streamUrl;
          playVideo(video);
        }
      });
    }

    if (trigger) {
      trigger.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }
  };
})();
