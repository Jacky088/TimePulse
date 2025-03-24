const CACHE_VERSION = 'v1';
const CACHE_NAME = `timepulse-${CACHE_VERSION}`;

// 需要缓存的资源
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png'
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 处理fetch请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中找到了请求的资源，则返回
        if (response) {
          return response;
        }
        
        // 否则发起网络请求
        return fetch(event.request)
          .then(response => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应以便我们可以同时将其存入缓存并返回
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});

// 处理消息 - 接收倒计时信息并设置通知
self.addEventListener('message', event => {
  const data = event.data;
  
  if (data.action === 'scheduleNotification') {
    const { title, timestamp, body, id } = data;
    
    // 计算倒计时剩余时间
    const timeUntilNotification = timestamp - Date.now();
    
    if (timeUntilNotification <= 0) {
      // 如果时间已过，立即发送通知
      showNotification(title, body, id);
    } else {
      // 设置定时器，到时间时发送通知
      setTimeout(() => {
        showNotification(title, body, id);
      }, timeUntilNotification);
    }
  }
});

// 显示通知的函数
function showNotification(title, body, id) {
  self.registration.showNotification(title, {
    body: body || '倒计时已结束！',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon.ico',
    tag: id,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: {
      countdownId: id
    }
  });
}

// 处理通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // 点击通知时打开应用并导航到相应倒计时
  const countdownId = event.notification.data.countdownId;
  const urlToOpen = new URL('/', self.location.origin);
  
  if (countdownId) {
    urlToOpen.searchParams.set('id', countdownId);
  }
  
  // 打开应用或将应用置于前台
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(windowClients => {
      // 检查应用是否已经打开
      for (let client of windowClients) {
        if (client.url === urlToOpen.href && 'focus' in client) {
          return client.focus();
        }
      }
      // 如果应用没有打开，则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen.href);
      }
    })
  );
});
