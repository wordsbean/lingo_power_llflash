// ============================================================
// 플래시카드로 학습하는 초등영어 800+ — 카드 데이터 로더
// cards-loader.js
//
// cardsAllData(11개 언어 통합, data/cards_all.js)와 현재 언어 설정
// (lang-pref.js)을 조합해서, 기존 6개 학습 도구가 그대로 쓰던 형태의
// 전역 cardsData를 만들어줍니다. 이 파일 하나만 새로 로드하면
// index.html/wordcross.html/... 안의 기존 코드는 손댈 필요가 없습니다.
//
// 로드 순서: cards_all.js -> lang-pref.js -> cards-loader.js -> (그 외)
// ============================================================

let cardsData = (typeof cardsAllData !== 'undefined' && typeof pickLangView === 'function')
    ? cardsAllData.map(c => {
        const view = pickLangView(c);
        return {
            id: c.id,
            day: c.day,
            theme: c.theme,
            level: c.level,
            image: c.image,
            word: view.word,                                   // 현재 선택된 "배울 언어"의 단어
            meaning: view.meaning,                              // 현재 선택된 "뜻을 볼 언어"의 단어
            engExample: view.sentence,                          // 배울 언어의 예문
            korExample: view.meaningSentence,                   // 뜻 언어의 예문
            pronunciation: view.pronunciation,                  // 병음/로마지 (해당 언어만)
            sentencePronunciation: view.sentencePronunciation,
            showPronun: view.showPronun,
            audioKey: (c.langs.en && c.langs.en.word) || view.word, // mp3 파일명은 항상 영어 단어 기준(언어 바뀌어도 고정)
        };
    })
    : (typeof cardsAllData === 'undefined' ? [] : []);

// "학습 완료"로 표시한 단어 목록 (progress.html에서 저장).
// 카드 고유 id 기준으로 저장 — audioKey(언어별 단어 텍스트)는 langs.en이 없는 카드에서
// 화면 언어에 따라 값이 바뀌어버려 완료 목록이 오염되는 문제가 있었음(v1).
// id는 언어 설정과 무관하게 항상 고정이라 이 문제가 생기지 않음.
const COMPLETED_WORDS_KEY = 'wb800_completedWords_v2';

function getCompletedIds() {
    try {
        return new Set(JSON.parse(localStorage.getItem(COMPLETED_WORDS_KEY) || '[]'));
    } catch (e) {
        return new Set();
    }
}

// "학습 완료" 표시 저장 (카드 id 기준, 어느 페이지에서 호출해도 동일하게 반영됨).
// 이 함수 하나만 공용으로 두고, 각 페이지는 이걸 부른 다음 자기 화면만 새로고침하면 됩니다.
// (페이지마다 이 로직을 따로 선언하면 중복선언 문법오류가 날 수 있어서 여기 한 곳에만 둠)
function markWordCompleted(id) {
    if (id === null || id === undefined || id === '') return;
    const completed = getCompletedIds();
    completed.add(String(id));
    localStorage.setItem(COMPLETED_WORDS_KEY, JSON.stringify([...completed]));
}

// "학습 완료" 취소(복구) — progress.html의 완료 목록 화면에서 사용
function unmarkWordCompleted(id) {
    if (id === null || id === undefined || id === '') return;
    const completed = getCompletedIds();
    completed.delete(String(id));
    localStorage.setItem(COMPLETED_WORDS_KEY, JSON.stringify([...completed]));
}

// 학습 도구(플래시카드/워드크로스/...)는 cardsData 대신 이걸 써서 문제를 냅니다.
// cardsData 자체는 항상 "전체"로 유지되어야 progress.html의 완료율(분모) 계산이 정확합니다.
function getActiveCardsData() {
    const completed = getCompletedIds();
    if (completed.size === 0) return cardsData;
    return cardsData.filter(c => !completed.has(String(c.id)));
}
