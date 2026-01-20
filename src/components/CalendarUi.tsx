import React, { useState, useEffect, useRef } from "react";
import { Calendar, Hash, ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
import PageWrapper from "./PageWrapper";

type ViewType = "2026" | "2027" | "2028" | "Weeks";

const GlobalCalendar: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>("2026");
  const [selectedMonths, setSelectedMonths] = useState<number[]>([new Date().getMonth()]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMonth = (idx: number) => {
    setSelectedMonths(prev => 
      prev.includes(idx) 
        ? (prev.length > 1 ? prev.filter(m => m !== idx) : prev) 
        : [...prev, idx].sort((a, b) => a - b)
    );
  };

  const handleMonthNav = (direction: 'prev' | 'next') => {
    setSelectedMonths(prev => {
      const referenceMonth = direction === 'next' ? prev[prev.length - 1] : prev[0];
      let newMonth = direction === 'next' ? referenceMonth + 1 : referenceMonth - 1;
      if (newMonth > 11) newMonth = 0;
      if (newMonth < 0) newMonth = 11;
      return [newMonth];
    });
  };

  const currentYear = activeView.startsWith("20") ? parseInt(activeView) : 2026;

  const getCalendarData = (year: number) => {
    return Array.from({ length: 12 }).map((_, monthIdx) => {
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
      const firstDay = new Date(year, monthIdx, 1).getDay();
      const name = new Date(year, monthIdx, 1).toLocaleString("default", { month: "long" }).toUpperCase();
      return { id: monthIdx + 1, name, days: daysInMonth, firstDay, monthIdx };
    });
  };

  const calendarMonths = getCalendarData(currentYear);

  return (
    <PageWrapper>
      <div className="min-h-screen w-full flex flex-col bg-[#E9EDFA] dark:bg-[#0B1220] text-slate-800 dark:text-white">
        <main className="flex-1 flex flex-col items-center py-8 sm:py-12 px-3 sm:px-4 md:px-6">

          {/* HEADER */}
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl  font-bold mb-2 tracking-tight">Global Calendar</h1>
            <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm">Yearly overviews and week number tracking.</p>
          </div>

          {/* TABS */}
          <div className="w-full max-w-5xl mx-auto mb-12">
            <div className="flex bg-[#bacaca] dark:bg-[#111827]/50 p-1.5 rounded-2xl md:rounded-full border border-slate-400 dark:border-white/10 backdrop-blur-md shadow-sm gap-2 md:gap-3 overflow-x-auto no-scrollbar">
              {(["2026", "2027", "2028", "Weeks"] as ViewType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveView(tab)}
                  className={`flex-1 min-w-max flex items-center justify-center gap-2 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-full text-[12px] md:text-[13px] font-bold transition-all
                    ${activeView === tab ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md" : "text-slate-500 dark:text-gray-400 hover:text-purple-500 hover:bg-gray-200 dark:hover:bg-white/5"}`}
                >
                  {tab.startsWith("20") ? <Calendar size={16} /> : <Hash size={16} />}
                  <span className="whitespace-nowrap">{tab.startsWith("20") ? `${tab} Calendar` : "Weeks (2026)"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CARD */}
          <div className="w-full max-w-6xl relative rounded-[3rem] border border-gray-200 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] overflow-hidden py-10 min-h-[600px] px-4 sm:px-10 shadow-xl transition-all duration-300">
            <div key={activeView} className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-500">
              
              <h3 className="text-center text-2xl sm:text-3xl font-bold dark:text-gray-300 text-gray-600 mb-6 tracking-tight">
                {activeView === "Weeks" ? "Weeks 2026" : `${currentYear} Yearly Overview`}
              </h3>

              {/* DROPDOWN FILTER (RIGHT ALIGNED) */}
              {activeView === "Weeks" && (
                <div className="flex justify-center md:justify-end mb-8 z-50">
                  <div className="flex items-center bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 p-1 rounded-2xl">
                    <button onClick={() => handleMonthNav('prev')} className="p-2 hover:bg-purple-500/10 rounded-xl text-slate-500"><ChevronLeft size={20} /></button>
                    
                    <div className="relative mx-1" ref={dropdownRef}>
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-xs shadow-md"
                      >
                        {selectedMonths.length === 1 ? monthNames[selectedMonths[0]] : `${selectedMonths.length} Months`}
                        <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute top-full mt-2 right-0 w-52 bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[100]">
                          <div className="max-h-60 overflow-y-auto scrollbar-hide">
                            {monthNames.map((month, idx) => (
                              <button 
                                key={month} 
                                onClick={() => toggleMonth(idx)} 
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold mb-1 transition-colors ${selectedMonths.includes(idx) ? "bg-purple-500/10 text-purple-600" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"}`}
                              >
                                {month}
                                {selectedMonths.includes(idx) && <Check size={14} />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button onClick={() => handleMonthNav('next')} className="p-2 hover:bg-purple-500/10 rounded-xl text-slate-500"><ChevronRight size={20} /></button>
                  </div>
                </div>
              )}

              {/* YEAR GRID */}
              {activeView.startsWith("20") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                  {calendarMonths.map((month) => (
                    <div key={month.name} className="bg-white/40 dark:bg-white/[0.03] p-5 rounded-[2rem] border border-purple-400 dark:border-white/10">
                      <h4 className="text-purple-600 dark:text-purple-400 font-black mb-4 tracking-widest text-[10px] uppercase">{month.name}</h4>
                      <div className="grid grid-cols-7 gap-1 text-[11px] text-center">
                        {[...Array(month.firstDay)].map((_, i) => <span key={i} />)}
                        {[...Array(month.days)].map((_, i) => {
                          const isToday = today.getDate() === i + 1 && today.getMonth() === month.monthIdx && today.getFullYear() === currentYear;
                          return (
                            <span key={i} className={`h-7 w-7 flex items-center justify-center rounded-xl font-bold ${isToday ? "bg-purple-600 text-white shadow-lg" : "text-slate-700 dark:text-gray-300"}`}>
                              {i + 1}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* WEEKS TABLE (ORIGINAL LOGIC MAINTAINED) */}
              {activeView === "Weeks" && (
                <div className="w-full max-w-5xl mx-auto rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] overflow-hidden shadow-xl">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-purple-600 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[10px] font-bold text-white uppercase f tracking-widest dark:text-slate-400">
                    <div className="col-span-3 sm:col-span-2 text-center">Week</div>
                    <div className="col-span-6 sm:col-span-6 text-left">Duration Period</div>
                    <div className="col-span-3 sm:col-span-4 text-right">Status</div>
                  </div>

                  <div className="overflow-y-auto max-h-[500px] scrollbar-hide px-4 py-3">
                    {[...Array(52)].map((_, i) => {
                      const weekNum = i + 1;
                      const start = new Date(2026, 0, 1 + i * 7);
                      const end = new Date(start);
                      end.setDate(start.getDate() + 6);

                      const isVisible = selectedMonths.includes(start.getMonth()) || selectedMonths.includes(end.getMonth());
                      if (!isVisible) return null;

                      const now = new Date();
                      const isPast = now > end;
                      const isCurrent = now >= start && now <= end;

                      return (
                        <div key={i} className={`grid grid-cols-12 gap-4 items-center px-4 py-3 my-1 rounded-xl transition-all duration-300 ${isCurrent ? "bg-purple-500/10 border border-purple-500/20 shadow-sm scale-[1.01]" : "border border-transparent hover:bg-slate-200 dark:hover:bg-white/5"}`}>
                          <div className="col-span-3 sm:col-span-2 flex justify-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold border border-gray-400 dark:border-white/10 ${isCurrent ? "bg-purple-600 text-white" : isPast ? "bg-white dark:bg-transparent" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                              {String(weekNum).padStart(2, '0')}
                            </div>
                          </div>
                          <div className="col-span-6 sm:col-span-6 flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${isCurrent ? "text-purple-600" : "text-slate-700 dark:text-slate-200"}`}>
                                {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              {isCurrent && <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />}
                            </div>
                            <span className="text-[9px] text-slate-400 uppercase font-medium">2026 Season</span>
                          </div>
                          
                          {/* PROGRESS BARS MAINTAINED */}
                          <div className="col-span-3 sm:col-span-4 flex flex-col items-end gap-1.5">
                             <div className="hidden sm:block w-20 h-1 bg-slate-300 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full ${isCurrent ? "bg-purple-500 w-1/2" : isPast ? "bg-purple-600 w-full" : "w-0"}`} />
                             </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isCurrent ? "text-purple-500" : isPast ? "text-purple-600" : "text-slate-400"}`}>
                              {isCurrent ? "Ongoing" : isPast ? "Done" : "Upcoming"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        <footer className="w-full bg-white/10 dark:bg-[#0B1229] border-t border-slate-300 dark:border-white/10 py-10 text-center text-sm text-gray-500">
          © 2026 ChronoSync. Premium Global Time Utilities.
        </footer>
      </div>
    </PageWrapper>
  );
};

export default GlobalCalendar;
