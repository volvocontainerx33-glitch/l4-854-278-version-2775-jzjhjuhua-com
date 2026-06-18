(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initHeroCarousel() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var backgrounds = Array.prototype.slice.call(root.querySelectorAll("[data-hero-bg]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      backgrounds.forEach(function (background, i) {
        background.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
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

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    if (slides.length > 1) {
      start();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initLocalFilters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]")).forEach(function (panel) {
      var target = document.querySelector(panel.getAttribute("data-target"));
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-filter-card]"));
      var input = panel.querySelector("[data-filter-input]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var clear = panel.querySelector("[data-clear-filter]");

      function apply() {
        var q = normalize(input && input.value);
        var t = normalize(type && type.value);
        var y = normalize(year && year.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var typeText = normalize(card.getAttribute("data-type"));
          var yearText = normalize(card.getAttribute("data-year"));
          var visible = true;
          if (q && text.indexOf(q) === -1) {
            visible = false;
          }
          if (t && typeText.indexOf(t) === -1) {
            visible = false;
          }
          if (y && yearText.indexOf(y) === -1) {
            visible = false;
          }
          card.classList.toggle("is-hidden-by-filter", !visible);
        });
      }

      [input, type, year].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });
      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (type) {
            type.value = "";
          }
          if (year) {
            year.value = "";
          }
          apply();
        });
      }
    });
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var input = page.querySelector("[data-search-input]");
    var type = page.querySelector("[data-search-type]");
    var year = page.querySelector("[data-search-year]");
    var clear = page.querySelector("[data-search-clear]");
    var results = page.querySelector("[data-search-results]");
    if (input) {
      input.value = params.get("q") || "";
    }

    function card(movie) {
      var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 4) : [];
      return [
        "<article class=\"movie-card\">",
        "<a class=\"movie-cover\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
        "<img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "<span class=\"movie-year\">" + escapeHtml(movie.year) + "</span>",
        "<span class=\"movie-play\">播放</span>",
        "</a>",
        "<div class=\"movie-body\">",
        "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
        "<p class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>",
        "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>",
        "<div class=\"tag-row\">" + tags.map(function (tag) { return "<span>" + escapeHtml(tag) + "</span>"; }).join("") + "</div>",
        "</div>",
        "</article>"
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;");
    }

    function render() {
      var q = normalize(input && input.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      var list = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var text = normalize(movie.search);
        var movieType = normalize(movie.type);
        var movieYear = normalize(movie.year);
        if (q && text.indexOf(q) === -1) {
          return false;
        }
        if (t && movieType.indexOf(t) === -1) {
          return false;
        }
        if (y && movieYear.indexOf(y) === -1) {
          return false;
        }
        return true;
      }).slice(0, 180);
      if (!list.length) {
        results.innerHTML = "<div class=\"content-card\"><h2>暂无匹配结果</h2><p>请尝试更换关键词、类型或年份。</p></div>";
        return;
      }
      results.innerHTML = list.map(card).join("");
    }

    [input, type, year].forEach(function (field) {
      if (field) {
        field.addEventListener("input", render);
        field.addEventListener("change", render);
      }
    });
    if (clear) {
      clear.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (year) {
          year.value = "";
        }
        render();
      });
    }
    render();
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");
      var source = player.getAttribute("data-video-url");
      if (!video || !button || !source) {
        return;
      }

      function hideOverlay() {
        button.classList.add("is-hidden");
      }

      function showOverlay() {
        if (video.paused) {
          button.classList.remove("is-hidden");
        }
      }

      function attach() {
        if (video.getAttribute("data-ready") === "true") {
          return Promise.resolve();
        }
        var nativeHls = video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
        if (nativeHls) {
          video.src = source;
          video.setAttribute("data-ready", "true");
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          return new Promise(function (resolve) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            video._hls = hls;
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
              hls.loadSource(source);
            });
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.setAttribute("data-ready", "true");
              resolve();
            });
            hls.on(window.Hls.Events.ERROR, function () {
              if (!video.src) {
                video.src = source;
                video.setAttribute("data-ready", "true");
                resolve();
              }
            });
          });
        }
        video.src = source;
        video.setAttribute("data-ready", "true");
        return Promise.resolve();
      }

      function play() {
        hideOverlay();
        attach().then(function () {
          var result = video.play();
          if (result && typeof result.catch === "function") {
            result.catch(showOverlay);
          }
        });
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
      video.addEventListener("play", hideOverlay);
      video.addEventListener("pause", showOverlay);
      video.addEventListener("ended", showOverlay);
    });
  }

  ready(function () {
    initNavigation();
    initHeroCarousel();
    initLocalFilters();
    initSearchPage();
    initPlayers();
  });
})();
