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

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    // 确保service worker已激活
    navigator.serviceWorker.ready.then(registration => {
      // 请求通知权限
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // 发送倒计时信息到service worker
          navigator.serviceWorker.controller.postMessage({
            action: 'scheduleNotification',
            title: `${countdown.title} 倒计时结束`,
            body: `您设置的 "${countdown.title}" 倒计时已经结束。`,
            timestamp: countdown.targetTime,
            id: countdown.id
          });
          console.log('已设置倒计时通知:', countdown.title);
        } else {
          console.log('通知权限未获取');
        }
      });
    });
  } else {
    console.log('Service Worker未激活，无法设置通知');
  }
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
