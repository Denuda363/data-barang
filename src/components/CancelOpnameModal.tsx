import React, { useState } from 'react';
import { OpnameTransaction } from '../types';
import { Ban, X, AlertTriangle } from 'lucide-react';

interface CancelOpnameModalProps {
  transaction: OpnameTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (txId: string, cancelReason: string) => void;
}

export const CancelOpnameModal: React.FC<CancelOpnameModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onConfirmCancel,
}) => {
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Alasan pembatalan wajib diisi.');
      return;
    }

    onConfirmCancel(transaction.id, reason.trim());
    setReason('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-rose-50/80">
          <div className="flex items-center gap-2.5 text-rose-700">
            <div className="p-2 bg-rose-100 rounded-xl">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Membatalkan Transaksi
              </h3>
              <p className="text-xs font-mono text-rose-600 font-semibold">
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Transaksi yang dibatalkan tidak akan dihitung dalam laporan analisis stok fisik akhir, namun riwayat transaksi tetap tersimpan sebagai bukti audit.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <p className="text-slate-500 font-medium">Barang:</p>
            <p className="font-bold text-slate-800 text-sm">{transaction.itemName}</p>
            <div className="flex items-center gap-2 text-slate-600 mt-1">
              <span>Kode: <strong className="font-mono text-indigo-600">{transaction.itemCode}</strong></span>
              <span>•</span>
              <span>Stok Fisik: <strong className="text-slate-900">{transaction.physicalStock} {transaction.unit}</strong></span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Alasan Pembatalan Transaksi <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Kesalahan input rak, barang dihitung ganda, atau instruksi pembatalan supervisor"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all"
            >
              <Ban className="w-4 h-4" />
              Konfirmasi Pembatalan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
