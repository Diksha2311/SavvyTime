
import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import PageWrapper from "./PageWrapper";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Play,
  Pause,
  Plus, Globe, Phone, Clock, Banknote,
  Languages, Search, X, ChevronUp, ChevronDown

} from "lucide-react";

interface City {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  offset: string;
  rawOffset?: number;
  coords: string;
  currency: string;
  language: string;
  dialing: string;
  iana: string;
  sunrise: string | undefined;
  sunset: string | undefined;
  image?: string;
  description?: string;
}

interface JsonCities {
  place_id: string | number;
  id?: string | number;
  display_name: string;
  name?: string;
  lat: number;
  lon: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  address: {
    country_code: string;
  };
  country_code?: string;
  searchText: string;
  country_name: string;
  country?: string;
}

/* ================= CITY DATA ================= */
const cities: City[] = [
  {
    id: "IST",
    city: "New Delhi",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    offset: "GMT+5:30",
    coords: "28.6139° N, 77.2090° E",
    currency: "Indian Rupee (INR)",
    language: "Hindi, English",
    dialing: "+91",
    iana: "Asia/Kolkata",
    sunrise: "06:23 AM",
    sunset: "06:45 PM",
    description:
      "India Standard Time (IST) is the standard time for New Delhi, India. This timezone does not observe daylight saving time.",
  },
];



