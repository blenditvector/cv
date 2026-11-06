/* If you are prying, I see you. Let's talk: coatesc92@gmail.com | 876-532-9622 */
/* O'shane Coates — portfolio interactions */
(function () {
  "use strict";
  console.log("If you are prying, I see you. Let's talk: coatesc92@gmail.com | 876-532-9622");

  document.documentElement.classList.remove("no-js");

  // Header: solid background once the page scrolls
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Reveal on scroll
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Highlight the nav link for the section in view
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  if (navLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + e.target.id));
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (a) {
      var target = document.querySelector(a.getAttribute("href"));
      if (target) spy.observe(target);
    });
  }

  // Lightbox for gallery tiles
  var tiles = Array.prototype.slice.call(document.querySelectorAll("[data-gallery] .tile"));
  if (tiles.length) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Image viewer");
    box.innerHTML =
      '<img alt="">' +
      '<p class="lightbox-caption"></p>' +
      '<button class="lb-close" aria-label="Close"><svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" stroke-width="1.8"><path d="M2 2l14 14M16 2L2 16"/></svg></button>' +
      '<button class="lb-prev" aria-label="Previous"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L5 9l7 7"/></svg></button>' +
      '<button class="lb-next" aria-label="Next"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2l7 7-7 7"/></svg></button>';
    document.body.appendChild(box);

    var boxImg = box.querySelector("img");
    var boxCap = box.querySelector(".lightbox-caption");
    var current = 0;
    var lastFocus = null;

    function show(i) {
      current = (i + tiles.length) % tiles.length;
      var img = tiles[current].querySelector("img");
      var cap = tiles[current].querySelector("figcaption");
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt;
      boxCap.textContent = cap ? cap.textContent.replace(/\s+/g, " ").trim() : "";
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
      box.querySelector(".lb-close").focus();
    }
    function close() {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    tiles.forEach(function (tile, i) {
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("role", "button");
      tile.addEventListener("click", function () { open(i); });
      tile.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });

    box.querySelector(".lb-close").addEventListener("click", close);
    box.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    box.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
