/*
 * 테마를 그리기 전에 적용 (깜빡임 방지) — <head>에서 먼저 불러옴
 *  - data-skin : "default" 기본 / "apple" Apple 스타일 (css/apple.css)
 *                저장된 선택이 없으면 Apple 기기(Mac·iPhone·iPad)에서는 Apple 스타일
 *  - data-theme: "light" / "dark" (없으면 기기 설정을 따름)
 */
(function () {
  var root = document.documentElement;
  var skin = null;
  try {
    var t = localStorage.getItem("bible-timeline-theme");
    if (t === "light" || t === "dark") root.dataset.theme = t;
    skin = localStorage.getItem("bible-timeline-skin");
  } catch (e) { /* 무시 */ }
  if (skin !== "apple" && skin !== "default") {
    var ua = navigator.userAgent || "";
    skin = /Macintosh|Mac OS X|iPhone|iPad|iPod/.test(ua) ? "apple" : "default";
  }
  root.dataset.skin = skin;
})();