/* ================= PAGE ================= */
export default function CityUi() {
  const location = useLocation();
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const [citiesList, setCitiesList] = useState(cities);
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<JsonCities[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedItems, setSelectedItems] = useState<JsonCities[]>([]);


  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [manualTime, setManualTime] = useState("");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [allCities, setAllCities] = useState<JsonCities[]>([]);



  const toggleSelection = (item: JsonCities) => {
    setSelectedItems(prev => {
      const exists = prev.some(
        s => s.place_id === item.place_id
      );

      if (exists) {

        return prev.filter(
          s => s.place_id !== item.place_id
        );
      }

      if (prev.length >= 3) {

        return prev;
      }
      return [...prev, item];
    });
  };





  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;


      const track = document.querySelector('.group\\/track');
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newProgress = Math.min(Math.max((x / rect.width) * 100, 0), 100);

      setProgress(newProgress);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);


  /* ===== Search API ===== */

  useEffect(() => {
    if (location.state && location.state.tempCity) {
      const newCity = location.state.tempCity;

      setCitiesList((prev) => {
        const isExist = prev.find((c) => c.id === newCity.id);
        if (!isExist) {
          const updatedList = [...prev, newCity];

          setSelectedCity(newCity);
          return updatedList;
        }
        return prev;
      });

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);


  const handleRemoveCity = (cityId: string) => {

    if (cityId === "IST") return;

    setCitiesList((prev) => {

      const updatedList = prev.filter((c) => c.id !== cityId);

      if (selectedCity.id === cityId) {
        setSelectedCity(updatedList[0] || cities[0]);
      }

      return updatedList;
    });
  };



  const fetchCitiesData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/cities.json");

      const data: JsonCities[] = await response.json();

      const formatted = data.map((city: JsonCities) => {

        const cityName = city.name || city.display_name || "Unknown City";

        return {
          place_id: city.id ?? city.place_id ?? `${cityName}-${city.latitude ?? city.lat}`,
          display_name: cityName,
          searchText: cityName.toLowerCase(),
          lat: city.latitude ?? city.lat ?? 0,
          lon: city.longitude ?? city.lon ?? 0,
          timezone: city.timezone ?? "UTC",
          country_name: city.country_name || city.country || "",
          address: {
            country_code: city.country_code ?? city.address?.country_code ?? "GL"
          }
        };
      });

      setAllCities(formatted);
      setSearchResults(formatted.slice(0, 5000));
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (!searchQuery) {
      setSearchResults(allCities.slice(0, 5000));
      return;
    }

    const timer = setTimeout(() => {
      const q = searchQuery.toLowerCase();

      const filtered = allCities.filter(city =>
        city.searchText.includes(q)
      );

      setSearchResults(filtered.slice(0, 5000));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, allCities]);


  const getTimezoneAbbr = (timezone: string): string => {

    const timezoneMap: Record<string, string> = {
      "Asia/Kolkata": "IST",
      "UTC": "UTC",
      "GMT": "GMT",
      "Etc/UTC": "UTC"
    };

    if (timezoneMap[timezone]) {
      return timezoneMap[timezone];
    }

    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
      }).formatToParts(new Date());

      const abbr = parts.find(p => p.type === 'timeZoneName')?.value;

      return abbr || "UTC";
    } catch {

      return "UTC";
    }
  };


  /* ===== LIVE TIME & PROGRESS ===== */
  useEffect(() => {
    if (isPaused) return;

    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      const totalSeconds = h * 3600 + m * 60 + s;
      const newProgress = (totalSeconds / 86400) * 100;

      setProgress(newProgress);
    };


    updateTime();

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);





  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCalendarOpen]);


  // ====================== Prev/Next Day ======================
  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 1);
    setSelectedDate(next);
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(selectedDate.getDate() - 1);
    setSelectedDate(prev);
  };

  // ====================== Days in Month ======================
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowTimeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const totalMinutes = (progress / 100) * 1440;
    let hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;

    setManualTime(`${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`);
  }, [progress]);

  const handleManualSubmit = (e: React.KeyboardEvent<HTMLInputElement> | { key: string; target?: EventTarget & { blur?: () => void } }) => {
    if (e.key === 'Enter') {
      let val = manualTime.toLowerCase().replace(/\s/g, '');

      // 1. AM/PM Check
      const hasPM = val.includes('pm');
      const hasAM = val.includes('am');
      val = val.replace('am', '').replace('pm', '');

      let h = NaN, m = 0;

      // 2. Parsing Logic
      if (val.includes(':')) {
        const parts = val.split(':');
        h = Number(parts[0]);
        m = Number(parts[1]);
      } else if (val.length > 0 && !isNaN(Number(val))) {
        if (val.length <= 2) {
          h = Number(val);
          m = 0;
        } else {
          h = Number(val.slice(0, val.length - 2));
          m = Number(val.slice(-2));
        }
      }

      const isCurrentlyPM = Math.round((progress / 100) * 1440) >= 720;
      const finalIsPM = hasPM ? true : (hasAM ? false : isCurrentlyPM);

      if (finalIsPM && h < 12) h += 12;
      if (!finalIsPM && h === 12) h = 0;

      // 3. Validation
      const isValid = !isNaN(h) && h >= 0 && h < 24 && !isNaN(m) && m >= 0 && m < 60;

      if (isValid) {
        setProgress(((h * 60 + m) / 1440) * 100);
        setIsPaused(true);
      } else {
        // --- WRONG INPUT CASE ---
        const now = new Date();
        const nowH = now.getHours();
        const nowM = now.getMinutes();


        setProgress(((nowH * 60 + nowM) / 1440) * 100);

        const formattedH = nowH % 12 || 12;
        const formattedM = String(nowM).padStart(2, '0');
        setManualTime(`${formattedH}:${formattedM}`);

        setIsPaused(false);
      }


      setShowTimeDropdown(false);


      const target = e.target as HTMLElement;

      if (target && typeof target.blur === 'function') {
        target.blur();
      }
    }
  };


  const toggleAMPM = () => {

    const currentTotalMins = Math.round((progress / 100) * 1440);


    const shift = currentTotalMins >= 720 ? -720 : 720;


    const newProgress = ((currentTotalMins + shift) / 1440) * 100;

    setProgress(newProgress);
    setIsPaused(true);
  };




  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };


  const handleYearChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setSelectedDate(newDate);
  };


  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-indigo-500 font-black underline decoration-2">{part}</span>
      ) : (
        part
      )
    );
  };


  const filteredSlots = useMemo<string[]>(() => {
    const allSlots: string[] = Array.from({ length: 48 }).map((_, i) => {
      const h = Math.floor(i / 2);
      const m = (i % 2) * 30;
      const date = new Date();
      date.setHours(h, m, 0);
      return date.toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', hour12: true
      }).toLowerCase();
    });

    if (!manualTime) return allSlots;

  
    const searchVal = manualTime.toLowerCase().replace(/[:\s]/g, '');

    return allSlots.filter((slot: string) => {
      const cleanSlot = slot.replace(/[:\s]/g, '');

      return cleanSlot.startsWith(searchVal) || cleanSlot.includes(searchVal);
    });
  }, [manualTime]);



  const handleAddSelected = async () => {
    setIsLoading(true);
    try {
      const newCitiesWithMeta = await Promise.all(
        selectedItems.map(async (item: JsonCities) => {
          const countryCode = (item.country_code || item.address?.country_code || "US").toUpperCase();
          let meta = { currency: "N/A", language: "N/A", dialing: "N/A", countryRealName: "" };

          try {
            const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
            const data = await res.json();
            const countryData = data?.[0];
            if (countryData) {
              const currencyEntry = countryData.currencies ? Object.entries(countryData.currencies)[0] : null;
              meta = {
                countryRealName: countryData.name?.common ?? "",
                currency: currencyEntry
                  ? `${(currencyEntry[1] as { name: string }).name} (${currencyEntry[0]})`
                  : "N/A",
                language: countryData.languages ? Object.values(countryData.languages).join(", ") : "N/A",
                dialing: countryData.idd?.root ? `${countryData.idd.root}${countryData.idd.suffixes?.[0] ?? ""}` : "N/A"
              };
            }
          } catch (e) { console.error("Metadata fetch error", e); }
          let sunData = { sunrise: "06:00 AM", sunset: "06:00 PM" };
          try {
            const lat = item.latitude || item.lat;
            const lon = item.longitude || item.lon;
            const sunRes = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`);
            const sunJson = await sunRes.json();

            if (sunJson.status === "OK") {
              const formatSunTime = (dateStr: string) => {
                return new Date(dateStr).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: item.timezone || "UTC"
                });
              };
              sunData = {
                sunrise: formatSunTime(sunJson.results.sunrise),
                sunset: formatSunTime(sunJson.results.sunset)
              };
            }
          } catch (e) { console.error("Sunrise API error", e); }

          // --- 3. Calculate Offset ---
          let offset = "GMT+00:00";
          try {
            if (item.timezone) {
              const parts = new Intl.DateTimeFormat("en-US", {
                timeZone: item.timezone,
                timeZoneName: "shortOffset",
              }).formatToParts(new Date());
              offset = parts.find(p => p.type === "timeZoneName")?.value ?? "GMT+00:00";
            }
          } catch (err) { console.error("Offset Error:", err); }


          return {
            id: String(item.id || item.place_id),
            city: (item.name || item.display_name?.split(",")[0] || "Unknown").trim(),
            country: meta.countryRealName || (item.display_name?.split(",").pop() || "Unknown").trim(),
            countryCode,
            timezone: item.timezone || "UTC",
            iana: item.timezone || "UTC",
            offset,
            coords: `${Number(item.latitude || item.lat || 0).toFixed(4)}° N, ${Number(item.longitude || item.lon || 0).toFixed(4)}° E`,
            currency: meta.currency,
            language: meta.language,
            dialing: meta.dialing,
            sunrise: sunData.sunrise,
            sunset: sunData.sunset,
            image: `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80`,
          };
        })
      );

      setCitiesList((prev) => [...prev, ...newCitiesWithMeta]);
    } catch (globalError) {
      console.error("Critical Error:", globalError);
    } finally {
      setIsLoading(false);
      setIsSearchOpen(false);
      setSelectedItems([]);
    }
  };


  return (
    <PageWrapper>
      <div className="min-h-screen w-full bg-[#E9EDFA] dark:bg-[#0B1220] text-slate-800 dark:text-white ov
      erflow-x-hidden ">

        {/* ================= MAIN ================= */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-12 py-6 sm:py-8 md:py-10 space-y-8 sm:space-y-10 md:space-y-14 ">


          {/* ================= HEADER SECTION ================= */}
          <div className="w-full flex flex-col items-center justify-center py-3  px-2 sm:px-4">
            <div className="text-center max-w-4xl mx-auto">

              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                <span>Global Time, </span>
                <span className="text-purple-400">Perfectly Aligned.</span>
              </h1>

              <p className="mt-2 sm:mt-4 text-[12px] sm:text-[14px] md:text-base lg:text-md dark:text-gray-400 text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Eliminate the complexity of global scheduling. Use our intelligent converter
                to bridge time zones, preview future meetings, and stay synchronized
                with markets worldwide in real-time.
              </p>

            </div>
          </div>


          <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl md:rounded-[32px] border border-slate-200 dark:border-white/10 bg-[#F8F9FD] dark:bg-[#0b0e22] text-slate-500 dark:text-[#717696] shadow-xl transition-all duration-300">

            {/* Parent Container Update */}
            <div className="flex flex-col  sm:flex-row md:flex-row lg:flex-row lg:justify-between items-center gap-4 sm:gap-2 mb-6">


              <div className="flex flex-col sm:flex-row items-center sm:gap-2 gap-4 w-full lg:w-auto justify-center lg:justify-start">
                <div className="flex flex-col items-center sm:items-start">
                  <h3 className="text-[13px] sm:text-[10px] font-black tracking-[0.2em] text-slate-500 dark:text-white/80 uppercase whitespace-nowrap">
                    Timeline & Overlap
                  </h3>

                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextState = !isPaused;
                    setIsPaused(nextState);
                    if (nextState === false) {
                      setSelectedDate(new Date());
                    }
                  }}
                  className={`group relative flex items-center gap-3 px-4 h-10 rounded-xl font-black text-[11px] tracking-[0.15em] transition-all duration-500 overflow-hidden shadow-md ${isPaused
                      ? "bg-white dark:bg-slate-400 text-rose-500 border border-rose-200 dark:border-rose-500/20"
                      : "dark:bg-emerald-900 bg-emerald-600 text-white border border-emerald-400 shadow-emerald-500/40"
                    }`}
                >
                  <span
                    className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity ${isPaused ? "bg-rose-100" : "bg-white"
                      }`}
                  ></span>

                  {isPaused ? (
                    <>
                      <div className="relative flex items-center justify-center w-5 h-5 bg-rose-50 dark:bg-rose-500/20 rounded-full">
                        <Pause size={12} fill="currentColor" />
                      </div>
                      <span className="relative">PAUSED</span>
                    </>
                  ) : (
                    <>
                      <div className="relative flex items-center justify-center w-5 h-5 bg-white/20 rounded-full">
                        <div className="absolute inset-0 bg-white rounded-full opacity-20 "></div>
                        <Play size={12} fill="currentColor" />
                      </div>
                      <span className="relative">LIVE</span>
                    </>
                  )}
                </button>
              </div>
              {/* RIGHT SIDE Container */}
              <div className="flex flex-col sm:flex-row md:flex-row items-center gap-3 sm:gap-2 w-full lg:w-auto justify-center ">
                <div
                  ref={dropdownRef}
                  className="flex items-center p-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm h-10 max-w-[140px] min-w-[120px] sm:w-40 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all relative cursor-pointer"
                >
                  <Clock size={18} className="text-slate-700 dark:text-slate-300 shrink-0" />

                  <input
                    type="text"
                    className="w-full bg-transparent text-center text-[13px] font-black text-slate-700 dark:text-slate-200 outline-none uppercase cursor-pointer placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    value={manualTime}
                    onChange={(e) => {

                      setIsPaused(true);

                      let val = e.target.value.replace(/[^0-9a-zA-Z]/g, '');

                      if (/^\d+$/.test(val)) {
                        if (val.length === 3) {
                          val = `${val[0]}:${val[1]}${val[2]}`;
                        } else if (val.length === 4) {
                          val = `${val.slice(0, val.length - 2)}:${val.slice(val.length - 2)}`;
                        }
                      }

                      setManualTime(val);
                      setShowTimeDropdown(val.length > 0);


                    }}
                    onFocus={() => {
                      setShowTimeDropdown(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleManualSubmit(e);
                        setShowTimeDropdown(false);
                      }
                    }}
                  />

                  <div className="flex flex-col border-l border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleAMPM(); setIsPaused(true); }}
                      className="hover:text-indigo-500 transition-colors"
                    >
                      <ChevronUp size={12} strokeWidth={4} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleAMPM(); setIsPaused(true); }}
                      className="hover:text-indigo-500 transition-colors"
                    >
                      <ChevronDown size={12} strokeWidth={4} />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {showTimeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-[100] no-scrollbar">
                      {filteredSlots.length > 0 ? (
                        filteredSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => {
                              setManualTime(slot);
                              setIsPaused(true);
                              handleManualSubmit({ key: 'Enter' } as React.KeyboardEvent);
                              setShowTimeDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-[11px] font-bold text-left uppercase hover:bg-indigo-600 hover:text-white transition-colors border-b border-slate-50 dark:border-white/5 last:border-0"
                          >
                            {getHighlightedText(slot, manualTime.replace(/\s/g, ''))}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-[10px] text-slate-700 dark:text-slate-400">No slots found</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center  rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 shadow-sm h-10 cu
                rsor-pointer">
                  <button onClick={handlePrevDay} className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300">
                    <ChevronLeft size={16} />
                  </button>

                  <div className="relative flex items-center gap-2 px-2 cursor-pointer">
                    <button
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className={`  ${isCalendarOpen ? " dark:text-white shadow-md shadow-indigo-500/30" : "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10"}`}
                    >
                      <Calendar size={14} />
                    </button>
                    <span
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className="text-[12px] font-black text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>


                    {isCalendarOpen && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-[105] bg-slate-950/40 sm:bg-transparent"
                          onClick={() => setIsCalendarOpen(false)}
                        />

                        <div
                          ref={calendarRef}
                          className="z-[110] animate-in fade-in zoom-in duration-200 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:translate-x-0 sm:translate-y-0 sm:mt-3 origin-top-right"
                        >
                          <div className="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[28px] shadow-2xl p-6 w-[300px] sm:w-80">

                            {/* --- Header: Savvy Time Integrated Logic --- */}
                            <div className="flex items-center justify-between mb-6 bg-slate-50 dark:bg-white/5 p-2 rounded-2xl border border-slate-100 dark:border-white/5">

                              {/* Previous Month Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMonthChange('prev'); }}
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl shadow-sm transition-all text-slate-500 hover:text-indigo-500"
                              >
                                <ChevronLeft size={20} />
                              </button>

                              {/* Central Month & Year Display */}
                              <div className="flex flex-col items-center flex-1">
                                <span className="text-[12px] font-black uppercase tracking-widest text-indigo-500">
                                  {selectedDate.toLocaleDateString("en-US", { month: "long" })}
                                </span>

                                <div className="flex items-center gap-4 mt-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleYearChange('prev'); }}
                                    className="text-[14px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                                  >
                                    «
                                  </button>
                                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                                    {selectedDate.getFullYear()}
                                  </span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleYearChange('next'); }}
                                    className="text-[14px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                                  >
                                    »
                                  </button>
                                </div>
                              </div>

                              {/* Next Month Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMonthChange('next'); }}
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl shadow-sm transition-all text-slate-500 hover:text-indigo-500"
                              >
                                <ChevronRight size={20} />
                              </button>
                            </div>

                            {/* --- Days Header --- */}
                            <div className="grid grid-cols-7 gap-2 text-center mb-3">
                              {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                                <span key={d} className="text-[10px] font-bold dark:text-slate-400 text-slate-700/80">
                                  {d}
                                </span>
                              ))}
                            </div>

                            {/* --- Days Grid --- */}
                            <div className="grid grid-cols-7 gap-1">
                              {[...Array(firstDayOfMonth)].map((_, i) => (
                                <div key={`empty-${i}`} className="h-9 w-9" />
                              ))}

                              {[...Array(daysInMonth)].map((_, i) => {
                                const day = i + 1;
                                const today = new Date();
                                const isToday = day === today.getDate() &&
                                  selectedDate.getMonth() === today.getMonth() &&
                                  selectedDate.getFullYear() === today.getFullYear();
                                const isSelected = day === selectedDate.getDate();

                                return (
                                  <button
                                    key={day}
                                    onClick={() => {
                                      const d = new Date(selectedDate);
                                      d.setDate(day);
                                      setSelectedDate(d);
                                      setIsCalendarOpen(false); 
                                    }}
                                    className={`
                  h-9 w-9 text-xs font-bold rounded-xl flex items-center justify-center transition-all duration-200
                  ${isSelected
                                        ? "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/40"
                                        : isToday
                                          ? "border-2 border-emerald-500 text-emerald-600"
                                          : "text-slate-600 dark:text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-500"
                                      }
                `}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button onClick={handleNextDay} className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300">
                    <ChevronRight size={16} />
                  </button>
                </div>

              </div>

            </div>


            <div className="flex justify-between text-[10px] sm:text-[11px] pl-0 sm:pl-[72px] pr-2 opacity-90 font-bold text-slate-500 dark:text-[#717696]">
              <span>00:00</span>
              <span className="hidden sm:inline">06:00</span>
              <span>12:00</span>
              <span className="hidden sm:inline">18:00</span>
              <span>23:00</span>
            </div>


            <div className="relative space-y-3 sm:space-y-4 ">
              {citiesList.map((city) => {
                const totalMinutes = (progress / 100) * 1440;
                const h = Math.floor(totalMinutes / 60);
                const m = Math.floor(totalMinutes % 60);
                const virtualDate = new Date();
                virtualDate.setHours(h, m, 0, 0);


                const getCityProgressInfo = (timezone: string, baseDate: Date) => {
                  try {
                    const formatter = new Intl.DateTimeFormat("en-US", {
                      timeZone: timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
                    });
                    const parts = formatter.formatToParts(baseDate);
                    const cityH = parseInt(parts.find(p => p.type === 'hour')?.value || "0");
                    const cityM = parseInt(parts.find(p => p.type === 'minute')?.value || "0");
                    const cityS = parseInt(parts.find(p => p.type === 'second')?.value || "0");
                    const progressPercent = ((cityH * 3600 + cityM * 60 + cityS) / 86400) * 100;

                    return {
                      percent: progressPercent,
                      displayTime: `${cityH.toString().padStart(2, '0')}:${cityM.toString().padStart(2, '0')}`,
                      currentHour: cityH,
                      isDay: cityH >= 6 && cityH < 18
                    };
                  } catch {
                    return { percent: 0, displayTime: "00:00", currentHour: 0, isDay: true };
                  }
                };

                const info = getCityProgressInfo(city.timezone, virtualDate);
                const Abbr = getTimezoneAbbr(city.timezone);


                return (
                  <div key={city.id} className="group flex items-center gap-3 sm:gap-4 py-2 ">
                    <div className="flex flex-col items-start justify-center gap-1.5 py-1">
                      {/* Abbreviation Section */}
                      <span className="text-[11px] font-black text-slate-700 dark:text-white/80 tracking-tighter leading-none uppercase">
                        {Abbr}
                      </span>

                      {/* City Name Section with Fixed Width */}
                      <span
                        className="
      inline-block 
      w-[55px]            
      truncate             
      text-[11px] font-black text-slate-700 dark:text-white/80 
      tracking-tighter leading-none 
      cursor-help
      hover:cursor-pointer
    "
        title={city.city}
                      >
                        {city.city}
                      </span>
                    </div>
                    <div className="hidden sm:flex relative flex-1 h-5 items-center group/track overflow-visible mb-1">

                      <div className="absolute inset-0 flex rounded-md overflow-hidden bg-slate-100 dark:bg-[#161a35] border border-slate-200 dark:border-transparent pointer-events-none">
                        {[...Array(24)].map((_, hour) => {
                          let bgColor = "bg-slate-400/80 dark:bg-[#1c2242]";
                          if (hour >= 6 && hour < 9) bgColor = "bg-indigo-300 dark:bg-[#242b57]";
                          if (hour >= 9 && hour < 18) bgColor = "bg-indigo-400 dark:bg-[#303975]";
                          if (hour >= 18 && hour < 21) bgColor = "bg-indigo-300 dark:bg-[#242b57]";
                          return (
                            <div key={hour} className={`flex-1 h-full border-r border-white/25 last:border-none ${bgColor} relative`}>
                              {hour === info.currentHour && (
                                <div className="absolute inset-0 bg-white/10 animate-pulse" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div
                        className="absolute z-40 pointer-events-none"
                        style={{
                          left: `${info.percent}%`,
                          transform: 'translateX(-50%)',
                          transition: isPaused ? 'none' : 'left 0.1s linear'
                        }}
                      >
                        <div className="h-8 w-[28px] bg-white dark:bg-white rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-slate-300 flex items-center justify-center">
                          <div className="flex gap-[3px]">
                            <div className="w-[1.5px] h-3.5 bg-slate-500 rounded-full" />
                            <div className="w-[1.5px] h-3.5 bg-slate-500 rounded-full" />
                          </div>
                        </div>
                      </div>

                      {/* 3. INVISIBLE INPUT: Full control ke liye */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.01"
                        value={info.percent}
                        onMouseDown={() => setIsPaused(true)}
                        onTouchStart={() => setIsPaused(true)}
                        onChange={(e) => {
                          const newLocalPercent = parseFloat(e.target.value);
                          const totalMinutes = (newLocalPercent / 100) * 1440;
                          const targetHours = Math.floor(totalMinutes / 60);
                          const targetMinutes = Math.floor(totalMinutes % 60);
                          const targetDate = new Date(selectedDate);
                          targetDate.setHours(targetHours, targetMinutes, 0, 0);
                          const formatter = new Intl.DateTimeFormat("en-US", {
                            timeZone: city.timezone,
                            year: 'numeric', month: 'numeric', day: 'numeric',
                            hour: 'numeric', minute: 'numeric', second: 'numeric',
                            hour12: false
                          });

                          const parts = formatter.formatToParts(targetDate);
                          const hour = parseInt(parts.find(p => p.type === 'hour')?.value || "0");
                          const minute = parseInt(parts.find(p => p.type === 'minute')?.value || "0");
                          const diffMinutes = (hour * 60 + minute) - (targetHours * 60 + targetMinutes);
                          const finalGlobalMinutes = (totalMinutes - diffMinutes + 1440) % 1440;

                          setProgress((finalGlobalMinutes / 1440) * 100);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-grab active:cursor-grabbing"
                      />
                    </div>
                  </div>
                );
              })}
            </div>


            {/* ================= CITY CARDS GRID ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {citiesList.map((city) => {
                const totalMinutes = (progress / 100) * 1440;
                const h = Math.floor(totalMinutes / 60);
                const m = Math.floor(totalMinutes % 60);
                const baseDate = new Date(selectedDate);
                baseDate.setHours(h, m, 0, 0);

                const getCityCardData = (timezone: string, inputDate: Date) => {
                  try {
                    const formatter = new Intl.DateTimeFormat("en-US", {
                      timeZone: timezone,
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    const parts = formatter.formatToParts(inputDate);
                    const timeValue = parts
                      .filter(p => ["hour", "minute", "literal", "dayPeriod"].includes(p.type))
                      .map(p => p.value)
                      .join("").trim();

                    const abbr = getTimezoneAbbr(timezone);

                    const hour24 = parseInt(
                      new Intl.DateTimeFormat("en-US", {
                        timeZone: timezone, hour: "numeric", hour12: false,
                      }).formatToParts(inputDate).find(p => p.type === 'hour')?.value || "0"
                    );

                    return {
                      fullTime: timeValue,
                      timezoneAbbr: abbr,
                      isDay: hour24 >= 6 && hour24 < 18,
                      date: inputDate.toLocaleDateString("en-US", {
                        weekday: 'short', month: 'short', day: 'numeric', timeZone: timezone
                      }),
                    };
                  } catch {
                    return { fullTime: "00:00 AM", timezoneAbbr: "UTC", isDay: true, date: "N/A" };
                  }
                };

                const cardInfo = getCityCardData(city.timezone, baseDate);
                const [timeValue, ampm] = cardInfo.fullTime.split(' ');
                const isPrimary = city.id === "IST";
                const isSelected = selectedCity?.id === city.id;

                return (
                  <div
                    key={city.id}
                    onClick={() => setSelectedCity(city)}
                    className={`group relative cursor-pointer p-6 rounded-[24px] border transition-all duration-500 flex flex-col justify-between overflow-hidden
          ${isSelected
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)] scale-[1.02]"
                        : "border-slate-200 bg-white dark:border-white/5 dark:bg-[#0f172a] hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1"
                      }`}
                    style={{ minHeight: "210px" }}
                  >
                    {/* Delete Button */}
                    {!isPrimary && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCity(city.id);
                        }}
                        className="absolute top-3 right-3 z-50 p-1 rounded-full text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 mt-[-5px] mr-[-5px]"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    )}

                    {/* Card Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col min-w-0">

                        <div className="flex items-center gap-2 mb-1">

                          <span className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 uppercase leading-none">
                            {cardInfo.timezoneAbbr}
                          </span>
                        </div>
                        <div className="relative group max-w-full">
                          <span
                            className="block truncate text-[14px] font-bold text-slate-600 dark:text-gray-300 cursor-pointer hover:text-blue-500 transition-colors"
                          >
                            ({city.country}) {city.city}
                          </span>

                          {/* Hover Custom Tooltip */}
                          <div className="absolute z-50 hidden group-hover:block 
                  bg-slate-800 text-white text-xs rounded-md p-2 mt-1 
                  whitespace-normal break-words max-w-[200px] sm:max-w-[300px] 
                  shadow-xl border border-slate-600 ring-1 ring-white/10">
                            {city.country},{city.city}
                          </div>
                        </div>

                      </div>

                      <div className={`p-2  rounded-xl shrink-0 ${cardInfo.isDay ? 'bg-amber-100 dark:bg-amber-500/10' : 'bg-indigo-100 dark:bg-indigo-500/10'}`}>
                        {cardInfo.isDay ? (
                          <Sun size={18} className="text-amber-500" />
                        ) : (
                          <Moon size={18} className="text-indigo-400 fill-indigo-400/20" />
                        )}
                      </div>
                    </div>

                    {/* Time & Local Date Display */}
                    <div className="mt-4">
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {timeValue}
                        <span className="text-xs ml-2 font-bold text-slate-500 uppercase tracking-widest">{ampm}</span>
                      </h2>
                      <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-[0.2em]">
                        {cardInfo.date}
                      </p>
                    </div>

                    {/* Primary Badge */}
                    <div className="flex items-center justify-end mt-4">
                      {isPrimary && (
                        <span className="bg-indigo-600 text-[8px] font-black text-white px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* ADD CITY TRIGGER */}
              <div
                onClick={() => {
                  setIsSearchOpen(true); // Modal kholo
                  fetchCitiesData();
                }}
                className="h-[210px] group cursor-pointer flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-slate-400 ..."
              >
                {/* Plus Icon UI */}
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 flex items-center justify-center mb-3 group-hover:scale-110 ...">
                  <Plus size={24} />
                </div>
                <p className="font-bold text-[10px] uppercase tracking-[0.2em]">timezone or cities</p>
              </div>
            </div>

            {/* ================= SEARCH MODAL ================= */}
            {isSearchOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-slate-900/60"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                    setSearchResults([]);
                    setSelectedItems([]);
                  }}
                />

                <div className="relative w-full max-w-md bg-white dark:bg-[#0f172a] rounded-[32px] shadow-2xl flex flex-col h-[80vh] overflow-hidden">

                  {/* Fixed Search Header */}
                  <div className="flex-shrink-0 p-6 border-b border-slate-50 dark:border-white/5 bg-white dark:bg-[#0f172a] z-20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black dark:text-white">Select Location</h3>
                      <span className="mr-[150px] mt-1 dark:text-white/50 text-gray-500">(Max 3)</span>

                      <button onClick={() => setIsSearchOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                    </div>
                    {/* Search Input Area */}
                    <div className="relative group">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        className="w-full bg-slate-100 dark:bg-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold dark:text-white outline-none"
                        placeholder="Search..... "
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedItems.map((city) => (
                        <div
                          key={city.place_id}
                          className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all animate-in fade-in zoom-in duration-200"
                        >
                          <span>{city.display_name.split(',')[0]}</span>
                          <button
                            onClick={() => toggleSelection(city)}
                            className="hover:text-indigo-200 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MAIN SCROLLABLE AREA */}
                  <div className="flex-1 min-h-0 relative">
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-3 sm:p-4">
                      {isLoading && searchResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3 sm:mb-4" />
                          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Cities...</p>
                        </div>
                      ) : (
                        <div className="grid gap-1">
                          {searchResults.map((city) => {
                            const isChecked = selectedItems.some(
                              s => s.place_id === city.place_id
                            );

                            const isDisabled =
                              selectedItems.length >= 3 && !isChecked;

                            return (
                              <div
                                key={city.place_id}
                                onClick={() => !isDisabled && toggleSelection(city)}
                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all
        ${isChecked ? "bg-indigo-500/10 border border-indigo-500/20" : ""}
        ${isDisabled ? "opacity-40 pointer-events-none" : ""}
      `}
                              >
                         
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  readOnly
                                  className="w-4 h-4 accent-indigo-500"
                                />

                                {/* City name */}
                                <span className="dark:text-white font-bold text-[12px]">
                                  {city.display_name}
                                </span>
                              </div>
                            );
                          })}

                          {/* 3. "No Results" State */}
                          {!isLoading && searchQuery &&
                            !searchResults.some(c => c.display_name.toLowerCase().includes(searchQuery.toLowerCase())) && (
                              <div className="text-center py-10 opacity-50 text-[11px] font-bold dark:text-white uppercase tracking-widest">
                                No matching cities found
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Replace the button at the bottom of your search modal */}
                  <div className="p-3 sm:p-4 bg-white dark:bg-[#0f172a] border-t border-slate-50 dark:border-white/5">
                    <button
                      disabled={selectedItems.length === 0}
                      onClick={() => {
                        handleAddSelected();
                        setSearchQuery("");
                      }}
                      className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2 ${selectedItems.length > 0
                        ? "bg-indigo-500 text-white shadow-indigo-500/25 active:scale-95 cursor-pointer"
                        : "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                      <Plus size={14} className="sm:w-[16px] sm:h-[16px]" />
                      Add {selectedItems.length} {selectedItems.length === 1 ? 'Location' : 'Locations'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= DETAILS PANEL ================= */}
          {selectedCity && (
            <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 bg-[#FDFDFE] dark:bg-[#0B1224] text-slate-900 dark:text-white overflow-hidden shadow-xl transition-all duration-300 ">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">


                <div className="lg:col-span-2 flex flex-col">

                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MapPin size={18} className="sm:w-[20px] sm:h-[20px] md:w-6 md:h-6 text-red-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                      <div>
                        <h3 className="text-[16px] sm:text-[15px] font-black tracking-[0.25em] text-slate-500 dark:text-white/80 uppercase ">
                          Location Details
                        </h3>
                        <h2 className="text-[14x] font-semibold ">
                          {selectedCity.city}
                          <span className=" text-[14px] text-blue-600  dark:text-blue-300 ml-2">
                            {selectedCity.country}
                          </span>
                        </h2>
                      </div>
                    </div>

                  </div>


                  <div className="grid lg:grid-cols-3 grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Main Stats Grid Items */}
                    {[
                      { label: "Offset", value: selectedCity.offset ?? "—", icon: <Clock size={12} className="text-slate-500" /> },
                      { label: "Coords", value: selectedCity.coords ?? "—", icon: <MapPin size={12} className="text-slate-500" /> },
                      { label: "Currency", value: selectedCity.currency ?? "—", icon: <Banknote size={12} className="text-slate-500" /> },
                      { label: "Language", value: selectedCity.language ?? "—", icon: <Languages size={12} className="text-slate-500" /> },
                      { label: "Dialing", value: selectedCity.dialing ?? "—", icon: <Phone size={12} className="text-slate-500" /> },
                      { label: "ID", value: selectedCity.iana ?? selectedCity.timezone, icon: <Globe size={12} className="text-slate-500" /> },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-3 transition-all hover:border-indigo-500/40">
                        <div className="flex items-center gap-2 mb-1">
                          {icon}
                          <p className="text-[10px] text-slate-500 dark:text-blue-300 uppercase font-black tracking-widest leading-none">{label}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{value}</p>
                      </div>
                    ))}

                    {/* Sunrise / Sunset Section - Mirrored Grid for Precise Alignment */}
                    {(selectedCity.sunrise || selectedCity.sunset) && (
                      <div className="col-span-full mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-1">

                        {/* Column 1: Sunrise (Aligned below Offset/Language) */}
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[10px] text-slate-500 dark:text-blue-300 uppercase font-black tracking-widest pl-0.5">
                            Sunrise
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 dark:bg-amber-500/5 rounded-lg">
                              <Sunrise size={20} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                            </div>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">
                              {selectedCity.sunrise ?? "—"}
                            </p>
                          </div>
                        </div>

                        {/* Column 2: Sunset (Aligned below Coords/Dialing) */}
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[10px] text-slate-500 dark:text-blue-300 uppercase font-black tracking-widest pl-0.5">
                            Sunset
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-lg">
                              <Sunset size={20} className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
                            </div>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">
                              {selectedCity.sunset ?? "—"}
                            </p>
                          </div>
                        </div>

                        {/* Column 3: Empty (Keeps the grid structure intact) */}
                        <div className="hidden lg:block"></div>

                      </div>
                    )}
                  </div>

                  {/* Description: Pushes to bottom if space allows */}
                  {selectedCity.description && (
                    <div className=" mt-6 pt-3 sm:pt-4">
                      <div className="w-full border-t border-slate-300 dark:border-white/10 mb-3 sm:mb-4" />
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-blue-200 leading-relaxed italic">
                        {selectedCity.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* --- RIGHT SIDE: IMAGE (Col 3) --- */}
                <div className="lg:col-span-1 min-h-[300px] sm:min-h-[300px]">
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 h-full shadow-lg group">
                    <img
                      src={selectedCity.image ?? "https://images.unsplash.com/photo-1587474260584-136574528ed5"}
                      alt={selectedCity.city}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 p-4 sm:p-6">
                      <p className="text-[9px] sm:text-[10px] uppercase text-white/70 tracking-[0.2em] font-bold mb-0.5 sm:mb-1">Location View</p>
                      <p className="font-bold text-lg sm:text-xl text-white tracking-tight">{selectedCity.city}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </main>




        {/* ================= FOOTER ================= */}
        <footer
          className="
    mt-8 sm:mt-10
    dark:bg-[#0B1229] 
   border-t border-slate-300 dark:border-white/10"
        >
          <div
            className="
      max-w-7xl
      mx-auto
      px-3 sm:px-4 md:px-6 lg:px-12
      py-6 sm:py-8 md:py-10
      flex
      flex-col
      items-center    
      justify-center  
      text-center     
      gap-3 sm:gap-4
      text-xs sm:text-sm
      text-[rgb(var(--text-muted))]
      md:flex-row  
    "
          >
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                © 2026 ChronoSync. Premium Global Time Utilities.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </PageWrapper>
  );
}




