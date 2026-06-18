// Shared static-site interactions: mobile navigation, hero carousel, filters and image fallbacks.
(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.poster-media img').forEach(function (image) {
    image.addEventListener('error', function () {
      var holder = image.closest('.poster-media');
      if (holder) {
        holder.classList.add('is-fallback');
      }
      image.remove();
    });
  });

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (slides.length > 1) {
      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          startTimer();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          startTimer();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
          startTimer();
        });
      });
      slider.addEventListener('mouseenter', stopTimer);
      slider.addEventListener('mouseleave', startTimer);
      startTimer();
    }
  }

  var filterContainer = document.querySelector('[data-filter-container]');
  if (filterContainer) {
    var cards = Array.prototype.slice.call(filterContainer.querySelectorAll('[data-movie-card]'));
    var keywordInput = document.querySelector('[data-filter-keyword]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var genreSelect = document.querySelector('[data-filter-genre]');
    var result = document.querySelector('[data-filter-result]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute('data-title'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardGenre = normalize(card.getAttribute('data-genre'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardTags = normalize(card.getAttribute('data-tags'));
        var haystack = [title, cardRegion, cardType, cardGenre, cardYear, cardTags].join(' ');
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (genre && cardGenre.indexOf(genre) === -1) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [keywordInput, regionSelect, typeSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
