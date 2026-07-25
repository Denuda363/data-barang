import React, { useState, useRef, useEffect } from 'react';
import { Item, IncomingStockRecord } from '../types';
import { exportStockWithExpiryToExcel } from '../lib/excelUtils';
import {
  PackagePlus,
  Search,
  Calendar,
  Truck,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Boxes,
  FileSpreadsheet,
  History,
  Tag,
  Edit3,
  XCircle,
  X,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const daysArray = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const monthsArray = [
  { val: '01', label: 'Jan' },
  { val: '02', label: 'Feb' },
  { val: '03', label: 'Mar' },
  { val: '04', label: 'Apr' },
  { val: '05', label: 'Mei' },
  { val: '06', label: 'Jun' },
  { val: '07', label: 'Jul' },
  { val: '08', label: 'Ags' },
  { val: '09', label: 'Sep' },
  { val: '10', label: 'Okt' },
  { val: '11', label: 'Nov' },
  { val: '12', label: 'Des' },
];
const currentYearValue = new Date().getFullYear();
const yearsArray = Array.from({ length: 15 }, (_, i) => String(currentYearValue + i));

interface IncomingStockProps {
  items: Item[];
  incomingRecords: IncomingStockRecord[];
  onSaveIncomingStock: (
    record: Omit<IncomingStockRecord, 'id' | 'createdAt'>,
    isNewItem: boolean,
    newItemDetails?: Omit<Item, 'id' | 'updatedAt'>
  ) => void;
  onUpdateIncomingStock?: (
    updatedRecord: IncomingStockRecord,
    oldQuantity: number
  ) => void;
  onCancelIncomingStock?: (recordId: string) => void;
  onNavigateToItems?: () => void;
}

export const IncomingStock: React.FC<IncomingStockProps> = ({
  items,
  incomingRecords,
  onSaveIncomingStock,
  onUpdateIncomingStock,
  onCancelIncomingStock,
  onNavigateToItems,
}) => {
  // Search & Selection State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Form State
  const [itemCode, setItemCode] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [category, setCategory] = useState<string>('Umum');
  const [location, setLocation] = useState<string>('Gudang Utama');
  const [unit, setUnit] = useState<string>('Pcs');
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [supplier, setSupplier] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<number>(10000);

  const expYear = expiryDate ? expiryDate.split('-')[0] : '';
  const expMonth = expiryDate ? expiryDate.split('-')[1] : '';
  const expDay = expiryDate ? expiryDate.split('-')[2] : '';

  const handleExpChange = (type: 'y' | 'm' | 'd', val: string) => {
    const now = new Date();
    let newY = expYear || String(now.getFullYear());
    let newM = expMonth || String(now.getMonth() + 1).padStart(2, '0');
    let newD = expDay || String(now.getDate()).padStart(2, '0');

    if (type === 'y') newY = val;
    if (type === 'm') newM = val;
    if (type === 'd') newD = val;

    setExpiryDate(`${newY}-${newM}-${newD}`);
  };

  // Success Notification Banner
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [lastSavedSummary, setLastSavedSummary] = useState<string>('');

  const [listSearchQuery, setListSearchQuery] = useState<string>('');

  // Modals state for Edit and Cancel
  const [editingRecord, setEditingRecord] = useState<IncomingStockRecord | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editExpiryDate, setEditExpiryDate] = useState<string>('');
  const [editSupplier, setEditSupplier] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const editExpYear = editExpiryDate ? editExpiryDate.split('-')[0] : '';
  const editExpMonth = editExpiryDate ? editExpiryDate.split('-')[1] : '';
  const editExpDay = editExpiryDate ? editExpiryDate.split('-')[2] : '';

  const handleEditExpChange = (type: 'y' | 'm' | 'd', val: string) => {
    const now = new Date();
    let newY = editExpYear || String(now.getFullYear());
    let newM = editExpMonth || String(now.getMonth() + 1).padStart(2, '0');
    let newD = editExpDay || String(now.getDate()).padStart(2, '0');

    if (type === 'y') newY = val;
    if (type === 'm') newM = val;
    if (type === 'd') newD = val;

    setEditExpiryDate(`${newY}-${newM}-${newD}`);
  };

  const [cancellingRecord, setCancellingRecord] = useState<IncomingStockRecord | null>(null);

  const handleOpenEditModal = (r: IncomingStockRecord) => {
    setEditingRecord(r);
    setEditQuantity(r.quantity);
    setEditExpiryDate(r.expiryDate);
    setEditSupplier(r.supplier || '');
    setEditNotes(r.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (editQuantity < 0 || !editExpiryDate) {
      alert('Jumlah barang tidak boleh negatif dan Tanggal Expired wajib diisi!');
      return;
    }

    const updated: IncomingStockRecord = {
      ...editingRecord,
      quantity: editQuantity,
      expiryDate: editExpiryDate,
      supplier: editSupplier.trim(),
      notes: editNotes.trim(),
    };

    if (onUpdateIncomingStock) {
      onUpdateIncomingStock(updated, editingRecord.quantity);
    }

    setEditingRecord(null);
    setLastSavedSummary(`Edit TRX [${editingRecord.id}] ${editingRecord.itemName} berhasil disimpan.`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  const handleConfirmCancel = () => {
    if (!cancellingRecord) return;
    if (onCancelIncomingStock) {
      onCancelIncomingStock(cancellingRecord.id);
    }
    setCancellingRecord(null);
    setLastSavedSummary(`Transaksi [${cancellingRecord.id}] berhasil dibatalkan & stok otomatis dikurangi.`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set default expiry date to 6 months from today
  useEffect(() => {
    const defaultExpiry = new Date();
    defaultExpiry.setMonth(defaultExpiry.getMonth() + 6);
    setExpiryDate(defaultExpiry.toISOString().slice(0, 10));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items dynamically as user types
  const filteredSearchItems = items.filter((i) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      i.code.toLowerCase().includes(q) ||
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q)
    );
  });

  const handleSelectItem = (item: Item) => {
    setSelectedItemId(item.id);
    setItemCode(item.code);
    setItemName(item.name);
    setCategory(item.category);
    setLocation(item.location);
    setUnit(item.unit);
    setCurrentStock(item.systemStock);
    setUnitPrice(item.unitPrice);
    if (item.expiryDate) {
      setExpiryDate(item.expiryDate);
    }
    setSearchQuery(`${item.code} - ${item.name}`);
    setIsDropdownOpen(false);
  };

  const handleSelectNewItem = () => {
    setSelectedItemId(null);
    const newGeneratedCode = `BRG-${String(items.length + 1).padStart(3, '0')}`;
    setItemCode(newGeneratedCode);
    setItemName(searchQuery.trim() || 'Barang Baru');
    setCategory('Umum');
    setLocation('Gudang Utama');
    setUnit('Pcs');
    setCurrentStock(0);
    setUnitPrice(10000);
    setIsDropdownOpen(false);
  };

  const setQuickExpiry = (months: number) => {
    const target = new Date();
    target.setMonth(target.getMonth() + months);
    setExpiryDate(target.toISOString().slice(0, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || quantity < 0 || !expiryDate) {
      alert('Mohon lengkapi Nama Barang, Jumlah Masuk (>= 0), dan Tanggal Expired!');
      return;
    }

    const finalItemCode = itemCode.trim() || `BRG-${Date.now().toString().slice(-6)}`;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);

    const isNewItem = !selectedItemId && !items.some((i) => i.code.toLowerCase() === finalItemCode.toLowerCase());

    const newRecord: Omit<IncomingStockRecord, 'id' | 'createdAt'> = {
      date: dateStr,
      time: timeStr,
      itemId: selectedItemId || `item-${Date.now()}`,
      itemCode: finalItemCode,
      itemName: itemName.trim(),
      category: category.trim() || 'Umum',
      unit: unit.trim() || 'Pcs',
      quantity,
      expiryDate,
      supplier: supplier.trim() || 'Umum',
      notes: notes.trim() || 'Barang masuk'
    };

    const newItemData: Omit<Item, 'id' | 'updatedAt'> | undefined = isNewItem
      ? {
          code: finalItemCode,
          name: itemName.trim(),
          category: category.trim() || 'Umum',
          location: location.trim() || 'Gudang Utama',
          unit: unit.trim() || 'Pcs',
          systemStock: quantity,
          unitPrice,
          expiryDate,
          minStock: 10
        }
      : undefined;

    onSaveIncomingStock(newRecord, isNewItem, newItemData);

    // Show toast
    setLastSavedSummary(`[${itemCode}] ${itemName} (+${quantity} ${unit}) - Expired: ${expiryDate}`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);

    // Reset Form
    setSearchQuery('');
    setSelectedItemId(null);
    setItemName('');
    setItemCode('');
    setQuantity(0);
    setSupplier('');
    setNotes('');
  };

  // Filter list for bottom table
  const filteredHistoryRecords = incomingRecords.filter((r) => {
    const q = listSearchQuery.toLowerCase();
    return !q || r.itemName.toLowerCase().includes(q) || r.itemCode.toLowerCase().includes(q) || r.supplier?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg sm:shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-semibold mb-2">
              <PackagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              Penerimaan Barang
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
              Pencarian Barang Dinamis & Tanggal Kadaluarsa
            </h2>
            <p className="text-[11px] sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Cari barang dengan cepat secara dinamis, input jumlah stok masuk, tanggal expired, serta export langsung laporan barang ke file Excel format <span className="font-mono text-emerald-300 font-bold hidden sm:inline">No, Nama, Stok, Expired</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportStockWithExpiryToExcel(items)}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-900/90 border border-emerald-500 text-emerald-100 p-4 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/30 rounded-xl text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-white">Barang Masuk Berhasil Diberitahukan & Disimpan!</p>
              <p className="text-xs text-emerald-200 mt-0.5">{lastSavedSummary}</p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="text-xs text-emerald-300 hover:text-white px-2 py-1 rounded-lg bg-emerald-800/50"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Input Card with Bento Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-indigo-600" />
              Form Input Barang Masuk
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan pencarian dinamis di bawah ini untuk memilih barang terdaftar atau menambahkan item baru.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Dynamic Search Auto-complete Field */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Pencarian Barang Dinamis *</span>
                <span className="text-[11px] text-indigo-600 font-semibold">
                  Cari berdasarkan Nama atau Rak
                </span>
              </label>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Ketik nama barang (contoh: Kopi)..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedItemId(null);
                    }}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Dynamic Suggestions Dropdown */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {filteredSearchItems.length > 0 ? (
                    filteredSearchItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className="p-3 hover:bg-indigo-50/80 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                              {item.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                            <span>Lokasi: {item.location}</span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-slate-800 block">
                            Stok: {item.systemStock} {item.unit}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            Exp: {item.expiryDate || 'Belum diatur'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs text-slate-500 font-medium mb-2">
                        Barang dengan kata kunci "{searchQuery}" tidak ditemukan.
                      </p>
                      <button
                        type="button"
                        onClick={handleSelectNewItem}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah sebagai Item Baru
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Item Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Barang *
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Nama Lengkap Barang"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Input Quantity & Expired Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl">
              {/* Jumlah Masuk */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Jumlah Barang Masuk (Qty) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm font-extrabold text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Stok saat ini: <strong>{currentStock}</strong> {unit} → Stok Baru:{' '}
                  <strong className="text-emerald-700">{currentStock + quantity}</strong> {unit}
                </p>
              </div>

              {/* Tanggal Expired */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Tanggal Expired / Kadaluarsa *</span>
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={expDay}
                    onChange={(e) => handleExpChange('d', e.target.value)}
                    required
                    className="w-1/4 px-3 py-2.5 bg-white border border-rose-200 text-rose-950 font-bold rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Tgl</option>
                    {daysArray.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  
                  <select
                    value={expMonth}
                    onChange={(e) => handleExpChange('m', e.target.value)}
                    required
                    className="flex-1 px-3 py-2.5 bg-white border border-rose-200 text-rose-950 font-bold rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Bulan</option>
                    {monthsArray.map(m => (
                      <option key={m.val} value={m.val}>{m.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={expYear}
                    onChange={(e) => handleExpChange('y', e.target.value)}
                    required
                    className="w-1/3 px-3 py-2.5 bg-white border border-rose-200 text-rose-950 font-bold rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Tahun</option>
                    {yearsArray.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Quick Presets for Expired */}
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-500">Cepat:</span>
                  <button
                    type="button"
                    onClick={() => setQuickExpiry(3)}
                    className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    +3 Bln
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickExpiry(6)}
                    className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    +6 Bln
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickExpiry(12)}
                    className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    +1 Thn
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickExpiry(24)}
                    className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    +2 Thn
                  </button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan / No. Surat Jalan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. SJ-2026/07/001"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>

            {/* Submit Action Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">
                Data akan memperbarui stok sistem secara otomatis di Master Barang.
              </p>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <PackagePlus className="w-4 h-4" />
                <span>Simpan Barang Masuk</span>
              </button>
            </div>
          </form>
        </div>

        {/* Side Info & Live Summary Card (1 Col) */}
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Boxes className="w-4 h-4" /> Ringkasan Perubahan
              </h4>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                Realtime
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Nama Barang:</span>
                <span className="font-bold text-white max-w-[150px] truncate text-right">
                  {itemName || 'Belum dipilih'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Stok Awal:</span>
                <span className="font-semibold text-slate-300">{currentStock} {unit}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Jumlah Masuk:</span>
                <span className="font-extrabold text-emerald-400">+{quantity} {unit}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Stok Baru (Estimasi):</span>
                <span className="font-extrabold text-lg text-white bg-indigo-950 px-2 py-0.5 rounded-lg border border-indigo-700/60">
                  {currentStock + quantity} {unit}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Tanggal Expired:</span>
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {expiryDate || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Special Export Format Highlight Box */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-3xl p-5 text-emerald-100 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Format Export Excel Sesuai Request</span>
            </div>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              Laporan data barang dapat diexport kapan saja ke format Excel dengan susunan kolom persis:
            </p>
            <div className="bg-slate-900/90 border border-emerald-800/80 p-2.5 rounded-xl font-mono text-[11px] text-emerald-300 font-semibold space-y-1">
              <div>1. no</div>
              <div>2. nama barang</div>
              <div>3. jumlah stok</div>
              <div>4. expired</div>
            </div>
            <button
              onClick={() => exportStockWithExpiryToExcel(items)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Excel Data Barang & Expired
            </button>
          </div>
        </div>
      </div>

      {/* Table Section: Katalog Data Barang & Expired Date */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-600" />
              Riwayat Barang Masuk
            </h3>
            <p className="text-xs text-slate-500">
              Riwayat transaksi barang masuk.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportStockWithExpiryToExcel(items)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Filter Input for Table */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={listSearchQuery}
            onChange={(e) => setListSearchQuery(e.target.value)}
            placeholder="Filter data berdasarkan nama, kode, supplier..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-3">No TRX</th>
                  <th className="p-3">Tanggal & Waktu</th>
                  <th className="p-3">Nama Barang</th>
                  <th className="p-3 text-right">Jumlah Masuk</th>
                  <th className="p-3 text-center">Expired Date</th>
                  <th className="p-3">Keterangan</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredHistoryRecords.length > 0 ? (
                  filteredHistoryRecords.map((r) => {
                    const isCancelled = r.status === 'Cancelled';
                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isCancelled ? 'bg-slate-50/80 opacity-70' : ''
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-indigo-600">
                          {r.id}
                        </td>
                        <td className="p-3 text-slate-500">
                          {r.date} <span className="text-slate-400">({r.time})</span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-extrabold ${
                              isCancelled ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {r.itemName}
                          </span>
                        </td>
                        <td
                          className={`p-3 text-right font-extrabold ${
                            isCancelled ? 'line-through text-slate-400' : 'text-emerald-700'
                          }`}
                        >
                          +{r.quantity} {r.unit}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-rose-600">
                          {r.expiryDate}
                        </td>
                        <td className="p-3 text-slate-600">
                          <div className="text-xs text-slate-800">{r.notes || '-'}</div>
                        </td>
                        <td className="p-3 text-center">
                          {isCancelled ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                              Dibatalkan
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Aktif
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {!isCancelled ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(r)}
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                                title="Edit Transaksi Barang Masuk"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setCancellingRecord(r)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg transition-colors cursor-pointer"
                                title="Batalkan Transaksi Ini"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No Action</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Belum ada riwayat transaksi barang masuk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
      </div>
          </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Edit Transaksi Barang Masuk</h3>
                  <p className="text-[11px] font-mono text-indigo-600">{editingRecord.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Barang:</span>
                  <span className="font-bold text-slate-900">
                    {editingRecord.itemName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Input:</span>
                  <span className="font-mono text-slate-700">{editingRecord.date} {editingRecord.time}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jumlah Barang Masuk (Qty) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-amber-700 mt-1">
                  * Perubahan Qty akan memperbarui stok sistem barang secara otomatis.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Expired / Kadaluarsa *
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={editExpDay}
                    onChange={(e) => handleEditExpChange('d', e.target.value)}
                    required
                    className="w-1/4 px-3 py-2 bg-slate-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 focus:bg-white focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Tgl</option>
                    {daysArray.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select
                    value={editExpMonth}
                    onChange={(e) => handleEditExpChange('m', e.target.value)}
                    required
                    className="flex-1 px-3 py-2 bg-slate-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 focus:bg-white focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Bulan</option>
                    {monthsArray.map(m => (
                      <option key={m.val} value={m.val}>{m.label}</option>
                    ))}
                  </select>
                  <select
                    value={editExpYear}
                    onChange={(e) => handleEditExpChange('y', e.target.value)}
                    required
                    className="w-1/3 px-3 py-2 bg-slate-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 focus:bg-white focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Tahun</option>
                    {yearsArray.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Batalkan Barang Masuk?</h3>
                <p className="text-xs text-slate-500">Konfirmasi pembatalan transaksi penerimaan barang</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 space-y-2">
              <div className="flex justify-between border-b border-rose-200/60 pb-1.5">
                <span className="text-rose-700 font-semibold">No Transaksi:</span>
                <span className="font-mono font-bold">{cancellingRecord.id}</span>
              </div>
              <div className="flex justify-between border-b border-rose-200/60 pb-1.5">
                <span className="text-rose-700 font-semibold">Barang:</span>
                <span className="font-bold">[{cancellingRecord.itemCode}] {cancellingRecord.itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-700 font-semibold">Jumlah Yang Dikurangi:</span>
                <span className="font-extrabold text-rose-800">-{cancellingRecord.quantity} {cancellingRecord.unit}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Membatalkan transaksi ini akan menandai status transaksi sebagai <strong>Dibatalkan</strong> dan secara otomatis mengembalikan (mengurangi) stok sebanyak <strong>{cancellingRecord.quantity} {cancellingRecord.unit}</strong> dari Master Barang.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingRecord(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal (Kembali)
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30"
              >
                Ya, Batalkan Transaksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
