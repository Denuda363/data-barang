import * as XLSX from 'xlsx';
import { Item, OpnameTransaction } from '../types';
import { formatRupiah } from './storage';

/**
 * Helper to convert various Excel/CSV date formats into standard YYYY-MM-DD
 */
function formatExcelDate(val: any): string | undefined {
  if (val === undefined || val === null || val === '') return undefined;

  // JS Date object
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      return val.toISOString().slice(0, 10);
    }
  }

  // Excel serial number (e.g. 45650 -> date in 2024-2027 range)
  if (typeof val === 'number') {
    if (val > 20000 && val < 90000) {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
      }
    }
  }

  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'tidak ada' || str.toLowerCase() === 'null') {
    return undefined;
  }

  // Standard YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // DD/MM/YYYY or DD-MM-YYYY format
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Fallback try standard Date parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return str;
}

/**
 * Helper to download workbook compatible with desktop, Android, and iOS Safari Web Share
 */
export async function saveAndDownloadWorkbook(workbook: XLSX.WorkBook, fileName: string): Promise<void> {
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const file = new File([blob], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: fileName,
        text: 'File Ekspor Excel Stok Opname',
      });
      return;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
    }
  }

  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  if (isIOS) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    reader.readAsDataURL(blob);
  } else {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Downloads a pre-formatted Excel template (.xlsx) for importing master items.
 */
export function downloadItemImportTemplate(): void {
  const templateData = [
    {
      'Kode Barang': 'BRG-011',
      'Nama Barang': 'Kopi Latte Bottle 250ml',
      'Kategori': 'Minuman',
      'Lokasi / Rak': 'Rak A-02',
      'Satuan': 'Botol',
      'Stok Sistem': 100,
      'Harga Per Unit (Rp)': 15000,
      'Stok Minimal': 20,
      'Tanggal Expired': '2026-12-31'
    },
    {
      'Kode Barang': 'BRG-012',
      'Nama Barang': 'Snack Keripik Kentang 60g',
      'Kategori': 'Makanan',
      'Lokasi / Rak': 'Rak B-01',
      'Satuan': 'Pcs',
      'Stok Sistem': 80,
      'Harga Per Unit (Rp)': 12500,
      'Stok Minimal': 15,
      'Tanggal Expired': '2026-11-20'
    },
    {
      'Kode Barang': 'BRG-013',
      'Nama Barang': 'Tissue Wajah 250 Sheets',
      'Kategori': 'Kebersihan',
      'Lokasi / Rak': 'Rak C-01',
      'Satuan': 'Pack',
      'Stok Sistem': 150,
      'Harga Per Unit (Rp)': 18500,
      'Stok Minimal': 25,
      'Tanggal Expired': '2028-05-15'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 15 }, // Kode Barang
    { wch: 32 }, // Nama Barang
    { wch: 18 }, // Kategori
    { wch: 22 }, // Lokasi / Rak
    { wch: 12 }, // Satuan
    { wch: 15 }, // Stok Sistem
    { wch: 20 }, // Harga Per Unit
    { wch: 15 }, // Stok Minimal
    { wch: 18 }  // Tanggal Expired
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Master Barang');

  // Write file and trigger browser download
  saveAndDownloadWorkbook(workbook, 'Template_Import_Barang_Stok_Opname.xlsx');
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file and converts it into Item objects.
 */
export async function parseExcelItemFile(file: File): Promise<{
  validItems: Omit<Item, 'id' | 'updatedAt'>[];
  errors: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const validItems: Omit<Item, 'id' | 'updatedAt'>[] = [];
        const errors: string[] = [];

        if (rawData.length === 0) {
          errors.push('File Excel kosong atau tidak memiliki data.');
          resolve({ validItems: [], errors });
          return;
        }

        rawData.forEach((row, index) => {
          const rowNum = index + 2; // Row index + 2 (1-based + header)

          // Helper to get case-insensitive column values
          const getValue = (keys: string[]): any => {
            for (const key of keys) {
              const matchedKey = Object.keys(row).find(
                (k) => k.trim().toLowerCase() === key.toLowerCase()
              );
              if (matchedKey && row[matchedKey] !== undefined) {
                return row[matchedKey];
              }
            }
            return '';
          };

          const code = String(getValue(['Kode Barang', 'Kode', 'Item Code', 'Barcode', 'SKU'])).trim();
          const name = String(getValue(['Nama Barang', 'Nama', 'Item Name', 'Barang'])).trim();
          const category = String(getValue(['Kategori', 'Category', 'Kelompok'])).trim() || 'Umum';
          const location = String(getValue(['Lokasi / Rak', 'Lokasi', 'Rak', 'Location'])).trim() || 'Gudang Utama';
          const unit = String(getValue(['Satuan', 'Unit', 'UOM'])).trim() || 'Pcs';
          
          const rawSystemStock = getValue(['Stok Sistem', 'Stok', 'Stock', 'System Stock', 'Qty', 'Jumlah Stok']);
          const rawUnitPrice = getValue(['Harga Per Unit (Rp)', 'Harga Per Unit', 'Harga', 'Price', 'UnitPrice']);
          const rawMinStock = getValue(['Stok Minimal', 'Min Stock', 'Minimum Stock']);
          const rawExpiry = getValue([
            'Tanggal Expired',
            'Expired Date',
            'Expired',
            'Exp Date',
            'Tgl Expired',
            'Kadaluarsa',
            'Tgl Kadaluarsa',
            'Tanggal Kadaluarsa'
          ]);

          if (!code && !name) {
            // Skip empty rows
            return;
          }

          if (!code) {
            errors.push(`Baris ${rowNum}: Kode Barang tidak boleh kosong.`);
            return;
          }

          if (!name) {
            errors.push(`Baris ${rowNum}: Nama Barang tidak boleh kosong.`);
            return;
          }

          const systemStock = Number(rawSystemStock) || 0;
          const unitPrice = Number(rawUnitPrice) || 0;
          const minStock = rawMinStock !== '' ? Number(rawMinStock) : undefined;
          const expiryDate = formatExcelDate(rawExpiry);

          validItems.push({
            code,
            name,
            category,
            location,
            unit,
            systemStock: Math.max(0, systemStock),
            unitPrice: Math.max(0, unitPrice),
            minStock,
            expiryDate
          });
        });

        resolve({ validItems, errors });
      } catch (err: any) {
        reject(new Error(`Gagal membaca file Excel: ${err.message || 'Format file tidak valid'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file dari disk.'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Exports Opname Transactions history to Excel file.
 */
export function exportTransactionsToExcel(transactions: OpnameTransaction[]): void {
  const exportData = transactions.map((t) => {
    let statusLabel = 'Selesai';
    if (t.status === 'Draft') statusLabel = 'Draft / Belum Selesai';
    if (t.status === 'Cancelled') statusLabel = 'Dibatalkan';

    return {
      'No. Transaksi': t.id,
      'Tanggal': t.date,
      'Jam': t.time,
      'Kode Barang': t.itemCode,
      'Nama Barang': t.itemName,
      'Kategori': t.category,
      'Lokasi / Rak': t.location,
      'Satuan': t.unit,
      'Stok Sistem': t.systemStock,
      'Stok Fisik': t.physicalStock,
      'Selisih (Qty)': t.difference,
      'Harga Unit (Rp)': t.unitPrice,
      'Nilai Selisih (Rp)': t.totalValueDiff,
      'Kondisi': t.condition,
      'Petugas Counter': t.counterName,
      'Status': statusLabel,
      'Alasan Pembatalan': t.cancelReason || '-',
      'Catatan': t.notes || '-'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  worksheet['!cols'] = [
    { wch: 22 }, // No TRX
    { wch: 12 }, // Tanggal
    { wch: 8 },  // Jam
    { wch: 14 }, // Kode
    { wch: 30 }, // Nama
    { wch: 16 }, // Kategori
    { wch: 18 }, // Lokasi
    { wch: 10 }, // Satuan
    { wch: 12 }, // System
    { wch: 12 }, // Fisik
    { wch: 12 }, // Selisih
    { wch: 16 }, // Harga
    { wch: 18 }, // Nilai Selisih
    { wch: 12 }, // Kondisi
    { wch: 22 }, // Petugas
    { wch: 15 }, // Status
    { wch: 30 }, // Alasan
    { wch: 30 }  // Catatan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Stok Opname');

  const nowStr = new Date().toISOString().slice(0, 10);
  saveAndDownloadWorkbook(workbook, `Laporan_Stok_Opname_${nowStr}.xlsx`);
}

/**
 * Exports Master Items catalog to Excel.
 */
export function exportItemsToExcel(items: Item[]): void {
  const exportData = items.map((item) => ({
    'Kode Barang': item.code,
    'Nama Barang': item.name,
    'Kategori': item.category,
    'Lokasi / Rak': item.location,
    'Satuan': item.unit,
    'Stok Sistem': item.systemStock,
    'Harga Unit (Rp)': item.unitPrice,
    'Total Nilai Stok (Rp)': item.systemStock * item.unitPrice,
    'Stok Minimal': item.minStock || 0,
    'Tanggal Update': new Date(item.updatedAt).toLocaleDateString('id-ID')
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 16 },
    { wch: 20 },
    { wch: 10 },
    { wch: 14 },
    { wch: 16 },
    { wch: 22 },
    { wch: 14 },
    { wch: 16 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Data Barang');

  const nowStr = new Date().toISOString().slice(0, 10);
  saveAndDownloadWorkbook(workbook, `Master_Barang_${nowStr}.xlsx`);
}

/**
 * Exports item data formatted strictly as requested:
 * no, kode, nama barang, jumlah stok, expired
 */
export function exportStockWithExpiryToExcel(items: Item[]): void {
  const exportData = items.map((item, index) => ({
    'no': index + 1,
    'kode': item.code,
    'nama barang': item.name,
    'jumlah stok': item.systemStock,
    'expired': item.expiryDate || 'Tidak Ada'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  worksheet['!cols'] = [
    { wch: 8 },  // no
    { wch: 16 }, // kode
    { wch: 32 }, // nama barang
    { wch: 15 }, // jumlah stok
    { wch: 18 }  // expired
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Barang & Expired');

  const nowStr = new Date().toISOString().slice(0, 10);
  saveAndDownloadWorkbook(workbook, `Data_Barang_Stok_Expired_${nowStr}.xlsx`);
}
