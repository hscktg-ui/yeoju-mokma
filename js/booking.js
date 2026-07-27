(() => {
  const root = document.querySelector("[data-booking]");
  if (!root) return;

  const ROOMS = [
    {
      id: "glass",
      name: "글라스룸",
      desc: "통유리 프라이빗 룸 · 소규모 가족·연인",
      meta: "최대 6명 · 수영장 연계",
      price: 120000,
      unit: "회",
      img: "images/gallery-6.jpg",
      type: "stay",
    },
    {
      id: "bungalow",
      name: "방갈로 · 독립룸",
      desc: "잔디 위 독립 좌석 · 시즌 패키지",
      meta: "최대 8명 · 바비큐 상담",
      price: 150000,
      unit: "회",
      img: "images/gallery-7.jpg",
      type: "stay",
    },
    {
      id: "pool",
      name: "물놀이장 데이이용",
      desc: "목마 앞 물놀이 · 가족 데이 패스",
      meta: "인원별 안내 · 룸 병행 가능",
      price: 45000,
      unit: "4인 기준",
      img: "images/official-mokma.jpg",
      crop: "crop-pool",
      type: "day",
    },
    {
      id: "hall",
      name: "어울림 다목적홀",
      desc: "돌잔치 · 모임 · 세미나 · 전통혼례",
      meta: "대관 · 식사 연계 상담",
      price: 0,
      unit: "견적",
      img: "images/news-open2.jpg",
      type: "hall",
    },
  ];

  const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

  const state = {
    view: startOfMonth(new Date()),
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    roomId: "glass",
    focusKey: null,
  };

  const params = new URLSearchParams(location.search);
  const pref = params.get("type");
  if (pref === "hall" || pref === "pool" || pref === "glass" || pref === "bungalow") {
    state.roomId = pref === "bungalow" ? "bungalow" : pref;
  }

  const els = {
    calTitle: root.querySelector("[data-cal-title]"),
    calGrid: root.querySelector("[data-cal-grid]"),
    prev: root.querySelector("[data-cal-prev]"),
    next: root.querySelector("[data-cal-next]"),
    rooms: root.querySelector("[data-rooms]"),
    checkInBtn: root.querySelector("[data-checkin]"),
    checkOutBtn: root.querySelector("[data-checkout]"),
    guestsBtn: root.querySelector("[data-guests]"),
    guestPop: root.querySelector("[data-guest-pop]"),
    adultsVal: root.querySelector("[data-adults]"),
    childrenVal: root.querySelector("[data-children]"),
    sumDates: root.querySelector("[data-sum-dates]"),
    sumNights: root.querySelector("[data-sum-nights]"),
    sumGuests: root.querySelector("[data-sum-guests]"),
    sumRoom: root.querySelector("[data-sum-room]"),
    sumTotal: root.querySelector("[data-sum-total]"),
    live: root.querySelector("[data-live]"),
    name: root.querySelector("[data-guest-name]"),
    phone: root.querySelector("[data-guest-phone]"),
    submit: root.querySelector("[data-submit]"),
    search: root.querySelector("[data-search]"),
    modal: document.querySelector("[data-book-modal]"),
    modalBody: document.querySelector("[data-modal-body]"),
    modalClose: document.querySelectorAll("[data-modal-close]"),
  };

  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function ymd(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function formatKo(d) {
    if (!d) return "날짜 선택";
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }

  function formatLong(d) {
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEK[d.getDay()]}요일`;
  }

  function addDays(d, n) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  }

  function nightsBetween(a, b) {
    if (!a || !b) return 0;
    return Math.round((b - a) / 86400000);
  }

  function isMonday(d) {
    return d.getDay() === 1;
  }

  function isSoldOut(d) {
    const key = ymd(d);
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return hash % 11 === 0 && d.getDay() === 0;
  }

  function isPast(d) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  }

  function isUnavailable(d) {
    return isPast(d) || isMonday(d) || isSoldOut(d);
  }

  function room() {
    return ROOMS.find((r) => r.id === state.roomId) || ROOMS[0];
  }

  function announce(msg) {
    if (!els.live) return;
    els.live.textContent = "";
    window.requestAnimationFrame(() => {
      els.live.textContent = msg;
    });
  }

  function statusLabel(date) {
    if (isPast(date)) return "지난 날짜";
    if (isMonday(date)) return "휴무";
    if (isSoldOut(date)) return "마감";
    return "예약 가능";
  }

  function renderCalendar() {
    const y = state.view.getFullYear();
    const m = state.view.getMonth();
    els.calTitle.textContent = `${y}년 ${m + 1}월`;

    const first = new Date(y, m, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const today = ymd(new Date());
    const inKey = state.checkIn ? ymd(state.checkIn) : null;
    const outKey = state.checkOut ? ymd(state.checkOut) : null;

    els.calGrid.setAttribute("role", "grid");
    els.calGrid.setAttribute("aria-label", `${y}년 ${m + 1}월 예약 캘린더`);

    const frag = document.createDocumentFragment();
    WEEK.forEach((label, i) => {
      const el = document.createElement("div");
      el.className = "cal-dow" + (i === 0 ? " is-sun" : i === 6 ? " is-sat" : "");
      el.setAttribute("role", "columnheader");
      el.textContent = label;
      frag.appendChild(el);
    });

    for (let i = 0; i < startPad; i++) {
      const empty = document.createElement("div");
      empty.className = "cal-day is-empty";
      empty.setAttribute("role", "gridcell");
      empty.setAttribute("aria-hidden", "true");
      frag.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(y, m, day);
      const key = ymd(date);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      btn.textContent = String(day);
      btn.dataset.date = key;
      btn.setAttribute("role", "gridcell");
      btn.setAttribute("aria-label", `${formatLong(date)}, ${statusLabel(date)}`);

      if (key === today) btn.classList.add("is-today");
      if (isMonday(date)) btn.classList.add("is-closed");
      if (isSoldOut(date)) btn.classList.add("is-sold");
      if (isUnavailable(date)) {
        btn.disabled = true;
        btn.setAttribute("aria-disabled", "true");
      }

      if (inKey && key === inKey) {
        btn.classList.add("is-start");
        btn.setAttribute("aria-selected", "true");
      }
      if (outKey && key === outKey) {
        btn.classList.add("is-end");
        btn.setAttribute("aria-selected", "true");
      }
      if (inKey && outKey && key > inKey && key < outKey) btn.classList.add("is-in-range");
      if (inKey && outKey && (key === inKey || key === outKey) && inKey !== outKey) {
        btn.classList.add("is-in-range");
      }

      btn.tabIndex = state.focusKey === key || (!state.focusKey && !isUnavailable(date) && day === 1) ? 0 : -1;
      btn.addEventListener("click", () => selectDate(date));
      btn.addEventListener("keydown", (e) => onDayKey(e, date));
      frag.appendChild(btn);
    }

    els.calGrid.replaceChildren(frag);

    const now = startOfMonth(new Date());
    els.prev.disabled = state.view <= now;

    const pickKey = outKey || inKey;
    if (pickKey) {
      els.calGrid.querySelector(`[data-date="${pickKey}"]`)?.classList.add("is-just-picked");
    }

    // ensure one tabbable day
    const focusable = els.calGrid.querySelector(".cal-day:not(:disabled):not(.is-empty)");
    const current = state.focusKey
      ? els.calGrid.querySelector(`[data-date="${state.focusKey}"]`)
      : null;
    if (current && !current.disabled) {
      els.calGrid.querySelectorAll(".cal-day[tabindex='0']").forEach((el) => {
        el.tabIndex = -1;
      });
      current.tabIndex = 0;
    } else if (focusable) {
      focusable.tabIndex = 0;
    }
  }

  function onDayKey(e, date) {
    const key = e.key;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", " ", "Home", "End"].includes(key)) {
      return;
    }
    e.preventDefault();

    if (key === "Enter" || key === " ") {
      selectDate(date);
      return;
    }

    let next = date;
    if (key === "ArrowLeft") next = addDays(date, -1);
    if (key === "ArrowRight") next = addDays(date, 1);
    if (key === "ArrowUp") next = addDays(date, -7);
    if (key === "ArrowDown") next = addDays(date, 7);
    if (key === "Home") next = new Date(date.getFullYear(), date.getMonth(), 1);
    if (key === "End") next = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    if (next.getMonth() !== state.view.getMonth() || next.getFullYear() !== state.view.getFullYear()) {
      state.view = startOfMonth(next);
      state.focusKey = ymd(next);
      renderCalendar();
    } else {
      state.focusKey = ymd(next);
      renderCalendar();
    }
    els.calGrid.querySelector(`[data-date="${ymd(next)}"]`)?.focus();
  }

  function selectDate(date) {
    if (isUnavailable(date)) return;
    state.focusKey = ymd(date);

    if (!state.checkIn || (state.checkIn && state.checkOut) || date < state.checkIn) {
      state.checkIn = date;
      state.checkOut = null;
      announce(`${formatLong(date)} 체크인 선택. 체크아웃 날짜를 골라 주세요.`);
    } else if (date.getTime() === state.checkIn.getTime()) {
      state.checkOut = null;
      announce(`${formatLong(date)} 체크인 유지. 체크아웃을 선택하세요.`);
    } else {
      let ok = true;
      for (let d = addDays(state.checkIn, 1); d < date; d = addDays(d, 1)) {
        if (isSoldOut(d)) ok = false;
      }
      if (!ok) {
        state.checkIn = date;
        state.checkOut = null;
        announce(`구간 내 마감일이 있어 ${formatLong(date)}을 새 체크인으로 설정했습니다.`);
      } else {
        state.checkOut = date;
        announce(`${formatKo(state.checkIn)}부터 ${formatKo(date)}까지 선택했습니다.`);
      }
    }

    if (room().type === "day" && state.checkIn && !state.checkOut) {
      state.checkOut = state.checkIn;
    }

    render();
  }

  function renderRooms() {
    const frag = document.createDocumentFragment();
    ROOMS.forEach((r) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "room-card" + (r.id === state.roomId ? " is-selected" : "");
      btn.setAttribute("aria-pressed", r.id === state.roomId ? "true" : "false");
      btn.innerHTML = `
        <img class="${r.crop || ""}" src="${r.img}" alt="" />
        <div class="room-card__body">
          <h3>${r.name}</h3>
          <p>${r.desc}</p>
          <div class="room-card__meta">${r.meta}</div>
        </div>
        <div class="room-card__price">
          <strong>${r.price ? r.price.toLocaleString("ko-KR") + "원" : "견적"}</strong>
          <span>${r.price ? `/ ${r.unit} · 참고가` : "상담 후 안내"}</span>
        </div>
      `;
      btn.addEventListener("click", () => {
        state.roomId = r.id;
        if (r.type === "day" && state.checkIn && !state.checkOut) {
          state.checkOut = state.checkIn;
        }
        announce(`${r.name} 선택`);
        render();
      });
      frag.appendChild(btn);
    });
    els.rooms.replaceChildren(frag);
  }

  function guestReady() {
    const name = (els.name?.value || "").trim();
    const phone = (els.phone?.value || "").trim();
    return name.length >= 2 && phone.replace(/\D/g, "").length >= 9;
  }

  function renderSummary() {
    const r = room();
    const n = nightsBetween(state.checkIn, state.checkOut);
    const stayNights = r.type === "day" ? Math.max(n, state.checkIn ? 1 : 0) : n;
    const guests = state.adults + state.children;

    els.checkInBtn.querySelector(".value").textContent = formatKo(state.checkIn);
    els.checkOutBtn.querySelector(".value").textContent =
      state.checkOut && ymd(state.checkOut) !== ymd(state.checkIn)
        ? formatKo(state.checkOut)
        : state.checkIn && r.type === "day"
          ? formatKo(state.checkIn) + " (당일)"
          : "날짜 선택";

    els.guestsBtn.querySelector(".value").textContent =
      `성인 ${state.adults}` + (state.children ? ` · 아동 ${state.children}` : "");

    els.adultsVal.textContent = String(state.adults);
    els.childrenVal.textContent = String(state.children);

    if (!state.checkIn) {
      els.sumDates.textContent = "캘린더에서 날짜를 선택하세요";
      els.sumNights.textContent = "—";
    } else if (!state.checkOut || (r.type !== "day" && n < 1)) {
      els.sumDates.textContent = `${formatKo(state.checkIn)} → 체크아웃 선택`;
      els.sumNights.textContent = "—";
    } else {
      els.sumDates.textContent =
        r.type === "day" && n === 0
          ? `${formatKo(state.checkIn)} · 당일 이용`
          : `${formatKo(state.checkIn)} – ${formatKo(state.checkOut)}`;
      els.sumNights.textContent = r.type === "day" ? "데이이용" : `${stayNights}박`;
    }

    els.sumGuests.textContent = `성인 ${state.adults} · 아동 ${state.children} (총 ${guests}명)`;
    els.sumRoom.textContent = r.name;

    let total = 0;
    if (r.price) {
      if (r.type === "day") total = state.checkIn ? r.price : 0;
      else total = stayNights > 0 ? r.price * stayNights : 0;
    }

    els.sumTotal.textContent = r.price
      ? total
        ? total.toLocaleString("ko-KR") + "원"
        : "—"
      : "견적 상담";

    const ready =
      !!state.checkIn &&
      !!state.checkOut &&
      (r.type === "day" || nightsBetween(state.checkIn, state.checkOut) >= 1) &&
      guests >= 1 &&
      guestReady();

    els.submit.disabled = !ready;

    const summary = root.querySelector(".book-summary");
    summary?.classList.remove("is-tick");
    els.sumTotal.classList.remove("is-tick");
    void summary?.offsetWidth;
    summary?.classList.add("is-tick");
    els.sumTotal.classList.add("is-tick");
  }

  function render() {
    renderCalendar();
    renderRooms();
    renderSummary();
  }

  els.prev?.addEventListener("click", () => {
    state.view = new Date(state.view.getFullYear(), state.view.getMonth() - 1, 1);
    renderCalendar();
  });

  els.next?.addEventListener("click", () => {
    state.view = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1);
    renderCalendar();
  });

  els.guestsBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = els.guestPop.classList.toggle("is-open");
    els.guestsBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!els.guestPop?.classList.contains("is-open")) return;
    if (els.guestPop.contains(e.target) || els.guestsBtn.contains(e.target)) return;
    els.guestPop.classList.remove("is-open");
    els.guestsBtn.setAttribute("aria-expanded", "false");
  });

  root.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const who = btn.dataset.step;
      const dir = Number(btn.dataset.dir);
      if (who === "adults") state.adults = Math.min(12, Math.max(1, state.adults + dir));
      else state.children = Math.min(8, Math.max(0, state.children + dir));
      renderSummary();
    });
  });

  els.name?.addEventListener("input", renderSummary);
  els.phone?.addEventListener("input", renderSummary);

  els.search?.addEventListener("click", () => {
    root.querySelector("#calendar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.checkInBtn?.addEventListener("click", () => {
    root.querySelector("#calendar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  els.checkOutBtn?.addEventListener("click", () => {
    root.querySelector("#calendar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.submit?.addEventListener("click", () => {
    if (els.submit.disabled) return;
    const r = room();
    if (els.modalBody) {
      els.modalBody.innerHTML = `
        <p><strong>${(els.name.value || "").trim()}</strong> 님</p>
        <p>${els.sumDates.textContent}</p>
        <p>${r.name} · ${els.sumGuests.textContent}</p>
        <p>예상 ${els.sumTotal.textContent}</p>
        <p class="summary-note">결제·확정 연동 전 데모입니다. 전화로 바로 확정할 수 있습니다.</p>
      `;
    }
    els.modal?.classList.add("is-open");
    announce("예약 신청이 준비되었습니다.");
  });

  els.modalClose.forEach((btn) => {
    btn.addEventListener("click", () => els.modal?.classList.remove("is-open"));
  });
  els.modal?.addEventListener("click", (e) => {
    if (e.target === els.modal) els.modal.classList.remove("is-open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") els.modal?.classList.remove("is-open");
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let seed = addDays(today, 2);
  while (isUnavailable(seed)) seed = addDays(seed, 1);
  state.checkIn = seed;
  let out = addDays(seed, room().type === "day" ? 0 : 1);
  while (out > seed && isUnavailable(out)) out = addDays(out, 1);
  if (room().type !== "day" && isUnavailable(out)) {
    out = addDays(seed, 2);
    while (isUnavailable(out)) out = addDays(out, 1);
  }
  state.checkOut = out;
  state.view = startOfMonth(seed);
  state.focusKey = ymd(seed);

  render();
})();
