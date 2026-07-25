import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClearAll: () => void;
  onConfirmResetSample: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  onConfirmClearAll,
  onConfirmResetSample,
}) => {
  const [confirmInput, setConfirmInput] = useState<string>('');
  const [showSampleOption, setShowSampleOption] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleClearAllSubmit = () => {
    onConfirmClearAll();
    setConfirmInput('');
    setShowSampleOption(false);
    onClose();
  };

  const handleResetSampleSubmit = () => {
    onConfirmResetSample();
    setConfirmInput('');
    setShowSampleOption(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Hapus & Kosongkan Seluruh Data</h3>
              <p className="text-xs text-slate-500">Reset database aplikasi menjadi benar-benar kosong (0 data)</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowSampleOption(false);
              setConfirmInput('');
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showSampleOption ? (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 space-y-1.5">
                <p className="font-extrabold text-rose-950 text-sm">
                  Peringatan Pengosongan Data Total
                </p>
                <p className="text-rose-800 leading-relaxed">
                  Tindakan ini akan mengosongkan dan menghapus <strong>seluruh Master Barang</strong>, <strong>seluruh Riwayat Barang Masuk</strong>, dan <strong>seluruh Transaksi Stok Opname</strong>.
                </p>
                <p className="text-rose-700 font-semibold italic">
                  Setelah dikosongkan, tidak akan ada sisa data sedikitpun di dalam aplikasi.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ketik <span className="font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-extrabold">HAPUS</span> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                placeholder="HAPUS"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSampleOption(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Muat ulang data sampel demo?
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={confirmInput.trim().toUpperCase() !== 'HAPUS'}
                  onClick={handleClearAllSubmit}
                  className={`px-5 py-2 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 ${
                    confirmInput.trim().toUpperCase() === 'HAPUS'
                      ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-rose-600/30'
                      : 'bg-slate-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Semua Data
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-900 space-y-1">
                <p className="font-bold">Muat Data Sampel Bawaan</p>
                <p className="text-indigo-700 leading-relaxed">
                  Isi kembali database dengan contoh data barang dan transaksi bawaan awal untuk keperluan uji coba atau demo.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSampleOption(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleResetSampleSubmit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Muat Data Sampel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
