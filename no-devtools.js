// Lingo Power: Hangul Learning for TOPIK — 우클릭/개발자도구 단축키 차단
// no-devtools.js
//
// ⚠️ 완벽한 차단이 아닙니다 — 브라우저 메뉴(⋮ → 도구 더보기 → 개발자 도구)나
// Ctrl+U(소스보기)는 이 방식으로 못 막습니다. 그냥 가벼운 "캐주얼 저지선" 정도로
// 이해하고 쓰세요. 진짜 데이터 보호가 필요하면 서버+인증 구조로 가야 합니다.

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
        e.preventDefault();
        return;
    }
    // Ctrl+Shift+I / Ctrl+Shift+J (개발자도구), Ctrl+Shift+C (요소 검사)
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
        e.preventDefault();
        return;
    }
    // Ctrl+U (소스 보기)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return;
    }
});
