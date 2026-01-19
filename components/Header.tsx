
import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  onToggleMode: () => void;
  floorName: string;
  onOpenStats: () => void;
  showFacilities: boolean;
  onToggleFacilities: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  mode, 
  onToggleMode, 
  floorName, 
  onOpenStats,
  showFacilities,
  onToggleFacilities
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30 shadow-sm flex-none">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-[#0e7181]/10 flex items-center justify-center text-[#0e7181] border border-[#0e7181]/20">
            <span className="material-symbols-outlined">architecture</span>
          </div>
          <div>
            <h2 className="text-lg font-bold leading-none tracking-tight">HQ Workspace</h2>
            <span className="text-xs text-slate-400 font-medium">Building A • {floorName}</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        <div className="flex items-center gap-2">
            <button 
            onClick={onToggleMode}
            className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
            >
            <span className="material-symbols-outlined text-sm">{mode === 'admin' ? 'edit_square' : 'calendar_month'}</span>
            Switch to {mode === 'admin' ? 'Booking View' : 'Admin Editor'}
            </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {mode === 'admin' && (
            <div className="flex items-center gap-2">
                 <button 
                    onClick={onToggleFacilities}
                    className={`h-9 px-3 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${showFacilities ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    title="Toggle Facilities Layer"
                 >
                    <span className="material-symbols-outlined text-[18px]">{showFacilities ? 'layers_clear' : 'layers'}</span>
                    {showFacilities ? 'Hide Facilities' : 'Show Facilities'}
                 </button>
                 <button 
                    onClick={onOpenStats}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-2"
                    title="View Floor Stats"
                 >
                    <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                    Stats
                 </button>
            </div>
        )}

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100 text-green-700 text-xs font-semibold">
          <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
          Autosaved 2m ago
        </div>

        <div className="flex gap-2">
           <button className="px-4 h-9 rounded-lg bg-[#0e7181] text-white text-sm font-bold hover:bg-[#0a5561] flex items-center gap-2 shadow-lg shadow-[#0e7181]/20">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Layout
           </button>
        </div>

        <div className="size-9 rounded-full bg-slate-200 ring-2 ring-white shadow-sm overflow-hidden">
          <img src="https://i.pravatar.cc/150?u=user" alt="User" />
        </div>
      </div>
    </header>
  );
};

export default Header;
