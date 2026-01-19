
import React from 'react';
import { WorkspaceItem } from '../types';

interface AssetLibraryProps {
  onAddAsset: (type: WorkspaceItem['type'], category: WorkspaceItem['category'], label: string) => void;
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({ onAddAsset }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-xl font-extrabold tracking-tight mb-2 text-slate-900">Asset Library</h3>
        <p className="text-xs text-slate-400 font-medium mb-4 uppercase tracking-wider">Drag to place (click to add)</p>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-transparent focus:border-[#0e7181]/30 focus:bg-white text-sm outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-8 custom-scrollbar">
        {/* Structural Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 py-1 border-b border-slate-100">
             <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                <span className="material-symbols-outlined text-[18px]">architecture</span>
             </div>
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Structural</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <AssetItem 
               icon="straighten" 
               label="Wall" 
               sub="8cm Thick" 
               onClick={() => onAddAsset('wall', 'structural', 'Wall')} 
             />
             <AssetItem 
               icon="select_window" 
               label="Zone Area" 
               sub="Box" 
               onClick={() => onAddAsset('zone-box', 'zone', 'Zone')}
             />
             <AssetItem 
               icon="splitscreen" 
               label="Divider" 
               sub="Panel" 
               onClick={() => onAddAsset('divider', 'structural', 'Divider')}
             />
          </div>
        </div>

        {/* Furniture Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 py-1 border-b border-slate-100">
             <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <span className="material-symbols-outlined text-[18px]">chair</span>
             </div>
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Furniture</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <AssetItem 
               icon="desk" 
               label="Desk" 
               sub="Standard" 
               onClick={() => onAddAsset('desk', 'furniture', 'Desk')} 
             />
             <AssetItem 
               icon="table_bar" 
               label="L-Shape" 
               sub="Corner" 
               onClick={() => onAddAsset('l-shape', 'furniture', 'Corner Desk')}
             />
             <AssetItem 
               icon="chair_alt" 
               label="Task Chair" 
               sub="Standard" 
               onClick={() => onAddAsset('chair', 'furniture', 'Chair')}
             />
             <AssetItem 
               icon="shelves" 
               label="Storage" 
               sub="Cabinet" 
               onClick={() => onAddAsset('storage', 'furniture', 'Storage')}
             />
          </div>
        </div>

        {/* Zones Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 py-1 border-b border-slate-100">
             <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                <span className="material-symbols-outlined text-[18px]">meeting_room</span>
             </div>
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Common Zones</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <AssetItem 
               icon="groups" 
               label="Meeting" 
               sub="Large" 
               onClick={() => onAddAsset('meeting', 'zone', 'Meeting')}
             />
             <AssetItem 
               icon="coffee" 
               label="Lounge" 
               sub="Area" 
               onClick={() => onAddAsset('lounge', 'zone', 'Lounge')}
             />
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetItem: React.FC<{ icon: string; label: string; sub: string; onClick: () => void }> = ({ icon, label, sub, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-white hover:border-[#0e7181] hover:shadow-xl hover:-translate-y-1 transition-all group w-full active:scale-95"
  >
    <span className="material-symbols-outlined text-slate-300 group-hover:text-[#0e7181] text-3xl mb-2 transition-colors">{icon}</span>
    <div className="text-center">
      <span className="text-xs font-bold block text-slate-900 leading-tight">{label}</span>
      <span className="text-[9px] text-slate-400 uppercase tracking-tighter">{sub}</span>
    </div>
  </button>
);

export default AssetLibrary;
