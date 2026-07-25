import { Item, OpnameTransaction, IncomingStockRecord } from '../types';

const ITEMS_STORAGE_KEY = 'stok_opname_items_v1';
const TRANSACTIONS_STORAGE_KEY = 'stok_opname_transactions_v1';
const INCOMING_STORAGE_KEY = 'stok_opname_incoming_v1';

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'item-1',
    code: 'BRG-001',
    name: 'Kopi Arabika Gayo 250g',
    category: 'Minuman',
    location: 'Rak A-01',
    unit: 'Pcs',
    systemStock: 120,
    unitPrice: 45000,
    minStock: 20,
    expiryDate: '2026-11-15',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-2',
    code: 'BRG-002',
    name: 'Teobroma Cocoa Powder 500g',
    category: 'Bahan Baku',
    location: 'Gudang Utama B-02',
    unit: 'Box',
    systemStock: 45,
    unitPrice: 65000,
    minStock: 10,
    expiryDate: '2027-03-20',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-3',
    code: 'BRG-003',
    name: 'Minyak Goreng Sawit 2L',
    category: 'Sembako',
    location: 'Rak C-05',
    unit: 'Pouch',
    systemStock: 200,
    unitPrice: 34000,
    minStock: 30,
    expiryDate: '2027-01-10',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-4',
    code: 'BRG-004',
    name: 'Beras Pandan Wangi 5kg',
    category: 'Sembako',
    location: 'Display D-01',
    unit: 'Sak',
    systemStock: 50,
    unitPrice: 88000,
    minStock: 15,
    expiryDate: '2026-12-31',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-5',
    code: 'BRG-005',
    name: 'Lampu LED 12W Cool Daylight',
    category: 'Elektronik',
    location: 'Rak E-03',
    unit: 'Unit',
    systemStock: 85,
    unitPrice: 28500,
    minStock: 20,
    expiryDate: '2028-06-30',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-6',
    code: 'BRG-006',
    name: 'Lakban Bening 2 Inchi 90 Yard',
    category: 'ATK',
    location: 'Rak F-01',
    unit: 'Roll',
    systemStock: 150,
    unitPrice: 12000,
    minStock: 25,
    expiryDate: '2027-08-15',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-7',
    code: 'BRG-007',
    name: 'Sabun Cuci Piring Refill 780ml',
    category: 'Kebersihan',
    location: 'Rak C-02',
    unit: 'Pouch',
    systemStock: 90,
    unitPrice: 18000,
    minStock: 15,
    expiryDate: '2026-10-05',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-8',
    code: 'BRG-008',
    name: 'Gula Pasir Premium 1kg',
    category: 'Sembako',
    location: 'Rak C-04',
    unit: 'Pack',
    systemStock: 110,
    unitPrice: 17500,
    minStock: 20,
    expiryDate: '2027-05-18',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-9',
    code: 'BRG-009',
    name: 'Paper Cup Hot Coffee 8oz',
    category: 'Kemasan',
    location: 'Gudang Belakang G-01',
    unit: 'Pack',
    systemStock: 300,
    unitPrice: 22000,
    minStock: 50,
    expiryDate: '2028-01-01',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-10',
    code: 'BRG-010',
    name: 'Susu UHT Full Cream 1L',
    category: 'Minuman',
    location: 'Rak A-03',
    unit: 'Karton',
    systemStock: 60,
    unitPrice: 19000,
    minStock: 12,
    expiryDate: '2026-09-30',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_TRANSACTIONS: OpnameTransaction[] = [
  {
    id: 'TRX-SO-20260724-001',
    date: '2026-07-24',
    time: '09:15',
    itemId: 'item-1',
    itemCode: 'BRG-001',
    itemName: 'Kopi Arabika Gayo 250g',
    category: 'Minuman',
    location: 'Rak A-01',
    unit: 'Pcs',
    systemStock: 120,
    physicalStock: 118,
    difference: -2,
    unitPrice: 45000,
    totalValueDiff: -90000,
    condition: 'Bagus',
    counterName: 'Budi Santoso (Auditor Gudang)',
    notes: 'Selisih 2 pcs karena bocor saat pengemasan',
    status: 'Completed',
    createdAt: '2026-07-24T09:15:00.000Z',
    updatedAt: '2026-07-24T09:15:00.000Z'
  },
  {
    id: 'TRX-SO-20260724-002',
    date: '2026-07-24',
    time: '10:30',
    itemId: 'item-3',
    itemCode: 'BRG-003',
    itemName: 'Minyak Goreng Sawit 2L',
    category: 'Sembako',
    location: 'Rak C-05',
    unit: 'Pouch',
    systemStock: 200,
    physicalStock: 205,
    difference: 5,
    unitPrice: 34000,
    totalValueDiff: 170000,
    condition: 'Bagus',
    counterName: 'Siti Rahma',
    notes: 'Surplus 5 pouch belum terinput surat jalan masuk',
    status: 'Completed',
    createdAt: '2026-07-24T10:30:00.000Z',
    updatedAt: '2026-07-24T10:30:00.000Z'
  },
  {
    id: 'TRX-SO-20260724-003',
    date: '2026-07-24',
    time: '11:00',
    itemId: 'item-5',
    itemCode: 'BRG-005',
    itemName: 'Lampu LED 12W Cool Daylight',
    category: 'Elektronik',
    location: 'Rak E-03',
    unit: 'Unit',
    systemStock: 85,
    physicalStock: 82,
    difference: -3,
    unitPrice: 28500,
    totalValueDiff: -85500,
    condition: 'Rusak',
    counterName: 'Ahmad Fauzi',
    notes: '3 unit lampu retak/pecah kemasan',
    status: 'Completed',
    createdAt: '2026-07-24T11:00:00.000Z',
    updatedAt: '2026-07-24T11:00:00.000Z'
  },
  {
    id: 'TRX-SO-20260725-001',
    date: '2026-07-25',
    time: '08:45',
    itemId: 'item-2',
    itemCode: 'BRG-002',
    itemName: 'Teobroma Cocoa Powder 500g',
    category: 'Bahan Baku',
    location: 'Gudang Utama B-02',
    unit: 'Box',
    systemStock: 45,
    physicalStock: 45,
    difference: 0,
    unitPrice: 65000,
    totalValueDiff: 0,
    condition: 'Bagus',
    counterName: 'Deni Setiawan',
    notes: 'Stok fisik sesuai dengan sistem',
    status: 'Completed',
    createdAt: '2026-07-25T08:45:00.000Z',
    updatedAt: '2026-07-25T08:45:00.000Z'
  },
  {
    id: 'TRX-SO-20260725-002',
    date: '2026-07-25',
    time: '09:20',
    itemId: 'item-7',
    itemCode: 'BRG-007',
    itemName: 'Sabun Cuci Piring Refill 780ml',
    category: 'Kebersihan',
    location: 'Rak C-02',
    unit: 'Pouch',
    systemStock: 90,
    physicalStock: 88,
    difference: -2,
    unitPrice: 18000,
    totalValueDiff: -36000,
    condition: 'Bagus',
    counterName: 'Siti Rahma',
    notes: 'Input ganda oleh petugas shift pagi',
    status: 'Cancelled',
    cancelReason: 'Transaksi Dibatalkan: Terjadi kesalahan penunjukan lokasi rak.',
    createdAt: '2026-07-25T09:20:00.000Z',
    updatedAt: '2026-07-25T09:25:00.000Z'
  }
];

