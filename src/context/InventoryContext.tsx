import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  SchoolConfig,
  UserEmployee,
  Supplier,
  MasterItem,
  BarangMasuk,
  BarangKeluar,
  AssetRecord,
  MutasiRecord,
  StockOpnameRecord,
  PemeliharaanRecord,
  PenghapusanRecord,
  PengambilanATKRecord,
  AuditTrailRecord,
  StockSummaryItem,
  RkbsItem,
  LaporanKerusakanRecord,
} from '../types';
import {
  initialSchoolConfig,
  initialUsers,
  initialSuppliers,
  initialItems,
  initialBarangMasuk,
  initialBarangKeluar,
  initialAssets,
  initialMutasi,
  initialStockOpname,
  initialPemeliharaan,
  initialPenghapusan,
  initialPengambilanATK,
  initialAuditTrail,
  initialRkbs,
  initialLaporanKerusakan,
} from '../data/initialData';

interface InventoryContextType {
  // Data State
  config: SchoolConfig;
  users: UserEmployee[];
  suppliers: Supplier[];
  items: MasterItem[];
  barangMasuk: BarangMasuk[];
  barangKeluar: BarangKeluar[];
  assets: AssetRecord[];
  mutasi: MutasiRecord[];
  stockOpname: StockOpnameRecord[];
  pemeliharaan: PemeliharaanRecord[];
  penghapusan: PenghapusanRecord[];
  pengambilanATK: PengambilanATKRecord[];
  auditTrail: AuditTrailRecord[];
  rkbs: RkbsItem[];
  laporanKerusakan: LaporanKerusakanRecord[];
  activeUser: UserEmployee;
  setActiveUser: (user: UserEmployee) => void;

  // Computed
  stockSummary: StockSummaryItem[];
  dashboardStats: {
    totalItems: number;
    totalAssets: number;
    totalNilaiAset: number;
    totalNilaiPersediaan: number;
    barangMasukBulanIni: number;
    barangKeluarBulanIni: number;
    itemsMinimum: number;
    itemsHabis: number;
    asetRusak: number;
  };

  // Actions
  updateConfig: (newCfg: Partial<SchoolConfig>) => void;
  addItem: (item: Omit<MasterItem, 'id'>) => string;
  updateItem: (id: string, item: Partial<MasterItem>) => void;
  deleteItem: (id: string) => void;

