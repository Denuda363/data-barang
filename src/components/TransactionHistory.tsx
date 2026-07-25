import React, { useState } from 'react';
import { OpnameTransaction, TransactionStatus } from '../types';
import { formatRupiah } from '../lib/storage';
import { exportTransactionsToExcel } from '../lib/excelUtils';
import {
  History,
  Search,
  Filter,
  Download,
  Edit3,
  Ban,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  Clock,
  User,
  MapPin,
  Tag,
  ArrowUpDown
} from 'lucide-react';

interface TransactionHistoryProps {
  transactions: OpnameTransaction[];
  onOpenEdit: (tx: OpnameTransaction) => void;
  onOpenCancel: (tx: OpnameTransaction) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onOpenEdit,
  onOpenCancel,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'diffValue'>('date');

  // Categories list
  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  // Filter transactions
  const filteredTxs = transactions.filter((t) => {
    // Search query
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.itemCode.toLowerCase().includes(q) ||
      t.itemName.toLowerCase().includes(q) ||
      t.counterName.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q);

    // Status filter
    const matchesStatus =
      statusFilter === 'ALL' || t.status === statusFilter;

    // Category filter
    const matchesCategory =
      categoryFilter === 'ALL' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort
  const sortedTxs = [...filteredTxs].sort((a, b) => {
    if (sortBy === 'diffValue') {
      return Math.abs(b.totalValueDiff) - Math.abs(a.totalValueDiff);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-5 pb-16 animate-in fade-in duration-300">
      {/* Header & Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Riwayat Transaksi Stok Opname
            </h2>
            <p className="text-xs text-slate-500">
              Daftar pencatatan audit stok fisik. Anda dapat mengubah (edit) atau membatalkan (cancel) transaksi.
            </p>
          </div>

          <button
            onClick={() => exportTransactionsToExcel(sortedTxs)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            Export Laporan Excel ({sortedTxs.length})
          </button>
        </div>

        {/* Search & Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {/* Search Field */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. TRX, Kode, Nama Barang, Petugas..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Status Transaksi</option>
              <option value="Completed">Selesai (Completed)</option>
              <option value="Draft">Draft (Belum Selesai)</option>
              <option value="Cancelled">Dibatalkan (Cancelled)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-3">No. Transaksi</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Barang & Lokasi</th>
                <th className="p-3 text-right">System</th>
                <th className="p-3 text-right">Fisik</th>
                <th className="p-3 text-right">Selisih</th>
                <th className="p-3 text-right">Nilai Selisih</th>
                <th className="p-3">Petugas</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi (Edit / Cancel)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedTxs.length > 0 ? (
                sortedTxs.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      tx.status === 'Cancelled' ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-indigo-600">
                      {tx.id}
                    </td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      <div>{tx.date}</div>
                      <div className="text-[10px] text-slate-400">{tx.time} WIB</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{tx.itemName}</div>
                      <div className="text-[11px] text-slate-500">
                        Kode: <span className="font-mono text-indigo-600">{tx.itemCode}</span> • {tx.location}
                      </div>
                    </td>
                    <td className="p-3 text-right">{tx.systemStock} {tx.unit}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {tx.physicalStock} {tx.unit}
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          tx.difference === 0
                            ? 'bg-slate-100 text-slate-700'
                            : tx.difference > 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.difference > 0 ? `+${tx.difference}` : tx.difference}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {formatRupiah(tx.totalValueDiff)}
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{tx.counterName}</td>
                    <td className="p-3">
                      {tx.status === 'Completed' && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          Selesai
                        </span>
                      )}
                      {tx.status === 'Draft' && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                          Draft
                        </span>
                      )}
                      {tx.status === 'Cancelled' && (
                        <span
                          className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]"
                          title={tx.cancelReason}
                        >
                          Dibatalkan
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {tx.status !== 'Cancelled' ? (
                          <>
                            <button
                              onClick={() => onOpenEdit(tx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-200 transition-colors"
                              title="Edit Hasil Opname"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => onOpenCancel(tx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 transition-colors"
                              title="Batalkan Transaksi Opname Ini"
                            >
                              <Ban className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-rose-500 font-medium italic">
                            Dibatalkan ({tx.cancelReason?.slice(0, 15)}...)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    Tidak ada transaksi opname yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Phone Card View (Responsive optimized for smartphones) */}
      <div className="lg:hidden space-y-3">
        {sortedTxs.length > 0 ? (
          sortedTxs.map((tx) => (
            <div
              key={tx.id}
              className={`bg-white border rounded-2xl p-4 shadow-sm space-y-3 transition-all ${
                tx.status === 'Cancelled'
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Header Card */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600 block">
                    {tx.id}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {tx.date} • {tx.time}
                  </span>
                </div>
                <div>
                  {tx.status === 'Completed' && (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                      Selesai
                    </span>
                  )}
                  {tx.status === 'Draft' && (
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                      Draft
                    </span>
                  )}
                  {tx.status === 'Cancelled' && (
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px]">
                      Dibatalkan
                    </span>
                  )}
                </div>
              </div>

              {/* Item Info */}
              <div>
                <h4 className="text-sm font-bold text-slate-900">{tx.itemName}</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Kode: <strong className="text-indigo-600">{tx.itemCode}</strong> • Lokasi: {tx.location}
                </p>
              </div>

              {/* Stock Comparison Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs border border-slate-200/60">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">System</span>
                  <span className="font-bold text-slate-700">{tx.systemStock} {tx.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Fisik</span>
                  <span className="font-bold text-slate-900">{tx.physicalStock} {tx.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Selisih</span>
                  <span className={`font-bold ${
                    tx.difference === 0
                      ? 'text-emerald-600'
                      : tx.difference > 0
                      ? 'text-blue-600'
                      : 'text-rose-600'
                  }`}>
                    {tx.difference > 0 ? `+${tx.difference}` : tx.difference}
                  </span>
                </div>
              </div>

              {/* Value & Counter Details */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> {tx.counterName}
                </span>
                <span className="font-mono font-extrabold text-slate-800">
                  {formatRupiah(tx.totalValueDiff)}
                </span>
              </div>

              {/* Cancel Reason info if cancelled */}
              {tx.status === 'Cancelled' && tx.cancelReason && (
                <div className="p-2 bg-rose-100/80 rounded-lg text-[11px] text-rose-900">
                  <strong>Alasan Pembatalan:</strong> {tx.cancelReason}
                </div>
              )}

              {/* Action Buttons for Mobile */}
              {tx.status !== 'Cancelled' && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onOpenEdit(tx)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Data
                  </button>
                  <button
                    onClick={() => onOpenCancel(tx)}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" /> Batalkan
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
            Tidak ada transaksi opname yang ditemukan.
          </div>
        )}
      </div>
    </div>
  );
};
