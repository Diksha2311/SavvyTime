import React from 'react';
import {  Clock, Wifi, Shield, Zap, Bell, Share2, Layers, Plus } from 'lucide-react';
import PageWrapper from "./PageWrapper";

// --- 1. STANDARD PHONE FRAME ---
const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex justify-center items-center 
                  p-2 sm:p-4
                  w-full">

    <div
      className="
        relative
        w-[240px] h-[480px]          /* very small phones */
        xs:w-[260px] xs:h-[520px]
        sm:w-[300px] sm:h-[580px]   /* normal mobile */
        md:w-[320px] md:h-[600px]   /* tablet / laptop */
        lg:w-[340px] lg:h-[620px]   /* large screens */

        bg-[#0a0c14]
        rounded-[2.8rem]
        border-[10px] border-[#1e293b]
        shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]
        overflow-hidden
        transition-transform duration-500 hover:scale-[1.01]
        ring-2 ring-white/5
      "
    >
      {/* Hardware Buttons */}
      <div className="absolute left-[-11px] top-24 sm:top-28 w-[3px] h-10 sm:h-12 bg-slate-600 rounded-l-md z-50" />
      <div className="absolute right-[-11px] top-32 sm:top-36 w-[3px] h-16 sm:h-20 bg-slate-600 rounded-r-md z-50" />

      {/* Dynamic Island */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2
                      w-24 sm:w-32
                      h-6 sm:h-7
                      bg-black rounded-b-2xl
                      z-50 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-2" />
        <div className="w-6 sm:w-8 h-1 rounded-full bg-slate-600" />
      </div>

      {/* Screen */}
      <div className="relative w-full h-full bg-[#8b5db5] dark:bg-[#020617] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

        <div className="relative h-full
                        pt-12 sm:pt-14
                        pb-6 sm:pb-8
                        px-3 sm:px-5
                        flex flex-col z-10">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2
                        w-24 sm:w-32
                        h-1 bg-white/20 rounded-full z-50" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none z-40" />
    </div>
  </div>
);


// --- 2. FEATURE ITEM ---
const FeatureItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  align: "left" | "right";
}> = ({ icon, title, desc, align }) => (
  <div className={`flex flex-col w-full ${align === "right" ? "items-center lg:items-end lg:text-right" : "items-center lg:items-start lg:text-left"}`}>
    <div className="mb-4 p-4 rounded-2xl bg-purple-500/15 text-purple-600">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white tracking-tight">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-[320px] leading-relaxed">
      {desc}
    </p>
  </div>
);


// --- 3. CONVERTER DISPLAY ---
const ConverterDisplay: React.FC = () => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (zone: string) => 
    time.toLocaleTimeString('en-US', { 
      timeZone: zone, 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-10 text-center">
        {/* Updated Timezone to India */}
        <p className="text-6xl font-black text-white tracking-tighter tabular-nums">
          {formatTime('Asia/Kolkata')}
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          {/* Updated Label */}
          <p className="dark:text-purple-400 text-white font-bold uppercase text-[10px] tracking-[0.2em]">
            India (IST)
          </p>
        </div>
      </div>
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-10 transform hover:rotate-180 transition-all duration-500 cursor-pointer group">
        <Plus className="text-slate-900 rotate-45 group-hover:rotate-90 transition-transform" size={28} strokeWidth={3} />
      </div>
      <div className="opacity-40 hover:opacity-100 transition-opacity duration-500 text-center">
        <p className="text-4xl font-bold text-white tracking-tighter tabular-nums">{formatTime('Europe/London')}</p>
        <p className=" dark:text-slate-500 text-white font-bold uppercase text-[10px] mt-2 tracking-[0.2em]">London (GMT)</p>
      </div>
    </div>
  );
};

