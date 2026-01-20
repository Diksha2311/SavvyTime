import { useState, useEffect, useRef } from "react";
import { Hourglass, Timer as TimerIcon, Calendar, RotateCcw, Play, Pause, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import PageWrapper from "./PageWrapper";

export default function TimerPage() {
  const [activeTab, setActiveTab] = useState("timer");
  const [isActive, setIsActive] = useState(false);
  const [inputMins, setInputMins] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [stopwatchTime, setStopwatchTime] = useState(0);

  // --- Countdown & Calendar States ---
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const [targetDate, setTargetDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Default to 1 min from now
    return now.toISOString().slice(0, 16);
  });
  const [countdownResult, setCountdownResult] = useState({ d: 0, h: 0, m: 0, s: 0 });

  const intervalRef = useRef<number | null>(null);

  // --- Calendar Logic ---
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();


  const handlePrevMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    setSelectedDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    setSelectedDate(d);
  };
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    updateTarget(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    updateTarget(d);
  };

  const updateTarget = (date: Date) => {
    setSelectedDate(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    setTargetDate(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  // --- Formatters ---
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (time: number) => {
    const mins = Math.floor(time / 6000);
    const secs = Math.floor((time % 6000) / 100);
    const ms = time % 100;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // --- Handlers ---
 

  const resetAll = () => {
    setIsActive(false);
    if (activeTab === "timer") setTimerSeconds(inputMins * 60);
    if (activeTab === "stopwatch") setStopwatchTime(0);
  };

  // --- Logic Effects ---
  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        if (activeTab === "timer") {
          setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (activeTab === "stopwatch") {
          setStopwatchTime((prev) => prev + 1);
        }
      }, activeTab === "timer" ? 1000 : 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, activeTab]);

  useEffect(() => {
    const calc = () => {
      const diff = +new Date(targetDate) - +new Date();
      if (diff > 0) {
        setCountdownResult({
          d: Math.floor(diff / 86400000),
          h: Math.floor((diff / 3600000) % 24),
          m: Math.floor((diff / 60000) % 60),
          s: Math.floor((diff / 1000) % 60),
        });
      } else {
        setCountdownResult({ d: 0, h: 0, m: 0, s: 0 });
      }
    };
    const t = setInterval(calc, 1000);
    calc();
    return () => clearInterval(t);
  }, [targetDate]);

  // Click outside to close calendar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <PageWrapper>
      <div className="min-h-screen w-full flex flex-col bg-[#E9EDFA] dark:bg-[#0B1220] text-slate-800 dark:text-white relative ">
        {/* Scrollable Content Area */}
        <main className="flex-1 flex flex-col items-center py-8 sm:py-12 px-3 sm:px-4 md:px-6">

          {/* 1. Header Section */}
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl  font-bold mb-2 tracking-tight">Chronometer</h1>
            <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm">Precision tools for every moment.</p>
          </div>

          {/* 2. Tab Switcher */}

          <div className="w-full max-w-4xl flex sm:flex-row flex-row bg-[#bacaca] dark:bg-gray-800/50 p-1 sm:p-1.5 rounded-full mb-8 sm:mb-12 border border-slate-400 dark:border-white/10 backdrop-blur-md shadow-sm gap-1 sm:gap-3">
            {[
              { id: "timer", label: "Timer", icon: Hourglass },
              { id: "stopwatch", label: "Stopwatch", icon: TimerIcon },
              { id: "countdown", label: "Countdown", icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsActive(false); }}
                className={`sm:flex-1 w-1/3 sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-[13px] font-bold transition-all duration-300
 ${activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                    : "text-slate-500 dark:text-gray-400 dark:hover:bg-white/5  hover:bg-gray-200 hover:text-purple-700"
                  }`}
              >
                <tab.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="text-[8px] sm:text-[13px] mt-0.5 sm:mt-0">{tab.label}</span>
              </button>
            ))}
          </div>
          {/* 3. Main Display Card */}

          <div className="w-full max-w-6xl relative rounded-[2.5rem] sm:rounded-3xl md:rounded-[3rem] border border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] overflow-hidden mb-8 sm:mb-12 flex flex-col items-center justify-center py-8 sm:py-10 min-h-[450px] sm:min-h-[550px] shadow-xl transition-all duration-300">

            {/* CIRCULAR PROGRESS CONTAINER */}
            <div className="relative flex items-center justify-center w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px]">
              {(activeTab === "timer" || activeTab === "stopwatch") && (
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 400 400">
                    <circle cx="200" cy="200" r="150" fill="transparent" stroke="currentColor" strokeWidth="5" className="text-slate-200 dark:text-white/5" />
                    <circle
                      cx="200" cy="200" r="150" fill="transparent" strokeWidth="7"
                      strokeDasharray={2 * Math.PI * 150}
                      style={{
                        strokeDashoffset: activeTab === "timer"
                          ? (2 * Math.PI * 140) - (timerSeconds / (inputMins * 60 || 1)) * (2 * Math.PI * 140)
                          : 0,
                        transition: "stroke-dashoffset 1s linear",
                        strokeLinecap: "round"
                      }}
                      className="stroke-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                    />
                  </svg>
                </div>
              )}

              <div className="z-10 flex flex-col items-center text-center">
             {activeTab === "timer" && (
  <div className="animate-in fade-in zoom-in duration-500">
    {/* Digital Time */}
    <div className="text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tighter">
      {formatTime(timerSeconds)}
    </div>

    {/* Vertical Buttons Logic */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4 text-slate-500 font-bold uppercase tracking-widest text-[12px] sm:text-[14px] md:text-[16px]">
  <span>Set Mins:</span>
  
  <div className="flex items-center p-1 rounded-xl bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm transition-all hover:border-purple-500/50">
    
    {/* 1. Display Value (Ab Left Side Pe Hai) */}
    <div className="px-4 min-w-[50px] text-center">
      <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-xl sm:text-2xl">
        {inputMins}
      </span>
    </div>

    {/* 2. Buttons Container (Ab Right Side Pe Hai) */}
    <div className="flex flex-col border-l border-slate-200 dark:border-white/10 pl-1">
      <button 
        onClick={() => {
          const newVal = inputMins + 1;
          setInputMins(newVal);
          setTimerSeconds(newVal * 60);
          setIsActive(false);
        }}
        className="p-0.5 hover:text-purple-500 text-slate-400 transition-colors active:scale-90"
      >
        <ChevronUp size={16} strokeWidth={3} />
      </button>
      <button 
        onClick={() => {
          const newVal = Math.max(1, inputMins - 1);
          setInputMins(newVal);
          setTimerSeconds(newVal * 60);
          setIsActive(false);
        }}
        className="p-0.5 hover:text-purple-500 text-slate-400 transition-colors active:scale-90"
      >
        <ChevronDown size={16} strokeWidth={3} />
      </button>
    </div>
  </div>
</div>
  </div>
)}

                {activeTab === "stopwatch" && (
                  <div className="animate-in fade-in zoom-in duration-500">
                    <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tighter">{formatStopwatch(stopwatchTime)}</div>
                    <div className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] mt-2">Elapsed Time</div>
                  </div>
                )}
                {activeTab === "countdown" && (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 w-full mt-3 sm:mt-4">

                    {/* 1. Countdown Cards (NO CHANGES TO SIZING/GRID) */}
                    <div className="w-full overflow-x-auto overflow-y-visible px-4 py-3 scrollbar-hide">
                      <div className="flex justify-center gap-2 sm:gap-4">
                        {[
                          { val: countdownResult.d, label: "Days" },
                          { val: countdownResult.h, label: "Hours" },
                          { val: countdownResult.m, label: "Mins" },
                          { val: countdownResult.s, label: "Secs" }
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex flex-col items-center justify-center bg-white/20 dark:bg-white/5 
              rounded-lg sm:rounded-[1.2rem] md:rounded-[2.5rem] 
              min-w-[60px] sm:min-w-[85px] md:min-w-[130px]
              h-20 sm:h-28 md:h-36
              border dark:border-white/20 border-gray-300  flex-shrink-0
              transition-all duration-300
              hover:scale-105 hover:z-10 hover:border-purple-500/50 hover:shadow-purple-500/20"
                          >
                            <span className="text-xl sm:text-3xl md:text-5xl font-black font-mono tracking-tighter text-slate-800 dark:text-white leading-none">
                              {item.val.toString().padStart(2, '0')}
                            </span>
                            <span className="text-[7px] sm:text-[9px] md:text-[10px] uppercase text-purple-500 font-extrabold mt-1 sm:mt-2 md:mt-3 tracking-widest ">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                {/* Date Picker Bar */}
                    <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 shadow-xl relative mt-5" >
                      <button onClick={handlePrevDay} className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors">
                        <ChevronLeft size={18} />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                          className={`flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all ${isCalendarOpen ? 'bg-indigo-50 dark:bg-white/10' : 'hover:bg-slate-200 dark:hover:bg-white/10'} text-slate-700 dark:text-slate-200 `}
                        >
                          <Calendar size={16} className="text-indigo-600" />
                          <span className="text-[11px] sm:text-sm font-bold">
                            {new Date(targetDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                            <span className="hidden xs:inline ml-1">
                              {new Date(targetDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                        </button>

                        {/* --- Responsive Calendar (Optimized for Mobile) --- */}
{isCalendarOpen && (
  <div
    ref={calendarRef}
    className="

      fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]
      

      sm:absolute sm:top-auto sm:bottom-full sm:translate-y-0 sm:mb-2
      

      w-[92vw] max-w-[280px] sm:w-auto sm:max-w-none
      
      /* LAYOUT */
      flex flex-col sm:flex-row bg-white dark:bg-[#1e293b] 
      border border-slate-200 dark:border-white/10 rounded-3xl 
      shadow-2xl overflow-hidden 
      animate-in fade-in zoom-in-95 sm:slide-in-from-bottom-2 duration-200"
  >
    {/* Calendar Section: Phone par compact (119px area) aur desktop par p-6 */}
    <div className="p-3 sm:p-6 w-full sm:w-72 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-white/5">
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <div className="flex gap-2 text-slate-400">
          <ChevronUp size={14} className="cursor-pointer hover:text-indigo-500" onClick={handlePrevMonth} />
          <ChevronDown size={14} className="cursor-pointer hover:text-indigo-500" onClick={handleNextMonth} />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1 sm:mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <span key={d} className="text-[8px] sm:text-[9px] font-bold text-slate-400">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {[...Array(firstDayOfMonth)].map((_, i) => <div key={i} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const dayNum = i + 1;
          const isSelected = dayNum === selectedDate.getDate();
          return (
            <button
              key={dayNum}
              onClick={() => { const d = new Date(selectedDate); d.setDate(dayNum); updateTarget(d); }}
              className={`text-[10px] sm:text-xs font-bold h-6 w-6 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center transition-all 
                ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>

    {/* Timer Section: Phone par h-48 (Bada) aur desktop par auto/pehle jaisa */}
    <div className="flex h-48 sm:h-auto border-t sm:border-t-0 border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/5">
      <div className="flex-1 sm:w-16 flex flex-col border-r border-slate-100 dark:border-white/5">
        <div className="p-2 text-[9px] font-bold text-center text-slate-400 border-b border-slate-100 dark:border-white/5 uppercase">Hr</div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-2 flex flex-col gap-1 max-h-[160px] sm:max-h-[250px]">
          {[...Array(24)].map((_, h) => (
            <button key={h} onClick={() => { const d = new Date(selectedDate); d.setHours(h); updateTarget(d); }}
              className={`py-2 text-[11px] sm:text-[10px] font-bold rounded-lg transition-colors ${selectedDate.getHours() === h ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-indigo-50 dark:hover:bg-white/5'}`}>
              {String(h).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 sm:w-16 flex flex-col">
        <div className="p-2 text-[9px] font-bold text-center text-slate-400 border-b border-slate-100 dark:border-white/5 uppercase">Min</div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-2 flex flex-col gap-1 max-h-[160px] sm:max-h-[250px]">
          {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
            <button key={m} onClick={() => { const d = new Date(selectedDate); d.setMinutes(m); updateTarget(d); }}
              className={`py-2 text-[11px] sm:text-[10px] font-bold rounded-lg transition-colors ${selectedDate.getMinutes() === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-indigo-50 dark:hover:bg-white/5'}`}>
              {String(m).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
)}
                      </div>

                      <button onClick={handleNextDay} className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            {activeTab !== "countdown" && (
              <div className="flex justify-center items-center mt-8 relative z-20 w-full px-4">

                {/* 1. SPACER DIV (Left) */}

                <div className="w-16 h-16 mr-10 hidden sm:block invisible" aria-hidden="true" />

            
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`w-16 h-16 flex items-center justify-center rounded-full text-white shadow-xl transition-transform active:scale-95 ${isActive ? "bg-red-500" : "bg-purple-600"
                    }`}
                >
                  {isActive ? <Pause size={28} /> : <Play size={28} className="fill-current ml-1" />}
                </button>

                {/* 3. RESET BUTTON (Right) */}
                <button
                  onClick={resetAll}
                  className="ml-10 w-16 h-16 flex items-center justify-center border-2 dark:border-white/10 rounded-full transition-colors text-white bg-purple-600 active:scale-95 shadow-lg"
                >
                  <RotateCcw size={24} />
                </button>

              </div>
            )}
          </div>
        </main>

        {/* 4. Footer - Always at Bottom */}
        <footer className="w-full bg-white/10 dark:bg-[#0B1229] border-t border-slate-300 dark:border-white/10">
          <div className="w-full py-10 flex items-center justify-center text-center px-4">
            <p className="text-sm text-gray-500">
              © 2026 ChronoSync. Premium Global Time Utilities.
            </p>
          </div>
        </footer>
      </div>
    </PageWrapper>
  );
}