import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiSave, FiShare2, FiCopy, FiCheck, FiDownload, FiUpload, FiLock } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import { saveToRemoteCache, getFromRemoteCache } from '../../utils/syncService';
import { useTimers } from '../../context/TimerContext';

export default function LoginModal({ onClose }) {
  const { timers, addTimer } = useTimers();
  const [syncId, setSyncId] = useState('');
  const [syncUrl, setSyncUrl] = useState('');
  const [password, setPassword] = useState('');
  const [inputSyncId, setInputSyncId] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, generated, saved
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  
  // 初始化 - 检查是否已有同步ID
  useEffect(() => {
    const savedSyncId = localStorage.getItem('timepulse_sync_id');
    const savedPassword = localStorage.getItem('timepulse_sync_password');
    
    if (savedSyncId) {
      setSyncId(savedSyncId);
      setStatus('saved');
      
      if (savedPassword) {
        setPassword(savedPassword);
      }
      
      // 生成同步URL
      const url = `${window.location.origin}${window.location.pathname}?syncId=${savedSyncId}${savedPassword ? `&syncPass=${savedPassword}` : ''}`;
      setSyncUrl(url);
    }
  }, []);
  
  // 生成新的同步ID和密码，并自动保存上传
  const generateSyncId = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const newSyncId = uuidv4();
    const newPassword = Math.random().toString(36).substring(2, 10); // 简单的密码生成
    
    setSyncId(newSyncId);
    setPassword(newPassword);
    
    try {
      // 保存到本地
      localStorage.setItem('timepulse_sync_id', newSyncId);
      localStorage.setItem('timepulse_sync_password', newPassword);
      
      // 生成同步URL
      const url = `${window.location.origin}${window.location.pathname}?syncId=${newSyncId}&syncPass=${newPassword}`;
      setSyncUrl(url);
      
      // 上传到远程
      await saveToRemoteCache(newSyncId, newPassword, { timers }, 30 * 24 * 60 * 60 * 1000);
      
      // 更新状态为已保存
      setStatus('saved');
      setSuccessMessage('同步ID已生成并保存到云端');
      console.log(`同步ID已生成并保存: ${newSyncId} - ${new Date().toLocaleString()}`);
    } catch (error) {
      setErrorMessage(`生成同步ID失败: ${error.message}`);
      console.error('同步数据保存失败:', error);
      // 仍然显示生成的ID和密码，但状态为generated而非saved
      setStatus('generated');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 保存同步ID和密码到本地和远程
  const saveSyncId = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // 先保存到本地
      localStorage.setItem('timepulse_sync_id', syncId);
      localStorage.setItem('timepulse_sync_password', password);
      
      // 然后保存到远程
      await saveToRemoteCache(syncId, password, { timers }, 30 * 24 * 60 * 60 * 1000);
      
      setStatus('saved');
      setSuccessMessage('同步数据已保存到云端');
      
      // 记录日志
      console.log(`同步ID已保存: ${syncId} - ${new Date().toLocaleString()}`);
    } catch (error) {
      setErrorMessage(`保存失败: ${error.message}`);
      console.error('同步数据保存失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 复制同步URL
  const copyUrl = () => {
    navigator.clipboard.writeText(syncUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        setErrorMessage(`无法复制URL: ${err.message}`);
        console.error('复制URL失败:', err);
      });
  };
  
  // 从远程加载数据
  const loadFromRemote = async (event) => {
    if (event) event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const syncData = await getFromRemoteCache(
        inputSyncId || syncId, 
        inputPassword || password
      );
      
      // 确保数据格式正确
      if (syncData && syncData.timers && Array.isArray(syncData.timers) && syncData.timers.length > 0) {
        // 导入计时器
        syncData.timers.forEach(timer => {
          addTimer(timer);
        });
        
        // 如果使用输入的ID，则保存为当前设备的同步ID
        if (inputSyncId) {
          localStorage.setItem('timepulse_sync_id', inputSyncId);
          localStorage.setItem('timepulse_sync_password', inputPassword);
          setSyncId(inputSyncId);
          setPassword(inputPassword);
          setStatus('saved');
          
          // 更新同步URL
          const url = `${window.location.origin}${window.location.pathname}?syncId=${inputSyncId}&syncPass=${inputPassword}`;
          setSyncUrl(url);
        }
        
        setSuccessMessage(`成功导入 ${syncData.timers.length} 个计时器`);
        console.log(`已从远程同步 ${syncData.timers.length} 个计时器 - ${new Date().toLocaleString()}`);
      } else {
        setErrorMessage('远程数据无效或不包含计时器');
      }
    } catch (error) {
      // 确保错误消息有意义
      const errorMsg = error.message === '查询成功' ? '远程数据格式错误或为空' : error.message;
      setErrorMessage(`加载失败: ${errorMsg}`);
      console.error('从远程加载数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 上传当前数据到远程
  const uploadToRemote = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await saveToRemoteCache(
        syncId, 
        password, 
        { timers }, 
        30 * 24 * 60 * 60 * 1000
      );
      
      setSuccessMessage(`成功上传 ${timers.length} 个计时器到云端`);
      console.log(`已上传 ${timers.length} 个计时器到远程 - ${new Date().toLocaleString()}`);
    } catch (error) {
      setErrorMessage(`上传失败: ${error.message}`);
      console.error('上传数据到远程失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[600] backdrop-blur-sm"
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
          <h2 className="text-2xl font-semibold">数据同步</h2>
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            onClick={onClose}
          >
            <FiX className="text-xl" />
          </button>
        </div>
        
        {/* 错误和成功提示 */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
            {successMessage}
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            使用数据同步功能可以在不同设备间共享您的计时器。生成一个唯一ID并设置密码，然后通过分享链接或扫描二维码在其他设备登录。
          </p>
          
          {/* 切换创建/登录选项卡 */}
          {status === 'idle' && (
            <div className="flex mb-4">
              <button
                className={`flex-1 py-2 border-b-2 ${!showLogin ? 'border-primary-500 text-primary-500' : 'border-gray-300 text-gray-500'}`}
                onClick={() => setShowLogin(false)}
              >
                创建同步ID
              </button>
              <button
                className={`flex-1 py-2 border-b-2 ${showLogin ? 'border-primary-500 text-primary-500' : 'border-gray-300 text-gray-500'}`}
                onClick={() => setShowLogin(true)}
              >
                登录同步ID
              </button>
            </div>
          )}
          
          {/* 创建同步ID */}
          {status === 'idle' && !showLogin && (
            <div className="flex justify-center">
              <button
                className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white cursor-pointer"
                onClick={generateSyncId}
                data-umami-event="生成同步ID"
                disabled={isLoading}
              >
                {isLoading ? '生成并保存中...' : '生成同步ID'}
              </button>
            </div>
          )}
          
          {/* 登录同步ID */}
          {status === 'idle' && showLogin && (
            <form onSubmit={loadFromRemote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">同步ID</label>
                <input
                  type="text"
                  value={inputSyncId}
                  onChange={(e) => setInputSyncId(e.target.value)}
                  placeholder="输入您的同步ID"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">密码</label>
                <input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="输入密码"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white cursor-pointer flex items-center justify-center"
                disabled={isLoading}
                data-umami-event="登录同步ID"
              >
                <FiDownload className="mr-2" />
                {isLoading ? '加载中...' : '登录并同步数据'}
              </button>
            </form>
          )}
          
          {/* 显示同步信息 */}
          {(status === 'generated' || status === 'saved') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">您的同步ID</label>
                <div className="flex">
                  <input
                    type="text"
                    value={syncId}
                    readOnly
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  {status === 'generated' && (
                    <button
                      className="ml-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                      onClick={saveSyncId}
                      data-umami-event="保存同步ID"
                      disabled={isLoading}
                    >
                      <FiSave />
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">密码</label>
                <div className="flex">
                  <input
                    type="text"
                    value={password}
                    readOnly
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  <button
                    className="ml-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                    onClick={() => setPassword(Math.random().toString(36).substring(2, 10))}
                    data-umami-event="重新生成密码"
                    disabled={isLoading}
                  >
                    <FiLock />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">同步链接</label>
                <div className="flex">
                  <input
                    type="text"
                    value={syncUrl}
                    readOnly
                    className="flex-1 px-4 py-2 rounded-l-lg bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  <button
                    className={`px-4 py-2 rounded-r-lg ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-primary-500 hover:bg-primary-600 text-white'
                    } cursor-pointer`}
                    onClick={copyUrl}
                    data-umami-event="复制同步链接"
                  >
                    {copied ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              </div>
              
              {status === 'saved' && (
                <div className="flex space-x-2">
                  <button
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white cursor-pointer flex items-center justify-center"
                    onClick={uploadToRemote}
                    data-umami-event="上传数据"
                    disabled={isLoading}
                  >
                    <FiUpload className="mr-2" />
                    {isLoading ? '上传中...' : '上传当前数据'}
                  </button>
                  
                  <button
                    className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white cursor-pointer flex items-center justify-center"
                    onClick={loadFromRemote}
                    data-umami-event="下载数据"
                    disabled={isLoading}
                  >
                    <FiDownload className="mr-2" />
                    {isLoading ? '下载中...' : '下载最新数据'}
                  </button>
                </div>
              )}
              
              <div className="flex justify-center mt-4">
                <div className="p-4 bg-white rounded-xl">
                  <QRCodeSVG
                    value={syncUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
              
              {status === 'saved' && (
                <div className="text-center text-green-500 font-medium">
                  ✓ 同步ID已保存
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          <button
            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center cursor-pointer z-[650]"
            onClick={onClose}
            disabled={isLoading}
          >
            关闭
          </button>
          {(status === 'generated' || status === 'saved') && navigator.share && (
            <button
              className="flex-1 px-4 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center cursor-pointer z-[650]"
              onClick={() => {
                navigator.share({
                  title: '登录到我的TimePulse',
                  text: '使用此链接登录并同步我的TimePulse倒计时',
                  url: syncUrl
                });
              }}
              data-umami-event="分享同步链接"
              disabled={isLoading}
            >
              <FiShare2 className="mr-2" />
              分享
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
