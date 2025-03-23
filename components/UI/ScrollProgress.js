import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function ScrollProgress() {
  const { accentColor } = useTheme();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const [isVisible, setIsVisible] = useState(false);
  
  // 只有在滚动一定距离后才显示进度条
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <>
      {/* 顶部进度条 */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 z-[900] origin-left"
        style={{ 
          scaleX,
          backgroundColor: accentColor,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
    </>
  );
}
