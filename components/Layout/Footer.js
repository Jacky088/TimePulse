import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiClock, FiInfo } from 'react-icons/fi';

export default function Footer() {
  const [logs, setLogs] = useState([]);
  const [currentTime, setCurrentTime] = useState('');

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

  return (
    <div className="pointer-events-auto w-full min-h-screen flex items-center justify-center text-white dark:text-white text-gray-800 px-4">
      <div className="w-full max-w-4xl glass-card p-8 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800 dark:text-white">
              <FiInfo className="mr-2" /> 关于 TimePulse
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-200">
              TimePulse 是一个现代化的倒计时应用，支持多个计时器、数据同步和美观的动效展示。
            </p>
            
            <div className="mb-6">
              <a 
                href="https://github.com/RavelloH/TimePulse" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-full bg-gray-600 hover:bg-gray-700 dark:bg-white/20 dark:hover:bg.white/30 text-white dark:text-white transition-colors"
                data-umami-event="访问GitHub"
              >
                <FiGithub className="mr-2" /> GitHub 仓库
              </a>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">功能特点</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-200">
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
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FiClock className="mr-2" /> 运行日志
            </h2>
            
            <div className="bg-black/30 rounded-lg p-3 mb-3">
              <p className="text-sm font-mono">当前时间: {currentTime}</p>
            </div>
            
            <div className="h-64 overflow-y-auto bg-black/30 rounded-lg p-3 font-mono text-xs">
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
        
        <div className="mt-8 pt-4 border-t border-gray-300 dark:border-white/10 text-center text-sm text-gray-600 dark:text-gray-300">
          <p>
            © {new Date().getFullYear()} TimePulse. 使用 Next.js 和 Framer Motion 构建。
          </p>
        </div>
      </div>
    </div>
  );
}
