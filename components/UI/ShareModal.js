import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCopy, FiShare2, FiCheck } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { useTimers } from '../../context/TimerContext';
import { useTheme } from '../../context/ThemeContext';
import { createShareUrl } from '../../utils/shareUtils';

export default function ShareModal({ onClose }) {
  const { timers, activeTimerId } = useTimers();
  const { accentColor } = useTheme();
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState(activeTimerId);
  const [shareAll, setShareAll] = useState(false);
  
  // 生成分享URL
  useEffect(() => {
    const url = createShareUrl(
      shareAll 
        ? timers 
        : timers.filter(timer => timer.id === selectedTimer)
    );
    
    // 构建完整URL
    const fullUrl = `${window.location.origin}${window.location.pathname}?share=${url}`;
    setShareUrl(fullUrl);
  }, [timers, selectedTimer, shareAll]);
  
  // 复制URL到剪贴板
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('无法复制URL: ', err);
      });
  };
  
  // 尝试使用Web Share API分享
  const handleWebShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '查看我的TimePulse倒计时',
        text: '我分享了一个倒计时，点击链接查看',
        url: shareUrl
      })
      .catch(err => {
        console.log('分享失败:', err);
      });
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-md m-4 p-6 rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">分享倒计时</h2>
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            <FiX className="text-xl" />
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">选择要分享的倒计时</label>
          <select
            value={shareAll ? 'all' : selectedTimer}
            onChange={(e) => {
              if (e.target.value === 'all') {
                setShareAll(true);
              } else {
                setShareAll(false);
                setSelectedTimer(e.target.value);
              }
            }}
            className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            data-umami-event="选择分享计时器"
          >
            <option value="all">分享所有计时器</option>
            {timers.map(timer => (
              <option key={timer.id} value={timer.id}>
                {timer.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">分享链接</label>
          <div className="flex">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-2 rounded-l-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            <button
              className={`px-4 py-2 rounded-r-lg text-white`}
              style={{ 
                backgroundColor: copied ? '#10b981' : accentColor 
              }}
              onClick={handleCopy}
              data-umami-event="复制分享链接"
            >
              {copied ? <FiCheck /> : <FiCopy />}
            </button>
          </div>
        </div>
        
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-white rounded-xl">
            <QRCodeSVG
              value={shareUrl}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/favicon.ico",
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
            onClick={onClose}
          >
            关闭
          </button>
          {navigator.share && (
            <button
              className="flex-1 px-4 py-3 rounded-lg text-white flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
              onClick={handleWebShare}
              data-umami-event="使用系统分享"
            >
              <FiShare2 className="mr-2" />
              系统分享
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
