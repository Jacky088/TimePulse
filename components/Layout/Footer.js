import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiClock, FiInfo, FiWifiOff, FiRefreshCw } from 'react-icons/fi';

export default function Footer() {
  const [logs, setLogs] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [isCacheUpdating, setIsCacheUpdating] = useState(false);
  const [lastCacheUpdate, setLastCacheUpdate] = useState(null);

  // 检查网络状态
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
      
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // 更新当前时间
  useEffect(() => {
    const formatTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString());
    };

    // 初始化时间
    formatTime();
    
    // 每秒更新时间
    const interval = setInterval(formatTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // 收集控制台日志
  useEffect(() => {
    const originalConsoleLog = console.log;
    const logs = [];
    
    console.log = (...args) => {
      originalConsoleLog.apply(console, args);
      logs.push(args.join(' '));
      if (logs.length > 50) logs.shift(); // 限制日志数量
      setLogs([...logs]);
    };
    
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  // 监听缓存更新事件
  useEffect(() => {
    const handleCacheUpdated = (e) => {
      setIsCacheUpdating(false);
      setLastCacheUpdate(new Date(e.detail.timestamp).toLocaleString());
    };
    
    window.addEventListener('cacheUpdated', handleCacheUpdated);
    return () => window.removeEventListener('cacheUpdated', handleCacheUpdated);
  }, []);
  
  // 更新缓存
  const updateCache = () => {
    if (typeof window.updateServiceWorkerCache === 'function') {
      const success = window.updateServiceWorkerCache();
      if (success) {
        setIsCacheUpdating(true);
        console.log('已发送缓存更新请求');
      } else {
        console.log('无法更新缓存：Service Worker 未激活');
      }
    } else {
      console.log('缓存更新功能不可用');
    }
  };

  return (
    <div className="pointer-events-auto w-full min-h-screen md:min-h-screen flex items-center justify-center text-white dark:text-white text-gray-800 px-4">
      <div className="w-full max-w-4xl glass-card p-4 sm:p-6 md:p-8 rounded-2xl">
        {/* 在移动设备上使用更紧凑的布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 flex items-center text-gray-800 dark:text-white">
              <FiInfo className="mr-2" /> 关于 TimePulse
            </h2>
            <p className="mb-3 md:mb-4 text-sm md:text-base text-gray-700 dark:text-gray-200">
              TimePulse 是一个现代化的倒计时应用，支持多个计时器、数据同步和美观的动效展示。
            </p>
            
            <div className="mb-4 md:mb-6">
              <a 
                href="https://github.com/RavelloH/TimePulse" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 text-sm rounded-full bg-gray-600 hover:bg-gray-700 dark:bg-white/20 dark:hover:bg.white/30 text-white dark:text-white transition-colors"
                data-umami-event="访问GitHub"
              >
                <FiGithub className="mr-1 md:mr-2" /> GitHub 仓库
              </a>
            </div>
            
            <div className="mb-4">
              <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-800 dark:text-white">功能特点</h3>
              <ul className="list-disc list-inside space-y-0.5 md:space-y-1 text-sm md:text-base text-gray-700 dark:text-gray-200">
                <li>精美的视觉效果和动画</li>
                <li>支持多个计时器</li>
                <li>数据本地存储</li>
                <li>数据分享与同步</li>
                <li>暗色/亮色主题</li>
                <li>全屏模式</li>
                <li>响应式设计</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 flex items-center">
              <FiClock className="mr-2" /> 运行日志
            </h2>
            
            <div className="bg-black/30 rounded-lg p-2 md:p-3 mb-2 md:mb-3">
              <p className="text-xs md:text-sm font-mono">当前时间: {currentTime}</p>
            </div>
            
            {/* 减少移动设备上的日志高度 */}
            <div className="h-36 sm:h-48 md:h-64 overflow-y-auto bg-black/30 rounded-lg p-2 md:p-3 font-mono text-xs">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-1 break-words"
                  >
                    {log}
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-400">暂无日志记录...</p>
              )}
            </div>
          </div>
        </div>
        
        {/* 离线模式提示 - 位于页脚中间，使用低调样式 */}
        <div className="mt-4 md:mt-6 text-center opacity-70 flex flex-col items-center space-y-2">
          {isOffline && (
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <FiWifiOff className="mr-1 w-3 h-3" />
              <span>当前处于离线模式，部分功能可能不可用</span>
            </p>
          )}
          
          {/* 缓存更新按钮 */}
          <div className="flex items-center space-x-2">
            <button 
              className={`text-xs flex items-center justify-center px-2 py-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isCacheUpdating ? 'opacity-50 cursor-wait' : ''}`}
              onClick={updateCache}
              disabled={isCacheUpdating || isOffline}
              title="更新应用缓存"
              data-umami-event="更新缓存"
            >
              <FiRefreshCw className={`mr-1 w-3 h-3 ${isCacheUpdating ? 'animate-spin' : ''}`} />
              <span>更新缓存</span>
            </button>
            
            {lastCacheUpdate && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                上次更新: {lastCacheUpdate}
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4 md:mt-8 pt-2 md:pt-4 border-t border-gray-300 dark:border-white/10 text-center text-xs md:text-sm text-gray-600 dark:text-gray-300">
          <p>
            © {new Date().getFullYear()} <a className="underline" href="https://timepulse.ravelloh.top/">TimePulse</a> by <a className="underline" href="https://ravelloh.top/">RavelloH</a>. 使用 Next.js 和 Framer Motion 构建。
          </p>
        </div>
      </div>
    </div>
  );
}
