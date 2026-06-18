(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function initMenus() {
    var button = qs("[data-menu-toggle]");
    var menu = qs("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    qsa("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    prev && prev.addEventListener("click", function () {
      show(index - 1);
      start();
    });

    next && next.addEventListener("click", function () {
      show(index + 1);
      start();
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var scope = qs("[data-filter-scope]");
    if (!scope) {
      return;
    }
    var input = qs("[data-filter-input]", scope);
    var year = qs("[data-filter-year]", scope);
    var type = qs("[data-filter-type]", scope);
    var cards = qsa("[data-movie-card]");

    function apply() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.genre
        ].join(" "));
        var matched = (!q || text.indexOf(q) !== -1) && (!y || normalize(card.dataset.year) === y) && (!t || normalize(card.dataset.type) === t);
        card.style.display = matched ? "" : "none";
      });
    }

    [input, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function renderSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHTML(movie.file) + '" aria-label="观看' + escapeHTML(movie.title) + '">',
      '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '海报" loading="lazy">',
      '<span class="score-badge">' + escapeHTML(movie.score) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="' + escapeHTML(movie.file) + '">' + escapeHTML(movie.title) + '</a></h3>',
      '<p class="movie-meta">' + escapeHTML(movie.year) + ' · ' + escapeHTML(movie.region) + ' · ' + escapeHTML(movie.type) + '</p>',
      '<p class="movie-desc">' + escapeHTML(movie.oneLine) + '</p>',
      '<div class="tag-row"><span>' + escapeHTML(movie.category) + '</span><span>' + escapeHTML(movie.genre) + '</span></div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var box = qs("#searchResults");
    if (!box || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var form = qs("[data-search-page-form]");
    var input = form && qs('input[name="q"]', form);
    var status = qs("[data-search-status]");
    var q = getParam("q").trim();

    if (input) {
      input.value = q;
    }

    function render(query) {
      var term = normalize(query);
      if (!term) {
        status.textContent = "热门推荐";
        box.innerHTML = window.MOVIE_SEARCH_INDEX.slice(0, 60).map(renderSearchCard).join("");
        return;
      }
      var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.category,
          movie.oneLine
        ].join(" ")).indexOf(term) !== -1;
      }).slice(0, 240);
      status.textContent = results.length ? "搜索结果" : "暂无匹配影片";
      box.innerHTML = results.map(renderSearchCard).join("");
    }

    form && form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input ? input.value.trim() : "";
      var url = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
      window.history.replaceState({}, "", url);
      render(value);
    });

    render(q);
  }

  window.initStaticMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var source = config.source;
    var prepared = false;
    var preparing = null;
    var hls = null;

    if (!video || !overlay || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }
      if (preparing) {
        return preparing;
      }
      preparing = new Promise(function (resolve) {
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          resolve();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function () {
            resolve();
          });
          return;
        }
        video.src = source;
        resolve();
      });
      return preparing;
    }

    function play() {
      overlay.classList.add("is-hidden");
      prepare().then(function () {
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      });
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    prepare();
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenus();
    initSearchForms();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
