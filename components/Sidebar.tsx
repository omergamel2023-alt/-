import React from 'react';
import { GenerationMode } from '../types';
import { CameraIcon, BoltIcon, FilmIcon } from './icons/Icons';

interface SidebarProps {
  activeMode: GenerationMode;
  setActiveMode: (mode: GenerationMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMode, setActiveMode }) => {
  const navItems = [
    { mode: GenerationMode.IMAGE, label: 'مولّد الصور', icon: <CameraIcon className="w-6 h-6" /> },
    { mode: GenerationMode.FAST_IMAGE, label: 'المولّد السريع', icon: <BoltIcon className="w-6 h-6" /> },
    { mode: GenerationMode.VIDEO, label: 'مولّد القصص المرئية', icon: <FilmIcon className="w-6 h-6" /> },
  ];

  return (
    <>
      {/* Mobile Header / Bottom Nav */}
      <aside className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800 z-20">
         <nav className="flex justify-around items-center p-2">
            {navItems.map((item) => (
              <button
                key={item.mode}
                onClick={() => setActiveMode(item.mode)}
                aria-label={item.label}
                className={`flex flex-col items-center justify-center gap-1 w-20 h-16 rounded-lg transition-all duration-200 ${
                  activeMode === item.mode
                    ? 'text-purple-400'
                    : 'text-slate-400 hover:text-purple-400'
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
         </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-slate-950/70 border-e border-slate-800 p-4 flex-col flex-shrink-0">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            إبداع AI
          </h1>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => setActiveMode(item.mode)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group ${
                activeMode === item.mode
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className={`transition-transform duration-200 ${activeMode === item.mode ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;