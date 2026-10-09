/*
 * 역사 기록으로 잘 알려진 사실 (일반 역사)
 *
 * evidence.js(성경 내용을 뒷받침하는 증거)와 달리, 성경과 별개로
 * 역사학에서 이미 확립된 인물·국가·사건임을 표시합니다.
 *
 * 형식: 항목 id → { text, sources }
 * W(): evidence.js에 정의된 위키백과 링크 도우미
 */
window.TIMELINE_HISTORY = {
  // ───────── 구약 시대 · 주변 세계 ─────────
  "eg-middle": {
    text: "BC 2055–1650년경 테베의 왕들이 이집트를 다시 통일한 시대. 피라미드·문서·신전 등으로 잘 알려져 있음. (연대는 학자마다 수십 년 차이)",
    sources: [W("History_of_ancient_Egypt")]
  },
  "hyksos": {
    text: "서아시아 계통의 힉소스가 나일 삼각주 아바리스를 중심으로 하이집트를 다스린 시기(제2중간기). 전차와 복합궁을 이집트에 들여왔고, 아흐모세 1세에게 쫓겨남.",
    sources: [W("Hyksos"), W("Second_Intermediate_Period_of_Egypt")]
  },
  "eg-new": {
    text: "아흐모세 1세가 힉소스를 몰아내고 세운 이집트의 전성기(BC 1550–1069년경). 투트모세 3세, 아케나텐, 람세스 2세 등의 시대로, 가나안 지역도 지배함.",
    sources: [W("History_of_ancient_Egypt")]
  },
  "assyria": {
    text: "BC 911–609년 근동 대부분을 지배한 제국. 수도 니느웨 등의 궁전·비문·점토판이 대량으로 발굴되어 연대가 잘 정리되어 있음.",
    sources: [W("Neo-Assyrian_Empire")]
  },
  "neo-babylon": {
    text: "나보폴라사르가 세우고 느부갓네살 2세 때 전성기를 맞은 제국(BC 626–539). 바벨론의 이슈타르 문, 연대기 점토판 등으로 잘 알려져 있음.",
    sources: [W("Neo-Babylonian_Empire")]
  },
  "persia": {
    text: "고레스 2세가 세운 아케메네스 페르시아 제국(BC 550–330). 다리오 1세의 베히스툰 비문, 페르세폴리스 등 풍부한 자료가 남아 있음. 크세르크세스 1세가 에스더서의 아하수에로로 여겨짐.",
    sources: [W("Achaemenid_Empire")]
  },
  "hellenistic": {
    text: "알렉산더 사후 그의 장군들이 세운 왕조들. 유대는 처음에는 이집트의 프톨레마이오스 왕조, BC 200년경부터 시리아의 셀레우코스 왕조의 지배를 받음.",
    sources: [W("Hellenistic_Palestine"), W("Seleucid_Empire")]
  },
  "rome-rep": {
    text: "BC 63년 폼페이우스가 예루살렘을 점령한 뒤 유대는 로마의 영향 아래 들어감. 로마 공화정은 BC 27년 아우구스투스의 즉위로 제정으로 바뀜.",
    sources: [W("Siege_of_Jerusalem_(63_BC)"), W("Augustus")]
  },
  "alexander": {
    text: "마케도니아의 알렉산더 3세(BC 356–323). BC 333년 이소스, BC 331년 가우가멜라에서 페르시아를 무찌르고 제국을 정복함. 고대 사료와 동전으로 잘 알려진 인물.",
    sources: [W("Alexander_the_Great")]
  },
  "septuagint": {
    text: "BC 3–2세기 알렉산드리아에서 히브리어 성경을 헬라어로 옮긴 번역본. 72명의 번역자 이야기('아리스테아스의 편지')는 전설로 보지만, 번역이 이 시기에 이루어진 것은 사본으로 확인됨.",
    sources: [W("Septuagint")]
  },
  "maccabees": {
    text: "BC 167년 셀레우코스 왕 안티오코스 4세가 유대교 관습을 금지하고 성전을 이교 제의에 쓰자, 제사장 마타티아스와 아들 유다 마카비가 일으킨 반란. 마카비서와 요세푸스의 기록으로 알려짐.",
    sources: [W("Maccabean_Revolt")]
  },
  "hanukkah": {
    text: "유다 마카비가 BC 164년 예루살렘을 되찾아 성전을 정결하게 하고 다시 봉헌한 일. 유대인의 명절 하누카(수전절)의 기원으로 오늘날까지 지켜짐.",
    sources: [W("Hanukkah"), W("Maccabean_Revolt")]
  },
  "pompey": {
    text: "하스몬 왕가의 형제 히르카누스 2세와 아리스토불루스 2세의 다툼에 개입한 로마 장군 폼페이우스가 3개월 포위 끝에 성전 산을 함락하고 지성소에 들어감. 유대는 왕국 칭호를 잃고 로마의 속국이 됨.",
    sources: [W("Siege_of_Jerusalem_(63_BC)"), W("Hasmonean_dynasty")]
  },
  "herod": {
    text: "로마 원로원이 '유대인의 왕'으로 임명한 헤롯(재위 BC 37–4). 예루살렘 성전 증축, 가이사랴 항구, 마사다·헤로디움 요새 등 그의 건축물이 지금도 남아 있음.",
    sources: [W("Herod_the_Great")]
  },
  "p-greek": {
    text: "알렉산더의 정복(BC 332) 이후 유대가 헬라 왕조들의 지배를 받은 시기.",
    sources: [W("Hellenistic_Palestine")]
  },
  "p-hasmonean": {
    text: "마카비 반란으로 독립한 하스몬 왕조가 유대를 다스린 시기. 요한 히르카누스 때 영토를 크게 넓혔으나 내분과 로마의 개입으로 쇠퇴함.",
    sources: [W("Hasmonean_dynasty"), W("Hasmonean_Judea")]
  },
  "p-rome": {
    text: "BC 63년 폼페이우스의 예루살렘 점령 이후 유대가 로마의 지배를 받은 시기.",
    sources: [W("Siege_of_Jerusalem_(63_BC)"), W("Judaea_(Roman_province)")]
  },

  // ───────── 신약 시대 · 로마 황제 ─────────
  "augustus": {
    text: "로마 제국 초대 황제(재위 BC 27–AD 14). 자신이 쓴 『업적록(Res Gestae)』, 수많은 비문·동전·조각상으로 잘 알려진 인물. 그가 여러 차례 인구 조사를 했다는 것도 『업적록』에 나옴.",
    sources: [W("Augustus")]
  },
  "tiberius": {
    text: "제2대 황제(재위 AD 14–37). 타키투스·수에토니우스의 기록과 동전으로 잘 알려짐. 그의 얼굴이 새겨진 데나리온 은화가 '가이사의 것은 가이사에게'(막 12:16)의 동전으로 흔히 여겨짐.",
    sources: [W("Tiberius"), W("Render_unto_Caesar")]
  },
  "caligula": {
    text: "제3대 황제(재위 AD 37–41). 예루살렘 성전에 자기 조각상을 세우라고 명령해 유대인의 큰 반발을 샀으나 암살되어 실행되지 않음(요세푸스·필론 기록).",
    sources: [W("Caligula")]
  },
  "claudius": {
    text: "제4대 황제(재위 AD 41–54). 로마의 유대인 추방(수에토니우스), 갈리오 비문 등 신약 연대와 맞닿은 기록이 많음.",
    sources: [W("Claudius")]
  },
  "nero": {
    text: "제5대 황제(재위 AD 54–68). AD 64년 로마 대화재 후 그리스도인을 처형한 것이 로마 정부의 첫 조직적 박해로 여겨짐(타키투스). AD 68년 자살하면서 율리우스-클라우디우스 왕조가 끝남.",
    sources: [W("Nero"), W("Persecution_of_Christians_in_the_Roman_Empire")]
  },
  "civil-war": {
    text: "네로 사후 AD 69년 한 해 동안 갈바·오토·비텔리우스·베스파시아누스가 차례로 황제가 된 로마 최초의 내전. 유대 전쟁을 지휘하던 베스파시아누스가 최종 승자가 됨.",
    sources: [W("Year_of_the_Four_Emperors")]
  },
  "vespasian": {
    text: "플라비우스 왕조를 연 황제(재위 AD 69–79). 유대 전쟁 중 황제로 추대되었고, 콜로세움 건설을 시작함.",
    sources: [W("Vespasian")]
  },
  "titus": {
    text: "베스파시아누스의 아들(재위 AD 79–81). 장군으로서 AD 70년 예루살렘을 함락했고, 재위 중 베수비오 화산이 폭발함. 로마의 티투스 개선문이 그의 승리를 기념함.",
    sources: [W("Titus"), W("Arch_of_Titus")]
  },
  "domitian": {
    text: "플라비우스 왕조의 마지막 황제(재위 AD 81–96). 스스로를 '주이자 신'으로 부르게 했다고 전해짐. 그리스도인 박해의 규모는 학자들 사이에 이견이 있음.",
    sources: [W("Domitian")]
  },
  "nerva": {
    text: "도미티아누스 암살 후 원로원이 세운 황제(재위 AD 96–98). 이른바 '오현제' 시대의 첫 황제.",
    sources: [W("Nerva")]
  },
  "trajan": {
    text: "재위 AD 98–117. 로마 제국 최대 영토를 이룸. 비티니아 총독 플리니우스와 주고받은 편지에 그리스도인을 어떻게 처리할지에 대한 지침이 남아 있음.",
    sources: [W("Trajan"), W("Pliny_the_Younger_on_Christians")]
  },

  // ───────── 신약 시대 · 유대 통치자 ─────────
  "herod-great": {
    text: "로마가 세운 유대의 왕(재위 BC 37–4). 성전 증축과 여러 요새·도시 건설로 유명하며, 요세푸스가 생애를 자세히 기록함. 사망 연도는 BC 4년이 통설(BC 1년설도 있음).",
    sources: [W("Herod_the_Great")]
  },
  "archelaus": {
    text: "헤롯의 아들. 유대·사마리아·이두매의 분봉왕(BC 4–AD 6)이었으나 폭정으로 아우구스투스에게 폐위되고, 그 땅은 로마의 직할 속주가 됨.",
    sources: [W("Herod_Archelaus"), W("Herodian_tetrarchy")]
  },
  "antipas": {
    text: "헤롯의 아들. 갈릴리와 베레아의 분봉왕(BC 4–AD 39). 디베랴 도시를 세웠고, AD 39년 칼리굴라에게 유배됨(요세푸스).",
    sources: [W("Herod_Antipas")]
  },
  "philip": {
    text: "헤롯의 아들. 갈릴리 바다 북동쪽 이두래·드라고닛 등의 분봉왕(BC 4–AD 34). 가이사랴 빌립보와 벳새다 율리아스를 건설함.",
    sources: [W("Herodian_tetrarchy")]
  },
  "prefects": {
    text: "AD 6년 아켈라오 폐위 후 유대는 가이사랴에 주재하는 로마 총독이 직접 다스리는 속주가 됨. 총독들이 발행한 동전이 남아 있음.",
    sources: [W("Judaea_(Roman_province)"), W("Procuratorial_coinage_of_Roman_Judaea")]
  },
  "procurators": {
    text: "아그립바 1세 사후 AD 44년부터 다시 로마 총독이 유대를 다스림. 총독들의 실정이 AD 66년 유대 전쟁의 원인 중 하나로 꼽힘(요세푸스).",
    sources: [W("Judaea_(Roman_province)")]
  },
  "agrippa2": {
    text: "헤롯 가문의 마지막 왕. 로마의 지원으로 갈릴리 일부 등을 다스렸고, 유대 전쟁 때 로마 편에 섬. 요세푸스의 기록과 동전으로 알려짐.",
    sources: [W("Herod_Agrippa_II")]
  },
  "felix": {
    text: "유대 총독(AD 52–58/60년경). 황제의 해방노예 출신 형 팔라스의 영향으로 임명됨. 요세푸스와 타키투스가 잔혹하고 뇌물을 밝힌 통치자로 기록함.",
    sources: [W("Antonius_Felix")]
  },
  "festus": {
    text: "벨릭스의 후임 유대 총독(AD 59–62년경). 요세푸스도 그가 벨릭스의 뒤를 이었다고 기록하며, 그가 발행한 동전이 남아 있음. 재임 중 사망함.",
    sources: [W("Porcius_Festus")]
  },

  // ───────── 신약 시대 · 유대·로마 사건 ─────────
  "h-herod-dies": {
    text: "헤롯 대왕이 여리고에서 병으로 죽은 뒤(요세푸스 기록), 왕국이 아켈라오·안티파스·빌립 세 아들에게 나뉨.",
    sources: [W("Herod_the_Great"), W("Herodian_tetrarchy")]
  },
  "h-judas": {
    text: "AD 6년 구레뇨의 인구·세금 조사에 반대해 갈릴리 사람 유다가 일으킨 반란. 곧 진압되었으나, 요세푸스는 이 운동을 유대 전쟁으로 이어진 '제4의 학파'(열심당의 뿌리)로 봄.",
    sources: [W("Judas_of_Galilee")]
  },
  "h-war": {
    text: "AD 66년 시작된 유대인의 대반란. 베스파시아누스와 티투스가 진압했고 AD 70년 예루살렘이 함락됨. 직접 참전했던 요세푸스의 『유대 전쟁사』가 주요 사료.",
    sources: [W("First_Jewish–Roman_War")]
  },
  "h-masada": {
    text: "유대 전쟁의 마지막 거점 마사다를 로마 제10군단이 포위벽과 공성 경사로를 쌓아 함락함. 경사로와 로마군 진지가 지금도 남아 있음. (요세푸스가 전한 960명 집단 자결의 세부 내용은 역사가들 사이에 논쟁이 있음)",
    sources: [W("Siege_of_Masada")]
  },
  "h-vesuvius": {
    text: "베수비오 화산 폭발로 폼페이와 헤르쿨라네움 등이 묻힘. 소(小)플리니우스가 타키투스에게 보낸 편지가 유일한 목격 기록.",
    sources: [W("Eruption_of_Mount_Vesuvius_in_79_AD")]
  }
};
