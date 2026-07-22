// Lingo Power: Learn Languages with FlashCards and Puzzles
// service-worker.js
//
// TOPIK Made Easy 프로젝트에서 쓴 것과 같은 방침입니다: 파일 목록을 통째로
// 하드코딩해서 미리 캐싱하지 않고, 실제로 요청되는 것들을 그때그때 캐싱하는
// 런타임 캐싱 전략을 씁니다. 업데이트할 때는 CACHE_VERSION 숫자만 올리면 됩니다.

const CACHE_VERSION = 'v1';
const SHELL_CACHE = `llflash-shell-${CACHE_VERSION}`;
const DATA_CACHE = `llflash-data-${CACHE_VERSION}`;
const AUDIO_CACHE = `llflash-audio-${CACHE_VERSION}`;
const RUNTIME_CACHE = `llflash-runtime-${CACHE_VERSION}`;
const ALL_CACHES = [SHELL_CACHE, DATA_CACHE, AUDIO_CACHE, RUNTIME_CACHE];

const OFFLINE_FALLBACK_URL = './index.html';

// 설치 시점에 딱 이 정도만 미리 캐싱 (앱의 "뼈대") — 나머지는 방문하면서 채워짐
const PRECACHE_URLS = [
    './index.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .catch((err) => console.warn('[SW] precache 일부 실패(무시하고 진행):', err))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => !ALL_CACHES.includes(key)).map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

function isDataRequest(url) {
    return url.pathname.includes('/data/');
}
function isAudioRequest(url) {
    return url.pathname.includes('/audio/');
}
function isSameOriginAsset(url) {
    return url.origin === self.location.origin;
}

// Cache First + 백그라운드 갱신: 캐시에서 즉시 응답, 뒤에서 최신본으로 캐시 갱신
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const networkFetch = fetch(request)
        .then((response) => {
            if (response && response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(() => null);
    return cached || (await networkFetch) || Response.error();
}

// Cache First: 캐시에 있으면 그것만 쓰고, 없을 때만 네트워크 (오디오/아이콘처럼 안 바뀌는 것용)
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response && response.ok) cache.put(request, response.clone());
        return response;
    } catch (err) {
        return cached || Response.error();
    }
}

// Network First: 온라인이면 항상 최신 페이지, 실패하면 캐시 → 그것도 없으면 index.html
async function networkFirstForNavigation(request) {
    const cache = await caches.open(SHELL_CACHE);
    try {
        const response = await fetch(request);
        if (response && response.ok) cache.put(request, response.clone());
        return response;
    } catch (err) {
        const cached = await cache.match(request);
        return cached || (await cache.match(OFFLINE_FALLBACK_URL)) || Response.error();
    }
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    if (request.mode === 'navigate') {
        event.respondWith(networkFirstForNavigation(request));
        return;
    }

    if (!isSameOriginAsset(url)) {
        event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
        return;
    }

    if (isDataRequest(url)) {
        event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
        return;
    }

    if (isAudioRequest(url)) {
        event.respondWith(cacheFirst(request, AUDIO_CACHE));
        return;
    }

    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
});
