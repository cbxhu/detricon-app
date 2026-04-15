import { motion } from 'motion/react';
import { ArrowLeft, Shield, Zap, Bell, Smartphone, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const features = [
    {
      icon: <Smartphone className="text-blue-400" />,
      title: "Native-like Experience",
      description: "Optimized webview wrapper that behaves like a native Android application."
    },
    {
      icon: <Bell className="text-yellow-400" />,
      title: "Push Notifications",
      description: "Stay updated with real-time alerts powered by Firebase Cloud Messaging."
    },
    {
      icon: <Zap className="text-purple-400" />,
      title: "High Performance",
      description: "Lightweight architecture ensuring fast load times and smooth transitions."
    },
    {
      icon: <Shield className="text-green-400" />,
      title: "Secure & Private",
      description: "Direct connection to Detricon Messenger with no intermediate data collection."
    },
    {
      icon: <Globe className="text-cyan-400" />,
      title: "PWA Support",
      description: "Installable on any device directly from your browser."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">About Detricon</h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <div className="inline-block p-4 rounded-3xl bg-gradient-to-tr from-zinc-800 to-zinc-700 mb-6 shadow-2xl">
            <span className="text-5xl font-black italic tracking-tighter">D</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Connecting Worlds</h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Detricon is a high-performance webview wrapper designed to bring the full power of 
            Detricon Messenger to your mobile device with a native-like feel.
          </p>
        </motion.section>

        {/* Features Grid */}
        <section className="grid gap-6 mb-16">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Core Features</h3>
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-bold mb-1">{feature.title}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Purpose Section */}
        <section className="mb-16 p-8 rounded-3xl bg-gradient-to-b from-zinc-900 to-black border border-white/5">
          <h3 className="text-xl font-bold mb-4">Our Purpose</h3>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The Detricon wrapper was built to bridge the gap between web and mobile. By leveraging 
            modern web technologies and native integration tools like Capacitor and FCM, we provide 
            a seamless communication experience that doesn't compromise on speed or security.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            This application acts as a secure container for the Detricon Messenger web platform, 
            adding essential mobile features like push notifications, offline support, and 
            system-level integration.
          </p>
        </section>

        {/* Get the App Section */}
        <section className="mb-16">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">Get the App</h3>
          
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Smartphone size={18} className="text-blue-400" />
                Option 1: Install as PWA (Recommended)
              </h4>
              <p className="text-sm text-zinc-400 mb-4">
                The fastest way to get Detricon on your phone without downloading an APK.
              </p>
              <ol className="text-xs text-zinc-500 space-y-2 list-decimal list-inside">
                <li>Open this URL in Chrome on your Android device.</li>
                <li>Tap the three dots (⋮) in the top right.</li>
                <li>Select "Install app" or "Add to Home screen".</li>
              </ol>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Globe size={18} className="text-purple-400" />
                Option 2: Build Native APK
              </h4>
              <p className="text-sm text-zinc-400 mb-4">
                To generate a shareable .apk file, you can build this project locally:
              </p>
              <div className="bg-black rounded-xl p-4 font-mono text-[10px] text-zinc-400 overflow-x-auto">
                <p># 1. Download the source code</p>
                <p># 2. Install dependencies: npm install</p>
                <p># 3. Build project: npm run build</p>
                <p># 4. Sync Capacitor: npx cap sync</p>
                <p># 5. Open in Android Studio: npx cap open android</p>
                <p># 6. Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Info */}
        <footer className="text-center text-zinc-600 text-sm">
          <p>© 2026 Detricon Project</p>
          <p className="mt-1">Version 1.2.0 • Built with React & Capacitor</p>
        </footer>
      </main>
    </div>
  );
}
