import React from 'react';
import {
  Boxes,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Trash2,
  Sparkles,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenImport: () => void;
  onExportTransactions: () => void;
  onResetData: () => void;
  pendingDraftsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenImport,
  onExportTransactions,
  onResetData,
  pendingDraftsCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-xl shadow-md shadow-emerald-500/20 text-white">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  Stok Opname Manager
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Realtime Cache
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Sistem Pencatatan, Audit Fisik & Analisis Selisih Stok
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('input')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'input'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              Input Opname
            </button>
            <button
              onClick={() => setActiveTab('incoming')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'incoming'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-emerald-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              Barang Masuk
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg transition-all relative ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              Riwayat Transaksi
              {pendingDraftsCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingDraftsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'items'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              Master Barang
            </button>
          </nav>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              title="Import Data Item dari Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Import Excel</span>
            </button>

            <button
              onClick={onExportTransactions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              title="Export Laporan Riwayat Opname ke Excel"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Export Report</span>
            </button>

            <button
              onClick={onResetData}
              className="p-1.5 bg-slate-800 hover:bg-rose-950/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-800 rounded-lg transition-colors cursor-pointer"
              title="Hapus / Kosongkan Semua Data"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
