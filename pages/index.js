import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout/Layout';
import GradientBackground from '../components/Background/GradientBackground';
import CountdownDisplay from '../components/Countdown/CountdownDisplay';
import AddTimerModal from '../components/UI/AddTimerModal';
import ShareModal from '../components/UI/ShareModal';
import LoginModal from '../components/UI/LoginModal';
import { useTimers } from '../context/TimerContext';
import { useTheme } from '../context/ThemeContext';
import { FaPlus, FaShareAlt, FaExpand, FaCompress } from 'react-icons/fa';
import { parseShareUrl } from '../utils/shareUtils';

export default function Home() {
  const { timers, activeTimerId, setActiveTimerId, addTimer } = useTimers();
  const { theme, accentColor } = useTheme();
  const router = useRouter();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [log, setLog] = useState([]);
  // 添加日志
  const addLog = (message) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // 处理全屏
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        addLog(`错误: 无法进入全屏模式: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // 监听URL参数以同步数据
  useEffect(() => {
    if (router.query.share) {
      try {
        const sharedData = parseShareUrl(router.query.share);
        if (sharedData.timers && sharedData.timers.length > 0) {
          sharedData.timers.forEach(timer => {
            addTimer(timer);
          });
          setActiveTimerId(sharedData.timers[0].id);
          addLog('已从分享链接导入计时器数据');
        }
      } catch (error) {
        addLog(`解析分享数据错误: ${error.message}`);
      }
    }
  }, [router.query.share, addTimer, setActiveTimerId]);

  // 初始化日志
  useEffect(() => {
    addLog('TimePulse 初始化完成');
    addLog(`当前主题: ${theme}`);
    addLog(`加载了 ${timers.length} 个计时器`);
  }, [theme, timers.length]);

  return (
    <>
      <Layout>
        <GradientBackground />
        
        <main className="relative flex flex-col items-center justify-center min-h-screen py-12 z-10">
          <CountdownDisplay />
        </main>
      </Layout>
      
      {/* 将按钮移到Layout组件外部，确保它们总是在最上层 */}
      {/* 添加计时器按钮 - 保持使用动态主题色 */}
      <div className="fixed bottom-6 right-6" style={{ zIndex: 10 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-4 rounded-full glass-card shadow-lg cursor-pointer"
          style={{ color: accentColor }}
          onClick={() => {
            setIsAddModalOpen(true);
            if (window.location.hash !== '#add') {
              window.location.hash = 'add';
            }
          }}
          data-umami-event="创建计时器"
        >
          <FaPlus className="text-xl" />
        </motion.button>
      </div>
      
      {/* 分享按钮 - 保持使用动态主题色 */}
      <div className="fixed bottom-6 left-6" style={{ zIndex: 10 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-4 rounded-full glass-card shadow-lg cursor-pointer"
          style={{ color: accentColor }}
          onClick={() => {
            setIsShareModalOpen(true);
            if (window.location.hash !== '#share') {
              window.location.hash = 'share';
            }
          }}
          data-umami-event="分享倒计时"
        >
          <FaShareAlt className="text-xl" />
        </motion.button>
      </div>
      
      {/* 弹窗内容 */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddTimerModal onClose={() => {
            setIsAddModalOpen(false);
            if (window.location.hash === '#add') {
              window.location.hash = '';
            }
          }} />
        )}
      </AnimatePresence>
      
      {/* 分享弹窗 */}
      <AnimatePresence>
        {isShareModalOpen && (
          <ShareModal onClose={() => {
            setIsShareModalOpen(false);
            if (window.location.hash === '#share') {
              window.location.hash = '';
            }
          }} />
        )}
      </AnimatePresence>
      
      {/* 登录弹窗 */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <LoginModal onClose={() => {
            setIsLoginModalOpen(false);
            if (window.location.hash === '#login') {
              window.location.hash = '';
            }
          }} />
        )}
      </AnimatePresence>
    </>
  );
}
