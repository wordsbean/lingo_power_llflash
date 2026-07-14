// ============================================================
// 플래시카드로 학습하는 초등영어 800+ — 공용 내비게이션
// nav.js
// 새 퀴즈 페이지가 추가될 때마다 이 파일의 NAV_ITEMS 배열에만
// 추가하면 index.html / wordcross.html / wordfinder.html 등
// nav.js를 불러오는 모든 페이지에 자동 반영됩니다.
//
// 화면 UI 문구는 ui-i18n.js의 t()를 통해 한국어/영어로 표시됩니다.
// (학습 콘텐츠 언어와는 별개 — SRT 플레이어 때와 동일한 방식)
// ============================================================

const NAV_ITEMS = [
    { sectionKey: 'sectionTools', href: 'index.html', icon: '📇', labelKey: 'navFlashcard' },
    { sectionKey: 'sectionTools', href: 'wordcross.html', icon: '🧩', labelKey: 'navWordcross' },
    { sectionKey: 'sectionTools', href: 'wordfinder.html', icon: '🔍', labelKey: 'navWordfinder' },
    { sectionKey: 'sectionTools', href: 'vowelscramble.html', icon: '🔤', labelKey: 'navVowelscramble' },
    { sectionKey: 'sectionTools', href: 'sentencescramble.html', icon: '🔀', labelKey: 'navSentencescramble' },
    { sectionKey: 'sectionTools', href: 'fillblank.html', icon: '📝', labelKey: 'navFillblank' },
    { sectionKey: 'sectionMyLearning', href: 'progress.html', icon: '📅', labelKey: 'navProgress' },
];

// AUDIO_PREF_OPTIONS(audio-pref.js) 키 -> ui-i18n.js 키 매핑
const AUDIO_PREF_I18N_MAP = {
    word: 'audioWordOnly',
    all: 'audioAll',
    sentence: 'audioSentenceOnly',
    english: 'audioEnglishOnly',
};

function tSafe(key, fallback) {
    return (typeof t === 'function') ? t(key) : fallback;
}

