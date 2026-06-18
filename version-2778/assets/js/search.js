// Search page renderer. The full data is also present across static HTML detail and catalogue pages.
(function () {
  var data = window.MOVIE_DATA || [];
  var formInput = document.querySelector('[data-search-input]');
  var resultsContainer = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');

  if (!resultsContainer || !summary) {
    return;
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function posterNumber(movie) {
    return ((Number(movie.index) - 1) % 150) + 1;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function clip(value, length) {
    value = String(value || '');
    return value.length > length ? value.slice(0, length) + '…' : value;
  }

  function renderCard(movie) {
    var genres = (movie.genres || []).slice(0, 3).map(function (genre) {
      return '<span>' + escapeHtml(genre) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster-media" href="detail/' + escapeHtml(movie.id) + '.html" data-poster-label="' + escapeHtml(movie.title) + '">' +
        '<img src="' + posterNumber(movie) + '.jpg" alt="' + escapeHtml(movie.title) + ' 海报" class="poster-img" loading="lazy">' +
        '<span class="quality-badge">HD</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
        '<div class="card-kicker">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</div>' +
        '<h3><a href="detail/' + escapeHtml(movie.id) + '.html">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(clip(movie.oneLine, 72)) + '</p>' +
        '<div class="tag-row">' + genres + '</div>' +
      '</div>' +
    '</article>';
  }

  function runSearch() {
    var query = getQuery();
    if (formInput) {
      formInput.value = query;
    }

    if (!query) {
      summary.textContent = '请输入关键词开始搜索。';
      resultsContainer.innerHTML = '';
      return;
    }

    var normalized = normalize(query);
    var matches = data.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genreRaw,
        (movie.genres || []).join(','),
        (movie.tags || []).join(','),
        movie.oneLine,
        movie.summary
      ].map(normalize).join(' ');
      return haystack.indexOf(normalized) !== -1;
    }).slice(0, 120);

    summary.textContent = '“' + query + '” 找到 ' + matches.length + ' 条结果，最多展示前 120 条。';
    resultsContainer.innerHTML = matches.map(renderCard).join('');
    resultsContainer.querySelectorAll('.poster-media img').forEach(function (image) {
      image.addEventListener('error', function () {
        var holder = image.closest('.poster-media');
        if (holder) {
          holder.classList.add('is-fallback');
        }
        image.remove();
      });
    });
  }

  runSearch();
})();
