import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, BookOpen, Sparkles } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 ${
      isActive ? 'text-blue-500' : 'text-gray-400 hover:text-gray-200'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-gray-800 border-t border-gray-700 pb-safe">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        <NavLink to="/" className={navClass}>
          <Home size={24} />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>
        <NavLink to="/search" className={navClass}>
          <Search size={24} />
          <span className="text-[10px] font-medium">Search</span>
        </NavLink>
        <NavLink to="/library" className={navClass}>
          <BookOpen size={24} />
          <span className="text-[10px] font-medium">Library</span>
        </NavLink>
        <NavLink to="/recommendations" className={navClass}>
          <Sparkles size={24} />
          <span className="text-[10px] font-medium">AI Picks</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
