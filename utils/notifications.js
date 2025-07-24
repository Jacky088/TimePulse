// 存储待处理的通知，用于Service Worker激活前
const pendingNotifications = [];

// 存储用户的通知权限偏好
const NOTIFICATION_PREFERENCE_KEY = 'timepulse_notification_preference';

/**
 * 获取用户的通知权限偏好
 * @returns {string} 'allowed' | 'denied' | 'not_set'
 */
export function getNotificationPreference() {
  if (typeof window === 'undefined') return 'not_set';
  return localStorage.getItem(NOTIFICATION_PREFERENCE_KEY) || 'not_set';
}

/**
 * 设置用户的通知权限偏好
 * @param {string} preference 'allowed' | 'denied'
 */
export function setNotificationPreference(preference) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATION_PREFERENCE_KEY, preference);
}

/**
 * 检查是否应该显示通知权限弹窗
 * @returns {boolean} 是否应该显示弹窗
 */
export function shouldShowNotificationModal() {
  if (!('Notification' in window)) {
    return false;
  }

  const preference = getNotificationPreference();
  
  // 如果用户已经选择了"不再提醒"，则不显示
  if (preference === 'denied') {
    return false;
  }

  // 如果浏览器权限已经是granted，也不需要显示
  if (Notification.permission === 'granted') {
    return false;
  }

  // 如果浏览器权限是denied，也不显示（用户已经在浏览器层面拒绝）
  if (Notification.permission === 'denied') {
    return false;
  }

  // 其他情况（权限为default且用户偏好为not_set或allowed）显示弹窗
  return true;
}

/**
 * 检查通知权限状态
 * @returns {Promise<boolean>} 权限是否已获取
 */
async function checkNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('此浏览器不支持通知');
    return false;
  }

  return Notification.permission === 'granted';
}

/**
 * 请求通知权限（由弹窗组件调用）
 * @returns {Promise<boolean>} 权限是否已获取
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('此浏览器不支持通知');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('请求通知权限失败:', error);
    return false;
  }
}

/**
 * 为倒计时设置通知
 * @param {Object} countdown - 倒计时对象
 * @param {string} countdown.id - 倒计时ID
 * @param {string} countdown.title - 倒计时标题
 * @param {number} countdown.targetTime - 倒计时目标时间戳
 * @param {boolean} skipPermissionCheck - 是否跳过权限检查（当权限已经确认时）
 * @returns {Promise<{success: boolean, needsPermission: boolean}>} 操作结果
 */
export async function scheduleCountdownNotification(countdown, skipPermissionCheck = false) {
  if (!countdown || !countdown.targetTime || !countdown.title) {
    console.error('无效的倒计时数据');
    return { success: false, needsPermission: false };
  }

  // 检查Service Worker API是否可用
  if (!('serviceWorker' in navigator)) {
    console.log('此浏览器不支持Service Worker，无法设置通知');
    return { success: false, needsPermission: false };
  }

  // 如果不跳过权限检查，检查是否需要显示权限弹窗
  if (!skipPermissionCheck && shouldShowNotificationModal()) {
    // 派发需要权限的事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('needNotificationPermission', {
        detail: { countdown }
      }));
    }
    return { success: false, needsPermission: true };
  }

  // 检查通知权限
  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    console.log('无法设置通知：权限未获取');
    return { success: false, needsPermission: false };
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
    return { success: true, needsPermission: false };
  }

  // 如果Service Worker尚未激活，将通知加入等待队列
  console.log('Service Worker未激活，将通知加入等待队列');
  pendingNotifications.push(notificationData);
  
  // 监听Service Worker控制状态变化
  navigator.serviceWorker.ready.then(registration => {
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
  }).catch(error => {
    console.error('Service Worker ready 错误:', error);
  });

  return { success: true, needsPermission: false };
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
