(function () {
  "use strict";

  var cfg = window.FUNNEL_CONFIG || {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Price labels: one source of truth in config.js ---- */
  if (cfg.PRICE) {
    document.querySelectorAll("[data-price]").forEach(function (el) { el.textContent = cfg.PRICE; });
  }
  if (cfg.PRICE_NOTE) {
    document.querySelectorAll("[data-price-note]").forEach(function (el) { el.textContent = cfg.PRICE_NOTE; });
  }
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- Checkout buttons: every CTA goes to the same CHECKOUT_URL ---- */
  var checkoutUrl = (cfg.CHECKOUT_URL || "").trim();
  var priceValue = parseFloat(String(cfg.PRICE || "").replace(/[^0-9.]/g, "")) || undefined;

  document.querySelectorAll("[data-checkout]").forEach(function (link) {
    if (checkoutUrl) link.setAttribute("href", checkoutUrl);
    link.addEventListener("click", function () {
      if (typeof window.fbq === "function") {
        window.fbq("track", "InitiateCheckout", { value: priceValue, currency: "INR", content_name: "Parenting Guide to Academic Excellence" });
      }
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: "begin_checkout", value: priceValue, currency: "INR" });
      }
    });
  });

  if (!checkoutUrl && window.console) {
    console.info("[funnel] CHECKOUT_URL is empty in js/config.js; buy buttons scroll to the offer section until it is set.");
  }

  /* ---- Header shadow on scroll ---- */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile sticky buy bar: show after hero CTA, hide over the closing CTA ---- */
  var bar = document.getElementById("buy-bar");
  var heroBuy = document.getElementById("hero-buy");
  if (bar && heroBuy && "IntersectionObserver" in window) {
    var heroGone = false;
    var visibleCtas = new Set();
    var barLink = bar.querySelector("a");
    function update() {
      // Show only once the hero CTA has scrolled away, and never while an in-page buy button is on screen
      var show = heroGone && visibleCtas.size === 0;
      bar.classList.toggle("is-visible", show);
      bar.setAttribute("aria-hidden", show ? "false" : "true");
      if (barLink) barLink.tabIndex = show ? 0 : -1;
      document.body.classList.toggle("has-buy-bar", show);
    }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { heroGone = !e.isIntersecting && e.boundingClientRect.top < 0; });
      update();
    }).observe(heroBuy);
    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visibleCtas.add(e.target); else visibleCtas.delete(e.target);
      });
      update();
    });
    document.querySelectorAll("main .btn--accent[data-checkout]").forEach(function (b) { ctaObserver.observe(b); });
  }

  /* ---- Gentle reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (el.classList.contains("learn-item") || el.classList.contains("who-card")) ? (i % 3) * 70 + "ms" : "0ms";
      io.observe(el);
    });
  }

  /* ---- FAQ: one answer open at a time ---- */
  var faqs = document.querySelectorAll(".faq__item");
  faqs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
