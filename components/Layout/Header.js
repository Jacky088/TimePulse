import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSettings, FiMoon, FiSun, FiUser, FiMaximize, FiMinimize, FiEdit, FiSave, FiGlobe } from 'react-icons/fi';
import { useTimers } from '../../context/TimerContext';
import { useTheme } from '../../context/ThemeContext';
import LoginModal from '../UI/LoginModal';
import { HexColorPicker } from 'react-colorful';

export default function Header() {
  const { timers, activeTimerId, setActiveTimerId, deleteTimer, updateTimer } = useTimers();
  const { theme, toggleTheme, accentColor } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingTimer, setEditingTimer] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // 打开登录模态框
  const openLoginModal = () => {
    setIsLoginOpen(true);
    if (window.location.hash !== '#login') {
      window.location.hash = 'login';
    }
  };

  // 处理全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`错误: 无法进入全屏模式: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // 处理语言切换
  const switchLanguage = (lang) => {
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.location.href = url.toString();
    setIsLanguageOpen(false);
  };

  // 开始编辑计时器
  const startEditTimer = (timer) => {
    if (timer.type === 'countdown' || !timer.type) {
      // 倒计时可以编辑所有属性
      setEditingTimer({
        ...timer,
        targetDate: new Date(timer.targetDate).toISOString().substring(0, 10),
        targetTime: new Date(timer.targetDate).toTimeString().substring(0, 5)
      });
    } else {
      // 正计时和世界时钟只能编辑名字和颜色
      setEditingTimer({
        ...timer,
        isLimitedEdit: true // 标记为限制编辑模式
      });
    }
  };

  // 保存编辑的计时器
  const saveEditedTimer = () => {
    if (!editingTimer) return;
    
    if (editingTimer.isLimitedEdit) {
      // 限制编辑模式：只更新名字和颜色
      updateTimer(editingTimer.id, {
        name: editingTimer.name,
        color: editingTimer.color
      });
    } else {
      // 完整编辑模式：更新所有属性（倒计时）
      const targetDateObj = new Date(`${editingTimer.targetDate}T${editingTimer.targetTime}`);
      
      updateTimer(editingTimer.id, {
        name: editingTimer.name,
        targetDate: targetDateObj.toISOString(),
        color: editingTimer.color
      });
    }
    
    setEditingTimer(null);
    setShowColorPicker(false);
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 获取当前活动计时器
  const activeTimer = timers.find(timer => timer.id === activeTimerId) || null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <nav className="glass-card mx-4 mt-4 px-6 py-4 grid grid-cols-3 items-center">
        {/* Logo - 增强渐变效果，使用较深的相似色 */}
        <motion.div 
          className="flex items-center justify-start"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 
            className="text-xl md:text-2xl font-bold font-display bg-clip-text text-transparent"
            style={{ 
              backgroundImage: `linear-gradient(45deg, ${accentColor}, ${accentColor}66)` 
            }}
          >
            <a href="https://timepulse.ravelloh.top/">TimePulse</a>
          </h1>
        </motion.div>

        {/* 计时器选择器 - 桌面版 - 居中显示 */}
        <div className="hidden md:flex justify-center">
          <div className="flex space-x-4 overflow-x-auto py-2 max-w-md">
            {/* 移除 AnimatePresence 的 mode="wait" 属性，允许多个子元素同时动画 */}
            <AnimatePresence>
              {timers.map(timer => (
                <motion.button
                  key={timer.id}
                  layout
                  layoutId={`timer-${timer.id}`}
                  initial={{ opacity: 0.8, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeTimerId === timer.id 
                      ? 'text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  style={
                    activeTimerId === timer.id 
                      ? { backgroundColor: timer.color || '#0ea5e9' } 
                      : {}
                  }
                  onClick={() => setActiveTimerId(timer.id)}
                  data-umami-event="切换计时器"
                >
                  {timer.name}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* 右侧按钮组 */}
        <div className="flex items-center justify-end">
          {/* 全屏按钮 */}
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
            onClick={toggleFullscreen}
            data-umami-event={isFullscreen ? "退出全屏" : "进入全屏"}
          >
            {isFullscreen ? <FiMinimize className="text-xl" /> : <FiMaximize className="text-xl" />}
          </button>
          
          {/* 登录按钮 */}
          <button
            className="p-2 ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
            onClick={openLoginModal}
            data-umami-event="打开登录"
          >
            <FiUser className="text-xl" />
          </button>
          
          {/* 主题切换 */}
          <button
            className="p-2 ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
            onClick={toggleTheme}
            data-umami-event="切换主题"
          >
            {theme === 'dark' ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
          </button>

          {/* 语言切换 */}
          <button
            className="p-2 ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
            onClick={() => setIsLanguageOpen(true)}
            data-umami-event="打开语言选择"
          >
            <FiGlobe className="text-xl" />
          </button>

          {/* 设置按钮 */}
          <button
            className="p-2 ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
            onClick={() => {
              setIsManageOpen(true);
              if (window.location.hash !== '#manage') {
                window.location.hash = 'manage';
              }
            }}
            data-umami-event="打开管理菜单"
          >
            <FiSettings className="text-xl" />
          </button>

          {/* 移动端菜单按钮 */}
          <button
            className="p-2 ml-2 md:hidden rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-umami-event="打开移动菜单"
          >
            {isMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </nav>

      {/* 移动端下拉菜单 - 同样使用计时器的颜色和动画效果 */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card mx-4 mt-2 p-4 md:hidden"
          >
            <div className="flex flex-col space-y-2">
              {timers.map(timer => (
                <motion.button
                  key={timer.id}
                  layout
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`px-4 py-2 rounded-lg text-left ${
                    activeTimerId === timer.id 
                      ? 'text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                  style={
                    activeTimerId === timer.id 
                      ? { backgroundColor: timer.color || '#0ea5e9' } 
                      : {}
                  }
                  onClick={() => {
                    setActiveTimerId(timer.id);
                    setIsMenuOpen(false);
                  }}
                  data-umami-event="移动端切换计时器"
                >
                  {timer.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 管理计时器弹窗 */}
      <AnimatePresence>
        {isManageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-4"
            onClick={() => {
              setIsManageOpen(false);
              setEditingTimer(null);
              if (window.location.hash === '#manage') {
                window.location.hash = '';
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md m-4 p-6 rounded-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">管理计时器</h2>
                <button
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => {
                    setIsManageOpen(false);
                    setEditingTimer(null);
                    if (window.location.hash === '#manage') {
                      window.location.hash = '';
                    }
                  }}
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              {editingTimer ? (
                <div className="space-y-4">
                  <h3 className="font-medium mb-2">
                    {editingTimer.isLimitedEdit ? '编辑计时器' : '编辑倒计时'}
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">名称</label>
                    <input
                      type="text"
                      value={editingTimer.name}
                      onChange={(e) => setEditingTimer({...editingTimer, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>

                  {/* 只有倒计时可以编辑日期和时间 */}
                  {!editingTimer.isLimitedEdit && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">日期</label>
                        <input
                          type="date"
                          value={editingTimer.targetDate}
                          onChange={(e) => setEditingTimer({...editingTimer, targetDate: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">时间</label>
                        <input
                          type="time"
                          value={editingTimer.targetTime}
                          onChange={(e) => setEditingTimer({...editingTimer, targetTime: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">颜色</label>
                    <div 
                      className="h-10 w-full rounded-lg cursor-pointer"
                      style={{ backgroundColor: editingTimer.color }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    ></div>
                    {showColorPicker && (
                      <div className="mt-2">
                        <HexColorPicker 
                          color={editingTimer.color} 
                          onChange={(color) => setEditingTimer({...editingTimer, color})} 
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <button
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => setEditingTimer(null)}
                    >
                      取消
                    </button>
                    <button
                      className="flex-1 px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white cursor-pointer flex items-center justify-center"
                      onClick={saveEditedTimer}
                      data-umami-event="保存修改计时器"
                    >
                      <FiSave className="mr-2" />
                      保存修改
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {timers.map(timer => (
                    <div 
                      key={timer.id}
                      className="flex items-center justify-between p-3 mb-2 rounded-lg bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50"
                      style={{
                        borderLeft: `4px solid ${timer.color || '#0ea5e9'}`
                      }}
                    >
                      <div>
                        <h3 className="font-medium">{timer.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {timer.type === 'stopwatch' 
                            ? '正计时器' 
                            : timer.type === 'worldclock' 
                            ? `${timer.country || '世界时间'} - ${timer.timezone || ''}`
                            : new Date(timer.targetDate).toLocaleString()
                          }
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {/* 所有计时器都可以编辑名字和颜色 */}
                        <button
                          className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer"
                          onClick={() => startEditTimer(timer)}
                          data-umami-event="编辑计时器"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 cursor-pointer"
                          onClick={() => deleteTimer(timer.id)}
                          data-umami-event="删除计时器"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 语言切换弹窗 */}
      <AnimatePresence>
        {isLanguageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsLanguageOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-sm m-4 p-6 rounded-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">选择语言 / Select Language</h2>
                <button
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => setIsLanguageOpen(false)}
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  className="w-full px-4 py-3 rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/20 text-left transition-all cursor-pointer"
                  onClick={() => switchLanguage('zh-CN')}
                  data-umami-event="切换到中文"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🇨🇳</span>
                    <div>
                      <div className="font-medium">中文</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">简体中文</div>
                    </div>
                  </div>
                </button>

                <button
                  className="w-full px-4 py-3 rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/20 text-left transition-all cursor-pointer"
                  onClick={() => switchLanguage('en-US')}
                  data-umami-event="切换到英文"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🇺🇸</span>
                    <div>
                      <div className="font-medium">English</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">English (US)</div>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 登录模态框 */}
      <AnimatePresence>
        {isLoginOpen && (
          <LoginModal onClose={() => {
            setIsLoginOpen(false);
            if (window.location.hash === '#login') {
              window.location.hash = '';
            }
          }} />
        )}
      </AnimatePresence>
    </header>
  );
}
