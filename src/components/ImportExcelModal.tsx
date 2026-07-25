import React, { useState } from 'react';
import { Item } from '../types';
import { parseExcelItemFile, downloadItemImportTemplate } from '../lib/excelUtils';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  X,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  RefreshCw,
  Info
} from 'lucide-react';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedItems: Omit<Item, 'id' | 'updatedAt'>[], mode: 'update' | 'appendOnly') => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<Omit<Item, 'id' | 'updatedAt'>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'update' | 'appendOnly'>('update');
  const [dragActive, setDragActive] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;

    if (
      !selectedFile.name.endsWith('.xlsx') &&
      !selectedFile.name.endsWith('.xls') &&
      !selectedFile.name.endsWith('.csv')
    ) {
      setParseErrors(['Format file harus .xlsx, .xls, atau .csv']);
      return;
    }

    setFile(selectedFile);
    setIsLoading(true);
    setParseErrors([]);

    try {
      const result = await parseExcelItemFile(selectedFile);
      setParsedData(result.validItems);
      setParseErrors(result.errors);
    } catch (err: any) {
      setParseErrors([err.message || 'Gagal memproses file Excel']);
      setParsedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    onImportSuccess(parsedData, importMode);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setParseErrors([]);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Import Data Item Barang dari Excel
              </h3>
              <p className="text-xs text-slate-500">
                Unggah data master barang menggunakan format standar Excel / CSV
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step 1: Download Template Banner */}
          <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-indigo-900">
                  Belum punya format Excel?
                </p>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Unduh template resmi kami untuk memastikan nama kolom sesuai.
                </p>
              </div>
            </div>
            <button
              onClick={downloadItemImportTemplate}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all shrink-0"
            >
              <Download className="w-4 h-4" />
              Download Template Excel
            </button>
          </div>

          {/* Step 2: Upload Zone or File Preview */}
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                id="excel-file-input"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <label
                htmlFor="excel-file-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-3 shadow-sm border border-emerald-100">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Klik untuk pilih file Excel atau seret & lepaskan di sini
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Mendukung format .XLSX, .XLS, atau .CSV
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • {parsedData.length} data barang terdeteksi
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                >
                  Ganti File
                </button>
              </div>

              {/* Mode Option */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Opsi Import Data Duplikat:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-emerald-300">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'update'}
                      onChange={() => setImportMode('update')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700">
                      Update stok & data jika kode barang sudah ada
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-emerald-300">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'appendOnly'}
                      onChange={() => setImportMode('appendOnly')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700">
                      Hanya tambahkan kode barang baru (Abaikan duplikat)
                    </span>
                  </label>
                </div>
              </div>

              {/* Errors Alert */}
              {parseErrors.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Peringatan Format File ({parseErrors.length})
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 max-h-24 overflow-y-auto">
                    {parseErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              {parsedData.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Pratinjau Data ({parsedData.length} Barang)
                    </h4>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> SIAP DIIMPORT
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                        <tr>
                          <th className="p-2 border-b">Kode</th>
                          <th className="p-2 border-b">Nama Barang</th>
                          <th className="p-2 border-b">Kategori</th>
                          <th className="p-2 border-b">Lokasi</th>
                          <th className="p-2 border-b text-right">Stok</th>
                          <th className="p-2 border-b text-right">Harga (Rp)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {parsedData.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-medium text-indigo-600">
                              {item.code}
                            </td>
                            <td className="p-2 font-medium text-slate-900">
                              {item.name}
                            </td>
                            <td className="p-2">{item.category}</td>
                            <td className="p-2 text-slate-500">{item.location}</td>
                            <td className="p-2 text-right font-semibold">
                              {item.systemStock} {item.unit}
                            </td>
                            <td className="p-2 text-right">
                              Rp {item.unitPrice.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-colors"
          >
            Batal
          </button>

          {parsedData.length > 0 && (
            <button
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Proses Import ({parsedData.length} Data)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
