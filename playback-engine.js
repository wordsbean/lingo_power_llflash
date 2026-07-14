// ============================================================
// 플래시카드로 학습하는 초등영어 800+ — 공용 재생 엔진
// playback-engine.js
//
// 규칙: mp3 파일을 먼저 시도하고, 로드 실패(404 등)하면 그 카드의
// 대상 언어(target language)로 브라우저 내장 TTS를 사용합니다.
// 영어/한글은 실제 mp3가 있으니 그대로 재생되고, 나머지 9개 언어는
// mp3 자체가 없으므로 항상 TTS로 넘어갑니다 — 코드 분기 없이 하나의
// 로직으로 전부 처리됩니다.
//
// ⚠️ 언어별로 배포할 때 CURRENT_LANG 이 한 줄만 그 언어 코드로
//    바꿔주세요 (영어 앱이면 'en', 스페인어 앱이면 'es' 등).
// ============================================================

// 오디오 파일(images는 xlsx_to_cards_all.py에서 이미 CDN URL로 baked-in됨)은
// 별도 저장소(flashcard-assets, 1.5GB)에 있어서 jsDelivr CDN으로 서빙합니다.
// 저장소를 옮기거나 브랜치를 바꾸면 이 한 줄만 고치면 됩니다.
const AUDIO_BASE_URL = 'https://cdn.jsdelivr.net/gh/wordsbean/flashcard-assets@main/audios/';

// lang-pref.js가 로드되어 있으면(통합 다국어 앱) 사용자가 고른 "배울 언어"를
// 실시간으로 읽어옵니다. lang-pref.js가 없는 예전 단일언어 배포본이면 'en' 고정.
function getCurrentTargetLang() {
    if (typeof getLangPref === 'function') {
        return getLangPref().tgt;
    }
    return 'en';
}

// "뜻을 볼 언어"를 실시간으로 읽어옵니다. lang-pref.js가 없으면 'ko' 고정(예전 배포본 호환).
function getCurrentSrcLang() {
    if (typeof getLangPref === 'function') {
        return getLangPref().src;
    }
    return 'ko';
}

// SUFFIX_MAP의 lang 값('tgt'/'src'/고정 언어코드)을 실제 언어코드로 변환
function resolveLangType(langType) {
    if (langType === 'tgt') return getCurrentTargetLang();
    if (langType === 'src') return getCurrentSrcLang();
    return langType;
}

// 언어코드 -> 브라우저 TTS용 BCP-47 태그
const TTS_LANG_MAP = {
    en: 'en-US',
    ko: 'ko-KR',
    ja: 'ja-JP',
    zh: 'zh-CN',
    es: 'es-ES',
    de: 'de-DE',
    fr: 'fr-FR',
    it: 'it-IT',
    pt: 'pt-BR',
    vi: 'vi-VN',
    tr: 'tr-TR',
};

// 재생 접미사별로 "이 카드의 어느 필드를 말해야 하는지 / 어느 언어로 읽어야 하는지"
// ee/ww: 단어(배울 언어=tgt)   es/ws: 예문(배울 언어=tgt)
// kk: 뜻 단어(뜻을 볼 언어=src)   ks: 뜻 예문(뜻을 볼 언어=src)
// lang: 'tgt'/'src'면 현재 선택된 언어를 실시간으로 사용
const SUFFIX_MAP = {
    ee: { field: 'word', lang: 'tgt' },
    ww: { field: 'word', lang: 'tgt' },
    es: { field: 'engExample', lang: 'tgt' },
    ws: { field: 'engExample', lang: 'tgt' },
    kk: { field: 'meaning', lang: 'src' },
    ks: { field: 'korExample', lang: 'src' },
};

// 실제 mp3로 "녹음되어 있는" 언어 (ee/es 계열은 영어로, kk/ks 계열은 한국어로 녹음됨).
// 지금 재생하려는 언어가 이거랑 다르면 мp3를 시도할 필요도 없이 바로 TTS로 갑니다
// (파일이 있어도 엉뚱한 언어 음성이라 재생하면 안 되기 때문).
const RECORDED_LANG = { ee: 'en', ww: 'en', es: 'en', ws: 'en', kk: 'ko', ks: 'ko' };

const ttsPlayer = new Audio();
let playToken = 0;

// 전역 정지 버튼(nav.js)이 이 훅을 호출해서 현재 재생 중인 오디오/TTS를 즉시 멈춤
window.__stopAudio = function () {
    playToken++;
    ttsPlayer.pause();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    document.querySelectorAll('.speak-btn.is-playing').forEach(btn => btn.classList.remove('is-playing'));
};