  addSupplier: (sup: Omit<Supplier, 'id'>) => string;
  addSuppliersBatch: (list: Omit<Supplier, 'id'>[]) => number;
  updateSupplier: (id: string, sup: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  addBarangMasuk: (bm: Omit<BarangMasuk, 'id' | 'timestamp' | 'totalPengadaan'>) => string;
  addBarangMasukBatch: (items: Omit<BarangMasuk, 'id' | 'timestamp' | 'totalPengadaan'>[]) => string[];
  updateBarangMasuk: (id: string, bm: Partial<BarangMasuk>) => void;
  deleteBarangMasuk: (id: string) => void;

  addBarangKeluar: (bk: Omit<BarangKeluar, 'id' | 'timestamp'>) => string;
  addBarangKeluarBatch: (list: Omit<BarangKeluar, 'id' | 'timestamp'>[]) => number;
  updateBarangKeluar: (id: string, bk: Partial<BarangKeluar>) => void;
  deleteBarangKeluar: (id: string) => void;

  addAsset: (asset: Omit<AssetRecord, 'id' | 'totalNilai'>) => string;
  updateAsset: (id: string, asset: Partial<AssetRecord>) => void;
  deleteAsset: (id: string) => void;

  addMutasi: (mut: Omit<MutasiRecord, 'id' | 'timestamp'>) => string;
  deleteMutasi: (id: string) => void;

  addStockOpname: (so: Omit<StockOpnameRecord, 'id' | 'timestamp' | 'selisih'>) => string;
  batchAddStockOpname: (records: Omit<StockOpnameRecord, 'id' | 'timestamp' | 'selisih'>[]) => number;
  deleteStockOpname: (id: string) => void;

  addPemeliharaan: (m: Omit<PemeliharaanRecord, 'id' | 'timestamp'>) => string;
  updatePemeliharaan: (id: string, m: Partial<PemeliharaanRecord>) => void;
  deletePemeliharaan: (id: string) => void;

  addPenghapusan: (p: Omit<PenghapusanRecord, 'id' | 'timestamp'>) => string;
  updatePenghapusan: (id: string, p: Partial<PenghapusanRecord>) => void;
  deletePenghapusan: (id: string) => void;

  addPengambilanATK: (atk: Omit<PengambilanATKRecord, 'id' | 'no' | 'timestamp'>) => { id: string; no: number };
  addPengambilanATKBatch: (list: Omit<PengambilanATKRecord, 'id' | 'no' | 'timestamp'>[]) => number;
  updatePengambilanATK: (id: string, updated: Partial<PengambilanATKRecord>) => void;
  deletePengambilanATK: (id: string) => void;

  addRkbs: (item: Omit<RkbsItem, 'id' | 'timestamp' | 'totalEstimasi'>) => string;
  addRkbsBatch: (items: Omit<RkbsItem, 'id' | 'timestamp' | 'totalEstimasi'>[]) => number;
  updateRkbs: (id: string, item: Partial<RkbsItem>) => void;
  deleteRkbs: (id: string) => void;
  realizeRkbsToBarangMasuk: (
    id: string,
    namaToko: string,
    nomorBku: string,
    nomorKwitansi: string
  ) => string;

  addLaporanKerusakan: (lpr: Omit<LaporanKerusakanRecord, 'id' | 'timestamp'>) => string;
  updateLaporanKerusakan: (id: string, lpr: Partial<LaporanKerusakanRecord>) => void;
  importMasterItemsBatch: (newItems: Omit<MasterItem, 'id'>[]) => number;
  importAssetsBatch: (newAssets: Omit<AssetRecord, 'id' | 'totalNilai'>[]) => number;
  batchUpdateAssets: (updatedAssets: AssetRecord[]) => void;

  addUser: (user: Omit<UserEmployee, 'id'>) => string;
  updateUser: (id: string, user: Partial<UserEmployee>) => void;
  deleteUser: (id: string) => void;

  resetToDefaultData: () => void;
  exportDatabaseToJson: () => string;
  importDatabaseFromJson: (jsonStr: string) => boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONFIG: 'SIMBARAS_CONFIG_V1',
  USERS: 'SIMBARAS_USERS_V1',
  SUPPLIERS: 'SIMBARAS_SUPPLIERS_V1',
  ITEMS: 'SIMBARAS_ITEMS_V1',
  BARANG_MASUK: 'SIMBARAS_MASUK_V1',
  BARANG_KELUAR: 'SIMBARAS_KELUAR_V1',
  ASSETS: 'SIMBARAS_ASSETS_V1',
  MUTASI: 'SIMBARAS_MUTASI_V1',
  STOCK_OPNAME: 'SIMBARAS_OPNAME_V1',
  PEMELIHARAAN: 'SIMBARAS_PEMELIHARAAN_V1',
  PENGHAPUSAN: 'SIMBARAS_PENGHAPUSAN_V1',
  PENGAMBILAN_ATK: 'SIMBARAS_ATK_V1',
  AUDIT_TRAIL: 'SIMBARAS_AUDIT_V1',
  RKBS: 'SIMBARAS_RKBS_V1',
  LAPORAN_KERUSAKAN: 'SIMBARAS_KERUSAKAN_V1',
  ACTIVE_USER: 'SIMBARAS_ACTIVE_USER_V1',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SchoolConfig>(() => loadStorage(STORAGE_KEYS.CONFIG, initialSchoolConfig));
  const [users, setUsers] = useState<UserEmployee[]>(() => loadStorage(STORAGE_KEYS.USERS, initialUsers));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadStorage(STORAGE_KEYS.SUPPLIERS, initialSuppliers));
  const [items, setItems] = useState<MasterItem[]>(() => loadStorage(STORAGE_KEYS.ITEMS, initialItems));
  const [barangMasuk, setBarangMasuk] = useState<BarangMasuk[]>(() => loadStorage(STORAGE_KEYS.BARANG_MASUK, initialBarangMasuk));
  const [barangKeluar, setBarangKeluar] = useState<BarangKeluar[]>(() => loadStorage(STORAGE_KEYS.BARANG_KELUAR, initialBarangKeluar));
  const [assets, setAssets] = useState<AssetRecord[]>(() => loadStorage(STORAGE_KEYS.ASSETS, initialAssets));
  const [mutasi, setMutasi] = useState<MutasiRecord[]>(() => loadStorage(STORAGE_KEYS.MUTASI, initialMutasi));
  const [stockOpname, setStockOpname] = useState<StockOpnameRecord[]>(() => loadStorage(STORAGE_KEYS.STOCK_OPNAME, initialStockOpname));
  const [pemeliharaan, setPemeliharaan] = useState<PemeliharaanRecord[]>(() => loadStorage(STORAGE_KEYS.PEMELIHARAAN, initialPemeliharaan));
  const [penghapusan, setPenghapusan] = useState<PenghapusanRecord[]>(() => loadStorage(STORAGE_KEYS.PENGHAPUSAN, initialPenghapusan));
  const [pengambilanATK, setPengambilanATK] = useState<PengambilanATKRecord[]>(() => loadStorage(STORAGE_KEYS.PENGAMBILAN_ATK, initialPengambilanATK));
  const [auditTrail, setAuditTrail] = useState<AuditTrailRecord[]>(() => loadStorage(STORAGE_KEYS.AUDIT_TRAIL, initialAuditTrail));
  const [rkbs, setRkbs] = useState<RkbsItem[]>(() => loadStorage(STORAGE_KEYS.RKBS, initialRkbs));
  const [laporanKerusakan, setLaporanKerusakan] = useState<LaporanKerusakanRecord[]>(() => loadStorage(STORAGE_KEYS.LAPORAN_KERUSAKAN, initialLaporanKerusakan));

  const [activeUser, setActiveUserState] = useState<UserEmployee>(() => {
    const saved = loadStorage<UserEmployee | null>(STORAGE_KEYS.ACTIVE_USER, null);
    if (saved) return saved;
    return initialUsers[0];
  });

  const setActiveUser = (u: UserEmployee) => {
    setActiveUserState(u);
    saveStorage(STORAGE_KEYS.ACTIVE_USER, u);
  };

