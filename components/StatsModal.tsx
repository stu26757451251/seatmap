
import React, { useMemo } from 'react';
import { WorkspaceItem } from '../types';
import { FACILITY_OPTS } from '../constants';

interface StatsModalProps {
  items: WorkspaceItem[];
  onClose: () => void;
  isOpen: boolean;
}

const StatsModal: React.FC<StatsModalProps> = ({ items, onClose, isOpen }) => {
  if (!isOpen) return null;

  const stats = useMemo(() => {
    const totalItems = items.length;
    const furniture = items.filter(i => i.category === 'furniture');
    const desks = furniture.filter(i => i.type === 'desk' || i.type === 'l-shape');
    const occupied = desks.filter(i => i.status === 'occupied').length;
    const available = desks.length - occupied;
    const occupancyRate = desks.length > 0 ? Math.round((occupied / desks.length) * 100) : 0;

    // Facility Counts
    const facilityCounts: Record<string, number> = {};
    FACILITY_OPTS.forEach(opt => facilityCounts[opt.id] = 0);
    
    items.forEach(item => {
      if (item.facilities) {
        item.facilities.forEach(f => {
          if (facilityCounts[f] !== undefined) {
            facilityCounts[f]++;
          }
        });
      }
    });

    return { totalItems, totalDesks: desks.length, occupied, available, occupancyRate, facilityCounts };
  }, [items]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 z-50">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Floor Statistics</h2>
            <p className="text-sm font-medium text-slate-400">Real-time breakdown of assets and facilities</p>
          </div>
          <button onClick={onClose} className="size-10 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
             <StatCard 
                label="Total Desks" 
                value={stats.totalDesks} 
                icon="desk" 
                color="text-slate-600" 
                bg="bg-slate-50" 
             />
             <StatCard 
                label="Occupied" 
                value={stats.occupied} 
                icon="person" 
                color="text-orange-600" 
                bg="bg-orange-50" 
             />
             <StatCard 
                label="Available" 
                value={stats.available} 
                icon="check_circle" 
                color="text-green-600" 
                bg="bg-green-50" 
             />
             <StatCard 
                label="Occupancy Rate" 
                value={`${stats.occupancyRate}%`} 
                icon="pie_chart" 
                color="text-[#0e7181]" 
                bg="bg-[#0e7181]/10" 
             />
          </div>

          {/* Facility Breakdown */}
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Equipment & Facilities</h3>
          <div className="grid grid-cols-3 gap-4">
            {FACILITY_OPTS.map(opt => {
              const count = stats.facilityCounts[opt.id];
              return (
                <div key={opt.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-[#0e7181]/30 transition-colors group">
                   <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#0e7181]/10 group-hover:text-[#0e7181] transition-colors">
                        <span className="material-symbols-outlined">{opt.icon}</span>
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{opt.id}</span>
                   </div>
                   <span className="text-xl font-black text-slate-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
           <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
             Close Report
           </button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: string; color: string; bg: string }> = ({ label, value, icon, color, bg }) => (
  <div className={`p-5 rounded-2xl border border-transparent ${bg}`}>
    <div className={`flex items-start justify-between mb-2`}>
       <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</span>
       <span className={`material-symbols-outlined ${color}`}>{icon}</span>
    </div>
    <div className={`text-3xl font-black ${color}`}>{value}</div>
  </div>
);

export default StatsModal;
