async function loadHlsClass() {
  try {
    const module = await import('./hls-vendor-dru42stk.js');
    return module.H || module.default || null;
  } catch (error) {
    console.warn('HLS module could not be loaded:', error);
    return null;
  }
}

function isHlsSource(source) {
  return /\.m3u8(\?|#|$)/i.test(source || '');
}

function setStatus(video, message) {
  video.dataset.playerStatus = message;
}

async function preparePlayer(video) {
  const source = video.dataset.src;

  if (!source) {
    setStatus(video, 'missing-source');
    return;
  }

  if (!isHlsSource(source)) {
    video.src = source;
    setStatus(video, 'mp4-ready');
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    setStatus(video, 'native-hls-ready');
    return;
  }

  const Hls = await loadHlsClass();

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(video, 'hls-ready');
    });

    hls.on(Hls.Events.ERROR, function (_, data) {
      if (data && data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          video.src = source;
        }
      }
    });

    video._hlsInstance = hls;
    return;
  }

  video.src = source;
  setStatus(video, 'fallback-source');
}

function bindPlayButton(video) {
  const shell = video.closest('.video-shell');
  const trigger = shell ? shell.querySelector('[data-play-trigger]') : null;

  if (!trigger) {
    return;
  }

  trigger.addEventListener('click', async function () {
    trigger.classList.add('is-hidden');

    if (!video.src && !video._hlsInstance) {
      await preparePlayer(video);
    }

    try {
      await video.play();
    } catch (error) {
      trigger.classList.remove('is-hidden');
      console.warn('Video playback was blocked or failed:', error);
    }
  });

  video.addEventListener('play', function () {
    trigger.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      trigger.classList.remove('is-hidden');
    }
  });
}

document.querySelectorAll('.js-player').forEach(function (video) {
  preparePlayer(video);
  bindPlayButton(video);
});
