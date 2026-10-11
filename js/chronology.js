/*
 * 연대 학설 비교 — 학자마다 연대가 크게 갈리는 항목
 *   id: [{ label, when, start, end?, current?, note, sources }]
 *   current: true 인 것이 타임라인에 표시된 연대 (나머지는 선택했을 때 점선으로 함께 표시)
 * W(제목) = 위키백과 링크 (js/evidence.js)
 */
window.TIMELINE_CHRONOLOGY = {
  exodus: [
    { label: "이른 연대", when: "BC 1446년경", start: -1446, current: true, note: "솔로몬 4년(BC 966)이 출애굽 후 480년째라는 왕상 6:1을 그대로 계산. 보수 복음주의 학자들이 주로 따름.", sources: [W("Date of the Exodus")] },
    { label: "늦은 연대", when: "BC 1270–1250년경", start: -1260, note: "이스라엘이 '라암셋' 성을 건축했다는 출 1:11과 람세스 2세 시대를 연결하고, 480년을 상징적 숫자(12세대×40년)로 봄. 출애굽의 역사성을 인정하는 학자들 가운데 다수 견해.", sources: [W("Date of the Exodus"), W("The Exodus")] },
    { label: "역사성 회의", when: "—", note: "고고학적 증거가 부족해 출애굽을 그대로의 역사로 보지 않거나, 작은 집단의 경험이 확대된 것으로 보는 학자도 많음.", sources: [W("The Exodus")] }
  ],
  jericho: [
    { label: "이른 연대", when: "BC 1406년경", start: -1406, current: true, note: "이른 출애굽 연대에서 40년 뒤. 브라이언트 우드는 여리고 성의 파괴층(City IV)을 BC 1400년경으로 봄.", sources: [W("Jericho")] },
    { label: "고고학 다수 견해", when: "BC 1550년경 파괴", start: -1550, note: "캐슬린 케년의 발굴(1950년대)은 City IV 파괴를 BC 1550년경으로 보고, 늦은 연대(BC 13세기)에는 성벽이 없었다고 봄. 2000년대 탄소 연대 측정도 BC 16세기 쪽을 지지.", sources: [W("Jericho"), W("Tell es-Sultan")] }
  ],
  "abram-born": [
    { label: "이른 연대 계산", when: "BC 2166년", start: -2166, current: true, note: "이른 출애굽 연대(BC 1446)에 이집트 체류 430년(출 12:40)과 족장들의 나이를 더해 계산 (마소라 본문 기준).", sources: [W("Abraham")] },
    { label: "짧은 체류 계산", when: "BC 1950년경", start: -1950, note: "430년에 가나안 체류 기간이 포함된다고 보는 70인역·갈 3:17 해석을 따르면 약 215년 늦어짐.", sources: [W("Abraham"), W("Septuagint")] },
    { label: "학계 일반", when: "연대 특정 안 함", note: "족장 이야기의 배경을 BC 2000년기 전반으로 보거나, 역사적 연대를 특정할 수 없다고 보는 견해가 많음.", sources: [W("Abraham")] }
  ],
  "jesus-born": [
    { label: "다수 견해", when: "BC 6–4년", start: -5, current: true, note: "헤롯 대왕이 BC 4년에 죽었다는 요세푸스 기록(월식 기준)을 따르면 탄생은 그 이전.", sources: [W("Chronology of Jesus"), W("Herod the Great")] },
    { label: "소수 견해", when: "BC 3–2년", start: -2.5, note: "헤롯의 사망을 BC 1년 월식으로 보는 견해(필머 등)를 따르면 탄생도 늦어짐. 초대 교부들의 연대와도 가까움.", sources: [W("Chronology of Jesus")] }
  ],
  cross: [
    { label: "AD 30년", when: "AD 30년 4월 7일", start: 30.25, current: true, note: "디베료 15년(눅 3:1)을 AD 28–29년으로 보고 공생애를 약 2–3년으로 계산.", sources: [W("Chronology of Jesus")] },
    { label: "AD 33년", when: "AD 33년 4월 3일", start: 33.25, note: "공생애를 3년 이상(요한복음의 유월절 세 번)으로 보고 디베료 15년을 AD 29년으로 계산. 이날 예루살렘에서 부분 월식이 있었다는 계산(행 2:20과 연결)도 있음.", sources: [W("Chronology of Jesus"), W("Crucifixion eclipse")] }
  ],
  "jerusalem-fall": [
    { label: "BC 586년", when: "BC 586년", start: -586, current: true, note: "시드기야 11년을 가을 기준 왕년으로 계산하는 견해 (틸레 등).", sources: [W("Siege of Jerusalem (587 BC)")] },
    { label: "BC 587년", when: "BC 587년", start: -587, note: "바벨론 연대기와 봄 기준 왕년 계산을 따르면 한 해 이르게 됨. 학계에서 두 연대가 모두 쓰임.", sources: [W("Siege of Jerusalem (587 BC)")] }
  ],
  "w-daniel": [
    { label: "전통적 견해", when: "BC 6세기", start: -605, end: -530, current: true, note: "포로로 잡혀간 다니엘 자신이 기록. 예언이 실제로 앞서 주어졌다고 봄.", sources: [W("Book of Daniel")] },
    { label: "비평 학계 다수", when: "BC 167–164년", start: -167, end: -164, note: "11장의 안티오코스 4세에 대한 묘사가 매우 자세하고 그의 죽음 부분부터 맞지 않는다는 점 등을 들어 마카비 시대에 완성됐다고 봄.", sources: [W("Book of Daniel"), W("Dating the Bible")] }
  ]
};
