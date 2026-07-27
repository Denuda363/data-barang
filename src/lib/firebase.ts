import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDocs,
  writeBatch,
  setDoc,
  deleteDoc,
  query,
  getDoc
} from 'firebase/firestore';
import { Item, OpnameTransaction, IncomingStockRecord } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

const config: FirebaseConfig = firebaseConfigData as FirebaseConfig;

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(config);
} else {
  app = getApp();
}

// Function to get firestore instance (default or named database)
export function getDb(databaseId?: string): Firestore {
  const targetDbId = databaseId || config.firestoreDatabaseId || '(default)';
  try {
    return getFirestore(app, targetDbId);
  } catch {
    return getFirestore(app);
  }
}

export const defaultDb = getDb();

export interface DbStats {
  itemCount: number;
  txCount: number;
  incomingCount: number;
  lastUpdated?: string;
}

// 1. Save / Sync All to Firebase Firestore
export async function saveAllToFirebase(
  items: Item[],
  transactions: OpnameTransaction[],
  incomingRecords: IncomingStockRecord[],
  databaseId?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const db = getDb(databaseId);

    // Save Items
    const itemsRef = collection(db, 'items');
    // Clear existing items in batch or overwrite docs
    const existingItems = await getDocs(itemsRef);
    const batch = writeBatch(db);
    existingItems.docs.forEach((d) => batch.delete(d.ref));
    items.forEach((item) => {
      const docRef = doc(db, 'items', item.id);
      batch.set(docRef, item);
    });

    // Save Transactions
    const txRef = collection(db, 'transactions');
    const existingTx = await getDocs(txRef);
    existingTx.docs.forEach((d) => batch.delete(d.ref));
    transactions.forEach((tx) => {
      const docRef = doc(db, 'transactions', tx.id);
      batch.set(docRef, tx);
    });

    // Save Incoming Records
    const incRef = collection(db, 'incoming_stock');
    const existingInc = await getDocs(incRef);
    existingInc.docs.forEach((d) => batch.delete(d.ref));
    incomingRecords.forEach((inc) => {
      const docRef = doc(db, 'incoming_stock', inc.id);
      batch.set(docRef, inc);
    });

    // Save Metadata
    const metaRef = doc(db, 'metadata', 'db_info');
    batch.set(metaRef, {
      updatedAt: new Date().toISOString(),
      itemCount: items.length,
      txCount: transactions.length,
      incomingCount: incomingRecords.length,
    });

    await batch.commit();
    return {
      success: true,
      message: `Berhasil menyimpan data ke Firebase Firestore (${items.length} Barang, ${transactions.length} Transaksi, ${incomingRecords.length} Barang Masuk)`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal menyimpan ke Firebase';
    return { success: false, message: msg };
  }
}

// 2. Load All Data from Firebase Firestore
export async function loadAllFromFirebase(
  databaseId?: string
): Promise<{
  success: boolean;
  message: string;
  data?: {
    items: Item[];
    transactions: OpnameTransaction[];
    incomingRecords: IncomingStockRecord[];
  };
}> {
  try {
    const db = getDb(databaseId);

    const itemsSnap = await getDocs(collection(db, 'items'));
    const txSnap = await getDocs(collection(db, 'transactions'));
    const incSnap = await getDocs(collection(db, 'incoming_stock'));

    const items: Item[] = itemsSnap.docs.map((doc) => doc.data() as Item);
    const transactions: OpnameTransaction[] = txSnap.docs.map((doc) => doc.data() as OpnameTransaction);
    const incomingRecords: IncomingStockRecord[] = incSnap.docs.map((doc) => doc.data() as IncomingStockRecord);

    return {
      success: true,
      message: `Berhasil memuat data dari Firebase (${items.length} Barang, ${transactions.length} Transaksi, ${incomingRecords.length} Barang Masuk)`,
      data: { items, transactions, incomingRecords },
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal memuat data dari Firebase';
    return { success: false, message: msg };
  }
}

// 3. Database Snapshots for Multi-DB Transfers
export interface DatabaseSnapshot {
  id: string;
  name: string;
  createdAt: string;
  itemCount: number;
  txCount: number;
  incomingCount: number;
  items: Item[];
  transactions: OpnameTransaction[];
  incomingStock: IncomingStockRecord[];
}

export async function createDatabaseSnapshot(
  snapshotName: string,
  items: Item[],
  transactions: OpnameTransaction[],
  incomingRecords: IncomingStockRecord[],
  databaseId?: string
): Promise<{ success: boolean; message: string; snapshotId?: string }> {
  try {
    const db = getDb(databaseId);
    const snapId = `snap_${Date.now()}`;
    const snapshot: DatabaseSnapshot = {
      id: snapId,
      name: snapshotName,
      createdAt: new Date().toISOString(),
      itemCount: items.length,
      txCount: transactions.length,
      incomingCount: incomingRecords.length,
      items,
      transactions,
      incomingStock: incomingRecords,
    };

    await setDoc(doc(db, 'database_snapshots', snapId), snapshot);
    return {
      success: true,
      message: `Snapshot "${snapshotName}" berhasil dibuat di Firebase!`,
      snapshotId: snapId,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal membuat snapshot';
    return { success: false, message: msg };
  }
}

export async function fetchDatabaseSnapshots(
  databaseId?: string
): Promise<DatabaseSnapshot[]> {
  try {
    const db = getDb(databaseId);
    const snap = await getDocs(collection(db, 'database_snapshots'));
    return snap.docs.map((doc) => doc.data() as DatabaseSnapshot);
  } catch {
    return [];
  }
}

export async function deleteDatabaseSnapshot(
  snapshotId: string,
  databaseId?: string
): Promise<boolean> {
  try {
    const db = getDb(databaseId);
    await deleteDoc(doc(db, 'database_snapshots', snapshotId));
    return true;
  } catch {
    return false;
  }
}
