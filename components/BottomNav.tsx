
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, BookOpen, Sparkles } from 'lucide-react';

const BottomNav: React.FC = () => {
  // Mobile: flex-col center. Desktop: flex-col (sidebar)
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 
     ${isActive 
        ? 'text-blue-500 md:bg-blue-900/20' 
        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
     }
     md:flex-row md:w-full md:justify-start md:gap-3 md:px-4 md:py-3`;

  const labelClass = "text-[10px] font-medium md:text-sm";
  const iconSize = 24;

  return (
    <nav className="fixed z-50 bg-gray-900 border-gray-800 
      bottom-0 left-0 right-0 h-16 border-t pb-safe flex items-center justify-around
      md:top-0 md:bottom-0 md:left-0 md:w-64 md:h-screen md:flex-col md:justify-start md:items-start md:border-t-0 md:border-r md:pt-8 md:gap-2
    ">
      
      {/* Desktop Logo Area */}
      <div className="hidden md:flex flex-col px-6 mb-8 w-full">
        <h1 className="text-xl font-extrabold text-white">Manhwa<span className="text-blue-500">Tracker</span></h1>
      </div>

      <div className="flex justify-around items-center w-full max-w-md mx-auto md:max-w-none md:flex-col md:px-2 md:gap-2">
        <NavLink to="/" className={navClass}>
          <Home size={iconSize} />
          <span className={labelClass}>Home</span>
        </NavLink>
        <NavLink to="/search" className={navClass}>
          <Search size={iconSize} />
          <span className={labelClass}>Search</span>
        </NavLink>
        <NavLink to="/library" className={navClass}>
          <BookOpen size={iconSize} />
          <span className={labelClass}>Library</span>
        </NavLink>
        <NavLink to="/recommendations" className={navClass}>
          <Sparkles size={iconSize} />
          <span className={labelClass}>AI Picks</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