// mp3 재생 시도 -> 실패하면(또는 애초에 녹음된 언어가 아니면) TTS로 폴백
// audioKey: mp3 파일명에 쓸 키 (항상 영어 단어 — 실제 녹음 파일이 전부 영어 기준으로 되어있음)
function playAudioOrTTS(audioKey, suffix, card, myToken, onDone) {
    if (myToken !== playToken) return;

    const info = SUFFIX_MAP[suffix];
    const text = info && card ? card[info.field] : audioKey;
    const resolvedLang = info ? resolveLangType(info.lang) : getCurrentTargetLang();
    const langCode = TTS_LANG_MAP[resolvedLang] || 'en-US';

    let settled = false;
    const finish = () => {
        if (settled) return;
        settled = true;
        onDone();
    };

    const speakTTS = () => {
        if (settled || myToken !== playToken) return;
        if (!text || !window.speechSynthesis) {
            finish();
            return;
        }
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = langCode;
        utter.onend = finish;
        utter.onerror = finish;
        window.speechSynthesis.speak(utter);
    };

    // 지금 읽어야 할 언어가 실제 녹음된 언어와 다르면(예: kk인데 뜻언어가 일본어),
    // mp3를 시도할 필요조차 없이 바로 TTS로 감 (엉뚱한 언어 음성이 재생되는 것 방지)
    const recordedLang = RECORDED_LANG[suffix];
    if (recordedLang && recordedLang !== resolvedLang) {
        speakTTS();
        return;
    }

    ttsPlayer.onerror = speakTTS;
    ttsPlayer.onended = finish;
    ttsPlayer.src = `${AUDIO_BASE_URL}${audioKey}_${suffix}.mp3`;
    const playPromise = ttsPlayer.play();
    if (playPromise && playPromise.catch) {
        playPromise.catch(speakTTS); // 브라우저 자동재생 정책 등으로 재생 자체가 막힌 경우도 폴백
    }
}

// 인자로 넘어온 게 단어 문자열이든, word만 있는 부분 객체든, 완전한 카드 객체든
// 상관없이 cardsData에서 조회해서 부족한 필드(meaning/engExample/korExample/audioKey 등)를
// 자동으로 채워줍니다. TTS 폴백 시 필요한 텍스트를 항상 확보하기 위함입니다.
function resolveCard(input) {
    if (!input) return null;
    const word = typeof input === 'string' ? input : input.word;
    if (!word) return typeof input === 'object' ? input : null;

    let full = null;
    if (typeof cardsData !== 'undefined' && Array.isArray(cardsData)) {
        // audioKey(영어단어) 기준으로도 찾아보고, word(현재 화면 단어) 기준으로도 찾아봄
        full = cardsData.find(c => c.word === word || c.audioKey === word);
    }

    let resolved;
    if (typeof input === 'string') {
        resolved = full || { word };
    } else {
        // 부분 객체가 넘어온 경우: cardsData 값을 기본으로 하고, 넘어온 객체의 값이 있으면 그걸 우선
        resolved = full ? { ...full, ...input } : input;
    }
    // audioKey가 없으면(단일언어 구버전 배포본 등) word를 그대로 audioKey로 사용
    if (!resolved.audioKey) resolved.audioKey = resolved.word;
    return resolved;
}

// card: cardsData의 카드 객체, word 문자열, 또는 word를 포함한 부분 객체
// suffixes: ['ee','kk'] 처럼 재생할 순서 배열 (또는 ['ww','ws'] 등 언어에 맞는 접미사)
function playSequence(cardOrWord, suffixes, btnEl, onComplete) {
    const card = resolveCard(cardOrWord);
    if (!card || !suffixes || !suffixes.length) return;
    const word = card.word;
    if (!word) return;

    if (typeof logStudy === 'function') logStudy(word);

    const myToken = ++playToken;
    if (btnEl) btnEl.classList.add('is-playing');

    function playNext(i) {
        if (myToken !== playToken) return;
        if (i >= suffixes.length) {
            if (btnEl) btnEl.classList.remove('is-playing');
            if (typeof onComplete === 'function') onComplete();
            return;
        }
        playAudioOrTTS(card.audioKey, suffixes[i], card, myToken, () => playNext(i + 1));
    }
    playNext(0);
}

// cards: card 객체 배열, 순서대로 이어서 재생 (전체듣기 버튼용)
function playAllWords(cards, suffixes, btnEl) {
    let idx = 0;
    if (btnEl) btnEl.classList.add('is-playing');
    function next() {
        if (idx >= cards.length) {
            if (btnEl) btnEl.classList.remove('is-playing');
            return;
        }
        playSequence(cards[idx++], suffixes, null, next);
    }
    next();
}
