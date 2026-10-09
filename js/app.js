(() => {
  "use strict";

  const DATA = window.TIMELINE_DATA;
  const $ = (s) => document.querySelector(s);
  const viewport = $("#viewport");
  const canvas = $("#canvas");
  const detail = $("#detail");
  const detailBody = $("#detail-body");
  const searchInput = $("#search");

  const AXIS_H = 34;
  const FONT = getComputedStyle(document.documentElement).getPropertyValue("--font").trim();

  const state = {
    view: "ot",
    ppy: { ot: DATA.ot.zoom.initial, nt: DATA.nt.zoom.initial }, // pixels per year
    selected: null,
    query: "",
    hidden: { ot: new Set(), nt: new Set() },
    scrolled: { ot: false, nt: false }
  };

  // ───────── 유틸 ─────────
  const measureCtx = document.createElement("canvas").getContext("2d");
  function textWidth(text, size = 13, weight = 600) {
    measureCtx.font = `${weight} ${size}px ${FONT}`;
    return Math.ceil(measureCtx.measureText(text).width);
  }

  function fmtYear(y) {
    const r = Math.round(y);
    if (r < 0) return `BC ${-r}`;
    if (r === 0) return "BC 1";
    return `AD ${r}`;
  }

  function fmtRange(it) {
    const pre = it.approx ? "약 " : "";
    if (it.end == null) return pre + fmtYear(it.start);
    const len = Math.round(it.end - it.start);
    return `${pre}${fmtYear(it.start)} – ${fmtYear(it.end)}${len > 0 ? ` (${len}년)` : ""}`;
  }

  function el(tag, cls, props) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (props) Object.assign(e, props);
    return e;
  }

  const isMobile = () => window.matchMedia("(max-width: 760px)").matches;

  // ───────── 데이터 색인 ─────────
  const index = { ot: new Map(), nt: new Map() };
  const groupOf = {}; // view -> id -> {name, hue}

  (function buildIndex() {
    const ot = DATA.ot;
    groupOf.ot = {};
    ot.categories.forEach((c) => (groupOf.ot[c.id] = c));
    groupOf.ot.period = { id: "period", name: "시대", hue: 35 };
    groupOf.ot.prologue = { id: "prologue", name: "원역사 (연대 미상)", hue: 18 };
    ot.periods.forEach((p) => index.ot.set(p.id, { ...p, kind: "period", group: "period" }));
    ot.items.forEach((i) => index.ot.set(i.id, { ...i, kind: "item", group: i.cat }));
    ot.prologue.forEach((p) => index.ot.set(p.id, { ...p, kind: "prologue", group: "prologue" }));

    const nt = DATA.nt;
    groupOf.nt = {};
    nt.lanes.forEach((l) => (groupOf.nt[l.id] = l));
    nt.items.forEach((i) => index.nt.set(i.id, { ...i, kind: "item", group: i.lane }));
  })();

  const cfg = () => DATA[state.view];
  const ppy = () => state.ppy[state.view];

  function originX() {
    if (state.view === "ot") return 24 + PROLOGUE_W + 40;
    return laneHeadW() + 40;
  }
  const PROLOGUE_W = 210;
  const laneHeadW = () => (isMobile() ? 92 : 128);

  const xOf = (y) => originX() + (y - cfg().range[0]) * ppy();
  const yearAt = (px) => cfg().range[0] + (px - originX()) / ppy();

  function isVisible(it) {
    if (it.kind === "prologue") return true;
    return !state.hidden[state.view].has(it.group);
  }

  function visibleTimed() {
    return [...index[state.view].values()]
      .filter((it) => it.kind !== "prologue" && isVisible(it))
      .sort((a, b) => a.start - b.start || (a.end ?? a.start) - (b.end ?? b.start));
  }

  function matchesQuery(it, q) {
    if (!q) return false;
    const hay = `${it.title} ${it.ref || ""} ${it.desc || ""}`.toLowerCase();
    return hay.includes(q);
  }

  function concurrentWith(sel) {
    const pad = cfg().concurrentPad;
    const s = sel.start - pad;
    const e = (sel.end ?? sel.start) + pad;
    return visibleTimed().filter(
      (it) => it.id !== sel.id && it.start <= e && (it.end ?? it.start) >= s
    );
  }

  // 겹치지 않게 줄(row) 배정: extents = [{left, right}], 반환 = row 번호 배열
  function packRows(extents, gap = 6) {
    const rowsRight = [];
    return extents.map(({ left, right }) => {
      let r = rowsRight.findIndex((rr) => rr + gap <= left);
      if (r === -1) {
        r = rowsRight.length;
        rowsRight.push(right);
      } else {
        rowsRight[r] = right;
      }
      return r;
    });
  }

  // ───────── 렌더링 ─────────
  let cursorLine, cursorYear;
  const nodes = new Map(); // id -> element

  function render() {
    const c = cfg();
    const totalW = Math.ceil(xOf(c.range[1]) + 80);
    canvas.innerHTML = "";
    nodes.clear();
    canvas.className = `canvas ${state.view}`;
    canvas.style.width = totalW + "px";

    renderAxis(totalW);
    const height = state.view === "ot" ? renderOT() : renderNT(totalW);
    canvas.style.height = Math.max(height, viewport.clientHeight) + "px";

    cursorLine = el("div", "cursor-line");
    cursorLine.style.height = canvas.style.height;
    cursorYear = el("span", "cursor-year");
    cursorLine.appendChild(cursorYear);
    canvas.appendChild(cursorLine);

    renderGuide();
    applyHighlights();
  }

  function tickStep() {
    const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500];
    return steps.find((s) => s * ppy() >= 64) || 1000;
  }

  function renderAxis(totalW) {
    const c = cfg();
    const axis = el("div", "axis");
    axis.style.width = totalW + "px";
    const step = tickStep();
    const major = step * 5;
    const first = Math.ceil(c.range[0] / step) * step;
    for (let y = first; y <= c.range[1]; y += step) {
      const x = xOf(y);
      const isEra = y === 0;
      const t = el("div", "tick" + (isEra ? " era" : y % major === 0 ? " major" : ""));
      t.style.left = x + "px";
      t.textContent = isEra ? "BC | AD" : fmtYear(y);
      axis.appendChild(t);

      const g = el("div", "gridline");
      g.style.left = x + "px";
      canvas.appendChild(g);
    }
    canvas.appendChild(axis);
  }

  // ── 구약: 한 줄 타임라인 ──
  function renderOT() {
    const c = DATA.ot;
    const top = AXIS_H + 14;

    // 원역사
    const pro = el("div", "prologue");
    pro.style.left = "24px";
    pro.style.top = top + "px";
    pro.style.width = PROLOGUE_W + "px";
    pro.appendChild(el("h2", "", { textContent: "원역사" }));
    pro.appendChild(el("p", "", { textContent: "창세기 1–11장 · 연대 미상" }));
    c.prologue.forEach((p) => {
      const b = el("button", "pro-card");
      b.dataset.id = p.id;
      b.innerHTML = `${p.title}<small>${p.ref}</small>`;
      pro.appendChild(b);
      nodes.set(p.id, b);
    });
    canvas.appendChild(pro);

    // 시대 띠
    const periods = [...index.ot.values()].filter((i) => i.kind === "period" && isVisible(i));
    const pRows = packRows(periods.map((p) => ({ left: xOf(p.start), right: xOf(p.end) })), 0);
    const pRowCount = periods.length ? Math.max(...pRows) + 1 : 0;
    periods.forEach((p, i) => {
      const wrap = el("div", "item period");
      wrap.dataset.id = p.id;
      wrap.style.setProperty("--h", p.hue);
      const bar = el("div", "bar");
      bar.style.left = xOf(p.start) + "px";
      bar.style.top = top + pRows[i] * 30 + "px";
      bar.style.width = Math.max(4, xOf(p.end) - xOf(p.start) - 2) + "px";
      bar.textContent = p.title;
      bar.title = `${p.title} (${fmtRange(p)})`;
      wrap.appendChild(bar);
      canvas.appendChild(wrap);
      nodes.set(p.id, wrap);
    });

    const lineY = top + pRowCount * 30 + 34;
    const track = el("div", "track");
    track.style.top = lineY + "px";
    track.style.left = xOf(c.range[0]) + "px";
    track.style.width = xOf(c.range[1]) - xOf(c.range[0]) + "px";
    canvas.appendChild(track);

    // 사건: 점은 선 위에, 라벨은 아래에 겹치지 않게 쌓음
    const items = [...index.ot.values()]
      .filter((i) => i.kind === "item" && isVisible(i))
      .sort((a, b) => a.start - b.start);
    const ROW = 48;
    const labelTop0 = lineY + 22;
    const ext = items.map((it) => {
      const w = Math.max(textWidth(it.title, 13, 600), textWidth(fmtRange(it), 11, 600)) + 22;
      const left = xOf(it.start) - 10;
      return { left, right: left + w };
    });
    const rows = packRows(ext);
    const rowCount = items.length ? Math.max(...rows) + 1 : 0;

    items.forEach((it, i) => {
      const g = groupOf.ot[it.group];
      const x = xOf(it.start);
      const wrap = el("div", "item");
      wrap.dataset.id = it.id;
      wrap.style.setProperty("--h", g.hue);
      wrap.style.left = "0";
      wrap.style.top = "0";

      const dot = el("div", "dot" + (it.approx ? " approx" : ""));
      dot.style.left = x + "px";
      dot.style.top = lineY + "px";

      const ly = labelTop0 + rows[i] * ROW;
      const conn = el("div", "connector");
      conn.style.left = x + "px";
      conn.style.top = lineY + "px";
      conn.style.height = ly - lineY + "px";

      const label = el("div", "label");
      label.style.left = ext[i].left + "px";
      label.style.top = ly + "px";
      label.innerHTML = `<span class="yr"></span><span class="t"></span>`;
      label.querySelector(".yr").textContent = fmtRange(it);
      label.querySelector(".t").textContent = it.title;

      wrap.append(conn, dot, label);
      canvas.appendChild(wrap);
      nodes.set(it.id, wrap);
    });

    const proBottom = top + 60 + c.prologue.length * 52;
    return Math.max(labelTop0 + rowCount * ROW + 30, proBottom);
  }

  // ── 신약: 여러 줄(레인) 타임라인 ──
  function renderNT(totalW) {
    const c = DATA.nt;
    const ROW = 30;
    let y = AXIS_H;
    let alt = false;

    c.lanes.forEach((lane) => {
      if (state.hidden.nt.has(lane.id)) return;
      const items = [...index.nt.values()]
        .filter((i) => i.lane === lane.id)
        .sort((a, b) => a.start - b.start || (b.end ?? b.start) - (a.end ?? a.start));

      // 각 항목의 차지 영역 계산
      const layout = items.map((it) => {
        const x = xOf(it.start);
        const tw = textWidth(it.title, 12.5, 700) + 18;
        if (it.end != null) {
          const w = Math.max(6, xOf(it.end) - x);
          const inside = tw <= w;
          return { it, x, w, inside, left: x, right: inside ? x + w : x + w + 6 + tw };
        }
        const lw = textWidth(it.title, 12.5, 600) + 12;
        return { it, x, left: x - 7, right: x + 8 + lw };
      });
      const rows = packRows(layout);
      const rowCount = Math.max(1, items.length ? Math.max(...rows) + 1 : 1);
      const laneH = rowCount * ROW + 14;

      const band = el("div", "lane" + (alt ? " alt" : ""));
      alt = !alt;
      band.style.top = y + "px";
      band.style.height = laneH + "px";
      band.style.width = totalW + "px";
      const head = el("div", "lane-head", { textContent: lane.name });
      head.style.setProperty("--h", lane.hue);
      band.appendChild(head);
      canvas.appendChild(band);

      layout.forEach((L, i) => {
        const it = L.it;
        const rowTop = y + 7 + rows[i] * ROW + 3;
        const wrap = el("div", "item");
        wrap.dataset.id = it.id;
        wrap.style.setProperty("--h", lane.hue);
        wrap.style.left = "0";
        wrap.style.top = "0";

        if (it.end != null) {
          const bar = el("div", "bar" + (it.approx ? " approx" : ""));
          bar.style.left = L.x + "px";
          bar.style.top = rowTop + "px";
          bar.style.width = L.w + "px";
          bar.title = `${it.title} (${fmtRange(it)})`;
          if (L.inside) bar.textContent = it.title;
          wrap.appendChild(bar);
          if (!L.inside) {
            const bl = el("div", "bar-label", { textContent: it.title });
            bl.style.left = L.x + L.w + 6 + "px";
            bl.style.top = rowTop + "px";
            wrap.appendChild(bl);
          }
        } else {
          const dot = el("div", "dot" + (it.approx ? " approx" : ""));
          dot.style.left = L.x + "px";
          dot.style.top = rowTop + 12 + "px";
          const label = el("div", "label");
          label.style.left = L.x + 8 + "px";
          label.style.top = rowTop + "px";
          label.textContent = it.title;
          label.title = fmtRange(it);
          wrap.append(dot, label);
        }
        canvas.appendChild(wrap);
        nodes.set(it.id, wrap);
      });

      y += laneH;
    });
    return y + 24;
  }

  function renderGuide() {
    const sel = state.selected && index[state.view].get(state.selected);
    if (!sel || sel.kind === "prologue") return;
    const h = parseFloat(canvas.style.height) - AXIS_H;
    if (sel.end != null || cfg().concurrentPad) {
      const pad = cfg().concurrentPad;
      const band = el("div", "guide-band");
      const l = xOf(sel.start - pad);
      band.style.left = l + "px";
      band.style.width = xOf((sel.end ?? sel.start) + pad) - l + "px";
      band.style.height = h + "px";
      canvas.appendChild(band);
    }
    [sel.start, sel.end].forEach((yv) => {
      if (yv == null) return;
      const g = el("div", "guide");
      g.style.left = xOf(yv) + "px";
      g.style.height = h + "px";
      canvas.appendChild(g);
    });
  }

  function applyHighlights() {
    const q = state.query;
    const sel = state.selected && index[state.view].get(state.selected);
    const concurrent = sel && sel.kind !== "prologue" ? new Set(concurrentWith(sel).map((i) => i.id)) : null;

    nodes.forEach((node, id) => {
      const it = index[state.view].get(id);
      const isSel = id === state.selected;
      node.classList.toggle("selected", isSel);
      let dim = false;
      let match = false;
      if (q) {
        match = matchesQuery(it, q);
        dim = !match;
      } else if (concurrent) {
        dim = !isSel && !concurrent.has(id);
      }
      node.classList.toggle("match", match);
      node.classList.toggle("dim", dim);
    });
  }

  // ───────── 범례 ─────────
  function renderLegend() {
    const legend = $("#legend");
    legend.innerHTML = "";
    const groups =
      state.view === "ot"
        ? [{ id: "period", name: "시대", hue: 35 }, ...DATA.ot.categories]
        : DATA.nt.lanes;
    groups.forEach((g) => {
      const b = el("button", "chip", { textContent: g.name });
      b.style.setProperty("--h", g.hue);
      b.setAttribute("aria-pressed", String(!state.hidden[state.view].has(g.id)));
      b.addEventListener("click", () => {
        const h = state.hidden[state.view];
        h.has(g.id) ? h.delete(g.id) : h.add(g.id);
        b.setAttribute("aria-pressed", String(!h.has(g.id)));
        rerenderKeepingCenter();
      });
      legend.appendChild(b);
    });
  }

  // ───────── 상세 패널 ─────────
  function showDetail() {
    const it = state.selected && index[state.view].get(state.selected);
    if (!it) {
      detail.hidden = true;
      return;
    }
    const g = groupOf[state.view][it.group];
    const hue = it.hue ?? g.hue;
    detailBody.innerHTML = "";

    const chip = el("span", "d-chip", { textContent: g.name });
    chip.style.setProperty("--h", hue);
    detailBody.appendChild(chip);
    if (it.kind !== "prologue") {
      detailBody.appendChild(el("div", "d-year", { textContent: fmtRange(it) }));
    }
    detailBody.appendChild(el("h2", "d-title", { textContent: it.title }));
    if (it.ref) detailBody.appendChild(el("div", "d-ref", { textContent: "📖 " + it.ref }));
    if (it.desc) detailBody.appendChild(el("p", "d-desc", { textContent: it.desc }));

    if (it.link) {
      const [view, id] = it.link.split(":");
      const b = el("button", "d-link", {
        textContent: view === "nt" ? "신약 타임라인에서 보기 →" : "← 구약 타임라인에서 보기"
      });
      b.addEventListener("click", () => switchView(view, id));
      detailBody.appendChild(b);
    }

    // 이전/다음
    if (it.kind !== "prologue") {
      const list = visibleTimed();
      const idx = list.findIndex((x) => x.id === it.id);
      const nav = el("div", "d-nav");
      const prev = list[idx - 1];
      const next = list[idx + 1];
      const pb = el("button", "", { textContent: prev ? "← " + prev.title : "← 처음", disabled: !prev });
      const nb = el("button", "", { textContent: next ? next.title + " →" : "끝 →", disabled: !next });
      if (prev) pb.addEventListener("click", () => select(prev.id, { scroll: true }));
      if (next) nb.addEventListener("click", () => select(next.id, { scroll: true }));
      nav.append(pb, nb);
      detailBody.appendChild(nav);

      // 같은 시기
      const pad = cfg().concurrentPad;
      const sec = el("div", "d-section");
      sec.innerHTML = `같은 시기 <small>(앞뒤 ${pad}년 포함)</small>`;
      detailBody.appendChild(sec);
      const conc = concurrentWith(it);
      if (!conc.length) {
        detailBody.appendChild(el("div", "d-empty", { textContent: "같은 시기의 다른 항목이 없습니다." }));
      }
      const order = state.view === "nt" ? DATA.nt.lanes.map((l) => l.id) : ["period", ...DATA.ot.categories.map((c) => c.id)];
      order.forEach((gid) => {
        const its = conc.filter((x) => x.group === gid);
        if (!its.length) return;
        const gg = groupOf[state.view][gid];
        const box = el("div", "d-group");
        const h4 = el("h4", "", { textContent: gg.name });
        h4.style.setProperty("--h", gg.hue);
        const ul = el("ul");
        its.forEach((x) => {
          const li = el("li");
          const b = el("button");
          b.innerHTML = `<span class="y"></span><span></span>`;
          b.children[0].textContent = x.end != null ? `${fmtYear(x.start)}–${fmtYear(x.end).replace(/^(AD|BC) /, "")}` : fmtYear(x.start);
          b.children[1].textContent = x.title;
          b.addEventListener("click", () => select(x.id, { scroll: true }));
          li.appendChild(b);
          ul.appendChild(li);
        });
        box.append(h4, ul);
        detailBody.appendChild(box);
      });
    }

    detail.hidden = false;
    detail.scrollTop = 0;
  }

  // ───────── 선택·이동 ─────────
  function select(id, { scroll = false } = {}) {
    state.selected = id;
    const it = id && index[state.view].get(id);
    if (it) {
      history.replaceState(null, "", `#${state.view}/${id}`);
    } else {
      history.replaceState(null, "", `#${state.view}`);
    }
    // 가이드 선을 다시 그리기 위해 기존 가이드만 교체
    canvas.querySelectorAll(".guide, .guide-band").forEach((n) => n.remove());
    renderGuide();
    applyHighlights();
    showDetail();
    if (scroll && it) scrollToItem(it);
  }

  function scrollToItem(it, smooth = true) {
    const node = nodes.get(it.id);
    const vw = viewport.clientWidth;
    let left;
    if (it.kind === "prologue") left = 0;
    else {
      const mid = it.end != null ? (it.start + it.end) / 2 : it.start;
      left = xOf(mid) - (vw + (state.view === "nt" ? laneHeadW() : 0)) / 2;
    }
    let top = viewport.scrollTop;
    if (node) {
      const target = node.querySelector(".label, .bar") || node;
      const r = target.getBoundingClientRect();
      const vr = viewport.getBoundingClientRect();
      const relTop = r.top - vr.top + viewport.scrollTop;
      if (relTop < viewport.scrollTop + AXIS_H + 10 || relTop > viewport.scrollTop + viewport.clientHeight - 60) {
        top = relTop - viewport.clientHeight / 2;
      }
    }
    viewport.scrollTo({ left: Math.max(0, left), top: Math.max(0, top), behavior: smooth ? "smooth" : "auto" });
  }

  function switchView(view, selectId) {
    if (view !== state.view) {
      state.view = view;
      state.selected = null;
      document.querySelectorAll(".tabs button").forEach((b) =>
        b.setAttribute("aria-selected", String(b.dataset.view === view))
      );
      renderLegend();
      render();
      if (!state.scrolled[view]) {
        initialScroll();
        state.scrolled[view] = true;
      }
    }
    select(selectId || null, { scroll: !!selectId });
  }

  function initialScroll() {
    if (state.view === "nt") viewport.scrollTo({ left: Math.max(0, xOf(-10) - laneHeadW() - 20), top: 0 });
    else viewport.scrollTo({ left: 0, top: 0 });
  }

  // ───────── 확대/축소 ─────────
  function setZoom(newPpy, anchorClientX) {
    const z = cfg().zoom;
    newPpy = Math.min(z.max, Math.max(z.min, newPpy));
    if (Math.abs(newPpy - ppy()) < 1e-6) return;
    const vr = viewport.getBoundingClientRect();
    const ax = anchorClientX != null ? anchorClientX - vr.left : viewport.clientWidth / 2;
    const year = yearAt(viewport.scrollLeft + ax);
    const scrollTop = viewport.scrollTop;
    state.ppy[state.view] = newPpy;
    render();
    viewport.scrollLeft = xOf(year) - ax;
    viewport.scrollTop = scrollTop;
  }

  function fitAll() {
    const c = cfg();
    const avail = viewport.clientWidth - originX() - 60;
    setZoom(avail / (c.range[1] - c.range[0]));
    viewport.scrollLeft = 0;
  }

  function rerenderKeepingCenter() {
    const year = yearAt(viewport.scrollLeft + viewport.clientWidth / 2);
    const top = viewport.scrollTop;
    render();
    viewport.scrollLeft = xOf(year) - viewport.clientWidth / 2;
    viewport.scrollTop = top;
    if (state.selected) showDetail();
  }

  // ───────── 이벤트 ─────────
  document.querySelectorAll(".tabs button").forEach((b) =>
    b.addEventListener("click", () => switchView(b.dataset.view))
  );

  $("#zoom-in").addEventListener("click", () => setZoom(ppy() * 1.5));
  $("#zoom-out").addEventListener("click", () => setZoom(ppy() / 1.5));
  $("#zoom-fit").addEventListener("click", fitAll);
  $("#detail-close").addEventListener("click", () => select(null));

  $("#theme").addEventListener("click", () => {
    const root = document.documentElement;
    const dark =
      root.dataset.theme === "dark" ||
      (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("bible-timeline-theme", root.dataset.theme); } catch (e) { /* 무시 */ }
  });
  try {
    const t = localStorage.getItem("bible-timeline-theme");
    if (t) document.documentElement.dataset.theme = t;
  } catch (e) { /* 무시 */ }

  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = searchInput.value.trim().toLowerCase();
      applyHighlights();
    }, 120);
  });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) return;
      // 현재 탭에서 먼저 찾고, 없으면 다른 탭에서
      const find = (view) =>
        [...index[view].values()]
          .filter((it) => matchesQuery(it, q) && (it.kind === "prologue" || !state.hidden[view].has(it.group)))
          .sort((a, b) => (a.start ?? -1e9) - (b.start ?? -1e9));
      let view = state.view;
      let hits = find(view);
      if (!hits.length) {
        view = view === "ot" ? "nt" : "ot";
        hits = find(view);
      }
      if (!hits.length) return;
      const cur = hits.findIndex((h) => h.id === state.selected);
      const next = hits[(cur + 1) % hits.length];
      state.query = q;
      if (view !== state.view) switchView(view, next.id);
      else select(next.id, { scroll: true });
    } else if (e.key === "Escape") {
      searchInput.value = "";
      state.query = "";
      applyHighlights();
      searchInput.blur();
    }
  });

  // 항목 클릭
  canvas.addEventListener("click", (e) => {
    if (dragMoved) return;
    const node = e.target.closest("[data-id]");
    if (node) select(node.dataset.id);
    else if (!e.target.closest(".prologue")) select(null);
  });

  // 마우스 위치 연도 표시
  viewport.addEventListener("mousemove", (e) => {
    if (!cursorLine) return;
    const vr = viewport.getBoundingClientRect();
    const px = e.clientX - vr.left + viewport.scrollLeft;
    const yv = yearAt(px);
    const c = cfg();
    if (px < originX() - 10 || yv < c.range[0] || yv > c.range[1]) {
      cursorLine.style.display = "none";
      return;
    }
    cursorLine.style.display = "block";
    cursorLine.style.left = px + "px";
    cursorYear.textContent = fmtYear(yv);
  });
  viewport.addEventListener("mouseleave", () => cursorLine && (cursorLine.style.display = "none"));

  // Ctrl/⌘ + 휠 (트랙패드 핀치 포함) 확대
  viewport.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(ppy() * Math.exp(-e.deltaY * 0.0045), e.clientX);
      }
    },
    { passive: false }
  );

  // 마우스 드래그로 이동
  let drag = null;
  let dragMoved = false;
  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, l: viewport.scrollLeft, t: viewport.scrollTop };
    dragMoved = false;
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!dragMoved && Math.hypot(dx, dy) < 4) return;
    dragMoved = true;
    viewport.classList.add("dragging");
    viewport.scrollLeft = drag.l - dx;
    viewport.scrollTop = drag.t - dy;
  });
  window.addEventListener("pointerup", () => {
    drag = null;
    viewport.classList.remove("dragging");
    setTimeout(() => (dragMoved = false), 0);
  });

  // 두 손가락 핀치 확대 (터치)
  let pinch = null;
  viewport.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 2) {
        const [a, b] = e.touches;
        pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), p: ppy() };
      }
    },
    { passive: true }
  );
  viewport.addEventListener(
    "touchmove",
    (e) => {
      if (!pinch || e.touches.length !== 2) return;
      e.preventDefault();
      const [a, b] = e.touches;
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      setZoom(pinch.p * (d / pinch.d), (a.clientX + b.clientX) / 2);
    },
    { passive: false }
  );
  viewport.addEventListener("touchend", () => (pinch = null));

  // 키보드
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const list = visibleTimed();
      if (!list.length) return;
      e.preventDefault();
      let idx = list.findIndex((x) => x.id === state.selected);
      if (idx === -1) {
        const centerYear = yearAt(viewport.scrollLeft + viewport.clientWidth / 2);
        idx = list.findIndex((x) => x.start >= centerYear);
        if (idx === -1) idx = list.length - 1;
      } else {
        idx = Math.min(list.length - 1, Math.max(0, idx + (e.key === "ArrowRight" ? 1 : -1)));
      }
      select(list[idx].id, { scroll: true });
    } else if (e.key === "Escape") {
      select(null);
    } else if (e.key === "+" || e.key === "=") {
      setZoom(ppy() * 1.5);
    } else if (e.key === "-" || e.key === "_") {
      setZoom(ppy() / 1.5);
    } else if (e.key === "/") {
      e.preventDefault();
      searchInput.focus();
    }
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rerenderKeepingCenter, 150);
  });

  // ───────── 시작 ─────────
  function boot() {
    const [view, id] = location.hash.replace(/^#/, "").split("/");
    const v = view === "nt" ? "nt" : "ot";
    state.view = v === "ot" ? "nt" : "ot"; // switchView가 렌더링하도록
    switchView(v);
    if (id && index[v].has(id)) select(id, { scroll: true });
  }
  boot();
})();
