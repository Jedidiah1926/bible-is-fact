/*
 * 성경 구절 표기("창 12:1–4; 15장", "마 1–2장; 눅 2장")를 성경 본문 링크로 나눔
 *  - 타임라인 설명 패널(js/app.js)과 시대별 읽기 페이지(tools/build-pages.js)가 함께 씀
 *  - 링크 주소는 BIBLE_URL 한 곳만 바꾸면 됨 (지금은 대한성서공회 개역한글)
 */
(function (root) {
  "use strict";
  const BIBLE_URL = (code, chap) =>
    `https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE&book=${code}&chap=${chap}`;

  // 약어
  const ABBR = {
    창: "gen", 출: "exo", 레: "lev", 민: "num", 신: "deu", 수: "jos", 삿: "jdg", 룻: "rut",
    삼상: "1sa", 삼하: "2sa", 왕상: "1ki", 왕하: "2ki", 대상: "1ch", 대하: "2ch", 스: "ezr", 느: "neh",
    에: "est", 욥: "job", 시: "psa", 잠: "pro", 전: "ecc", 아: "sng", 사: "isa", 렘: "jer", 애: "lam",
    겔: "ezk", 단: "dan", 호: "hos", 욜: "jol", 암: "amo", 옵: "oba", 욘: "jnh", 미: "mic", 나: "nam",
    합: "hab", 습: "zep", 학: "hag", 슥: "zec", 말: "mal",
    마: "mat", 막: "mrk", 눅: "luk", 요: "jhn", 행: "act", 롬: "rom", 고전: "1co", 고후: "2co", 갈: "gal",
    엡: "eph", 빌: "php", 골: "col", 살전: "1th", 살후: "2th", 딤전: "1ti", 딤후: "2ti", 딛: "tit", 몬: "phm",
    히: "heb", 약: "jas", 벧전: "1pe", 벧후: "2pe", 요일: "1jn", 요이: "2jn", 요삼: "3jn", 유: "jud", 계: "rev"
  };
  // 책 이름 전체 (장이 없으면 1장으로 연결)
  const FULL = {
    창세기: "gen", 출애굽기: "exo", 레위기: "lev", 민수기: "num", 신명기: "deu", 여호수아: "jos", 사사기: "jdg",
    룻기: "rut", 사무엘상: "1sa", 사무엘하: "2sa", 열왕기상: "1ki", 열왕기하: "2ki", 역대상: "1ch", 역대하: "2ch",
    에스라: "ezr", 느헤미야: "neh", 에스더: "est", 욥기: "job", 시편: "psa", 잠언: "pro", 전도서: "ecc", 아가: "sng",
    이사야: "isa", 예레미야: "jer", 예레미야애가: "lam", 에스겔: "ezk", 다니엘: "dan", 호세아: "hos", 요엘: "jol",
    아모스: "amo", 오바댜: "oba", 요나: "jnh", 요나서: "jnh", 미가: "mic", 나훔: "nam", 나훔서: "nam", 하박국: "hab",
    스바냐: "zep", 학개: "hag", 스가랴: "zec", 말라기: "mal", 마태복음: "mat", 마가복음: "mrk", 누가복음: "luk",
    요한복음: "jhn", 사도행전: "act", 로마서: "rom", 갈라디아서: "gal", 히브리서: "heb", 요한계시록: "rev"
  };

  // → [{ text, url? }, ...]  (구분자 '; '는 url 없는 조각으로)
  function split(ref) {
    const out = [];
    let book = null;
    String(ref || "")
      .split(/(;\s*)/)
      .forEach((seg) => {
        if (!seg) return;
        if (/^;\s*$/.test(seg)) return out.push({ text: seg });
        const m = seg.match(/^\s*([1-3]?[가-힣]+)?\s*(\d+)?/);
        const name = m && m[1];
        let code = null;
        let full = false;
        if (name) {
          if (ABBR[name]) code = ABBR[name];
          else if (FULL[name]) (code = FULL[name]), (full = true);
          book = code; // 모르는 이름이면 이어지는 조각도 링크하지 않음
        } else code = book;
        const chap = m && m[2] ? +m[2] : full && seg.trim() === name ? 1 : null;
        out.push(code && chap ? { text: seg, url: BIBLE_URL(code, chap) } : { text: seg });
      });
    return out;
  }

  const api = { split };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.BibleRef = api;
})(typeof window !== "undefined" ? window : globalThis);
