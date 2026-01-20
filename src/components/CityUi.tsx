import { useState, useEffect,useRef } from "react";
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
  Plus,Globe,Phone,Clock,Banknote,
  Languages,Search,X

} from "lucide-react";


interface CityRowItemProps {
  item: City | NominatimPlace;
  isChecked: boolean;
  toggleSelection: (city: City | NominatimPlace) => void;
}



interface NominatimPlace {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  country?: string;
  country_code?: string;
  address?: {
    city?: string;
    town?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}


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



type CityItem = City | NominatimPlace;

interface CityItemRowProps {
  item: CityItem;
  onClick: () => void;
}


const CityItemRow = ({ item, onClick }: CityItemRowProps) => {
  const isNominatim = "place_id" in item;

  const cityName = isNominatim
    ? item.display_name?.split(",")[0] || "Unknown City"
    : item.city;

  const countryName = isNominatim
    ? item.address?.country || "Global"
    : item.country;

  const countryCode = isNominatim
    ? (item.address?.country_code || "loc").toUpperCase()
    : item.countryCode.toUpperCase();

  return (
    <div
      onClick={onClick}
      className="group flex items-center justify-between cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-gray uppercase">
          {countryCode.substring(0, 2)}
        </div>

        <div className="flex flex-col">
          <span className="font-bold text-[14px] dark:text-white group-hover:text-gray leading-none mb-1">
            {cityName}
          </span>
          <span className="text-[10px] text-slate-400 group-hover:text-indigo font-medium">
            {countryName}
          </span>
        </div>
      </div>
    </div>
  );
};


/* ================= PAGE ================= */
export default function CityUi() {
  const location = useLocation();
  const [isPaused, setIsPaused] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [progress, setProgress] = useState(0);

  const [citiesList, setCitiesList] = useState(cities);
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState<NominatimPlace[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [isDragging, setIsDragging] = useState(false);
const [selectedItems, setSelectedItems] = useState<NominatimPlace[]>([]);

const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // const [liveTime, setLiveTime] = useState(new Date());

const toggleSelection = (item: City | NominatimPlace) => {
  // Only handle NominatimPlace items in search results
  if (!("place_id" in item)) return;
  
  const isAlreadySelected = selectedItems.some(s => s.place_id === item.place_id);
  
  if (isAlreadySelected) {

    setSelectedItems(prev => prev.filter(s => s.place_id !== item.place_id));
  } 
  else if (selectedItems.length >= 3) {

    console.log("Maximum 3 cities allowed");
  } 
  else {
    setSelectedItems(prev => [...prev, item]);
  }
};

const handleAddSelected = () => {
  if (selectedItems.length === 0) return;


  selectedItems.forEach(item => {

    handleSearchSelection(item); 
  });

  setSelectedItems([]);
  setIsSearchOpen(false);
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

  if (!isSearchOpen) return;

  const fetchCities = async () => {
    const query =
      searchQuery.trim().length >= 2
        ? searchQuery
        : "cities";

    setIsLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=100&featuretype=city`,
        {
          headers: {
            "User-Agent": "ChronoSync/1.0",
          },
        }
      );

      const data = await res.json();
      setSearchResults(data);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const timer = setTimeout(fetchCities, 400);
  return () => clearTimeout(timer);

}, [searchQuery, isSearchOpen]);


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





  const formatGMT = (offsetSeconds: number) => {
  const totalMinutes = Math.abs(offsetSeconds) / 60;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const sign = offsetSeconds >= 0 ? "+" : "-";
  return `GMT${sign}${h}:${m.toString().padStart(2, "0")}`;
};


const handleSearchSelection = async (item: NominatimPlace) => {
  setIsLoading(true);
  try {
    let lat = item.lat;
    let lon = item.lon;
    const cityName = item.name || item.address?.city || item.display_name?.split(',')[0];
let countryCode = (item.country_code || item.address?.country_code)?.toUpperCase();


    if (!lat || !lon) {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(cityName)}&format=json&addressdetails=1&limit=1`
      );
      const geoData = await geoRes.json();
      if (geoData.length > 0) {
        lat = geoData[0].lat;
        lon = geoData[0].lon;
        if (!countryCode) countryCode = geoData[0].address?.country_code?.toUpperCase();
      } else {
        throw new Error("Location not found");
      }
    }

    // FIX 2: Country Details Fetching Logic
    let cInfo = null;
    if (countryCode) {
      try {
        const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const countryData = await countryRes.json();
        if (countryData && countryData.length > 0) {
          cInfo = countryData[0];
        }
      } catch (err) {
        console.error("RestCountries API Error:", err);
      }
    }

    // 1. Fetch Solar & Timezone Data
    const dateStr = currentDate.toISOString().split('T')[0];
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`
    );
    const weatherData = await weatherRes.json();
    const actualTimezone = weatherData.timezone;

    const formatSunTime = (isoString: string) => {
      if (!isoString) return "N/A";
      return new Date(isoString).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", hour12: true, timeZone: actualTimezone 
      });
    };

    
    // 3. Construct Full City Object
    const newCity: City = {
      id: cityName.toUpperCase().slice(0, 3) + Math.floor(Math.random() * 100),
      city: cityName,
      country: cInfo?.name?.common || item.country || "Unknown",
     countryCode: countryCode ?? cInfo?.cca2 ?? "UN",

      timezone: actualTimezone,
      offset: formatGMT(weatherData.utc_offset_seconds), 
      rawOffset: weatherData.utc_offset_seconds / 3600,
      coords: `${parseFloat(lat).toFixed(2)}° N, ${parseFloat(lon).toFixed(2)}° E`,
      currency: cInfo?.currencies ? Object.keys(cInfo.currencies)[0] : "USD",
      language: cInfo?.languages ? Object.values(cInfo.languages).join(", ") : "English",
      
      // FIX 3: Dialing Code construction with safety
      dialing: cInfo?.idd?.root 
        ? (cInfo.idd.root + (cInfo.idd.suffixes?.[0] || "")) 
        : "N/A",

      iana: actualTimezone,
      sunrise: formatSunTime(weatherData.daily?.sunrise?.[0]),
      sunset: formatSunTime(weatherData.daily?.sunset?.[0]),
      image: `https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&sig=${cityName}`,
      description: `${cityName} is a beautiful city in ${cInfo?.name?.common || 'the world'}.`
    };

    setCitiesList((prev) => {
      const isExist = prev.some(c => c.city.toLowerCase() === newCity.city.toLowerCase() && c.country === newCity.country);
      if (!isExist) {
        return [...prev, newCity];
      }
      return prev;
    });
    setSelectedCity(newCity);
    
  } catch (error) {
    console.error("Selection Error:", error);
  } finally {
    setIsLoading(false);
    setIsSearchOpen(false);
    setSearchQuery("");
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
    setCurrentDate(now);
  };

  const interval = setInterval(updateTime, 1000);
  return () => clearInterval(interval);
}, [isPaused]);



useEffect(() => {
  const fetchInitialCities = async () => {
    setIsLoading(true);
    try {

      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=capital&limit=50&addressdetails=1`);
      const data = await response.json();    
      setSearchResults(data);   
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchInitialCities();
}, []);

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

  const CityRowItem = ({ item, isChecked, toggleSelection }: CityRowItemProps) => (
  <div 
    onClick={() => toggleSelection(item)}
    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 mb-1 ${
      isChecked 
        ? "bg-indigo-500/10 border-indigo-500/40 shadow-sm" 
        : "hover:bg-slate-50/50 dark:hover:bg-white/5 border-transparent"
    }`}
  >
    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
      isChecked ? "bg-indigo-500 border-indigo-500" : "border-slate-300 dark:border-white/10"
    }`}>
      {isChecked && (
         <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
         </svg>
      )}
    </div>
    
    <div className="flex-1 overflow-hidden [&>div]:bg-transparent [&>div]:p-0">
       <CityItemRow item={item} onClick={() => {}} /> 
    </div>
  </div>
);


  
  return (
    <PageWrapper>
    <div className="min-h-screen w-full bg-[#E9EDFA] dark:bg-[#0B1220] text-slate-800 dark:text-white">

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-12 py-6 sm:py-8 md:py-10 space-y-8 sm:space-y-10 md:space-y-14">

     
      

        {/* ================= HEADER SECTION ================= */}
<div className="w-full flex flex-col items-center justify-center py-3 sm:py-5 px-2 sm:px-4">
 <div className="text-center max-w-5xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="block">Global Time,</span>
              <span className="block text-purple-400 mt-1 sm:mt-2">Perfectly Aligned.</span>
            </h1>
            <p className="mt-3 sm:mt-6 text-sm sm:text-base md:text-lg lg:text-xl dark:text-gray-400 text-gray-600">
            liminate the complexity of global scheduling. Use our intelligent converter to bridge time zones, preview future meetings, and stay synchronized with markets worldwide in real-time.
            </p>
          </div>
</div>




{/* ================= DATE SELECTOR ================= */}
<div className="flex justify-end items-center relative z-[100] pr-2 sm:pr-0"> 
  <div className="flex items-center p-1 sm:p-1.5 gap-1 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 shadow-xl">
    
    {/* Prev Button - Larger tap target for mobile */}
    <button 
      onClick={(e) => { e.stopPropagation(); handlePrevDay(); }} 
      className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 shrink-0"
    >
      <ChevronLeft size={18} className="sm:w-[20px] sm:h-[20px]" />
    </button>

    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all ${
          isCalendarOpen ? 'bg-indigo-50 dark:bg-white/10' : 'hover:bg-slate-200 dark:hover:bg-white/5'
        }`}
      >
        <div className="p-1 rounded-lg text-indigo-600 shrink-0">
          <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
        </div>
        
        {/* Date Text: Hidden on very small screens, shown as short on mobile, full on desktop */}
        <div className="flex flex-col items-start text-left">
          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            <span className="xs:inline hidden sm:hidden">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="hidden sm:inline">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </span>
        </div>
      </button>

      {/* Responsive Calendar Dropdown */}
   {isCalendarOpen && (
  <>
    {/* Mobile Backdrop: Optional, helps close on tap away */}
    <div 
      className="fixed inset-0 z-[105] bg-black/20 sm:hidden" 
      onClick={() => setIsCalendarOpen(false)} 
    />

    <div
      ref={calendarRef}
      className={`
        /* Mobile: Fixed at the top/center of screen */
        fixed left-1/2 -translate-x-1/2 top-20 
        /* Desktop: Absolute below the button */
        sm:absolute sm:left-auto sm:right-0 sm:translate-x-0 sm:top-full 
        mt-3 z-[110] animate-in fade-in zoom-in duration-200 origin-top
      `}
    >
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-[28px] shadow-2xl p-4 sm:p-6 w-[calc(100vw-32px)] max-w-[320px] sm:w-80">
        
        <div className="flex items-center justify-between mb-4 sm:mb-5 px-1">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-indigo-500">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <span key={i} className="text-[10px] sm:text-[11px] font-bold text-slate-400 py-1">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <div key={`empty-${i}`} className="h-9 w-9" />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const dayNum = i + 1;
            const isSelected = dayNum === selectedDate.getDate();
            return (
              <button 
                key={dayNum} 
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(dayNum);
                  setSelectedDate(newDate);
                  setIsCalendarOpen(false);
                }}
                className={`text-xs font-bold h-9 w-9 rounded-xl transition-all flex items-center justify-center
                ${isSelected 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </>
)}
    </div>

    {/* Next Button */}
    <button 
      onClick={(e) => { e.stopPropagation(); handleNextDay(); }} 
      className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 shrink-0"
    >
      <ChevronRight size={18} className="sm:w-[20px] sm:h-[20px]" />
    </button>
  </div>
