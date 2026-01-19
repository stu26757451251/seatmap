
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppMode, WorkspaceItem, FloorConfig } from './types';
import { INITIAL_ITEMS } from './constants';
import Header from './components/Header';
import AssetLibrary from './components/AssetLibrary';
import PropertiesPanel from './components/PropertiesPanel';
import BookingPanel from './components/BookingPanel';
import FloorPlanCanvas from './components/FloorPlanCanvas';
import StatsModal from './components/StatsModal';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('admin');
  const [items, setItems] = useState<WorkspaceItem[]>(INITIAL_ITEMS);
  const [selectedIds, setSelectedIds] = useState<string[]>(['D-101']);
  const [floorConfig, setFloorConfig] = useState<FloorConfig>({ width: 1600, height: 1200, name: 'Level 4' });
  const [zoom, setZoom] = useState(1);
  const [notification, showNotification] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showFacilities, setShowFacilities] = useState(false);
  
  // Track cursor position on board for pasting
  const cursorPosRef = useRef<{x: number, y: number} | null>(null);

  // Clipboard state for Copy/Paste
  const [clipboard, setClipboard] = useState<WorkspaceItem[]>([]);

  // Undo/Redo State
  const history = useRef<WorkspaceItem[][]>([INITIAL_ITEMS]);
  const historyIndex = useRef<number>(0);

  const notify = (msg: string) => {
    showNotification(msg);
    setTimeout(() => showNotification(null), 3000);
  };

  const pushHistory = (newItems: WorkspaceItem[]) => {
    const nextIndex = historyIndex.current + 1;
    history.current = [...history.current.slice(0, nextIndex), newItems];
    historyIndex.current = nextIndex;
    setItems(newItems);
  };

  const undo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current -= 1;
      setItems(history.current[historyIndex.current]);
      notify("Undo successful");
    }
  };

  const redo = () => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current += 1;
      setItems(history.current[historyIndex.current]);
      notify("Redo successful");
    }
  };

  const handleDuplicateItems = (idsToDuplicate: string[]) => {
    const itemsToClone = items.filter(i => idsToDuplicate.includes(i.id));
    if (itemsToClone.length === 0) return;

    const newItems = itemsToClone.map(item => ({
      ...item,
      id: `${item.type.toUpperCase()}-${Math.floor(Math.random() * 100000)}`,
      x: item.x + 20,
      y: item.y + 20,
      label: `${item.label} (Copy)`
    }));

    const updatedItems = [...items, ...newItems];
    pushHistory(updatedItems);
    setSelectedIds(newItems.map(i => i.id));
    notify(`Duplicated ${newItems.length} item(s)`);
  };

  const handleCopy = () => {
    const selected = items.filter(i => selectedIds.includes(i.id));
    if (selected.length > 0) {
      setClipboard(selected);
      notify(`Copied ${selected.length} item(s)`);
    }
  };

  const handlePaste = () => {
    if (clipboard.length === 0) return;
    
    // Calculate center of clipboard items
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    clipboard.forEach(i => {
        minX = Math.min(minX, i.x);
        minY = Math.min(minY, i.y);
        maxX = Math.max(maxX, i.x + i.width);
        maxY = Math.max(maxY, i.y + i.height);
    });
    const centerX = minX + (maxX - minX) / 2;
    const centerY = minY + (maxY - minY) / 2;

    // Determine target center (Mouse Position or Default Offset)
    const targetX = cursorPosRef.current ? cursorPosRef.current.x : centerX + 50;
    const targetY = cursorPosRef.current ? cursorPosRef.current.y : centerY + 50;

    const deltaX = targetX - centerX;
    const deltaY = targetY - centerY;

    const newItems = clipboard.map(item => ({
      ...item,
      id: `${item.type.toUpperCase()}-${Math.floor(Math.random() * 100000)}`,
      x: Math.round(item.x + deltaX),
      y: Math.round(item.y + deltaY),
      label: item.label, 
      locked: false 
    }));

    pushHistory([...items, ...newItems]);
    setSelectedIds(newItems.map(i => i.id));
    notify(`Pasted ${newItems.length} item(s)`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // Undo: Ctrl + Z
      if (isCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      // Redo: Ctrl + Y or Ctrl + Shift + Z
      if ((isCtrl && e.key === 'y') || (isCtrl && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
        return;
      }
      // Copy: Ctrl + C
      if (isCtrl && e.key === 'c') {
        if (document.activeElement?.tagName !== 'INPUT') {
            e.preventDefault();
            handleCopy();
        }
      }
      // Paste: Ctrl + V
      if (isCtrl && e.key === 'v') {
         if (document.activeElement?.tagName !== 'INPUT') {
            e.preventDefault();
            handlePaste();
         }
      }
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName !== 'INPUT' && selectedIds.length > 0) {
          handleDeleteItems(selectedIds);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, items, clipboard]); 

  const handleToggleMode = useCallback(() => {
    setMode(prev => prev === 'admin' ? 'booking' : 'admin');
    setSelectedIds([]);
  }, []);

  const handleUpdateItems = useCallback((updatedItems: WorkspaceItem[]) => {
    const updatedMap = new Map(updatedItems.map(i => [i.id, i]));
    const newItems = items.map(item => updatedMap.get(item.id) || item);
    pushHistory(newItems);
  }, [items]);

  const handleUpdateItem = useCallback((updatedItem: WorkspaceItem) => {
    handleUpdateItems([updatedItem]);
  }, [handleUpdateItems]);

  const handleAddItem = (type: WorkspaceItem['type'], category: WorkspaceItem['category'], label: string) => {
    const defaults: Record<string, { w: number; h: number }> = {
      wall: { w: 400, h: 10 },
      'zone-box': { w: 300, h: 250 },
      desk: { w: 120, h: 70 },
      'l-shape': { w: 160, h: 160 },
      chair: { w: 45, h: 45 },
      storage: { w: 80, h: 40 },
      meeting: { w: 250, h: 180 },
      lounge: { w: 200, h: 150 },
      divider: { w: 200, h: 6 },
    };
    const size = defaults[type] || { w: 100, h: 100 };
    const newItem: WorkspaceItem = {
      id: `${type.toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
      type, category,
      x: 300 + Math.random() * 50,
      y: 200 + Math.random() * 50,
      width: size.w, height: size.h,
      rotation: 0,
      label: `${label} ${items.length + 1}`,
      status: 'available',
      color: type === 'zone-box' ? 'rgba(14, 113, 129, 0.05)' : undefined
    };
    pushHistory([...items, newItem]);
    setSelectedIds([newItem.id]);
    notify(`Added ${label}`);
  };

  const handleDeleteItems = (ids: string[]) => {
    pushHistory(items.filter(item => !ids.includes(item.id)));
    setSelectedIds([]);
    notify(`${ids.length} item(s) deleted`);
  };

  const handleConfirmBooking = (itemId: string) => {
    const updated = items.map(i => i.id === itemId ? {
      ...i,
      status: 'occupied' as const,
      assignee: { id: 'me', name: 'Current User', role: 'Employee', avatar: 'https://i.pravatar.cc/150?u=me', department: 'Engineering' }
    } : i);
    pushHistory(updated);
    notify("Booking confirmed!");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f9fafb]">
      <Header 
        mode={mode} 
        onToggleMode={handleToggleMode} 
        floorName={floorConfig.name}
        onOpenStats={() => setShowStats(true)}
        showFacilities={showFacilities}
        onToggleFacilities={() => {
            setShowFacilities(!showFacilities);
            notify(showFacilities ? "Facilities layer hidden" : "Facilities layer visible");
        }}
      />
      
      <StatsModal 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
        items={items} 
      />

      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span className="text-sm font-bold">{notification}</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {mode === 'admin' && (
          <aside className="w-80 flex flex-col border-r border-slate-200 bg-white z-20 shadow-sm">
            <AssetLibrary onAddAsset={handleAddItem} />
          </aside>
        )}

        <main className="flex-1 relative overflow-hidden bg-[#f0f2f5] flex flex-col">
          <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-2 flex items-center justify-between z-10 shadow-sm flex-none">
            <div className="flex gap-4">
               <div className="flex items-center gap-1">
                  <span className="text-sm font-bold border-b-2 border-[#0e7181] text-[#0e7181] px-3 py-1">{floorConfig.name}</span>
               </div>
               <div className="w-px h-6 bg-slate-200 self-center mx-2"></div>
               <div className="flex gap-2">
                  <button onClick={undo} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Undo (Ctrl+Z)"><span className="material-symbols-outlined text-[20px]">undo</span></button>
                  <button onClick={redo} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Redo (Ctrl+Y)"><span className="material-symbols-outlined text-[20px]">redo</span></button>
               </div>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="bg-[#0e7181] text-white size-5 flex items-center justify-center rounded-full text-[10px]">{selectedIds.length}</span>
                Selected
            </div>
          </div>

          <FloorPlanCanvas 
            items={items} 
            selectedIds={selectedIds} 
            onSelectItems={setSelectedIds}
            onUpdateItems={handleUpdateItems}
            zoom={zoom}
            onZoomChange={setZoom}
            mode={mode}
            floorConfig={floorConfig}
            onCursorMove={(x, y) => { cursorPosRef.current = {x, y}; }}
            showFacilities={showFacilities}
          />
          
          {/* Zoom Controls */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-30">
            <div className="flex flex-col bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              <button 
                onClick={() => setZoom(z => Math.min(3, z + 0.2))} 
                className="p-3 hover:bg-slate-50 border-b border-slate-100 text-slate-600 active:bg-slate-100 transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined block">add</span>
              </button>
              <button 
                onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} 
                className="p-3 hover:bg-slate-50 text-slate-600 active:bg-slate-100 transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined block">remove</span>
              </button>
            </div>
            <button 
              onClick={() => setZoom(1)} 
              className="p-3 bg-white rounded-xl shadow-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all active:scale-95" 
              title="Reset Zoom (100%)"
            >
              <span className="material-symbols-outlined block">center_focus_strong</span>
            </button>
          </div>
        </main>

        <aside className="w-96 flex flex-col border-l border-slate-200 bg-white z-20 shadow-2xl">
          {mode === 'admin' ? (
            <PropertiesPanel 
              items={items.filter(i => selectedIds.includes(i.id))} 
              onUpdate={handleUpdateItem} 
              onDelete={() => handleDeleteItems(selectedIds)}
              onClose={() => setSelectedIds([])}
              floorConfig={floorConfig}
              onUpdateFloorConfig={setFloorConfig}
              onDuplicate={() => handleDuplicateItems(selectedIds)}
            />
          ) : (
            <BookingPanel 
              item={items.find(i => selectedIds.includes(i.id)) || null} 
              onConfirm={() => selectedIds[0] && handleConfirmBooking(selectedIds[0])} 
            />
          )}
        </aside>
      </div>
    </div>
  );
};

export default App;
