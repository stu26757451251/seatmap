
import React from 'react';
import { WorkspaceItem, Colleague } from '../types';
import { COLLEAGUES, FACILITY_OPTS } from '../constants';

interface BookingPanelProps {
  item: WorkspaceItem | null;
  onConfirm: () => void;
}

const BookingPanel: React.FC<BookingPanelProps> = ({ item, onConfirm }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Date Selection */}
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Select Date</h3>
        <div className="bg-slate-50 rounded-xl p-1 flex items-center justify-between mb-4 border border-slate-100">
          <button className="p-2 hover:bg-white rounded-lg text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>
          <span className="text-sm font-bold text-slate-800">October 2023</span>
          <button className="p-2 hover:bg-white rounded-lg text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        </div>
        <div className="flex justify-between gap-1">
          {['Mon 23', 'Tue 24', 'Wed 25', 'Thu 26', 'Fri 27'].map((d, i) => {
             const [day, num] = d.split(' ');
             const isActive = num === '24';
             return (
               <div 
                 key={d} 
                 className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl cursor-pointer transition-all
                   ${isActive ? 'bg-[#0e7181] text-white shadow-xl shadow-[#0e7181]/20 scale-105' : 'hover:bg-slate-50'}
                 `}
               >
                 <span className={`text-[10px] font-bold ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{day}</span>
                 <span className="text-sm font-black">{num}</span>
               </div>
             );
          })}
        </div>
      </div>

      {/* Colleague Search */}
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Find Colleague</h3>
        <div className="relative group mb-4">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-300 group-focus-within:text-[#0e7181] transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Search by name..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#0e7181]/20 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
           {COLLEAGUES.map(c => (
             <div key={c.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group">
                <img src={c.avatar} className="size-10 rounded-full border-2 border-white shadow-sm" alt={c.name} />
                <div className="flex-1">
                   <p className="text-sm font-bold text-slate-900 leading-tight">{c.name}</p>
                   <p className="text-[11px] text-slate-400">{c.role} • {c.location}</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-sm group-hover:text-[#0e7181]">location_on</span>
             </div>
           ))}
        </div>
      </div>

      {/* Booking Details / Active Item */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {item ? (
          <div className="bg-[#0e7181]/5 border border-[#0e7181]/20 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                 <span className="bg-[#0e7181] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Selected</span>
                 <h2 className="text-2xl font-black text-[#0e7181] mt-1">{item.label}</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Engineering Zone • Quiet Area</p>
              </div>
              <div className="size-12 bg-white rounded-2xl flex items-center justify-center text-[#0e7181] shadow-lg shadow-[#0e7181]/5">
                <span className="material-symbols-outlined text-3xl">
                    {item.type === 'meeting' ? 'groups' : (item.type === 'lounge' ? 'coffee' : 'chair_alt')}
                </span>
              </div>
            </div>
            
            {(item.facilities && item.facilities.length > 0) ? (
                <div className="flex flex-wrap gap-2 mb-6">
                    {item.facilities.map(f => {
                        const icon = FACILITY_OPTS.find(opt => opt.id === f)?.icon || 'check_circle';
                        return <FeatureBadge key={f} icon={icon} label={f} />;
                    })}
                </div>
            ) : (
                <div className="mb-6">
                    <p className="text-xs text-slate-400 italic">No specific facilities listed.</p>
                </div>
            )}

            <button 
              onClick={onConfirm}
              className="w-full bg-[#0e7181] hover:bg-[#0a5561] text-white py-4 rounded-2xl font-black text-sm shadow-2xl shadow-[#0e7181]/30 transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              Confirm Booking
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-10">
             <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-slate-300 text-3xl">desk</span>
             </div>
             <p className="text-sm font-bold text-slate-400">Select a desk on the map<br/>to book your spot</p>
          </div>
        )}

        <div className="mt-8">
           <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Map Legend</h3>
           <div className="space-y-4">
              <LegendItem color="bg-green-100 border-green-500" label="Available" />
              <LegendItem color="bg-slate-100 border-slate-300" icon="circle" label="Occupied" />
              <LegendItem color="bg-[#0e7181] border-[#0e7181]" label="Your Selection" />
           </div>
        </div>
      </div>

      {/* Sticky Footer Status */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
         <div className="flex justify-between items-center text-xs mb-3">
            <span className="text-slate-400 font-bold uppercase tracking-widest">My upcoming booking</span>
            <button className="text-[#0e7181] font-black hover:underline">View All</button>
         </div>
         <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="bg-[#0e7181]/10 p-2.5 rounded-xl text-[#0e7181]">
               <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <div>
               <p className="text-sm font-black text-slate-900 leading-tight">Tomorrow, Oct 25</p>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Desk F-09 • Level 4</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const FeatureBadge: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <span className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-100 text-[10px] text-slate-600 font-bold uppercase tracking-tight shadow-sm">
    <span className="material-symbols-outlined text-[14px]">{icon}</span> {label}
  </span>
);

const LegendItem: React.FC<{ color: string; label: string; icon?: string }> = ({ color, label, icon }) => (
  <div className="flex items-center gap-4">
    <div className={`w-10 h-6 rounded-lg border flex items-center justify-center ${color}`}>
      {icon && <div className="size-2 rounded-full bg-slate-300"></div>}
    </div>
    <span className="text-sm font-bold text-slate-600">{label}</span>
  </div>
);

export default BookingPanel;
