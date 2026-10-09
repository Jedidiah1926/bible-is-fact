/*
 * 진행 중인 연구 · 논쟁 중이거나 논란이 많은 주장 (확인된 사실이 아님)
 *
 * 기준 시점: 2026년 10월
 * 원칙: 확인된 증거(evidence.js)와 섞지 않고, 주장하는 쪽과 학계의 평가, 출처를 함께 적습니다.
 *       학계 다수가 받아들이지 않는 주장도 '논란 많음'으로 표시해 넣습니다.
 *
 * 형식: 항목 id → [{ title, status, who?, text, view, sources }]
 *   status  : "진행 중" | "논쟁 중" | "가설" | "해석 제기" | "미확인" | "논란 많음" | "논문 철회"
 *   who     : 연구 주체·시기
 *   text    : 무엇을 주장·조사하고 있는지
 *   view    : 현재 평가 (학계 반응, 남은 과제)
 *   sources : [{ label, url }] 출처
 *
 * W(): evidence.js에 정의된 위키백과 링크 도우미
 */
window.TIMELINE_RESEARCH_DATE = "2026년 10월";
window.TIMELINE_RESEARCH = {
  // ───────── 구약 ─────────
  "flood": [
    {
      title: "두루프나르 지형 조사 (아라라트산 남쪽 약 30km)",
      status: "진행 중 · 논란 많음",
      who: "시바스 줌후리예트 대학교(첸케르 아틸라 교수) · Noah's Ark Scans(앤드루 존스) · 2026년",
      text: "길이 약 157m의 배 모양 지형. 1977년 론 와이어트가 방주라고 주장하며 알려졌고, 1986년 터키 정부가 국립공원으로 지정함. 2026년 6월 터키 환경부 허가를 받아 지표 투과 레이더 조사를 하고, 9월부터 시추를 시작함. 연구팀은 지형 안쪽 12곳(바깥 4곳)을 최대 약 20m까지 시추했는데 기반암이 나오지 않았고, 지하 빈 공간과 유기물이 풍부한 층을 발견했다고 발표함. 2026년 4월 발표한 토양 조사에서는 지형 안쪽 흙의 유기물이 바깥보다 약 3배, 칼륨이 38% 많았다고 함.",
      view: "연구팀(민간 기독교 단체 포함) 발표 단계이며 독립 검증된 결과는 없음. 실험실 결과는 2027년쯤 나올 예정. 1996년 이 지형을 함께 조사했던 데이비드 파솔드와 지질학자 로렌스 콜린스는 '방주일 수 없고 사람이 만든 것도 아닌' 자연 지형이라고 결론 내렸고, 창조과학자 앤드루 스넬링도 자연 지형으로 봄. 기반암이 없다는 것만으로 인공 구조물이라 할 수 없다는 비판이 있음.",
      sources: [
        { label: "GlobeNewswire – 두루프나르 시추 시작 (2026.9.23)", url: "https://www.globenewswire.com/news-release/2026/09/23/3367545/0/en/core-drilling-begins-at-durupinar-noah-s-ark-site-drill-bit-shatters-on-possible-layer-of-petrified-wood.html" },
        { label: "The Debrief – 시추에서 유기물·지하 공동 발견 주장", url: "https://thedebrief.org/new-drilling-at-controversial-noahs-ark-site-reveals-organic-material-and-mysterious-underground-cavities/" },
        { label: "Anatolian Archaeology – 두루프나르 시추", url: "https://www.anatolianarchaeology.net/scientists-drill-beneath-turkiyes-noahs-ark-formation-to-test-what-really-lies-below/" },
        { label: "Türkiye Today – 두루프나르 연구 착수", url: "https://www.turkiyetoday.com/culture/is-noahs-ark-in-turkiye-scientists-begin-major-study-at-durupinar-3224917" },
        W("Durupınar_site"),
        W("David_Fasold")
      ]
    },
    {
      title: "아라라트산 정상부 '나무 구조물' 발견 주장",
      status: "논란 많음",
      who: "노아의 방주 선교회(NAMI, 홍콩) · 2010년 4월 발표",
      text: "해발 약 4,000m 지점에서 판자 모양 목재로 된 구조물을 발견했고, 약 4,800년 전의 것이며 '99.9% 방주'라고 발표함.",
      view: "초기 탐사에 참여했던 고고학자 랜들 프라이스가 현지인들이 흑해 지역의 오래된 목재를 옮겨다 놓은 조작일 수 있다고 문제를 제기함. 조작 여부도, 방주라는 주장도 독립적으로 검증되지 않았음.",
      sources: [
        { label: "Christian Science Monitor – 방주 발견 주장에 의문 (2010)", url: "https://proof.csmonitor.com/World/Global-Issues/2010/0428/Doubt-cast-on-Noah-s-ark-found-in-Turkey" },
        { label: "Catholic News Agency – 조작 가능성 제기 (2010)", url: "https://catholicnewsagency.com/news/noahs_ark_discovery_could_be_hoax_critic_says" },
        W("Searches_for_Noah's_Ark")
      ]
    },
    {
      title: "아라라트 이상체 (Ararat anomaly)",
      status: "논란 많음",
      who: "1949년 미 공군 정찰 사진 · 2003년 이코노스 위성 사진 · 대니얼 맥기번 등",
      text: "아라라트산 정상 서쪽 해발 약 4,700m 빙원에 찍힌 검은 형체를 방주의 잔해라고 보는 주장.",
      view: "직접 현장 조사가 이뤄진 적이 없고, 학계는 방주 탐색 대부분을 유사고고학으로 봄. 사진상 배처럼 보였던 아라라트의 여러 지형이 실제로 가 보니 자연 암석이었다는 보고도 있음.",
      sources: [W("Ararat_anomaly"), W("Mount_Ararat")]
    },
    {
      title: "흑해 대홍수 가설",
      status: "가설",
      who: "윌리엄 라이언·월터 피트먼 등 · 1997년",
      text: "약 7,600년 전(이후 8,800년 전으로 수정 제안) 지중해 물이 보스포루스를 넘어 담수호였던 흑해로 급격히 쏟아져 들어왔고, 이 기억이 홍수 이야기들의 바탕이 되었다는 가설.",
      view: "흑해가 바닷물로 채워진 사건 자체는 인정되지만, 얼마나 갑작스러웠는지와 시기·규모는 논쟁 중. 홍수 이야기와의 연결도 학자들 사이에 반론이 많음.",
      sources: [W("Black_Sea_deluge_hypothesis")]
    }
  ],
  "babel": [
    {
      title: "바벨론의 지구라트 '에테메난키'",
      status: "가설",
      who: "아시리아학·고고학계",
      text: "바벨론 마르둑 신전의 계단식 탑 '에테메난키(하늘과 땅의 기초의 집)'가 바벨탑 이야기의 배경이라는 견해. 느부갓네살 2세가 이 탑을 다시 쌓았다는 비문과, 탑과 왕의 모습이 새겨진 '바벨탑 석비'가 전해짐.",
      view: "현대 학자 다수가 바벨탑 이야기가 에테메난키의 영향을 받았다고 보지만, 그것이 창세기 11장의 탑 자체인지는 증명할 방법이 없음. 석비는 1917년 발굴품이라고 하나 출처가 불확실하다는 지적이 있음.",
      sources: [W("Etemenanki"), W("Tower_of_Babel")]
    }
  ],
  "sodom": [
    {
      title: "텔 엘하맘 = 소돔 비정과 '공중 폭발' 논문",
      status: "논문 철회",
      who: "스티븐 콜린스(트리니티 사우스웨스트 대학) 발굴단 · 2005년부터 발굴 (요르단)",
      text: "사해 북동쪽 요르단 계곡의 큰 청동기 도시 텔 엘하맘을 성경 지리에 근거해 소돔으로 보고 발굴 중. 2021년 'Scientific Reports'에 BC 1650년경 퉁구스카급 운석 공중 폭발로 도시가 파괴되었다는 논문이 실림.",
      view: "논문은 사진 조작이 드러나 2022년 정정된 데 이어, 데이터가 결론을 뒷받침하지 못한다는 이유로 2025년 4월 학술지가 철회함(저자들은 반발). 발굴단 밖의 고고학자 중 텔 엘하맘을 소돔으로 보는 사람은 적음.",
      sources: [
        { label: "Retraction Watch – 소돔 운석 논문 철회 (2025.4)", url: "https://retractionwatch.com/2025/04/23/sodom-comet-paper-to-be-retracted-two-years-after-editors-note-acknowledging-concerns" },
        { label: "Scientific Reports – 철회 공지 (PMC)", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12022329/" },
        W("Tell_el-Hammam")
      ]
    }
  ],
  "joseph-ruler": [
    {
      title: "아바리스의 셈족 정착지와 '요셉' (롤의 새 연대기)",
      status: "논란 많음",
      who: "이집트학자 데이비드 롤 · 1995년 『A Test of Time』 이후",
      text: "나일 삼각주 동부 아바리스(텔 엘다바) 발굴에서 제13왕조 시대 대규모 셈족 거주지가 확인된 것을 근거로, 이집트 연대를 최대 350년 낮추면 이들이 성경의 이스라엘 체류와 맞고 요셉은 아메넴헤트 3세의 재상이었다고 주장함.",
      view: "아바리스의 셈족 거주지 자체는 발굴로 확인된 사실이지만, 롤의 연대 수정안은 학계 합의 밖의 대안 연대로 분류되며 케네스 키친 등 주류 학자들이 강하게 반대함.",
      sources: [W("New_Chronology_(Rohl)"), W("Egyptian_chronology")]
    }
  ],
  "exodus": [
    {
      title: "출애굽 연대와 고고학 증거 논쟁",
      status: "논쟁 중",
      who: "성경고고학계 전반",
      text: "왕상 6:1을 문자 그대로 계산한 이른 연대(BC 1446년경)와, 출 1:11의 '라암셋' 성 등을 근거로 람세스 2세 때로 보는 늦은 연대(BC 13세기)가 맞서 있음.",
      view: "이집트 기록에서 출애굽을 직접 언급하는 자료는 발견되지 않음. BC 1208년경 메르넵타 석비가 이미 가나안의 '이스라엘'을 언급하므로 그 이전이라는 점만 분명함. 주류 학계에는 특정 사건으로 날짜를 정할 수 없다고 보는 견해도 많음.",
      sources: [W("The_Exodus"), W("Merneptah_Stele")]
    },
    {
      title: "바람에 의한 해수면 하강(wind setdown) 시뮬레이션",
      status: "가설",
      who: "칼 드루스·웨이칭 한 (미국 국립대기연구센터) · 2010년 PLoS ONE",
      text: "강한 동풍이 밤새 불면 나일 삼각주 동부(타니스 호수 부근)의 얕은 물이 밀려나 길이 3–4km, 너비 5km의 땅이 약 4시간 드러날 수 있다는 컴퓨터 모델 결과. 출애굽기 14:21의 '큰 동풍'과 연결함.",
      view: "물리적으로 가능한 현상을 보인 연구일 뿐, 출애굽이 그곳에서 그렇게 일어났다는 증거는 아님. 지형 방향상 동풍으로는 어렵다는 비판도 있음.",
      sources: [
        { label: "Drews & Han (2010), PLoS ONE – Dynamics of Wind Setdown", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2932978/" },
        W("Parting_of_the_Red_Sea")
      ]
    },
    {
      title: "산토리니(테라) 화산 폭발과 열 재앙",
      status: "논란 많음",
      who: "다큐멘터리 「The Exodus Decoded」(2006, 심차 야코보비치·제임스 캐머런) 등",
      text: "BC 16세기경 에게해 테라 화산의 대폭발로 생긴 화산재·기후 변화가 '흑암' 등 재앙과 출애굽 이야기의 배경이 되었다는 주장.",
      view: "화산 폭발 연대(BC 16세기)가 성경 연대와 맞지 않고, 재앙의 순서·시기를 자연현상으로 설명하려는 시도는 성경학자들이 받아들이지 않음. 대중 매체에서 인기 있으나 학계에서는 유사역사로 분류되는 경우가 많음.",
      sources: [W("Minoan_eruption"), W("The_Exodus_Decoded"), W("Plagues_of_Egypt")]
    },
    {
      title: "아카바만 해저 '병거 바퀴' 발견 주장",
      status: "논란 많음",
      who: "론 와이어트 · 1978년 주장",
      text: "아카바만 누에이바 해변 앞바다에서 잠수 중 금박 입힌 병거 바퀴, 말발굽, 이집트 군사의 뼈를 발견했다고 주장하며 이곳을 홍해 도하 지점으로 봄.",
      view: "병거나 뼈에 대한 독립적인 검사는 한 번도 이뤄지지 않았음. 와이어트는 정식 고고학 훈련을 받지 않은 아마추어로, 그의 여러 '발견'은 학계에서 인정받지 못함.",
      sources: [W("Ron_Wyatt"), W("Parting_of_the_Red_Sea")]
    }
  ],
  "sinai": [
    {
      title: "시내산의 위치",
      status: "논쟁 중",
      who: "전통·학계·독립 탐사자",
      text: "4세기부터 전해 온 시나이반도 남부의 '제벨 무사'가 전통적 위치. 1984년 론 와이어트가 사우디아라비아 북서부(미디안 땅)의 '제벨 알라우즈'를 제안했고, 이스라엘 네게브의 '하르 카르콤'(엠마누엘 아나티) 등 여러 후보가 있음.",
      view: "어느 후보지도 출애굽 시기 유적으로 확인되지 않음. 제벨 알라우즈의 소 암각화·돌무더기 등은 다른 시대의 것이거나 아라비아 전역에 흔한 유적이라는 반론이 있고(제임스 호프마이어 등), 하르 카르콤 유적은 BC 2350–2000년이 전성기여서 연대가 맞지 않는다는 비판이 있음.",
      sources: [
        W("Mount_Sinai_(Bible)"),
        W("Mount_Karkom"),
        { label: "Associates for Biblical Research – 제벨 알라우즈 반론", url: "https://biblearchaeology.org/research/exodus-from-egypt/2264-mount-sinai-is-not-jebel-allawz-in-saudi-arabia" }
      ]
    }
  ],
  "p-conquest": [
    {
      title: "에발산 '저주 판' (납 조각)",
      status: "논란 많음",
      who: "스콧 스트리플링(ABR) 연구팀 · 2022년 발표 · 2023년 논문",
      text: "에발산의 1980년대 발굴 폐토를 다시 체로 거르다 찾은 접힌 납 조각을 X선 단층 촬영으로 읽어, BC 1200년경 '여호와(YHW)'의 이름이 들어간 저주문이 새겨진 가장 오래된 히브리어 문서라고 주장함. 에발산에서 저주를 선포하라는 신명기 27장·여호수아 8장과 연결함.",
      view: "늦은 동료 평가와 과장된 주장이 비판받고 있으며, 회의적인 학자 다수는 판독 가능한 글자 자체가 없다고 봄.",
      sources: [W("Mount_Ebal_lead_object")]
    },
    {
      title: "에발산 제단 = 여호수아의 제단?",
      status: "논쟁 중",
      who: "아담 제르탈 (하이파 대학) · 1982–1989년 발굴",
      text: "에발산에서 철기 1기(BC 12세기경)의 제의 구조물이 발굴되어, 발굴자는 여호수아가 쌓은 제단(수 8:30–31)이라고 봄.",
      view: "초기 이스라엘의 제의 장소라는 점은 많은 학자가 인정하지만, 여호수아의 제단이라는 비정은 논쟁 중. 그리심산을 마주 보는 남쪽이 아니라 북쪽 사면에 있다는 점 등이 문제로 지적됨.",
      sources: [W("Mount_Ebal_site"), W("Adam_Zertal")]
    }
  ],
  "jericho": [
    {
      title: "여리고 성벽 파괴 연대 논쟁",
      status: "논쟁 중",
      who: "가스탱(1930년대) · 캐슬린 케년(1952–58) · 브라이언트 우드(1990) · 이탈리아-팔레스타인 발굴단(1997–)",
      text: "불탄 파괴층을 가스탱은 BC 1400년경(여호수아 시대)으로 보았으나, 케년은 BC 1550년경으로 보아 여호수아 때는 성벽 도시가 없었다고 결론 내림. 우드는 토기·무덤의 스카라브 등을 근거로 BC 1400년경을 다시 주장함.",
      view: "1995년 탄화 곡물 방사성탄소 측정(브라윈스·판데르플리흐트)은 BC 1617–1530년으로 케년 쪽 연대를 지지함. 현재 발굴을 이끄는 로렌초 니그로도 케년의 연대를 따르는 등 학계 주류는 BC 16세기 파괴로 보지만, 측정값이 엇갈린다는 반론도 계속됨.",
      sources: [W("Fall_of_Jericho"), W("Bryant_G._Wood"), W("Tell_es-Sultan")]
    }
  ],
  "goliath": [
    {
      title: "가드(텔 에스사피)의 '골리앗' 비슷한 이름 도편",
      status: "해석 제기",
      who: "아렌 마이어(바일란 대학) 발굴단 · 2005년 발견 · 2008년 출판",
      text: "블레셋 도시 가드로 비정되는 텔 에스사피의 BC 10–9세기 지층에서 'ʾLWT', 'WLT'라는 두 이름이 적힌 도편이 나옴. 블레셋 유적에서 맥락이 분명한 가장 이른 알파벳 글.",
      view: "골리앗(GLYT)과 같은 이름은 아니지만 어원적으로 관련된 비셈족 이름으로, 골리앗 같은 이름이 당시 블레셋 문화에 자연스러웠음을 보여 준다는 해석. 골리앗 본인과 연결되는 것은 아님.",
      sources: [W("Tell_es-Safi_inscription"), W("Goliath")]
    }
  ],
  "david-king": [
    {
      title: "키르벳 케이야파와 다윗 시대 유다 왕국의 규모",
      status: "논쟁 중",
      who: "요세프 가르핑켈·사아르 가노르 · 2007–2013년 발굴",
      text: "엘라 골짜기(다윗과 골리앗의 장소)를 내려다보는 BC 10세기 초의 요새 도시(성벽 약 700m)가 발굴됨. 발굴단은 다윗 시대에 이미 조직된 유다 왕국이 있었다는 증거로 봄.",
      view: "유적의 연대는 방사성탄소로 뒷받침되지만, 누가 지었는지와 '왕국'이라 부를 수준인지는 이스라엘 핑켈스타인 등과 논쟁 중. 다윗의 실존 자체는 텔 단 비문으로 확인됨(✓ 참고).",
      sources: [W("Khirbet_Qeiyafa"), W("Yosef_Garfinkel")]
    },
    {
      title: "다윗성의 '큰 돌 구조물' = 다윗의 궁전?",
      status: "논란 많음",
      who: "에일랏 마자르 · 2005년부터 발굴",
      text: "예루살렘 다윗성에서 발굴한 거대한 건물 유적을 BC 10세기의 하나의 공공건물로 보고, 다윗의 궁전(삼하 5:11)일 수 있다고 주장함.",
      view: "하나의 건물인지, 연대가 맞는지, 다윗과 관련 있는지 모두 다른 고고학자들의 반론이 있음. 여부스 시대 말기의 건물로 보는 견해도 있음.",
      sources: [W("Large_Stone_Structure"), W("Eilat_Mazar")]
    }
  ],
  "solomon": [
    {
      title: "솔로몬 시대 건축과 '고/저 연대' 논쟁",
      status: "논쟁 중",
      who: "이가엘 야딘(1950–60년대) · 이스라엘 핑켈스타인(1995–) · 에레즈 벤요세프(팀나, 2013–)",
      text: "하솔·므깃도·게셀의 같은 모양 성문을 솔로몬의 건축(왕상 9:15)으로 본 야딘의 해석에 대해, 핑켈스타인은 지층 연대를 최대 100년 낮추는 '저연대'를 제시해 이를 오므리 왕조의 것으로 봄. 한편 팀나 구리 광산은 BC 11–10세기에 최전성기였음이 밝혀짐.",
      view: "아모스 마자르 등은 저연대에 반대하며 논쟁이 계속됨. 팀나 광산은 에돔 사람들이 운영한 것으로 보여 '솔로몬의 광산'이라는 옛 이름은 맞지 않지만, 유목 세력도 고고학적 흔적이 적은 조직된 사회를 이룰 수 있었다는 점에서 논쟁에 영향을 줌.",
      sources: [W("Kingdom_of_Israel_(united_monarchy)"), W("Timna_Valley"), W("Tel_Megiddo")]
    }
  ],
  "hezekiah": [
    {
      title: "텔 에톤의 세워진 돌과 히스기야 개혁",
      status: "해석 제기",
      who: "아브라함 파우스트(바일란 대학) · 'Jerusalem Journal of Archaeology' (2026년 6월 보도)",
      text: "유다 저지대 텔 에톤의 BC 8세기 대저택 가장 큰 방에 세워져 있던 높이 약 1.4m의 돌기둥(마체바)이 8세기 말 이전에 눕혀져 묻히고 그 위에 단이 만들어진 흔적을, 히스기야의 산당 제거 개혁(왕하 18:4)과 연결하는 해석이 발표됨.",
      view: "파우스트 자신도 개혁 때문이라는 결정적 증거라고 주장하지는 않음. 다른 학자들의 검토가 필요한 단계.",
      sources: [
        { label: "Biblical Archaeology Society – 폐기된 마체바 발견", url: "https://www.biblicalarchaeology.org/daily/ancient-cultures/ancient-israel/canceled-standing-stone-discovered-in-judah/" },
        { label: "The Debrief – 2,700년 된 돌과 히스기야 개혁", url: "https://thedebrief.org/a-2700-year-old-stone-could-shed-new-light-on-a-religious-reform-described-in-the-bible/" }
      ]
    }
  ],
  "isaiah": [
    {
      title: "'선지자 이사야' 인장 자국",
      status: "논란 많음",
      who: "에일랏 마자르 · 2018년 발표 (예루살렘 오벨, 히스기야 인장 근처)",
      text: "'이사야 nvy[…]'라고 읽히는 점토 인장 자국을 '선지자 이사야의 것'으로 복원할 수 있다고 발표함. 히스기야 왕 인장 자국과 약 3m 거리에서 발견됨.",
      view: "인장 일부가 깨져 '선지자'라는 칭호가 확실하지 않고, 이사야는 흔한 이름이어서 다른 사람일 수 있다는 반론(크리스토퍼 롤스턴 등)이 있음.",
      sources: [W("Isaiah_bulla"), W("Christopher_Rollston")]
    }
  ],
  "jeremiah": [
    {
      title: "예레미야의 서기관 '네리야의 아들 바룩' 인장 자국",
      status: "논란 많음",
      who: "1975년 골동품 시장에 등장 (나흐만 아비가드 출판) · 1996년 지문이 찍힌 두 번째 인장",
      text: "예레미야의 말을 받아 적은 서기관 바룩(렘 36:4)의 이름이 새겨진 인장 자국. 두 번째 인장에는 지문이 있어 바룩 본인의 지문일 수 있다는 주장까지 나왔음.",
      view: "정식 발굴이 아니라 골동품 시장에서 나왔고, 현재는 대부분의 학자가 위조품으로 봄.",
      sources: [W("Baruch_ben_Neriah")]
    }
  ],
  "jerusalem-fall": [
    {
      title: "BC 586년 파괴층의 불탄 들보",
      status: "분석 진행 중",
      who: "이스라엘 고고학청·텔아비브 대학 (예루살렘 다윗성 기바티 주차장 발굴) · 2026년 7월 발표",
      text: "제1성전 시대 건물 안뜰의 지붕으로 보이는 굵은 들보들이 불에 탄 채 바닥에 무너진 상태로 발견됨. 불에 녹은 벽 회반죽이 덮어 약 2,600년 동안 보존됨. 바벨론의 예루살렘 파괴 때 무너진 것으로 봄.",
      view: "들보에 나이테가 많아 연대 범위를 약 10년 단위까지 좁힐 수 있을 것으로 연구팀이 기대하며 분석 중. 결과는 아직 발표되지 않음.",
      sources: [
        { label: "텔아비브 대학 – 불탄 들보 발견 (2026.7)", url: "https://english.tau.ac.il/node/3967" },
        { label: "Friends of the IAA – 발굴 발표 (2026.7.27)", url: "https://www.friendsofiaa.org/news-in-antiquities/2026/7/27/burnt-wooden-beams-from-the-destruction-of-jerusalem-during-the-first-temple-period-discovered-in-the-city-of-david" }
      ]
    },
    {
      title: "언약궤가 에티오피아 악숨에 있다는 주장",
      status: "논란 많음",
      who: "에티오피아 정교회 전승 · 그레이엄 핸콕 『The Sign and the Seal』(1992)",
      text: "바벨론 파괴 이후 행방이 사라진 언약궤가 솔로몬과 스바 여왕의 아들 메넬리크 1세를 통해 에티오피아로 옮겨져 악숨의 시온 성모 마리아 교회에 보관되어 있다는 전승.",
      view: "평생 지키는 수도사 한 명만 볼 수 있어 검증이 불가능함. 1941년에 직접 봤다는 에티오피아학자 에드워드 울렌도르프는 중세 후기에 만든 빈 상자였다고 증언함. 학계는 원래 언약궤일 가능성을 낮게 봄.",
      sources: [W("Church_of_Our_Lady_Mary_of_Zion"), W("Ark_of_the_Covenant")]
    }
  ],

  // ───────── 신약 ─────────
  "h-census": [
    {
      title: "구레뇨 호적의 연대 문제",
      status: "논쟁 중",
      who: "성경학·로마사 학계",
      text: "누가복음 2:1–2은 예수 탄생 때 '구레뇨가 수리아 총독'이었을 때의 호적을 언급함. 그런데 요세푸스에 따르면 구레뇨의 유대 인구 조사는 아켈라오 폐위 후인 AD 6년이고, 마태복음은 예수가 헤롯 대왕(BC 4년 사망) 때 태어났다고 기록함.",
      view: "약 10년의 차이를 두고, 누가의 착오로 보는 견해와 구레뇨가 앞서 다른 직책으로 조사를 했거나 '첫 번째 호적'이라는 표현을 다르게 해석하는 견해 등이 맞서 있음. 결론이 나지 않은 문제.",
      sources: [W("Census_of_Quirinius"), W("Quirinius")]
    }
  ],
  "jesus-born": [
    {
      title: "베들레헴의 별의 정체",
      status: "가설",
      who: "요하네스 케플러(1614) · 콜린 험프리스 · 마이클 몰너(1999) 등",
      text: "동방박사가 본 별(마 2:1–12)을 BC 7년 목성-토성 세 차례 합, BC 5년 중국 기록의 혜성, BC 6년의 특별한 점성술적 배치 등 실제 천문 현상으로 설명하려는 가설들.",
      view: "어느 가설도 널리 받아들여지지 않았음. 합은 두 행성이 1도 가까이 떨어져 눈에 띄지 않았다는 계산이 있고, 혜성은 몇 달 동안 머물렀다는 묘사와 맞추기 어렵다는 비판이 있음. 2026년에도 케플러 가설을 검증하는 논문이 나오는 등 연구가 계속됨.",
      sources: [W("Star_of_Bethlehem"), W("Great_conjunction")]
    }
  ],
  "ministry": [
    {
      title: "가버나움 '베드로의 집'",
      status: "해석 논쟁",
      who: "프란치스코회 비르질리오 코르보·스타니슬라오 로프레다 · 1968년부터 발굴",
      text: "가버나움의 5세기 팔각형 교회 바로 아래에서 1세기경부터 쓰인 주택이 발굴됨. 일찍부터 특별히 공경받은 흔적이 있어 베드로의 집(막 1:29)으로 여겨지며, 지금은 그 위에 유리 바닥 교회가 세워져 있음.",
      view: "초기 그리스도인의 '집 교회'로 쓰였다는 해석이 있으나, 베드로의 이름이 적혔다는 낙서가 거의 판독되지 않는다는 등 비판이 있어 베드로의 집이라는 증명은 없음.",
      sources: [W("St._Peter's_Church,_Capernaum"), W("Capernaum")]
    }
  ],
  "pilate": [
    {
      title: "헤로디움의 '빌라도' 반지",
      status: "해석 논쟁",
      who: "1968–69년 헤로디움 발굴 출토 · 2018년 세척 후 판독 (Israel Exploration Journal)",
      text: "구리 합금 인장 반지에 헬라어로 '빌라도의 것'이라는 글자가 확인됨.",
      view: "빌라도라는 이름이 드물어 총독과 관련 있을 수 있지만, 값싼 재질이라 총독 본인보다는 그의 부하나 동명의 다른 사람의 것일 가능성도 같다고 연구진도 밝힘.",
      sources: [W("Pontius_Pilate"), W("Herodium")]
    }
  ],
  "cross": [
    {
      title: "성묘교회 바닥 아래 발굴",
      status: "진행 중",
      who: "로마 사피엔차 대학(프란체스카 로마나 스타솔라) · 2022년부터 · 2025년 발굴 예비 보고서 2026년 출판",
      text: "예수의 십자가·무덤 자리로 전해 오는 성묘교회 바닥을 교체하면서 약 200년 만의 대규모 발굴이 진행됨. 채석장 → 경작지 → 1세기 무덤 지역으로 바뀐 흔적과 함께, 바위를 깎은 무덤들, 올리브와 포도나무의 꽃가루·씨앗이 발견됨. 연구팀은 처형지 가까이에 동산과 새 무덤이 있었다는 요한복음 19:41의 묘사와 맞는다고 봄.",
      view: "식물 유물의 정확한 연대는 추가 분석 중. 발굴팀도 이 무덤이 예수의 무덤이라는 증거(비문 등)를 찾았다고 주장하지는 않음.",
      sources: [
        { label: "Archaeology Magazine – 성묘교회 아래 고대 정원 (2025)", url: "https://archaeologymag.com/2025/04/ancient-garden-found-at-jesus-burial-site" },
        { label: "Newsweek – 성묘교회 발굴 (2026)", url: "https://www.newsweek.com/possible-jesus-tomb-matching-bible-account-discovered-12381399" },
        { label: "Sapienza 대학 연구 저장소 – 스타솔라 예비 보고", url: "https://iris.uniroma1.it/handle/11573/1772471" }
      ]
    },
    {
      title: "정원 무덤 (Garden Tomb)",
      status: "논쟁 중",
      who: "1883년 찰스 고든 장군 제안 · 가브리엘 바르카이 연대 연구",
      text: "예루살렘 다마스쿠스 문 북쪽의 바위 무덤을 예수의 무덤으로 보는 개신교 전통. 근처 바위 언덕이 해골 모양이어서 골고다라는 주장과 함께 알려짐.",
      view: "바르카이는 1세기 무덤의 특징이 없고 BC 8–7세기 철기 시대 무덤이라고 봄(헬라 시대로 보는 견해도 있음). 학계 대부분은 성묘교회 쪽 전통이 더 오래되고 가능성이 높다고 봄.",
      sources: [W("Garden_Tomb"), W("Tomb_of_Jesus")]
    },
    {
      title: "탈피오트 무덤 = '예수 가족 무덤'?",
      status: "논란 많음",
      who: "다큐멘터리 「The Lost Tomb of Jesus」(2007, 심차 야코보비치·제임스 캐머런) · 제임스 테이버",
      text: "1980년 예루살렘 탈피오트에서 발견된 무덤의 유골함들에 '요셉의 아들 예수', '마리아' 등의 이름이 있다는 점을 들어 나사렛 예수와 가족의 무덤이라고 주장함.",
      view: "당시 매우 흔한 이름들이라는 반론(유골함을 목록화한 조 지아스 등)이 강하고, 2008년 예루살렘 학술회의에서도 대다수 학자가 가능성이 낮다고 봄. 다큐멘터리는 유사고고학이라는 비판을 받음.",
      sources: [W("Talpiot_Tomb"), W("The_Lost_Tomb_of_Jesus")]
    },
    {
      title: "토리노 수의의 연대",
      status: "논란 많음",
      who: "1988년 방사성탄소 측정(옥스퍼드·취리히·애리조나) · 2022년 X선 분석(리베라토 데 카로 등, 'Heritage')",
      text: "예수의 장례 수의로 전해 오는 아마포. 1988년 방사성탄소 측정은 AD 1260–1390년으로 나왔음. 2022년 광각 X선 산란으로 아마 섬유의 노화 정도를 측정한 연구는 1세기 시료와 비슷한 결과가 나왔다고 발표함.",
      view: "2022년 연구는 출처가 불분명한 0.5×1mm 크기 실 하나를 쓴 예비 결과이고, 방법도 학계에서 검증되지 않았다는 비판이 있음. 전문가들은 여전히 1988년 측정 결과를 타당하다고 봄. 수의가 1세기 것이라 해도 예수의 수의인지는 별개 문제임.",
      sources: [
        W("Shroud_of_Turin"),
        { label: "De Caro 외 (2022), Heritage – X-ray Dating of a Turin Shroud's Linen Sample", url: "https://www.mdpi.com/2571-9408/5/2/47" },
        W("Fringe_theories_about_the_Shroud_of_Turin")
      ]
    },
    {
      title: "십자가 날짜: AD 33년 4월 3일과 월식",
      status: "가설",
      who: "콜린 험프리스·W. G. 워딩턴 (1983, 2011년 책)",
      text: "유대 달력 계산으로 십자가 날짜 후보를 AD 30년 4월 7일과 AD 33년 4월 3일로 좁히고, AD 33년 4월 3일 저녁에 있었던 부분 월식이 사도행전 2:20의 '달이 피가 되리라'와 연결된다고 주장함.",
      view: "그날 월식이 있었다는 것은 천문학적으로 맞지만, 달이 뜰 때 하늘이 밝아 보이지 않았을 것이라는 반론(브래들리 섀퍼)이 있음. 학자들은 대체로 AD 30년과 33년을 모두 가능한 날짜로 봄(이 타임라인은 AD 30을 따름).",
      sources: [W("Chronology_of_Jesus"), W("Colin_Humphreys")]
    }
  ],
  "james-brother": [
    {
      title: "'예수의 형제 야고보' 유골함",
      status: "논란 많음",
      who: "골동품 수집가 오데드 골란 소장 · 2002년 공개 · 2004–2012년 위조 재판",
      text: "'요셉의 아들, 예수의 형제 야고보'라고 새겨진 1세기 유골함. 진품이라면 예수에 대한 가장 오래된 고고학 유물이 됨.",
      view: "이스라엘 고고학청은 비문 일부를 현대 위조로 판단해 기소했으나, 2012년 법원은 위조를 입증하지 못했다며 무죄를 선고함. 다만 판사는 이것이 진품이라는 뜻은 아니라고 밝혔고, 지금도 위조로 보는 학자들이 있음.",
      sources: [W("James_Ossuary"), W("Oded_Golan")]
    }
  ],
  "peter-martyr": [
    {
      title: "바티칸 성 베드로 대성당 지하의 무덤과 뼈",
      status: "미확인",
      who: "바티칸 발굴(1939–1949) · 마르게리타 과르두치 연구 · 1968년 교황 바오로 6세 발표",
      text: "대성당 제대 아래 2세기 기념물이 있는 무덤 구역이 발굴됨. 과르두치는 낙서 벽의 벽감에서 나온 뼈(60–70대 건장한 남성)를 베드로의 것으로 보았고, 바오로 6세는 1968년 '설득력 있게 확인되었다'고 발표함.",
      view: "근거는 정황 증거이며, 발굴을 이끈 고고학자 안토니오 페루아도 베드로의 뼈라는 데 확신하지 않았다고 밝힘. 2세기부터 이곳이 베드로의 무덤으로 공경받았다는 점은 널리 인정됨.",
      sources: [W("Saint_Peter's_tomb"), W("Margherita_Guarducci")]
    }
  ],
  "paul-martyr": [
    {
      title: "성 밖 성 바울 대성당의 석관",
      status: "미확인",
      who: "바티칸 발굴 · 2002년 발견 · 2006년 확인 발표 · 2009년 교황 베네딕토 16세 발표",
      text: "대성당 제대 아래에서 '사도 바울 순교자(PAULO APOSTOLO MART)'라고 새겨진 대리석 석관이 확인됨. 작은 구멍으로 채취한 뼛조각의 방사성탄소 측정 결과 1–2세기 사람의 것으로 나왔다고 발표됨.",
      view: "바티칸 박물관 분석실장 울데리코 산타마리아도 이 연대가 바울의 유해임을 확인하지도 부정하지도 않는다고 말함. 뼈가 바울의 것인지는 확인할 방법이 없음.",
      sources: [W("Basilica_of_Saint_Paul_Outside_the_Walls")]
    }
  ]
};
