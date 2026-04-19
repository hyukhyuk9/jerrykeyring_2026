const CACHE_NAME = 'jerry-media-cache-v1';

// 설치 시 즉시 활성화
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 활성화 시 이전 캐시 청소 (캐시 버전업을 위함)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 네트워크 요청 가로채기 (음원 및 가사 파일 대상)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // .mp3 파일이나 .txt(가사) 파일 요청이 들어올 경우 가로챔
  if (url.includes('.mp3') || url.includes('.txt') || url.includes('music/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // 1. 이미 핸드폰에 캐시(저장)된 파일이 있으면 넷틀리파이에 요청 안 하고 즉시 꺼내줌 (트래픽 0, 딜레이 0!)
        if (cachedResponse) {
          console.log('[Cache] 오프라인 캐시에서 미디어 재생:', url);
          return cachedResponse;
        }

        // 2. 만약 처음 듣는 곡이라면, 평소처럼 넷틀리파이에 요청하여 가져오면서 동시에 몰래 캐시에 복사해둠!
        return fetch(event.request).then((networkResponse) => {
          // 응답이 정상이면 복사해서 캐시에 넣기 (스트리밍 방해 안 됨)
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
              console.log('[Cache] 미디어 영구 저장 완료:', url);
            });
          }
          return networkResponse;
        }).catch((err) => {
          console.log('[Cache] 오프라인 & 캐시 없음 상태:', err);
        });
      })
    );
  }
});
