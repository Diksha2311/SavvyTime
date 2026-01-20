import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'; // 1. useLocation add kiya
import { AnimatePresence } from "framer-motion";
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import CityUi from './components/CityUi';
import TimerPage from './components/TimerUi';
import CalenderPage from './components/CalendarUi';
import MobileUi from './components/MobileUi';

// Ek alag component banaya taaki useLocation() use kar sakein
function AnimatedRoutes() {
  const location = useLocation();

  return (
    /* mode="wait" se purana page pehle fade-out hoga fir naya page slide-up hoga */
    <AnimatePresence mode="popLayout">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/city" element={<CityUi />} />
        <Route path="/timer" element={<TimerPage />} />
        <Route path="/calendar" element={<CalenderPage />} />
        <Route path="/mobile" element={<MobileUi />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-300">
        <Navbar />
        <main>
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;

