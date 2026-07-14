// ============================================================
// 플래시카드로 학습하는 초등영어 800+ — 학습 이력 저장소
// progress.js
// 플래시카드/워드크로스/워드파인더에서 단어 발음이 재생될 때마다
// logStudy(word)를 호출해서 오늘 날짜에 기록합니다.
// ============================================================

const STUDY_LOG_KEY = 'wb800_studyLog_v1';

function getTodayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getStudyLog() {
    try {
        return JSON.parse(localStorage.getItem(STUDY_LOG_KEY) || '{}');
    } catch (e) {
        return {};
    }
}

function saveStudyLog(log) {
    try {
        localStorage.setItem(STUDY_LOG_KEY, JSON.stringify(log));
    } catch (e) {
        console.warn('학습 기록 저장 실패:', e);
    }
}

// 단어 하나를 "오늘 학습함"으로 기록 (같은 날 중복 단어는 한 번만 카운트)
function logStudy(word) {
    if (!word) return;
    const log = getStudyLog();
    const key = getTodayKey();
    if (!log[key]) log[key] = [];
    if (!log[key].includes(word)) {
        log[key].push(word);
        saveStudyLog(log);
    }
}

function clearStudyLog() {
    localStorage.removeItem(STUDY_LOG_KEY);
}
