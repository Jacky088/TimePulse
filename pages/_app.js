import { useState, useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import { TimerProvider } from '../context/TimerContext';
import { ThemeProvider } from '../context/ThemeContext';
import { getFromRemoteCache } from '../utils/syncService';
import ScrollProgress from '../components/UI/ScrollProgress';
import ScrollHandle from '../components/UI/ScrollHandle';

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // 页面加载完成后记录日志
    console.log(`TimePulse 初始化完成 - ${new Date().toLocaleString()}`);
    
    // 监听hash变化以支持umami统计
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      console.log(`页面状态变更: #${hash || 'home'} - ${new Date().toLocaleString()}`);
    };
    
    // 检查URL中是否包含syncId参数
    const checkSyncId = async () => {
      const params = new URLSearchParams(window.location.search);
      const syncId = params.get('syncId');
      const syncPass = params.get('syncPass');
      
      if (syncId) {
        // 保存同步ID
        localStorage.setItem('timepulse_sync_id', syncId);
        console.log(`已从URL导入同步ID: ${syncId}`);
        
        // 如果提供了密码，也保存密码并尝试获取数据
        if (syncPass) {
          localStorage.setItem('timepulse_sync_password', syncPass);
          console.log(`已从URL导入同步密码`);
          
          // 尝试从远程获取数据 - 但我们不能在这里处理，
          // 因为TimerContext还没准备好。我们在TimerContext中处理这个
        }
        
        // 清除URL参数但保留其他参数
        const newParams = new URLSearchParams(window.location.search);
        newParams.delete('syncId');
        newParams.delete('syncPass');
        const newUrl = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
    };
    
    checkSyncId();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider>
      <TimerProvider>
        <Head>
          <title>TimePulse - 现代化倒计时</title>
          <meta name="description" content="TimePulse - 一个现代化的倒计时网页应用" />
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </Head>
        <ScrollProgress />
        <ScrollHandle />
        <Component {...pageProps} />
      </TimerProvider>
    </ThemeProvider>
  );
}

export default MyApp;
