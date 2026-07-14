// ============================================================
// 플래시카드로 학습하는 초등영어 800+ — 공용 오디오 설정
// audio-pref.js
// "전체듣기"류 버튼이 재생할 범위를 전역으로 관리합니다.
// 개별 단어의 🔊(단어만) / 🔊+(단어+뜻) 버튼은 이 설정과 무관하게
// 항상 고정 동작합니다 (즉석 선택용이라 그대로 둠).
// ============================================================

const AUDIO_PREF_KEY = 'wb800_audioPref_v1';

// word      : 영어단어 + 한글의미        → ee, kk
// all       : 영어단어 + 한글의미 + 영어문장 + 한글문장 → ee, kk, es, ks
// sentence  : 영어문장 + 한글문장        → es, ks
// english   : 영어단어 + 영어문장 (한글 전부 제외) → ee, es
const AUDIO_PREF_OPTIONS = {
    word: { label: '영·한 단어만', suffixes: ['ee', 'kk'] },
    all: { label: '단어+문장 전체', suffixes: ['ee', 'kk', 'es', 'ks'] },
    sentence: { label: '영·한 문장만', suffixes: ['es', 'ks'] },
    english: { label: '오로지 영어만', suffixes: ['ee', 'es'] },
};

function getAudioPref() {
    const v = localStorage.getItem(AUDIO_PREF_KEY);
    return AUDIO_PREF_OPTIONS[v] ? v : 'word'; // 기본값: 영한단어만
}

function setAudioPref(value) {
    if (!AUDIO_PREF_OPTIONS[value]) return;
    localStorage.setItem(AUDIO_PREF_KEY, value);
}

function getAudioPrefSuffixes() {
    return AUDIO_PREF_OPTIONS[getAudioPref()].suffixes;
}
