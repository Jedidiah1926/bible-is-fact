/*
 * 성경 타임라인 데이터
 *
 * 연도 표기: 음수 = 기원전(BC), 양수 = 기원후(AD). (0년은 없지만 화면 배치상 무시)
 * 구약 연대는 보수적 전통 연대(출애굽 BC 1446, 왕상 6:1 기준)를 따릅니다.
 * 학자마다 수년~수십 년 차이가 있으며, approx: true 는 "약/추정" 연대입니다.
 *
 * 항목 형식
 *   { id, start, end?, title, ref?, desc?, approx? , cat? (구약) | lane? (신약) }
 *   end 가 있으면 기간(막대), 없으면 시점(점)으로 그려집니다.
 */
window.TIMELINE_DATA = {
  ot: {
    name: "구약",
    range: [-2250, 0],
    zoom: { min: 0.35, max: 24, initial: 2.4 },
    concurrentPad: 12,

    // 연대를 특정할 수 없는 원역사 (창 1–11장)
    prologue: [
      { id: "creation", title: "천지창조", ref: "창 1–2장", desc: "하나님이 엿새 동안 천지와 만물을 창조하시고 일곱째 날에 안식하심. 사람을 하나님의 형상대로 지으심." },
      { id: "fall", title: "인간의 타락", ref: "창 3장", desc: "아담과 하와가 선악을 알게 하는 나무의 열매를 먹음. 에덴에서 쫓겨나고, 여자의 후손에 대한 첫 복음(창 3:15)이 주어짐." },
      { id: "cain-abel", title: "가인과 아벨", ref: "창 4장", desc: "가인이 동생 아벨을 죽인 인류 최초의 살인. 이후 셋의 계보로 하나님을 부르는 자들이 이어짐." },
      { id: "flood", title: "노아의 홍수", ref: "창 6–9장", desc: "죄악이 가득한 세상을 홍수로 심판하심. 방주에 탄 노아의 가족 8명과 동물들이 구원받고, 무지개 언약을 맺으심." },
      { id: "babel", title: "바벨탑", ref: "창 11:1–9", desc: "사람들이 하늘에 닿는 탑을 쌓으려 하자 언어를 혼잡하게 하여 온 땅에 흩으심. 이어 셈의 족보가 아브람으로 연결됨." }
    ],

    categories: [
      { id: "event", name: "주요 사건", hue: 18 },
      { id: "people", name: "인물", hue: 205 },
      { id: "king", name: "왕·왕국", hue: 275 },
      { id: "prophet", name: "선지자", hue: 150 },
      { id: "world", name: "세계사·중간기", hue: 40 }
    ],

    // 시대 구분 (위쪽 띠)
    periods: [
      { id: "p-patriarchs", start: -2166, end: -1876, title: "족장 시대", hue: 35, desc: "아브라함·이삭·야곱·요셉으로 이어지는 족장들의 시대. 땅과 자손과 복의 언약이 주어짐.", ref: "창 12–50장" },
      { id: "p-egypt", start: -1876, end: -1446, title: "이집트 체류", hue: 25, desc: "야곱의 가족 70명이 이집트로 내려가 큰 민족으로 번성. 후에 바로의 압제 아래 노예가 됨. 430년(출 12:40).", ref: "출 1장; 출 12:40" },
      { id: "p-wilderness", start: -1446, end: -1406, title: "광야 40년", hue: 55, desc: "출애굽 후 시내산 언약, 성막 건축, 불신앙으로 인한 40년 광야 방황.", ref: "출–신명기" },
      { id: "p-conquest", start: -1406, end: -1375, title: "가나안 정복", hue: 90, desc: "여호수아의 인도로 요단을 건너 가나안 땅을 정복하고 12지파에 분배.", ref: "여호수아" },
      { id: "p-judges", start: -1375, end: -1050, title: "사사 시대", hue: 120, desc: "왕이 없어 각자 소견에 옳은 대로 행하던 시대. 범죄–압제–부르짖음–구원의 순환.", ref: "사사기; 룻기; 삼상 1–7장" },
      { id: "p-united", start: -1050, end: -930, title: "통일 왕국", hue: 275, desc: "사울·다윗·솔로몬이 각 40년씩 다스린 이스라엘 통일 왕국 시대.", ref: "삼상 8장–왕상 11장" },
      { id: "p-israel", start: -930, end: -722, title: "북이스라엘", hue: 300, desc: "여로보암부터 호세아까지 19명의 왕. 대부분 여로보암의 죄(금송아지)를 따름. 앗시리아에 멸망.", ref: "왕상 12장–왕하 17장" },
      { id: "p-judah", start: -930, end: -586, title: "남유다", hue: 250, desc: "르호보암부터 시드기야까지 다윗 왕조 20명의 왕. 히스기야·요시야 등의 개혁이 있었으나 바벨론에 멸망.", ref: "왕상 12장–왕하 25장; 역대하" },
      { id: "p-exile", start: -586, end: -538, title: "바벨론 포로기", hue: 0, desc: "예루살렘과 성전이 무너지고 백성이 바벨론에 포로로 잡혀간 시기. (1차 포로 BC 605부터 약 70년, 렘 29:10)", ref: "다니엘; 에스겔; 예레미야애가" },
      { id: "p-persia", start: -538, end: -332, title: "귀환·페르시아 시대", hue: 190, desc: "고레스 칙령으로 귀환, 성전·성벽 재건. 말라기 이후 약 400년간 선지자의 말씀이 끊긴 '중간기'가 시작됨.", ref: "에스라; 느헤미야; 에스더" },
      { id: "p-greek", start: -332, end: -167, title: "헬라 시대", hue: 210, desc: "알렉산더 대왕의 정복 이후 프톨레마이오스·셀레우코스 왕조의 지배. 헬라어 70인역 성경 번역.", ref: "단 8장; 11장" },
      { id: "p-hasmonean", start: -167, end: -63, title: "하스몬 왕조", hue: 165, desc: "마카비 반란으로 독립한 유대인 왕조. 바리새파·사두개파가 형성됨.", ref: "(마카비서)" },
      { id: "p-rome", start: -63, end: -4, title: "로마 지배", hue: 350, desc: "폼페이우스의 예루살렘 점령 이후 로마의 지배. 헤롯 대왕이 로마의 분봉왕으로 다스림.", ref: "" }
    ],

    items: [
      // 족장 시대
      { id: "abram-born", start: -2166, cat: "people", title: "아브람 출생", ref: "창 11:26–27", desc: "갈대아 우르에서 데라의 아들로 태어남." },
      { id: "abram-call", start: -2091, cat: "event", title: "아브람의 부르심", ref: "창 12:1–4", desc: "75세에 하란을 떠나 가나안으로. '큰 민족을 이루고 너로 말미암아 땅의 모든 족속이 복을 얻을 것이라.'" },
      { id: "covenant", start: -2081, cat: "event", approx: true, title: "횃불 언약", ref: "창 15장", desc: "아브람이 여호와를 믿으니 이를 의로 여기심(15:6). 쪼갠 고기 사이로 횃불이 지나가며 언약을 맺으심." },
      { id: "ishmael", start: -2080, cat: "people", title: "이스마엘 출생", ref: "창 16:16", desc: "아브람 86세에 하갈에게서 태어남." },
      { id: "sodom", start: -2067, cat: "event", approx: true, title: "소돔과 고모라 멸망", ref: "창 18–19장", desc: "아브라함의 중보 기도 후 유황불 심판. 롯은 구원받고 롯의 아내는 소금 기둥이 됨." },
      { id: "isaac-born", start: -2066, cat: "people", title: "이삭 출생", ref: "창 21:1–5", desc: "아브라함 100세, 사라 90세에 약속의 아들이 태어남." },
      { id: "moriah", start: -2050, cat: "event", approx: true, title: "모리아산 이삭 번제", ref: "창 22장", desc: "하나님이 아브라함을 시험하심. '여호와 이레' — 숫양을 대신 준비하심." },
      { id: "jacob-born", start: -2006, cat: "people", title: "야곱과 에서 출생", ref: "창 25:21–26", desc: "이삭 60세에 쌍둥이가 태어남. '큰 자가 어린 자를 섬기리라.'" },
      { id: "bethel", start: -1929, cat: "event", approx: true, title: "야곱, 벧엘의 사닥다리", ref: "창 28장", desc: "형 에서를 피해 하란으로 가던 중 꿈에 하늘에 닿은 사닥다리를 봄." },
      { id: "joseph-born", start: -1915, cat: "people", title: "요셉 출생", ref: "창 30:22–24", desc: "야곱과 라헬 사이에서 태어남." },
      { id: "joseph-sold", start: -1898, cat: "event", title: "요셉, 이집트에 팔림", ref: "창 37장", desc: "17세에 형들의 시기로 은 20에 이스마엘 상인에게 팔림." },
      { id: "joseph-ruler", start: -1885, cat: "people", title: "요셉, 이집트 총리", ref: "창 41:46", desc: "30세에 바로의 꿈을 해석하고 이집트의 총리가 됨." },
      { id: "to-egypt", start: -1876, cat: "event", title: "야곱 가족 이집트 이주", ref: "창 46–47장", desc: "7년 흉년 중 야곱(130세)과 가족 70명이 고센 땅에 정착." },
      { id: "jacob-dies", start: -1859, cat: "people", title: "야곱의 죽음", ref: "창 49장", desc: "147세에 열두 아들을 축복하고 죽음. 유다에게 '규'의 예언(49:10)." },
      { id: "joseph-dies", start: -1805, cat: "people", title: "요셉의 죽음", ref: "창 50:22–26", desc: "110세에 죽으며 자기 해골을 가나안으로 가져가라고 유언." },

      // 출애굽과 광야
      { id: "moses-born", start: -1526, cat: "people", title: "모세 출생", ref: "출 2:1–10", desc: "히브리 남아 학살 명령 속에서 갈대 상자로 살아나 바로의 공주의 아들로 자람." },
      { id: "moses-midian", start: -1486, cat: "people", title: "모세, 미디안 도피", ref: "출 2:11–22; 행 7:23", desc: "40세에 이집트인을 죽이고 미디안으로 도망하여 40년간 양을 침." },
      { id: "burning-bush", start: -1447, cat: "event", title: "떨기나무 부르심", ref: "출 3–4장", desc: "'나는 스스로 있는 자니라' — 호렙산에서 모세를 부르심." },
      { id: "exodus", start: -1446, cat: "event", title: "열 재앙과 출애굽", ref: "출 7–14장", desc: "유월절 어린양의 피, 홍해를 건넘. 이스라엘 구원 역사의 중심 사건. (왕상 6:1 기준 BC 1446)" },
      { id: "sinai", start: -1446, cat: "event", title: "시내산 언약·십계명", ref: "출 19–24장", desc: "출애굽 셋째 달 시내산에서 율법과 언약을 주심." },
      { id: "tabernacle", start: -1445, cat: "event", title: "성막 완성", ref: "출 40장", desc: "출애굽 둘째 해 첫째 달 초하루에 성막을 세우고 여호와의 영광이 충만함." },
      { id: "kadesh", start: -1444, cat: "event", approx: true, title: "가데스 바네아 정탐", ref: "민 13–14장", desc: "12명의 정탐꾼 중 여호수아·갈렙을 제외한 10명의 악평으로 백성이 원망. 40년 방황의 심판." },
      { id: "jordan", start: -1406, cat: "event", title: "모세의 죽음, 요단 도하", ref: "신 34장; 수 3장", desc: "모세가 느보산에서 120세로 죽고, 여호수아가 백성을 이끌고 요단강을 건넘." },
      { id: "jericho", start: -1406, cat: "event", title: "여리고 함락", ref: "수 6장", desc: "7일 동안 성을 돌고 나팔과 함성으로 성벽이 무너짐. 라합의 구원." },

      // 사사 시대
      { id: "othniel", start: -1373, cat: "people", approx: true, title: "옷니엘 (첫 사사)", ref: "삿 3:7–11", desc: "갈렙의 조카. 메소보다미아 왕 구산 리사다임에게서 이스라엘을 구원." },
      { id: "deborah", start: -1209, cat: "people", approx: true, title: "드보라와 바락", ref: "삿 4–5장", desc: "여선지자 드보라가 바락과 함께 하솔 왕 야빈의 군대장관 시스라를 물리침." },
      { id: "gideon", start: -1162, cat: "people", approx: true, title: "기드온", ref: "삿 6–8장", desc: "300명의 용사로 미디안 대군을 물리침." },
      { id: "ruth", start: -1100, cat: "people", approx: true, title: "룻과 보아스", ref: "룻기", desc: "모압 여인 룻이 시어머니 나오미를 따라 베들레헴으로. 보아스와 결혼하여 다윗의 증조모가 됨." },
      { id: "samuel-born", start: -1105, cat: "prophet", approx: true, title: "사무엘 출생", ref: "삼상 1장", desc: "한나의 기도로 태어남. 마지막 사사이자 선지자로 사울과 다윗에게 기름 부음." },
      { id: "samson", start: -1075, cat: "people", approx: true, title: "삼손", ref: "삿 13–16장", desc: "나실인 사사. 블레셋과 싸우다 들릴라에게 속아 힘을 잃었으나 마지막에 다곤 신전을 무너뜨림." },

      // 통일 왕국
      { id: "saul", start: -1050, cat: "king", title: "사울 즉위", ref: "삼상 10장", desc: "백성이 왕을 요구하자 베냐민 지파 사울이 이스라엘의 첫 왕이 됨." },
      { id: "david-born", start: -1040, cat: "people", title: "다윗 출생", ref: "삼하 5:4", desc: "베들레헴 이새의 막내아들." },
      { id: "goliath", start: -1025, cat: "event", approx: true, title: "다윗과 골리앗", ref: "삼상 17장", desc: "소년 다윗이 물매와 돌 하나로 블레셋 장수 골리앗을 쓰러뜨림." },
      { id: "david-king", start: -1010, cat: "king", title: "다윗 즉위 (헤브론)", ref: "삼하 2:1–4", desc: "30세에 헤브론에서 유다의 왕이 됨." },
      { id: "jerusalem", start: -1003, cat: "king", title: "예루살렘 수도·다윗 언약", ref: "삼하 5–7장", desc: "온 이스라엘의 왕이 되어 예루살렘을 수도로 삼음. 영원한 왕위의 약속(다윗 언약)." },
      { id: "solomon", start: -970, cat: "king", title: "솔로몬 즉위", ref: "왕상 1–3장", desc: "다윗의 아들 솔로몬이 왕위에 올라 지혜를 구함." },
      { id: "temple-start", start: -966, cat: "event", title: "성전 건축 시작", ref: "왕상 6:1", desc: "출애굽 후 480년, 솔로몬 4년에 모리아산에 성전 건축 시작." },
      { id: "temple-done", start: -959, cat: "event", title: "솔로몬 성전 완공", ref: "왕상 6:38; 8장", desc: "7년 만에 완공. 봉헌 시 여호와의 영광이 성전에 가득함." },

      // 분열 왕국
      { id: "division", start: -930, cat: "king", title: "왕국 분열", ref: "왕상 12장", desc: "르호보암의 강압 정치로 10지파가 여로보암을 따라 북이스라엘을 세움. 여로보암은 벧엘·단에 금송아지를 세움." },
      { id: "ahab", start: -874, cat: "king", title: "아합 즉위 (북)", ref: "왕상 16:29–33", desc: "이세벨과 결혼하여 바알 숭배를 국가적으로 들여온 북이스라엘의 악한 왕." },
      { id: "carmel", start: -860, cat: "prophet", approx: true, title: "엘리야, 갈멜산 대결", ref: "왕상 18장", desc: "바알 선지자 450명과 대결. 하늘에서 불이 내려 제물을 태움." },
      { id: "elisha", start: -848, cat: "prophet", approx: true, title: "엘리야 승천, 엘리사 계승", ref: "왕하 2장", desc: "엘리야가 회오리바람으로 하늘에 올라가고 엘리사가 갑절의 영감을 받음." },
      { id: "jehu", start: -841, cat: "king", title: "예후의 혁명", ref: "왕하 9–10장", desc: "아합 왕가를 멸하고 바알 숭배를 척결." },
      { id: "jonah", start: -785, cat: "prophet", approx: true, title: "요나, 니느웨 선교", ref: "요나서; 왕하 14:25", desc: "앗시리아 수도 니느웨에 회개를 외치자 온 성이 회개함." },
      { id: "amos-hosea", start: -760, cat: "prophet", approx: true, title: "아모스·호세아", ref: "아모스; 호세아", desc: "북이스라엘의 번영기에 사회 정의와 언약적 사랑을 외친 선지자들." },
      { id: "isaiah", start: -740, cat: "prophet", title: "이사야 소명", ref: "사 6장", desc: "웃시야 왕이 죽던 해 성전에서 거룩하신 하나님을 봄. '내가 여기 있나이다 나를 보내소서.' 메시아 예언(사 7, 9, 53장)." },
      { id: "samaria-fall", start: -722, cat: "event", title: "사마리아 함락 (북이스라엘 멸망)", ref: "왕하 17장", desc: "앗시리아(살만에셀·사르곤 2세)에 멸망. 백성이 흩어지고 이방인이 이주해 사마리아인이 형성됨." },
      { id: "hezekiah", start: -715, cat: "king", title: "히스기야 즉위 (남)", ref: "왕하 18–20장", desc: "우상을 제거하고 유월절을 회복한 개혁 왕. 기도로 15년 생명 연장." },
      { id: "sennacherib", start: -701, cat: "event", title: "산헤립의 예루살렘 포위", ref: "왕하 18–19장; 사 36–37장", desc: "앗시리아 대군이 포위했으나 여호와의 사자가 하룻밤에 18만 5천 명을 침." },
      { id: "josiah", start: -640, cat: "king", title: "요시야 즉위", ref: "왕하 22:1", desc: "8세에 즉위한 남유다의 선한 왕." },
      { id: "jeremiah", start: -627, cat: "prophet", title: "예레미야 소명", ref: "렘 1:1–10", desc: "요시야 13년에 부르심. 유다의 멸망과 70년 포로, 새 언약(렘 31장)을 예언한 '눈물의 선지자'." },
      { id: "book-of-law", start: -622, cat: "event", title: "율법책 발견, 요시야 개혁", ref: "왕하 22–23장", desc: "성전 수리 중 율법책을 발견하고 대대적인 종교 개혁과 유월절 회복." },
      { id: "nineveh-fall", start: -612, cat: "world", title: "니느웨 멸망 (앗시리아)", ref: "나훔서", desc: "바벨론·메대 연합군에 의해 앗시리아 수도 니느웨가 함락됨. 나훔의 예언 성취." },
      { id: "exile1", start: -605, cat: "event", title: "1차 바벨론 포로 (다니엘)", ref: "단 1장; 왕하 24:1", desc: "느부갓네살이 갈그미스 전투 후 예루살렘을 침공. 다니엘과 세 친구가 포로로 끌려감." },
      { id: "exile2", start: -597, cat: "event", title: "2차 포로 (에스겔)", ref: "왕하 24:10–17", desc: "여호야긴 왕과 귀족, 기술자 1만 명이 포로로. 에스겔도 이때 끌려감." },
      { id: "ezekiel", start: -593, cat: "prophet", title: "에스겔 소명", ref: "겔 1장", desc: "그발 강가에서 하나님의 영광의 환상을 봄. 마른 뼈 환상(37장)." },
      { id: "jerusalem-fall", start: -586, cat: "event", title: "예루살렘 함락·성전 파괴", ref: "왕하 25장; 렘 52장", desc: "시드기야 11년, 바벨론이 예루살렘과 솔로몬 성전을 불태움. 3차 포로." },

      // 포로기와 귀환
      { id: "babylon-fall", start: -539, cat: "world", title: "바벨론 멸망 (고레스)", ref: "단 5장; 사 45:1", desc: "벨사살의 잔치 중 벽에 쓰인 글씨 '메네 메네 데겔 우바르신'. 페르시아 고레스가 바벨론을 점령." },
      { id: "cyrus-decree", start: -538, cat: "event", title: "고레스 칙령, 1차 귀환", ref: "스 1–2장; 대하 36:22–23", desc: "고레스가 성전 재건을 허락. 스룹바벨과 약 5만 명이 귀환." },
      { id: "haggai", start: -520, cat: "prophet", title: "학개·스가랴", ref: "학개; 스가랴", desc: "중단된 성전 재건을 다시 시작하도록 격려한 선지자들." },
      { id: "temple2", start: -516, cat: "event", title: "제2성전 완공", ref: "스 6:15", desc: "다리오 왕 6년에 스룹바벨 성전 완공." },
      { id: "esther", start: -479, cat: "people", title: "에스더 왕후", ref: "에 2:16–17", desc: "페르시아 아하수에로(크세르크세스) 왕의 왕후가 되어 하만의 음모에서 유대 민족을 구함. 부림절의 기원." },
      { id: "ezra", start: -458, cat: "event", title: "에스라 귀환", ref: "스 7장", desc: "아닥사스다 7년에 학사 에스라가 귀환하여 율법을 가르침." },
      { id: "nehemiah", start: -445, cat: "event", title: "느헤미야 성벽 재건", ref: "느 2–6장", desc: "예루살렘 성벽을 52일 만에 재건." },
      { id: "malachi", start: -430, cat: "prophet", approx: true, title: "말라기", ref: "말라기", desc: "구약의 마지막 선지자. 엘리야를 보내리라는 예언(말 4:5) 이후 약 400년간 예언이 끊김." },

      // 중간기
      { id: "alexander", start: -332, cat: "world", title: "알렉산더 대왕의 정복", ref: "단 8:5–8, 21", desc: "헬라 제국이 페르시아를 무너뜨리고 유대를 지배. 다니엘서의 숫염소 환상." },
      { id: "septuagint", start: -250, cat: "world", approx: true, title: "70인역(LXX) 번역", ref: "", desc: "알렉산드리아에서 히브리어 구약을 헬라어로 번역. 신약 저자들이 자주 인용함." },
      { id: "maccabees", start: -167, cat: "world", title: "성전 모독·마카비 반란", ref: "단 11:31", desc: "셀레우코스의 안티오쿠스 4세가 성전에 제우스 제단을 세움(멸망의 가증한 것). 마카비 가문이 봉기." },
      { id: "hanukkah", start: -164, cat: "world", title: "성전 재봉헌 (수전절)", ref: "요 10:22", desc: "마카비가 성전을 되찾아 정결하게 하고 재봉헌. 수전절(하누카)의 기원." },
      { id: "pompey", start: -63, cat: "world", title: "폼페이우스, 예루살렘 점령", ref: "", desc: "로마 장군 폼페이우스가 예루살렘을 점령하며 유대가 로마의 지배 아래 들어감." },
      { id: "herod", start: -37, cat: "king", title: "헤롯 대왕 즉위", ref: "마 2:1", desc: "로마 원로원이 임명한 유대의 왕. 이두매 출신." },
      { id: "herod-temple", start: -20, cat: "world", title: "헤롯 성전 확장 시작", ref: "요 2:20", desc: "'이 성전은 사십육 년 동안에 지었거늘' — 헤롯이 제2성전을 대규모로 증축." },
      { id: "jesus-born-ot", start: -5, cat: "event", approx: true, title: "예수 그리스도 탄생 → 신약", ref: "마 1–2장; 눅 2장", desc: "구약의 약속이 성취됨. 신약 타임라인에서 이어집니다.", link: "nt:jesus-born" }
    ]
  },

  nt: {
    name: "신약",
    range: [-40, 105],
    zoom: { min: 6, max: 160, initial: 30 },
    concurrentPad: 1,

    lanes: [
      { id: "rome", name: "로마 황제", hue: 350 },
      { id: "judea", name: "유대 통치자", hue: 28 },
      { id: "jesus", name: "예수 그리스도", hue: 45 },
      { id: "church", name: "사도·초대교회", hue: 205 },
      { id: "paul", name: "바울", hue: 268 },
      { id: "writings", name: "신약 기록", hue: 150 },
      { id: "history", name: "유대·로마 사건", hue: 0 }
    ],

    items: [
      // 로마 황제
      { id: "augustus", lane: "rome", start: -27, end: 14, title: "아우구스투스", ref: "눅 2:1", desc: "로마 초대 황제(옥타비아누스). 그의 호적령으로 요셉과 마리아가 베들레헴에 감." },
      { id: "tiberius", lane: "rome", start: 14, end: 37, title: "티베리우스", ref: "눅 3:1; 20:22–25", desc: "예수님의 공생애와 십자가 시기의 황제. '가이사의 것은 가이사에게' 데나리온의 형상." },
      { id: "caligula", lane: "rome", start: 37, end: 41, title: "칼리굴라", ref: "", desc: "예루살렘 성전에 자기 조각상을 세우려 해 유대인의 큰 반발을 삼." },
      { id: "claudius", lane: "rome", start: 41, end: 54, title: "글라우디오", ref: "행 11:28; 18:2", desc: "천하 흉년(아가보의 예언), 유대인 로마 추방령의 황제." },
      { id: "nero", lane: "rome", start: 54, end: 68, title: "네로", ref: "행 25:11", desc: "바울이 상소한 '가이사'. 64년 로마 대화재 후 그리스도인을 박해. 베드로·바울 순교." },
      { id: "civil-war", lane: "rome", start: 68, end: 69, title: "네 황제의 해", ref: "", desc: "갈바·오토·비텔리우스·베스파시아누스가 차례로 황제가 된 내전기." },
      { id: "vespasian", lane: "rome", start: 69, end: 79, title: "베스파시아누스", ref: "", desc: "유대 전쟁을 지휘하던 장군 출신 황제. 아들 티투스가 예루살렘을 함락." },
      { id: "titus", lane: "rome", start: 79, end: 81, title: "티투스", ref: "", desc: "AD 70년 예루살렘과 성전을 파괴한 장군. 로마의 티투스 개선문." },
      { id: "domitian", lane: "rome", start: 81, end: 96, title: "도미티아누스", ref: "계 1:9", desc: "자신을 '주와 신'으로 부르게 한 황제. 그리스도인 박해, 요한이 밧모섬에 유배됨." },
      { id: "nerva", lane: "rome", start: 96, end: 98, title: "네르바", ref: "", desc: "도미티아누스 이후의 온건한 황제. 요한이 밧모섬에서 풀려났다고 전해짐." },
      { id: "trajan", lane: "rome", start: 98, end: 117, title: "트라야누스", ref: "", desc: "로마 제국 최대 영토의 황제. 그리스도인에 대한 소극적 처벌 정책(플리니우스 서신)." },

      // 유대 통치자
      { id: "herod-great", lane: "judea", start: -37, end: -4, title: "헤롯 대왕", ref: "마 2장", desc: "유대의 왕. 동방박사 방문 후 베들레헴 두 살 아래 남아를 학살. BC 4년 사망." },
      { id: "archelaus", lane: "judea", start: -4, end: 6, title: "아켈라오 (유대)", ref: "마 2:22", desc: "헤롯의 아들. 그를 두려워해 요셉이 갈릴리 나사렛으로 감. 폭정으로 로마에 의해 폐위." },
      { id: "antipas", lane: "judea", start: -4, end: 39, title: "헤롯 안티파스 (갈릴리)", ref: "눅 3:1; 13:32; 23:7–12", desc: "갈릴리·베레아의 분봉왕. 세례 요한을 처형하고, 예수님이 '여우'라 부름. 빌라도와 함께 예수를 심문." },
      { id: "philip", lane: "judea", start: -4, end: 34, title: "분봉왕 빌립", ref: "눅 3:1", desc: "이두래와 드라고닛 지방의 분봉왕. 가이사랴 빌립보를 건설(마 16:13)." },
      { id: "prefects", lane: "judea", start: 6, end: 41, title: "로마 총독 직할 (유대)", ref: "", desc: "아켈라오 폐위 후 유대는 로마 총독이 직접 통치." },
      { id: "caiaphas", lane: "judea", start: 18, end: 36, title: "대제사장 가야바", ref: "마 26:3, 57; 요 11:49–50", desc: "'한 사람이 백성을 위하여 죽는 것이 유익하다'. 예수님의 재판을 주도." },
      { id: "pilate", lane: "judea", start: 26, end: 36, title: "본디오 빌라도", ref: "마 27장; 요 18–19장", desc: "유대 총독. 예수님에게 십자가형을 선고. 사도신경에 이름이 남음." },
      { id: "agrippa1", lane: "judea", start: 41, end: 44, title: "헤롯 아그립바 1세", ref: "행 12장", desc: "야고보를 죽이고 베드로를 가둠. 가이사랴에서 벌레에게 먹혀 죽음(12:23)." },
      { id: "procurators", lane: "judea", start: 44, end: 66, title: "로마 총독 직할 (재개)", ref: "", desc: "아그립바 1세 사후 다시 로마 총독이 유대를 통치." },
      { id: "agrippa2", lane: "judea", start: 50, end: 93, title: "아그립바 2세", ref: "행 25:13–26:32", desc: "버니게와 함께 바울의 변론을 들음. '네가 적은 말로 나를 권하여 그리스도인이 되게 하려는도다.'" },
      { id: "felix", lane: "judea", start: 52, end: 59, title: "총독 벨릭스", ref: "행 23:24–24:27", desc: "바울을 2년간 가이사랴에 구금하며 뇌물을 바람." },
      { id: "festus", lane: "judea", start: 59, end: 62, title: "총독 베스도", ref: "행 25–26장", desc: "바울이 그 앞에서 가이사에게 상소함." },

      // 예수 그리스도
      { id: "john-born", lane: "jesus", start: -6, approx: true, title: "세례 요한 출생", ref: "눅 1장", desc: "제사장 사가랴와 엘리사벳의 아들. 엘리야의 심령과 능력으로 주의 길을 예비할 자." },
      { id: "jesus-born", lane: "jesus", start: -5, approx: true, title: "예수 탄생 (베들레헴)", ref: "마 1–2장; 눅 2장", desc: "헤롯 대왕 사망(BC 4) 이전, 다윗의 동네 베들레헴에서 탄생. 목자들과 동방박사의 경배.", link: "ot:jesus-born-ot" },
      { id: "flight-egypt", lane: "jesus", start: -4, approx: true, title: "이집트 피신·나사렛 정착", ref: "마 2:13–23", desc: "헤롯의 학살을 피해 이집트로 피신했다가 헤롯 사후 나사렛에 정착." },
      { id: "temple-12", lane: "jesus", start: 8, approx: true, title: "12세, 성전 방문", ref: "눅 2:41–52", desc: "'내가 내 아버지 집에 있어야 될 줄을 알지 못하셨나이까.'" },
      { id: "john-ministry", lane: "jesus", start: 26, end: 29, approx: true, title: "세례 요한의 사역", ref: "눅 3:1–20", desc: "디베료(티베리우스) 황제 15년경 요단강에서 회개의 세례를 전파." },
      { id: "ministry", lane: "jesus", start: 27, end: 30, approx: true, title: "예수님의 공생애", ref: "4복음서", desc: "약 3년 반의 공생애 (요한복음의 유월절 3–4회 기준). 십자가 연대는 AD 30 또는 33 두 견해가 있으며 여기서는 AD 30을 따름." },
      { id: "baptism", lane: "jesus", start: 27, approx: true, title: "세례와 광야 시험", ref: "마 3–4장; 눅 3:23", desc: "약 30세에 요단강에서 요한에게 세례를 받고 40일간 광야에서 시험받으심." },
      { id: "cana", lane: "jesus", start: 27.4, approx: true, title: "가나 혼인잔치", ref: "요 2:1–11", desc: "물로 포도주를 만든 첫 번째 표적." },
      { id: "sermon-mount", lane: "jesus", start: 28, approx: true, title: "산상수훈", ref: "마 5–7장", desc: "팔복, 주기도문, 반석 위의 집 — 천국 백성의 삶." },
      { id: "john-death", lane: "jesus", start: 29, approx: true, title: "세례 요한 처형", ref: "마 14:1–12", desc: "헤롯 안티파스가 헤로디아의 딸의 요구로 요한의 목을 벰." },
      { id: "feeding", lane: "jesus", start: 29.3, approx: true, title: "오병이어", ref: "요 6:1–14", desc: "4복음서에 모두 기록된 유일한 기적. 장정만 오천 명을 먹이심." },
      { id: "transfiguration", lane: "jesus", start: 29.6, approx: true, title: "베드로의 고백·변화산", ref: "마 16–17장", desc: "'주는 그리스도시요 살아 계신 하나님의 아들이시니이다.' 이후 높은 산에서 모습이 변화되심." },
      { id: "triumphal", lane: "jesus", start: 30.2, approx: true, title: "예루살렘 입성", ref: "마 21:1–11", desc: "나귀를 타고 입성하심(슥 9:9 성취). '호산나!'" },
      { id: "cross", lane: "jesus", start: 30.25, approx: true, title: "십자가와 부활", ref: "마 26–28장; 고전 15:3–4", desc: "유월절에 최후의 만찬, 겟세마네 기도, 체포와 재판, 골고다에서 십자가에 못 박히심. 사흘 만에 부활." },
      { id: "ascension", lane: "jesus", start: 30.35, approx: true, title: "승천", ref: "행 1:1–11", desc: "부활 후 40일 동안 보이시고 감람산에서 승천. 지상명령(마 28:18–20)." },

      // 사도·초대교회
      { id: "pentecost", lane: "church", start: 30.4, approx: true, title: "오순절 성령 강림", ref: "행 2장", desc: "120명이 성령 충만. 베드로의 설교로 3천 명이 회개하고 예루살렘 교회가 시작됨." },
      { id: "stephen", lane: "church", start: 34, approx: true, title: "스데반 순교", ref: "행 6–7장", desc: "최초의 순교자. 청년 사울이 증인들의 옷을 지킴. 이후 박해로 교회가 흩어짐." },
      { id: "philip-samaria", lane: "church", start: 34.5, approx: true, title: "빌립의 사마리아·에디오피아 내시 전도", ref: "행 8장", desc: "흩어진 성도들이 복음을 전함. 땅끝을 향한 첫걸음." },
      { id: "cornelius", lane: "church", start: 38, approx: true, title: "고넬료 가정 (이방인 전도)", ref: "행 10장", desc: "베드로가 환상을 보고 로마 백부장 고넬료의 집에서 복음을 전함. 이방인에게도 성령이 임함." },
      { id: "antioch", lane: "church", start: 43, approx: true, title: "안디옥 교회, '그리스도인'", ref: "행 11:19–26", desc: "최초의 이방인 중심 교회. 제자들이 처음으로 '그리스도인'이라 불림." },
      { id: "james-martyr", lane: "church", start: 44, title: "야고보 순교·베드로 투옥", ref: "행 12장", desc: "세베대의 아들 야고보가 사도 중 첫 순교. 베드로는 천사의 도움으로 옥에서 나옴." },
      { id: "council", lane: "church", start: 49, title: "예루살렘 공의회", ref: "행 15장", desc: "이방인 신자가 할례 없이 믿음으로 구원받음을 확인. 주의 형제 야고보가 결론을 내림." },
      { id: "james-brother", lane: "church", start: 62, title: "주의 형제 야고보 순교", ref: "(요세푸스)", desc: "예루살렘 교회의 지도자. 대제사장 아나누스에 의해 돌에 맞아 순교." },
      { id: "peter-martyr", lane: "church", start: 66, approx: true, title: "베드로 순교 (로마)", ref: "요 21:18–19", desc: "네로 박해 때 로마에서 순교. 전승에 따르면 거꾸로 십자가에 못 박힘." },
      { id: "pella", lane: "church", start: 66.6, approx: true, title: "예루살렘 교회, 펠라로 피신", ref: "마 24:15–16", desc: "유대 전쟁 직전, 예수님의 경고에 따라 요단 동편 펠라로 피신했다고 전해짐." },
      { id: "patmos", lane: "church", start: 95, approx: true, title: "요한, 밧모섬 유배", ref: "계 1:9", desc: "도미티아누스 박해 때 밧모섬에서 요한계시록의 환상을 받음." },
      { id: "john-dies", lane: "church", start: 100, approx: true, title: "사도 요한 별세 (에베소)", ref: "요 21:22–23", desc: "열두 사도 중 마지막으로, 에베소에서 노년에 자연사했다고 전해짐." },

      // 바울
      { id: "paul-born", lane: "paul", start: 5, approx: true, title: "사울 출생 (다소)", ref: "행 22:3", desc: "길리기아 다소에서 로마 시민권을 가진 베냐민 지파 유대인으로 태어남. 가말리엘 문하에서 수학." },
      { id: "conversion", lane: "paul", start: 34, approx: true, title: "다메섹 회심", ref: "행 9:1–19", desc: "그리스도인을 잡으러 가던 길에 부활하신 예수님을 만남. '사울아 사울아 네가 어찌하여 나를 박해하느냐.'" },
      { id: "arabia", lane: "paul", start: 34, end: 37, approx: true, title: "아라비아·다메섹", ref: "갈 1:17–18", desc: "회심 후 아라비아로 갔다가 다메섹으로 돌아옴. 3년 후 예루살렘으로." },
      { id: "jerusalem-1", lane: "paul", start: 37, approx: true, title: "첫 예루살렘 방문", ref: "갈 1:18; 행 9:26–30", desc: "바나바의 소개로 베드로와 15일간 함께 지냄." },
      { id: "tarsus", lane: "paul", start: 37, end: 43, approx: true, title: "다소 체류", ref: "행 9:30; 갈 1:21", desc: "고향 다소와 길리기아 지역에서 지낸 '숨겨진 시기'." },
      { id: "antioch-paul", lane: "paul", start: 43, end: 46, approx: true, title: "안디옥 사역", ref: "행 11:25–30", desc: "바나바가 바울을 데려와 안디옥에서 1년간 가르침. 기근 구제 헌금을 예루살렘에 전달." },
      { id: "journey1", lane: "paul", start: 47, end: 48.5, approx: true, title: "1차 전도여행", ref: "행 13–14장", desc: "바나바와 함께 구브로, 비시디아 안디옥, 이고니온, 루스드라, 더베. 갈라디아 지역 교회 설립." },
      { id: "journey2", lane: "paul", start: 49.5, end: 52, approx: true, title: "2차 전도여행", ref: "행 15:36–18:22", desc: "실라·디모데·누가와 함께. 마게도냐 환상 후 유럽으로 — 빌립보, 데살로니가, 베뢰아, 아덴, 고린도(1년 6개월)." },
      { id: "journey3", lane: "paul", start: 53, end: 57, approx: true, title: "3차 전도여행", ref: "행 18:23–21:16", desc: "에베소에서 약 3년간 사역(두란노 서원). 마게도냐·고린도를 거쳐 예루살렘으로." },
      { id: "arrest", lane: "paul", start: 57.4, approx: true, title: "예루살렘 성전에서 체포", ref: "행 21:27–23:22", desc: "아시아 유대인들의 선동으로 체포됨. 천부장 앞과 산헤드린 앞에서 변론." },
      { id: "caesarea", lane: "paul", start: 57.5, end: 59.5, approx: true, title: "가이사랴 구금", ref: "행 23:23–26:32", desc: "벨릭스·베스도·아그립바 앞에서 변론. 가이사에게 상소." },
      { id: "voyage", lane: "paul", start: 59.6, end: 60.2, approx: true, title: "로마 압송·멜리데 난파", ref: "행 27–28:15", desc: "유라굴로 광풍으로 난파, 276명 전원 구조. 멜리데 섬에서 겨울을 보냄." },
      { id: "rome-house", lane: "paul", start: 60.2, end: 62, approx: true, title: "로마 가택연금", ref: "행 28:16–31", desc: "셋집에서 2년간 거침없이 하나님 나라를 전파. 옥중서신 기록." },
      { id: "release", lane: "paul", start: 62, end: 66.5, approx: true, title: "석방 후 사역", ref: "딛 1:5; 딤전 1:3", desc: "그레데, 에베소, 마게도냐 등지를 방문(서바나 방문 전승도 있음)." },
      { id: "paul-martyr", lane: "paul", start: 67, approx: true, title: "2차 투옥·순교 (로마)", ref: "딤후 4:6–8", desc: "'나는 선한 싸움을 싸우고 나의 달려갈 길을 마치고 믿음을 지켰으니.' 네로 치하에서 참수됨." },

      // 신약 기록 (모두 추정 연대)
      { id: "w-james", lane: "writings", start: 47, approx: true, title: "야고보서", ref: "", desc: "주의 형제 야고보. 흩어진 열두 지파에게. 신약 중 가장 이른 책 중 하나로 봄." },
      { id: "w-galatians", lane: "writings", start: 49, approx: true, title: "갈라디아서", ref: "", desc: "1차 전도여행 후, 예루살렘 공의회 전후. 오직 믿음으로 말미암는 의." },
      { id: "w-thess", lane: "writings", start: 51, approx: true, title: "데살로니가전·후서", ref: "", desc: "2차 전도여행 중 고린도에서. 주의 재림에 대한 가르침." },
      { id: "w-1cor", lane: "writings", start: 55, approx: true, title: "고린도전서", ref: "", desc: "3차 전도여행 중 에베소에서. 교회의 분쟁과 사랑장(13장), 부활장(15장)." },
      { id: "w-2cor", lane: "writings", start: 56, approx: true, title: "고린도후서", ref: "", desc: "마게도냐에서. 사도직 변호와 연약함 속의 능력." },
      { id: "w-romans", lane: "writings", start: 57, approx: true, title: "로마서", ref: "", desc: "고린도에서 로마 교회에 보냄. 복음의 체계적 설명 — 칭의, 성화, 이스라엘, 삶." },
      { id: "w-mark", lane: "writings", start: 58, approx: true, title: "마가복음", ref: "", desc: "베드로의 증언을 바탕으로 한 가장 짧은 복음서. 섬기는 종으로 오신 예수 (연대는 50–60년대 추정)." },
      { id: "w-matthew", lane: "writings", start: 60, approx: true, title: "마태복음", ref: "", desc: "유대인을 위해 메시아·왕으로 오신 예수를 증언 (연대는 50–60년대 추정)." },
      { id: "w-prison", lane: "writings", start: 61, approx: true, title: "옥중서신 (엡·빌·골·몬)", ref: "", desc: "로마 가택연금 중 기록한 에베소서, 빌립보서, 골로새서, 빌레몬서." },
      { id: "w-luke", lane: "writings", start: 61.5, approx: true, title: "누가복음", ref: "", desc: "의사 누가가 데오빌로에게. 모든 사람의 구주 예수." },
      { id: "w-acts", lane: "writings", start: 62, approx: true, title: "사도행전", ref: "", desc: "누가복음의 속편. 바울의 로마 가택연금으로 끝나므로 62년경 기록으로 봄." },
      { id: "w-pastoral", lane: "writings", start: 63, approx: true, title: "디모데전서·디도서", ref: "", desc: "석방 후 젊은 목회자들에게 쓴 목회서신." },
      { id: "w-1peter", lane: "writings", start: 64, approx: true, title: "베드로전서", ref: "", desc: "'바벨론'(로마)에서 흩어진 나그네들에게. 고난 중의 산 소망." },
      { id: "w-hebrews", lane: "writings", start: 65, approx: true, title: "히브리서", ref: "", desc: "저자 미상. 그리스도의 우월성과 새 언약. 성전 제사가 아직 진행 중인 것으로 보아 70년 이전으로 봄." },
      { id: "w-2peter", lane: "writings", start: 66, approx: true, title: "베드로후서·유다서", ref: "", desc: "순교 직전 베드로의 마지막 편지, 그리고 주의 형제 유다의 편지. 거짓 교사 경계." },
      { id: "w-2tim", lane: "writings", start: 67, approx: true, title: "디모데후서", ref: "", desc: "바울의 마지막 편지. '너는 말씀을 전파하라.'" },
      { id: "w-john", lane: "writings", start: 85, approx: true, title: "요한복음", ref: "", desc: "에베소에서 기록. '이것을 기록함은 너희로 예수께서 하나님의 아들 그리스도이심을 믿게 하려 함이요.'" },
      { id: "w-epistles-john", lane: "writings", start: 90, approx: true, title: "요한1·2·3서", ref: "", desc: "하나님은 사랑이시라. 영지주의적 이단 경계." },
      { id: "w-revelation", lane: "writings", start: 95, approx: true, title: "요한계시록", ref: "", desc: "밧모섬에서 받은 계시. 어린양의 최종 승리와 새 하늘과 새 땅. 성경의 마지막 책." },

      // 유대·로마 사건
      { id: "h-herod-temple", lane: "history", start: -20, title: "헤롯 성전 확장 시작", ref: "요 2:20", desc: "'이 성전은 사십육 년 동안에 지었거늘'." },
      { id: "h-census", lane: "history", start: -6, approx: true, title: "구레뇨 때 호적", ref: "눅 2:1–3", desc: "아우구스투스의 명령으로 각자 고향에서 호적 등록." },
      { id: "h-herod-dies", lane: "history", start: -4, title: "헤롯 대왕 사망", ref: "마 2:19", desc: "여리고에서 사망. 왕국이 세 아들에게 분할됨." },
      { id: "h-judas", lane: "history", start: 6, title: "갈릴리 유다의 반란", ref: "행 5:37", desc: "호적 조사(세금)에 반대하여 일어난 반란. 열심당의 뿌리." },
      { id: "h-expulsion", lane: "history", start: 49, title: "글라우디오의 유대인 추방령", ref: "행 18:2", desc: "이 일로 아굴라와 브리스길라가 고린도로 와서 바울을 만남." },
      { id: "h-fire", lane: "history", start: 64, title: "로마 대화재·네로 박해", ref: "", desc: "네로가 화재의 책임을 그리스도인에게 돌리고 잔혹하게 박해(타키투스 기록)." },
      { id: "h-war", lane: "history", start: 66, end: 73, title: "유대-로마 전쟁", ref: "눅 21:20–24", desc: "유대인의 대반란. 베스파시아누스와 티투스가 진압." },
      { id: "h-jerusalem", lane: "history", start: 70, title: "예루살렘·성전 파괴", ref: "마 24:1–2", desc: "'돌 하나도 돌 위에 남지 않고 다 무너뜨려지리라' — 예수님의 예언 성취. 성전 제사가 끝남." },
      { id: "h-masada", lane: "history", start: 73.3, title: "마사다 함락", ref: "", desc: "유대 반란군의 마지막 거점 함락." },
      { id: "h-vesuvius", lane: "history", start: 79, title: "베수비오 화산 폭발", ref: "", desc: "폼페이와 헤르쿨라네움이 화산재에 묻힘." },
      { id: "h-domitian", lane: "history", start: 95, approx: true, title: "도미티아누스 박해", ref: "계 2–3장", desc: "황제 숭배를 거부한 그리스도인들이 박해받음. 계시록의 일곱 교회 배경." }
    ]
  }
};