</div>



       {/* ================= TIMELINE & OVERLAP ================= */}

<div className="p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl md:rounded-[32px] border border-slate-200 dark:border-white/10 bg-[#F8F9FD] dark:bg-[#0b0e22] text-slate-500 dark:text-[#717696] shadow-xl transition-all duration-300">
  
  {/* --- Top Slider Section --- */}
  <div className="max-w-7xl mx-auto mb-6 sm:mb-10">
    <div className="mr-6 sm:mr-10 ml-6 sm:ml-10 flex justify-between text-[11px] sm:text-[13px] font-bold px-1 tracking-widest opacity-60 text-slate-800 dark:text-[#AFBACC]">
      <span>00:00</span>
      <span>12:00</span>
      <span>23:59</span>
    </div>

 
    <div className="mt-6 sm:mt-10 relative h-1 sm:h-1.5 group mr-6 sm:mr-10 ml-6 sm:ml-10">
   
      <div className="absolute inset-0 flex justify-between items-center pointer-events-none px-1">
        {[...Array(13)].map((_, i) => (
          <div key={i} className="w-[1px] h-2 sm:h-3 bg-slate-500 dark:bg-white/40" />
        ))}
      </div>
      <div className="absolute inset-0 bg-slate-200 dark:bg-white/10 rounded-full" />
      
  
      <div 
        className="absolute h-full bg-[#D8DFF6] dark:bg-white/20 rounded-full pointer-events-none"
        style={{ width: `${progress}%` }}
      />

      <input
        type="range" min="0" max="100" step="0.1" value={progress}
        onChange={(e) => setProgress(parseFloat(e.target.value))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
      />

      <div
        className="absolute top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 bg-[#6366F1] rounded-full shadow-lg dark:shadow-[0_0_20px_rgba(99,102,241,0.8)] border-[2px] sm:border-[3px] border-white dark:border-[#0b0e22] pointer-events-none transition-all duration-300"
        style={{ left: `calc(${progress}% - 12px)` }}
      />
    </div>

    {/* Live Clock Button */}
    <div className="flex justify-center mt-6 sm:mt-10">
  <button
    onClick={() => setIsPaused(!isPaused)}
    className={`
      flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full 
      text-[9px] sm:text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500
      border shadow-sm group
      ${isPaused
        ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/60 border-slate-200 dark:border-white/10"
        : "bg-emerald-50 dark:bg-[#10b981]/10 text-emerald-600 dark:text-[#10b981] border-emerald-200 dark:border-[#10b981]/30"
      }
    `}
  >
    {isPaused ? (
      <div className="relative flex items-center justify-center">
        <Play size={10} className="sm:w-[12px] sm:h-[12px] ml-0.5" fill="currentColor" />
      </div>
    ) : (
     
      <div className="relative flex items-center justify-center">

        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20"></span>
        <Pause size={12} className="relative z-10 sm:w-[14px] sm:h-[14px]" />
      </div>
    )}
    
    <span className="relative">
      {isPaused ? "Paused" : "Live Clock"}
    </span>
  </button>
</div>
  </div>
  {/* ================= DIVIDER ================= */}
<div className="relative py-3 sm:py-4">
  <div className="absolute inset-0 flex items-center" aria-hidden="true">
    <div className="w-full border-t border-slate-300 dark:border-white/10"></div>
  </div>
</div>

  {/* --- Timeline Header --- */}
  <div className="flex items-center gap-2 mb-6 sm:mb-8 mt-4 sm:mt-6">
    <h3 className="text-[11px] sm:text-[13px] font-black tracking-[0.25em] text-slate-500 dark:text-white/80 uppercase">
      Timeline & Overlap
    </h3>
  </div>

  {/* Time Labels for Rows */}
{/* Time Labels for Rows - Hidden on Mobile */}
<div className="hidden sm:flex justify-between text-[10px] sm:text-[11px] px-1 sm:pl-[72px] sm:pr-2 opacity-90 font-bold mb-2 sm:mb-4 text-slate-600 dark:text-[#717696]">
  <span>00:00</span>
  <span className="hidden xs:inline">06:00</span>
  <span>12:00</span>
  <span className="hidden xs:inline">18:00</span>
  <span>23:00</span>
</div>

<div className="relative space-y-3 sm:space-y-4">
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

    return (
      <div key={city.id} className="group flex items-center gap-3 sm:gap-6">
        {/* Mobile: Combined ID and Time | Desktop: Just ID */}
        <div className="flex flex-1 sm:flex-none sm:w-12 justify-between items-center sm:block">
          <span className="text-[11px] sm:text-[11px] font-black text-slate-700 dark:text-white/80 tracking-tighter shrink-0">
            {city.id}
          </span>
          {/* Only visible on Phone */}
          <span className="sm:hidden font-mono font-bold text-[12px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
            {info.displayTime}
          </span>
        </div>

        {/* Timeline Track - Hidden on Mobile */}
        <div className="hidden sm:flex relative flex-1 h-11 rounded-md overflow-hidden bg-slate-100 dark:bg-[#161a35] border border-slate-200 dark:border-transparent group/track">
          <input
            type="range"
            min="0"
            max="100"
            step="0.01"
            value={info.percent}
            onMouseDown={() => setIsPaused(true)} 
            onMouseUp={() => setIsPaused(false)}  
            onChange={(e) => setProgress(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-grab active:cursor-grabbing"
          />

          {/* Existing Visual Thumb */}
          <div 
            className="absolute z-30 flex flex-col items-center pointer-events-none"
            style={{ 
              left: `${info.percent}%`,
              top: '50%', 
              transform: 'translate(-50%, -50%)', 
              transition: isPaused ? 'none' : 'left 0.1s linear' 
            }}
          >
            <div className="relative h-10 w-[24px] bg-white/70 dark:bg-gray-800 backdrop-blur-xl rounded-full shadow-sm border border-slate-200 dark:border-white/20 flex flex-col items-center justify-between py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/80 dark:bg-indigo-300/80" />
              <div className="flex flex-col gap-0.5">
                <div className="w-[3px] h-[3px] rounded-full bg-indigo-500 dark:bg-indigo-300" />
                <div className="w-[3px] h-[3px] rounded-full bg-indigo-500 dark:bg-indigo-300" />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/80 dark:bg-indigo-300/80" />
            </div>
          </div>

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
      </div>
    );
  })}
