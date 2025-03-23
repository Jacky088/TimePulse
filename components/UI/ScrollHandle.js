import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function ScrollHandle() {
  const { accentColor } = useTheme();
  const [isScrolling, setIsScrolling] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // 解析颜色并创建RGBA
  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(14, 165, 233, ${alpha})`;
    
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // 监听滚动事件
  useEffect(() => {
    let scrollTimer;
    
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimer);
      
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);
  
  return (
    <motion.div
      className="fixed right-2 top-1/2 -translate-y-1/2 z-[910] h-[30vh] w-1 rounded-full"
      style={{
        backgroundColor: isScrolling || isHovering ? 
          hexToRgba(accentColor, 0.2) : 
          'transparent',
        transition: 'background-color 0.3s ease'
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: isScrolling || isHovering ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    />
  );
}
