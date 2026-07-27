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
      img: "images/news-food6.jpg",
      type: "stay",
    },
    {
      id: "bungalow",
      name: "방갈로 · 독립룸",
      desc: "잔디 위 독립 좌석 · 시즌 패키지",
      meta: "최대 8명 · 바비큐 상담",
      price: 150000,
      unit: "회",
      img: "images/news-pool.jpg",
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

  const state = {
    view: startOfMonth(new Date()),
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    roomId: null,
    picking: "in",
  };

  const params = new URLSearchParams(location.search);
  const pref = params.get("type");
  if (pref === "hall") state.roomId = "hall";
  else if (pref === "pool") state.roomId = "pool";
  else if (pref === "glass") state.roomId = "glass";
  else state.roomId = "glass";

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
    submit: root.querySelector("[data-submit]"),
    search: root.querySelector("[data-search]"),
    modal: document.querySelector("[data-book-modal]"),
    modalClose: document.querySelectorAll("[data-modal-close]"),
  };

  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function ymd(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function parseYmd(s) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function formatKo(d) {
    if (!d) return "날짜 선택";
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
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

  /** Demo sold-out: some weekends look busy */
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

  function renderCalendar() {
    const y = state.view.getFullYear();
    const m = state.view.getMonth();
    els.calTitle.textContent = `${y}년 ${m + 1}월`;

    const first = new Date(y, m, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const today = ymd(new Date());

    const frag = document.createDocumentFragment();
    const dows = ["일", "월", "화", "수", "목", "금", "토"];
    dows.forEach((label, i) => {
      const el = document.createElement("div");
      el.className = "cal-dow" + (i === 0 ? " is-sun" : i === 6 ? " is-sat" : "");
      el.textContent = label;
      frag.appendChild(el);
    });

    for (let i = 0; i < startPad; i++) {
      const empty = document.createElement("button");
      empty.type = "button";
      empty.className = "cal-day is-empty";
      empty.disabled = true;
      empty.tabIndex = -1;
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

      if (key === today) btn.classList.add("is-today");
      if (isMonday(date)) btn.classList.add("is-closed");
      if (isSoldOut(date)) btn.classList.add("is-sold");
      if (isUnavailable(date)) btn.disabled = true;

      const inKey = state.checkIn ? ymd(state.checkIn) : null;
      const outKey = state.checkOut ? ymd(state.checkOut) : null;
      if (inKey && key === inKey) btn.classList.add("is-start");
      if (outKey && key === outKey) btn.classList.add("is-end");
      if (inKey && outKey && key > inKey && key < outKey) btn.classList.add("is-in-range");
      if (inKey && outKey && (key === inKey || key === outKey) && inKey !== outKey) {
        btn.classList.add("is-in-range");
      }

      btn.addEventListener("click", () => selectDate(date));
      frag.appendChild(btn);
    }

    els.calGrid.replaceChildren(frag);

    const now = startOfMonth(new Date());
    els.prev.disabled = state.view <= now;

    // micro feedback on latest pick
    const pickKey = state.checkOut
      ? ymd(state.checkOut)
      : state.checkIn
        ? ymd(state.checkIn)
        : null;
    if (pickKey) {
      const picked = els.calGrid.querySelector(`[data-date="${pickKey}"]`);
      picked?.classList.add("is-just-picked");
    }
  }

  function selectDate(date) {
    if (isUnavailable(date)) return;

    if (!state.checkIn || (state.checkIn && state.checkOut) || date < state.checkIn) {
      state.checkIn = date;
      state.checkOut = null;
      state.picking = "out";
    } else if (date.getTime() === state.checkIn.getTime()) {
      state.checkOut = null;
      state.picking = "out";
    } else {
      // skip if range includes closed monday
      let ok = true;
      for (let d = addDays(state.checkIn, 1); d < date; d = addDays(d, 1)) {
        if (isMonday(d) && room().type !== "day") {
          // day-use can still book around mondays for single day; for range stay, block
        }
        if (isSoldOut(d)) ok = false;
      }
      if (!ok) {
        state.checkIn = date;
        state.checkOut = null;
        state.picking = "out";
      } else {
        state.checkOut = date;
        state.picking = "in";
      }
    }

    // day-use: same-day checkout optional — if only check-in, treat as 1 day
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
        render();
      });
      frag.appendChild(btn);
    });
    els.rooms.replaceChildren(frag);
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
      els.sumNights.textContent =
        r.type === "day" ? "데이이용" : `${stayNights}박`;
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
      guests >= 1;

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
    els.guestPop.classList.toggle("is-open");
  });

  document.addEventListener("click", (e) => {
    if (!els.guestPop?.classList.contains("is-open")) return;
    if (els.guestPop.contains(e.target) || els.guestsBtn.contains(e.target)) return;
    els.guestPop.classList.remove("is-open");
  });

  root.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const who = btn.dataset.step;
      const dir = Number(btn.dataset.dir);
      if (who === "adults") {
        state.adults = Math.min(12, Math.max(1, state.adults + dir));
      } else {
        state.children = Math.min(8, Math.max(0, state.children + dir));
      }
      renderSummary();
    });
  });

  els.search?.addEventListener("click", () => {
    root.querySelector("#calendar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.submit?.addEventListener("click", () => {
    if (els.submit.disabled) return;
    els.modal?.classList.add("is-open");
  });

  els.modalClose.forEach((btn) => {
    btn.addEventListener("click", () => els.modal?.classList.remove("is-open"));
  });

  els.modal?.addEventListener("click", (e) => {
    if (e.target === els.modal) els.modal.classList.remove("is-open");
  });

  // Prefill near weekend for demo feel
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

  render();
})();