</div>

{/* Legend - Hidden on Mobile */}
<div className="hidden sm:flex flex-wrap justify-center gap-6 md:gap-10 mt-12 text-[9px] font-black tracking-[0.15em] uppercase text-slate-500 dark:text-white/40">
  <div className="flex items-center gap-2.5">
    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 dark:bg-[#303975] border border-slate-300 dark:border-white/10" /> 
    BUSINESS HOURS
  </div>
  <div className="flex items-center gap-2.5">
    <div className="w-2.5 h-2.5 rounded-full bg-indigo-300 dark:bg-[#242b57] border border-slate-300 dark:border-white/10" /> 
    TRANSITION / DAY
  </div>
  <div className="flex items-center gap-2.5">
    <div className="w-2.5 h-2.5 rounded-full bg-slate-400/80 dark:bg-[#1c2242] border border-slate-300 dark:border-white/10" /> 
    NIGHT
  </div>
</div>


{/* ================= CITY CARDS GRID ================= */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-10">
  {citiesList.map((city) => {
    const totalMinutes = (progress / 100) * 1440;
    const h = Math.floor(totalMinutes / 60);
    const m = Math.floor(totalMinutes % 60);
    const virtualDate = new Date(currentDate);
    virtualDate.setHours(h, m, 0, 0);

    const getCityCardData = (timezone: string, baseDate: Date) => {
      try {
        const timeFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: true,
        });
        const hourParts = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone, hour: "numeric", hour12: false,
        }).formatToParts(baseDate);
        const hour24 = parseInt(hourParts.find(p => p.type === 'hour')?.value || "0");
        return {
          fullTime: timeFormatter.format(baseDate),
          isDay: hour24 >= 6 && hour24 < 18,
          date: baseDate.toLocaleDateString("en-US", { 
            weekday: 'short', month: 'short', day: 'numeric', timeZone: timezone 
          })
        };
      } catch  {
        return { fullTime: "00:00 AM", isDay: true, date: "N/A" };
      }
    };

    const cardInfo = getCityCardData(city.timezone, virtualDate);
    const [timeValue, ampm] = cardInfo.fullTime.split(' ');
    const isPrimary = city.id === "IST";
    const isSelected = selectedCity.id === city.id;

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
        {/* Delete Button (X) - Top Right (X thoda left mein rakha hai taaki icon se na takraye) */}
        {!isPrimary && (
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              handleRemoveCity(city.id); 
            }}
            className="absolute top-3 right-3 z-50 p-1 rounded-full text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
          >
            <X size={14} strokeWidth={3} />
          </button>
        )}

        {/* --- Card Header --- */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">
                {city.countryCode || "IN"}
              </span>
              <span className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 uppercase leading-none">
                {city.id}
              </span>
            </div>
            <span className="text-[14px] text-slate-600 dark:text-gray-300 font-bold truncate">
              {city.city}
            </span>
          </div>

          {/* Icon TOP Right Aligned */}
          <div className={`p-2 mt-2 rounded-xl shrink-0 ${cardInfo.isDay ? 'bg-amber-100 dark:bg-amber-500/10' : 'bg-indigo-100 dark:bg-indigo-500/10'}`}>
            {cardInfo.isDay ? (
              <Sun size={18} className="text-amber-500" />
            ) : (
              <Moon size={18} className="text-indigo-400 fill-indigo-400/20" />
            )}
          </div>
        </div>

        {/* --- Time Display (Center) --- */}
        <div className="mt-4">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            {timeValue}
            <span className="text-xs ml-2 font-bold text-slate-500 uppercase tracking-widest">{ampm}</span>
          </h2>
          <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-[0.2em]">
            {cardInfo.date}
          </p>
        </div>

        {/* --- Bottom Status --- */}
        <div className="flex items-center justify-end mt-4">
          {/* Primary RIGHT Bottom Aligned */}
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
    onClick={() => setIsSearchOpen(true)}
    className="h-[210px] group cursor-pointer flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-slate-400 dark:border-white/10 text-slate-400 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all duration-300"
  >
    <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
      <Plus size={24} />
    </div>
    <p className="font-bold text-[10px] uppercase tracking-[0.2em]">Add New City</p>
  </div>
</div>

{/* ================= SEARCH MODAL ================= */}
{isSearchOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSearchOpen(false)} />
    
    <div className="relative w-full max-w-md bg-white dark:bg-[#0f172a] rounded-[32px] shadow-2xl flex flex-col h-[80vh] overflow-hidden">
      
      {/* Fixed Search Header */}
      <div className="flex-shrink-0 p-6 border-b border-slate-50 dark:border-white/5 bg-white dark:bg-[#0f172a] z-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black dark:text-white">Select Location</h3>
          <button onClick={() => setIsSearchOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
        </div>
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" />
          <input 
            autoFocus 
            className="w-full bg-slate-100 dark:bg-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold dark:text-white outline-none border border-transparent focus:border-indigo-500/30"
            placeholder="Search cities..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
        {selectedItems.map((item ,idx) => (
          <CityRowItem 
            key={`selected-${item.place_id || idx}`}
            item={item} 
            isChecked={true} 
            toggleSelection={toggleSelection} 
          />
        ))}
        {searchResults
          .filter(item => !selectedItems.some(s => s.place_id === item.place_id))
          .map((item, idx) => (
            <CityRowItem 
              key={`search-${item.place_id || idx}`}
              item={item} 
              isChecked={false} 
              toggleSelection={toggleSelection} 
            />
          ))
        }
      </div>
    )}
  </div>
