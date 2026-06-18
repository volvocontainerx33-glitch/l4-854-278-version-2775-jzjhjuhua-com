import { H as Hls } from './hls.js';

var video = document.querySelector('[data-player-video]');
var playButton = document.querySelector('[data-play-button]');
var playCover = document.querySelector('[data-play-cover]');
var hlsInstance = null;

function showError(message) {
  if (playCover) {
    playCover.classList.remove('is-hidden');
    playCover.innerHTML = '<p>' + message + '</p>';
  }
}

function attachSource() {
  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  if (!source) {
    showError('当前影片暂未配置播放源。');
    return;
  }

  if (hlsInstance) {
    return;
  }

  if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play().catch(function () {
        if (playCover) {
          playCover.classList.remove('is-hidden');
        }
      });
    });

    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hlsInstance.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hlsInstance.recoverMediaError();
      } else {
        hlsInstance.destroy();
        hlsInstance = null;
        showError('播放器加载失败，请稍后重试。');
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.play().catch(function () {
      if (playCover) {
        playCover.classList.remove('is-hidden');
      }
    });
  } else {
    showError('当前浏览器不支持 HLS 播放，请更换现代浏览器。');
  }
}

if (playButton) {
  playButton.addEventListener('click', function () {
    if (playCover) {
      playCover.classList.add('is-hidden');
    }
    attachSource();
  });
}

if (video) {
  video.addEventListener('play', function () {
    if (playCover) {
      playCover.classList.add('is-hidden');
    }
  });
}
