import React from 'react';
import { Item, OpnameTransaction, OpnameSummaryStats } from '../types';
import { formatRupiah } from '../lib/storage';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  ClipboardCheck,
  PackageCheck,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  PackagePlus,
  Camera,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Percent
} from 'lucide-react';

interface DashboardProps {
  items: Item[];
  transactions: OpnameTransaction[];
  stats: OpnameSummaryStats;
  onNavigate: (tab: string) => void;
  onOpenScan: () => void;
  onOpenImport: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  items,
  transactions,
  stats,
  onNavigate,
  onOpenScan,
  onOpenImport,
}) => {
  // Compute chart data: Discrepancies by Category
  const categoryStatsMap: Record<string, { category: string; system: number; physical: number; diff: number }> = {};

  transactions
    .filter((t) => t.status === 'Completed')
    .forEach((t) => {
      if (!categoryStatsMap[t.category]) {
        categoryStatsMap[t.category] = { category: t.category, system: 0, physical: 0, diff: 0 };
      }
      categoryStatsMap[t.category].system += t.systemStock;
      categoryStatsMap[t.category].physical += t.physicalStock;
      categoryStatsMap[t.category].diff += t.difference;
    });

  const categoryChartData = Object.values(categoryStatsMap);

  // Compute accuracy status pie data
  const completedTxs = transactions.filter((t) => t.status === 'Completed');
  const exactMatchCount = completedTxs.filter((t) => t.difference === 0).length;
  const surplusCount = completedTxs.filter((t) => t.difference > 0).length;
  const deficitCount = completedTxs.filter((t) => t.difference < 0).length;

  const pieData = [
    { name: 'Sesuai (Match)', value: exactMatchCount, color: '#10b981' }, // Emerald
    { name: 'Surplus (+)', value: surplusCount, color: '#3b82f6' },      // Blue
    { name: 'Defisit (-)', value: deficitCount, color: '#f43f5e' },      // Rose
  ].filter((d) => d.value > 0);

  // Top Items with Discrepancies
  const discrepancyItems = completedTxs
    .filter((t) => t.difference !== 0)
    .sort((a, b) => Math.abs(b.totalValueDiff) - Math.abs(a.totalValueDiff))
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner & Quick Mobile Entry */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <ClipboardCheck className="w-4 h-4 text-emerald-400" />
              Sistem Audit Stok Opname Digital
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Ringkasan Opname & Akurasi Gudang
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pantau selisih stok sistem vs hitungan fisik secara presisi. Mulai hitung fisik atau scan barcode dari perangkat seluler Anda.
            </p>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('incoming')}
              className="flex flex-col items-center justify-center p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-600/20 transition-all group"
            >
              <PackagePlus className="w-6 h-6 mb-1 text-emerald-100 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Barang Masuk</span>
            </button>

            <button
              onClick={() => onNavigate('input')}
              className="flex flex-col items-center justify-center p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/30 transition-all group"
            >
              <PlusCircle className="w-6 h-6 mb-1 text-indigo-200 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Input Opname</span>
            </button>

            <button
              onClick={onOpenScan}
              className="flex flex-col items-center justify-center p-3.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white rounded-2xl transition-all group"
            >
              <Camera className="w-6 h-6 mb-1 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Scan Barcode</span>
            </button>

            <button
              onClick={onOpenImport}
              className="flex flex-col items-center justify-center p-3.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white rounded-2xl transition-all group"
            >
              <FileSpreadsheet className="w-6 h-6 mb-1 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Import Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Akurasi Stok */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Akurasi Stok
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.accuracyRate.toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {exactMatchCount} dari {completedTxs.length} item sesuai 100%
          </p>
        </div>

        {/* Card 2: Total Item Diperiksa */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Item Dihitung
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.completedCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total {items.length} master barang terdaftar
          </p>
        </div>

        {/* Card 3: Selisih Kuantitas (Fisik - System) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Selisih (Qty)
            </span>
            <div className={`p-2 rounded-xl ${
              stats.totalDifference >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {stats.totalDifference >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-extrabold ${
            stats.totalDifference === 0
              ? 'text-emerald-600'
              : stats.totalDifference > 0
              ? 'text-blue-600'
              : 'text-rose-600'
          }`}>
            {stats.totalDifference > 0 ? `+${stats.totalDifference}` : stats.totalDifference}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Hitungan Fisik: {stats.totalPhysicalStock} | System: {stats.totalSystemStock}
          </p>
        </div>

        {/* Card 4: Nilai Moneter Selisih */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nilai Selisih (Rp)
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-extrabold font-mono ${
            stats.totalValueDiscrepancy === 0
              ? 'text-slate-900'
              : stats.totalValueDiscrepancy > 0
              ? 'text-blue-600'
              : 'text-rose-600'
          }`}>
            {formatRupiah(stats.totalValueDiscrepancy)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Dampak finansial dari audit stok
          </p>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Variance Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Perbandingan Stok Sistem vs Fisik per Kategori
              </h3>
              <p className="text-xs text-slate-500">
                Visualisasi selisih kuantitas berdasarkan kelompok barang
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="system" name="Stok Sistem" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="physical" name="Stok Fisik" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Belum ada data transaksi opname selesai.
              </div>
            )}
          </div>
        </div>

        {/* Discrepancy Status Distribution Pie Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Distribusi Hasil Opname
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Persentase kecocokan fisik dibanding sistem
            </p>

            <div className="h-52 w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Belum ada data transaksi.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Dibatalkan: <strong className="text-rose-600">{stats.cancelledCount}</strong></span>
            <span>Draft: <strong className="text-amber-600">{stats.draftCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Top Discrepancies Table / Warning List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Item dengan Selisih Terbesar
              </h3>
              <p className="text-xs text-slate-500">
                Barang yang memerlukan perhatian audit ulang atau tindakan penyesuaian
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {discrepancyItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3">Kode</th>
                  <th className="p-3">Nama Barang</th>
                  <th className="p-3">Lokasi</th>
                  <th className="p-3 text-right">System</th>
                  <th className="p-3 text-right">Fisik</th>
                  <th className="p-3 text-right">Selisih</th>
                  <th className="p-3 text-right">Nilai Selisih</th>
                  <th className="p-3">Kondisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {discrepancyItems.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-semibold text-indigo-600">
                      {tx.itemCode}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      {tx.itemName}
                    </td>
                    <td className="p-3 text-slate-500">{tx.location}</td>
                    <td className="p-3 text-right">{tx.systemStock} {tx.unit}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {tx.physicalStock} {tx.unit}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        tx.difference > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.difference > 0 ? `+${tx.difference}` : tx.difference}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {formatRupiah(tx.totalValueDiff)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tx.condition === 'Bagus'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {tx.condition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-700">Tidak ada selisih stok yang terdeteksi.</p>
            <p className="text-slate-400 mt-0.5">Semua hasil opname yang diselesaikan cocok 100% dengan stok sistem!</p>
          </div>
        )}
      </div>
    </div>
  );
};
