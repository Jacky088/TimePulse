// 存储待处理的通知，用于Service Worker激活前
const pendingNotifications = [];

/**
 * 为倒计时设置通知
 * @param {Object} countdown - 倒计时对象
 * @param {string} countdown.id - 倒计时ID
 * @param {string} countdown.title - 倒计时标题
 * @param {number} countdown.targetTime - 倒计时目标时间戳
 */
export function scheduleCountdownNotification(countdown) {
  if (!countdown || !countdown.targetTime || !countdown.title) {
    console.error('无效的倒计时数据');
    return;
  }

  // 检查Service Worker API是否可用
  if (!('serviceWorker' in navigator)) {
    console.log('此浏览器不支持Service Worker，无法设置通知');
    return;
  }

  // 创建通知数据
  const notificationData = {
    action: 'scheduleNotification',
    title: `${countdown.title} 倒计时结束`,
    body: `您设置的 "${countdown.title}" 倒计时已经结束。`,
    timestamp: countdown.targetTime,
    id: countdown.id
  };

  // 如果Service Worker已激活，直接发送消息
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(notificationData);
    console.log('已设置倒计时通知:', countdown.title);
    return;
  }

  // 如果Service Worker尚未激活，将通知加入等待队列
  console.log('Service Worker未激活，将通知加入等待队列');
  pendingNotifications.push(notificationData);
  
  // 监听Service Worker控制状态变化
  navigator.serviceWorker.ready.then(registration => {
    // 请求通知权限
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        // 使用一次性控制器状态检查
        const checkController = () => {
          if (navigator.serviceWorker.controller) {
            // Service Worker已激活，发送所有待处理通知
            while (pendingNotifications.length > 0) {
              const notification = pendingNotifications.shift();
              navigator.serviceWorker.controller.postMessage(notification);
              console.log('已从等待队列发送通知:', notification.title);
            }
          } else {
            // 继续等待Service Worker激活
            console.log('Service Worker仍未激活，继续等待...');
            setTimeout(checkController, 500);
          }
        };
        
        // 开始检查
        checkController();
      } else {
        console.log('通知权限未获取');
      }
    });
  });
}

/**
 * 取消已设置的倒计时通知
 * @param {string} countdownId - 倒计时ID
 */
export function cancelCountdownNotification(countdownId) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.getNotifications({ tag: countdownId }).then(notifications => {
        notifications.forEach(notification => notification.close());
      });
    });
  }
}
