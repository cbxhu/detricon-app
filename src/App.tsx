/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ExternalLink, ShieldAlert, WifiOff, Bell, BellOff, Info, Settings, CheckCircle2, X } from 'lucide-react';
import { requestNotificationPermission, onMessageListener, getNotificationStatus } from './firebase';
import { checkUpdate, UpdateStatus, VersionInfo } from './services/updateService';
import About from './components/About';
import NotificationSettings from './components/NotificationSettings';
import UpdateModal from './components/UpdateModal';

const TARGET_URL = "https://detricon-messenger.vercel.app/";

function MainApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(getNotificationStatus());
  const [showSettings, setShowSettings] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const [activeToast, setActiveToast] = useState<{ title: string; body: string } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(true);
      setTimeout(() => {
        handleRefresh();
        setIsReconnecting(false);
      }, 1500);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial permission check
    setNotificationStatus(getNotificationStatus());

    // Check for updates
    const performUpdateCheck = async () => {
      const status = await checkUpdate();
      if (status.hasUpdate && status.latestVersion) {
        setUpdateInfo(status.latestVersion);
      }
    };
    performUpdateCheck();

    // Listen for foreground messages
    onMessageListener().then((payload: any) => {
      if (payload?.notification) {
        setActiveToast({
          title: payload.notification.title || 'New Message',
          body: payload.notification.body || ''
        });
        setTimeout(() => setActiveToast(null), 5000);
      }
    }).catch(err => console.log('FCM listener error: ', err));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Poll for permission changes
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getNotificationStatus();
      if (current !== notificationStatus) {
        setNotificationStatus(current);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [notificationStatus]);

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
    <div className="fixed inset-0 h-[100dvh] w-screen bg-black text-white overflow-hidden font-sans flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Status Bar / Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-2 bg-black/50 backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium tracking-wider uppercase opacity-70">Detricon Live</span>
        </div>
        <div className="flex gap-4">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Link 
              to="/about"
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white block"
              title="About Detricon"
            >
              <Info size={18} />
            </Link>
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(true)}
            className={`p-1.5 rounded-full transition-colors ${notificationStatus === 'granted' ? 'text-green-500' : 'text-white/50 hover:bg-white/10'}`}
            title="Notification Settings"
          >
            {notificationStatus === 'granted' ? <Bell size={18} /> : <BellOff size={18} />}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={openExternal}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            title="Open in Browser"
          >
            <ExternalLink size={18} />
          </motion.button>
        </div>
      </div>

      {/* Foreground Toast */}
      <AnimatePresence>
        {activeToast && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-4 left-4 right-4 z-[250] bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4"
          >
            <div className="bg-white/10 p-2 rounded-xl">
              <Bell size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">{activeToast.title}</p>
              <p className="text-xs text-zinc-400 line-clamp-1">{activeToast.body}</p>
            </div>
            <button onClick={() => setActiveToast(null)} className="text-zinc-500 hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <NotificationSettings onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>

      {/* Update Modal */}
      <AnimatePresence>
        {updateInfo && (
          <UpdateModal 
            version={updateInfo} 
            onClose={() => setUpdateInfo(null)} 
          />
        )}
      </AnimatePresence>

      {/* Permission Banner (Only if not granted and not blocked) */}
      <AnimatePresence>
        {notificationStatus === 'default' && !showSettings && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-6 left-6 right-6 z-[60] bg-white text-black rounded-3xl p-5 shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-black/5 p-3 rounded-2xl">
                <Bell size={24} />
              </div>
              <div>
                <p className="font-bold text-sm">Get real-time alerts</p>
                <p className="text-xs opacity-60">Enable notifications for messages.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="px-6 py-2.5 bg-black text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-colors"
            >
              Enable
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative w-full h-full">
        <AnimatePresence>
          {isReconnecting && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[45] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <RefreshCw size={32} className="animate-spin mb-4 text-white" />
              <p className="text-sm font-medium tracking-widest uppercase">Reconnecting...</p>
            </motion.div>
          )}
        </AnimatePresence>

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
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={location.pathname} 
        className="h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={<MainApp />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}