// --- 4. MAIN PAGE ---
const ChronoSyncLanding: React.FC = () => {
  return (
    <PageWrapper>
    <div className="min-h-screen w-full mx-auto bg-[#E9EDFA] dark:bg-[#0B1220] selection:bg-purple-500/30 transition-colors duration-500 overflow-x-hidden">
      
      {/* HERO SECTION */}
    <main className="relative z-10 max-w-7xl mx-auto 
  px-4 sm:px-6 
  py-12 sm:py-16 
  lg:min-h-screen 
  flex flex-col lg:flex-row 
  items-center justify-center 
  gap-10 md:gap-12 lg:gap-24">

        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start lg:ml-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border dark:border-purple-600/20  border-purple-300 dark:border-white/10 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-purple-600 uppercase">Mobile App V2.0</span>
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-slate-900 dark:text-white">
            Time control, <span className="text-purple-600 dark:text-purple-400 block mt-2">in your pocket.</span>
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-slate-600 dark:text-gray-400 max-w-xl">
            Download the ChronoSync mobile app to manage teams and timezones on the go. Syncs perfectly with your desktop dashboard.
          </p>



      <div className="flex flex-wrap gap-4 justify-center lg:justify-start mt-10">
  {/* App Store Button */}
  <button className="flex items-center gap-3 bg-white text-black px-6 py-2.5 rounded-2xl font-bold  transition-all active:scale-95 shadow-lg shadow-slate-200 border border-slate-100">
    {/* Apple Official Logo */}
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" 
      alt="App Store" 
      className="w-6 h-6" 
    />
    <div className="text-left leading-none">
      <p className="text-[9px] uppercase font-black opacity-60">Download on the</p>
      <p className="text-lg font-bold">App Store</p>
    </div>
  </button>

  {/* Google Play Button */}
  <button className="flex items-center gap-3  dark: bg-[#0b1d43]  text-white px-6 py-2.5 rounded-2xl font-bold  transition-all active:scale-95 shadow-lg shadow-black/20">
    {/* Google Play Official Logo */}
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" 
      alt="Google Play" 
      className="w-6 h-6" 
    />
    <div className="text-left leading-none">
      <p className="text-[9px] uppercase font-black opacity-90">Get it on</p>
      <p className="text-lg font-bold">Google Play</p>
    </div>
  </button>
</div>
        </div>
        <div className="flex justify-center relative lg:mr-8">
          <div className="absolute w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
          <PhoneFrame>
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Clock size={64} className="text-white mb-6 drop-shadow-xl" />
              <h2 className="text-3xl font-black text-white tracking-tighter mb-2">ChronoSync</h2>
              <p className="text-purple-100/60 text-sm mb-12 uppercase tracking-widest">Global Time Utility</p>
              <button className="w-full bg-white text-purple-700 py-4 rounded-full font-black text-sm active:scale-95 transition-all">Get Started</button>
            </div>
          </PhoneFrame>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section className=" px-6 flex flex-col items-center">
        <div className="max-w-7xl w-full">
          <h2 className="text-center text-4xl lg:text-5xl font-bold mb-20 text-slate-900 dark:text-white">Powerful Mobile Features</h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px_1fr] gap-16 lg:gap-8 items-center">
            <div className="space-y-10 lg:pr-10">
              <FeatureItem icon={<Wifi />} title="Offline Mode" desc="Access your conversions without data." align="right" />
              <FeatureItem icon={<Zap />} title="Instant Sync" desc="Changes reflect immediately on desktop." align="right" />
              <FeatureItem icon={<Layers />} title="Smart Widgets" desc="View timezones from home screen." align="right" />
            </div>
            <PhoneFrame>
              <div className="flex flex-col h-full gap-4">
                <p className="font-bold text-lg text-white">Live Status</p>
                <div className=" dark:bg-blue-600/20  bg-slate-900/40 border border-blue-500/40 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 text-xs uppercase font-bold mb-1"><Wifi size={14} /> Connection</div>
                  <p className="font-bold text-white">Offline Ready</p>
                </div>
                <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-white text-[13px] font-bold">Widget Preview</p>
                    <span className="bg-blue-500/20 text-blue-400 text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse">Active</span>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-16 bg-slate-800/60 rounded-2xl border border-slate-700/50 animate-pulse" />
                      <div className="h-16 bg-slate-800/60 rounded-2xl border border-slate-700/50 animate-pulse" />
                    </div>
                    <div className="h-14 bg-slate-800/40 rounded-2xl border border-slate-700/30 animate-pulse" />
                  </div>
                </div>
              </div>
            </PhoneFrame>
            <div className="space-y-10 lg:pl-10">
              <FeatureItem icon={<Shield />} title="Secure Data" desc="Enterprise-grade encryption." align="left" />
              <FeatureItem icon={<Bell />} title="Smart Alerts" desc="Notifications before sunset." align="left" />
              <FeatureItem icon={<Share2 />} title="Easy Sharing" desc="Share times as simple links." align="left" />
            </div>
          </div>
        </div>
      </section>

      {/* APP SCREENSHOTS SECTION (ALIGNED) */}
      <section className="py-20 px-6 flex flex-col items-center  dark:bg-transparent">
        <div className="max-w-7xl w-full">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">App Screenshots</h2>
            <p className="text-slate-500 dark:text-gray-400 font-medium italic">A closer look at the mobile experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-6  justify-items-center">
            <div className="flex flex-col items-center">
              <PhoneFrame>
                <h4 className="text-white font-bold mb-6 text-2xl">My Zone</h4>
                <div className="space-y-4 flex-1">
                  <div className="h-20  bg-slate-800/40 dark:bg-purple-500/20 rounded-2xl border border-purple-500/30 flex items-center px-4 animate-pulse" />
                  <div className="h-20 bg-slate-800/40 rounded-2xl border border-slate-700/50" />
                  <div className="h-20 bg-slate-800/40 rounded-2xl border border-slate-700/50" />
                </div>
                <div className="mt-6 flex justify-end">
                  <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg"><Plus className="text-white" /></div>
                </div>
              </PhoneFrame>
              <p className="mt-8 font-bold text-slate-900 dark:text-white">Dashboard</p>
            </div>
            <div className="flex flex-col items-center">
              <PhoneFrame>
                <h4 className="text-white font-bold text-center text-xl mb-8">Converter</h4>
                <ConverterDisplay />
              </PhoneFrame>
              <p className="mt-8 font-bold text-slate-900 dark:text-white">Time Converter</p>
            </div>
           <div className="
  flex flex-col items-center
  md:col-span-2
  md:row-start-2
  md:justify-self-center
  lg:col-span-1
  lg:row-auto
">

              <PhoneFrame>
                <h4 className="text-white font-bold mb-6 text-2xl">Calendar</h4>
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-6">
                  <div className="grid grid-cols-7 gap-1.5">
                    {[...Array(28)].map((_, i) => <div key={i} className={`h-6 rounded-md ${i === 14 ? 'bg-purple-600' : 'bg-white/5'}`} />)}
                  </div>
                </div>
                <div className="p-4 dark:bg-purple-600/20  bg-slate-900/40 border-l-4 border-purple-500 rounded-r-2xl mt-auto">
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Live Sync</p>
                  <p className="text-base font-bold text-white">Active Now</p>
                </div>
              </PhoneFrame>
              <p className="mt-8 font-bold text-slate-900 dark:text-white">Team Calendar</p>
            </div>
          </div>
        </div>
      </section>

        <footer className="w-full bg-white/10 dark:bg-[#0B1229] border-t border-slate-300 dark:border-white/10 py-10 text-center text-sm text-gray-500">
        © 2026 ChronoSync. Premium Global Time Utilities.
      </footer>
    </div>
    </PageWrapper>
  );
};

export default ChronoSyncLanding;