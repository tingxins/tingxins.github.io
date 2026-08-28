(() => {
  "use strict";

  const products = Object.freeze([
    Object.freeze({
      id: "moss",
      number: "01",
      name: "Moss Plus",
      domain: { zh: "智能", en: "Intelligence" },
      tagline: { zh: "把想法变成可用的答案。", en: "Turn a thought into a useful answer." },
      description: {
        zh: "一个轻盈的 AI 助手，帮助你生成内容、回答问题、翻译文本与编写代码。",
        en: "A focused AI assistant for writing, questions, translation, and code."
      },
      proof: {
        zh: ["智能生成", "连续问答", "翻译与代码"],
        en: ["AI creation", "Follow-up Q&A", "Translate & code"]
      },
      url: "https://moss.midaigc.com",
      icon: "./assets/moss-icon.png",
      images: ["./assets/moss-chat.png"],
      accent: "#d9ff59",
      rgb: "217,255,89"
    }),
    Object.freeze({
      id: "citizenship",
      number: "02",
      name: "Citizenship",
      domain: { zh: "可信", en: "Trust" },
      tagline: { zh: "看清一个文件能证明什么。", en: "See what a file can actually prove." },
      description: {
        zh: "在设备上读取图片、视频和文档的来源证据。呈现证据层级，也诚实说明无法确定的部分。",
        en: "Read provenance evidence from photos, videos, and documents on-device—without pretending uncertainty is a verdict."
      },
      proof: {
        zh: ["来源证据", "分层结论", "设备端处理"],
        en: ["Provenance", "Evidence tiers", "On-device"]
      },
      url: "https://midaigc.com/privacy/citizenship/index",
      icon: "./assets/citizenship-icon.png",
      images: ["./assets/citizenship-home.png", "./assets/citizenship-result.png"],
      accent: "#8f7cff",
      rgb: "143,124,255"
    }),
    Object.freeze({
      id: "vocer",
      number: "03",
      name: "Vocer / 句练",
      domain: { zh: "练习", en: "Practice" },
      tagline: { zh: "把一段音频，练成真正会说的一句。", en: "Turn local audio into a sentence you can own." },
      description: {
        zh: "导入本地音频，找到一句、重复一句、保存一句，再回来复习一句。",
        en: "Import local audio, find one line, loop it, save it, and return to practise it again."
      },
      proof: {
        zh: ["本地音频", "A/B 复读", "收藏复习"],
        en: ["Local audio", "A/B loop", "Saved review"]
      },
      url: "https://midaigc.com/privacy/irepeater/index",
      icon: "./assets/vocer-icon.png",
      images: ["./assets/vocer-practice.png", "./assets/vocer-loop.png"],
      accent: "#e3a33c",
      rgb: "227,163,60"
    })
  ]);

  const variants = Object.freeze([
    { id: "studio", key: "A", name: "Studio" },
    { id: "editorial", key: "B", name: "Editorial" },
    { id: "galaxy", key: "C", name: "Galaxy" }
  ]);

  const copy = Object.freeze({
    zh: {
      eyebrow: "三个正在生长的产品",
      hero: "独立打造，\n持续进化。",
      intro: "三个产品，关于智能、可信与练习。",
      cta: "了解产品",
      scroll: "向下探索",
      select: "选择一颗产品星球",
      orbitHint: "点击节点切换中央舞台",
      footer: "独立产品 / 温和生长 / 长期主义",
      language: "EN"
    },
    en: {
      eyebrow: "THREE PRODUCTS IN MOTION",
      hero: "Independently built.\nAlways evolving.",
      intro: "Three products exploring intelligence, trust, and practice.",
      cta: "Explore product",
      scroll: "Scroll to explore",
      select: "Choose a product in orbit",
      orbitHint: "Select a node to change the central stage",
      footer: "INDEPENDENT / INTENTIONAL / LONG-TERM",
      language: "中"
    }
  });

  const state = {
    variant: document.documentElement.dataset.variant || "studio",
    lang: document.documentElement.dataset.lang || "zh",
    galaxyProduct: 0,
    cleanup: []
  };

  const main = document.querySelector("main");
  const variantLabel = document.querySelector("[data-variant-label]");
  const langLabel = document.querySelector("[data-lang-label]");

  function text(value) { return value[state.lang]; }
  function imageAlt(product, index) {
    const label = index === 0 ? (state.lang === "zh" ? "主要界面" : "main interface") : (state.lang === "zh" ? "功能界面" : "feature interface");
    return `${product.name} ${label}`;
  }
  function cta(product, className = "product-cta") {
    return `<a class="${className}" href="${product.url}">${copy[state.lang].cta}<span aria-hidden="true">↗</span></a>`;
  }
  function productIcon(product) {
    return `<img class="product-icon" src="${product.icon}" width="256" height="256" alt="${product.name} icon">`;
  }
  function screenshots(product, className = "screen-stack") {
    return `<div class="${className}" aria-label="${product.name} screenshots">${product.images.map((src, index) => `<figure class="screen screen-${index + 1}"><img src="${src}" width="${product.id === "moss" ? "1290" : product.id === "citizenship" ? "786" : "647"}" height="${product.id === "moss" ? "2796" : product.id === "citizenship" ? "1708" : "1400"}" alt="${imageAlt(product, index)}"></figure>`).join("")}</div>`;
  }

  function renderStudio() {
    const sections = products.map((product) => `
      <section class="studio-product reveal" id="studio-${product.id}" data-product="${product.id}" style="--accent:${product.accent};--accent-rgb:${product.rgb}">
        <div class="studio-product-copy">
          <div class="studio-product-heading">
            ${productIcon(product)}
            <span class="studio-domain">${product.number} / ${text(product.domain)}</span>
          </div>
          <h2>${product.name}</h2>
          <p class="product-tagline">${text(product.tagline)}</p>
          <p class="product-description">${text(product.description)}</p>
          <ul class="proof-list">${product.proof[state.lang].map((item) => `<li>${item}</li>`).join("")}</ul>
          ${cta(product)}
        </div>
        <div class="studio-product-visual" data-parallax>${screenshots(product)}</div>
      </section>`).join("");

    main.innerHTML = `
      <div class="studio-shell">
        <section class="studio-hero">
          <p class="hero-eyebrow">${copy[state.lang].eyebrow}</p>
          <h1>${copy[state.lang].hero.replace("\n", "<br>")}</h1>
          <p class="hero-intro">${copy[state.lang].intro}</p>
          <div class="studio-scroll"><span></span>${copy[state.lang].scroll}</div>
        </section>
        <aside class="studio-index" aria-label="Product index">
          ${products.map((p, index) => `<a href="#studio-${p.id}" class="${index === 0 ? "active" : ""}" data-index="${p.id}"><span>${p.number}</span>${p.name.replace(" / 句练", "")}</a>`).join("")}
        </aside>
        <div class="studio-products">${sections}</div>
        <footer class="variant-footer"><span>${copy[state.lang].footer}</span><span>© TINGXINS</span></footer>
      </div>`;
  }

  function renderEditorial() {
    const stories = products.map((product, index) => `
      <article class="editorial-story editorial-story-${index + 1} reveal" style="--accent:${product.accent};--accent-rgb:${product.rgb}">
        <header class="editorial-story-head">
          <span class="editorial-number">${product.number}</span>
          <span class="editorial-domain">${text(product.domain)}</span>
          ${productIcon(product)}
        </header>
        <div class="editorial-title-block">
          <h2>${product.name}</h2>
          <p class="product-tagline">${text(product.tagline)}</p>
        </div>
        <div class="editorial-body">
          <p>${text(product.description)}</p>
          <p class="editorial-proof">${product.proof[state.lang].join(" · ")}</p>
          ${cta(product, "editorial-cta")}
        </div>
        <div class="editorial-images">${screenshots(product, "editorial-screen-stack")}</div>
      </article>`).join("");

    main.innerHTML = `
      <div class="editorial-shell">
        <section class="editorial-hero">
          <p class="hero-eyebrow">${copy[state.lang].eyebrow}</p>
          <h1>${copy[state.lang].hero.replace("\n", "<br>")}</h1>
          <p class="hero-intro">${copy[state.lang].intro}</p>
          <span class="editorial-issue">ISSUE<br>NO. 01</span>
        </section>
        <div class="editorial-rule"><span>PRODUCT NOTES</span><span>SCROLL ↓</span></div>
        ${stories}
        <footer class="variant-footer"><span>${copy[state.lang].footer}</span><span>© TINGXINS</span></footer>
      </div>`;
  }

  function galaxyStage(product, index) {
    return `
      <article class="galaxy-stage-card" data-stage-card style="--accent:${product.accent};--accent-rgb:${product.rgb}">
        <div class="galaxy-copy">
          <div class="galaxy-kicker">${product.number} — ${text(product.domain)}</div>
          <div class="galaxy-name-row">${productIcon(product)}<h2>${product.name}</h2></div>
          <p class="product-tagline">${text(product.tagline)}</p>
          <p class="product-description">${text(product.description)}</p>
          <ul class="proof-list">${product.proof[state.lang].map((item) => `<li>${item}</li>`).join("")}</ul>
          ${cta(product)}
        </div>
        <div class="galaxy-visual">${screenshots(product, "galaxy-screen-stack")}</div>
        <div class="galaxy-counter"><span>${String(index + 1).padStart(2, "0")}</span><i></i><span>03</span></div>
      </article>`;
  }

  function renderGalaxy() {
    const active = products[state.galaxyProduct];
    main.innerHTML = `
      <div class="galaxy-shell" style="--accent:${active.accent};--accent-rgb:${active.rgb}">
        <section class="galaxy-hero">
          <div class="galaxy-hero-copy">
            <p class="hero-eyebrow">${copy[state.lang].eyebrow}</p>
            <h1>${copy[state.lang].hero.replace("\n", "<br>")}</h1>
            <p class="hero-intro">${copy[state.lang].intro}</p>
          </div>
          <div class="orbit" data-orbit aria-label="${copy[state.lang].select}">
            <div class="orbit-ring orbit-ring-1"></div><div class="orbit-ring orbit-ring-2"></div>
            <div class="orbit-core"><span>3</span><small>PRODUCTS</small></div>
            ${products.map((product, index) => `<button class="orbit-node orbit-node-${index + 1} ${index === state.galaxyProduct ? "active" : ""}" type="button" data-galaxy-product="${index}" aria-pressed="${index === state.galaxyProduct}">${productIcon(product)}<span>${product.name.replace(" / 句练", "")}</span></button>`).join("")}
            <p class="orbit-hint">${copy[state.lang].orbitHint}</p>
          </div>
        </section>
        <section class="galaxy-stage" aria-live="polite">${galaxyStage(active, state.galaxyProduct)}</section>
        <section class="galaxy-mobile" aria-label="Products">
          ${products.map((product, index) => galaxyStage(product, index)).join("")}
        </section>
        <footer class="variant-footer"><span>${copy[state.lang].footer}</span><span>© TINGXINS</span></footer>
      </div>`;
  }

  function cleanupEffects() {
    state.cleanup.forEach((callback) => callback());
    state.cleanup = [];
  }

  function setupReveal() {
    const targets = document.querySelectorAll(".reveal");
    if (!targets.length || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); });
    }, { threshold: 0.13 });
    targets.forEach((target) => observer.observe(target));
    state.cleanup.push(() => observer.disconnect());
  }

  function setupStudio() {
    const sections = document.querySelectorAll(".studio-product");
    if (!sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.dataset.product;
        const product = products.find((item) => item.id === id);
        document.querySelector(".studio-shell").style.setProperty("--active-rgb", product.rgb);
        document.querySelectorAll(".studio-index a").forEach((item) => item.classList.toggle("active", item.dataset.index === id));
      });
    }, { rootMargin: "-35% 0px -45%", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
    state.cleanup.push(() => observer.disconnect());
  }

  function setupPointer() {
    if (matchMedia("(pointer: coarse)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector(".galaxy-shell");
    if (!root) return;
    const move = (event) => {
      const x = (event.clientX / innerWidth - 0.5) * 2;
      const y = (event.clientY / innerHeight - 0.5) * 2;
      root.style.setProperty("--pointer-x", x.toFixed(3));
      root.style.setProperty("--pointer-y", y.toFixed(3));
    };
    addEventListener("pointermove", move, { passive: true });
    state.cleanup.push(() => removeEventListener("pointermove", move));
  }

  function updateUrl({ variant = state.variant, lang = state.lang } = {}) {
    const params = new URLSearchParams(location.search);
    params.set("variant", variant);
    params.set("lang", lang);
    history.replaceState(null, "", `${location.pathname}?${params.toString()}${location.hash}`);
  }

  function render() {
    cleanupEffects();
    document.documentElement.dataset.variant = state.variant;
    document.documentElement.dataset.lang = state.lang;
    document.documentElement.lang = state.lang === "en" ? "en" : "zh-Hans";
    const current = variants.find((variant) => variant.id === state.variant);
    variantLabel.textContent = `${current.key} — ${current.name}`;
    langLabel.textContent = copy[state.lang].language;
    document.title = `${current.name} — Products Prototype`;
    if (state.variant === "editorial") renderEditorial();
    else if (state.variant === "galaxy") renderGalaxy();
    else renderStudio();
    setupReveal();
    setupStudio();
    setupPointer();
  }

  function cycleVariant(direction) {
    const current = variants.findIndex((variant) => variant.id === state.variant);
    state.variant = variants[(current + direction + variants.length) % variants.length].id;
    state.galaxyProduct = 0;
    updateUrl();
    scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    render();
  }

  document.querySelector("[data-variant-prev]").addEventListener("click", () => cycleVariant(-1));
  document.querySelector("[data-variant-next]").addEventListener("click", () => cycleVariant(1));
  document.querySelector("[data-language-toggle]").addEventListener("click", () => {
    state.lang = state.lang === "zh" ? "en" : "zh";
    updateUrl();
    render();
  });

  addEventListener("click", (event) => {
    const node = event.target.closest("[data-galaxy-product]");
    if (!node) return;
    state.galaxyProduct = Number(node.dataset.galaxyProduct);
    render();
  });

  addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target;
    if (target.matches("input, textarea, select, [contenteditable]")) return;
    if (event.key === "ArrowLeft") cycleVariant(-1);
    if (event.key === "ArrowRight") cycleVariant(1);
  });

  addEventListener("popstate", () => {
    const params = new URLSearchParams(location.search);
    state.variant = variants.some((item) => item.id === params.get("variant")) ? params.get("variant") : "studio";
    state.lang = params.get("lang") === "en" ? "en" : "zh";
    render();
  });

  updateUrl();
  render();
})();
