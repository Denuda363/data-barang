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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 px-2 py-1.5 shadow-2xl">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'text-indigo-400 bg-indigo-950/60 font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        {/* Tab 2: Barang Masuk */}
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-all ${
            activeTab === 'incoming'
              ? 'text-emerald-400 bg-emerald-950/60 font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <PackagePlus className="w-5 h-5 mb-0.5 text-emerald-400" />
          <span>Barang Masuk</span>
        </button>

        {/* Tab 3: Input Opname */}
        <button
          onClick={() => setActiveTab('input')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-all relative ${
            activeTab === 'input'
              ? 'text-indigo-400 bg-indigo-950/60 font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-5 h-5 mb-0.5 text-indigo-400" />
          <span>Opname</span>
        </button>

        {/* Tab 4: Riwayat */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-all relative ${
            activeTab === 'history'
              ? 'text-indigo-400 bg-indigo-950/60 font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <History className="w-5 h-5 mb-0.5" />
            {pendingDraftsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-slate-900">
                {pendingDraftsCount}
              </span>
            )}
          </div>
          <span>Riwayat</span>
        </button>

        {/* Tab 5: Master Item */}
        <button
          onClick={() => setActiveTab('items')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-all ${
            activeTab === 'items'
              ? 'text-indigo-400 bg-indigo-950/60 font-bold'
              : 'hover:text-slate-200'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Barang</span>
        </button>
      </div>
    </div>
  );
};
