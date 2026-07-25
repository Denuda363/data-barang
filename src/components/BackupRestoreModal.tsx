import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  HardDrive,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Info,
  Database,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Item, OpnameTransaction, IncomingStockRecord } from '../types';
import {
  exportBackupToJson,
  parseAndValidateBackupJson,
  BackupData,
} from '../lib/backupUtils';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  transactions: OpnameTransaction[];
  incomingRecords: IncomingStockRecord[];
  onRestoreData: (
    restoredItems: Item[],
    restoredTransactions: OpnameTransaction[],
    restoredIncoming: IncomingStockRecord[]
  ) => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  items,
  transactions,
  incomingRecords,
  onRestoreData,
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<BackupData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportBackupToJson(items, transactions, incomingRecords);
  };

  const handleFileChange = (file: File) => {
    setParseError(null);
    setFileData(null);
    setIsSuccess(false);

    if (!file.name.endsWith('.json')) {
      setParseError('Format file harus berupa .json');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = parseAndValidateBackupJson(content);
      if (res.valid && res.data) {
        setFileData(res.data);
      } else {
        setParseError(res.error || 'Gagal membaca file JSON');
      }
    };
    reader.onerror = () => {
      setParseError('Terjadi kesalahan saat membaca file');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleExecuteRestore = () => {
    if (!fileData) return;

    let finalItems: Item[] = [];
    let finalTxs: OpnameTransaction[] = [];
    let finalIncoming: IncomingStockRecord[] = [];

    if (restoreMode === 'replace') {
      finalItems = fileData.items;
      finalTxs = fileData.transactions;
      finalIncoming = fileData.incomingStock;
    } else {
      // MERGE MODE
      // 1. Items: Update existing by ID or code, append new
      const itemMap = new Map<string, Item>();
      items.forEach((i) => itemMap.set(i.id, i));
      fileData.items.forEach((newItem) => {
        const existingId = Array.from(itemMap.values()).find(
          (ex) => ex.id === newItem.id || ex.code.toLowerCase() === newItem.code.toLowerCase()
        )?.id;
        if (existingId) {
          itemMap.set(existingId, newItem);
        } else {
          itemMap.set(newItem.id, newItem);
        }
      });
      finalItems = Array.from(itemMap.values());

      // 2. Transactions: Update existing by ID, append new
      const txMap = new Map<string, OpnameTransaction>();
      transactions.forEach((t) => txMap.set(t.id, t));
      fileData.transactions.forEach((newTx) => {
        txMap.set(newTx.id, newTx);
      });
      finalTxs = Array.from(txMap.values());

      // 3. Incoming stock: Update existing by ID, append new
      const incMap = new Map<string, IncomingStockRecord>();
      incomingRecords.forEach((r) => incMap.set(r.id, r));
      fileData.incomingStock.forEach((newInc) => {
        incMap.set(newInc.id, newInc);
      });
      finalIncoming = Array.from(incMap.values());
    }

    onRestoreData(finalItems, finalTxs, finalIncoming);
    setIsSuccess(true);
  };

  const resetRestoreState = () => {
    setSelectedFile(null);
    setFileData(null);
    setParseError(null);
    setIsSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Backup & Restore Data JSON
              </h2>
              <p className="text-xs text-slate-500">
                Amankan atau pulihkan database sistem ke file `.json`
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
          <button
            onClick={() => {
              setActiveTab('backup');
              resetRestoreState();
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'backup'
                ? 'bg-white text-indigo-700 shadow-md font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            Backup Data (Export)
          </button>
          <button
            onClick={() => {
              setActiveTab('restore');
              resetRestoreState();
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'restore'
                ? 'bg-white text-indigo-700 shadow-md font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            Restore Data (Import)
          </button>
        </div>

        {/* TAB 1: BACKUP */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-700 font-extrabold border-b border-slate-200/60 pb-2">
                <span>Ringkasan Data Saat Ini</span>
                <span className="text-indigo-600 font-mono">Status: Siap Di-Backup</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-medium">Master Barang</p>
                  <p className="text-base font-extrabold text-slate-900">{items.length}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-medium">Transaksi Opname</p>
                  <p className="text-base font-extrabold text-indigo-600">{transactions.length}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-medium">Barang Masuk</p>
                  <p className="text-base font-extrabold text-emerald-600">{incomingRecords.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-950 leading-relaxed">
                File backup `.json` berisi seluruh riwayat transaksi, master stok barang, serta catatan barang masuk. Menyimpan file ini di komputer Anda sangat berguna untuk keamanan data berkala.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Unduh File Backup (.json)
            </button>
          </div>
        )}

        {/* TAB 2: RESTORE */}
        {activeTab === 'restore' && (
          <div className="space-y-4">
            {isSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-emerald-900 text-sm">
                    Restore Data Berhasil!
                  </h3>
                  <p className="text-xs text-emerald-700 mt-1">
                    Database lokal telah diperbarui dengan data dari file JSON.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetRestoreState();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <>
                {/* Upload Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-2">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Pilih atau Tarik File JSON Backup'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format resmi: backup_stok_opname_*.json
                  </p>
                </div>

                {/* Error Banner */}
                {parseError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3.5 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="font-semibold">{parseError}</p>
                  </div>
                )}

                {/* File Preview & Options */}
                {fileData && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
                      <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200/60 pb-2">
                        <span className="flex items-center gap-1.5 text-indigo-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> File Sah Ditemukan
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(fileData.exportedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <p className="text-[10px] text-slate-500">Master Barang</p>
                          <p className="text-sm font-extrabold text-slate-900">{fileData.items.length}</p>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <p className="text-[10px] text-slate-500">Tx Opname</p>
                          <p className="text-sm font-extrabold text-indigo-600">{fileData.transactions.length}</p>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <p className="text-[10px] text-slate-500">Barang Masuk</p>
                          <p className="text-sm font-extrabold text-emerald-600">{fileData.incomingStock.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mode Choice */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
                        Pilih Metode Restore Data:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRestoreMode('replace')}
                          className={`p-3 rounded-2xl border text-left transition-all text-xs ${
                            restoreMode === 'replace'
                              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 text-rose-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 font-extrabold">
                            <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                            Timpa Semua Data
                          </div>
                          <p className="text-[10px] opacity-80 leading-tight">
                            Menghapus data saat ini dan menggantinya utuh dengan file backup.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRestoreMode('merge')}
                          className={`p-3 rounded-2xl border text-left transition-all text-xs ${
                            restoreMode === 'merge'
                              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 font-extrabold">
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            Gabungkan Data
                          </div>
                          <p className="text-[10px] opacity-80 leading-tight">
                            Menambahkan item baru dan memperbarui item yang memiliki ID/Kode sama.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={handleExecuteRestore}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Proses Restore Data
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
