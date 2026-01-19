
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { WorkspaceItem, AppMode, FloorConfig } from '../types';
import { FACILITY_OPTS } from '../constants';

interface FloorPlanCanvasProps {
  items: WorkspaceItem[];
  selectedIds: string[];
  onSelectItems: (ids: string[]) => void;
  onUpdateItems: (items: WorkspaceItem[]) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  mode: AppMode;
  floorConfig: FloorConfig;
  onCursorMove?: (x: number, y: number) => void;
  showFacilities: boolean;
}

type TransformType = 'move' | 'rotate' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br';

const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({ 
  items, 
  selectedIds, 
  onSelectItems, 
  onUpdateItems, 
  zoom, 
  onZoomChange,
  mode,
  floorConfig,
  onCursorMove,
  showFacilities
}) => {
  const [transformState, setTransformState] = useState<{ type: TransformType; startX: number; startY: number; startItems: WorkspaceItem[]; initialRotation?: number; startAngle?: number } | null>(null);
  const [marquee, setMarquee] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sortedItems = useMemo(() => {
    // Structural bottom, Zones middle, Furniture top
    const order = { structural: 0, zone: 1, furniture: 2 };
    return [...items].sort((a, b) => {
        if (order[a.category] !== order[b.category]) {
            return order[a.category] - order[b.category];
        }
        const aSelected = selectedIds.includes(a.id) ? 1 : 0;
        const bSelected = selectedIds.includes(b.id) ? 1 : 0;
        return aSelected - bSelected;
    });
  }, [items, selectedIds]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        onZoomChange(Math.min(3, Math.max(0.2, zoom + delta)));
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => container?.removeEventListener('wheel', handleWheel);
  }, [zoom, onZoomChange]);

  const getBoardCoords = (clientX: number, clientY: number) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom
    };
  };

  const handleMouseDown = (e: React.MouseEvent, item?: WorkspaceItem, type: TransformType = 'move') => {
    if (mode !== 'admin') {
      if (item && (item.category === 'furniture' || item.type === 'meeting')) {
        onSelectItems([item.id]);
      }
      return;
    }

    if (!item) {
      if (e.target !== e.currentTarget && e.target !== boardRef.current) return;
      const { x, y } = getBoardCoords(e.clientX, e.clientY);
      setMarquee({ x1: x, y1: y, x2: x, y2: y });
      onSelectItems([]);
      return;
    }

    e.stopPropagation();

    if (item.locked && type !== 'move') {
         if (!selectedIds.includes(item.id)) {
            onSelectItems([item.id]);
         }
         return; 
    }
    
    let currentSelection = selectedIds;
    if (e.shiftKey) {
      currentSelection = currentSelection.includes(item.id) 
        ? currentSelection.filter(id => id !== item.id) 
        : [...currentSelection, item.id];
      onSelectItems(currentSelection);
    } else if (!selectedIds.includes(item.id)) {
      currentSelection = [item.id];
      onSelectItems(currentSelection);
    }

    if (item.locked) return;

    let initialRotation = item.rotation;
    let startAngle = 0;
    if (type === 'rotate') {
        const rect = boardRef.current?.getBoundingClientRect();
        if (rect) {
            const centerX = rect.left + (item.x + item.width / 2) * zoom;
            const centerY = rect.top + (item.y + item.height / 2) * zoom;
            startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        }
    }

    setTransformState({
      type,
      startX: e.clientX,
      startY: e.clientY,
      startItems: items.filter(i => currentSelection.includes(i.id)),
      initialRotation,
      startAngle
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Track Cursor for Parent (Paste logic)
      const { x, y } = getBoardCoords(e.clientX, e.clientY);
      if (onCursorMove) onCursorMove(x, y);

      if (marquee) {
        setMarquee(prev => prev ? ({ ...prev, x2: x, y2: y }) : null);
        return;
      }

      if (!transformState) return;

      const { type, startX, startY, startItems, initialRotation, startAngle } = transformState;
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;

      const updated = startItems.map(item => {
        if (item.locked) return item;

        let u = { ...item };
        
        if (type === 'move') {
          u.x = Math.round(item.x + dx);
          u.y = Math.round(item.y + dy);
        } 
        else if (type === 'rotate') {
          const rect = boardRef.current?.getBoundingClientRect();
          if (rect) {
             const centerX = rect.left + (item.x + item.width / 2) * zoom;
             const centerY = rect.top + (item.y + item.height / 2) * zoom;
             const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
             
             let angleDelta = (currentAngle - (startAngle || 0)) * (180 / Math.PI);
             let newRot = (initialRotation || 0) + angleDelta;

             if (e.shiftKey) {
                 u.rotation = Math.round(newRot / 15) * 15;
             } else {
                 u.rotation = Math.round(newRot * 10) / 10;
             }
          }
        } 
        else if (type.startsWith('resize')) {
          if (type.includes('r')) u.width = Math.max(20, item.width + dx);
          if (type.includes('b')) u.height = Math.max(20, item.height + dy);
          if (type.includes('l')) { u.x = item.x + dx; u.width = Math.max(20, item.width - dx); }
          if (type.includes('t')) { u.y = item.y + dy; u.height = Math.max(20, item.height - dy); }
        }
        return u;
      });

      onUpdateItems(updated);
    };

    const handleMouseUp = () => {
      if (marquee) {
        const minX = Math.min(marquee.x1, marquee.x2);
        const maxX = Math.max(marquee.x1, marquee.x2);
        const minY = Math.min(marquee.y1, marquee.y2);
        const maxY = Math.max(marquee.y1, marquee.y2);
        
        const selected = items.filter(i => {
          const cx = i.x + i.width / 2;
          const cy = i.y + i.height / 2;
          return cx >= minX && cx <= maxX && cy >= minY && cy <= maxY;
        }).map(i => i.id);
        
        onSelectItems(selected);
        setMarquee(null);
      }
      setTransformState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [transformState, marquee, zoom, items, onSelectItems, onUpdateItems, onCursorMove]);

  // VISUAL RENDERER
  const renderItemVisual = (item: WorkspaceItem, isSelected: boolean) => {
    const isOccupied = item.status === 'occupied';
    const accentColor = isSelected ? '#0e7181' : (isOccupied ? '#f59e0b' : '#cbd5e1');
    const bgClass = isSelected ? 'bg-[#0e7181]/5' : (isOccupied ? 'bg-amber-50' : 'bg-white');
    const borderClass = isSelected ? 'border-[#0e7181]' : (isOccupied ? 'border-amber-200' : 'border-slate-300');

    // NAME TAG HELPER
    const NameTag = () => item.assignee ? (
       <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-20 pointer-events-none">
          <span className="text-[10px] font-black text-slate-800 text-center leading-tight bg-white/80 px-1 rounded backdrop-blur-[1px] shadow-sm max-w-full truncate">
             {item.assignee.name.split(' ')[0]}
          </span>
       </div>
    ) : null;

    const Avatar = () => item.assignee ? (
      <div className="absolute -top-3 -right-3 size-8 rounded-full border-2 border-white shadow-md overflow-hidden ring-1 ring-slate-100 z-10 bg-white">
         <img src={item.assignee.avatar} className="w-full h-full object-cover" title={item.assignee.name} />
      </div>
    ) : null;

    // FACILITIES ICONS RENDERER
    const FacilityIcons = () => {
        if (!showFacilities || !item.facilities || item.facilities.length === 0) return null;
        
        // Take up to 3 facilities to display on the item to avoid overflow
        const displayFacilities = item.facilities.slice(0, 3);
        
        return (
            <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-0.5 z-20 pointer-events-none">
                {displayFacilities.map(fId => {
                    const icon = FACILITY_OPTS.find(opt => opt.id === fId)?.icon;
                    if (!icon) return null;
                    return (
                        <div key={fId} className="size-4 bg-slate-900/80 rounded-full flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-[10px]">{icon}</span>
                        </div>
                    );
                })}
                {item.facilities.length > 3 && (
                    <div className="size-4 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-[8px] font-bold">
                        +{item.facilities.length - 3}
                    </div>
                )}
            </div>
        );
    };

    switch (item.type) {
      case 'desk':
        return (
          <div className={`w-full h-full border-2 rounded-lg relative transition-colors ${bgClass} ${borderClass}`}>
            <div className="absolute top-1 left-1 right-1 h-1 bg-slate-100 rounded-sm"></div>
            <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 border border-slate-200 bg-white rounded-sm shadow-sm ${item.assignee ? 'opacity-0' : 'opacity-100'}`}></div>
            
            {/* Label / Name */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-2">
              {!item.assignee && <span className={`text-[10px] font-bold ${isSelected ? 'text-[#0e7181]' : 'text-slate-400'}`}>{item.label}</span>}
            </div>
            
            <NameTag />
            <Avatar />
            <FacilityIcons />
          </div>
        );
      case 'l-shape':
        return (
          <div className="w-full h-full relative">
            <div 
              className={`absolute inset-0 border-2 transition-colors ${bgClass} ${borderClass}`}
              style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 40%, 40% 40%, 40% 100%, 0% 100%)' }}
            ></div>
            {!item.assignee && <div className={`absolute top-2 left-2 text-[9px] font-bold ${isSelected ? 'text-[#0e7181]' : 'text-slate-400'}`}>{item.label}</div>}
            
            <div className="absolute left-[50%] top-[60%] -translate-x-1/2 -translate-y-1/2">
                <NameTag />
            </div>
            <Avatar />
            <div className="absolute bottom-1 right-1">
                <FacilityIcons />
            </div>
          </div>
        );
      case 'chair':
        return (
          <div className={`w-full h-full border-2 rounded-full flex items-center justify-center transition-colors ${bgClass} ${borderClass}`}>
            <div className="w-3/4 h-3/4 bg-white border border-slate-200 rounded-full shadow-inner relative">
               <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-slate-300 rounded-full opacity-50"></div>
            </div>
             {item.assignee && (
              <div className="absolute top-0 right-0 size-6 rounded-full border border-white shadow overflow-hidden z-10">
                <img src={item.assignee.avatar} className="w-full h-full object-cover" title={item.assignee.name} />
              </div>
            )}
          </div>
        );
      case 'storage':
        return (
          <div className={`w-full h-full border-2 rounded flex flex-col items-center justify-evenly p-1 transition-colors ${bgClass} ${borderClass}`}>
            <div className="w-full h-px bg-slate-200"></div>
            <div className="w-full h-px bg-slate-200"></div>
            <div className="flex justify-between w-full px-1">
               <div className="size-1 rounded-full bg-slate-300"></div>
               <div className="size-1 rounded-full bg-slate-300"></div>
            </div>
          </div>
        );
      case 'meeting':
        return (
          <div className={`w-full h-full border-2 rounded-3xl flex flex-col items-center justify-center gap-2 p-2 transition-colors bg-slate-50 ${borderClass}`}>
             <div className="w-3/4 h-3/5 border-2 border-slate-200 bg-white rounded-xl shadow-sm flex items-center justify-center relative">
                <span className="material-symbols-outlined text-slate-300 text-lg">groups</span>
                {item.assignee && (
                   <div className="absolute inset-0 bg-white rounded-xl flex items-center justify-center">
                     <span className="text-[10px] font-black text-slate-800 text-center leading-none p-1">
                        Booked by<br/>{item.assignee.name.split(' ')[0]}
                     </span>
                   </div>
                )}
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
             {item.assignee && (
              <div className="absolute bottom-2 right-2 size-6 rounded-full border border-white shadow overflow-hidden z-10">
                <img src={item.assignee.avatar} className="w-full h-full object-cover" title={item.assignee.name} />
              </div>
            )}
            <FacilityIcons />
          </div>
        );
      case 'lounge':
        return (
          <div className={`w-full h-full border-2 rounded-[30px] flex items-center justify-center p-2 transition-colors ${isSelected ? 'bg-pink-50 border-[#0e7181]' : 'bg-pink-50/20 border-pink-200'}`}>
             <span className="material-symbols-outlined text-pink-300 text-2xl">weekend</span>
             {item.assignee && (
              <div className="absolute top-0 right-0 size-6 rounded-full border border-white shadow overflow-hidden z-10">
                <img src={item.assignee.avatar} className="w-full h-full object-cover" title={item.assignee.name} />
              </div>
            )}
          </div>
        );
      case 'wall':
        return <div className={`w-full h-full bg-slate-800 shadow-md ${isSelected ? 'ring-2 ring-[#0e7181] ring-offset-1' : ''}`}></div>;
      case 'zone-box':
        return (
          <div className={`w-full h-full border-2 border-dashed flex items-start justify-center pt-2 transition-colors ${isSelected ? 'border-[#0e7181] bg-[#0e7181]/5' : 'border-slate-300 bg-slate-50/10'}`} style={{ backgroundColor: item.color }}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 select-none bg-white/50 px-2 rounded">{item.label}</span>
          </div>
        );
      case 'divider':
        return <div className={`w-full h-full bg-slate-300 rounded-full ${isSelected ? 'ring-1 ring-[#0e7181]' : ''}`}></div>;
      default:
        return <div className={`w-full h-full border-2 ${bgClass} ${borderClass}`}></div>;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 relative overflow-auto custom-scrollbar bg-[#f0f2f5]"
      onMouseDown={(e) => handleMouseDown(e)}
    >
      <div 
        className="p-[500px] flex items-center justify-center min-w-[max-content] min-h-[max-content] relative transition-transform duration-75 origin-top-left"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        <div 
          ref={boardRef}
          className="relative bg-white border border-slate-200 shadow-2xl overflow-hidden cursor-crosshair select-none"
          style={{ width: floorConfig.width, height: floorConfig.height }}
          onMouseDown={(e) => handleMouseDown(e)}
        >
          <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none"></div>

          {marquee && (
            <div className="absolute border-2 border-[#0e7181] bg-[#0e7181]/10 z-[100] pointer-events-none" style={{
              left: Math.min(marquee.x1, marquee.x2),
              top: Math.min(marquee.y1, marquee.y2),
              width: Math.abs(marquee.x1 - marquee.x2),
              height: Math.abs(marquee.y1 - marquee.y2),
            }}></div>
          )}

          {sortedItems.map(item => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`absolute group ${mode === 'admin' ? (item.locked ? 'cursor-not-allowed' : 'cursor-move') : 'cursor-pointer'} ${isSelected ? 'z-50' : ''}`}
                style={{
                  left: item.x, top: item.y, width: item.width, height: item.height,
                  transform: `rotate(${item.rotation}deg)`,
                  transition: transformState?.startItems.some(i => i.id === item.id) ? 'none' : 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseDown={(e) => handleMouseDown(e, item)}
              >
                {renderItemVisual(item, isSelected)}
                
                {item.locked && (
                   <div className="absolute top-1 right-1 bg-slate-800/80 p-1 rounded-full text-white pointer-events-none z-20">
                      <span className="material-symbols-outlined text-[10px] block">lock</span>
                   </div>
                )}

                {isSelected && mode === 'admin' && !item.locked && (
                  <>
                    <Handle type="resize-tl" onMouseDown={(e) => handleMouseDown(e, item, 'resize-tl')} className="-top-1.5 -left-1.5 cursor-nwse-resize" />
                    <Handle type="resize-tr" onMouseDown={(e) => handleMouseDown(e, item, 'resize-tr')} className="-top-1.5 -right-1.5 cursor-nesw-resize" />
                    <Handle type="resize-bl" onMouseDown={(e) => handleMouseDown(e, item, 'resize-bl')} className="-bottom-1.5 -left-1.5 cursor-nesw-resize" />
                    <Handle type="resize-br" onMouseDown={(e) => handleMouseDown(e, item, 'resize-br')} className="-bottom-1.5 -right-1.5 cursor-nwse-resize" />
                    
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                       <div className="bg-[#0e7181] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                         {Math.round(item.rotation)}°
                       </div>
                       <div 
                         className="size-6 rounded-full bg-white border-2 border-[#0e7181] shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform flex items-center justify-center z-[60]"
                         onMouseDown={(e) => handleMouseDown(e, item, 'rotate')}
                       >
                         <span className="material-symbols-outlined text-[14px] text-[#0e7181]">rotate_right</span>
                       </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Handle: React.FC<{ onMouseDown: (e: React.MouseEvent) => void; className: string; type: string }> = ({ onMouseDown, className }) => (
  <div onMouseDown={onMouseDown} className={`absolute size-3.5 bg-white border-2 border-[#0e7181] rounded shadow z-50 hover:bg-[#0e7181] transition-colors ${className}`} />
);

export default FloorPlanCanvas;
