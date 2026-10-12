import React, { useState } from 'react';
import {
  ArrowUpFromLine,
  Plus,
  Search,
  Download,
  Trash2,
  X,
  Check,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { BarangKeluar } from '../types';
import { formatTanggalIndo } from '../utils/format';
import { AdvancedExportModal } from '../components/AdvancedExportModal';
import { AdvancedImportModal } from '../components/AdvancedImportModal';

export const BarangKeluarPage: React.FC = () => {
  const { barangKeluar, items, stockSummary, users, activeUser, addBarangKeluar, deleteBarangKeluar, config } =
    useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [stockWarning, setStockWarning] = useState<string>('');

  const barangKeluarColumns = [
    { key: 'tanggal', label: 'Tanggal Distribusi' },
    { key: 'kodeBarang', label: 'Kode Barang' },
    { key: 'namaBarang', label: 'Nama Barang' },
    { key: 'jumlah', label: 'Jumlah Dikeluarkan' },
    { key: 'jenisSatuan', label: 'Satuan' },
    { key: 'penerima', label: 'Nama Penerima' },
    { key: 'unitRuangan', label: 'Unit / Ruangan' },
    { key: 'tujuanPenggunaan', label: 'Tujuan Penggunaan' },
    { key: 'petugas', label: 'Petugas' },
    { key: 'keterangan', label: 'Keterangan' },
  ];

  const [formData, setFormData] = useState<Omit<BarangKeluar, 'id' | 'timestamp'>>({
    tanggal: new Date().toISOString().slice(0, 10),
    kodeBarang: items[0]?.kodeBarang || '',
    namaBarang: items[0]?.namaBarang || '',
    jumlah: 1,
    jenisSatuan: items[0]?.jenisSatuan || 'Pcs',
    penerima: users[0]?.nama || '',
    unitRuangan: 'Ruang Guru',
    tujuanPenggunaan: 'Pembelajaran KBM Kelas',
    petugas: activeUser.nama,
    keterangan: '',
  });

  const filteredList = barangKeluar.filter(
    (bk) =>
      bk.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.penerima.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.unitRuangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.tujuanPenggunaan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvailableStock = (code: string) => {
    const s = stockSummary.find((item) => item.kodeBarang === code);
    return s ? s.stok : 0;
  };

  const handleSelectItem = (code: string) => {
    const selected = items.find((i) => i.kodeBarang === code);
    if (selected) {
      const avail = getAvailableStock(code);
      setFormData((prev) => ({
        ...prev,
        kodeBarang: selected.kodeBarang,
        namaBarang: selected.namaBarang,
        jenisSatuan: selected.jenisSatuan,
      }));

      if (avail <= 0) {
        setStockWarning(`Perhatian: Stok ${selected.namaBarang} saat ini habis (0 ${selected.jenisSatuan}).`);
      } else {
        setStockWarning('');
      }
    }
  };

  const handleOpenAdd = () => {
    const firstItem = items[0];
    const avail = firstItem ? getAvailableStock(firstItem.kodeBarang) : 0;
    setFormData({
      tanggal: new Date().toISOString().slice(0, 10),
      kodeBarang: firstItem?.kodeBarang || '',
      namaBarang: firstItem?.namaBarang || '',
      jumlah: 1,
      jenisSatuan: firstItem?.jenisSatuan || 'Pcs',
      penerima: users[0]?.nama || '',
      unitRuangan: 'Ruang Guru',
      tujuanPenggunaan: 'Pembelajaran KBM',
      petugas: activeUser.nama,
      keterangan: '',
    });
    setStockWarning(avail <= 0 ? `Stok barang saat ini kosong (${avail}).` : '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const avail = getAvailableStock(formData.kodeBarang);

    if (Number(formData.jumlah) <= 0) {
      alert('Jumlah keluar harus lebih dari 0.');
      return;
    }

    if (Number(formData.jumlah) > avail) {
      if (
        !confirm(
          `Peringatan: Jumlah keluar (${formData.jumlah}) melebihi sisa stok sistem (${avail}). Apakah Anda yakin tetap ingin melanjutkan pencatatan?`
        )
      ) {
        return;
      }
    }

    addBarangKeluar(formData);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus transaksi barang keluar "${name}"? Stok barang akan dikembalikan ke persediaan.`)) {
      deleteBarangKeluar(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ArrowUpFromLine className="w-6 h-6 text-orange-700" /> Distribusi &amp; Pengeluaran Barang
          </h2>
          <p className="text-xs text-slate-500">
            Catat pemakaian barang operasional sekolah oleh guru, staf, atau ruangan kelas. Mengurangi saldo stok persediaan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 rotate-180 text-slate-600" /> Impor (Excel / CSV)
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
            <Plus className="w-4 h-4" /> Input Barang Keluar
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari transaksi berdasarkan nama barang, penerima, ruangan, atau keperluan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Barang</th>
                <th className="px-4 py-3 text-center">Jumlah Keluar</th>
                <th className="px-4 py-3">Penerima</th>
                <th className="px-4 py-3">Unit / Ruangan</th>
                <th className="px-4 py-3">Tujuan Penggunaan</th>
                <th className="px-4 py-3">Petugas</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Belum ada data barang keluar yang tercatat.
                  </td>
                </tr>
              ) : (
                filteredList.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                      {formatTanggalIndo(bk.tanggal)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>{bk.namaBarang}</div>
                      <span className="font-mono text-[10px] text-slate-400">{bk.kodeBarang}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-orange-800 bg-orange-50 px-2.5 py-0.5 rounded-full">
                        -{bk.jumlah} {bk.jenisSatuan}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{bk.penerima}</td>
                    <td className="px-4 py-3 text-slate-600">{bk.unitRuangan}</td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]" title={bk.tujuanPenggunaan}>
                      {bk.tujuanPenggunaan}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">{bk.petugas}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(bk.id, bk.namaBarang)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Catat Distribusi Barang Keluar</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              {stockWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{stockWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Keluar</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Penerima Barang</label>
                  <input
                    type="text"
                    required
                    list="user-options"
                    placeholder="Nama Guru / Staf"
                    value={formData.penerima}
                    onChange={(e) => setFormData({ ...formData, penerima: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                  <datalist id="user-options">
                    {users.map((u) => (
                      <option key={u.id} value={u.nama} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">Pilih Barang dari Master</label>
                  <span className="text-[11px] font-bold text-emerald-800">
                    Sisa Stok: {getAvailableStock(formData.kodeBarang)} {formData.jenisSatuan}
                  </span>
                </div>
                <select
                  value={formData.kodeBarang}
                  onChange={(e) => handleSelectItem(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.kodeBarang}>
                      {it.kodeBarang} - {it.namaBarang} (Sisa: {getAvailableStock(it.kodeBarang)} {it.jenisSatuan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Keluar</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit / Ruangan Pemakai</label>
                  <input
                    type="text"
                    required
                    placeholder="Ruang Guru, Kelas 6, Lab IPA"
                    value={formData.unitRuangan}
                    onChange={(e) => setFormData({ ...formData, unitRuangan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tujuan / Keperluan Penggunaan</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Kebutuhan Ujian PTS, Pembelajaran Tematik, dsb."
                  value={formData.tujuanPenggunaan}
                  onChange={(e) => setFormData({ ...formData, tujuanPenggunaan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
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
                  <Check className="w-4 h-4" /> Simpan Pengeluaran
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
        type="BARANG_KELUAR"
      />

      {/* Advanced Export Modal */}
      <AdvancedExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Ekspor Buku Distribusi Barang Keluar"
        defaultFilename="Buku_Barang_Keluar_Sekolah"
        data={barangKeluar}
        filteredData={filteredList}
        availableColumns={barangKeluarColumns}
        schoolConfig={config}
      />
    </div>
  );
};
