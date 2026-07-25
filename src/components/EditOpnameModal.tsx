import React, { useState, useEffect } from 'react';
import { OpnameTransaction, ItemCondition, TransactionStatus } from '../types';
import { formatRupiah } from '../lib/storage';
import { Edit3, X, Save, AlertCircle, Calculator } from 'lucide-react';

interface EditOpnameModalProps {
  transaction: OpnameTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTx: OpnameTransaction) => void;
}

export const EditOpnameModal: React.FC<EditOpnameModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSave,
}) => {
  const [physicalStock, setPhysicalStock] = useState<number>(0);
  const [condition, setCondition] = useState<ItemCondition>('Bagus');
  const [counterName, setCounterName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<TransactionStatus>('Completed');

  useEffect(() => {
    if (transaction) {
      setPhysicalStock(transaction.physicalStock);
      setCondition(transaction.condition);
      setCounterName(transaction.counterName);
      setNotes(transaction.notes || '');
      setStatus(transaction.status);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const difference = physicalStock - transaction.systemStock;
  const totalValueDiff = difference * transaction.unitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (physicalStock < 0) return;

    const updatedTx: OpnameTransaction = {
      ...transaction,
      physicalStock,
      difference,
      totalValueDiff,
      condition,
      counterName: counterName.trim() || 'Auditor',
      notes: notes.trim(),
      status,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Edit Transaksi Stok Opname
              </h3>
              <p className="text-xs font-mono text-indigo-600 font-medium">
                {transaction.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* Item Info Summary Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[11px] font-mono font-bold mr-2">
                  {transaction.itemCode}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {transaction.itemName}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200/60 mt-1">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Lokasi / Rak:</span>
                <span className="font-semibold text-slate-700">{transaction.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Stok Sistem:</span>
                <span className="font-semibold text-slate-800">{transaction.systemStock} {transaction.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Harga Per Unit:</span>
                <span className="font-semibold text-slate-800">{formatRupiah(transaction.unitPrice)}</span>
              </div>
            </div>
          </div>

          {/* Physical Stock Input with Quick Step Adjusters */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Hasil Hitungan Stok Fisik (<span className="text-indigo-600 font-semibold">{transaction.unit}</span>)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                required
                value={physicalStock}
                onChange={(e) => setPhysicalStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setPhysicalStock(Math.max(0, physicalStock - 1))}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => setPhysicalStock(physicalStock + 1)}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => setPhysicalStock(physicalStock + 5)}
                  className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  +5
                </button>
              </div>
            </div>
          </div>

          {/* Realtime Difference Display */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            difference === 0
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : difference > 0
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  {difference === 0 ? 'Sesuai (Sama)' : difference > 0 ? 'Surplus (Kelebihan)' : 'Minus (Defisit)'}
                </p>
                <p className="text-[11px] opacity-80">
                  Selisih: <span className="font-bold">{difference > 0 ? `+${difference}` : difference} {transaction.unit}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase opacity-75">Nilai Selisih (Rp)</p>
              <p className="text-sm font-bold font-mono">
                {formatRupiah(totalValueDiff)}
              </p>
            </div>
          </div>

          {/* Condition & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Kondisi Fisik Barang
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Bagus">Bagus (Normal)</option>
                <option value="Rusak">Rusak / Cacat</option>
                <option value="Kadaluarsa">Kadaluarsa (Expired)</option>
                <option value="Hilang">Hilang / Tidak Ditemukan</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Status Transaksi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Completed">Selesai (Completed)</option>
                <option value="Draft">Draft (Belum Final)</option>
              </select>
            </div>
          </div>

          {/* Counter Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Nama Petugas Counter / Auditor
            </label>
            <input
              type="text"
              required
              value={counterName}
              onChange={(e) => setCounterName(e.target.value)}
              placeholder="Contoh: Ahmad - Tim Gudang"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Catatan / Alasan Perubahan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masukkan catatan tambahan mengenai hasil opname..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
