(() => {
  const header = document.querySelector(".site-header");
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");

  const onScroll = () => {
    if (!header) return;
    // 내부 페이지는 항상 솔리드 — 최상단에서 흰 글씨가 한지 배경에 묻히는 문제 방지
    if (!document.body.classList.contains("page-intro")) {
      header.classList.add("is-solid");
      return;
    }
    header.classList.toggle("is-solid", window.scrollY > 24);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  menuBtn?.addEventListener("click", () => {
    nav?.classList.toggle("is-open");
    const open = nav?.classList.contains("is-open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  nav?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => nav.classList.remove("is-open"));
  });

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const buttons = [...root.querySelectorAll("[data-tab]")];
    const panels = [...root.querySelectorAll("[data-panel]")];

    buttons.forEach((btn) => {
      const id = btn.dataset.tab;
      const panel = root.querySelector(`[data-panel="${id}"]`);
      if (panel && !panel.id) panel.id = `panel-${id}`;
      btn.setAttribute("aria-controls", panel?.id || `panel-${id}`);
      if (!btn.id) btn.id = `tab-${id}`;
      if (panel) panel.setAttribute("aria-labelledby", btn.id);
    });

    const activate = (id) => {
      buttons.forEach((btn) => {
        const on = btn.dataset.tab === id;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
        btn.tabIndex = on ? 0 : -1;
      });
      panels.forEach((panel) => {
        const on = panel.dataset.panel === id;
        panel.classList.toggle("is-active", on);
        panel.hidden = !on;
      });
      if (id === "pet") {
        history.replaceState(null, "", "#pet");
      } else if (location.hash === "#pet") {
        history.replaceState(null, "", location.pathname);
      }
    };

    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => activate(btn.dataset.tab));
      btn.addEventListener("keydown", (e) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        let next = i;
        if (e.key === "ArrowRight") next = (i + 1) % buttons.length;
        if (e.key === "ArrowLeft") next = (i - 1 + buttons.length) % buttons.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = buttons.length - 1;
        buttons[next].focus();
        activate(buttons[next].dataset.tab);
      });
    });

    if (location.hash === "#pet") activate("pet");
    else {
      const current = buttons.find((b) => b.classList.contains("is-active"))?.dataset.tab || buttons[0]?.dataset.tab;
      if (current) activate(current);
    }
  });


  // Deep-link sections (e.g. pool.html#pet)
  const goHash = () => {
    if (!location.hash || location.hash.length < 2) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) {
      window.setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  };
  window.addEventListener("load", goHash);
  window.addEventListener("hashchange", goHash);

  document.querySelectorAll("form[data-inquiry]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const success = form.querySelector(".form-success");
      const data = new FormData(form);
      const lines = [];
      data.forEach((value, key) => {
        if (String(value).trim()) lines.push(`${key}: ${value}`);
      });
      const type = form.dataset.inquiry || "inquiry";
      const subject = encodeURIComponent(`[여주목마 ${type}] 예약/문의`);
      const body = encodeURIComponent(lines.join("\n"));
      success?.classList.add("is-visible");
      form.reset();
      window.setTimeout(() => {
        window.location.href = `mailto:yeojumokma@example.com?subject=${subject}&body=${body}`;
      }, 400);
    });
  });

  /* Menu photo thumbs → main crossfade */
  document.querySelectorAll("[data-photo-thumbs]").forEach((thumbs) => {
    const card = thumbs.closest(".brand-card");
    const main = card?.querySelector("[data-photo-main] img");
    if (!main) return;

    thumbs.querySelectorAll("button[data-src]").forEach((btn) => {
      const swap = () => {
        const src = btn.dataset.src;
        if (!src || main.getAttribute("src") === src) return;
        thumbs.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        main.classList.remove("is-fading");
        void main.offsetWidth;
        main.src = src;
        main.classList.add("is-fading");
      };
      btn.addEventListener("mouseenter", swap);
      btn.addEventListener("focus", swap);
      btn.addEventListener("click", swap);
    });
  });
})();
