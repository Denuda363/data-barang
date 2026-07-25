export type ItemCondition = 'Bagus' | 'Rusak' | 'Kadaluarsa' | 'Hilang';

export type TransactionStatus = 'Completed' | 'Draft' | 'Cancelled';

export interface Item {
  id: string;
  code: string;           // Kode Barang / Barcode (e.g., BRG-001)
  name: string;           // Nama Barang
  category: string;       // Kategori (e.g., Minuman, Sembako, Elektronik)
  location: string;       // Lokasi / Rak (e.g., Rak A-01, Gudang Utama)
  unit: string;           // Satuan (Pcs, Box, Kg, Unit, Roll)
  systemStock: number;    // Stok Sistem
  unitPrice: number;      // Harga Per Unit (Rp)
  minStock?: number;      // Stok Minimal (optional)
  expiryDate?: string;    // Tanggal Kadaluarsa (YYYY-MM-DD or string)
  updatedAt: string;      // Tanggal Update Terakhir
}

export interface IncomingStockRecord {
  id: string;             // TRX-IN-20260725-001
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm
  itemId: string;         // Reference to Item ID
  itemCode: string;       // Kode Barang
  itemName: string;       // Nama Barang
  category: string;       // Kategori
  unit: string;           // Satuan
  quantity: number;       // Jumlah barang masuk
  expiryDate: string;     // Tanggal Kadaluarsa (YYYY-MM-DD)
  supplier?: string;      // Supplier / Penerima
  notes?: string;         // Catatan Tambahan
  status?: 'Active' | 'Cancelled'; // Status Transaksi
  createdAt: string;
}

export interface OpnameTransaction {
  id: string;             // TRX-SO-20260725-001
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm
  itemId: string;         // Reference to Item ID
  itemCode: string;       // Kode Barang
  itemName: string;       // Nama Barang
  category: string;       // Kategori
  location: string;       // Lokasi
  unit: string;           // Satuan
  systemStock: number;    // Stok Sistem saat opname
  physicalStock: number;  // Stok Fisik hasil hitungan
  difference: number;     // physicalStock - systemStock
  unitPrice: number;      // Harga per unit
  totalValueDiff: number; // difference * unitPrice
  condition: ItemCondition; // Kondisi
  counterName: string;    // Nama Petugas Hitung
  notes: string;          // Catatan / Keterangan
  status: TransactionStatus; // Selesai / Draft / Dibatalkan
  cancelReason?: string;  // Alasan Pembatalan (jika Dibatalkan)
  createdAt: string;
  updatedAt: string;
}

export interface OpnameSummaryStats {
  totalOpnameCount: number;
  completedCount: number;
  draftCount: number;
  cancelledCount: number;
  totalItemsChecked: number;
  totalSystemStock: number;
  totalPhysicalStock: number;
  totalDifference: number;
  totalValueDiscrepancy: number; // Sum of positive and negative discrepancy value in IDR
  accuracyRate: number;         // Percentage of items matching exactly
}
