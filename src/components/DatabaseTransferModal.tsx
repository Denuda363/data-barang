import React, { useState, useEffect } from 'react';
import {
  Database,
  ArrowRightLeft,
  CloudUpload,
  CloudDownload,
  Server,
  HardDrive,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Trash2,
  Plus,
  Clock,
  Sparkles
} from 'lucide-react';
import { Item, OpnameTransaction, IncomingStockRecord } from '../types';
import {
  saveAllToFirebase,
  loadAllFromFirebase,
  createDatabaseSnapshot,
  fetchDatabaseSnapshots,
  deleteDatabaseSnapshot,
  DatabaseSnapshot
} from '../lib/firebase';
import { exportBackupToJson, parseAndValidateBackupJson } from '../lib/backupUtils';

interface DatabaseTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  transactions: OpnameTransaction[];
  incomingRecords: IncomingStockRecord[];
  onApplyDatabaseData: (
    newItems: Item[],
    newTransactions: OpnameTransaction[],
    newIncoming: IncomingStockRecord[],
    sourceName: string
  ) => void;
}

type DbSourceType = 'local' | 'firebase' | 'snapshot' | 'json_file';
type DbTargetType = 'local' | 'firebase' | 'snapshot_new' | 'json_export';

export const DatabaseTransferModal: React.FC<DatabaseTransferModalProps> = ({
  isOpen,
  onClose,
  items,
  transactions,
  incomingRecords,
  onApplyDatabaseData,
}) => {
  const [activeTab, setActiveTab] = useState<'cloud_sync' | 'db_transfer' | 'snapshots'>('cloud_sync');

  // Cloud Sync State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  // Transfer Database State
  const [sourceType, setSourceType] = useState<DbSourceType>('local');
  const [targetType, setTargetType] = useState<DbTargetType>('firebase');
  const [transferMode, setTransferMode] = useState<'replace' | 'merge'>('replace');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>('');
  const [jsonFileInput, setJsonFileInput] = useState<File | null>(null);
  const [parsedJsonData, setParsedJsonData] = useState<{
    items: Item[];
    transactions: OpnameTransaction[];
    incomingStock: IncomingStockRecord[];
  } | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Snapshots State
  const [snapshots, setSnapshots] = useState<DatabaseSnapshot[]>([]);
  const [newSnapshotName, setNewSnapshotName] = useState<string>('');
  const [isCreatingSnap, setIsCreatingSnap] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSnapshots();
    }
  }, [isOpen]);

  const loadSnapshots = async () => {
    const list = await fetchDatabaseSnapshots();
    setSnapshots(list);
    if (list.length > 0 && !selectedSnapshotId) {
      setSelectedSnapshotId(list[0].id);
    }
  };

  if (!isOpen) return null;

  // 1. Direct Save to Firebase
  const handleSaveToFirebase = async () => {
    setIsSyncing(true);
    setSyncStatus({ type: null, message: '' });
    const res = await saveAllToFirebase(items, transactions, incomingRecords);
    setIsSyncing(false);
    if (res.success) {
      setSyncStatus({ type: 'success', message: res.message });
    } else {
      setSyncStatus({ type: 'error', message: res.message });
    }
  };

  // 2. Direct Load from Firebase
  const handleLoadFromFirebase = async () => {
    setIsSyncing(true);
    setSyncStatus({ type: null, message: '' });
    const res = await loadAllFromFirebase();
    setIsSyncing(false);
    if (res.success && res.data) {
      onApplyDatabaseData(
        res.data.items,
        res.data.transactions,
        res.data.incomingRecords,
        'Firebase Cloud Firestore'
      );
      setSyncStatus({ type: 'success', message: res.message });
    } else {
      setSyncStatus({ type: 'error', message: res.message });
    }
  };

  // 3. Create Snapshot
  const handleCreateSnapshot = async () => {
    if (!newSnapshotName.trim()) return;
    setIsCreatingSnap(true);
    const res = await createDatabaseSnapshot(
      newSnapshotName.trim(),
      items,
      transactions,
      incomingRecords
    );
    setIsCreatingSnap(false);
    if (res.success) {
      setNewSnapshotName('');
      loadSnapshots();
      setSyncStatus({ type: 'success', message: res.message });
    } else {
      setSyncStatus({ type: 'error', message: res.message });
    }
  };

  // Handle JSON file selection
  const handleJsonSelected = (file: File) => {
    setJsonFileInput(file);
    setJsonError(null);
    setParsedJsonData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = parseAndValidateBackupJson(content);
      if (res.valid && res.data) {
        setParsedJsonData({
          items: res.data.items,
          transactions: res.data.transactions,
          incomingStock: res.data.incomingStock,
        });
      } else {
        setJsonError(res.error || 'Format JSON tidak valid');
      }
    };
    reader.readAsText(file);
  };

  // Execute Database 1 -> Database 2 Transfer
  const handleExecuteTransfer = async () => {
    setTransferSuccess(null);
    setSyncStatus({ type: null, message: '' });

    // Step A: Determine Source Data (Database 1)
    let srcItems: Item[] = [];
    let srcTxs: OpnameTransaction[] = [];
    let srcInc: IncomingStockRecord[] = [];
    let srcName = '';

    if (sourceType === 'local') {
      srcItems = items;
      srcTxs = transactions;
      srcInc = incomingRecords;
      srcName = 'Database Lokal (Browser)';
    } else if (sourceType === 'firebase') {
      setIsSyncing(true);
      const res = await loadAllFromFirebase();
      setIsSyncing(false);
      if (!res.success || !res.data) {
        setSyncStatus({ type: 'error', message: 'Gagal membaca Sumber Data dari Firebase.' });
        return;
      }
      srcItems = res.data.items;
      srcTxs = res.data.transactions;
      srcInc = res.data.incomingRecords;
      srcName = 'Database Cloud Firebase';
    } else if (sourceType === 'snapshot') {
      const targetSnap = snapshots.find((s) => s.id === selectedSnapshotId);
      if (!targetSnap) {
        setSyncStatus({ type: 'error', message: 'Pilih Snapshot Database sumber terlebih dahulu.' });
        return;
      }
      srcItems = targetSnap.items;
      srcTxs = targetSnap.transactions;
      srcInc = targetSnap.incomingStock;
      srcName = `Snapshot: ${targetSnap.name}`;
    } else if (sourceType === 'json_file') {
      if (!parsedJsonData) {
        setSyncStatus({ type: 'error', message: 'Unggah file JSON sumber yang valid terlebih dahulu.' });
        return;
      }
      srcItems = parsedJsonData.items;
      srcTxs = parsedJsonData.transactions;
      srcInc = parsedJsonData.incomingStock;
      srcName = `File JSON (${jsonFileInput?.name})`;
    }

    // Step B: Apply to Target Data (Database 2)
    if (targetType === 'local') {
      let finalItems = srcItems;
      let finalTxs = srcTxs;
      let finalInc = srcInc;

      if (transferMode === 'merge') {
        const itemMap = new Map<string, Item>();
        items.forEach((i) => itemMap.set(i.id, i));
        srcItems.forEach((i) => itemMap.set(i.id, i));
        finalItems = Array.from(itemMap.values());

        const txMap = new Map<string, OpnameTransaction>();
        transactions.forEach((t) => txMap.set(t.id, t));
        srcTxs.forEach((t) => txMap.set(t.id, t));
        finalTxs = Array.from(txMap.values());

        const incMap = new Map<string, IncomingStockRecord>();
        incomingRecords.forEach((r) => incMap.set(r.id, r));
        srcInc.forEach((r) => incMap.set(r.id, r));
        finalInc = Array.from(incMap.values());
      }

      onApplyDatabaseData(finalItems, finalTxs, finalInc, srcName);
      setTransferSuccess(
        `Transfer Berhasil! Data dari [${srcName}] telah dipindahkan ke [Database Lokal]. (${finalItems.length} Barang)`
      );
    } else if (targetType === 'firebase') {
      setIsSyncing(true);
      let payloadItems = srcItems;
      let payloadTxs = srcTxs;
      let payloadInc = srcInc;

      if (transferMode === 'merge') {
        const fbCurrent = await loadAllFromFirebase();
        if (fbCurrent.success && fbCurrent.data) {
          const itemMap = new Map<string, Item>();
          fbCurrent.data.items.forEach((i) => itemMap.set(i.id, i));
          srcItems.forEach((i) => itemMap.set(i.id, i));
          payloadItems = Array.from(itemMap.values());

          const txMap = new Map<string, OpnameTransaction>();
          fbCurrent.data.transactions.forEach((t) => txMap.set(t.id, t));
          srcTxs.forEach((t) => txMap.set(t.id, t));
          payloadTxs = Array.from(txMap.values());

          const incMap = new Map<string, IncomingStockRecord>();
          fbCurrent.data.incomingRecords.forEach((r) => incMap.set(r.id, r));
          srcInc.forEach((r) => incMap.set(r.id, r));
          payloadInc = Array.from(incMap.values());
        }
      }

      const res = await saveAllToFirebase(payloadItems, payloadTxs, payloadInc);
      setIsSyncing(false);

      if (res.success) {
        setTransferSuccess(
          `Transfer Berhasil! Data dari [${srcName}] telah dipindahkan ke [Database Firebase Cloud].`
        );
      } else {
        setSyncStatus({ type: 'error', message: res.message });
      }
    } else if (targetType === 'snapshot_new') {
      setIsCreatingSnap(true);
      const snapName = `Transfer_Snap_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}_${Date.now().toString().slice(-4)}`;
      const res = await createDatabaseSnapshot(snapName, srcItems, srcTxs, srcInc);
      setIsCreatingSnap(false);
      if (res.success) {
        loadSnapshots();
        setTransferSuccess(
          `Transfer Berhasil! Data dari [${srcName}] disimpan sebagai Snapshot Baru [${snapName}] di Firebase.`
        );
      } else {
        setSyncStatus({ type: 'error', message: res.message });
      }
    } else if (targetType === 'json_export') {
      exportBackupToJson(srcItems, srcTxs, srcInc);
      setTransferSuccess(`File JSON berhasil diunduh dari Sumber Data [${srcName}].`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                Firebase & Transfer Database
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Firebase Active
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Simpan ke Firebase Firestore atau Transfer Data dari Database 1 ke Database 2
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

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('cloud_sync')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'cloud_sync'
                ? 'bg-white text-indigo-700 shadow-md font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4 text-indigo-600" />
            Firebase Sync
          </button>
          <button
            onClick={() => setActiveTab('db_transfer')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'db_transfer'
                ? 'bg-white text-indigo-700 shadow-md font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-purple-600" />
            Transfer DB 1 → DB 2
          </button>
          <button
            onClick={() => setActiveTab('snapshots')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'snapshots'
                ? 'bg-white text-indigo-700 shadow-md font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            Snapshots Cloud ({snapshots.length})
          </button>
        </div>

        {/* Global Banner Messages */}
        {syncStatus.type && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
              syncStatus.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {syncStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="font-semibold leading-relaxed">{syncStatus.message}</p>
          </div>
        )}

        {/* TAB 1: FIREBASE CLOUD SYNC */}
        {activeTab === 'cloud_sync' && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-inner space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    Cloud Firestore Connected
                  </span>
                </div>
                <span className="text-[11px] font-mono bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-800/60">
                  gen-lang-client-0982313346
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                  <p className="text-[10px] text-slate-400 font-medium">Stok Barang Lokal</p>
                  <p className="text-base font-extrabold text-white">{items.length}</p>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                  <p className="text-[10px] text-slate-400 font-medium">Transaksi Opname</p>
                  <p className="text-base font-extrabold text-indigo-400">{transactions.length}</p>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                  <p className="text-[10px] text-slate-400 font-medium">Barang Masuk</p>
                  <p className="text-base font-extrabold text-emerald-400">{incomingRecords.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleSaveToFirebase}
                className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/30 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <CloudUpload className="w-6 h-6 text-indigo-200" />
                <div>
                  <p className="font-extrabold text-xs">Simpan ke Firebase Cloud</p>
                  <p className="text-[10px] text-indigo-200 mt-0.5">
                    Unggah data lokal ke cloud Firestore
                  </p>
                </div>
              </button>

              <button
                type="button"
                disabled={isSyncing}
                onClick={handleLoadFromFirebase}
                className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-lg shadow-slate-900/30 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <CloudDownload className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="font-extrabold text-xs">Muat dari Firebase Cloud</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Tarik data dari Firestore ke aplikasi lokal
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DATABASE 1 TO DATABASE 2 TRANSFER */}
        {activeTab === 'db_transfer' && (
          <div className="space-y-4">
            {transferSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 text-xs flex items-start gap-3 animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-sm text-emerald-950">Transfer Berhasil!</p>
                  <p className="mt-1 font-medium">{transferSuccess}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SOURCE (DATABASE 1) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-extrabold flex items-center justify-center">
                    1
                  </div>
                  <h3 className="font-extrabold text-xs text-slate-900">
                    SUMBER DATA (Database 1)
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600">Pilih Sumber:</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as DbSourceType)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="local">Database Lokal (Browser / LocalStorage)</option>
                    <option value="firebase">Firebase Firestore Cloud</option>
                    <option value="snapshot">Snapshot Cloud Firestore</option>
                    <option value="json_file">File JSON Backup (Upload File)</option>
                  </select>

                  {sourceType === 'snapshot' && (
                    <div className="pt-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Pilih Snapshot Database:
                      </label>
                      <select
                        value={selectedSnapshotId}
                        onChange={(e) => setSelectedSnapshotId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      >
                        {snapshots.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.itemCount} Barang, {new Date(s.createdAt).toLocaleDateString('id-ID')})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {sourceType === 'json_file' && (
                    <div className="pt-2 space-y-2">
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleJsonSelected(e.target.files[0]);
                          }
                        }}
                        className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                      />
                      {jsonError && <p className="text-[10px] text-rose-600 font-bold">{jsonError}</p>}
                      {parsedJsonData && (
                        <p className="text-[10px] text-emerald-700 font-bold">
                          ✓ Terbaca: {parsedJsonData.items.length} Barang, {parsedJsonData.transactions.length} Transaksi
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* TARGET (DATABASE 2) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-extrabold flex items-center justify-center">
                    2
                  </div>
                  <h3 className="font-extrabold text-xs text-slate-900">
                    TUJUAN DATA (Database 2)
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600">Pilih Tujuan:</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as DbTargetType)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="firebase">Firebase Firestore Cloud</option>
                    <option value="local">Database Lokal (Browser / LocalStorage)</option>
                    <option value="snapshot_new">Buat Snapshot Baru di Firebase</option>
                    <option value="json_export">Export ke File JSON Baru</option>
                  </select>

                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Metode Transfer / Penggabungan:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTransferMode('replace')}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                          transferMode === 'replace'
                            ? 'bg-rose-100 border-rose-300 text-rose-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Timpa Utuh (Overwrite)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransferMode('merge')}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                          transferMode === 'merge'
                            ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Gabungkan Data (Merge)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <button
              type="button"
              disabled={isSyncing || isCreatingSnap}
              onClick={handleExecuteTransfer}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Eksekusi Transfer Data DB 1 → DB 2
            </button>
          </div>
        )}

        {/* TAB 3: SNAPSHOTS MANAGEMENT */}
        {activeTab === 'snapshots' && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <label className="block text-xs font-extrabold text-slate-800">
                Buat Snapshot Database Baru di Firebase Cloud:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSnapshotName}
                  onChange={(e) => setNewSnapshotName(e.target.value)}
                  placeholder="Contoh: Snapshot_Akhir_Bulan_Juli_2026"
                  className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  disabled={isCreatingSnap || !newSnapshotName.trim()}
                  onClick={handleCreateSnapshot}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Simpan Snapshot
                </button>
              </div>
            </div>

            {/* Snapshots List */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Daftar Snapshot Database Terdaftar ({snapshots.length})
              </h3>

              {snapshots.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  Belum ada snapshot database tersimpan di Firebase.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-sm hover:border-indigo-300 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-xs text-slate-900">{snap.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                          <span>{snap.itemCount} Barang</span> •{' '}
                          <span>{snap.txCount} Transaksi</span> •{' '}
                          <span>{new Date(snap.createdAt).toLocaleDateString('id-ID')}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onApplyDatabaseData(
                              snap.items,
                              snap.transactions,
                              snap.incomingStock,
                              `Snapshot: ${snap.name}`
                            );
                            setSyncStatus({
                              type: 'success',
                              message: `Data dari snapshot "${snap.name}" telah dimuat ke aplikasi!`,
                            });
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-xl transition-colors cursor-pointer"
                        >
                          Gunakan Snapshot
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            await deleteDatabaseSnapshot(snap.id);
                            loadSnapshots();
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                          title="Hapus Snapshot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