</div>

{/* Replace the button at the bottom of your search modal */}
<div className="p-3 sm:p-4 bg-white dark:bg-[#0f172a] border-t border-slate-50 dark:border-white/5">
  <button 
    disabled={selectedItems.length === 0}
    onClick={handleAddSelected} // Call the bulk add function
    className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2 ${
      selectedItems.length > 0 
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
  <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 bg-[#FDFDFE] dark:bg-[#0B1224] text-slate-900 dark:text-white overflow-hidden shadow-xl transition-all duration-300">

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
      
     
      <div className="lg:col-span-2 flex flex-col">

        <div className="mb-4 sm:mb-6">
          <p className="flex items-center font-semibold gap-2 text-xs uppercase text-slate-500 dark:text-blue-300">
           <MapPin size={12} className="sm:w-[14px] sm:h-[14px] text-red-500" />
            Location Standard Time Details
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold mt-1 sm:mt-2">
            {selectedCity.city}
            <span className="text-blue-600  dark:text-blue-300 text-xs sm:text-sm ml-2">
              {selectedCity.country}
            </span>
          </h2>
          <p className="text-blue-600  font-semibold dark:text-blue-200 text-xs sm:text-sm mt-0.5 sm:mt-1 uppercase tracking-wider">
            {selectedCity.country} Standard Time
          </p>
        </div>
        

        <div className="grid lg:grid-cols-3 grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[
            { label: "Offset", value: selectedCity.offset ?? "—", icon: <Clock size={10} className="sm:w-[12px] sm:h-[12px] text-slate-500" /> },
            { label: "Coords", value: selectedCity.coords ?? "—", icon: <MapPin size={10} className="sm:w-[12px] sm:h-[12px] text-slate-500" /> },
            { label: "Currency", value: selectedCity.currency ?? "—", icon: <Banknote size={10} className="sm:w-[12px] sm:h-[12px] text-slate-500" /> },
            { label: "Language", value: selectedCity.language ?? "—", icon: <Languages size={10} className="sm:w-[12px] sm:h-[12px] text-slate-500" /> },
            { label: "Dialing", value: selectedCity.dialing ?? "—", icon: <Phone size={10} className="sm:w-[12px] sm:h-[12px] text-slate-500" /> },
            { label: "IANA ID", value: selectedCity.iana ?? selectedCity.timezone, icon: <Globe size={10} className="sm:w-[12px] sm:h-[12px] text-slate-500" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="rounded-lg sm:rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 transition-all hover:border-indigo-500/40">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                {icon}
                <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-blue-300 uppercase font-black tracking-wider">{label}</p>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">{value}</p>
            </div>
          ))}

          {/* Sunrise / Sunset Row */}
         {(selectedCity.sunrise || selectedCity.sunset) && (
            <div className="col-span-full flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 p-3 sm:p-4 ">
              <div className="flex items-center gap-2 sm:gap-3">
                <Sunrise size={18} className="sm:w-[20px] sm:h-[20px] md:w-6 md:h-6 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                <div>
                  <p className="text-[8px] sm:text-[9px] text-slate-500 dark:text-blue-300 uppercase font-black tracking-widest">Sunrise</p>
                  <p className="text-xs sm:text-sm font-bold">{selectedCity.sunrise ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Sunset size={18} className="sm:w-[20px] sm:h-[20px] md:w-6 md:h-6 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                <div>
                  <p className="text-[8px] sm:text-[9px] text-slate-500 dark:text-blue-300 uppercase font-black tracking-widest">Sunset</p>
                  <p className="text-xs sm:text-sm font-bold">{selectedCity.sunset ?? "—"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description: Pushes to bottom if space allows */}
        {selectedCity.description && (
          <div className="mt-auto pt-3 sm:pt-4">
            <div className="w-full border-t border-slate-300 dark:border-white/10 mb-3 sm:mb-4" />
            <p className="text-xs sm:text-sm text-slate-500 dark:text-blue-200 leading-relaxed italic">
              {selectedCity.description}
            </p>
          </div>
        )}
      </div>

      {/* --- RIGHT SIDE: IMAGE (Col 3) --- */}
      <div className="lg:col-span-1 min-h-[350px] sm:min-h-[450px]">
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




