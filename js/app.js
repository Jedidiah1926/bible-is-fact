(() => {
  "use strict";

  const DATA = window.TIMELINE_DATA;

  // ───────── 구약·신약을 하나의 타임라인으로 합침 ─────────
  // 신약의 로마 황제·유대 통치자·사건 줄은 공통 줄로 옮기고, 색은 원래 줄 색을 유지함
  // 주변 세계(제국·로마 황제·역사 사건)는 맨 위 '시대' 줄에 합침 → '시대·세계사'
  const NT_LANE_MAP = { rome: "period", judea: "king", history: "period" };
  const OT_LANE_MAP = { world: "period" };
  const RULER_LANES = new Set(["rome", "judea"]); // 세로 보기 구간 제목에 '그 시기 통치자'로 표시
  DATA.all = (() => {
    const { ot, nt } = DATA;
    const otLane = (id) => ot.lanes.find((l) => l.id === id);
    const ntLane = (id) => nt.lanes.find((l) => l.id === id);
    return {
      range: [ot.range[0], nt.range[1]],
      undatedBefore: ot.undatedBefore,
      // 신약 시대는 축척이 10배라, 최대 확대는 구약 기준 1/10 (신약 시대 기준으로는 원래 최대치)
      // (최소 확대는 '전체'가 넓은 화면에도 들어가도록 낮게 — 실제 한계는 화면을 꽉 채우는 지점)
      zoom: { min: 0.05, max: nt.zoom.max / 10, initial: ot.zoom.initial },
      eras: { ot: [ot.range[0], -4], nt: [-40, nt.range[1]] },
      lanes: [
        { ...otLane("period"), name: "시대·세계사" },
        otLane("event"),
        otLane("people"),
        { ...otLane("king"), name: "왕·통치자" },
        otLane("prophet"),
        ntLane("jesus"),
        ntLane("miracle"),
        ntLane("church"),
        ntLane("paul"),
        ntLane("writings")
      ],
      periods: ot.periods,
      prologue: ot.prologue,
      items: [
        ...ot.items.map((i) =>
          OT_LANE_MAP[i.lane] ? { ...i, lane: OT_LANE_MAP[i.lane], hue: i.hue ?? otLane(i.lane).hue } : i
        ),
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
  const detailToggle = $("#detail-toggle");
  const searchInput = $("#search");

  const AXIS_H = 34;
  const FONT = getComputedStyle(document.documentElement).getPropertyValue("--font").trim();

  const state = {
    view: "all", // 구약·신약 통합 타임라인
    ppy: { all: DATA.all.zoom.initial }, // pixels per year
    selected: null,
    query: "",
    hidden: { all: new Set() },
    expanded: { jesus: false }, // 접기/펼치기 묶음 (예수의 기적·공생애 보충)
    mode: "h", // "h" 가로형, "v" 카드형(시대별 목록), "t" 세로형 연표
    tz: 1, // 세로형 확대 배율
    panelOpen: false // 모바일 세로형: 설명 패널은 상단 '설명' 버튼으로 열고 닫음 (아래쪽 앵커 광고와 겹치지 않게)
  };

  // ───────── 유틸 ─────────
  const measureCtx = document.createElement("canvas").getContext("2d");
  function textWidth(text, size = 13, weight = 600) {
    measureCtx.font = `${weight} ${size}px ${FONT}`;
    return Math.ceil(measureCtx.measureText(text).width);
  }

  function fmtYear(y) {
    // AD의 소수 연도(같은 해 안의 순서)는 그해로 표시
    const r = y >= 0 ? Math.floor(y) : Math.round(y);
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
  // 모바일 세로형: 설명 패널을 상단 '설명' 버튼으로 열고 위쪽에서 내림 (아래 앵커 광고와 겹치지 않게)
  const panelByButton = () => isMobile() && state.mode === "t";

  // ───────── 데이터 색인 ─────────
  const index = { all: new Map() };
  const groupOf = { all: {} }; // view -> id -> {name, hue}

  (function buildIndex() {
    const all = DATA.all;
    all.lanes.forEach((l) => (groupOf.all[l.id] = l));
    all.periods.forEach((p) => index.all.set(p.id, { ...p, lane: "period", group: "period", isPeriod: true }));
    // 원역사: 연대 미상('?') 구간에 성경 순서대로 놓음 (위치는 순서만 의미)
    const [a, b] = [all.range[0], all.undatedBefore];
    all.prologue.forEach((p, i) =>
      index.all.set(p.id, {
        ...p,
        lane: p.lane || "event",
        group: p.lane || "event",
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

  const originX = () => laneHeadW(); // 줄 이름 칸 바로 뒤에서 시작
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

  // 신약 시대(BC 40~)는 항목이 촘촘해 축척을 10배로 키움 (가로형·세로형 공통, 축에 표시)
  const NT_SCALE = 10;
  const ntStart = () => DATA.all.eras.nt[0];

  // 연도 → 화면 x (연대 미상 구간은 따로 늘이거나 줄여서 붙이고, 신약 시대는 10배)
  function xOf(y) {
    const c = cfg();
    const u = c.undatedBefore;
    const n = ntStart();
    const zw = undatedW();
    if (y < u) return originX() + ((y - c.range[0]) / (u - c.range[0])) * zw;
    if (y <= n) return originX() + zw + (y - u) * ppy();
    return originX() + zw + (n - u) * ppy() + (y - n) * ppy() * NT_SCALE;
  }

  // 화면 x → 연도 (xOf의 역함수)
  function yearAt(px) {
    const c = cfg();
    const u = c.undatedBefore;
    const n = ntStart();
    const zw = undatedW();
    const d = px - originX();
    if (d < zw) return c.range[0] + (d / zw) * (u - c.range[0]);
    const ot = (n - u) * ppy();
    if (d - zw <= ot) return u + (d - zw) / ppy();
    return n + (d - zw - ot) / (ppy() * NT_SCALE);
  }

  const isVisible = (it) => !state.hidden[state.view].has(it.group) && !(it.fold && !state.expanded[it.fold]);

  // 접기/펼치기 묶음
  const FOLD_INFO = { jesus: { label: "예수의 기적·공생애", range: [27, 30.4] } };
  // 묶음에 속한 항목 수 (lane을 주면 그 줄에 있는 것만)
  const foldCount = (f, lane) => [...index.all.values()].filter((it) => it.fold === f && (!lane || it.lane === lane)).length;
  // 그 줄에 접히는 항목이 있으면 묶음 이름을 돌려줌
  const laneFold = (lane) => lane.fold || [...index.all.values()].find((it) => it.lane === lane.id && it.fold)?.fold;

  function setFold(f, open) {
    if (state.expanded[f] === open) return;
    state.expanded[f] = open;
    rerenderKeepingCenter();
  }

  function foldButton(f, long, lane) {
    const open = state.expanded[f];
    const n = foldCount(f, lane);
    return el("button", "fold-btn" + (open ? " open" : ""), {
      textContent: open ? "▾ 접기" : long ? `▸ ${FOLD_INFO[f].label} ${n}개 펼치기` : `▸ 펼치기 (${n})`,
      title: open ? "기적·공생애 항목 접기" : "기적·공생애 항목 펼치기"
    });
  }

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
    // 같은 줄에 있는 연대 미상 항목끼리 나눠 배치
    const list = [...index[state.view].values()].filter((u) => u.undated && u.end == null && u.lane === it.lane);
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
    document.body.classList.toggle("mode-t", state.mode === "t");
    if (state.mode === "v") return renderVertical();
    if (state.mode === "t") return renderColumns();
    state.ppy.all = Math.max(state.ppy.all, minPpy()); // 화면보다 좁아지지 않게 (창 크기 변경 등)
    const c = cfg();
    const totalW = Math.ceil(xOf(c.range[1])); // 마지막 연도에서 딱 끝남
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

  function tickStep(pxPerYear = ppy()) {
    const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500];
    return steps.find((s) => s * pxPerYear >= 64) || 1000;
  }

  function renderAxis(totalW) {
    const c = cfg();
    const axis = el("div", "axis");
    axis.style.width = totalW + "px";
    const u = c.undatedBefore;
    const n = ntStart();

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

    // 눈금: 구약 시대와 신약 시대(10배)를 각자의 간격으로
    const ticks = [];
    const so = tickStep(ppy());
    for (let y = Math.ceil(u / so) * so; y < n; y += so) ticks.push([y, so]);
    const sn = tickStep(ppy() * NT_SCALE);
    for (let y = Math.ceil(n / sn) * sn; y <= c.range[1]; y += sn) ticks.push([y, sn]);
    // 구약 마지막 눈금이 신약 시작 눈금과 너무 붙으면 생략
    const xn = xOf(n);
    for (const [y, step] of ticks) {
      const x = xOf(y);
      if (x > xOf(c.range[1]) - 48) break; // 끝에 붙은 눈금 글자가 화면 밖으로 넘치지 않게
      if (y < n && x > xn - 56) continue;
      const isEra = y === 0;
      const t = el("div", "tick" + (isEra ? " era" : y % (step * 5) === 0 ? " major" : ""));
      t.style.left = x + "px";
      t.textContent = isEra ? "BC | AD" : fmtYear(y);
      axis.appendChild(t);

      const g = el("div", "gridline");
      g.style.left = x + "px";
      canvas.appendChild(g);
    }
    // 축척이 바뀌는 지점 표시
    const sm = el("div", "scale-mark");
    sm.style.left = xn + "px";
    sm.appendChild(el("span", "", { textContent: "신약 시대부터 축척 10배 →" }));
    canvas.appendChild(sm);

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
        .filter((i) => i.lane === lane.id && isVisible(i))
        // 시대 막대를 먼저 배치해 줄 맨 위에 오게 하고, 세계사(제국·사건)는 그 아래
        .sort((a, b) => (b.isPeriod ? 1 : 0) - (a.isPeriod ? 1 : 0) || a.start - b.start || (b.end ?? b.start) - (a.end ?? a.start));

      // 각 항목의 차지 영역 계산
      const layout = items.map((it) => {
        const x = posX(it);
        const ew = markW(it);
        const tw = textWidth(it.title, 12.5, 700) + 18 + ew;
        if (it.end != null) {
          // 타임라인 끝(AD 110) 뒤로 이어지는 기간은 끝에서 자르고 '이어짐' 표시
          const cont = it.end > c.range[1];
          const w = Math.max(6, xOf(Math.min(it.end, c.range[1])) - x);
          const inside = tw + (cont ? 22 : 0) <= w; // 이어짐(→) 표시 자리까지 고려
          // 막대 안에 이름이 안 들어가면 이름을 막대 왼쪽에 둠 (오른쪽은 타임라인 끝)
          if (cont && !inside) return { it, x, w, inside, cont, labelX: x - 6 - (tw - 18), left: x - 6 - tw, right: x + w };
          // 막대 오른쪽 이름표가 타임라인 끝을 넘으면 왼쪽에 둠
          if (!inside && x + w + 6 + tw > xOf(c.range[1])) return { it, x, w, inside, cont, labelX: x - 6 - (tw - 18), left: x - 6 - tw, right: x + w };
          return { it, x, w, inside, cont, left: x, right: inside ? x + w : x + w + 6 + tw };
        }
        // 타임라인 끝에 가까워 이름표가 넘치면 점 왼쪽에 둠
        const lw = pointLabelW(it);
        if (x + 8 + lw > xOf(c.range[1])) return { it, x, labelX: x - 8 - lw, left: x - 8 - lw, right: x + 7 };
        return { it, x, left: x - 7, right: x + 8 + lw };
      });
      // 접힌 줄: 묶음 전체를 요약 막대 하나로 표시 (누르면 펼침)
      const fold = laneFold(lane);
      const collapsedBar = lane.fold && !state.expanded[lane.fold];
      if (collapsedBar) {
        const [a, b] = FOLD_INFO[lane.fold].range;
        layout.push({ summary: true, x: xOf(a), w: Math.max(6, xOf(b) - xOf(a)), left: xOf(a), right: xOf(b) + 260 });
      }
      // 시대 막대는 위쪽 행에만, 나머지(세계사 등)는 그 아래 행부터 배치
      const isP = (L) => L.it && L.it.isPeriod;
      const pRows = packRows(layout.filter(isP));
      const pCount = pRows.length ? Math.max(...pRows) + 1 : 0;
      const oRows = packRows(layout.filter((L) => !isP(L))).map((r) => r + pCount);
      let pi = 0, oi = 0;
      const rows = layout.map((L) => (isP(L) ? pRows[pi++] : oRows[oi++]));
      const rowCount = Math.max(1, items.length ? Math.max(...rows) + 1 : 1);
      const laneH = rowCount * ROW + 14;

      const band = el("div", "lane" + (alt ? " alt" : ""));
      alt = !alt;
      band.style.top = y + "px";
      band.style.height = laneH + "px";
      band.style.width = totalW + "px";
      const head = el("div", "lane-head");
      head.appendChild(el("span", "", { textContent: lane.name }));
      if (fold) {
        const fb = foldButton(fold, false, lane.id);
        fb.dataset.fold = fold;
        head.appendChild(fb);
      }
      head.style.setProperty("--h", lane.hue);
      band.appendChild(head);
      canvas.appendChild(band);

      layout.forEach((L, i) => {
        const it = L.it;
        const rowTop = y + 7 + rows[i] * ROW + 3;
        if (L.summary) {
          const bar = el("div", "bar fold-bar");
          bar.dataset.fold = lane.fold;
          bar.style.setProperty("--h", lane.hue);
          bar.style.left = L.x + "px";
          bar.style.top = rowTop + "px";
          bar.style.width = L.w + "px";
          const text = `${lane.name} ${foldCount(lane.fold, lane.id)}가지 · 눌러서 펼치기 ▸`;
          const lbl = el("div", "bar-label fold-bar-label", { textContent: text });
          lbl.dataset.fold = lane.fold;
          const lw = textWidth(text, 12.5, 800);
          // 타임라인 끝을 넘으면 막대 왼쪽에
          lbl.style.left = (L.x + L.w + 6 + lw > xOf(c.range[1]) ? L.x - 6 - lw : L.x + L.w + 6) + "px";
          lbl.style.top = rowTop + "px";
          canvas.append(bar, lbl);
          return;
        }
        const wrap = el("div", "item");
        wrap.dataset.id = it.id;
        wrap.style.setProperty("--h", it.hue ?? lane.hue);
        wrap.style.left = "0";
        wrap.style.top = "0";

        if (it.end != null) {
          // 이어짐(→) 표시는 막대가 충분히 넓을 때만
          const bar = el("div", "bar" + (it.approx ? " approx" : "") + (L.cont && L.w >= 40 ? " cont" : ""));
          if (L.w < 24) bar.style.padding = "0"; // 아주 좁은 막대는 안쪽 여백 때문에 실제 폭이 늘지 않게
          bar.style.left = L.x + "px";
          bar.style.top = rowTop + "px";
          bar.style.width = L.w + "px";
          bar.title = `${it.title} (${fmtRange(it)})`;
          if (L.inside) bar.appendChild(titleNodes(it));
          wrap.appendChild(bar);
          if (!L.inside) {
            const bl = el("div", "bar-label");
            bl.appendChild(titleNodes(it));
            bl.style.left = (L.labelX ?? L.x + L.w + 6) + "px";
            bl.style.top = rowTop + "px";
            wrap.appendChild(bl);
          }
        } else {
          const dot = el("div", "dot" + (it.approx ? " approx" : ""));
          dot.style.left = L.x + "px";
          dot.style.top = rowTop + 12 + "px";
          const label = el("div", "label");
          label.style.left = (L.labelX ?? L.x + 8) + "px";
          if (L.labelX != null) label.classList.add("left");
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
        .filter((p) => p.isPeriod)
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
    const items = visibleTimed().filter((it) => !(showPeriodsAsHeads && it.isPeriod));
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
      if (s.id === "p-jesus") {
        const fb = foldButton("jesus", true);
        fb.dataset.fold = "jesus";
        fb.classList.add("v-fold");
        sec.appendChild(fb);
      }

      const ul = el("ol", "v-list");
      s.items
        .sort((a, b) => a.start - b.start)
        .forEach((it) => {
          const lane = groupOf[state.view][it.group];
          const li = el("li", "item v-row");
          li.dataset.id = it.id;
          li.style.setProperty("--h", it.hue ?? lane.hue);
          // 목록형: [세로선·점] [제목 / 연도 · 분류]
          const rail = el("div", "v-rail");
          rail.appendChild(el("span", "v-dot" + (it.approx ? " approx" : "") + (it.end != null ? " span" : "")));
          li.appendChild(rail);
          const body = el("div", "v-body");
          const t = el("div", "v-title");
          t.appendChild(titleNodes(it));
          body.appendChild(t);
          const meta = el("div", "v-meta");
          meta.append(el("span", "v-year", { textContent: vYear(it) }), el("span", "v-lane", { textContent: lane.name }));
          body.appendChild(meta);
          li.appendChild(body);
          ul.appendChild(li);
          nodes.set(it.id, li);
        });
      sec.appendChild(ul);
      canvas.appendChild(sec);
    });

    if (!sections.length) canvas.appendChild(el("p", "v-empty", { textContent: "표시할 항목이 없습니다. 범례에서 줄을 켜 주세요." }));
    applyHighlights();
  }

  // ── 세로형 연표 (열 = 줄, 위→아래 = 시간) ──
  // 구약 시대와 신약 시대는 항목 밀도가 크게 달라, 신약 시대(BC 40~)는 축척을 키워 그림 (축에 표시)
  const T = {
    AXIS_W: 58,
    HEAD_H: 46,
    ROW: 26,
    OT: 3, // 구약 시대 1년당 px
    NT: 3 * NT_SCALE, // 신약 시대 1년당 px
    cols: new Map(),
    subW: () => (isMobile() ? 118 : 150),
    spanLabels: [],
    zoneH() {
      const c = cfg();
      const per = {};
      index.all.forEach((it) => {
        if (it.undated && it.end == null && isVisible(it)) per[it.lane] = (per[it.lane] || 0) + 1;
      });
      // 원역사 구간은 가장 많은 열의 항목 수만큼만 (연대가 없으니 길이에 의미 없음)
      return Math.max(120, Math.max(0, ...Object.values(per)) * T.ROW + 24);
    },
    yOf(y) {
      const c = cfg(), u = c.undatedBefore, n = DATA.all.eras.nt[0], z = state.tz;
      const top = T.HEAD_H;
      if (y < u) return top + ((y - c.range[0]) / (u - c.range[0])) * T._zh;
      if (y < n) return top + T._zh + (y - u) * T.OT * z;
      return top + T._zh + (n - u) * T.OT * z + (y - n) * T.NT * z;
    },
    // 연대 미상 점 항목: 같은 열 안에서 순서대로 한 줄씩
    posY(it) {
      if (!it.undated || it.end != null) return T.yOf(it.start);
      const list = [...index.all.values()].filter((u) => u.undated && u.end == null && u.lane === it.lane && isVisible(u));
      return T.HEAD_H + 18 + list.indexOf(it) * T.ROW;
    }
  };

  function renderColumns() {
    const c = cfg();
    canvas.innerHTML = "";
    nodes.clear();
    cursorLine = null;
    canvas.className = "canvas tcols";
    T._zh = T.zoneH();
    T.cols.clear();
    T.spanLabels = [];
    const SUBW = T.subW();
    const endY = T.yOf(c.range[1]);
    const totalH = Math.ceil(endY + 40);

    // 열 구성: '시대·세계사' 줄은 세로형에서 둘로 나눔
    //  - 시대: 연도 축 옆의 좁은 띠 (세로 글씨)
    //  - 세계사: 맨 오른쪽 열
    const columns = [];
    let worldCol = null;
    c.lanes.forEach((lane) => {
      if (state.hidden.all.has(lane.id)) return;
      if (lane.id === "period") {
        columns.push({ key: "period", lane, name: "시대", narrow: true, filter: (it) => it.isPeriod });
        worldCol = { key: "world", lane, name: "세계사", filter: (it) => !it.isPeriod };
      } else columns.push({ key: lane.id, lane, name: lane.name, filter: () => true });
    });
    if (worldCol) columns.push(worldCol);
    T.colKey = (it) => (it.lane === "period" ? (it.isPeriod ? "period" : "world") : it.lane);

    // 열마다 항목 배치: 시간이 겹치면 오른쪽 하위 열로
    let x = T.AXIS_W;
    const colsData = [];
    columns.forEach((col) => {
      const lane = col.lane;
      const SW = col.narrow ? 30 : SUBW;
      const items = [...index.all.values()]
        .filter((i) => i.lane === lane.id && col.filter(i) && isVisible(i))
        .sort((a, b) => a.start - b.start);
      const layout = items.map((it) => {
        if (it.end != null) {
          const y1 = T.yOf(it.start);
          const y2 = T.yOf(Math.min(it.end, c.range[1]));
          return { it, y1, y2, cont: it.end > c.range[1], top: y1, bottom: Math.max(y2, y1 + T.ROW) };
        }
        const y = T.posY(it);
        return { it, y, top: y - 12, bottom: y + 14 };
      });
      if (!col.narrow && lane.fold && !state.expanded[lane.fold]) {
        const [a, b] = FOLD_INFO[lane.fold].range;
        const y1 = T.yOf(a), y2 = T.yOf(b);
        layout.push({ summary: true, y1, y2, top: y1, bottom: Math.max(y2, y1 + T.ROW * 2) });
      }
      const subs = packRows(layout.map((L) => ({ left: L.top, right: L.bottom })), 2);
      const nSub = Math.max(1, subs.length ? Math.max(...subs) + 1 : 1);
      const w = nSub * SW + (col.narrow ? 6 : 10);
      colsData.push({ col, lane, layout, subs, x, w, SW });
      T.cols.set(col.key, { x, w });
      x += w;
    });
    const totalW = Math.max(x + 8, viewport.clientWidth);
    canvas.style.width = totalW + "px";
    canvas.style.height = totalH + "px";

    // 열 제목 (위에 고정)
    const head = el("div", "t-head");
    head.style.width = totalW + "px";
    head.appendChild(el("div", "t-corner", { textContent: "연도" }));
    colsData.forEach(({ col, lane, x, w }) => {
      const cell = el("div", "t-col-head" + (col.narrow ? " narrow" : ""));
      cell.style.left = x + "px";
      cell.style.width = w + "px";
      cell.style.setProperty("--h", lane.hue);
      cell.appendChild(el("span", "", { textContent: col.name }));
      const fold = col.narrow ? null : laneFold(lane);
      if (fold) {
        const fb = foldButton(fold, false, lane.id);
        fb.dataset.fold = fold;
        cell.appendChild(fb);
      }
      head.appendChild(cell);
    });
    canvas.appendChild(head);

    // 열 배경 줄무늬
    colsData.forEach(({ x, w }, i) => {
      if (i % 2) return;
      const bg = el("div", "t-col-bg");
      bg.style.left = x + "px";
      bg.style.width = w + "px";
      bg.style.height = totalH - T.HEAD_H + "px";
      canvas.appendChild(bg);
    });

    // 원역사(연대 미상) 구간
    const zone = el("div", "t-zone");
    zone.style.top = T.HEAD_H + "px";
    zone.style.height = T._zh + "px";
    zone.style.width = totalW + "px";
    canvas.appendChild(zone);

    // 연도 눈금 (왼쪽에 고정) + 가로 눈금선
    const axisWrap = el("div", "t-axis-wrap");
    axisWrap.style.width = totalW + "px";
    axisWrap.style.height = totalH + "px";
    const axis = el("div", "t-axis");
    axis.appendChild(el("div", "t-tick unknown", { textContent: "?" })).style.top = T.HEAD_H + 6 + "px";
    const u = c.undatedBefore, n = DATA.all.eras.nt[0];
    const pick = (ppyr, steps) => steps.find((s) => s * ppyr >= 46) || steps[steps.length - 1];
    const ticks = [];
    const so = pick(T.OT * state.tz, [5, 10, 20, 25, 50, 100, 200, 500]);
    for (let y = Math.ceil(u / so) * so; y < n; y += so) ticks.push(y);
    const sn = pick(T.NT * state.tz, [1, 2, 5, 10, 20, 50]);
    for (let y = Math.ceil(n / sn) * sn; y <= c.range[1]; y += sn) ticks.push(y);
    ticks.forEach((y) => {
      const ty = T.yOf(y);
      if (ty > endY - 4) return;
      const t = el("div", "t-tick" + (y === 0 ? " era" : ""), { textContent: y === 0 ? "BC|AD" : fmtYear(y) });
      t.style.top = ty + "px";
      axis.appendChild(t);
      const g = el("div", "t-grid");
      g.style.top = ty + "px";
      g.style.width = totalW + "px";
      canvas.appendChild(g);
    });
    // 축척이 바뀌는 지점
    const mark = el("div", "t-scale");
    mark.appendChild(el("span", "", { textContent: "↓ 신약 시대부터 축척 10배" }));
    mark.style.top = T.yOf(n) + "px";
    mark.style.width = totalW + "px";
    canvas.appendChild(mark);
    axisWrap.appendChild(axis);
    canvas.appendChild(axisWrap);

    // 항목
    colsData.forEach(({ col, lane, layout, subs, x, SW }) => {
      layout.forEach((L, i) => {
        const sx = x + (col.narrow ? 3 : 6) + subs[i] * SW;
        if (col.narrow) {
          // 시대 띠: 넓은 막대 안에 세로 글씨
          const it = L.it;
          const wrap = el("div", "item");
          wrap.dataset.id = it.id;
          wrap.style.setProperty("--h", it.hue ?? lane.hue);
          wrap.style.left = "0";
          wrap.style.top = "0";
          const bar = el("div", "t-period");
          bar.style.left = sx + "px";
          bar.style.top = L.y1 + "px";
          bar.style.width = SW - 4 + "px";
          bar.style.height = Math.max(8, L.y2 - L.y1 - 1) + "px";
          const label = el("div", "t-vlabel", { textContent: it.title });
          const lh = [...it.title].length * 14 + 6; // 세로 글씨 높이 (글자당 약 14px)
          label.style.left = sx + "px";
          label.style.width = SW - 4 + "px";
          label.style.top = L.y1 + 4 + "px";
          label.title = `${it.title} (${fmtRange(it)})`;
          wrap.append(bar, label);
          // 이름이 막대 안에 들어갈 때만 표시하고, 긴 막대는 스크롤을 따라 내려오게
          // (updateSpanLabels는 위치를 y2 - 22까지 내리므로, 이름 길이만큼 미리 빼 둠)
          if (L.y2 - L.y1 > lh + 8) T.spanLabels.push({ label, y1: L.y1 + 4, y2: L.y2 - lh + 22 - 4 });
          else label.style.display = "none";
          canvas.appendChild(wrap);
          nodes.set(it.id, wrap);
          return;
        }
        if (L.summary) {
          const bar = el("div", "t-bar fold-bar");
          bar.dataset.fold = lane.fold;
          bar.style.setProperty("--h", lane.hue);
          bar.style.left = sx + 4 + "px";
          bar.style.top = L.y1 + "px";
          bar.style.height = Math.max(8, L.y2 - L.y1) + "px";
          const lbl = el("div", "t-label fold-bar-label", { textContent: `${lane.name} ${foldCount(lane.fold, lane.id)}가지 ▸ 펼치기` });
          lbl.dataset.fold = lane.fold;
          lbl.style.setProperty("--h", lane.hue);
          lbl.style.left = sx + 16 + "px";
          lbl.style.top = L.y1 - 3 + "px";
          lbl.style.width = SW - 20 + "px";
          canvas.append(bar, lbl);
          return;
        }
        const it = L.it;
        const wrap = el("div", "item");
        wrap.dataset.id = it.id;
        wrap.style.setProperty("--h", it.hue ?? lane.hue);
        wrap.style.left = "0";
        wrap.style.top = "0";
        const label = el("div", "t-label" + (it.end != null ? " span" : ""));
        label.appendChild(titleNodes(it));
        label.title = `${it.title} (${fmtRange(it)})`;
        label.style.width = SW - 22 + "px";
        if (it.end != null) {
          const bar = el("div", "t-bar" + (it.approx ? " approx" : "") + (L.cont ? " cont" : ""));
          bar.style.left = sx + 4 + "px";
          bar.style.top = L.y1 + "px";
          bar.style.height = Math.max(6, L.y2 - L.y1) + "px";
          label.style.left = sx + 16 + "px";
          label.style.top = L.y1 - 3 + "px";
          wrap.append(bar, label);
          if (L.y2 - L.y1 > 40) T.spanLabels.push({ label, y1: L.y1, y2: L.y2 });
        } else {
          const dot = el("div", "dot" + (it.approx ? " approx" : ""));
          dot.style.left = sx + 7 + "px";
          dot.style.top = L.y + "px";
          label.style.left = sx + 16 + "px";
          label.style.top = L.y - 11 + "px";
          wrap.append(dot, label);
        }
        canvas.appendChild(wrap);
        nodes.set(it.id, wrap);
      });
    });

    renderGuide();
    applyHighlights();
    updateSpanLabels();
  }

  // 세로형: 긴 기간 막대의 이름이 화면 위쪽을 따라 내려오게 (막대 범위 안에서만)
  function updateSpanLabels() {
    if (state.mode !== "t") return;
    const top = viewport.scrollTop + T.HEAD_H + 4;
    T.spanLabels.forEach(({ label, y1, y2 }) => {
      label.style.top = Math.min(Math.max(y1 - 3, top), y2 - 22) + "px";
    });
  }
  let spanRaf = 0;
  viewport.addEventListener("scroll", () => {
    if (state.mode !== "t" || spanRaf) return;
    spanRaf = requestAnimationFrame(() => {
      spanRaf = 0;
      updateSpanLabels();
    });
  });

  // 세로형: 선택한 항목의 시기를 가로 띠로 표시
  function renderGuideT(sel) {
    const w = canvas.offsetWidth;
    const pad = padFor(sel);
    if (!sel.undated) {
      const y1 = T.yOf(sel.start - pad), y2 = T.yOf((sel.end ?? sel.start) + pad);
      const band = el("div", "guide-band t-guide-band");
      band.style.top = y1 + "px";
      band.style.height = Math.max(2, y2 - y1) + "px";
      band.style.width = w + "px";
      canvas.appendChild(band);
    }
    const g = el("div", "t-guide");
    g.style.top = (sel.end != null ? T.yOf(sel.start) : T.posY(sel)) + "px";
    g.style.width = w + "px";
    canvas.appendChild(g);
  }

  function renderGuide() {
    const sel = state.selected && index[state.view].get(state.selected);
    if (!sel || state.mode === "v") return;
    if (state.mode === "t") return renderGuideT(sel);
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
        updateFilterCount();
        rerenderKeepingCenter();
      });
      legend.appendChild(b);
    });
    const all = el("button", "chip-all", { textContent: "모두 보기" });
    all.addEventListener("click", () => {
      if (!state.hidden[state.view].size) return;
      state.hidden[state.view].clear();
      legend.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", "true"));
      updateFilterCount();
      rerenderKeepingCenter();
    });
    legend.appendChild(all);
    updateFilterCount();
  }

  // 필터 버튼: 누르면 줄 목록이 아래로 펼쳐짐, 숨긴 줄 수를 배지로 표시
  const filterBtn = $("#filter-btn");
  const filterCount = $("#filter-count");
  function updateFilterCount() {
    const n = state.hidden[state.view].size;
    filterCount.hidden = !n;
    filterCount.innerHTML = n ? `${n}<span class="filter-text">개 숨김</span>` : ""; // 모바일은 숫자만
    filterBtn.classList.toggle("active", n > 0);
  }
  function setFilterOpen(open) {
    $("#legend").hidden = !open;
    filterBtn.setAttribute("aria-expanded", String(open));
  }
  filterBtn.addEventListener("click", () => setFilterOpen($("#legend").hidden));
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter")) setFilterOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#legend").hidden) setFilterOpen(false);
  });

  // ───────── 상세 패널 ─────────
  function showDetail() {
    const it = state.selected && index[state.view].get(state.selected);
    detailToggle.disabled = !it;
    detailToggle.setAttribute("aria-pressed", String(!!it && state.panelOpen));
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

    // 모바일 세로형은 '설명' 버튼을 눌렀을 때만 (위쪽에서 내려오는 패널), 그 밖에는 바로 열림
    detail.hidden = panelByButton() && !state.panelOpen;
    if (detail.hidden) return;
    if (window.showDetailAd) window.showDetailAd(); // 광고 (js/ads.js, 설정했을 때만)
    detail.scrollTop = 0;
  }

  // ───────── 선택·이동 ─────────
  function select(id, { scroll = false } = {}) {
    state.selected = id;
    const it = id && index[state.view].get(id);
    // 접혀 있는 항목을 고르면(검색·이전/다음·링크) 그 묶음을 펼침
    if (it && it.fold && !state.expanded[it.fold]) {
      state.expanded[it.fold] = true;
      render();
    }
    history.replaceState(null, "", it ? `#${id}` : location.pathname + location.search);
    // 가이드 선을 다시 그리기 위해 기존 가이드만 교체
    canvas.querySelectorAll(".guide, .guide-band, .t-guide").forEach((n) => n.remove());
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
    if (state.mode === "t") {
      // 세로형: 그 시점이 화면 위쪽 1/3에, 그 열이 보이게
      const y = it.end != null ? T.yOf(it.start) : T.posY(it);
      const col = T.cols.get(T.colKey(it));
      const left = col && (col.x < viewport.scrollLeft + T.AXIS_W || col.x + col.w > viewport.scrollLeft + viewport.clientWidth)
        ? col.x - T.AXIS_W - 8
        : viewport.scrollLeft;
      viewport.scrollTo({ top: Math.max(0, y - T.HEAD_H - viewport.clientHeight / 4), left: Math.max(0, left), behavior: smooth ? "smooth" : "auto" });
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
    if (state.mode === "t") {
      // 신약: 예수 탄생 무렵(BC 10)부터 보이게
      const y = era === "nt" ? T.yOf(-10) - T.HEAD_H : 0;
      // 신약: 예수 그리스도 열이 보이도록 옆으로도 이동
      const jc = T.cols.get("jesus");
      const left = era === "nt" && jc ? jc.x - T.AXIS_W - 4 : 0;
      viewport.scrollTo({ top: Math.max(0, y), left: Math.max(0, left), behavior: "smooth" });
      return;
    }
    const [a, b] = era === "all" ? all.range : all.eras[era];
    state.ppy.all = Math.min(all.zoom.max, Math.max(minPpy(), fitPpy(a, b, viewport.clientWidth - originX())));
    render();
    viewport.scrollLeft = Math.max(0, xOf(a) - originX());
  }

  function initialScroll() {
    viewport.scrollTo({ left: 0, top: 0 });
  }

  // ───────── 확대/축소 ─────────
  // a~b년이 avail 픽셀에 꼭 맞는 확대 비율
  // (원역사 '?' 구간은 최소 폭이 있어 비율이 달라지므로 실제 폭을 재서 보정)
  function fitPpy(a, b, avail) {
    const save = state.ppy.all;
    let p = avail / (b - a);
    for (let i = 0; i < 3; i++) {
      state.ppy.all = p;
      p *= avail / (xOf(b) - xOf(a));
    }
    state.ppy.all = save;
    return p;
  }

  // 최대 축소: 전체 기간이 화면 폭을 꽉 채우는 데서 멈춤 (오른쪽 빈 공간이 생기지 않게)
  const minPpy = () => Math.max(cfg().zoom.min, fitPpy(cfg().range[0], cfg().range[1], viewport.clientWidth - originX()));

  // 확대/축소 버튼·단축키·휠: 보기 방식에 맞게
  function zoomBy(f, anchorClientX) {
    if (state.mode === "t") return setZoom(state.tz * f);
    setZoom(ppy() * f, anchorClientX);
  }

  function setZoom(newPpy, anchorClientX) {
    if (state.mode === "v") return;
    if (state.mode === "t") {
      // 세로형: 화면 가운데 높이의 시점을 유지하며 확대
      const tz = Math.min(8, Math.max(0.3, newPpy));
      if (Math.abs(tz - state.tz) < 1e-6) return;
      const oldH = canvas.offsetHeight || 1;
      const mid = viewport.scrollTop + viewport.clientHeight / 2;
      state.tz = tz;
      render();
      viewport.scrollTop = (mid * canvas.offsetHeight) / oldH - viewport.clientHeight / 2;
      return;
    }
    const z = cfg().zoom;
    newPpy = Math.min(z.max, Math.max(minPpy(), newPpy));
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
    if (state.mode === "v" || state.mode === "t") {
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

  $("#zoom-in").addEventListener("click", () => zoomBy(1.5));
  $("#zoom-out").addEventListener("click", () => zoomBy(1 / 1.5));
  // 닫기: 모바일 세로형은 패널만 닫고 선택은 유지 (다시 '설명'으로 열 수 있게)
  $("#detail-close").addEventListener("click", () => {
    if (panelByButton() && state.selected) {
      state.panelOpen = false;
      showDetail();
    } else select(null);
  });
  detailToggle.addEventListener("click", () => {
    if (!state.selected) return;
    state.panelOpen = !state.panelOpen;
    showDetail();
  });

  // 테마 메뉴: 스타일(기본/Apple)과 화면(자동/밝게/어둡게). 처음 적용은 js/theme-init.js
  const themeBtn = $("#theme");
  const themePop = $("#theme-pop");
  function syncThemeMenu() {
    const root = document.documentElement;
    const cur = { skin: root.dataset.skin || "default", theme: root.dataset.theme || "auto" };
    themePop.querySelectorAll(".seg").forEach((seg) =>
      seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === cur[seg.dataset.key])))
    );
  }
  function setThemeOpen(open) {
    themePop.hidden = !open;
    themeBtn.setAttribute("aria-expanded", String(open));
    if (open) syncThemeMenu();
  }
  themeBtn.addEventListener("click", () => setThemeOpen(themePop.hidden));
  themePop.addEventListener("click", (e) => {
    const b = e.target.closest(".seg button");
    if (!b) return;
    const key = b.parentElement.dataset.key;
    const v = b.dataset.v;
    const root = document.documentElement;
    if (key === "skin") root.dataset.skin = v;
    else if (v === "auto") delete root.dataset.theme;
    else root.dataset.theme = v;
    try {
      if (key === "skin") localStorage.setItem("bible-timeline-skin", v);
      else if (v === "auto") localStorage.removeItem("bible-timeline-theme");
      else localStorage.setItem("bible-timeline-theme", v);
    } catch (err) { /* 무시 */ }
    syncThemeMenu();
    rerenderKeepingCenter(); // 스타일마다 글자 폭이 달라 배치를 다시 계산
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".menu")) setThemeOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !themePop.hidden) setThemeOpen(false);
  });

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
      const hits = [...index.all.values()]
        .filter((it) => !state.hidden.all.has(it.group) && matchesQuery(it, q))
        .sort((a, b) => a.start - b.start);
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
    const fb = e.target.closest("[data-fold]");
    if (fb) return setFold(fb.dataset.fold, !state.expanded[fb.dataset.fold]);
    const node = e.target.closest("[data-id]");
    // 모바일 세로 보기에서는 아래에서 올라오는 패널에 가리지 않도록 누른 항목을 위로 올림
    if (node) select(node.dataset.id, { scroll: state.mode !== "h" && isMobile() });
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
        zoomBy(Math.exp(-e.deltaY * 0.0045), e.clientX);
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
      if (e.touches.length === 2 && state.mode !== "v") {
        const [a, b] = e.touches;
        pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), p: state.mode === "t" ? state.tz : ppy() };
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
      if (idx === -1 && state.mode !== "h") {
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
      zoomBy(1.5);
    } else if (e.key === "-" || e.key === "_") {
      zoomBy(1 / 1.5);
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
  // 보기 방식 전환: 가로형 / 카드형 / 세로형 (선택은 이 브라우저에만 기억, 모바일에는 가로형 버튼 없음)
  const modeBtns = document.querySelectorAll("#modes button");
  function updateModeBtns() {
    modeBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === state.mode)));
  }
  modeBtns.forEach((b) =>
    b.addEventListener("click", () => {
      if (b.dataset.mode === state.mode) return;
      state.mode = b.dataset.mode;
      try { localStorage.setItem("bible-timeline-mode", state.mode); } catch (e) { /* 무시 */ }
      updateModeBtns();
      render();
      showDetail(); // 세로형은 설명 패널을 버튼으로 여닫으므로 보기 방식이 바뀌면 다시 맞춤
      if (state.selected) scrollToItem(index[state.view].get(state.selected), false);
      else initialScroll();
    })
  );
  {
    let saved = null;
    try { saved = localStorage.getItem("bible-timeline-mode"); } catch (e) { /* 무시 */ }
    const ok = ["h", "v", "t"].includes(saved) && !(saved === "h" && isMobile());
    state.mode = ok ? saved : isMobile() ? "t" : "h";
    updateModeBtns();
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
