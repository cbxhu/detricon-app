import { motion } from 'motion/react';
import { Bell, BellOff, Settings, X, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';
import { getNotificationStatus, requestNotificationPermission } from '../firebase';
import { useState, useEffect } from 'react';

interface NotificationSettingsProps {
  onClose: () => void;
}

export default function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const [status, setStatus] = useState<PermissionState | 'unsupported' | 'default'>(getNotificationStatus());
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Poll for permission changes (since there's no standard event for this in all browsers)
    const interval = setInterval(() => {
      const currentStatus = getNotificationStatus();
      if (currentStatus !== status) {
        setStatus(currentStatus);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const handleEnable = async () => {
    setIsProcessing(true);
    const token = await requestNotificationPermission();
    setStatus(getNotificationStatus());
    setIsProcessing(false);
    if (token) {
      // In a real app, you'd sync this token to your backend
      console.log('FCM Token acquired');
    }
  };

  const renderContent = () => {
    if (status === 'unsupported') {
      return (
        <div className="text-center py-6">
          <AlertCircle className="mx-auto text-zinc-500 mb-4" size={48} />
          <h3 className="text-lg font-bold mb-2">Not Supported</h3>
          <p className="text-zinc-400 text-sm">
            Your current browser or device doesn't support push notifications.
          </p>
        </div>
      );
    }

    if (status === 'granted') {
      return (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
            <ShieldCheck className="mx-auto text-green-500 mb-3" size={40} />
            <h3 className="text-green-500 font-bold mb-1">Notifications Active</h3>
            <p className="text-zinc-400 text-xs">You're all set to receive real-time updates.</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div>
                <p className="text-sm font-medium">System Permission</p>
                <p className="text-xs text-zinc-500">Authorized by your device</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>
            <p className="text-[10px] text-zinc-500 text-center px-4">
              To disable notifications, you'll need to use your browser or device system settings.
            </p>
          </div>
        </div>
      );
    }

    if (status === 'denied') {
      return (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
            <BellOff className="mx-auto text-red-500 mb-3" size={40} />
            <h3 className="text-red-500 font-bold mb-1">Notifications Blocked</h3>
            <p className="text-zinc-400 text-xs">Access was denied at the system level.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 space-y-3">
              <p className="text-sm font-medium">How to fix this:</p>
              <ol className="text-xs text-zinc-400 space-y-2 list-decimal list-inside">
                <li>Open your browser or device settings.</li>
                <li>Find "Site Settings" or "App Notifications".</li>
                <li>Locate this app and change permission to "Allow".</li>
              </ol>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              Check Again
            </motion.button>
          </div>
        </div>
      );
    }

    // Default state (prompt)
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Bell className="text-white" size={32} />
          </motion.div>
          <h3 className="text-xl font-bold mb-2">Stay in the Loop</h3>
          <p className="text-zinc-400 text-sm px-4">
            Enable notifications to receive real-time alerts for new messages and updates.
          </p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: "#f4f4f5" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEnable}
          disabled={isProcessing}
          className="w-full py-4 bg-white text-black rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <Bell size={18} />
              Enable Notifications
            </>
          )}
        </motion.button>
        
        <p className="text-[10px] text-zinc-500 text-center">
          We only send relevant updates. You can change this anytime in your device settings.
        </p>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 200,
          mass: 0.8
        }}
        className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl mb-[env(safe-area-inset-bottom)]"
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <h2 className="font-bold tracking-tight">Notification Settings</h2>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className="p-8">
          {renderContent()}
        </div>
      </motion.div>
    </motion.div>
  );
}
