#!/usr/bin/env node
/*
 * 검색엔진·애드센스용 '시대별 읽기' 정적 페이지 생성기
 *
 *   node tools/build-pages.js
 *
 * js/data.js · evidence.js · research.js · history.js 를 읽어서 아래 파일을 새로 만듭니다.
 *   era/index.html        시대 목록
 *   era/<시대>.html        시대별 사건·인물 (설명·성경 구절·역사 기록·성경 밖 자료·연구·출처)
 *   sitemap.xml, robots.txt
 *
 * 타임라인 화면은 JavaScript로 그려져서 검색 봇에는 내용이 거의 보이지 않으므로,
 * 같은 내용을 글로 읽을 수 있는 페이지로도 내보냅니다.
 * 데이터(js/*.js)를 고친 뒤에는 이 스크립트를 다시 실행하고 결과 파일도 함께 커밋하세요.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SITE = "https://bible-is-fact.vercel.app"; // 실제 배포 주소 (도메인을 바꾸면 여기도)
const SITE_NAME = "성경 타임라인";
const ADSENSE_CLIENT = "ca-pub-4099065432031117";
const ROOT = path.join(__dirname, "..");

// ───────── 데이터 읽기 (브라우저처럼 전역 window에 올림) ─────────
const ctx = {};
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ["data", "evidence", "research", "history"]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js", f + ".js"), "utf8"), ctx, { filename: f + ".js" });
}
const D = ctx.TIMELINE_DATA;
const EVIDENCE = ctx.TIMELINE_EVIDENCE || {};
const RESEARCH = ctx.TIMELINE_RESEARCH || {};
const HISTORY = ctx.TIMELINE_HISTORY || {};
const RESEARCH_DATE = ctx.TIMELINE_RESEARCH_DATE || "";

const laneName = {};
D.ot.lanes.forEach((l) => (laneName[l.id] = l.name));
D.nt.lanes.forEach((l) => (laneName[l.id] = l.name));
const isDisputed = (status) => /논란 많음|철회/.test(status);

// ───────── 형식 ─────────
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function fmtYear(y) {
  const r = y >= 0 ? Math.floor(y) : Math.round(y);
  if (r < 0) return `BC ${-r}`;
  if (r === 0) return "BC 1";
  return `AD ${r}`;
}
function fmtRange(it) {
  if (it.undated) return "연대 미상";
  const pre = it.approx ? "약 " : "";
  if (it.end == null) return pre + fmtYear(it.start);
  return `${pre}${fmtYear(it.start)} – ${fmtYear(it.end)}`;
}

// ───────── 시대(페이지) 나누기 ─────────
// 북이스라엘·남유다는 같은 시기라 한 페이지로 합침
const pages = [];
D.ot.periods.forEach((p) => {
  if (p.id === "p-judah") return;
  if (p.id === "p-israel") {
    const judah = D.ot.periods.find((q) => q.id === "p-judah");
    pages.push({
      slug: "divided",
      title: "분열 왕국 — 북이스라엘·남유다",
      start: p.start,
      end: judah.end,
      desc: `${p.desc} ${judah.desc}`,
      ref: `${p.ref}; ${judah.ref}`,
      periodIds: [p.id, judah.id],
      items: []
    });
    return;
  }
  pages.push({ slug: p.id.replace(/^p-/, ""), title: p.title, start: p.start, end: p.end, desc: p.desc, ref: p.ref, undated: p.undated, periodIds: [p.id], items: [] });
});

const primeval = pages.find((p) => p.undated);
D.ot.prologue.forEach((it) => primeval.items.push({ ...it, lane: it.lane || "event", undated: true }));
const dated = pages.filter((p) => !p.undated);
[...D.ot.items, ...D.nt.items].forEach((it) => {
  let page = dated.find((p) => it.start >= p.start && it.start < p.end);
  if (!page) page = [...dated].reverse().find((p) => p.start <= it.start) || dated[0];
  page.items.push(it);
});
dated.forEach((p) => p.items.sort((a, b) => a.start - b.start || (a.end ?? a.start) - (b.end ?? b.start)));

// ───────── HTML 조각 ─────────
function sources(list) {
  if (!list || !list.length) return "";
  return `<p class="src"><span>출처</span>${list
    .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`)
    .join(" · ")}</p>`;
}
function historyBox(h) {
  if (!h) return "";
  return `<div class="box hs"><h4><span class="mk">史</span> 역사 기록</h4><p>${esc(h.text)}</p>${sources(h.sources)}</div>`;
}
function evidenceBox(list) {
  if (!list) return "";
  return `<div class="box ev"><h4><span class="mk">✓</span> 성경 밖 자료로 확인</h4>${list
    .map((e) => `<div class="card"><h5>${esc(e.title)}</h5>${e.year ? `<p class="meta">${esc(e.year)}</p>` : ""}<p>${esc(e.text)}</p>${sources(e.sources)}</div>`)
    .join("")}</div>`;
}
function researchBox(list, disputed) {
  if (!list || !list.length) return "";
  const head = disputed
    ? `<h4><span class="mk">▲</span> 논란 많은 주장</h4><p class="note">학계 다수가 받아들이지 않거나, 진위·검증·연구 윤리에 큰 문제가 제기된 주장입니다.</p>`
    : `<h4><span class="mk">○</span> 진행 중인 연구 · 논쟁 · 미확인${RESEARCH_DATE ? ` <small>(${esc(RESEARCH_DATE)} 기준)</small>` : ""}</h4><p class="note">확인된 사실이 아니라 조사·논쟁 중인 주장입니다.</p>`;
  return `<div class="box ${disputed ? "dp" : "rs"}">${head}${list
    .map(
      (r) =>
        `<div class="card"><h5><span class="status">${esc(r.status)}</span> ${esc(r.title)}</h5>${r.who ? `<p class="meta">${esc(r.who)}</p>` : ""}<p><b>내용</b> ${esc(r.text)}</p>${r.view ? `<p><b>현재 평가</b> ${esc(r.view)}</p>` : ""}${sources(r.sources)}</div>`
    )
    .join("")}</div>`;
}
function extras(id) {
  const rs = RESEARCH[id] || [];
  return (
    historyBox(HISTORY[id]) +
    evidenceBox(EVIDENCE[id]) +
    researchBox(rs.filter((r) => !isDisputed(r.status)), false) +
    researchBox(rs.filter((r) => isDisputed(r.status)), true)
  );
}
function itemHtml(it) {
  const lane = laneName[it.lane] || "";
  return `<article id="${esc(it.id)}">
<h3>${esc(it.title)}</h3>
<p class="meta"><span class="when">${esc(fmtRange(it))}</span>${lane ? ` · ${esc(lane)}` : ""}${it.ref ? ` · <span class="ref">${esc(it.ref)}</span>` : ""}</p>
${it.desc ? `<p>${esc(it.desc)}</p>` : ""}${extras(it.id)}
<p class="open"><a href="/#${esc(it.id)}">타임라인에서 보기 →</a></p>
</article>`;
}

const pageRange = (p) => (p.undated ? "연대 미상 (창 1–11장)" : `${fmtYear(p.start)} – ${fmtYear(p.end)}`);

function layout({ title, desc, url, body }) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${SITE}${url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${SITE}${url}">
  <meta property="og:image" content="${SITE}/img/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="google-adsense-account" content="${ADSENSE_CLIENT}">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>
  <script src="/js/theme-init.js"></script>
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/apple.css">
  <link rel="stylesheet" href="/css/page.css">
</head>
<body class="page">
<!-- 자동 생성 파일: tools/build-pages.js 로 다시 만드세요 (직접 고치지 말 것) -->
<header class="page-top"><a class="home" href="/">← ${SITE_NAME}</a><a href="/era">시대 목록</a></header>
<main class="doc">
${body}
</main>
<footer class="page-foot">
  <p>⚠ 이 사이트는 AI의 도움으로 제작되어 연대·설명·출처에 틀린 부분이 있을 수 있습니다. 중요한 내용은 성경 본문과 출처를 직접 확인해 주세요.</p>
  <p>연대는 보수적 전통 연대 기준이며 ‘약’ 표시는 추정 연대입니다. · <a href="/privacy">개인정보처리방침</a></p>
</footer>
</body>
</html>
`;
}

// ───────── 쓰기 ─────────
const outDir = path.join(ROOT, "era");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir);

pages.forEach((p, i) => {
  const prev = pages[i - 1], next = pages[i + 1];
  const periodExtras = p.periodIds.map((id) => extras(id)).join("");
  const body = `<nav class="crumb"><a href="/era">시대 목록</a> › ${esc(p.title)}</nav>
<h1>${esc(p.title)}</h1>
<p class="lead-meta">${esc(pageRange(p))}${p.ref ? ` · <span class="ref">${esc(p.ref)}</span>` : ""}</p>
<p class="lead">${esc(p.desc)}</p>
${periodExtras}
<p class="open"><a href="/#${esc(p.periodIds[0])}">이 시대를 타임라인에서 보기 →</a></p>
<h2>이 시대의 사건·인물 <small>${p.items.length}개</small></h2>
${p.items.map(itemHtml).join("\n")}
<nav class="pager">${prev ? `<a href="/era/${prev.slug}">← ${esc(prev.title)}</a>` : "<span></span>"}${next ? `<a href="/era/${next.slug}">${esc(next.title)} →</a>` : "<span></span>"}</nav>`;
  const desc = `${p.title}(${pageRange(p)}): ${p.desc}`.slice(0, 155);
  fs.writeFileSync(path.join(outDir, p.slug + ".html"), layout({ title: `${p.title} (${pageRange(p)}) · ${SITE_NAME}`, desc, url: `/era/${p.slug}`, body }));
});

const indexBody = `<h1>시대별로 읽기</h1>
<p class="lead">창조부터 사도 시대까지, 성경의 사건과 인물을 시대별로 정리했습니다. 각 항목에는 성경 구절, 성경 밖 자료(고고학·고대 문헌), 진행 중인 연구와 출처가 함께 있습니다. 한눈에 보려면 <a href="/">인터랙티브 타임라인</a>을 이용하세요.</p>
<ol class="era-list">
${pages
  .map((p) => `<li><a href="/era/${p.slug}"><b>${esc(p.title)}</b><span>${esc(pageRange(p))} · ${p.items.length}개</span></a><p>${esc(p.desc)}</p></li>`)
  .join("\n")}
</ol>`;
fs.writeFileSync(
  path.join(outDir, "index.html"),
  layout({ title: `시대별로 읽기 · ${SITE_NAME}`, desc: "창조부터 사도 시대까지 성경의 사건·인물을 시대별로 — 성경 구절, 성경 밖 자료, 연구와 출처 포함", url: "/era", body: indexBody })
);

// sitemap.xml · robots.txt
const today = new Date().toISOString().slice(0, 10);
const urls = ["/", "/era", ...pages.map((p) => `/era/${p.slug}`), "/privacy"];
fs.writeFileSync(
  path.join(ROOT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u === "/" ? "/" : u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`
);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`era/ 페이지 ${pages.length + 1}개, 항목 ${pages.reduce((n, p) => n + p.items.length, 0)}개, sitemap.xml·robots.txt 생성`);
