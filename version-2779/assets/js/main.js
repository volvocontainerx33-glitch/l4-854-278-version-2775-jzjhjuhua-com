(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.visibility = "hidden";
      }, { once: true });
    });

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./all.html";
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function startTimer() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(index - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
          startTimer();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }

    var catalog = document.querySelector("[data-card-grid]");
    if (catalog) {
      var cards = Array.prototype.slice.call(catalog.querySelectorAll("[data-filter-card]"));
      var search = document.getElementById("catalog-search");
      var type = document.getElementById("filter-type");
      var region = document.getElementById("filter-region");
      var year = document.getElementById("filter-year");
      var reset = document.getElementById("filter-reset");
      var empty = document.querySelector("[data-empty-state]");
      var count = document.querySelector("[data-result-count]");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";

      if (search && q) {
        search.value = q;
      }

      function inYearRange(value, range) {
        var yearValue = parseInt(String(value).match(/\d{4}/), 10);
        if (!range) {
          return true;
        }
        if (!yearValue) {
          return false;
        }
        if (range === "2025") {
          return yearValue >= 2025;
        }
        if (range === "2020") {
          return yearValue >= 2020 && yearValue <= 2024;
        }
        if (range === "2010") {
          return yearValue >= 2010 && yearValue <= 2019;
        }
        if (range === "old") {
          return yearValue < 2010;
        }
        return true;
      }

      function applyFilters() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        var selectedType = type ? type.value : "";
        var selectedRegion = region ? region.value : "";
        var selectedYear = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardType = card.getAttribute("data-type-group") || "";
          var cardRegion = card.getAttribute("data-region-group") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedType && cardType !== selectedType) {
            matched = false;
          }
          if (selectedRegion && cardRegion !== selectedRegion) {
            matched = false;
          }
          if (!inYearRange(cardYear, selectedYear)) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "找到 " + visible + " 部影片";
        }
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, type, region, year].forEach(function (element) {
        if (element) {
          element.addEventListener("input", applyFilters);
          element.addEventListener("change", applyFilters);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }
          if (type) {
            type.value = "";
          }
          if (region) {
            region.value = "";
          }
          if (year) {
            year.value = "";
          }
          applyFilters();
        });
      }

      applyFilters();
    }

    var player = document.querySelector("[data-player]");
    if (player) {
      var layer = document.querySelector("[data-play-button]");
      var stream = player.getAttribute("data-stream");
      var started = false;
      var hls = null;

      function bindStream() {
        if (!stream || started) {
          return;
        }
        started = true;

        if (player.canPlayType("application/vnd.apple.mpegurl")) {
          player.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(player);
        } else {
          player.src = stream;
        }

        player.controls = true;
        if (layer) {
          layer.classList.add("is-hidden");
        }

        var promise = player.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (layer) {
        layer.addEventListener("click", bindStream);
      }

      player.addEventListener("click", function () {
        if (!started) {
          bindStream();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  });
})();
