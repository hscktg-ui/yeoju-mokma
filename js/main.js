(() => {
  const header = document.querySelector(".site-header");
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");

  const onScroll = () => {
    if (!header) return;
    const threshold = document.body.classList.contains("page-intro") ? 10 : 40;
    header.classList.toggle("is-solid", window.scrollY > threshold);
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
    const buttons = root.querySelectorAll("[data-tab]");
    const panels = root.querySelectorAll("[data-panel]");

    const activate = (id) => {
      buttons.forEach((btn) => {
        const on = btn.dataset.tab === id;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
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

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => activate(btn.dataset.tab));
    });

    if (location.hash === "#pet") activate("pet");
  });

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
      // 실제 메일 연동 전: 화면 피드백 + mailto 초안
      success?.classList.add("is-visible");
      form.reset();
      window.setTimeout(() => {
        window.location.href = `mailto:yeojumokma@example.com?subject=${subject}&body=${body}`;
      }, 400);
    });
  });
})();
