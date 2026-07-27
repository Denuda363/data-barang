import React, { useState, useEffect } from 'react';
import { Item, OpnameTransaction, OpnameSummaryStats, IncomingStockRecord } from './types';
import {
  getStoredItems,
  saveStoredItems,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredIncomingStock,
  saveStoredIncomingStock,
  resetToSampleData,
  clearAllData
} from './lib/storage';
import { exportTransactionsToExcel } from './lib/excelUtils';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { InputOpname } from './components/InputOpname';
import { IncomingStock } from './components/IncomingStock';
import { TransactionHistory } from './components/TransactionHistory';
import { ItemManagement } from './components/ItemManagement';
import { ScannerModal } from './components/ScannerModal';
import { ImportExcelModal } from './components/ImportExcelModal';
import { EditOpnameModal } from './components/EditOpnameModal';
import { CancelOpnameModal } from './components/CancelOpnameModal';
import { ResetDataModal } from './components/ResetDataModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { DatabaseTransferModal } from './components/DatabaseTransferModal';

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<OpnameTransaction[]>([]);
  const [incomingRecords, setIncomingRecords] = useState<IncomingStockRecord[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isScanOpen, setIsScanOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [isBackupRestoreOpen, setIsBackupRestoreOpen] = useState<boolean>(false);
  const [isDatabaseTransferOpen, setIsDatabaseTransferOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<OpnameTransaction | null>(null);
  const [cancellingTx, setCancellingTx] = useState<OpnameTransaction | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  // Load stored state on mount
  useEffect(() => {
    const loadedItems = getStoredItems();
    const loadedTxs = getStoredTransactions();
    const loadedIncoming = getStoredIncomingStock();
    setItems(loadedItems);
    setTransactions(loadedTxs);
    setIncomingRecords(loadedIncoming);
  }, []);

  // Save to local storage whenever items, transactions, or incoming records update
  const handleSetItems = (newItems: Item[]) => {
    setItems(newItems);
    saveStoredItems(newItems);
  };

  const handleSetTransactions = (newTxs: OpnameTransaction[]) => {
    setTransactions(newTxs);
    saveStoredTransactions(newTxs);
  };

  const handleSetIncomingRecords = (newRecords: IncomingStockRecord[]) => {
    setIncomingRecords(newRecords);
    saveStoredIncomingStock(newRecords);
  };

  // Compute Overall Stats
  const completedTxs = transactions.filter((t) => t.status === 'Completed');
  const totalItemsChecked = completedTxs.length;
  const exactMatches = completedTxs.filter((t) => t.difference === 0).length;
  const accuracyRate = totalItemsChecked > 0 ? (exactMatches / totalItemsChecked) * 100 : 100;

  const totalSystemStock = completedTxs.reduce((acc, t) => acc + t.systemStock, 0);
  const totalPhysicalStock = completedTxs.reduce((acc, t) => acc + t.physicalStock, 0);
  const totalDifference = totalPhysicalStock - totalSystemStock;
  const totalValueDiscrepancy = completedTxs.reduce((acc, t) => acc + t.totalValueDiff, 0);

  const stats: OpnameSummaryStats = {
    totalOpnameCount: transactions.length,
    completedCount: completedTxs.length,
    draftCount: transactions.filter((t) => t.status === 'Draft').length,
    cancelledCount: transactions.filter((t) => t.status === 'Cancelled').length,
    totalItemsChecked,
    totalSystemStock,
    totalPhysicalStock,
    totalDifference,
    totalValueDiscrepancy,
    accuracyRate,
  };

  // Handlers
  const handleSaveIncomingStock = (
    recordData: Omit<IncomingStockRecord, 'id' | 'createdAt'>,
    isNewItem: boolean,
    newItemDetails?: Omit<Item, 'id' | 'updatedAt'>
  ) => {
    const now = new Date();
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(incomingRecords.length + 1).padStart(3, '0');
    const recId = `TRX-IN-${dateCode}-${seq}`;

    const newRecord: IncomingStockRecord = {
      ...recordData,
      id: recId,
      status: 'Active',
      createdAt: now.toISOString(),
    };

    const updatedIncoming = [newRecord, ...incomingRecords];
    handleSetIncomingRecords(updatedIncoming);

    // Update or create item in Master Items
    let updatedItems = [...items];
    const existingIndex = updatedItems.findIndex(
      (i) => i.id === recordData.itemId || i.code.toLowerCase() === recordData.itemCode.toLowerCase()
    );

    if (existingIndex >= 0) {
      const existing = updatedItems[existingIndex];
      updatedItems[existingIndex] = {
        ...existing,
        systemStock: existing.systemStock + recordData.quantity,
        expiryDate: recordData.expiryDate || existing.expiryDate,
        updatedAt: now.toISOString()
      };
    } else if (newItemDetails) {
      const newItem: Item = {
        ...newItemDetails,
        id: recordData.itemId || `item-${Date.now()}`,
        updatedAt: now.toISOString()
      };
      updatedItems = [newItem, ...updatedItems];
    }

    handleSetItems(updatedItems);
  };

  const handleUpdateIncomingStock = (
    updatedRecord: IncomingStockRecord,
    oldQuantity: number
  ) => {
    const updatedRecords = incomingRecords.map((r) =>
      r.id === updatedRecord.id ? updatedRecord : r
    );
    handleSetIncomingRecords(updatedRecords);

    // Adjust system stock in items
    const diffQty = updatedRecord.quantity - oldQuantity;
    let updatedItems = items.map((item) => {
      if (item.id === updatedRecord.itemId || item.code.toLowerCase() === updatedRecord.itemCode.toLowerCase()) {
        const newStock = Math.max(0, item.systemStock + diffQty);
        return {
          ...item,
          systemStock: newStock,
          expiryDate: updatedRecord.expiryDate || item.expiryDate,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    handleSetItems(updatedItems);
  };

  const handleCancelIncomingStock = (recordId: string) => {
    const targetRecord = incomingRecords.find((r) => r.id === recordId);
    if (!targetRecord) return;

    // Mark as cancelled
    const updatedRecords = incomingRecords.map((r) =>
      r.id === recordId ? { ...r, status: 'Cancelled' as const } : r
    );
    handleSetIncomingRecords(updatedRecords);

    // Deduct stock back if it was active
    if (targetRecord.status !== 'Cancelled') {
      let updatedItems = items.map((item) => {
        if (item.id === targetRecord.itemId || item.code.toLowerCase() === targetRecord.itemCode.toLowerCase()) {
          return {
            ...item,
            systemStock: Math.max(0, item.systemStock - targetRecord.quantity),
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });
      handleSetItems(updatedItems);
    }
  };

  // Handlers
  const handleSaveTransaction = (
    newTxData: Omit<OpnameTransaction, 'id' | 'createdAt' | 'updatedAt'>,
    updateMasterStock: boolean
  ) => {
    const now = new Date();
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = String(transactions.length + 1).padStart(3, '0');
    const txId = `TRX-SO-${dateCode}-${randomSeq}`;

    const newTx: OpnameTransaction = {
      ...newTxData,
      id: txId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const updatedTxs = [newTx, ...transactions];
    handleSetTransactions(updatedTxs);

    // If update master stock is selected & status is completed
    if (updateMasterStock && newTx.status === 'Completed') {
      const updatedItems = items.map((item) => {
        if (item.id === newTx.itemId || item.code === newTx.itemCode) {
          return {
            ...item,
            systemStock: newTx.physicalStock,
            updatedAt: now.toISOString(),
          };
        }
        return item;
      });
      handleSetItems(updatedItems);
    }
  };

  const handleUpdateTransaction = (updatedTx: OpnameTransaction) => {
    const updatedTxs = transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t));
    handleSetTransactions(updatedTxs);
  };

  const handleConfirmCancelTransaction = (txId: string, cancelReason: string) => {
    const updatedTxs = transactions.map((t) => {
      if (t.id === txId) {
        return {
          ...t,
          status: 'Cancelled' as const,
          cancelReason,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    handleSetTransactions(updatedTxs);
  };

  const handleImportExcelSuccess = (
    importedList: Omit<Item, 'id' | 'updatedAt'>[],
    mode: 'update' | 'appendOnly'
  ) => {
    const now = new Date().toISOString();
    let updatedItems = [...items];

    importedList.forEach((imp, index) => {
      const existingIdx = updatedItems.findIndex(
        (i) => i.code.toLowerCase() === imp.code.toLowerCase()
      );

      if (existingIdx >= 0) {
        if (mode === 'update') {
          updatedItems[existingIdx] = {
            ...updatedItems[existingIdx],
            name: imp.name,
            category: imp.category,
            location: imp.location,
            unit: imp.unit,
            systemStock: imp.systemStock,
            unitPrice: imp.unitPrice,
            minStock: imp.minStock ?? updatedItems[existingIdx].minStock,
            expiryDate: imp.expiryDate || updatedItems[existingIdx].expiryDate,
            updatedAt: now,
          };
        }
      } else {
        const newItem: Item = {
          ...imp,
          id: `item-imp-${Date.now()}-${index}`,
          updatedAt: now,
        };
        updatedItems.push(newItem);
      }
    });

    handleSetItems(updatedItems);
    alert(`Berhasil mengimport ${importedList.length} data barang ke master inventory!`);
  };

  const handleAddItem = (newItemData: Omit<Item, 'id' | 'updatedAt'>) => {
    const newItem: Item = {
      ...newItemData,
      id: `item-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    handleSetItems([newItem, ...items]);
  };

  const handleUpdateItem = (updatedItem: Item) => {
    const updatedList = items.map((i) => (i.id === updatedItem.id ? updatedItem : i));
    handleSetItems(updatedList);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedList = items.filter((i) => i.id !== itemId);
    handleSetItems(updatedList);
  };

  const handleConfirmClearAll = () => {
    const res = clearAllData();
    setItems(res.items);
    setTransactions(res.transactions);
    setIncomingRecords(res.incomingStock);
  };

  const handleConfirmResetSample = () => {
    const res = resetToSampleData();
    setItems(res.items);
    setTransactions(res.transactions);
    setIncomingRecords(res.incomingStock);
  };

  const handleRestoreData = (
    restoredItems: Item[],
    restoredTransactions: OpnameTransaction[],
    restoredIncoming: IncomingStockRecord[]
  ) => {
    handleSetItems(restoredItems);
    handleSetTransactions(restoredTransactions);
    handleSetIncomingRecords(restoredIncoming);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenImport={() => setIsImportOpen(true)}
        onExportTransactions={() => exportTransactionsToExcel(transactions)}
        onOpenBackupRestore={() => setIsBackupRestoreOpen(true)}
        onOpenDatabaseTransfer={() => setIsDatabaseTransferOpen(true)}
        onResetData={() => setIsResetOpen(true)}
        pendingDraftsCount={stats.draftCount}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-20 md:pb-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            items={items}
            transactions={transactions}
            stats={stats}
            onNavigate={setActiveTab}
            onOpenScan={() => setIsScanOpen(true)}
            onOpenImport={() => setIsImportOpen(true)}
          />
        )}

        {activeTab === 'incoming' && (
          <IncomingStock
            items={items}
            incomingRecords={incomingRecords}
            onSaveIncomingStock={handleSaveIncomingStock}
            onUpdateIncomingStock={handleUpdateIncomingStock}
            onCancelIncomingStock={handleCancelIncomingStock}
            onNavigateToItems={() => setActiveTab('items')}
          />
        )}

        {activeTab === 'input' && (
          <InputOpname
            items={items}
            onSaveTransaction={handleSaveTransaction}
            onOpenScan={() => setIsScanOpen(true)}
            scannedCode={scannedCode}
            onClearScannedCode={() => setScannedCode(null)}
          />
        )}

        {activeTab === 'history' && (
          <TransactionHistory
            transactions={transactions}
            onOpenEdit={(tx) => setEditingTx(tx)}
            onOpenCancel={(tx) => setCancellingTx(tx)}
          />
        )}

        {activeTab === 'items' && (
          <ItemManagement
            items={items}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onOpenImport={() => setIsImportOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenImport={() => setIsImportOpen(true)}
        pendingDraftsCount={stats.draftCount}
      />

      {/* Modals */}
      <ScannerModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onScanSuccess={(code) => {
          setScannedCode(code);
          setIsScanOpen(false);
          setActiveTab('input');
        }}
      />

      <ImportExcelModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImportExcelSuccess}
      />

      <EditOpnameModal
        transaction={editingTx}
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        onSave={handleUpdateTransaction}
      />

      <CancelOpnameModal
        transaction={cancellingTx}
        isOpen={!!cancellingTx}
        onClose={() => setCancellingTx(null)}
        onConfirmCancel={handleConfirmCancelTransaction}
      />

      <ResetDataModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirmClearAll={handleConfirmClearAll}
        onConfirmResetSample={handleConfirmResetSample}
      />

      <BackupRestoreModal
        isOpen={isBackupRestoreOpen}
        onClose={() => setIsBackupRestoreOpen(false)}
        items={items}
        transactions={transactions}
        incomingRecords={incomingRecords}
        onRestoreData={handleRestoreData}
      />

      <DatabaseTransferModal
        isOpen={isDatabaseTransferOpen}
        onClose={() => setIsDatabaseTransferOpen(false)}
        items={items}
        transactions={transactions}
        incomingRecords={incomingRecords}
        onApplyDatabaseData={(newItems, newTxs, newInc, sourceName) => {
          handleRestoreData(newItems, newTxs, newInc);
        }}
      />
    </div>
  );
}
