(() => {
  "use strict";

  const DATA = window.TIMELINE_DATA;

  // ───────── 구약·신약을 하나의 타임라인으로 합침 ─────────
  // 신약의 로마 황제·유대 통치자·사건 줄은 공통 줄로 옮기고, 색은 원래 줄 색을 유지함
  const NT_LANE_MAP = { rome: "world", judea: "king", history: "world" };
  const RULER_LANES = new Set(["rome", "judea"]); // 세로 보기 구간 제목에 '그 시기 통치자'로 표시
  DATA.all = (() => {
    const { ot, nt } = DATA;
    const otLane = (id) => ot.lanes.find((l) => l.id === id);
    const ntLane = (id) => nt.lanes.find((l) => l.id === id);
    return {
      range: [ot.range[0], nt.range[1]],
      undatedBefore: ot.undatedBefore,
      zoom: { min: ot.zoom.min, max: nt.zoom.max, initial: ot.zoom.initial },
      eras: { ot: [ot.range[0], -4], nt: [-40, nt.range[1]] },
      lanes: [
        otLane("period"),
        otLane("event"),
        otLane("people"),
        { ...otLane("king"), name: "왕·통치자" },
        otLane("prophet"),
        ntLane("jesus"),
        ntLane("church"),
        ntLane("paul"),
        ntLane("writings"),
        { ...otLane("world"), name: "주변 세계·역사" }
      ],
      periods: ot.periods,
      prologue: ot.prologue,
      items: [
        ...ot.items,
        ...nt.items.map((i) =>
          NT_LANE_MAP[i.lane]
            ? { ...i, origLane: i.lane, lane: NT_LANE_MAP[i.lane], hue: i.hue ?? ntLane(i.lane).hue }
            : i
        )
      ]
    };
  })();
  const $ = (s) => document.querySelector(s);
  const viewport = $("#viewport");
  const canvas = $("#canvas");
  const detail = $("#detail");
  const detailBody = $("#detail-body");
  const searchInput = $("#search");

  const AXIS_H = 34;
  const FONT = getComputedStyle(document.documentElement).getPropertyValue("--font").trim();

  const state = {
    view: "all", // 구약·신약 통합 타임라인
    ppy: { all: DATA.all.zoom.initial }, // pixels per year
    selected: null,
    query: "",
    hidden: { all: new Set() },
    mode: "h" // "h" 가로 타임라인, "v" 세로 목록 (모바일 기본)
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

  // 연대 미상 구간(원역사)은 '?'로 표기
  function yearText(y) {
    const u = cfg().undatedBefore;
    return u != null && y < u ? "?" : fmtYear(y);
  }

  function fmtRange(it) {
    if (it.undated) return "?";
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

  // research.js의 상태 중 '논란 많음'·'논문 철회'는 따로 빨간색으로 표시
  const isDisputed = (status) => /논란 많음|철회/.test(status);

  const isMobile = () => window.matchMedia("(max-width: 760px)").matches;

  // ───────── 데이터 색인 ─────────
  const index = { all: new Map() };
  const groupOf = { all: {} }; // view -> id -> {name, hue}

  (function buildIndex() {
    const all = DATA.all;
    all.lanes.forEach((l) => (groupOf.all[l.id] = l));
    all.periods.forEach((p) => index.all.set(p.id, { ...p, lane: "period", group: "period" }));
    // 원역사: 연대 미상('?') 구간에 성경 순서대로 놓음 (위치는 순서만 의미)
    const [a, b] = [all.range[0], all.undatedBefore];
    all.prologue.forEach((p, i) =>
      index.all.set(p.id, {
        ...p,
        lane: "event",
        group: "event",
        undated: true,
        start: a + ((b - a) * (i + 0.5)) / all.prologue.length
      })
    );
    all.items.forEach((i) => index.all.set(i.id, { ...i, group: i.lane }));

    // 역사 기록(js/history.js), 성경 밖 증거(js/evidence.js), 진행 중인 연구·논쟁(js/research.js, 미확인)
    [
      ["history", window.TIMELINE_HISTORY],
      ["evidence", window.TIMELINE_EVIDENCE],
      ["research", window.TIMELINE_RESEARCH]
    ].forEach(([key, map]) => {
      Object.entries(map || {}).forEach(([id, list]) => {
        const it = index.all.get(id);
        if (it) it[key] = list;
      });
    });

    // 논란 많은 주장(논란 많음·논문 철회)은 일반 연구와 따로 모음
    index.all.forEach((it) => {
      if (!it.research) return;
      const disputed = it.research.filter((r) => isDisputed(r.status));
      const rest = it.research.filter((r) => !isDisputed(r.status));
      it.disputed = disputed.length ? disputed : undefined;
      it.research = rest.length ? rest : undefined;
    });
  })();

  // 제목 옆 표시(史 역사 기록, ✓ 확인됨, ○ 연구 중, ▲ 논란 많음)의 폭
  const markW = (it) =>
    (it.history ? 18 : 0) + (it.evidence ? 18 : 0) + (it.research ? 14 : 0) + (it.disputed ? 16 : 0);

  // 점 항목 이름표 폭 (점 오른쪽 8px부터 시작)
  const pointLabelW = (it) => textWidth(it.title, 12.5, 600) + 12 + markW(it);

  // 제목 + 표시
  function titleNodes(it) {
    const frag = document.createDocumentFragment();
    frag.append(it.title);
    if (it.history) frag.append(el("span", "hs-mark", { textContent: "史", title: "역사 기록으로 잘 알려진 사실" }));
    if (it.evidence) frag.append(el("span", "ev-mark", { textContent: "✓", title: "성경 밖 자료로 확인됨" }));
    if (it.research) frag.append(el("span", "rs-mark", { title: "진행 중인 연구·논쟁 (미확인)" }));
    if (it.disputed) frag.append(el("span", "dp-mark", { title: "논란 많은 주장" }));
    return frag;
  }

  const cfg = () => DATA[state.view];
  const ppy = () => state.ppy[state.view];

  const originX = () => laneHeadW() + 40;
  const laneHeadW = () => (isMobile() ? 92 : 128);

  // 연대 미상(?) 구간의 화면 폭: 연도 비율대로 그리되, 많이 축소해도 이름표가 들어갈 최소 폭은 유지
  function undatedW() {
    const c = cfg();
    const u = c.undatedBefore;
    if (u == null) return 0;
    const widest = Math.max(
      0,
      ...[...index[state.view].values()].filter((it) => it.undated && it.end == null).map(pointLabelW)
    );
    return Math.max((u - c.range[0]) * ppy(), widest + 60);
  }

  // 연도 → 화면 x (연대 미상 구간은 따로 늘이거나 줄여서 붙임)
  function xOf(y) {
    const c = cfg();
    const u = c.undatedBefore;
    if (u == null) return originX() + (y - c.range[0]) * ppy();
    const zw = undatedW();
    if (y < u) return originX() + ((y - c.range[0]) / (u - c.range[0])) * zw;
    return originX() + zw + (y - u) * ppy();
  }

  // 화면 x → 연도 (xOf의 역함수)
  function yearAt(px) {
    const c = cfg();
    const u = c.undatedBefore;
    if (u == null) return c.range[0] + (px - originX()) / ppy();
    const zw = undatedW();
    const d = px - originX();
    if (d < zw) return c.range[0] + (d / zw) * (u - c.range[0]);
    return u + (d - zw) / ppy();
  }

  const isVisible = (it) => !state.hidden[state.view].has(it.group);

  function visibleTimed() {
    return [...index[state.view].values()]
      .filter(isVisible)
      .sort((a, b) => a.start - b.start || (a.end ?? a.start) - (b.end ?? b.start));
  }

  function matchesQuery(it, q) {
    if (!q) return false;
    const hay = `${it.title} ${it.ref || ""} ${it.desc || ""}`.toLowerCase();
    return hay.includes(q);
  }

  // '같은 시기'로 보는 앞뒤 여유: 신약 시대(촘촘함)는 1년, 구약 시대는 12년
  const padFor = (it) => (it.start >= DATA.all.eras.nt[0] ? DATA.nt.concurrentPad : DATA.ot.concurrentPad);

  function concurrentWith(sel) {
    // 연대 미상 항목은 서로끼리만 같은 시기로 봄
    if (sel.undated) return visibleTimed().filter((it) => it.id !== sel.id && it.undated);
    const pad = padFor(sel);
    const s = sel.start - pad;
    const e = (sel.end ?? sel.start) + pad;
    return visibleTimed().filter(
      (it) => it.id !== sel.id && !it.undated && it.start <= e && (it.end ?? it.start) >= s
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

  // 항목의 화면 x 위치. 연대 미상(?) 점 항목은 연도가 아니라 순서만 의미가 있으므로
  // '?' 구간 폭에 맞춰 고르게 놓고, 이름표가 구간 경계를 넘지 않게 한다.
  function posX(it) {
    if (!it.undated || it.end != null) return xOf(it.start);
    const c = cfg();
    const list = [...index[state.view].values()].filter((u) => u.undated && u.end == null);
    const left = xOf(c.range[0]) + 16;
    const right = xOf(c.undatedBefore) - 10;
    // 각 항목이 차지하는 폭(점 + 이름표)을 빼고 남는 공간을 사이 간격으로 고르게 나눔
    const widths = list.map((u) => 15 + pointLabelW(u));
    const free = right - left - widths.reduce((a, w) => a + w, 0);
    const i = list.indexOf(it);
    if (list.length > 1 && free >= 6 * (list.length - 1)) {
      const gap = free / (list.length - 1);
      return left + widths.slice(0, i).reduce((a, w) => a + w + gap, 0);
    }
    // 공간이 모자라면(많이 축소한 경우) 고르게 놓고 겹치는 것은 다음 줄로
    const slot = list.length > 1 ? Math.max(0, right - left - widths[list.length - 1]) / (list.length - 1) : 0;
    return Math.max(left, Math.min(left + slot * i, right - 8 - pointLabelW(it)));
  }

  // ───────── 렌더링 ─────────
  let cursorLine, cursorYear, axisEl;
  const nodes = new Map(); // id -> element

  function render() {
    document.body.classList.toggle("mode-v", state.mode === "v");
    if (state.mode === "v") return renderVertical();
    const c = cfg();
    const totalW = Math.ceil(xOf(c.range[1]) + 80);
    canvas.innerHTML = "";
    nodes.clear();
    canvas.className = `canvas ${state.view}`;
    canvas.style.width = totalW + "px";

    renderAxis(totalW);
    const height = renderLanes(totalW);
    canvas.style.height = Math.max(height, viewport.clientHeight) + "px";

    // 마우스 위치 세로선 (항목 뒤) + 연도 표시 (연도 바 안)
    cursorLine = el("div", "cursor-line");
    cursorLine.style.height = parseFloat(canvas.style.height) - AXIS_H + "px";
    canvas.appendChild(cursorLine);
    cursorYear = el("span", "cursor-year");
    axisEl.appendChild(cursorYear);

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
    const u = c.undatedBefore;
    const first = Math.ceil((u ?? c.range[0]) / step) * step;

    if (u != null) {
      // 원역사(연대 미상) 구간 표시
      const zone = el("div", "undated-zone");
      zone.style.left = xOf(c.range[0]) + "px";
      zone.style.width = xOf(u) - xOf(c.range[0]) + "px";
      canvas.appendChild(zone);
      const t = el("div", "tick unknown", { textContent: "?  연대 미상" });
      t.style.left = xOf(c.range[0]) + "px";
      axis.appendChild(t);
    }

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
    axisEl = axis;
  }

  // ── 여러 줄(레인) 타임라인 ──
  function renderLanes(totalW) {
    const c = cfg();
    const ROW = 30;
    let y = AXIS_H;
    let alt = false;

    c.lanes.forEach((lane) => {
      if (state.hidden[state.view].has(lane.id)) return;
      const items = [...index[state.view].values()]
        .filter((i) => i.lane === lane.id)
        .sort((a, b) => a.start - b.start || (b.end ?? b.start) - (a.end ?? a.start));

      // 각 항목의 차지 영역 계산
      const layout = items.map((it) => {
        const x = posX(it);
        const ew = markW(it);
        const tw = textWidth(it.title, 12.5, 700) + 18 + ew;
        if (it.end != null) {
          const w = Math.max(6, xOf(it.end) - x);
          const inside = tw <= w;
          return { it, x, w, inside, left: x, right: inside ? x + w : x + w + 6 + tw };
        }
        return { it, x, left: x - 7, right: x + 8 + pointLabelW(it) };
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
        wrap.style.setProperty("--h", it.hue ?? lane.hue);
        wrap.style.left = "0";
        wrap.style.top = "0";

        if (it.end != null) {
          const bar = el("div", "bar" + (it.approx ? " approx" : ""));
          bar.style.left = L.x + "px";
          bar.style.top = rowTop + "px";
          bar.style.width = L.w + "px";
          bar.title = `${it.title} (${fmtRange(it)})`;
          if (L.inside) bar.appendChild(titleNodes(it));
          wrap.appendChild(bar);
          if (!L.inside) {
            const bl = el("div", "bar-label");
            bl.appendChild(titleNodes(it));
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
          label.appendChild(titleNodes(it));
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

  // ── 세로 보기 (모바일 기본) ──
  // 시대별로 묶어 위에서 아래로 시간순 나열. 신약 시대(split)는 10년 단위로 다시 나눔

  // a년부터 step년 동안의 구간 제목과 그 시기 통치자(로마 황제·유대 통치자)
  function decadeSection(a, step, list, period) {
    const b = a + step - 1;
    const range = a < 0 ? `BC ${-a}–${Math.max(1, -b)}년` : a === 0 ? `AD 1–${b}년` : `AD ${a}–${b}년`;
    const ruling = [...index.all.values()]
      .filter((r) => RULER_LANES.has(r.origLane) && isVisible(r) && r.end != null && r.start < a + step && r.end > a)
      .filter((r) => !["prefects", "procurators"].includes(r.id))
      .map((r) => r.title);
    return {
      id: period?.id,
      title: period ? `${period.title} · ${range}` : range,
      sub: ruling.join(" · "),
      items: list,
      start: a
    };
  }

  function verticalSections(items) {
    const c = cfg();
    if (!state.hidden.all.has("period")) {
      // 같은 해에 시작하는 시대(북이스라엘·남유다)는 한 구간으로 합침
      const heads = [];
      [...index.all.values()]
        .filter((p) => p.lane === "period")
        .sort((a, b) => a.start - b.start)
        .forEach((p) => {
          const prev = heads[heads.length - 1];
          if (prev && prev.start === p.start) {
            prev.title += " · " + p.title;
            prev.end = Math.max(prev.end, p.end);
          } else heads.push({ id: p.id, start: p.start, end: p.end, title: p.title, undated: p.undated, split: p.split, items: [] });
        });
      items.forEach((it) => {
        const h = [...heads].reverse().find((h) => h.start <= it.start) || heads[0];
        h.items.push(it);
      });
      return heads.flatMap((h) => {
        if (!h.split) return [{ ...h, sub: h.undated ? "연대 미상" : `${fmtYear(h.start)} – ${fmtYear(h.end)}` }];
        // 신약 시대: 10년 단위로 나누고, 첫 구간 제목만 시대를 누를 수 있게 함
        const byDecade = new Map();
        h.items.forEach((it) => {
          const k = Math.floor(it.start / h.split) * h.split;
          if (!byDecade.has(k)) byDecade.set(k, []);
          byDecade.get(k).push(it);
        });
        return [...byDecade.keys()]
          .sort((a, b) => a - b)
          .map((k, i) => decadeSection(k, h.split, byDecade.get(k), i === 0 ? h : { title: h.title }));
      });
    }
    // 시대 줄을 숨긴 경우: 구약 시대는 100년, 신약 시대는 10년 단위
    const map = new Map();
    items.forEach((it) => {
      const step = it.start >= DATA.all.eras.nt[0] ? 10 : 100;
      const key = it.undated ? "?" : `${Math.floor(it.start / step) * step}/${step}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    });
    return [...map.entries()].map(([k, list]) => {
      if (k === "?") return { title: "원역사", sub: "연대 미상", items: list, start: c.range[0] };
      const [a, step] = k.split("/").map(Number);
      return decadeSection(a, step, list);
    });
  }

  function vYear(it) {
    if (it.undated) return "?";
    const pre = it.approx ? "약 " : "";
    if (it.end == null) return pre + fmtYear(it.start);
    const a = fmtYear(it.start);
    const b = fmtYear(it.end);
    return pre + (a.slice(0, 2) === b.slice(0, 2) ? `${a}–${b.slice(3)}` : `${a}–${b}`);
  }

  function renderVertical() {
    canvas.innerHTML = "";
    nodes.clear();
    cursorLine = null;
    canvas.className = `canvas vlist ${state.view}`;
    canvas.style.width = "";
    canvas.style.height = "";

    const showPeriodsAsHeads = !state.hidden.all.has("period");
    const items = visibleTimed().filter((it) => !(showPeriodsAsHeads && it.lane === "period"));
    const sections = verticalSections(items).filter((s) => s.items.length || s.id);

    sections.forEach((s) => {
      const sec = el("section", "v-sec");
      const head = el("header", "v-head");
      const h = el("div", "v-head-title", { textContent: s.title });
      head.appendChild(h);
      if (s.sub) head.appendChild(el("div", "v-head-sub", { textContent: s.sub, title: s.sub }));
      if (s.id) {
        // 시대 제목을 누르면 그 시대 설명
        head.classList.add("item", "v-period");
        head.dataset.id = s.id;
        head.style.setProperty("--h", index.all.get(s.id).hue);
        nodes.set(s.id, head);
      }
      sec.appendChild(head);

      const ul = el("ol", "v-list");
      s.items
        .sort((a, b) => a.start - b.start)
        .forEach((it) => {
          const lane = groupOf[state.view][it.group];
          const li = el("li", "item v-row");
          li.dataset.id = it.id;
          li.style.setProperty("--h", it.hue ?? lane.hue);
          li.appendChild(el("div", "v-year", { textContent: vYear(it) }));
          const rail = el("div", "v-rail");
          rail.appendChild(el("span", "v-dot" + (it.approx ? " approx" : "") + (it.end != null ? " span" : "")));
          li.appendChild(rail);
          const card = el("div", "v-card");
          const t = el("div", "v-title");
          t.appendChild(titleNodes(it));
          card.appendChild(t);
          card.appendChild(el("div", "v-lane", { textContent: lane.name }));
          li.appendChild(card);
          ul.appendChild(li);
          nodes.set(it.id, li);
        });
      sec.appendChild(ul);
      canvas.appendChild(sec);
    });

    if (!sections.length) canvas.appendChild(el("p", "v-empty", { textContent: "표시할 항목이 없습니다. 범례에서 줄을 켜 주세요." }));
    applyHighlights();
  }

  function renderGuide() {
    const sel = state.selected && index[state.view].get(state.selected);
    if (!sel || state.mode === "v") return;
    const h = parseFloat(canvas.style.height) - AXIS_H;
    if (!sel.undated) {
      const pad = padFor(sel);
      const band = el("div", "guide-band");
      const l = xOf(sel.start - pad);
      band.style.left = l + "px";
      band.style.width = xOf((sel.end ?? sel.start) + pad) - l + "px";
      band.style.height = h + "px";
      canvas.appendChild(band);
    }
    const xs = sel.end != null ? [xOf(sel.start), xOf(sel.end)] : [posX(sel)];
    xs.forEach((x) => {
      const g = el("div", "guide");
      g.style.left = x + "px";
      g.style.height = h + "px";
      canvas.appendChild(g);
    });
  }

  function applyHighlights() {
    const q = state.query;
    const sel = state.selected && index[state.view].get(state.selected);
    const concurrent = sel ? new Set(concurrentWith(sel).map((i) => i.id)) : null;

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
    cfg().lanes.forEach((g) => {
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
    detailBody.appendChild(el("div", "d-year", { textContent: it.undated ? "? (연대 미상)" : fmtRange(it) }));
    detailBody.appendChild(el("h2", "d-title", { textContent: it.title }));
    if (it.ref) detailBody.appendChild(el("div", "d-ref", { textContent: "📖 " + it.ref }));
    if (it.desc) detailBody.appendChild(el("p", "d-desc", { textContent: it.desc }));

    // 출처 링크 목록
    const sourceList = (sources) => {
      const wrap = el("div", "src");
      wrap.appendChild(el("span", "src-label", { textContent: "출처" }));
      const ul = el("ul");
      sources.forEach((s) => {
        const li = el("li");
        li.appendChild(el("a", "", { href: s.url, textContent: s.label, target: "_blank", rel: "noopener noreferrer" }));
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      return wrap;
    };

    if (it.history) {
      const box = el("section", "d-history");
      box.appendChild(el("h3", "", { textContent: "史 역사 기록" }));
      box.appendChild(el("p", "ev-text", { textContent: it.history.text }));
      if (it.history.sources) box.appendChild(sourceList(it.history.sources));
      detailBody.appendChild(box);
    }

    if (it.evidence) {
      const box = el("section", "d-evidence");
      box.appendChild(el("h3", "", { textContent: "✓ 성경 밖 자료로 확인된 내용" }));
      it.evidence.forEach((ev) => {
        const card = el("div", "ev-card");
        card.appendChild(el("div", "ev-title", { textContent: ev.title }));
        if (ev.year) card.appendChild(el("div", "ev-year", { textContent: ev.year }));
        if (ev.doubt) {
          const d = el("p", "ev-doubt");
          d.append(el("b", "", { textContent: "이전 견해 " }), ev.doubt);
          card.appendChild(d);
        }
        const t = el("p", "ev-text");
        if (ev.doubt) t.append(el("b", "", { textContent: "확인 " }));
        t.append(ev.text);
        card.appendChild(t);
        if (ev.sources) card.appendChild(sourceList(ev.sources));
        box.appendChild(card);
      });
      detailBody.appendChild(box);
    }

    // 연구 카드 상자 (진행 중인 연구 / 논란 많음 공용)
    const researchBox = (list, cls, heading, note) => {
      const box = el("section", cls);
      box.appendChild(el("h3", "", { textContent: heading }));
      box.appendChild(el("p", "rs-note", { textContent: `${note} (${window.TIMELINE_RESEARCH_DATE} 기준)` }));
      list.forEach((r) => {
        const card = el("div", "rs-card");
        const head = el("div", "rs-head");
        head.append(el("span", "rs-status", { textContent: r.status }), el("span", "rs-title", { textContent: r.title }));
        card.appendChild(head);
        if (r.who) card.appendChild(el("div", "ev-year", { textContent: r.who }));
        const t = el("p", "ev-text");
        t.append(el("b", "rs-tag", { textContent: "내용" }), r.text);
        card.appendChild(t);
        if (r.view) {
          const v = el("p", "ev-text");
          v.append(el("b", "rs-tag view", { textContent: "현재 평가" }), r.view);
          card.appendChild(v);
        }
        if (r.sources) card.appendChild(sourceList(r.sources));
        box.appendChild(card);
      });
      detailBody.appendChild(box);
    };

    if (it.research) {
      researchBox(
        it.research,
        "d-research",
        "진행 중인 연구 · 논쟁 · 미확인",
        "아래 내용은 확인된 사실이 아니라 조사·논쟁 중인 주장입니다."
      );
    }

    if (it.disputed) {
      researchBox(
        it.disputed,
        "d-research d-disputed",
        "▲ 논란 많은 주장",
        "학계 다수가 받아들이지 않거나, 진위·검증·연구 윤리에 큰 문제가 제기된 주장입니다."
      );
    }

    // 이전/다음
    {
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
      const pad = padFor(it);
      const sec = el("div", "d-section");
      sec.innerHTML = it.undated ? `같은 시기 <small>(원역사 · 연대 미상)</small>` : `같은 시기 <small>(앞뒤 ${pad}년 포함)</small>`;
      detailBody.appendChild(sec);
      const conc = concurrentWith(it);
      if (!conc.length) {
        detailBody.appendChild(el("div", "d-empty", { textContent: "같은 시기의 다른 항목이 없습니다." }));
      }
      const order = cfg().lanes.map((l) => l.id);
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
          b.children[0].textContent = x.undated
            ? "?"
            : x.end != null
              ? `${fmtYear(x.start)}–${fmtYear(x.end).replace(/^(AD|BC) /, "")}`
              : fmtYear(x.start);
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
    history.replaceState(null, "", it ? `#${id}` : location.pathname + location.search);
    // 가이드 선을 다시 그리기 위해 기존 가이드만 교체
    canvas.querySelectorAll(".guide, .guide-band").forEach((n) => n.remove());
    renderGuide();
    applyHighlights();
    showDetail();
    if (scroll && it) scrollToItem(it);
  }

  function scrollToItem(it, smooth = true) {
    const node = nodes.get(it.id);
    if (state.mode === "v") {
      // 세로 보기: 고정된 구간 제목 아래, 화면 위쪽에 오도록
      if (!node) return;
      const head = node.closest(".v-sec")?.querySelector(".v-head");
      const offset = (head && !node.classList.contains("v-head") ? head.offsetHeight : 0) + 10;
      viewport.scrollTo({ top: Math.max(0, node.offsetTop - offset), behavior: smooth ? "smooth" : "auto" });
      return;
    }
    const vw = viewport.clientWidth;
    const midX = it.end != null ? xOf((it.start + it.end) / 2) : posX(it);
    const left = midX - (vw + laneHeadW()) / 2;
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

  // 구약 시대 / 신약 시대 / 전체로 바로 이동
  function jumpTo(era) {
    document.querySelectorAll(".tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.jump === era)));
    const all = DATA.all;
    if (state.mode === "v") {
      const target = era === "nt" ? nodes.get("p-jesus") : null;
      viewport.scrollTo({ top: target ? target.offsetTop : 0, behavior: "smooth" });
      return;
    }
    const [a, b] = era === "all" ? all.range : all.eras[era];
    const avail = viewport.clientWidth - originX() - 40;
    const clamp = (v) => Math.min(all.zoom.max, Math.max(all.zoom.min, v));
    state.ppy.all = clamp(avail / (b - a));
    // 원역사(?) 구간은 최소 폭이 있어 비율이 달라지므로, 실제 폭을 재서 두 번 보정
    for (let i = 0; i < 2; i++) state.ppy.all = clamp(state.ppy.all * (avail / (xOf(b) - xOf(a))));
    render();
    viewport.scrollLeft = Math.max(0, xOf(a) - originX());
  }

  function initialScroll() {
    viewport.scrollTo({ left: 0, top: 0 });
  }

  // ───────── 확대/축소 ─────────
  function setZoom(newPpy, anchorClientX) {
    if (state.mode === "v") return;
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

  function rerenderKeepingCenter() {
    if (state.mode === "v") {
      const top = viewport.scrollTop;
      render();
      viewport.scrollTop = top;
      if (state.selected) showDetail();
      return;
    }
    const year = yearAt(viewport.scrollLeft + viewport.clientWidth / 2);
    const top = viewport.scrollTop;
    render();
    viewport.scrollLeft = xOf(year) - viewport.clientWidth / 2;
    viewport.scrollTop = top;
    if (state.selected) showDetail();
  }

  // ───────── 이벤트 ─────────
  document.querySelectorAll(".tabs button").forEach((b) =>
    b.addEventListener("click", () => jumpTo(b.dataset.jump))
  );

  $("#zoom-in").addEventListener("click", () => setZoom(ppy() * 1.5));
  $("#zoom-out").addEventListener("click", () => setZoom(ppy() / 1.5));
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
      // Enter를 누를 때마다 다음 검색 결과로 이동
      const hits = visibleTimed().filter((it) => matchesQuery(it, q));
      if (!hits.length) return;
      const cur = hits.findIndex((h) => h.id === state.selected);
      state.query = q;
      select(hits[(cur + 1) % hits.length].id, { scroll: true });
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
    // 모바일 세로 보기에서는 아래에서 올라오는 패널에 가리지 않도록 누른 항목을 위로 올림
    if (node) select(node.dataset.id, { scroll: state.mode === "v" && isMobile() });
    else select(null);
  });

  // 마우스 위치 연도 표시
  function hideCursor() {
    if (!cursorLine) return;
    cursorLine.style.display = "none";
    cursorYear.style.display = "none";
  }
  viewport.addEventListener("mousemove", (e) => {
    if (!cursorLine) return;
    const vr = viewport.getBoundingClientRect();
    const lx = e.clientX - vr.left;
    const ly = e.clientY - vr.top;
    // 줄 이름 칸이나 스크롤바 위에서는 숨김 (clientWidth/Height는 스크롤바 제외 크기)
    if (lx < laneHeadW() || lx >= viewport.clientWidth || ly >= viewport.clientHeight) return hideCursor();
    const px = lx + viewport.scrollLeft;
    const yv = yearAt(px);
    const c = cfg();
    if (yv < c.range[0] || yv > c.range[1]) return hideCursor();
    cursorLine.style.display = "block";
    cursorLine.style.left = px + "px";
    cursorYear.style.display = "block";
    cursorYear.style.left = px + "px";
    cursorYear.textContent = yearText(yv);
  });
  viewport.addEventListener("mouseleave", hideCursor);

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
    if (state.mode === "v" || e.pointerType !== "mouse" || e.button !== 0) return;
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
      if (e.touches.length === 2 && state.mode === "h") {
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
      if (idx === -1 && state.mode === "v") {
        idx = 0;
      } else if (idx === -1) {
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
  // 세로/가로 보기 전환 (선택은 이 브라우저에만 기억)
  const modeBtn = $("#mode");
  function updateModeBtn() {
    modeBtn.textContent = state.mode === "v" ? "가로 보기" : "세로 보기";
    modeBtn.setAttribute("aria-label", state.mode === "v" ? "가로 타임라인으로 보기" : "세로 목록으로 보기");
  }
  modeBtn.addEventListener("click", () => {
    state.mode = state.mode === "v" ? "h" : "v";
    try { localStorage.setItem("bible-timeline-mode", state.mode); } catch (e) { /* 무시 */ }
    updateModeBtn();
    render();
    if (state.selected) scrollToItem(index[state.view].get(state.selected), false);
    else initialScroll();
  });
  {
    let saved = null;
    try { saved = localStorage.getItem("bible-timeline-mode"); } catch (e) { /* 무시 */ }
    state.mode = saved === "h" || saved === "v" ? saved : isMobile() ? "v" : "h";
    updateModeBtn();
  }

  function boot() {
    renderLegend();
    render();
    initialScroll();
    // 주소의 #항목id로 바로 열기 (예전 #ot/…, #nt/… 링크도 지원)
    const id = location.hash.replace(/^#/, "").split("/").pop();
    if (id && index.all.has(id)) select(id, { scroll: true });
  }
  boot();
})();
