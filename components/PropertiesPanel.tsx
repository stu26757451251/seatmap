
import React, { useState, useMemo } from 'react';
import { WorkspaceItem, Employee, FloorConfig } from '../types';
import { SAMPLE_EMPLOYEES, FACILITY_OPTS } from '../constants';

interface PropertiesPanelProps {
  items: WorkspaceItem[];
  onUpdate: (item: WorkspaceItem) => void;
  onDelete: () => void;
  onClose: () => void;
  floorConfig: FloorConfig;
  onUpdateFloorConfig: (config: FloorConfig) => void;
  onDuplicate: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  items, 
  onUpdate, 
  onDelete, 
  onClose,
  floorConfig,
  onUpdateFloorConfig,
  onDuplicate
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return SAMPLE_EMPLOYEES.filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // RENDER FLOOR SETTINGS IF NO ITEMS SELECTED
  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="px-6 py-5 border-b flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-lg">settings_overscan</span>
            <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">
              Floor Properties
            </h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-3 mb-4">
                <div className="size-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm text-slate-400">
                   <span className="material-symbols-outlined">layers</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Global Settings</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Configuration</p>
                </div>
             </div>
             
             <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Floor Name</label>
                  <input 
                    type="text" 
                    value={floorConfig.name}
                    onChange={(e) => onUpdateFloorConfig({...floorConfig, name: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:border-[#0e7181] outline-none" 
                  />
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <PropInput 
                    label="Width" 
                    value={floorConfig.width} 
                    unit="px" 
                    onChange={(v) => onUpdateFloorConfig({...floorConfig, width: v})} 
                 />
                 <PropInput 
                    label="Height" 
                    value={floorConfig.height} 
                    unit="px" 
                    onChange={(v) => onUpdateFloorConfig({...floorConfig, height: v})} 
                 />
               </div>
             </div>
           </div>

           <div className="text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">grid_view</span>
              <p className="text-xs text-slate-400 font-medium">
                Adjust the floor size above to match your office layout dimensions.
              </p>
           </div>
        </div>
      </div>
    );
  }

  const isMulti = items.length > 1;
  const item = items[0];

  const handleChange = (field: keyof WorkspaceItem, value: any) => {
    onUpdate({ ...item, [field]: value });
  };

  const handleMultiChange = (updates: Partial<WorkspaceItem>) => {
    onUpdate({ ...item, ...updates });
  };

  const toggleFacility = (facilityId: string) => {
    const currentFacilities = item.facilities || [];
    const newFacilities = currentFacilities.includes(facilityId)
      ? currentFacilities.filter(f => f !== facilityId)
      : [...currentFacilities, facilityId];
    handleChange('facilities', newFacilities);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-5 border-b flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-lg">tune</span>
          <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">
            {isMulti ? `Editing ${items.length} Assets` : 'Asset Config'}
          </h3>
        </div>
        <button onClick={onClose} className="size-8 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"><span className="material-symbols-outlined">close</span></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {!isMulti && (
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-14 rounded-2xl bg-white flex items-center justify-center text-[#0e7181] shadow-md flex-none border border-slate-100">
                <span className="material-symbols-outlined text-3xl">
                  {item.type === 'desk' ? 'desk' : 
                   item.type === 'l-shape' ? 'table_bar' : 
                   item.type === 'meeting' ? 'meeting_room' : 'architecture'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <input type="text" value={item.label} onChange={(e) => handleChange('label', e.target.value)} className="w-full bg-transparent font-black text-slate-900 text-lg focus:outline-none focus:ring-1 focus:ring-slate-200 rounded px-1 -ml-1" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {item.id}</p>
              </div>
            </div>
            
            <button 
                onClick={() => handleChange('locked', !item.locked)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${item.locked ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600'}`}
            >
                <span className="material-symbols-outlined text-[16px]">{item.locked ? 'lock' : 'lock_open'}</span>
                {item.locked ? 'Unlock Position' : 'Lock Position'}
            </button>
          </div>
        )}

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrangement</label>
          <div className="grid grid-cols-2 gap-3">
            <PropInput label="WIDTH" value={item.width} unit="cm" onChange={(v) => handleChange('width', v)} />
            <PropInput label="HEIGHT" value={item.height} unit="cm" onChange={(v) => handleChange('height', v)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <PropInput label="X" value={item.x} onChange={(v) => handleChange('x', v)} />
            <PropInput label="Y" value={item.y} onChange={(v) => handleChange('y', v)} />
            <PropInput label="ROT" value={item.rotation} unit="°" onChange={(v) => handleChange('rotation', v)} />
          </div>
        </div>

        {/* Facilities Section */}
        {!isMulti && (item.category === 'furniture' || item.type === 'meeting') && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facilities</label>
                <div className="grid grid-cols-2 gap-2">
                    {FACILITY_OPTS.map(opt => {
                        const isActive = (item.facilities || []).includes(opt.id);
                        return (
                            <button
                                key={opt.id}
                                onClick={() => toggleFacility(opt.id)}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-[11px] font-bold transition-all ${isActive ? 'bg-[#0e7181]/10 border-[#0e7181] text-[#0e7181]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <span className={`material-symbols-outlined text-[16px] ${isActive ? '' : 'text-slate-400'}`}>{opt.icon}</span>
                                {opt.id}
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Status & Occupancy */}
        {(item.category === 'furniture' || item.type === 'meeting' || item.status === 'occupied') && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
             <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${item.status === 'occupied' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                   {item.status.toUpperCase()}
                </span>
             </div>
             
             <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
               <button 
                 onClick={() => handleMultiChange({ status: 'available', assignee: undefined })}
                 className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase transition-all ${item.status === 'available' ? 'bg-white text-green-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Available
               </button>
               <button 
                 onClick={() => handleChange('status', 'occupied')}
                 className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase transition-all ${item.status === 'occupied' ? 'bg-white text-orange-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Occupied
               </button>
             </div>

             {/* Assignee Card */}
             {!isMulti && (
               <div className="mt-4 space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Occupied By</label>
                 
                 {item.assignee ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4 relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-1 h-full bg-[#0e7181]"></div>
                       <img src={item.assignee.avatar} className="size-10 rounded-full object-cover border-2 border-slate-100" alt={item.assignee.name} />
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate">{item.assignee.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{item.assignee.role}</p>
                       </div>
                       <button 
                         onClick={() => handleMultiChange({ assignee: undefined, status: 'available' })}
                         className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                         title="Unassign"
                       >
                         <span className="material-symbols-outlined text-lg">close</span>
                       </button>
                    </div>
                 ) : (
                    <div className="relative space-y-3">
                      {item.status === 'occupied' && (
                         <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-start gap-2">
                            <span className="material-symbols-outlined text-orange-400 text-sm mt-0.5">warning</span>
                            <p className="text-[10px] font-bold text-orange-700 leading-tight">Item is marked Occupied but no employee assigned.</p>
                         </div>
                      )}
                      
                      <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px] group-focus-within:text-[#0e7181] transition-colors">person_search</span>
                        <input 
                          type="text" 
                          placeholder="Assign employee..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#0e7181]/50 focus:bg-white text-sm outline-none transition-all placeholder:text-slate-400 font-medium"
                        />
                      </div>
                      
                      {filteredEmployees.length > 0 && searchQuery && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                          {filteredEmployees.map(emp => (
                            <button 
                              key={emp.id} 
                              onClick={() => { 
                                handleMultiChange({ assignee: emp, status: 'occupied' });
                                setSearchQuery('');
                              }} 
                              className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-all text-left border-b border-slate-50 last:border-0"
                            >
                              <img src={emp.avatar} className="size-8 rounded-full bg-slate-200" alt={emp.name} />
                              <div>
                                <p className="text-xs font-black text-slate-700">{emp.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">{emp.role}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                 )}
               </div>
             )}
          </div>
        )}
      </div>

      <div className="p-6 border-t bg-slate-50 grid grid-cols-2 gap-3">
        <button onClick={onDuplicate} className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-100 shadow-sm active:scale-95 transition-all">
           <span className="material-symbols-outlined text-[18px]">content_copy</span>
           Duplicate
        </button>
        <button onClick={onDelete} className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-red-100 text-red-500 font-black text-sm hover:bg-red-50 shadow-sm active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[18px]">delete</span>
          Delete
        </button>
      </div>
    </div>
  );
};

const PropInput: React.FC<{ label: string; value: number; unit?: string; onChange: (v: number) => void }> = ({ label, value, unit, onChange }) => (
  <div className="relative group">
    <span className="absolute left-3 top-2 text-[8px] text-slate-300 font-black uppercase tracking-tighter group-focus-within:text-[#0e7181]">{label}</span>
    <input 
      type="number" 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))} 
      className="w-full pl-3 pr-8 pt-5 pb-1 rounded-xl bg-slate-100 border border-transparent focus:border-[#0e7181]/30 focus:bg-white text-xs font-mono font-bold outline-none transition-all" 
    />
    {unit && <span className="absolute right-3 top-3.5 text-[10px] text-slate-300 font-bold">{unit}</span>}
  </div>
);

export default PropertiesPanel;