  // Sync state to LocalStorage
  useEffect(() => saveStorage(STORAGE_KEYS.CONFIG, config), [config]);
  useEffect(() => saveStorage(STORAGE_KEYS.USERS, users), [users]);
  useEffect(() => saveStorage(STORAGE_KEYS.SUPPLIERS, suppliers), [suppliers]);
  useEffect(() => saveStorage(STORAGE_KEYS.ITEMS, items), [items]);
  useEffect(() => saveStorage(STORAGE_KEYS.BARANG_MASUK, barangMasuk), [barangMasuk]);
  useEffect(() => saveStorage(STORAGE_KEYS.BARANG_KELUAR, barangKeluar), [barangKeluar]);
  useEffect(() => saveStorage(STORAGE_KEYS.ASSETS, assets), [assets]);
  useEffect(() => saveStorage(STORAGE_KEYS.MUTASI, mutasi), [mutasi]);
  useEffect(() => saveStorage(STORAGE_KEYS.STOCK_OPNAME, stockOpname), [stockOpname]);
  useEffect(() => saveStorage(STORAGE_KEYS.PEMELIHARAAN, pemeliharaan), [pemeliharaan]);
  useEffect(() => saveStorage(STORAGE_KEYS.PENGHAPUSAN, penghapusan), [penghapusan]);
  useEffect(() => saveStorage(STORAGE_KEYS.PENGAMBILAN_ATK, pengambilanATK), [pengambilanATK]);
  useEffect(() => saveStorage(STORAGE_KEYS.AUDIT_TRAIL, auditTrail), [auditTrail]);
  useEffect(() => saveStorage(STORAGE_KEYS.RKBS, rkbs), [rkbs]);
  useEffect(() => saveStorage(STORAGE_KEYS.LAPORAN_KERUSAKAN, laporanKerusakan), [laporanKerusakan]);