const INITIALIZED_KEY = 'stok_opname_initialized_v1';

export function getStoredItems(): Item[] {
  try {
    const initialized = localStorage.getItem(INITIALIZED_KEY);
    const data = localStorage.getItem(ITEMS_STORAGE_KEY);
    if (!initialized && data === null) {
      localStorage.setItem(INITIALIZED_KEY, 'true');
      saveStoredItems(INITIAL_ITEMS);
      return INITIAL_ITEMS;
    }
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load items from localStorage', e);
    return [];
  }
}

export function saveStoredItems(items: Item[]): void {
  try {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save items to localStorage', e);
  }
}

export function getStoredTransactions(): OpnameTransaction[] {
  try {
    const initialized = localStorage.getItem(INITIALIZED_KEY);
    const data = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!initialized && data === null) {
      saveStoredTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load transactions from localStorage', e);
    return [];
  }
}

export function saveStoredTransactions(transactions: OpnameTransaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to localStorage', e);
  }
}

export const INITIAL_INCOMING_STOCK: IncomingStockRecord[] = [
  {
    id: 'TRX-IN-20260725-001',
    date: '2026-07-25',
    time: '08:30',
    itemId: 'item-1',
    itemCode: 'BRG-001',
    itemName: 'Kopi Arabika Gayo 250g',
    category: 'Minuman',
    unit: 'Pcs',
    quantity: 50,
    expiryDate: '2026-11-15',
    supplier: 'PT Distribusi Kopi Nusantara',
    notes: 'Pengiriman batch Juli 2026',
    createdAt: '2026-07-25T08:30:00.000Z'
  },
  {
    id: 'TRX-IN-20260724-001',
    date: '2026-07-24',
    time: '14:15',
    itemId: 'item-3',
    itemCode: 'BRG-003',
    itemName: 'Minyak Goreng Sawit 2L',
    category: 'Sembako',
    unit: 'Pouch',
    quantity: 100,
    expiryDate: '2027-01-10',
    supplier: 'CV Sembako Jaya',
    notes: 'Restock mingguan',
    createdAt: '2026-07-24T14:15:00.000Z'
  }
];

export function getStoredIncomingStock(): IncomingStockRecord[] {
  try {
    const initialized = localStorage.getItem(INITIALIZED_KEY);
    const data = localStorage.getItem(INCOMING_STORAGE_KEY);
    if (!initialized && data === null) {
      saveStoredIncomingStock(INITIAL_INCOMING_STOCK);
      return INITIAL_INCOMING_STOCK;
    }
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load incoming stock from localStorage', e);
    return [];
  }
}

export function saveStoredIncomingStock(records: IncomingStockRecord[]): void {
  try {
    localStorage.setItem(INCOMING_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save incoming stock to localStorage', e);
  }
}

export function resetToSampleData(): {
  items: Item[];
  transactions: OpnameTransaction[];
  incomingStock: IncomingStockRecord[];
} {
  localStorage.setItem(INITIALIZED_KEY, 'true');
  saveStoredItems(INITIAL_ITEMS);
  saveStoredTransactions(INITIAL_TRANSACTIONS);
  saveStoredIncomingStock(INITIAL_INCOMING_STOCK);
  return { items: INITIAL_ITEMS, transactions: INITIAL_TRANSACTIONS, incomingStock: INITIAL_INCOMING_STOCK };
}

export function clearAllData(): {
  items: Item[];
  transactions: OpnameTransaction[];
  incomingStock: IncomingStockRecord[];
} {
  localStorage.setItem(INITIALIZED_KEY, 'true');
  saveStoredItems([]);
  saveStoredTransactions([]);
  saveStoredIncomingStock([]);
  return { items: [], transactions: [], incomingStock: [] };
}

export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(absAmount);
  
  return isNegative ? `-${formatted}` : formatted;
}
