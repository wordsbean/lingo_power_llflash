// ============================================================
// 플래시카드로 학습하는 초등영어 800+ — 언어 선택 전역 설정
// lang-pref.js
// "무엇을 보여줄지(tgt_lang)" / "그 뜻을 무슨 언어로 볼지(src_lang)"를
// 전역으로 관리합니다. 예: tgt=es, src=ko → 스페인어 단어를 보여주고
// 뜻/설명은 한국어로. tgt=es, src=en → 스페인어 단어를 영어 뜻으로.
// ============================================================

const LANG_NAMES_KO = {
    en: '🇺🇸 영어', ko: '🇰🇷 한국어', ja: '🇯🇵 일본어', zh: '🇨🇳 중국어',
    es: '🇪🇸 스페인어', de: '🇩🇪 독일어', fr: '🇫🇷 프랑스어', it: '🇮🇹 이탈리아어',
    pt: '🇵🇹 포르투갈어', vi: '🇻🇳 베트남어', tr: '🇹🇷 튀르키예어',
};

const LANG_NAMES_EN = {
    en: '🇺🇸 English', ko: '🇰🇷 Korean', ja: '🇯🇵 Japanese', zh: '🇨🇳 Chinese',
    es: '🇪🇸 Spanish', de: '🇩🇪 German', fr: '🇫🇷 French', it: '🇮🇹 Italian',
    pt: '🇵🇹 Portuguese', vi: '🇻🇳 Vietnamese', tr: '🇹🇷 Turkish',
};

// 화면(UI) 언어에 맞는 언어 이름 목록을 매번 즉시 반환 (getUILang은 ui-i18n.js 제공)
function getLangNames() {
    const uiLang = (typeof getUILang === 'function') ? getUILang() : 'ko';
    return uiLang === 'en' ? LANG_NAMES_EN : LANG_NAMES_KO;
}

// 기존 코드 호환용: LANG_NAMES를 계속 쓰는 곳이 있으면 현재 화면언어 기준으로 즉시 계산된 값을 씀
const LANG_NAMES = new Proxy({}, {
    get(_, prop) { return getLangNames()[prop]; },
    ownKeys() { return Reflect.ownKeys(getLangNames()); },
    getOwnPropertyDescriptor(_, prop) {
        return { enumerable: true, configurable: true, value: getLangNames()[prop] };
    },
});

const PRONUN_LANGS = ['zh', 'ja']; // 병음/로마지가 있는 언어

const LANG_PREF_KEY = 'wb800_langPref_v1';

function getLangPref() {
    try {
        const saved = JSON.parse(localStorage.getItem(LANG_PREF_KEY) || 'null');
        if (saved && saved.tgt && saved.src && LANG_NAMES[saved.tgt] && LANG_NAMES[saved.src]) {
            return saved;
        }
    } catch (e) { /* ignore */ }
    return { tgt: 'es', src: 'ko' }; // 기본값: 스페인어 배우기(뜻은 한국어로)
}

function setLangPref(tgt, src) {
    if (!LANG_NAMES[tgt] || !LANG_NAMES[src]) return;
    localStorage.setItem(LANG_PREF_KEY, JSON.stringify({ tgt, src }));
}

// 카드 하나(cardsAllData의 원소)에서 현재 선택된 언어쌍 기준으로
// 화면에 쓸 필드를 뽑아줍니다.
function pickLangView(card) {
    const { tgt, src } = getLangPref();
    const tgtData = card.langs[tgt] || {};
    const srcData = card.langs[src] || {};
    return {
        word: tgtData.word || '',
        sentence: tgtData.sentence || '',
        pronunciation: tgtData.pronunciation || '',
        sentencePronunciation: tgtData.sentencePronunciation || '',
        meaning: srcData.word || '',
        meaningSentence: srcData.sentence || '',
        tgtLang: tgt,
        srcLang: src,
        showPronun: PRONUN_LANGS.includes(tgt),
    };
}
