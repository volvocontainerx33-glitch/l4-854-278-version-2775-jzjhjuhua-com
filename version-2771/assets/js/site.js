document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.from(hero.querySelectorAll(".hero-slide"));
    var dots = Array.from(hero.querySelectorAll(".hero-dots button"));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    hero.querySelectorAll("[data-hero-prev]").forEach(function (button) {
      button.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    });

    hero.querySelectorAll("[data-hero-next]").forEach(function (button) {
      button.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-scroll-row]").forEach(function (row) {
    var section = row.closest("section");
    if (!section) {
      return;
    }

    section.querySelectorAll("[data-scroll]").forEach(function (button) {
      button.addEventListener("click", function () {
        var direction = button.getAttribute("data-scroll") === "left" ? -1 : 1;
        row.scrollBy({
          left: direction * 320,
          behavior: "smooth"
        });
      });
    });
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var area = panel.nextElementSibling;
    var cards = area ? Array.from(area.querySelectorAll(".filter-card")) : [];
    var searchInput = panel.querySelector("[data-filter-search]");
    var categorySelect = panel.querySelector("[data-filter-category]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var countNode = panel.querySelector("[data-filter-count]");
    var resetButton = panel.querySelector("[data-filter-reset]");
    var params = new URLSearchParams(window.location.search);

    if (searchInput && params.get("q")) {
      searchInput.value = params.get("q");
    }

    function text(value) {
      return String(value || "").toLowerCase();
    }

    function apply() {
      var query = text(searchInput && searchInput.value);
      var category = categorySelect ? categorySelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = text([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));

        var matched = true;
        matched = matched && (!query || haystack.indexOf(query) !== -1);
        matched = matched && (!category || card.dataset.category === category);
        matched = matched && (!region || card.dataset.region === region);
        matched = matched && (!type || card.dataset.type === type);
        matched = matched && (!year || card.dataset.year === year);

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = "当前显示 " + visible + " / " + cards.length + " 部";
      }

      var empty = area ? area.parentElement.querySelector(".empty-state") : null;
      if (empty) {
        empty.style.display = visible === 0 ? "block" : "none";
      }
    }

    [searchInput, categorySelect, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        [searchInput, categorySelect, regionSelect, typeSelect, yearSelect].forEach(function (control) {
          if (control) {
            control.value = "";
          }
        });
        apply();
      });
    }

    apply();
  });
});