  // Helper log audit
  const logAudit = (aksi: AuditTrailRecord['aksi'], modul: string, recordId: string, dataJson?: string) => {
    const newAudit: AuditTrailRecord = {
      id: `AUD-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      aksi,
      modul,
      recordId,
      userEmail: activeUser.email,
      dataJson,
    };
    setAuditTrail((prev) => [newAudit, ...prev.slice(0, 199)]);
  };

  // Computed: Stock Summary per Master Item
  const stockSummary = useMemo<StockSummaryItem[]>(() => {
    // Map stok masuk
    const masukMap = new Map<string, number>();
    barangMasuk.forEach((bm) => {
      const code = bm.kodeBarang;
      masukMap.set(code, (masukMap.get(code) || 0) + Number(bm.jumlah || 0));
    });

    // Map stok keluar
    const keluarMap = new Map<string, number>();
    barangKeluar.forEach((bk) => {
      const code = bk.kodeBarang;
      keluarMap.set(code, (keluarMap.get(code) || 0) + Number(bk.jumlah || 0));
    });

    // Jika konfigurasi reduceStockOnATKPickup aktif, hitung juga pemakaian dari Pengambilan ATK
    if (config.reduceStockOnATKPickup) {
      pengambilanATK.forEach((p) => {
        p.items.forEach((it) => {
          // Cari kode barang dari nama barang
          const matching = items.find((m) => m.id === it.id || m.namaBarang.toLowerCase() === it.namaBarang.toLowerCase());
          if (matching) {
            const code = matching.kodeBarang;
            keluarMap.set(code, (keluarMap.get(code) || 0) + Number(it.jumlah || 0));
          }
        });
      });
    }

    return items.map((item) => {
      const sMasuk = masukMap.get(item.kodeBarang) || 0;
      const sKeluar = keluarMap.get(item.kodeBarang) || 0;
      const saldo = sMasuk - sKeluar;
      let status: 'AMAN' | 'MINIMUM' | 'HABIS' = 'AMAN';
      if (saldo <= 0) {
        status = 'HABIS';
      } else if (saldo <= item.batasMinimum) {
        status = 'MINIMUM';
      }

      const nilaiPersediaan = Math.max(0, saldo * (item.hargaEstimasi || 0));

      return {
        kodeBarang: item.kodeBarang,
        namaBarang: item.namaBarang,
        kategori: item.kategori,
        jenisSatuan: item.jenisSatuan,
        tipe: item.tipe,
        stokMasuk: sMasuk,
        stokKeluar: sKeluar,
        stok: saldo,
        batasMinimum: item.batasMinimum,
        status,
        nilaiPersediaan,
      };
    });
  }, [items, barangMasuk, barangKeluar, pengambilanATK, config.reduceStockOnATKPickup]);

  // Dashboard Stats
  const dashboardStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const inMonth = barangMasuk
      .filter((bm) => {
        const d = new Date(bm.tanggal);
        return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);

    const outMonth = barangKeluar
      .filter((bk) => {
        const d = new Date(bk.tanggal);
        return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);

    const totalNilaiAset = assets.reduce((sum, a) => sum + Number(a.totalNilai || a.hargaSatuan * a.jumlah || 0), 0);
    const totalNilaiPersediaan = stockSummary.reduce((sum, s) => sum + s.nilaiPersediaan, 0);

    const itemsMin = stockSummary.filter((s) => s.status === 'MINIMUM').length;
    const itemsHab = stockSummary.filter((s) => s.status === 'HABIS').length;
    const asetRusak = assets.filter((a) => a.kondisi === 'RUSAK_BERAT' || a.kondisi === 'RUSAK_RINGAN').length;

    return {
      totalItems: items.length,
      totalAssets: assets.length,
      totalNilaiAset,
      totalNilaiPersediaan,
      barangMasukBulanIni: inMonth,
      barangKeluarBulanIni: outMonth,
      itemsMinimum: itemsMin,
      itemsHabis: itemsHab,
      asetRusak,
    };
  }, [items, assets, barangMasuk, barangKeluar, stockSummary]);

  // Config Action
  const updateConfig = (newCfg: Partial<SchoolConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newCfg };
      logAudit('UPDATE', 'CONFIG', 'SEKOLAH', JSON.stringify(newCfg));
      return updated;
    });
  };

  // Master Items Actions
  const addItem = (item: Omit<MasterItem, 'id'>) => {
    const id = `ITM-${Date.now().toString().slice(-4)}`;
    const newItem: MasterItem = { ...item, id };
    setItems((prev) => [newItem, ...prev]);
    logAudit('CREATE', 'ITEMS', newItem.kodeBarang, `${newItem.kodeBarang} - ${newItem.namaBarang}`);
    return id;
  };

  const updateItem = (id: string, updated: Partial<MasterItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...updated } : it))
    );
    logAudit('UPDATE', 'ITEMS', id, JSON.stringify(updated));
  };

  const deleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    logAudit('DELETE', 'ITEMS', id, item?.namaBarang);
  };

  // Suppliers Actions
  const addSupplier = (sup: Omit<Supplier, 'id'>) => {
    const id = `SUP-${Date.now().toString().slice(-3)}`;
    const newSup: Supplier = { ...sup, id };
    setSuppliers((prev) => [newSup, ...prev]);
    logAudit('CREATE', 'SUPPLIERS', id, newSup.namaToko);
    return id;
  };

  const addSuppliersBatch = (list: Omit<Supplier, 'id'>[]): number => {
    const created: Supplier[] = list.map((s, idx) => ({
      ...s,
      id: `SPL-${Date.now().toString().slice(-4)}-${idx + 1}`,
    }));
    setSuppliers((prev) => [...created, ...prev]);
    logAudit('CREATE', 'SUPPLIERS_BATCH', 'BATCH', `Impor ${list.length} vendor toko rekanan.`);
    return created.length;
  };

  const updateSupplier = (id: string, updated: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
    logAudit('UPDATE', 'SUPPLIERS', id, JSON.stringify(updated));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    logAudit('DELETE', 'SUPPLIERS', id);
  };

  // Barang Masuk Actions
  const addBarangMasuk = (bm: Omit<BarangMasuk, 'id' | 'timestamp' | 'totalPengadaan'>) => {
    const id = `MSK-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const totalPengadaan = Number(bm.jumlah) * Number(bm.hargaSatuan);
    const newBM: BarangMasuk = {
      ...bm,
      id,
      timestamp: new Date().toISOString(),
      totalPengadaan,
    };
    setBarangMasuk((prev) => [newBM, ...prev]);
    logAudit('CREATE', 'BARANG_MASUK', id, `${newBM.namaBarang} (${newBM.jumlah} ${newBM.jenisSatuan})`);
    return id;
  };

  const addBarangMasukBatch = (newItems: Omit<BarangMasuk, 'id' | 'timestamp' | 'totalPengadaan'>[]) => {
    const createdIds: string[] = [];
    const timestamp = new Date().toISOString();
    const createdRecords: BarangMasuk[] = newItems.map((bm, idx) => {
      const id = `MSK-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-${idx + 1}`;
      createdIds.push(id);
      return {
        ...bm,
        id,
        timestamp,
        totalPengadaan: Number(bm.jumlah) * Number(bm.hargaSatuan),
      };
    });
    setBarangMasuk((prev) => [...createdRecords, ...prev]);
    logAudit('CREATE', 'BARANG_MASUK_BATCH', createdIds[0] || 'BATCH', `Impor batch ${newItems.length} transaksi barang masuk.`);
    return createdIds;
  };

  const updateBarangMasuk = (id: string, updated: Partial<BarangMasuk>) => {
    setBarangMasuk((prev) =>
      prev.map((bm) => {
        if (bm.id !== id) return bm;
        const merged = { ...bm, ...updated };
        merged.totalPengadaan = Number(merged.jumlah) * Number(merged.hargaSatuan);
        return merged;
      })
    );
    logAudit('UPDATE', 'BARANG_MASUK', id, JSON.stringify(updated));
  };

  const deleteBarangMasuk = (id: string) => {
    setBarangMasuk((prev) => prev.filter((bm) => bm.id !== id));
    logAudit('DELETE', 'BARANG_MASUK', id);
  };

  // Barang Keluar Actions
  const addBarangKeluar = (bk: Omit<BarangKeluar, 'id' | 'timestamp'>) => {
    const id = `KLR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const newBK: BarangKeluar = {
      ...bk,
      id,
      timestamp: new Date().toISOString(),
    };
    setBarangKeluar((prev) => [newBK, ...prev]);
    logAudit('CREATE', 'BARANG_KELUAR', id, `${newBK.namaBarang} (${newBK.jumlah} ke ${newBK.penerima})`);
    return id;
  };

  const addBarangKeluarBatch = (list: Omit<BarangKeluar, 'id' | 'timestamp'>[]): number => {
    const timestamp = new Date().toISOString();
    const created: BarangKeluar[] = list.map((bk, idx) => ({
      ...bk,
      id: `KLR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-${idx + 1}`,
      timestamp,
    }));
    setBarangKeluar((prev) => [...created, ...prev]);
    logAudit('CREATE', 'BARANG_KELUAR_BATCH', 'BATCH', `Impor ${list.length} transaksi barang keluar.`);
    return created.length;
  };

  const updateBarangKeluar = (id: string, updated: Partial<BarangKeluar>) => {
    setBarangKeluar((prev) =>
      prev.map((bk) => (bk.id === id ? { ...bk, ...updated } : bk))
    );
    logAudit('UPDATE', 'BARANG_KELUAR', id, JSON.stringify(updated));
  };

  const deleteBarangKeluar = (id: string) => {
    setBarangKeluar((prev) => prev.filter((bk) => bk.id !== id));
    logAudit('DELETE', 'BARANG_KELUAR', id);
  };

  // Assets Actions
  const addAsset = (asset: Omit<AssetRecord, 'id' | 'totalNilai'>) => {
    const id = `AST-${Date.now().toString().slice(-4)}`;
    const totalNilai = Number(asset.jumlah) * Number(asset.hargaSatuan);
    const newAsset: AssetRecord = {
      ...asset,
      id,
      totalNilai,
    };
    setAssets((prev) => [newAsset, ...prev]);
    logAudit('CREATE', 'ASET', newAsset.kodeAset, `${newAsset.namaBarang} - Lokasi: ${newAsset.lokasi}`);
    return id;
  };

  const updateAsset = (id: string, updated: Partial<AssetRecord>) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const merged = { ...a, ...updated };
        merged.totalNilai = Number(merged.jumlah) * Number(merged.hargaSatuan);
        return merged;
      })
    );
    logAudit('UPDATE', 'ASET', id, JSON.stringify(updated));
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    logAudit('DELETE', 'ASET', id);
  };

  // Mutasi Actions
  const addMutasi = (mut: Omit<MutasiRecord, 'id' | 'timestamp'>) => {
    const id = `MUT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const newMut: MutasiRecord = {
      ...mut,
      id,
      timestamp: new Date().toISOString(),
    };
    setMutasi((prev) => [newMut, ...prev]);

    // Update lokasi & penanggung jawab aset terkait secara otomatis
    setAssets((prev) =>
      prev.map((a) => {
        if (a.kodeAset === mut.kodeAset) {
          return {
            ...a,
            lokasi: mut.keLokasi,
            penanggungJawab: mut.kePj,
            status: 'DIMUTASI',
          };
        }
        return a;
      })
    );

    logAudit('CREATE', 'MUTASI', id, `${mut.kodeAset} ke ${mut.keLokasi} (PJ: ${mut.kePj})`);
    return id;
  };

  const deleteMutasi = (id: string) => {
    setMutasi((prev) => prev.filter((m) => m.id !== id));
    logAudit('DELETE', 'MUTASI', id);
  };

  // Stock Opname Actions
  const addStockOpname = (so: Omit<StockOpnameRecord, 'id' | 'timestamp' | 'selisih'>) => {
    const id = `OPN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const selisih = Number(so.stokFisik) - Number(so.stokSistem);
    const newSO: StockOpnameRecord = {
      ...so,
      id,
      selisih,
      timestamp: new Date().toISOString(),
    };
    setStockOpname((prev) => [newSO, ...prev]);
    logAudit('CREATE', 'STOCK_OPNAME', id, `${newSO.namaBarang} (Sistem: ${newSO.stokSistem}, Fisik: ${newSO.stokFisik}, Selisih: ${selisih})`);
    return id;
  };

  const batchAddStockOpname = (records: Omit<StockOpnameRecord, 'id' | 'timestamp' | 'selisih'>[]) => {
    const timestamp = new Date().toISOString();
    const createdRecords: StockOpnameRecord[] = records.map((so, idx) => {
      const id = `OPN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-${idx + 1}`;
      const selisih = Number(so.stokFisik) - Number(so.stokSistem);
      return {
        ...so,
        id,
        selisih,
        timestamp,
      };
    });
    setStockOpname((prev) => [...createdRecords, ...prev]);
    logAudit('CREATE', 'STOCK_OPNAME_BATCH', `OPN-BATCH-${Date.now().toString().slice(-4)}`, `Audit serentak ${records.length} barang persediaan.`);
    return createdRecords.length;
  };

  const deleteStockOpname = (id: string) => {
    setStockOpname((prev) => prev.filter((s) => s.id !== id));
    logAudit('DELETE', 'STOCK_OPNAME', id);
  };

  // Pemeliharaan Actions
  const addPemeliharaan = (m: Omit<PemeliharaanRecord, 'id' | 'timestamp'>) => {
    const id = `MNT-${Date.now().toString().slice(-4)}`;
    const newMnt: PemeliharaanRecord = {
      ...m,
      id,
      timestamp: new Date().toISOString(),
    };
    setPemeliharaan((prev) => [newMnt, ...prev]);

    // Update status aset terkait
    setAssets((prev) =>
      prev.map((a) => {
        if (a.kodeAset === m.kodeAset) {
          return {
            ...a,
            status: m.status === 'SELESAI' ? 'AKTIF' : 'DALAM_PERBAIKAN',
            kondisi: m.status === 'SELESAI' ? 'BAIK' : a.kondisi,
          };
        }
        return a;
      })
    );

    logAudit('CREATE', 'PEMELIHARAAN', id, `${m.kodeAset} - ${m.jenisPemeliharaan}`);
    return id;
  };

  const updatePemeliharaan = (id: string, updated: Partial<PemeliharaanRecord>) => {
    setPemeliharaan((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    logAudit('UPDATE', 'PEMELIHARAAN', id, JSON.stringify(updated));
  };

  const deletePemeliharaan = (id: string) => {
    setPemeliharaan((prev) => prev.filter((p) => p.id !== id));
    logAudit('DELETE', 'PEMELIHARAAN', id);
  };

  // Penghapusan Actions
  const addPenghapusan = (p: Omit<PenghapusanRecord, 'id' | 'timestamp'>) => {
    const id = `DEL-${Date.now().toString().slice(-4)}`;
    const newDel: PenghapusanRecord = {
      ...p,
      id,
      timestamp: new Date().toISOString(),
    };
    setPenghapusan((prev) => [newDel, ...prev]);

    // Jika disetujui, update status aset menjadi DIHAPUSKAN
    if (p.status === 'DISETUJUI' || p.status === 'SELESAI') {
      setAssets((prev) =>
        prev.map((a) => (a.kodeAset === p.kodeAset ? { ...a, status: 'DIHAPUSKAN' } : a))
      );
    }

    logAudit('CREATE', 'PENGHAPUSAN', id, `${p.kodeAset} - ${p.alasan}`);
    return id;
  };

  const updatePenghapusan = (id: string, updated: Partial<PenghapusanRecord>) => {
    setPenghapusan((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...updated };
        if (merged.status === 'DISETUJUI' || merged.status === 'SELESAI') {
          setAssets((aPrev) =>
            aPrev.map((a) => (a.kodeAset === merged.kodeAset ? { ...a, status: 'DIHAPUSKAN' } : a))
          );
        }
        return merged;
      })
    );
    logAudit('UPDATE', 'PENGHAPUSAN', id, JSON.stringify(updated));
  };

  const deletePenghapusan = (id: string) => {
    setPenghapusan((prev) => prev.filter((p) => p.id !== id));
    logAudit('DELETE', 'PENGHAPUSAN', id);
  };

  // Pengambilan ATK Actions
  const addPengambilanATK = (atk: Omit<PengambilanATKRecord, 'id' | 'no' | 'timestamp'>) => {
    const nextNo = pengambilanATK.length ? Math.max(...pengambilanATK.map((p) => p.no || 0)) + 1 : 1;
    const id = `ATK-PKP-${Date.now().toString().slice(-4)}`;
    const newATK: PengambilanATKRecord = {
      ...atk,
      no: nextNo,
      id,
      timestamp: new Date().toISOString(),
    };
    setPengambilanATK((prev) => [newATK, ...prev]);
    logAudit('CREATE', 'PENGAMBILAN_ATK', String(nextNo), `${newATK.namaLengkap} - ${newATK.items.length} jenis ATK`);
    return { id, no: nextNo };
  };

  const addPengambilanATKBatch = (list: Omit<PengambilanATKRecord, 'id' | 'no' | 'timestamp'>[]): number => {
    let currentMaxNo = pengambilanATK.length ? Math.max(...pengambilanATK.map((p) => p.no || 0)) : 0;
    const timestamp = new Date().toISOString();
    const created: PengambilanATKRecord[] = list.map((atk, idx) => {
      currentMaxNo += 1;
      return {
        ...atk,
        no: currentMaxNo,
        id: `ATK-PKP-${Date.now().toString().slice(-4)}-${idx + 1}`,
        timestamp,
      };
    });
    setPengambilanATK((prev) => [...created, ...prev]);
    logAudit('CREATE', 'PENGAMBILAN_ATK_BATCH', 'BATCH', `Impor ${list.length} pengambilan ATK.`);
    return created.length;
  };

  const deletePengambilanATK = (id: string) => {
    setPengambilanATK((prev) => prev.filter((p) => p.id !== id));
    logAudit('DELETE', 'PENGAMBILAN_ATK', id);
  };

  const updatePengambilanATK = (id: string, updated: Partial<PengambilanATKRecord>) => {
    setPengambilanATK((prev) =>
      prev.map((atk) => (atk.id === id ? { ...atk, ...updated } : atk))
    );
    logAudit('UPDATE', 'PENGAMBILAN_ATK', id, JSON.stringify(updated));
  };

  // RKBS Actions
  const addRkbs = (item: Omit<RkbsItem, 'id' | 'timestamp' | 'totalEstimasi'>) => {
    const id = `RKBS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const totalEstimasi = Number(item.jumlahDiusulkan) * Number(item.hargaEstimasi);
    const newItem: RkbsItem = {
      ...item,
      id,
      timestamp: new Date().toISOString(),
      totalEstimasi,
    };
    setRkbs((prev) => [newItem, ...prev]);
    logAudit('CREATE', 'RKBS', id, `${newItem.namaBarang} (Usulan: ${newItem.jumlahDiusulkan} ${newItem.jenisSatuan})`);
    return id;
  };

  const addRkbsBatch = (itemsList: Omit<RkbsItem, 'id' | 'timestamp' | 'totalEstimasi'>[]): number => {
    const timestamp = new Date().toISOString();
    const created: RkbsItem[] = itemsList.map((item, idx) => ({
      ...item,
      id: `RKBS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-${idx + 1}`,
      timestamp,
      totalEstimasi: Number(item.jumlahDiusulkan) * Number(item.hargaEstimasi),
    }));
    setRkbs((prev) => [...created, ...prev]);
    logAudit('CREATE', 'RKBS_BATCH', 'BATCH', `Impor ${itemsList.length} usulan pengadaan RKBS.`);
    return created.length;
  };

  const updateRkbs = (id: string, updated: Partial<RkbsItem>) => {
    setRkbs((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const merged = { ...r, ...updated };
        merged.totalEstimasi = Number(merged.jumlahDiusulkan) * Number(merged.hargaEstimasi);
        return merged;
      })
    );
    logAudit('UPDATE', 'RKBS', id, JSON.stringify(updated));
  };

