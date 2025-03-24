// 检查浏览器是否支持Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker 注册成功:', registration.scope);
        
        // 请求通知权限
        if ('Notification' in window) {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              console.log('通知权限已获取');
            }
          });
        }
      })
      .catch(error => {
        console.log('ServiceWorker 注册失败:', error);
      });
  });
}
