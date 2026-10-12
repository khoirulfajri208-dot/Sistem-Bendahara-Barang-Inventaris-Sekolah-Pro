import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  X,
  Check,
  Package,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { MasterItem } from '../types';
import { formatRupiah } from '../utils/format';
import { AdvancedExportModal } from '../components/AdvancedExportModal';
import { AdvancedImportModal } from '../components/AdvancedImportModal';

export const MasterBarangPage: React.FC = () => {
  const { items, addItem, updateItem, deleteItem, config } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<MasterItem, 'id'>>({
    kodeBarang: '',
    namaBarang: '',
    kategori: 'ATK',
    jenisSatuan: 'Rim',
    tipe: 'HABIS_PAKAI',
    kodeRekeningRkas: '5.2.2.01.01',
    batasMinimum: 5,
    lokasiDefault: 'Gudang Persediaan',
    hargaEstimasi: 0,
    status: 'AKTIF',
  });

  const categories = useMemo(() => {
    const list = Array.from(new Set(items.map((i) => i.kategori)));
    return ['ALL', ...list];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchQuery =
        item.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kodeRekeningRkas.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasiDefault.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = filterCategory === 'ALL' || item.kategori === filterCategory;
      const matchType = filterType === 'ALL' || item.tipe === filterType;

      return matchQuery && matchCategory && matchType;
    });
  }, [items, searchQuery, filterCategory, filterType]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      kodeBarang: `BRG-${(items.length + 1).toString().padStart(3, '0')}`,
      namaBarang: '',
      kategori: 'ATK',
      jenisSatuan: 'Rim',
      tipe: 'HABIS_PAKAI',
      kodeRekeningRkas: '5.2.2.01.01',
      batasMinimum: 5,
      lokasiDefault: 'Gudang Persediaan',
      hargaEstimasi: 0,
      status: 'AKTIF',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MasterItem) => {
    setEditingItem(item);
    setFormData({
      kodeBarang: item.kodeBarang,
      namaBarang: item.namaBarang,
      kategori: item.kategori,
      jenisSatuan: item.jenisSatuan,
      tipe: item.tipe,
      kodeRekeningRkas: item.kodeRekeningRkas,
      batasMinimum: item.batasMinimum,
      lokasiDefault: item.lokasiDefault,
      hargaEstimasi: item.hargaEstimasi,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kodeBarang.trim() || !formData.namaBarang.trim()) {
      alert('Kode Barang dan Nama Barang wajib diisi.');
      return;
    }

    if (editingItem) {
      updateItem(editingItem.id, formData);
    } else {
      addItem(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus master barang "${name}"?`)) {
      deleteItem(id);
    }
  };

  const masterBarangColumns = [
    { key: 'kodeBarang', label: 'Kode Barang' },
    { key: 'namaBarang', label: 'Nama Barang' },
    { key: 'kategori', label: 'Kategori' },
    { key: 'jenisSatuan', label: 'Satuan' },
    { key: 'tipe', label: 'Tipe' },
    { key: 'kodeRekeningRkas', label: 'Kode Rekening RKAS' },
    { key: 'batasMinimum', label: 'Batas Minimum' },
    { key: 'lokasiDefault', label: 'Lokasi Simpan' },
    { key: 'hargaEstimasi', label: 'Harga Estimasi (Rp)', format: (val: any) => formatRupiah(val) },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-800" /> Master Barang Sekolah
          </h2>
          <p className="text-xs text-slate-500">
            Daftar katalog barang habis pakai (ATK, kebersihan) dan klasifikasi barang modal aset tetap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" /> Impor (Excel / CSV)
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" /> Ekspor Data
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Tambah Barang
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode, nama barang, lokasi, rekening..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'Semua Kategori' : c}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="HABIS_PAKAI">Habis Pakai (ATK/BHP)</option>
            <option value="ASET_TETAP">Aset Tetap / Modal</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Nama Barang</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Satuan</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3 text-center">Batas Min</th>
                <th className="px-4 py-3">Rekening RKAS</th>
                <th className="px-4 py-3">Lokasi Default</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    Tidak ditemukan data barang yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-900">{item.kodeBarang}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.namaBarang}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.jenisSatuan}</td>
                    <td className="px-4 py-3">
                      {item.tipe === 'HABIS_PAKAI' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px]">
                          Habis Pakai
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold text-[10px]">
                          Aset Tetap
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">{item.batasMinimum}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{item.kodeRekeningRkas}</td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[140px]">{item.lokasiDefault}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit Barang"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.namaBarang)}
                          className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 text-xs text-slate-500 flex justify-between items-center">
          <span>Menampilkan {filteredItems.length} dari {items.length} master barang</span>
        </div>
      </div>

      {/* Modal Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingItem ? 'Edit Master Barang' : 'Tambah Master Barang Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Barang</label>
                  <input
                    type="text"
                    required
                    value={formData.kodeBarang}
                    onChange={(e) => setFormData({ ...formData, kodeBarang: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ATK">ATK</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Mebel">Mebel</option>
                    <option value="Laboratorium">Laboratorium</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Buku & Peraga">Buku &amp; Peraga</option>
                    <option value="UKS/Kesehatan">UKS/Kesehatan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Barang Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kertas HVS A4 70 Gram (PaperOne)"
                  value={formData.namaBarang}
                  onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Satuan</label>
                  <input
                    type="text"
                    required
                    placeholder="Rim, Pcs, Box, Pack, Buah, Unit"
                    value={formData.jenisSatuan}
                    onChange={(e) => setFormData({ ...formData, jenisSatuan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipe Barang</label>
                  <select
                    value={formData.tipe}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="HABIS_PAKAI">Habis Pakai (ATK / Bahan)</option>
                    <option value="ASET_TETAP">Aset Tetap / Peralatan Modal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batas Stok Minimum</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.batasMinimum}
                    onChange={(e) => setFormData({ ...formData, batasMinimum: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode Rekening RKAS</label>
                  <input
                    type="text"
                    placeholder="Contoh: 5.2.2.01.01"
                    value={formData.kodeRekeningRkas}
                    onChange={(e) => setFormData({ ...formData, kodeRekeningRkas: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lokasi Default Simpan</label>
                  <input
                    type="text"
                    placeholder="Gudang Persediaan / Lab"
                    value={formData.lokasiDefault}
                    onChange={(e) => setFormData({ ...formData, lokasiDefault: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimasi Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.hargaEstimasi}
                    onChange={(e) => setFormData({ ...formData, hargaEstimasi: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  <Check className="w-4 h-4" /> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advanced Import Modal */}
      <AdvancedImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        type="MASTER_BARANG"
      />

      {/* Advanced Export Modal */}
      <AdvancedExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Ekspor Data Master Barang"
        defaultFilename="Master_Barang_Sekolah"
        data={items}
        filteredData={filteredItems}
        availableColumns={masterBarangColumns}
        schoolConfig={config}
      />
    </div>
  );
};
