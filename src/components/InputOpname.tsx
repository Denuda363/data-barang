import React, { useState, useEffect } from 'react';
import { Item, OpnameTransaction, ItemCondition, TransactionStatus } from '../types';
import { formatRupiah } from '../lib/storage';
import {
  Search,
  Camera,
  CheckCircle2,
  AlertCircle,
  Calculator,
  UserCheck,
  FileText,
  Save,
  Clock,
  Sparkles,
  MapPin,
  Tag,
  Boxes,
  Plus,
  Minus,
  Check
} from 'lucide-react';

interface InputOpnameProps {
  items: Item[];
  onSaveTransaction: (
    newTx: Omit<OpnameTransaction, 'id' | 'createdAt' | 'updatedAt'>,
    updateMasterStock: boolean
  ) => void;
  onOpenScan: () => void;
  scannedCode?: string | null;
  onClearScannedCode?: () => void;
}

export const InputOpname: React.FC<InputOpnameProps> = ({
  items,
  onSaveTransaction,
  onOpenScan,
  scannedCode,
  onClearScannedCode,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [physicalStock, setPhysicalStock] = useState<number>(0);
  const [condition, setCondition] = useState<ItemCondition>('Bagus');
  const [counterName, setCounterName] = useState<string>('Auditor Gudang');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<TransactionStatus>('Completed');
  const [updateMasterStock, setUpdateMasterStock] = useState<boolean>(true);
  const [isSuccessToast, setIsSuccessToast] = useState<boolean>(false);

  // If scanned code comes from camera modal
  useEffect(() => {
    if (scannedCode) {
      const matched = items.find(
        (i) =>
          i.code.toLowerCase() === scannedCode.toLowerCase() ||
          i.name.toLowerCase().includes(scannedCode.toLowerCase())
      );

      if (matched) {
        setSelectedItem(matched);
        setPhysicalStock(matched.systemStock);
        setSearchQuery(matched.code);
      } else {
        setSearchQuery(scannedCode);
      }

      if (onClearScannedCode) {
        onClearScannedCode();
      }
    }
  }, [scannedCode, items]);

  // Filter items for autocomplete dropdown
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q)
    );
  });

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setPhysicalStock(item.systemStock);
    setSearchQuery(`${item.code} - ${item.name}`);
  };

  const handleAdjustStock = (delta: number) => {
    setPhysicalStock((prev) => Math.max(0, prev + delta));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);

    const difference = physicalStock - selectedItem.systemStock;
    const totalValueDiff = difference * selectedItem.unitPrice;

    const newTx: Omit<OpnameTransaction, 'id' | 'createdAt' | 'updatedAt'> = {
      date: dateStr,
      time: timeStr,
      itemId: selectedItem.id,
      itemCode: selectedItem.code,
      itemName: selectedItem.name,
      category: selectedItem.category,
      location: selectedItem.location,
      unit: selectedItem.unit,
      systemStock: selectedItem.systemStock,
      physicalStock,
      difference,
      unitPrice: selectedItem.unitPrice,
      totalValueDiff,
      condition,
      counterName: counterName.trim() || 'Auditor Gudang',
      notes: notes.trim(),
      status
    };

    onSaveTransaction(newTx, updateMasterStock && status === 'Completed');

    // Reset Form for next item
    setIsSuccessToast(true);
    setSelectedItem(null);
    setSearchQuery('');
    setPhysicalStock(0);
    setNotes('');

    setTimeout(() => {
      setIsSuccessToast(false);
    }, 3000);
  };

  const currentDiff = selectedItem ? physicalStock - selectedItem.systemStock : 0;
  const currentValueDiff = selectedItem ? currentDiff * selectedItem.unitPrice : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {isSuccessToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-200 shrink-0" />
            <div>
              <p className="text-sm font-bold">Data Opname Berhasil Disimpan!</p>
              <p className="text-[11px] sm:text-xs text-emerald-100 mt-0.5">
                Laporan stok opname telah tercatat dalam riwayat transaksi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Title Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              Input Hasil Hitungan Stok Opname
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Cari kode/nama barang atau gunakan kamera HP untuk scan barcode fisik
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenScan}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-300" />
            Scan Barcode HP
          </button>
        </div>

        {/* Search Item Input with Autocomplete */}
        <div className="relative mt-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedItem && e.target.value !== `${selectedItem.code} - ${selectedItem.name}`) {
                  setSelectedItem(null);
                }
              }}
              placeholder="Ketik Kode Barang, Barcode, atau Nama Item..."
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedItem(null);
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs bg-slate-200/80 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown List */}
          {searchQuery && !selectedItem && filteredItems.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="p-3 hover:bg-indigo-50/70 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> {item.location}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Tag className="w-3 h-3 text-slate-400" /> {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block">
                      Stok System: {item.systemStock} {item.unit}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatRupiah(item.unitPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && !selectedItem && filteredItems.length === 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl p-4 shadow-lg text-center text-xs text-slate-500 z-30">
              Barang tidak ditemukan untuk kata kunci "<strong className="text-slate-800">{searchQuery}</strong>".
            </div>
          )}
        </div>
      </div>

      {/* Main Opname Form */}
      {selectedItem ? (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5">
          {/* Item Selected Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full">
                Item Dipilih
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Lokasi: {selectedItem.location}
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {selectedItem.name}
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                Kode / Barcode: <strong className="text-indigo-300">{selectedItem.code}</strong> • Kategori: {selectedItem.category}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Stok di Sistem:</span>
                <span className="text-sm font-extrabold text-white">
                  {selectedItem.systemStock} {selectedItem.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Harga Satuan:</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  {formatRupiah(selectedItem.unitPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Physical Count Section - Big Touch Buttons for Phone */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Hasil Hitung Fisik (<span className="text-indigo-600">{selectedItem.unit}</span>)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Tap tombol untuk menyesuaikan dengan cepat
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                required
                value={physicalStock}
                onChange={(e) => setPhysicalStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-center py-3 bg-white border-2 border-indigo-500 rounded-2xl text-2xl font-extrabold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-inner"
              />
            </div>

            {/* Step Quick Adjusters */}
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleAdjustStock(-10)}
                className="py-2.5 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors shadow-sm active:scale-95"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => handleAdjustStock(-5)}
                className="py-2.5 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors shadow-sm active:scale-95"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => handleAdjustStock(-1)}
                className="py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-colors shadow-sm active:scale-95"
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => handleAdjustStock(1)}
                className="py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-xl transition-colors shadow-sm active:scale-95"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => handleAdjustStock(5)}
                className="py-2.5 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors shadow-sm active:scale-95"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => handleAdjustStock(10)}
                className="py-2.5 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors shadow-sm active:scale-95"
              >
                +10
              </button>
            </div>
          </div>

          {/* Variance & Discrepancy Live Box */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            currentDiff === 0
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : currentDiff > 0
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  {currentDiff === 0 ? 'Sesuai (Stok Fisik Pas)' : currentDiff > 0 ? 'Surplus (Kelebihan Fisik)' : 'Minus (Defisit Fisik)'}
                </p>
                <p className="text-xs font-medium opacity-90 mt-0.5">
                  Selisih: <span className="font-extrabold text-sm">{currentDiff > 0 ? `+${currentDiff}` : currentDiff} {selectedItem.unit}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-semibold opacity-75">
                Nilai Selisih (Rp)
              </p>
              <p className="text-base sm:text-lg font-extrabold font-mono">
                {formatRupiah(currentValueDiff)}
              </p>
            </div>
          </div>

          {/* Form Options: Condition, Counter Name, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                Kondisi Fisik Barang
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Bagus">Bagus (Siap Jual)</option>
                <option value="Rusak">Rusak / Kemasan Cacat</option>
                <option value="Kadaluarsa">Kadaluarsa (Expired)</option>
                <option value="Hilang">Hilang / Tidak Ditemukan</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">
                Petugas Penghitung / Auditor
              </label>
              <input
                type="text"
                required
                value={counterName}
                onChange={(e) => setCounterName(e.target.value)}
                placeholder="Nama Anda atau Tim Shift"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Catatan / Alasan Selisih
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Terjadi kebocoran kemasan, salah penataan rak, atau penyesuaian audit harian..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Master Stock Auto Update Checkbox */}
          <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-xl flex items-center gap-3">
            <input
              type="checkbox"
              id="update-stock-checkbox"
              checked={updateMasterStock}
              onChange={(e) => setUpdateMasterStock(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="update-stock-checkbox" className="text-xs text-indigo-950 font-medium cursor-pointer">
              <strong>Perbarui stok sistem master barang</strong> dengan hasil hitungan fisik baru ini secara otomatis.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setSelectedItem(null);
                setSearchQuery('');
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Pilih Item Lain
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Check className="w-4 h-4" />
              Simpan Hasil Opname
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Boxes className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Pilih Barang yang Akan Diopname
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Gunakan kolom pencarian di atas untuk memilih barang berdasarkan nama/kode, atau gunakan tombol <strong>Scan Barcode HP</strong>.
          </p>
        </div>
      )}
    </div>
  );
};