  const deleteRkbs = (id: string) => {
    setRkbs((prev) => prev.filter((r) => r.id !== id));
    logAudit('DELETE', 'RKBS', id);
  };

  const realizeRkbsToBarangMasuk = (
    id: string,
    namaToko: string,
    nomorBku: string,
    nomorKwitansi: string
  ) => {
    const r = rkbs.find((x) => x.id === id);
    if (!r) throw new Error('Data usulan RKBS tidak ditemukan');

    // 1. Tambah ke Barang Masuk
    const masukId = addBarangMasuk({
      tanggal: new Date().toISOString().slice(0, 10),
      bulanPengadaan: new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date()),
      namaToko: namaToko || 'Toko Rekanan Belanja BOS',
      kodeBarang: r.kodeBarang,
      namaBarang: r.namaBarang,
      jumlah: r.jumlahDiusulkan,
      jenisSatuan: r.jenisSatuan,
      hargaSatuan: r.hargaEstimasi,
      namaSekolah: config.schoolName,
      sumberAnggaran: (r.sumberDana as any) || 'BOS Reguler',
      kodeRekeningRkas: '5.2.2.01.01',
      nomorBku: nomorBku || `BKU-BOS/${new Date().getMonth() + 1}/REALISASI`,
      nomorKwitansi: nomorKwitansi || `KWT/REAL/${Date.now().toString().slice(-4)}`,
      petugas: activeUser.nama,
      keterangan: `Realisasi pengadaan dari perencanaan RKBS No. ${r.id}: ${r.alasanPengadaan}`,
    });

