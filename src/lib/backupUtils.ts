import { Item, OpnameTransaction, IncomingStockRecord } from '../types';

export interface BackupData {
  app: string;
  version: string;
  exportedAt: string;
  items: Item[];
  transactions: OpnameTransaction[];
  incomingStock: IncomingStockRecord[];
}

export function exportBackupToJson(
  items: Item[],
  transactions: OpnameTransaction[],
  incomingStock: IncomingStockRecord[]
): void {
  const data: BackupData = {
    app: 'Stok Opname Inventory System',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    items: items || [],
    transactions: transactions || [],
    incomingStock: incomingStock || [],
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');

  link.href = url;
  link.download = `backup_stok_opname_${dateStr}_${timeStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseAndValidateBackupJson(jsonString: string): {
  valid: boolean;
  error?: string;
  data?: BackupData;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || parsed === null) {
      return { valid: false, error: 'File JSON tidak berformat objek yang valid.' };
    }

    const hasItems = Array.isArray(parsed.items);
    const hasTransactions = Array.isArray(parsed.transactions);
    const hasIncoming = Array.isArray(parsed.incomingStock);

    if (!hasItems && !hasTransactions && !hasIncoming) {
      return {
        valid: false,
        error: 'File JSON tidak mengandung struktur data stok opname (items, transactions, atau incomingStock).',
      };
    }

    const items: Item[] = hasItems ? parsed.items : [];
    const transactions: OpnameTransaction[] = hasTransactions ? parsed.transactions : [];
    const incomingStock: IncomingStockRecord[] = hasIncoming ? parsed.incomingStock : [];

    return {
      valid: true,
      data: {
        app: parsed.app || 'Stok Opname System',
        version: parsed.version || '1.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        items,
        transactions,
        incomingStock,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Format JSON rusak';
    return { valid: false, error: `Gagal memproses file JSON: ${msg}` };
  }
}
