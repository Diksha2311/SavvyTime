import  { useState, useEffect, useRef } from "react";
import PageWrapper from "./PageWrapper";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, Repeat, Globe, MapPin, Sun, Check, Clock, X } from "lucide-react";

interface SearchCity {
  id: number;
  name: string;
  country_code: string;
  info: string;
  time: string;
  timezone: string;
  lat: number;
  lng: number;
  country?: string;
}


interface OpenMeteoCity {
  id: number;
  name: string;
  country: string;
  country_code: string;
  admin1?: string;
  timezone: string;
  latitude: number;
  longitude: number;
}



// --- DashboardCards Component ---
const cardsData = [
  {
    id: 1,
    icon: <Repeat className="text-indigo-500" size={24} />,
    title: "Time Converter",
    description: "Easily convert times between different time zones for meetings and events.",
    linkText: "Open Converter",
    linkHref: "/city",
  },
  {
    id: 2,
    icon: <Globe className="text-indigo-500" size={24} />,
    title: "Time Around the World",
    description: "View current local times in major cities and regions globally.",
    linkText: "Explore World Clock",
    linkHref: "/city",
  },
  {
    id: 3,
    icon: <MapPin className="text-white" size={24} />,
    title: "Your Location",
    description: "We've detected you are currently in ",
    location: "INDIA",
    time: "10:42",
    period: "AM",
    timezone: "IST (UTC+5:30)",
    weatherIcon: <Sun size={20} className="text-amber-400" />,
  },
];

