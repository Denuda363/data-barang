import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  PackagePlus,
  History,
  Package
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenImport: () => void;
  pendingDraftsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  pendingDraftsCount,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-slate-400 px-1 py-1 shadow-lg pb-safe">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] transition-colors ${
            activeTab === 'dashboard'
              ? 'text-indigo-400 font-semibold'
              : 'hover:text-slate-300'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 mb-0.5 ${activeTab === 'dashboard' ? 'scale-110 transition-transform' : ''}`} />
          <span>Dashboard</span>
        </button>

        {/* Tab 2: Barang Masuk */}
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] transition-colors ${
            activeTab === 'incoming'
              ? 'text-emerald-400 font-semibold'
              : 'hover:text-slate-300'
          }`}
        >
          <PackagePlus className={`w-5 h-5 mb-0.5 ${activeTab === 'incoming' ? 'scale-110 transition-transform' : ''}`} />
          <span>In</span>
        </button>

        {/* Tab 3: Input Opname */}
        <button
          onClick={() => setActiveTab('input')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] transition-colors relative ${
            activeTab === 'input'
              ? 'text-indigo-400 font-semibold'
              : 'hover:text-slate-300'
          }`}
        >
          <PlusCircle className={`w-5 h-5 mb-0.5 ${activeTab === 'input' ? 'scale-110 transition-transform' : ''}`} />
          <span>Opname</span>
        </button>

        {/* Tab 4: Riwayat */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] transition-colors relative ${
            activeTab === 'history'
              ? 'text-indigo-400 font-semibold'
              : 'hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <History className={`w-5 h-5 mb-0.5 ${activeTab === 'history' ? 'scale-110 transition-transform' : ''}`} />
            {pendingDraftsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-900">
                {pendingDraftsCount}
              </span>
            )}
          </div>
          <span>Riwayat</span>
        </button>

        {/* Tab 5: Master Item */}
        <button
          onClick={() => setActiveTab('items')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] transition-colors ${
            activeTab === 'items'
              ? 'text-indigo-400 font-semibold'
              : 'hover:text-slate-300'
          }`}
        >
          <Package className={`w-5 h-5 mb-0.5 ${activeTab === 'items' ? 'scale-110 transition-transform' : ''}`} />
          <span>Barang</span>
        </button>
      </div>
    </div>
  );
};
