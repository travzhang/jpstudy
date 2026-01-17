// Service Worker for PWA
const CACHE_NAME = 'jpstudy-v2'; // 更新版本号以清除旧缓存
const urlsToCache = [
  '/',
  '/words',
  '/grammar',
  '/my',
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  // 强制激活新的 Service Worker
  self.skipWaiting();
});

// 激活 Service Worker
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
  // 立即控制所有客户端
  return self.clients.claim();
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 不缓存 API 请求，直接返回网络请求
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // 网络失败时返回错误响应
        return new Response(
          JSON.stringify({ error: 'Network request failed' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }
  
  // 对于静态资源，使用缓存优先策略
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果缓存中有，返回缓存
      if (response) {
        return response;
      }
      // 否则从网络获取
      return fetch(event.request).then((response) => {
        // 检查响应是否有效
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // 只缓存 GET 请求的静态资源
        if (event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});
