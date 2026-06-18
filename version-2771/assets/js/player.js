import { H as Hls } from "./hls-vendor-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".stream-video").forEach(function (video) {
    var frame = video.closest(".player-frame");
    var button = frame ? frame.querySelector("[data-play-button]") : null;
    var status = frame ? frame.querySelector("[data-player-status]") : null;
    var hlsInstance = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function attachSource() {
      var source = video.dataset.src;

      if (!source) {
        setStatus("未找到播放源");
        return Promise.reject(new Error("missing source"));
      }

      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;
      setStatus("正在加载播放源…");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("");
        return Promise.resolve();
      }

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          setStatus("");
        });

        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus("网络加载异常，正在重试…");
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus("媒体解码异常，正在恢复…");
            hlsInstance.recoverMediaError();
          } else {
            setStatus("当前浏览器无法播放该视频");
            hlsInstance.destroy();
          }
        });

        return Promise.resolve();
      }

      setStatus("当前浏览器不支持 HLS 播放");
      return Promise.reject(new Error("hls not supported"));
    }

    function playVideo() {
      attachSource()
        .then(function () {
          if (button) {
            button.classList.add("is-hidden");
          }
          return video.play();
        })
        .catch(function () {
          setStatus("请再次点击播放器开始播放");
        });
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 && button) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
