import { Item, OpnameTransaction, IncomingStockRecord } from '../types';

export interface BackupData {
  app: string;
  version: string;
  exportedAt: string;
  items: Item[];
  transactions: OpnameTransaction[];
  incomingStock: IncomingStockRecord[];
}

export async function exportBackupToJson(
  items: Item[],
  transactions: OpnameTransaction[],
  incomingStock: IncomingStockRecord[]
): Promise<void> {
  const data: BackupData = {
    app: 'Stok Opname Inventory System',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    items: items || [],
    transactions: transactions || [],
    incomingStock: incomingStock || [],
  };

  const jsonString = JSON.stringify(data, null, 2);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const fileName = `backup_stok_opname_${dateStr}_${timeStr}.json`;

  const blob = new Blob([jsonString], { type: 'application/json' });
  const file = new File([blob], fileName, { type: 'application/json' });

  // 1. Try Web Share API (native on iOS Safari & Mobile)
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Backup Data Stok Opname',
        text: 'File backup JSON data stok opname',
      });
      return;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // User intentionally closed the iOS share sheet
      }
    }
  }

  // 2. iOS Safari / WebKit Fallback using Data URL
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
    // Standard desktop / Android blob download
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

export function generateBackupJsonString(
  items: Item[],
  transactions: OpnameTransaction[],
  incomingStock: IncomingStockRecord[]
): string {
  const data: BackupData = {
    app: 'Stok Opname Inventory System',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    items: items || [],
    transactions: transactions || [],
    incomingStock: incomingStock || [],
  };
  return JSON.stringify(data, null, 2);
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
