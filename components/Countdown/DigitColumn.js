import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DigitColumn({ value, label, color = '#0ea5e9' }) {
  const [prevValue, setPrevValue] = useState(value);
  const [isChanging, setIsChanging] = useState(false);
  
  // 监听数字变化
  useEffect(() => {
    if (value !== prevValue) {
      setIsChanging(true);
      const timer = setTimeout(() => {
        setPrevValue(value);
        setIsChanging(false);
      }, 300); // 动画持续时间
      
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);
  
  return (
    <div className="flex flex-col items-center">
      <motion.div 
        className="w-16 sm:w-20 md:w-24 h-24 sm:h-32 md:h-36 rounded-xl glass-card flex items-center justify-center relative overflow-hidden"
        style={{ 
          boxShadow: `0 0 30px ${color}20`,
          transition: 'box-shadow 0.5s var(--transition-timing)'
        }}
        whileHover={{ 
          boxShadow: `0 0 40px ${color}40`,
          scale: 1.02 
        }}
        transition={{ duration: 0.3 }}
      >
        {/* 数字动画 */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* 当前显示的数字 */}
          <AnimatePresence mode="wait">
            {isChanging ? (
              <>
                {/* 旧数字向上滑出 */}
                <motion.span
                  key={`prev-${prevValue}`}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: '-100%', opacity: 0 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="absolute text-5xl sm:text-6xl md:text-7xl font-bold"
                  style={{ color }}
                >
                  {prevValue}
                </motion.span>

                {/* 新数字从下向上滑入 */}
                <motion.span
                  key={`current-${value}`}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="absolute text-5xl sm:text-6xl md:text-7xl font-bold"
                  style={{ color }}
                >
                  {value}
                </motion.span>
              </>
            ) : (
              <motion.span
                key={`static-${value}`}
                className="text-5xl sm:text-6xl md:text-7xl font-bold"
                style={{ color }}
              >
                {value}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* 标签 */}
      <motion.span 
        className="mt-2 text-sm text-gray-500 dark:text-gray-400"
        whileHover={{ color }}
        transition={{ duration: 0.3 }}
      >
        {label}
      </motion.span>
    </div>
  );
}
