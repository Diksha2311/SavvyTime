// components/Navbar.tsx
import { useState } from "react"; 
import { Sun, Moon, Globe, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Converter", path: "/city" },
    { name: "Timer", path: "/timer" },
    { name: "Calendar", path: "/calendar" },
    { name: "Mobile", path: "/mobile" },
  ];

  return (
    <>
  
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20 lg:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      <nav
       className="relative w-full h-14 sm:h-16 md:h-20 z-50 flex justify-between items-center px-4 sm:px-6 md:px-8 lg:px-14 dark:bg-[#0B1229] border-b border-gray-200 dark:border-white/5 bg-white">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity z-[60]">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-md bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex-shrink-0">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-sm sm:text-base md:text-lg font-bold">
            <span className="text-slate-900 dark:text-white">Chrono</span>
            <span className="text-purple-600">Sync</span>
          </div>
        </Link>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center gap-10 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`transition-colors ${
                location.pathname === link.path 
                  ? "text-purple-500 font-bold" 
                  : "text-slate-500 dark:text-gray-400 hover:text-purple-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-4 z-[60]">
          <button onClick={toggleDarkMode} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10 ">
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-500 hover:text-purple-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500 hover:text-purple-500" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-slate-500 hover:text-purple-500"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`
          fixed lg:hidden inset-x-0 top-[56px] sm:top-[64px] md:top-[80px] 
          bg-white dark:bg-[#0B1229] border-b border-gray-200 dark:border-white/10
          transition-all duration-300 ease-in-out transform shadow-xl
          ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0 pointer-events-none"}
          z-50 px-4 py-6
        `}>
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-base font-semibold py-2 px-4 rounded-lg transition-all ${
                  location.pathname === link.path 
                    ? "bg-purple-500/10 text-purple-500" 
                    : "text-slate-600 dark:text-gray-300"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}














