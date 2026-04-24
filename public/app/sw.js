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

// 네트워크 요청 가로채기 (가사 파일 등만 캐싱, 음원은 제외)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 음원 파일(.mp3)은 서비스 워커에서 가로채지 않고 브라우저가 직접 R2에서 스트리밍하도록 내버려둠
  // 대용량 파일은 브라우저 기본 처리가 훨씬 안정적입니다.
  if (url.includes('.mp3')) {
    return; // 그냥 지나가게 함
  }

  // 가사(.txt) 등의 텍스트 리소스만 캐싱 시도
  if (url.includes('.txt')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          // 페치 실패 시에도 에러를 내지 않고 그냥 네트워크 시도(또는 빈 응답)를 하도록 함
          return null;
        });
      })
    );
  }
});