(function initNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    function getUILangSafeAlert() {
        const lang = (typeof getUILang === 'function') ? getUILang() : 'ko';
        return lang === 'en'
            ? 'Learning language and meaning language must be different.'
            : '배울 언어와 뜻을 볼 언어는 서로 달라야 해요.';
    }

    function render() {
        // 기존 nav 요소가 있으면 제거하고 다시 그림 (UI 언어 전환 시 재사용 대비)
        document.querySelectorAll('.hb-btn, .hb-stop-btn, .hb-overlay, .hb-drawer').forEach(el => el.remove());

        const btn = document.createElement('button');
        btn.className = 'hb-btn';
        btn.setAttribute('aria-label', tSafe('menuOpenAria', '메뉴 열기'));
        btn.innerHTML = '<i class="fa-solid fa-bars"></i>';

        const stopBtn = document.createElement('button');
        stopBtn.className = 'hb-stop-btn';
        stopBtn.setAttribute('aria-label', tSafe('stopAudioAria', '소리 정지'));
        stopBtn.title = tSafe('stopAudioAria', '재생 중인 소리 정지');
        stopBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
        stopBtn.addEventListener('click', () => {
            if (typeof window.__stopAudio === 'function') window.__stopAudio();
        });

        const overlay = document.createElement('div');
        overlay.className = 'hb-overlay';

        const drawer = document.createElement('nav');
        drawer.className = 'hb-drawer';

        let html = `
            <div class="hb-drawer-header">
                <div class="hb-drawer-title">${tSafe('appTitle', '플래시카드로 학습하는 초등영어 800+')}</div>
                <div class="hb-drawer-sub">wordsbean</div>
            </div>
        `;

        let lastSection = null;
        NAV_ITEMS.forEach(item => {
            const sectionLabel = tSafe(item.sectionKey, item.sectionKey);
            if (item.sectionKey !== lastSection) {
                html += `<div class="hb-section-label">${sectionLabel}</div>`;
                lastSection = item.sectionKey;
            }
            const label = tSafe(item.labelKey, item.labelKey);
            if (item.href) {
                const isActive = item.href === currentPage;
                html += `
                    <a class="hb-link${isActive ? ' is-active' : ''}" href="${item.href}">
                        <span class="hb-icon">${item.icon}</span>
                        <span>${label}</span>
                    </a>
                `;
            } else {
                html += `
                    <span class="hb-link is-soon">
                        <span class="hb-icon">${item.icon}</span>
                        <span>${label}</span>
                        <span class="hb-badge-soon">${tSafe('comingSoon', '준비중')}</span>
                    </span>
                `;
            }
        });

        drawer.innerHTML = html;

        document.body.appendChild(btn);
        document.body.appendChild(stopBtn);
        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        // 화면(UI) 언어 토글 — ui-i18n.js 로드된 페이지에서만 노출
        if (typeof getUILang === 'function' && typeof setUILang === 'function') {
            const uiLangWrap = document.createElement('div');
            const currentUiLang = getUILang();
            uiLangWrap.innerHTML = `
                <div class="hb-section-label">${tSafe('settingsUiLangTitle', '설정 · 화면 언어')}</div>
                <div class="hb-audio-pref">
                    <label class="hb-audio-pref-item">
                        <input type="radio" name="hbUiLang" value="ko">
                        <span>한국어</span>
                    </label>
                    <label class="hb-audio-pref-item">
                        <input type="radio" name="hbUiLang" value="en">
                        <span>English</span>
                    </label>
                </div>
            `;
            drawer.appendChild(uiLangWrap);
            uiLangWrap.querySelectorAll('input[name="hbUiLang"]').forEach(input => {
                input.checked = input.value === currentUiLang;
                input.addEventListener('change', () => {
                    setUILang(input.value);
                    location.reload(); // 화면 문구 전체를 다시 그리기 위해 새로고침
                });
            });
        }

        // 학습 언어 선택 (lang-pref.js 로드된 페이지에서만 노출 - 통합 다국어 앱용)
        if (typeof LANG_NAMES !== 'undefined' && typeof getLangPref === 'function') {
            const langWrap = document.createElement('div');
            const currentLang = getLangPref();
            const optionsHtml = Object.entries(LANG_NAMES)
                .map(([code, label]) => `<option value="${code}">${label}</option>`)
                .join('');
            langWrap.innerHTML = `
                <div class="hb-section-label">${tSafe('settingsLangTitle', '설정 · 학습 언어')}</div>
                <div class="hb-lang-pref">
                    <label class="hb-lang-pref-row">
                        <span>${tSafe('learnLang', '배울 언어')}</span>
                        <select id="hbTgtLang">${optionsHtml}</select>
                    </label>
                    <label class="hb-lang-pref-row">
                        <span>${tSafe('meaningLang', '뜻을 볼 언어')}</span>
                        <select id="hbSrcLang">${optionsHtml}</select>
                    </label>
                    <button type="button" class="hb-lang-apply-btn" id="hbLangApplyBtn">${tSafe('apply', '적용')}</button>
                </div>
            `;
            drawer.appendChild(langWrap);

            const tgtSelect = langWrap.querySelector('#hbTgtLang');
            const srcSelect = langWrap.querySelector('#hbSrcLang');
            const applyBtn = langWrap.querySelector('#hbLangApplyBtn');
            tgtSelect.value = currentLang.tgt;
            srcSelect.value = currentLang.src;

            applyBtn.addEventListener('click', () => {
                if (tgtSelect.value === srcSelect.value) {
                    alert(getUILangSafeAlert());
                    return;
                }
                setLangPref(tgtSelect.value, srcSelect.value);
                location.reload();
            });
        }

        // 오디오 재생 범위 전역 설정 (audio-pref.js 로드된 페이지에서만 노출)
        if (typeof AUDIO_PREF_OPTIONS !== 'undefined' && typeof getAudioPref === 'function') {
            const settingsWrap = document.createElement('div');
            settingsWrap.innerHTML = `
                <div class="hb-section-label">${tSafe('settingsAudioTitle', '설정 · "전체듣기" 재생 범위')}</div>
                <div class="hb-audio-pref">
                    ${Object.entries(AUDIO_PREF_OPTIONS).map(([key, opt]) => `
                        <label class="hb-audio-pref-item">
                            <input type="radio" name="hbAudioPref" value="${key}">
                            <span>${tSafe(AUDIO_PREF_I18N_MAP[key], opt.label)}</span>
                        </label>
                    `).join('')}
                </div>
            `;
            drawer.appendChild(settingsWrap);

            const currentPref = getAudioPref();
            drawer.querySelectorAll('input[name="hbAudioPref"]').forEach(input => {
                input.checked = input.value === currentPref;
                input.addEventListener('change', () => setAudioPref(input.value));
            });
        }

        function openDrawer() {
            drawer.classList.add('is-open');
            overlay.classList.add('is-open');
        }
        function closeDrawer() {
            drawer.classList.remove('is-open');
            overlay.classList.remove('is-open');
        }

        btn.addEventListener('click', openDrawer);
        overlay.addEventListener('click', closeDrawer);
    }

    render();
})();
