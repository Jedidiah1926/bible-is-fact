/*
 * Google AdSense 설정
 *
 * 1. client     : 애드센스 게시자 ID (예: "ca-pub-1234567890123456")
 * 2. detailSlot : 애드센스에서 만든 '디스플레이 광고' 단위의 슬롯 ID (예: "1234567890")
 *
 * client가 비어 있으면 광고 스크립트를 전혀 불러오지 않습니다.
 * 게시자 ID를 넣을 때는 index.html의 google-adsense-account 메타 태그와 루트의 ads.txt도 함께 맞춰야 합니다.
 *
 * 광고 위치: 항목을 눌렀을 때 열리는 설명 패널 아래쪽에 한 번만 만들어 두고 계속 재사용합니다.
 * (항목을 바꿀 때마다 새 광고를 띄우면 '광고 새로고침' 정책에 걸릴 수 있어 그렇게 하지 않습니다)
 */
window.ADSENSE_CONFIG = {
  client: "",
  detailSlot: ""
};

(function () {
  "use strict";
  const cfg = window.ADSENSE_CONFIG;
  let loaded = false;
  let detailAdShown = false;

  function loadScript() {
    if (loaded || !cfg.client) return;
    loaded = true;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(cfg.client);
    s.crossOrigin = "anonymous";
    document.head.appendChild(s);
  }

  // 설명 패널이 처음 열릴 때 광고 단위를 한 번 만듦
  window.showDetailAd = function () {
    if (!cfg.client || !cfg.detailSlot || detailAdShown) return;
    const box = document.getElementById("ad-detail");
    if (!box) return;
    detailAdShown = true;
    loadScript();
    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", cfg.client);
    ins.setAttribute("data-ad-slot", cfg.detailSlot);
    ins.setAttribute("data-ad-format", "auto");
    ins.setAttribute("data-full-width-responsive", "true");
    box.appendChild(ins);
    box.hidden = false;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      /* 광고 차단기 등 — 무시 */
    }
  };

  // 자동 광고(앵커 광고 등)를 쓰는 경우를 위해 게시자 ID가 있으면 스크립트는 미리 불러 둠
  if (cfg.client) loadScript();
})();