const DashboardCards = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full max-w-7xl !mt-0">
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10  px-4 sm:px-6 md:px-8 lg:px-16 mt-10 md:mt-20">
        {cardsData.map((card) => (
          <div
            key={card.id}
            className={`
            p-6 sm:p-8 rounded-[2.5rem] shadow-md border
              ${card.id === 3
                ? "bg-[#111827] text-white border-gray-200 dark:border-gray-700"
                : "bg-white dark:bg-[#161a35] border-gray-200 dark:border-gray-700"
              }
              transform transition duration-300 hover:shadow-xl hover:scale-[1.03]
              flex flex-col justify-between min-h-[280px] sm:min-h-[320px] lg:min-h-[350px] relative
            `}
          >
            <div>
              <div className="flex items-center mb-6 sm:mb-8">
                <div className={`${card.id === 3 ? "p-3 bg-white/10 rounded-xl" : ""}`}>
                  {card.icon}
                </div>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3">{card.title}</h3>
              <p className={`text-sm sm:text-base lg:text-lg leading-relaxed ${card.id === 3 ? "text-white/80" : "text-gray-600 dark:text-gray-300"}`}>
                {card.description} <strong>{card.location}</strong>
              </p>
            </div>

            {card.id === 3 ? (
              <div className="mt-auto">
                <div className="w-full h-[1px] bg-white/10 mb-6 mt-4" />
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-baseline">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">{card.time}</span>
                      <span className="ml-2 text-lg sm:text-xl font-medium opacity-70">{card.period}</span>
                    </div>
                    <p className="text-xs sm:text-sm opacity-50 mt-1 uppercase tracking-wider">{card.timezone}</p>
                  </div>
                  <div className="text-amber-400">
                    <Sun size={28} className="sm:w-8 sm:h-8" />
                  </div>
                </div>
              </div>
            ) : (

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (card.linkHref && card.linkHref !== "#") {
                    navigate(card.linkHref);
                    window.scrollTo(0, 0);
                  }
                }}
                className="text-blue-600 dark:text-blue-400 text-sm sm:text-base lg:text-lg font-bold mt-4 inline-block group cursor-pointer hover:underline"
              >
                {card.linkText}
                <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Home Component ---
export default function Home() {
  const navigate = useNavigate();
const [now, setNow] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<SearchCity[]>([]);
  const [addedCities, setAddedCities] = useState<SearchCity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  

  const searchContainerRef = useRef<HTMLDivElement>(null);



  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearch(""); 
      setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


const handleSearch = async (val: string) => {
  setSearch(val);
  const searchLower = val.trim().toLowerCase(); // Input ko normalize karein

  if (searchLower.length > 0) {
    setShowDropdown(true);
    setIsLoading(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${val}&count=20&language=en&format=json`);
      const data = await res.json();
      
      if (data.results) {
        const uniqueResults: OpenMeteoCity[] = [];
        const seenInCountry = new Set();

        data.results.forEach((city: OpenMeteoCity) => {
          // 1. City Name Normalization (ā -> a)
          const normalizedName = city.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();

          if (!normalizedName.startsWith(searchLower)) return;
          const cityKey = `${normalizedName}-${city.country_code.toLowerCase()}-${(city.admin1 || '').toLowerCase()}`;

          if (!seenInCountry.has(cityKey)) {
            seenInCountry.add(cityKey);
            uniqueResults.push(city);
          }
        });

        // 4. Sorting: India ke results top par
        const sortedResults = uniqueResults.sort((a, b) => {
          if (a.country_code === 'IN' && b.country_code !== 'IN') return -1;
          if (a.country_code !== 'IN' && b.country_code === 'IN') return 1;
          return 0;
        });

        const formatted: SearchCity[] = sortedResults.map((city) => ({
          id: city.id,
          name: city.name,
          country_code: city.country_code,
          info: `${city.admin1 ? city.admin1 + ", " : ""}${city.country}`,
          time: new Intl.DateTimeFormat("en-US", {
            hour: "numeric", minute: "numeric", hour12: true, timeZone: city.timezone,
          }).format(new Date()).toLowerCase(),
          timezone: city.timezone,
          lat: city.latitude,
          lng: city.longitude,
          country: city.country,
        }));

        setSuggestions(formatted);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  } else {
    setSuggestions([]);
    setShowDropdown(false);
  }
};

  const onAddCity = async (city: SearchCity) => {
  setAddedCities((prev) => {
    if (prev.some(c => c.name === city.name && c.country_code === city.country_code)) {
      return prev; 
    }
    return [...prev, city];
  });

    setIsLoading(true);
    setShowDropdown(false);

    try {

      const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${city.country_code}`);
      console.log(countryRes, 'countryRescountryRes')
      const countryData = await countryRes.json();
      const cInfo = countryData[0];

      // 2. NEW: Fetch Sunrise & Sunset (Using Open-Meteo)
      const sunRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&daily=sunrise,sunset&timezone=auto`
      );
      const sunData = await sunRes.json();

      // Time formatting helper (e.g., converts 2024-05-20T05:45 to 05:45 AM)
      const formatSunTime = (isoString: string) => {
        if (!isoString) return "N/A";
        return new Date(isoString).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: city.timezone
        });
      };

      const sunriseTime = formatSunTime(sunData.daily?.sunrise?.[0]);
      const sunsetTime = formatSunTime(sunData.daily?.sunset?.[0]);

      // 3. Consistent String ID (IND42)
      const customId = city.name.slice(0, 3).toUpperCase() + Math.floor(Math.random() * 100);

      // 4. Currency Logic
      let displayCurrency = "N/A";
      if (cInfo && cInfo.currencies) {
        const currencyKey = Object.keys(cInfo.currencies)[0];
        const cur = cInfo.currencies[currencyKey];
        displayCurrency = `${cur.name} ${cur.symbol ? `(${cur.symbol})` : ""}`;
      }

      // 5. Timezone offset logic
      let offsetPart = "GMT+0";
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: city.timezone,
          timeZoneName: 'shortOffset'
        });
        offsetPart = formatter.formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value || "GMT+0";
      } catch {
        offsetPart = "GMT+5:30";
      }

      // 6. Object Mapping (FIXED KEYS)
      const newCityData = {
        id: customId,
        city: city.name,
        country: cInfo?.name?.common || city.country || "Unknown",
        countryCode: city.country_code.toUpperCase(),
        timezone: city.timezone || "Asia/Kolkata",
        offset: offsetPart,
        currency: displayCurrency,
        coords: `${city.lat?.toFixed(2) || "0.00"}° N, ${city.lng?.toFixed(2) || "0.00"}° E`,
        language: cInfo?.languages ? Object.values(cInfo.languages).join(", ") : "English",
        dialing: (cInfo?.idd?.root || "") + (cInfo?.idd?.suffixes ? cInfo.idd.suffixes[0] : ""),
        iana: city.timezone || "Asia/Kolkata",
        image: `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80&sig=${customId}`,
        description: `${city.name} is a major city in ${cInfo?.name?.common || "the region"}.`,
        sunrise: sunriseTime,
        sunset: sunsetTime
      };

      console.log("Navigating with data:", newCityData);
      navigate("/city", { state: { tempCity: newCityData } });

    } catch (error) {
      console.error("Critical Error in onAddCity:", error);
      const fallbackId = city.name.slice(0, 3).toUpperCase() + "00";
      navigate("/city", {
        state: {
          tempCity: {
            id: fallbackId,
            city: city.name,
            countryCode: city.country_code?.toUpperCase() || "IN",
            timezone: city.timezone || "Asia/Kolkata"
          }
        }
      });
    } finally {
      setIsLoading(false);
      setSearch("");
    }
  };

  // Clock Logic
useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = !is24Hour ? (hours % 12 || 12) : hours;
const hoursMinutes = `${displayHours}:${minutes}`;
  const secondsDisplay = `${seconds}${!is24Hour ? " " + ampm : ""}`;
  const today = now.toLocaleDateString("en-US", { 
    weekday: "long", month: "long", day: "numeric", year: "numeric" 
  });

  return (

    <PageWrapper>
    <div className="min-h-screen w-full flex flex-col bg-[#E9EDFA] dark:bg-[#0B1220] text-slate-800 dark:text-white">
      <main className=" justify-center px-4 sm:px-6 lg:px-12">
        <div className="w-full flex flex-col items-center space-y-10 mt-10">

          <div className="flex items-center justify-center p-3 sm:px-5 sm:py-2.5 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-full w-max shadow-sm hover:shadow-md transition-all duration-500 group cursor-default">
            {/* Green Dot with Dual Pulse Animation */}
            <div className="relative flex mr-3">

              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
            <span className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs font-bold tracking-[0.15em] uppercase leading-none select-none group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
              Synchronized Worldwide
            </span>
          </div>


            <div className="w-full flex flex-col items-center justify-center   px-2 sm:px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold whitespace-nowrap">
                <span>Time conversion, </span>
                <span className="text-purple-400">simplified.</span>

              </h1>

              <p className="mt-2 sm:mt-4 text-[12px] sm:text-[14px] md:text-base lg:text-lg dark:text-gray-400 text-gray-600 leading-relaxed max-w-2xl mx-auto">
                              Instantly convert time zones across the globe with professional precision.
              </p>

            </div>
          </div>

          {/* --- Updated Search Section --- */}
          <div ref={searchContainerRef} className="w-full max-w-xl relative group/searchbox">
            <div className="relative flex items-center shadow-sm ">
              <div className="absolute left-0 pl-4 flex items-center pointer-events-none">
                {isLoading ? <Loader2 size={18} className="animate-spin text-purple-500" /> : <Search size={20} className="text-slate-500" />}
              </div>
              <input
                type="text"
                value={search}
                onFocus={() => search.length > 0 && setShowDropdown(true)}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search timezone or cities"
                className="w-full rounded-full pl-12 pr-16 py-3 bg-white dark:bg-[#161a35] text-slate-900 dark:text-white border border-slate-400 dark:border-white/20 focus:outline-none focus:border-blue-400 text-lg transition-all"
              />
              {/* <div onClick={() => suggestions.length > 0 && onAddCity(suggestions[0])} className="absolute right-0 top-0 bottom-0 px-4 flex items-center cursor-pointer rounded-r-full">
                <Plus size={22} className="text-slate-400 hover:text-blue-500 active:scale-90 transition-all" strokeWidth={2.5} />
              </div> */}
            </div>

            {/* Dropdown Logic */}
            {showDropdown && search.length > 0 && (
              <div className="mt-2 absolute w-full bg-white dark:bg-[#161a35] border border-slate-300 dark:border-white/20 shadow-2xl z-50 rounded-2xl overflow-hidden">
                {suggestions.length > 0 ? (
                  suggestions.map((city:SearchCity) => (
                    <div
                      key={city.id}
                      onClick={() => onAddCity(city)}
                      className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center group border-b border-slate-100 dark:border-white/5 last:border-0"
                    >
                      <div className="text-sm">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{city.name}</span>
                        <span className="ml-1 text-slate-500">({city.info})</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium group-hover:text-blue-500">{city.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-400 italic text-sm">City not found</div>
                )}
              </div>
            )}
          </div>

          <div className="w-full max-w-xl flex flex-wrap">
            {addedCities.map((city: SearchCity) => (
              <div key={city.id} className="flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800">
                {city.name}
                <X size={14} className="cursor-pointer" onClick={() => setAddedCities(addedCities.filter(c => c.id !== city.id))} />
              </div>
            ))}
          </div>

          {/* 12h | 24h Toggle - Positioned slightly before the end */}
          <div className="w-full flex justify-center lg:justify-end lg:pr-80 !mt-0"> 
            <div className="flex gap-2 text-[15px] font-black tracking-widest text-slate-400 dark:text-white/30 uppercase select-none lg:ml-60 ">
              <span
                className={`transition-all duration-200 ${!is24Hour
                  ? "text-indigo-600 dark:text-indigo-400 scale-110"
                  : "cursor-pointer hover:text-slate-600 dark:hover:text-white/60"
                  }`}
                onClick={() => setIs24Hour(false)}
              >
                12h
              </span>

              <span className="opacity-50 font-gray">|</span>

              <span
                className={`transition-all duration-200 ${is24Hour
                  ? "text-indigo-600 dark:text-indigo-400 scale-110"
                  : "cursor-pointer hover:text-slate-600 dark:hover:text-white/60"
                  }`}
                onClick={() => setIs24Hour(true)}
              >
                24h
              </span>
            </div>
          </div>

          <div className="w-full max-w-4xl px-4 !mt-6">
            <div className="flex flex-col lg:flex-row justify-center items-center lg:items-baseline">
              <span className="text-6xl sm:text-8xl md:text-9xl lg:text-[8rem] font-bold leading-none">{hoursMinutes}</span>
              {secondsDisplay && (
                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl lg:ml-4 text-slate-400 font-medium mt-2 lg:mt-0">{secondsDisplay}</span>
              )}
            </div>
            <div className="mt-6 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-gray-700 dark:text-gray-300">{today}</h2>
            </div>
          </div>

          <DashboardCards />


<div className="w-full max-w-7xl px-4 sm:px-8 lg:px-16 ">

  <div className="
    w-full
    text-center
    px-6 sm:px-10 lg:px-16
    py-12 sm:py-16
    relative rounded-[2.5rem] border border-slate-200 dark:border-white/10 
    bg-[#FDFDFE] dark:bg-[#161a35] text-slate-900 dark:text-white 
    overflow-hidden transition-all shadow-xl
  ">
    {/* Inner Wrapper for text control */}
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
        Stay in sync, everywhere.
      </h1>

      <p className="mt-6 text-sm sm:text-base lg:text-lg dark:text-gray-400 text-gray-600 leading-relaxed">
        Join thousands of remote teams who trust ChronoSync for their global scheduling needs. 
        Simple, fast, and always accurate.
      </p>

      {/* Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
       <button 
      onClick={() => {navigate('/city');
        window.scrollTo(0, 0);
      }} // 3. Navigate logic
      className="
        w-full sm:w-auto px-10 py-3.5
        rounded-2xl font-bold text-sm tracking-[0.2em] uppercase
        transition-all duration-300
        bg-[#131A2E] text-white border border-white/10
        hover:bg-[#1a2440] hover:border-indigo-500/50
        hover:shadow-[0_0_25px_rgba(19,26,46,0.4)]
        active:scale-95
      "
    >
      Get Started
    </button>

        <a href="#" className="
          text-gray-500 dark:text-gray-400 font-bold text-sm tracking-widest uppercase
          flex items-center gap-2 hover:text-blue-500 dark:hover:text-gray-300 transition-colors group
        ">
          Learn more 
          <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>

{/* Features Section - Final Responsive Fix */}
<div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-10 w-full">
  
  {/* No Sign up required */}
  <div className="flex items-center gap-3 group w-full sm:w-auto px-4 sm:px-0 justify-center sm:justify-start">
    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20">
      <Check size={14} className="text-green-500" strokeWidth={4} />
    </div>
    <span className="text-[10px] sm:text-[11px] font-black tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400  whitespace-nowrap">
      No Sign up required
    </span>
  </div>

  {/* Free Forever */}
  <div className="flex items-center gap-3 group w-full sm:w-auto px-4 sm:px-0 justify-center sm:justify-start">
    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20">
      <Check size={14} className="text-green-500" strokeWidth={4} />
    </div>
    <span className="text-[10px] sm:text-[11px] font-black tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">
      Free Forever
    </span>
  </div>

</div>
    </div>
  </div>
</div>


          {/* Popular Quick Conversion */}
          <div className=" text-center">
            {/* Heading */}


            <p className=" mb-10 text-[14px] font-bold tracking-widest text-slate-700 dark:text-slate-500 uppercase">
              Popular Quick Conversion
            </p>

            {/* Buttons */}
            <div className="w-full flex flex-col items-center gap-3 px-4">
              {/* Row 1: 8 Buttons (Responsive Grid) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 w-full max-w-screen-xl ">
                {[
                  "EST to IST", "GMT to EST", "PST to EST", "EST to GMT",
                  "PST to GMT", "IST to EST", "GMT to IST", "EST to PST"
                ].map((item) => (
                  <button key={item} className="px-3 py-2 text-[10px] sm:text-xs font-medium rounded-full border border-gray-400 text-[rgb(var(--text-main))] hover:text-gray-500 hover:border-indigo-500 transition truncate">
                    {item}
                  </button>
                ))}
              </div>

             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 w-full">
      {[
        "IST to GMT", "GMT to PST", "CST to IST", "IST to CST"
      ].map((item, index) => (
        <button 
          key={item} 
          className={`
           x-3 py-2 text-[10px] sm:text-xs font-medium rounded-full border border-gray-400 text-[rgb(var(--text-main))] hover:text-gray-500 hover:border-indigo-500 transition truncate
            ${index === 0 ? "lg:col-start-3" : ""} 
          `}
        >
          {item}
        </button>
      ))}
    </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-300 dark:border-white/5 bg-[#E9EDFA] dark:bg-[#0B1229]  transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

            {/* LEFT SECTION: Logo */}
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="pbg-gray-500 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                <Clock size={18} className="text-gray" />
              </div>
              <span className="font-black text-lg  text-slate-900 dark:text-gray-300 uppercase">
                CHRONOSYNC
              </span>
            </div>

            {/* RIGHT SECTION: Vertically Stacked & Right Aligned */}
            <div className="flex flex-col items-center md:items-end gap-2 text-right">

              {/* Row 1: Copyright */}
              <p className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-500 uppercase">
                © 2026 ChronoSync Inc. 
                
              </p>
             

              {/* Row 2: Navigation Links */}
              <div className="flex items-center justify-center md:justify-center gap-6 w-full text-[11px] font-black tracking-[0.15em] uppercase text-slate-600 dark:text-slate-400">
                {["Privacy", "Terms", "API"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group whitespace-nowrap"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </PageWrapper>
  );
}













