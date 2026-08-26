// LS Logistic Services : site behaviour (no build step, no dependencies)

document.addEventListener("DOMContentLoaded", function () {
  initMobileNav();
  initMegaMenuKeyboard();
  initScrollReveal();
  initFaq();
  initQuoteForm();
});

/* ---------------------------- Mobile nav ---------------------------- */

function initMobileNav() {
  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (!toggle || !panel) return;

  toggle.addEventListener("click", function () {
    var isOpen = panel.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  var subToggle = panel.querySelector("[data-mobile-sub-toggle]");
  var sub = panel.querySelector("[data-mobile-sub]");
  if (subToggle && sub) {
    subToggle.addEventListener("click", function () {
      var isOpen = sub.classList.toggle("is-open");
      subToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }
}

/* ---------------------------- Mega menu (keyboard + touch) ---------------------------- */

function initMegaMenuKeyboard() {
  var trigger = document.querySelector("[data-mega-trigger]");
  var mega = document.querySelector("[data-mega]");
  if (!trigger || !mega) return;

  function open() {
    mega.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  }
  function close() {
    mega.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", function (e) {
    e.preventDefault();
    if (mega.classList.contains("is-open")) {
      close();
    } else {
      open();
    }
  });

  document.addEventListener("click", function (e) {
    if (!trigger.contains(e.target) && !mega.contains(e.target)) {
      close();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
}

/* ---------------------------- Scroll reveal ---------------------------- */

function initScrollReveal() {
  var items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute("data-reveal-delay") || 0;
          setTimeout(function () {
            entry.target.classList.add("is-visible");
          }, Number(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  items.forEach(function (el) {
    observer.observe(el);
  });
}

/* ---------------------------- FAQ accordion ---------------------------- */

function initFaq() {
  var items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;

    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      items.forEach(function (other) {
        other.classList.remove("is-open");
        var otherA = other.querySelector(".faq-a");
        if (otherA) otherA.style.maxHeight = null;
        var otherQ = other.querySelector(".faq-q");
        if (otherQ) otherQ.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ---------------------------- Quote form ---------------------------- */

function initQuoteForm() {
  var form = document.querySelector("[data-quote-form]");
  if (!form) return;

  // Pre-fill the service select from ?service=slug when arriving from a service page.
  var params = new URLSearchParams(window.location.search);
  var serviceParam = params.get("service");
  var serviceSelect = form.querySelector("#service");
  if (serviceParam && serviceSelect) {
    var option = serviceSelect.querySelector('option[value="' + serviceParam + '"]');
    if (option) {
      serviceSelect.value = serviceParam;
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var isValid = true;
    var requiredFields = form.querySelectorAll("[required]");

    requiredFields.forEach(function (field) {
      var wrapper = field.closest(".field");
      var valid = field.type === "checkbox" ? field.checked : field.value.trim() !== "";

      if (field.type === "email" && valid) {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      }

      if (wrapper) {
        wrapper.classList.toggle("has-error", !valid);
      }
      if (!valid) isValid = false;
    });

    if (!isValid) {
      var firstError = form.querySelector(".has-error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // NOTE: this is a static HTML site with no backend yet. Wire this form
    // to a real endpoint (Formspree, Netlify Forms, or a mail script) before
    // going live: swap this block for a real fetch()/POST to that endpoint.
    var successEl = document.querySelector("[data-quote-success]");
    var cardEl = document.querySelector("[data-quote-card]");
    if (successEl && cardEl) {
      cardEl.style.display = "none";
      successEl.classList.add("is-visible");
      successEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  form.querySelectorAll("[required]").forEach(function (field) {
    field.addEventListener("input", function () {
      var wrapper = field.closest(".field");
      if (wrapper) wrapper.classList.remove("has-error");
    });
  });
}
