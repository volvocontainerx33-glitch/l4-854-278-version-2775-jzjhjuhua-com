import { H as Hls } from "./hls-player.js";

const ready = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
};

ready(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = [...hero.querySelectorAll("[data-hero-slide]")];
    const tabs = [...hero.querySelectorAll("[data-hero-tab]")];
    let index = 0;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) =>
        slide.classList.toggle("is-active", i === index),
      );
      tabs.forEach((tab, i) => tab.classList.toggle("active", i === index));
    };
    tabs.forEach((tab) => {
      tab.addEventListener("click", () =>
        show(Number(tab.getAttribute("data-hero-tab")) || 0),
      );
    });
    if (slides.length > 1) {
      window.setInterval(() => show(index + 1), 5200);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const input = document.querySelector("[data-search-input]");
  const clear = document.querySelector("[data-search-clear]");
  const list = document.querySelector("[data-search-list]");
  if (input && list) {
    const cards = [...list.querySelectorAll(".movie-card")];
    const apply = () => {
      const keyword = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.textContent,
        ]
          .join(" ")
          .toLowerCase();
        card.hidden = Boolean(keyword) && !haystack.includes(keyword);
      });
    };
    const q = params.get("q");
    if (q) {
      input.value = q;
    }
    input.addEventListener("input", apply);
    if (clear) {
      clear.addEventListener("click", () => {
        input.value = "";
        apply();
        input.focus();
      });
    }
    apply();
  }

  const video = document.getElementById("moviePlayer");
  const playButton = document.querySelector("[data-play-button]");
  const frame = document.querySelector("[data-player-frame]");
  if (video && playButton) {
    let hls = null;
    const bind = () => {
      const url = playButton.getAttribute("data-play-url");
      if (!url) {
        return;
      }
      if (video.getAttribute("data-active-url") === url) {
        return;
      }
      if (hls) {
        hls.destroy();
        hls = null;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      video.setAttribute("data-active-url", url);
    };
    const play = () => {
      bind();
      playButton.classList.add("hide");
      video.play().catch(() => {
        playButton.classList.remove("hide");
      });
    };
    playButton.addEventListener("click", play);
    if (frame) {
      frame.addEventListener("click", (event) => {
        if (event.target === video) {
          bind();
        }
      });
    }
    video.addEventListener("play", () => playButton.classList.add("hide"));
    video.addEventListener("pause", () => {
      if (!video.currentTime) {
        playButton.classList.remove("hide");
      }
    });
  }
});
