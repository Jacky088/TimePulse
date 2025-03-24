const CACHE_VERSION = 'v1';
const CACHE_NAME = `timepulse-${CACHE_VERSION}`;

// 修改缓存资源列表，只包含确定存在的文件
const urlsToCache = [
  '/',
  '/favicon.ico',
  '/site.webmanifest'
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        
        // 使用Promise.allSettled代替cache.addAll，这样即使某些资源请求失败，也不会导致整个缓存过程失败
        return Promise.allSettled(
          urlsToCache.map(url => 
            fetch(url)
              .then(response => {
                if (!response || !response.ok) {
                  console.log(`无法缓存资源: ${url}`);
                  return;
                }
                return cache.put(url, response);
              })
              .catch(err => console.log(`缓存资源失败: ${url}, 错误: ${err}`))
          )
        );
      })
  );
  
  // 立即激活新版本的Service Worker
  self.skipWaiting();
});

// 激活Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 立即接管页面，不等待刷新
      clients.claim()
    ])
  );
});

// 处理fetch请求
self.addEventListener('fetch', event => {
  // 添加错误处理以防网络请求失败
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中找到了请求的资源，则返回
        if (response) {
          return response;
        }
        
        // 尝试从网络获取资源
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
              })
              .catch(err => console.log(`缓存请求失败: ${event.request.url}, 错误: ${err}`));
              
            return response;
          })
          .catch(error => {
            console.log('Fetch失败:', error);
            
            // 检查是否为API请求
            const url = new URL(event.request.url);
            if (url.pathname.includes('/api/')) {
              // 如果是API请求，返回离线状态的JSON响应
              return new Response(
                JSON.stringify({ 
                  offline: true, 
                  message: '您当前处于离线模式，此操作需要网络连接'
                }),
                { 
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
            
            // 如果是HTML请求，尝试返回缓存中的离线页面或默认响应
            return caches.match('/offline.html')
              .then(offlineResponse => {
                return offlineResponse || new Response(
                  '网络错误，您当前处于离线模式',
                  { 
                    status: 503, 
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/html' }
                  }
                );
              });
          });
      })
      .catch(error => {
        console.log('缓存匹配失败:', error);
        return new Response('网络错误，无法加载资源', { 
          status: 503, 
          statusText: 'Service Unavailable' 
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
  } else if (data.action === 'updateCache') {
    // 处理缓存更新请求
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('正在更新缓存...');
          
          // 重新获取核心资源
          return Promise.allSettled(
            urlsToCache.map(url => 
              fetch(url, { cache: 'reload' }) // 强制绕过浏览器缓存
                .then(response => {
                  if (!response || !response.ok) {
                    console.log(`更新缓存失败: ${url}`);
                    return;
                  }
                  return cache.put(url, response);
                })
                .catch(err => console.log(`更新缓存资源失败: ${url}, 错误: ${err}`))
            )
          ).then(() => {
            // 通知客户端缓存已更新
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  action: 'cacheUpdated',
                  timestamp: Date.now()
                });
              });
            });
            console.log('缓存已成功更新');
          });
        })
    );
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
