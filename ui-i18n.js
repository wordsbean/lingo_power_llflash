// ============================================================
// 플래시카드로 학습하는 초등영어 800+ — UI 현지화(i18n)
// ui-i18n.js
//
// ⚠️ 이건 "학습 콘텐츠 언어"(9개, lang-pref.js)와는 완전히 별개입니다.
// 여기는 순수하게 버튼/헤더 같은 "화면 UI 문구"를 한국어/영어로만
// 바꾸는 겁니다 (SRT 플레이어 때와 동일한 방식) — 스페인어를 배우든
// 중국어를 배우든, 화면 자체는 항상 한국어 또는 영어로 고정됩니다.
//
// 사용법: HTML에 data-i18n="key" 넣어두면 applyI18n()이 자동으로
// 채워줍니다. JS에서 동적으로 만드는 문구는 t('key')를 직접 씁니다.
// ============================================================

const UI_LANG_KEY = 'wb800_uiLang_v1';

const UI_DICT = {
    ko: {
        appTitle: '플래시카드로 학습하는 초등영어 800+',
        navFlashcard: '플래시카드',
        navWordcross: '워드크로스',
        navWordfinder: '워드파인더',
        navVowelscramble: '모음 채우기',
        navSentencescramble: '문장 스크램블',
        navFillblank: '빈칸 채우기',
        navProgress: '학습 이력',
        sectionTools: '학습 도구',
        sectionMyLearning: '나의 학습',
        settingsLangTitle: '설정 · 학습 언어',
        settingsUiLangTitle: '설정 · 화면 언어',
        learnLang: '배울 언어',
        meaningLang: '뜻을 볼 언어',
        apply: '적용',
        settingsAudioTitle: '설정 · "전체듣기" 재생 범위',
        audioWordOnly: '영·한 단어만',
        audioAll: '단어+문장 전체',
        audioSentenceOnly: '영·한 문장만',
        audioEnglishOnly: '오로지 영어만',

        newPuzzle: '새 퍼즐 만들기',
        generating: '생성 중...',
        showAnswer: '정답 보기',
        showProblem: '문제 보기',
        print: '인쇄',
        answerSummary: '정답 요약',
        colWord: '단어',
        colMeaning: '의미',
        colSentence: '예문',
        colMeaningSentence: '뜻풀이 문장',
        prevPage: '이전 페이지',
        nextPage: '다음 페이지',
        showIpa: '발음기호 표시',
        hideIpa: '발음기호 숨기기',
        autoAdvanceOn: '자동 넘김',
        randomOrder: '랜덤 순서',
        manualCapture: '수동 캡처',
        autoCaptureStart: '자동 캡처 시작',
        autoCaptureStop: '자동 캡처 정지',

        progressAccumWords: '누적 학습 단어',
        progressDaysLearned: '학습한 날',
        progressTodayLearned: '오늘 학습',
        progressCompleted: '완료',
        progressNoRecord: '이 날 학습 기록이 없습니다.',
        progressShare: '앱 공유하기',
        progressEmail: '개발자에게 메일 보내기',
        progressReset: '학습 이력 초기화',
        printPdf: '인쇄 / PDF 출력',
        progressLegend: '학습한 날 (숫자 = 단어 수)',
        confirmResetHistory: '학습 이력(달력 기록)을 초기화할까요? 이 작업은 되돌릴 수 없습니다.',
        resetCompleted: '완료 목록 초기화',
        confirmResetCompleted: '완료 표시한 단어를 전부 초기화할까요? 모든 단어가 다시 학습 대상으로 돌아갑니다.',
        resetHistoryDone: '학습 이력이 초기화되었습니다.',

        stopAudioAria: '소리 정지',
        menuOpenAria: '메뉴 열기',
        comingSoon: '준비중',
    },
    en: {
        appTitle: 'Elementary English 800+ Flashcards',
        navFlashcard: 'Flashcards',
        navWordcross: 'Word Cross',
        navWordfinder: 'Word Finder',
        navVowelscramble: 'Vowel Fill',
        navSentencescramble: 'Sentence Scramble',
        navFillblank: 'Fill in the Blank',
        navProgress: 'Progress',
        sectionTools: 'Study Tools',
        sectionMyLearning: 'My Learning',
        settingsLangTitle: 'Settings · Study Language',
        settingsUiLangTitle: 'Settings · Display Language',
        learnLang: 'Learning',
        meaningLang: 'Meaning in',
        apply: 'Apply',
        settingsAudioTitle: 'Settings · "Play All" Range',
        audioWordOnly: 'Word only',
        audioAll: 'Word + sentence',
        audioSentenceOnly: 'Sentence only',
        audioEnglishOnly: 'English only',

        newPuzzle: 'New Puzzle',
        generating: 'Generating...',
        showAnswer: 'Show Answer',
        showProblem: 'Show Problem',
        print: 'Print',
        answerSummary: 'Answer Summary',
        colWord: 'Word',
        colMeaning: 'Meaning',
        colSentence: 'Sentence',
        colMeaningSentence: 'Meaning Sentence',
        prevPage: 'Previous',
        nextPage: 'Next',
        showIpa: 'Show Phonetics',
        hideIpa: 'Hide Phonetics',
        autoAdvanceOn: 'Auto Advance',
        randomOrder: 'Random Order',
        manualCapture: 'Manual Capture',
        autoCaptureStart: 'Start Auto Capture',
        autoCaptureStop: 'Stop Auto Capture',

        progressAccumWords: 'Words Learned',
        progressDaysLearned: 'Days Studied',
        progressTodayLearned: 'Today',
        progressCompleted: 'Completed',
        progressNoRecord: 'No study record for this day.',
        progressShare: 'Share App',
        progressEmail: 'Email the Developer',
        progressReset: 'Reset History',
        printPdf: 'Print / Export PDF',
        progressLegend: 'Days studied (number = words learned)',
        confirmResetHistory: 'Reset your study history (calendar records)? This cannot be undone.',
        resetCompleted: 'Reset Completed List',
        confirmResetCompleted: 'Reset all completed words? Every word will return to your active study pool.',
        resetHistoryDone: 'Study history has been reset.',

        stopAudioAria: 'Stop audio',
        menuOpenAria: 'Open menu',
        comingSoon: 'Soon',
    },
};

function getUILang() {
    const v = localStorage.getItem(UI_LANG_KEY);
    return (v === 'en') ? 'en' : 'ko'; // 기본값: 한국어
}

function setUILang(lang) {
    if (lang !== 'ko' && lang !== 'en') return;
    localStorage.setItem(UI_LANG_KEY, lang);
}

function t(key) {
    const dict = UI_DICT[getUILang()] || UI_DICT.ko;
    return dict[key] || UI_DICT.ko[key] || key;
}

// HTML에 data-i18n="key" / data-i18n-title="key" / data-i18n-placeholder="key"
// 붙여둔 요소들을 현재 UI 언어로 일괄 채워줍니다.
function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.title = t(el.dataset.i18nTitle);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });
}

document.addEventListener('DOMContentLoaded', applyI18n);
