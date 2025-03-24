import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimers } from '../../context/TimerContext';
import DigitColumn from './DigitColumn';
import { scheduleCountdownNotification } from '../../utils/notifications';

export default function CountdownDisplay() {
  const { getActiveTimer } = useTimers();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showDays, setShowDays] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  
  // 计算剩余时间
  useEffect(() => {
    const timer = getActiveTimer();
    if (!timer) return;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const targetDate = new Date(timer.targetDate);
      const difference = targetDate - now;
      
      if (difference <= 0) {
        // 倒计时结束
        setIsFinished(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        
        // 当倒计时结束时调用通知函数（重新设置以确保立即发送）
        scheduleCountdownNotification({
          id: timer.id,
          title: timer.name,
          targetTime: Date.now() // 设置为当前时间以立即触发
        });
        
        return;
      }
      
      // 倒计时未结束
      setIsFinished(false);
      
      // 计算天、时、分、秒
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      setTimeLeft({ days, hours, minutes, seconds });
      setShowDays(days > 0);
    };
    
    // 立即计算一次
    calculateTimeLeft();
    
    // 每秒更新一次
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [getActiveTimer]);
  
  // 格式化为两位数
  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };
  
  const activeTimer = getActiveTimer();
  
  if (!activeTimer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-400">没有活动的计时器</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center text-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      key={activeTimer.id} // 确保切换计时器时重新渲染和动画
    >
      {/* 倒计时名称 - 增强动画效果 */}
      <motion.h2 
        className="text-xl sm:text-2xl md:text-3xl font-medium mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          color: activeTimer.color,
          transition: 'color 0.3s var(--transition-timing)'
        }}
      >
        {activeTimer.name}
      </motion.h2>
      
      {/* 倒计时显示 - 整体容器动画 */}
      <motion.div 
        className="flex items-center justify-center space-x-2 sm:space-x-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* 天数 */}
        {showDays && (
          <>
            <DigitColumn 
              value={formatNumber(timeLeft.days)} 
              label="天"
              color={activeTimer.color || '#0ea5e9'}
            />
            <span className="text-4xl sm:text-5xl md:text-6xl font-thin text-gray-400">:</span>
          </>
        )}
        
        {/* 小时 */}
        <DigitColumn 
          value={formatNumber(timeLeft.hours)} 
          label="时"
          color={activeTimer.color || '#0ea5e9'}
        />
        <span className="text-4xl sm:text-5xl md:text-6xl font-thin text-gray-400">:</span>
        
        {/* 分钟 */}
        <DigitColumn 
          value={formatNumber(timeLeft.minutes)} 
          label="分"
          color={activeTimer.color || '#0ea5e9'}
        />
        <span className="text-4xl sm:text-5xl md:text-6xl font-thin text-gray-400">:</span>
        
        {/* 秒 */}
        <DigitColumn 
          value={formatNumber(timeLeft.seconds)} 
          label="秒"
          color={activeTimer.color || '#0ea5e9'}
        />
      </motion.div>
      
      {/* 倒计时结束提示 */}
      <AnimatePresence>
        {isFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-8 glass-card px-6 py-4 rounded-xl"
          >
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              倒计时已结束！
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 目标日期显示 */}
      <motion.p 
        className="mt-6 text-sm text-gray-500 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        目标时间: {new Date(activeTimer.targetDate).toLocaleString()}
      </motion.p>
    </motion.div>
  );
}
