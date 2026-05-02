import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { VersionInfo, downloadAndInstall, ignoreVersion } from '../services/updateService';

interface UpdateModalProps {
  version: VersionInfo;
  onClose: () => void;
}

export default function UpdateModal({ version, onClose }: UpdateModalProps) {
  const [step, setStep] = useState<'prompt' | 'downloading' | 'error'>('prompt');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setStep('downloading');
    try {
      await downloadAndInstall(version.apkUrl, (p) => setProgress(p));
      // Once install is triggered, the app might close or restart
      // We don't necessarily call onClose here as the system takes over
    } catch (err: any) {
      setStep('error');
      setError(err.message || 'Failed to download update');
    }
  };

  const handleIgnore = () => {
    ignoreVersion(version.version);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <Package size={20} className="text-blue-400" />
            </div>
            <h2 className="font-bold tracking-tight">System Update</h2>
          </div>
          {!version.forceUpdate && step === 'prompt' && (
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-8">
          {step === 'prompt' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">New Version Available</p>
                <p className="text-3xl font-black italic">v{version.version}</p>
              </div>

              <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Release Notes</p>
                <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {version.releaseNotes}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "#fff" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdate}
                  className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Update Now
                </motion.button>
                
                {!version.forceUpdate && (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={onClose}
                      className="py-3 bg-white/5 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      Later
                    </button>
                    <button 
                      onClick={handleIgnore}
                      className="py-3 bg-white/5 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      Don't Show Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'downloading' && (
            <div className="space-y-8 py-4 text-center">
              <div className="relative w-24 h-24 mx-auto leading-none flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48" cy="48" r="44"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-white/5"
                  />
                  <motion.circle
                    cx="48" cy="48" r="44"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="276.46"
                    animate={{ strokeDashoffset: 276.46 * (1 - progress) }}
                    className="text-blue-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold">{Math.round(progress * 100)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold">Downloading Update...</h3>
                <p className="text-sm text-zinc-500">Please keep the app open</p>
              </div>

              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="text-red-500" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Update Failed</h3>
                <p className="text-sm text-zinc-400">{error}</p>
              </div>
              <button 
                onClick={() => setStep('prompt')}
                className="w-full py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
