import React, { useState } from 'react';
import { Item } from '../types';
import { formatRupiah } from '../lib/storage';
import { exportItemsToExcel, exportStockWithExpiryToExcel } from '../lib/excelUtils';
import {
  Package,
  Plus,
  Search,
  Download,
  FileSpreadsheet,
  Edit,
  Trash2,
  X,
  Calendar,
  Tag
} from 'lucide-react';

interface ItemManagementProps {
  items: Item[];
  onAddItem: (newItem: Omit<Item, 'id' | 'updatedAt'>) => void;
  onUpdateItem: (updatedItem: Item) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenImport: () => void;
}

export const ItemManagement: React.FC<ItemManagementProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onOpenImport,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Form State
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Umum');
  const [location, setLocation] = useState<string>('Gudang Utama');
  const [unit, setUnit] = useState<string>('Pcs');
  const [systemStock, setSystemStock] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(10);
  const [expiryDate, setExpiryDate] = useState<string>('');

  const categories = Array.from(new Set(items.map((i) => i.category)));

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setCode(`BRG-${String(items.length + 1).padStart(3, '0')}`);
    setName('');
    setCategory('Umum');
    setLocation('Gudang Utama');
    setUnit('Pcs');
    setSystemStock(0);
    setUnitPrice(10000);
    setMinStock(10);
    const exp = new Date();
    exp.setMonth(exp.getMonth() + 6);
    setExpiryDate(exp.toISOString().slice(0, 10));
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Item) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setCategory(item.category);
    setLocation(item.location);
    setUnit(item.unit);
    setSystemStock(item.systemStock);
    setUnitPrice(item.unitPrice);
    setMinStock(item.minStock || 0);
    setExpiryDate(item.expiryDate || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        code: code.trim(),
        name: name.trim(),
        category: category.trim() || 'Umum',
        location: location.trim() || 'Gudang Utama',
        unit: unit.trim() || 'Pcs',
        systemStock: Math.max(0, systemStock),
        unitPrice: Math.max(0, unitPrice),
        minStock: Math.max(0, minStock),
        expiryDate: expiryDate || undefined,
        updatedAt: new Date().toISOString()
      });
    } else {
      onAddItem({
        code: code.trim(),
        name: name.trim(),
        category: category.trim() || 'Umum',
        location: location.trim() || 'Gudang Utama',
        unit: unit.trim() || 'Pcs',
        systemStock: Math.max(0, systemStock),
        unitPrice: Math.max(0, unitPrice),
        minStock: Math.max(0, minStock),
        expiryDate: expiryDate || undefined
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-16 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Master Data Item Barang ({items.length})
            </h2>
            <p className="text-xs text-slate-500">
              Katalog produk, harga unit, lokasi rak, dan stok sistem dasar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenImport}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold rounded-xl transition-all"
              title="Import Data Master Barang dari file Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Import Excel
            </button>

            <button
              onClick={() => exportStockWithExpiryToExcel(filteredItems)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
              title="Export Format Excel: No, Kode, Nama Barang, Jumlah Stok, Expired"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export Excel
            </button>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Barang
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Kode, Nama Barang, Lokasi Rak..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kategori ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Items Table */}
      <div className="hidden md:block bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-3">Kode Barang</th>
                <th className="p-3">Nama Barang</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Lokasi / Rak</th>
                <th className="p-3 text-right">Stok System</th>
                <th className="p-3 text-center">Expired Date</th>
                <th className="p-3 text-right">Harga Unit (Rp)</th>
                <th className="p-3 text-right">Total Nilai</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-600">
                      {item.code}
                    </td>
                    <td className="p-3 font-bold text-slate-900">{item.name}</td>
                    <td className="p-3 text-slate-600">{item.category}</td>
                    <td className="p-3 text-slate-500">{item.location}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {item.systemStock} {item.unit}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-rose-600 bg-rose-50/50 rounded-lg">
                      {item.expiryDate || 'Belum diatur'}
                    </td>
                    <td className="p-3 text-right font-mono">{formatRupiah(item.unitPrice)}</td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-900">
                      {formatRupiah(item.systemStock * item.unitPrice)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Barang"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus barang "${item.name}" dari master?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-500">
                    <p className="font-semibold text-slate-700 mb-2">
                      Belum ada data barang atau tidak ada barang yang cocok dengan kata kunci.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button
                        onClick={onOpenImport}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Import Excel
                      </button>
                      <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Manual
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {item.code}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{item.name}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus barang "${item.name}"?`)) {
                        onDeleteItem(item.id);
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Kategori & Lokasi:</span>
                  <span className="font-semibold text-slate-800">{item.category} • {item.location}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Stok Sistem:</span>
                  <span className="font-bold text-slate-900 text-sm">{item.systemStock} {item.unit}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
            Barang tidak ditemukan.
          </div>
        )}
      </div>

      {/* Modal Add / Edit Master Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Master Barang' : 'Tambah Barang Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kode Barang / Barcode *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Barang *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi / Rak</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok Sistem</label>
                  <input
                    type="number"
                    min="0"
                    value={systemStock}
                    onChange={(e) => setSystemStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Expired</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-300 font-bold rounded-xl text-rose-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
