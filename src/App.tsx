/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ExternalLink, ShieldAlert, WifiOff, Bell, BellOff, Info } from 'lucide-react';
import { requestNotificationPermission, onMessageListener } from './firebase';
import About from './components/About';

const TARGET_URL = "https://detricon-messenger.vercel.app/";

function MainApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check notification status
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      } else if (Notification.permission === 'default') {
        setTimeout(() => setShowNotificationPrompt(true), 5000);
      }
    }

    onMessageListener().then((payload: any) => {
      console.log('Foreground message received:', payload);
    }).catch(err => console.log('failed: ', err));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotificationsEnabled(true);
      setShowNotificationPrompt(false);
      console.log('FCM Token:', token);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = TARGET_URL;
    }
  };

  const openExternal = () => {
    window.open(TARGET_URL, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden font-sans">
      {/* Status Bar / Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-2 bg-black/50 backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium tracking-wider uppercase opacity-70">Detricon Live</span>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/about"
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
            title="About Detricon"
          >
            <Info size={16} />
          </Link>
          <button 
            onClick={handleEnableNotifications}
            className={`p-1 rounded-full transition-colors ${notificationsEnabled ? 'text-green-500' : 'text-white/50 hover:bg-white/10'}`}
            title={notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
          >
            {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          </button>
          <button 
            onClick={handleRefresh}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={openExternal}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Open in Browser"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* Notification Prompt */}
      <AnimatePresence>
        {showNotificationPrompt && !notificationsEnabled && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-4 left-4 right-4 z-[60] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl">
                <Bell size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">Stay Updated</p>
                <p className="text-xs text-zinc-400">Enable notifications for messages.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowNotificationPrompt(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Later
              </button>
              <button 
                onClick={handleEnableNotifications}
                className="px-4 py-1.5 text-xs font-bold bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Enable
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative w-full h-full">
        {!isOnline ? (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-zinc-900 p-6 text-center">
            <WifiOff size={48} className="mb-4 text-zinc-500" />
            <h2 className="text-xl font-bold mb-2">You're Offline</h2>
            <p className="text-zinc-400 mb-6">Please check your internet connection to use Detricon Messenger.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={TARGET_URL}
            className="w-full h-full border-none"
            onLoad={handleIframeLoad}
            onError={() => setHasError(true)}
            title="Detricon Messenger"
            allow="camera; microphone; geolocation; clipboard-read; clipboard-write; autoplay"
          />
        )}

        {/* Error Fallback */}
        {hasError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-900 p-6 text-center">
            <ShieldAlert size={48} className="mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Connection Blocked</h2>
            <p className="text-zinc-400 mb-6">
              The website "detricon-messenger.vercel.app" might be preventing itself from being embedded.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button 
                onClick={handleRefresh}
                className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Retry Loading
              </button>
              <button 
                onClick={openExternal}
                className="px-6 py-2 bg-zinc-800 text-white rounded-full font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                Open Detricon Directly
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Splash Screen */}
      <AnimatePresence>
        {isLoading && isOnline && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2
              }}
              className="flex flex-col items-center"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-zinc-800 to-zinc-600 shadow-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-black italic tracking-tighter">D</span>
                </div>
                <motion.div 
                  className="absolute -inset-2 border-2 border-white/20 rounded-[2rem]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute -inset-2 border-2 border-t-white border-transparent rounded-[2rem]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <motion.h1 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold tracking-tight mb-2"
              >
                Detricon
              </motion.h1>
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 0.5 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-medium tracking-[0.2em] uppercase"
              >
                Connecting Worlds
              </motion.p>
            </motion.div>

            <div className="absolute bottom-12 w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}



