/* Vocer / 句练 — site interactions
   Progressive enhancement only: every page reads fine without this file. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---- theme toggle --------------------------------------------------- */

  $$("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      var current = root.getAttribute("data-theme") || system;
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("vocer-theme", next); } catch (e) {}
      btn.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
    });
  });

  /* ---- scroll state + progress ---------------------------------------- */

  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty("--scroll-progress", max > 0 ? Math.min(1, y / max).toFixed(4) : "0");
    root.classList.toggle("is-scrolled", y > 12);
    root.classList.toggle("is-deep", y > window.innerHeight * 0.7);
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---- reveal on scroll ------------------------------------------------ */

  var revealables = $$("[data-reveal]");
  if (!("IntersectionObserver" in window) || reduce) {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ---- mobile nav ------------------------------------------------------ */

  $$("[data-nav-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = root.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  document.addEventListener("click", function (e) {
    if (!root.classList.contains("nav-open")) return;
    if (e.target.closest("[data-nav-toggle]")) return;
    if (e.target.closest(".nav") && !e.target.closest(".nav a")) return;
    root.classList.remove("nav-open");
    $$("[data-nav-toggle]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("nav-open")) {
      root.classList.remove("nav-open");
      $$("[data-nav-toggle]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    }
  });

  /* ---- pointer spotlight ----------------------------------------------- */

  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$("[data-spot]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---- hero tilt -------------------------------------------------------- */

  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$("[data-tilt]").forEach(function (stage) {
      var target = $(".shot-stack", stage) || stage;
      stage.addEventListener("pointermove", function (e) {
        var r = stage.getBoundingClientRect();
        target.style.setProperty("--rx", (((e.clientX - r.left) / r.width) - 0.5).toFixed(3));
        target.style.setProperty("--ry", (((e.clientY - r.top) / r.height) - 0.5).toFixed(3));
      });
      stage.addEventListener("pointerleave", function () {
        target.style.setProperty("--rx", "0");
        target.style.setProperty("--ry", "0");
      });
    });
  }

  /* ---- A/B waveform ----------------------------------------------------- */

  function buildWave(node) {
    var width = node.clientWidth || 640;
    var count = Math.max(30, Math.min(130, Math.round(width / 6)));
    var a = parseFloat(node.getAttribute("data-a") || "34");
    var b = parseFloat(node.getAttribute("data-b") || "62");
    var html = "";
    for (var i = 0; i < count; i++) {
      var t = i / (count - 1);
      /* deterministic, speech-like envelope */
      var envelope = 0.42 + 0.32 * Math.sin(t * Math.PI * 2.2) + 0.18 * Math.sin(t * Math.PI * 7.1 + 1.2);
      var detail = 0.26 * Math.sin(i * 2.399963 + 0.7) + 0.16 * Math.sin(i * 1.117 + 2.3);
      var h = Math.max(0.12, Math.min(1, Math.abs(envelope + detail)));
      var pct = t * 100;
      var cls = pct >= a && pct <= b ? ' class="in-loop"' : "";
      html += "<i" + cls + ' style="--h:' + h.toFixed(3) + ";--d:" + (i * 0.021).toFixed(3) + 's"></i>';
    }
    node.innerHTML = html;
  }

  var waves = $$("[data-wave]");
  waves.forEach(buildWave);

  if (waves.length) {
    var waveTimer;
    window.addEventListener("resize", function () {
      clearTimeout(waveTimer);
      waveTimer = setTimeout(function () { waves.forEach(buildWave); }, 220);
    });
  }

  /* ---- FAQ accordion ---------------------------------------------------- */

  $$(".faq-item").forEach(function (item) {
    var summary = $("summary", item);
    var body = $(".faq-item__body", item);
    var inner = $(".faq-item__inner", item);
    if (!summary || !body || !inner) return;
    var anim = null;

    summary.addEventListener("click", function (e) {
      if (reduce) return;
      e.preventDefault();
      if (anim) { anim.cancel(); anim = null; }

      if (!item.open) {
        item.open = true;
        var target = inner.offsetHeight;
        anim = body.animate(
          [{ height: "0px", opacity: 0 }, { height: target + "px", opacity: 1 }],
          { duration: 380, easing: EASE }
        );
        anim.onfinish = function () { body.style.height = ""; anim = null; };
      } else {
        var from = body.offsetHeight;
        anim = body.animate(
          [{ height: from + "px", opacity: 1 }, { height: "0px", opacity: 0 }],
          { duration: 300, easing: EASE }
        );
        anim.onfinish = function () { item.open = false; body.style.height = ""; anim = null; };
      }
    });
  });

  /* ---- section highlighting (nav + TOC) --------------------------------- */

  function linkSpy(links, listEl) {
    var map = {};
    var targets = [];
    links.forEach(function (link) {
      var id = (link.getAttribute("href") || "").split("#")[1];
      if (!id) return;
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = link;
      targets.push(section);
    });
    if (!targets.length) return;

    function activate(link) {
      links.forEach(function (l) { l.classList.remove("is-active"); });
      link.classList.add("is-active");
      if (listEl) {
        listEl.classList.add("is-ready");
        listEl.style.setProperty("--toc-y", link.offsetTop + "px");
        listEl.style.setProperty("--toc-h", link.offsetHeight + "px");
      }
    }

    if (!("IntersectionObserver" in window)) return;

    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      var bestId = null;
      var best = 0;
      targets.forEach(function (t) {
        var score = visible[t.id] || 0;
        if (score > best) { best = score; bestId = t.id; }
      });
      if (!bestId) {
        /* fall back to the last section scrolled past */
        var y = window.scrollY + window.innerHeight * 0.32;
        targets.forEach(function (t) {
          if (t.getBoundingClientRect().top + window.scrollY <= y) bestId = t.id;
        });
      }
      if (bestId && map[bestId]) activate(map[bestId]);
    }, {
      rootMargin: "-12% 0px -55% 0px",
      threshold: [0, 0.15, 0.35, 0.6, 0.9]
    });

    targets.forEach(function (t) { spy.observe(t); });
  }

  $$("[data-spy]").forEach(function (container) {
    var links = $$("a[href*='#']", container);
    linkSpy(links, container.classList.contains("toc__list") ? container : null);
  });

  /* ---- copy to clipboard ------------------------------------------------ */

  $$("[data-copy]").forEach(function (btn) {
    var label = $(".copy-label", btn);
    var original = label ? label.textContent : "";
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        btn.classList.add("is-done");
        if (label) label.textContent = btn.getAttribute("data-copied") || "Copied";
        setTimeout(function () {
          btn.classList.remove("is-done");
          if (label) label.textContent = original;
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (err) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ---- back to top ------------------------------------------------------ */

  $$("[data-to-top]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  });
})();