    // 2. Tandai status RKBS menjadi TEREALISASI
    updateRkbs(id, { status: 'TEREALISASI' });
    return masukId;
  };

  // Users Actions
  const addUser = (user: Omit<UserEmployee, 'id'>) => {
    const id = `USR-${Date.now().toString().slice(-3)}`;
    const newUser: UserEmployee = { ...user, id };
    setUsers((prev) => [...prev, newUser]);
    logAudit('CREATE', 'USERS', id, newUser.nama);
    return id;
  };

  const updateUser = (id: string, updated: Partial<UserEmployee>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updated } : u))
    );
    logAudit('UPDATE', 'USERS', id, JSON.stringify(updated));
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logAudit('DELETE', 'USERS', id);
  };

  // Laporan Kerusakan
  const addLaporanKerusakan = (lpr: Omit<LaporanKerusakanRecord, 'id' | 'timestamp'>) => {
    const id = `LPR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const newLpr: LaporanKerusakanRecord = {
      ...lpr,
      id,
      timestamp: new Date().toISOString(),
    };
    setLaporanKerusakan((prev) => [newLpr, ...prev]);
    // Also automatically update asset condition
    updateAsset(lpr.kodeAset, {
      kondisi: lpr.kondisi,
      status: 'DALAM_PERBAIKAN',
    });
    // Auto add into maintenance queue
    addPemeliharaan({
      tanggal: lpr.tanggal,
      kodeAset: lpr.kodeAset,
      namaBarang: lpr.namaBarang,
      jenisPemeliharaan: `Perbaikan: ${lpr.deskripsiKerusakan}`,
      biaya: 0,
      penyedia: 'Menunggu Penugasan Teknisi',
      status: 'DIAJUKAN',
      petugas: lpr.pelapor,
      keterangan: `Dilaporkan dari ${lpr.lokasi} oleh ${lpr.pelapor}`,
    });
    logAudit('CREATE', 'LAPORAN_KERUSAKAN', id, `${lpr.namaBarang} (${lpr.kondisi})`);
    return id;
  };

  const updateLaporanKerusakan = (id: string, updated: Partial<LaporanKerusakanRecord>) => {
    setLaporanKerusakan((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updated } : l))
    );
    logAudit('UPDATE', 'LAPORAN_KERUSAKAN', id, JSON.stringify(updated));
  };

  // Batch Imports from CSV / Excel
  const importMasterItemsBatch = (newItems: Omit<MasterItem, 'id'>[]): number => {
    if (!newItems || newItems.length === 0) return 0;
    let count = 0;
    setItems((prev) => {
      const existingCodes = new Set(prev.map((i) => i.kodeBarang.toLowerCase()));
      const itemsToAdd: MasterItem[] = [];

      for (const item of newItems) {
        if (!item.kodeBarang || !item.namaBarang) continue;
        if (!existingCodes.has(item.kodeBarang.toLowerCase())) {
          itemsToAdd.push({
            ...item,
            id: `ITM-IMP-${Date.now().toString().slice(-4)}-${count}`,
          });
          existingCodes.add(item.kodeBarang.toLowerCase());
          count++;
        }
      }
      return [...itemsToAdd, ...prev];
    });
    logAudit('CREATE', 'MASTER_BARANG', `BATCH_IMPORT_${count}`, `Berhasil mengimpor ${count} barang`);
    return count;
  };

  const importAssetsBatch = (newAssets: Omit<AssetRecord, 'id' | 'totalNilai'>[]): number => {
    if (!newAssets || newAssets.length === 0) return 0;
    let count = 0;
    setAssets((prev) => {
      const existingCodes = new Set(prev.map((a) => a.kodeAset.toLowerCase()));
      const assetsToAdd: AssetRecord[] = [];

      for (const asset of newAssets) {
        if (!asset.kodeAset || !asset.namaBarang) continue;
        if (!existingCodes.has(asset.kodeAset.toLowerCase())) {
          const totalNilai = Number(asset.jumlah || 1) * Number(asset.hargaSatuan || 0);
          assetsToAdd.push({
            ...asset,
            id: `AST-IMP-${Date.now().toString().slice(-4)}-${count}`,
            totalNilai,
          });
          existingCodes.add(asset.kodeAset.toLowerCase());
          count++;
        }
      }
      return [...assetsToAdd, ...prev];
    });
    logAudit('CREATE', 'ASET', `BATCH_IMPORT_${count}`, `Berhasil mengimpor ${count} aset`);
    return count;
  };

  const batchUpdateAssets = (updatedList: AssetRecord[]) => {
    setAssets(updatedList);
    logAudit('UPDATE', 'ASET', 'BATCH_UPDATE', `Sinkronisasi massal ${updatedList.length} aset sekolah (Permendagri 108 / NUP / Dapodik).`);
  };

  // Reset to default
  const resetToDefaultData = () => {
    setConfig(initialSchoolConfig);
    setUsers(initialUsers);
    setSuppliers(initialSuppliers);
    setItems(initialItems);
    setBarangMasuk(initialBarangMasuk);
    setBarangKeluar(initialBarangKeluar);
    setAssets(initialAssets);
    setMutasi(initialMutasi);
    setStockOpname(initialStockOpname);
    setPemeliharaan(initialPemeliharaan);
    setPenghapusan(initialPenghapusan);
    setPengambilanATK(initialPengambilanATK);
    setAuditTrail(initialAuditTrail);
    setRkbs(initialRkbs);
    setLaporanKerusakan(initialLaporanKerusakan);
    setActiveUser(initialUsers[0]);
    logAudit('UPDATE', 'SYSTEM', 'RESET', 'Reset seluruh database ke data awal standar sekolah');
  };

  // Export & Import Database
  const exportDatabaseToJson = () => {
    const data = {
      version: '3.0.0-PRO-STANDALONE',
      exportDate: new Date().toISOString(),
      config,
      users,
      suppliers,
      items,
      barangMasuk,
      barangKeluar,
      assets,
      mutasi,
      stockOpname,
      pemeliharaan,
      penghapusan,
      pengambilanATK,
      auditTrail,
      rkbs,
      laporanKerusakan,
    };
    logAudit('EXPORT', 'DATABASE', 'BACKUP_ALL');
    return JSON.stringify(data, null, 2);
  };

  const importDatabaseFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.config) setConfig(parsed.config);
      if (parsed.users) setUsers(parsed.users);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.items) setItems(parsed.items);
      if (parsed.barangMasuk) setBarangMasuk(parsed.barangMasuk);
      if (parsed.barangKeluar) setBarangKeluar(parsed.barangKeluar);
      if (parsed.assets) setAssets(parsed.assets);
      if (parsed.mutasi) setMutasi(parsed.mutasi);
      if (parsed.stockOpname) setStockOpname(parsed.stockOpname);
      if (parsed.pemeliharaan) setPemeliharaan(parsed.pemeliharaan);
      if (parsed.penghapusan) setPenghapusan(parsed.penghapusan);
      if (parsed.pengambilanATK) setPengambilanATK(parsed.pengambilanATK);
      if (parsed.auditTrail) setAuditTrail(parsed.auditTrail);
      if (parsed.rkbs) setRkbs(parsed.rkbs);
      if (parsed.laporanKerusakan) setLaporanKerusakan(parsed.laporanKerusakan);
      logAudit('UPDATE', 'DATABASE', 'RESTORE_JSON');
      return true;
    } catch (e) {
      console.error('Error importing JSON database:', e);
      return false;
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        config,
        users,
        suppliers,
        items,
        barangMasuk,
        barangKeluar,
        assets,
        mutasi,
        stockOpname,
        pemeliharaan,
        penghapusan,
        pengambilanATK,
        auditTrail,
        rkbs,
        laporanKerusakan,
        activeUser,
        setActiveUser,
        stockSummary,
        dashboardStats,
        updateConfig,
        addItem,
        updateItem,
        deleteItem,
        addSupplier,
        addSuppliersBatch,
        updateSupplier,
        deleteSupplier,
        addBarangMasuk,
        addBarangMasukBatch,
        updateBarangMasuk,
        deleteBarangMasuk,
        addBarangKeluar,
        addBarangKeluarBatch,
        updateBarangKeluar,
        deleteBarangKeluar,
        addAsset,
        updateAsset,
        deleteAsset,
        addMutasi,
        deleteMutasi,
        addStockOpname,
        batchAddStockOpname,
        deleteStockOpname,
        addPemeliharaan,
        updatePemeliharaan,
        deletePemeliharaan,
        addPenghapusan,
        updatePenghapusan,
        deletePenghapusan,
        addPengambilanATK,
        addPengambilanATKBatch,
        updatePengambilanATK,
        deletePengambilanATK,
        addRkbs,
        addRkbsBatch,
        updateRkbs,
        deleteRkbs,
        realizeRkbsToBarangMasuk,
        addLaporanKerusakan,
        updateLaporanKerusakan,
        importMasterItemsBatch,
        importAssetsBatch,
        batchUpdateAssets,
        addUser,
        updateUser,
        deleteUser,
        resetToDefaultData,
        exportDatabaseToJson,
        importDatabaseFromJson,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory harus digunakan di dalam InventoryProvider');
  }
  return context;
};
