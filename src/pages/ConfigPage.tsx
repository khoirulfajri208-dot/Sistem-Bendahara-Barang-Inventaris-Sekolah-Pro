import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  Upload,
  School,
  UserCheck,
  ShieldAlert,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { UserEmployee } from '../types';
import { CloudSyncBackupPanel } from '../components/CloudSyncBackupPanel';

export const ConfigPage: React.FC = () => {
  const {
    config,
    updateConfig,
    users,
    addUser,
    deleteUser,
    resetToDefaultData,
    exportDatabaseToJson,
    importDatabaseFromJson,
  } = useInventory();

  const [formData, setFormData] = useState({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New User Form State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState<Omit<UserEmployee, 'id'>>({
    nip: '',
    nama: '',
    email: '',
    jabatan: 'Guru Kelas',
    role: 'GURU',
    status: 'AKTIF',
  });

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Backup_SIMBARAS_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (confirm('Pulihkan database dari file cadangan ini? Data saat ini akan ditimpa.')) {
          const success = importDatabaseFromJson(content);
          if (success) {
            alert('Database berhasil dipulihkan!');
          } else {
            alert('Gagal memulihkan file cadangan. Format JSON tidak valid.');
          }
        }
      }
    };
    reader.readAsText(file);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nama.trim() || !newUser.nip.trim()) {
      alert('Nama dan NIP wajib diisi.');
      return;
    }
    addUser(newUser);
    setNewUser({
      nip: '',
      nama: '',
      email: '',
      jabatan: 'Guru Kelas',
      role: 'GURU',
      status: 'AKTIF',
    });
    setIsAddUserOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-800" /> Pengaturan Sistem &amp; Profil Sekolah
        </h2>
        <p className="text-xs text-slate-500">
          Konfigurasi identitas lembaga pendidikan, penandatangan dokumen BKU, serta pengelolaan data cadangan.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveConfig} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <School className="w-4 h-4 text-emerald-800" /> Identitas Lembaga Pendidikan
          </div>
          {saveSuccess && (
            <span className="text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
              <Check className="w-4 h-4" /> Pengaturan Tersimpan!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nama Resmi Sekolah</label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nomor Pokok Sekolah Nasional (NPSN)</label>
            <input
              type="text"
              required
              value={formData.npsn}
              onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Dinas Pendidikan Pembina (Kop Surat)</label>
            <input
              type="text"
              placeholder="DINAS PENDIDIKAN KABUPATEN..."
              value={formData.dinasPendidikan || ''}
              onChange={(e) => setFormData({ ...formData, dinasPendidikan: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Resmi Sekolah</label>
            <input
              type="email"
              placeholder="sdn@sekolah.belajar.id"
              value={formData.emailSekolah || ''}
              onChange={(e) => setFormData({ ...formData, emailSekolah: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap Sekolah</label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-800 mb-3">Pejabat Penandatangan Laporan Resmi (Kop BKU / BAST):</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="font-bold text-slate-800 block text-[11px] uppercase">Kepala Sekolah</label>
              <div>
                <span className="text-[10px] text-slate-500 block">Nama Lengkap &amp; Gelar</span>
                <input
                  type="text"
                  required
                  value={formData.headmaster}
                  onChange={(e) => setFormData({ ...formData, headmaster: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">NIP Kepala Sekolah</span>
                <input
                  type="text"
                  required
                  value={formData.headmasterNip}
                  onChange={(e) => setFormData({ ...formData, headmasterNip: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="font-bold text-slate-800 block text-[11px] uppercase">Bendahara Barang / Sekolah</label>
              <div>
                <span className="text-[10px] text-slate-500 block">Nama Lengkap &amp; Gelar</span>
                <input
                  type="text"
                  required
                  value={formData.treasurer}
                  onChange={(e) => setFormData({ ...formData, treasurer: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">NIP Bendahara</span>
                <input
                  type="text"
                  required
                  value={formData.treasurerNip}
                  onChange={(e) => setFormData({ ...formData, treasurerNip: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
            <input
              type="checkbox"
              checked={formData.reduceStockOnATKPickup || false}
              onChange={(e) => setFormData({ ...formData, reduceStockOnATKPickup: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">
                Otomatis Kurangi Stok Persediaan Saat Pengambilan ATK Dicatat
              </span>
              <span className="text-slate-500 text-[11px]">
                Jika dicentang, transaksi pengambilan ATK akan memotong saldo buku persediaan secara langsung. Jika tidak dicentang, pengambilan ATK hanya menjadi dokumen bukti serah terima.
              </span>
            </div>
          </label>
        </div>

        {/* Pengaturan Plafon Pagu Anggaran Tahunan BOS/RKAS */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            Plafon Pagu Anggaran Tahunan (RKAS) Sekolah:
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Batas pagu belanja operasional &amp; inventaris sekolah yang dipantau real-time pada kartu Dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-slate-600 block text-[11px] mb-1">Tahun Anggaran</label>
              <input
                type="text"
                value={formData.tahunAnggaranAktif || '2026'}
                onChange={(e) => setFormData({ ...formData, tahunAnggaranAktif: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block text-[11px] mb-1">Total Pagu Tahunan (Rp)</label>
              <input
                type="number"
                min={0}
                value={formData.paguAnggaranTahunan ?? 180000000}
                onChange={(e) => setFormData({ ...formData, paguAnggaranTahunan: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block text-[11px] mb-1">Pagu BOS Reguler (Rp)</label>
              <input
                type="number"
                min={0}
                value={formData.paguBosReguler ?? 120000000}
                onChange={(e) => setFormData({ ...formData, paguBosReguler: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block text-[11px] mb-1">Pagu BOS Kinerja &amp; BOPD (Rp)</label>
              <input
                type="number"
                min={0}
                value={formData.paguBosKinerja ?? 45000000}
                onChange={(e) => setFormData({ ...formData, paguBosKinerja: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
          >
            <Save className="w-4 h-4" /> Simpan Perubahan Profil
          </button>
        </div>
      </form>

      {/* Teachers and Employees Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <UserCheck className="w-4 h-4 text-emerald-800" /> Database Guru &amp; Pegawai ({users.length})
          </div>
          <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Pegawai
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-900">{u.nama}</div>
                <div className="text-[10px] text-slate-500 font-mono">NIP: {u.nip}</div>
                <div className="text-[11px] text-emerald-700 font-medium">{u.jabatan}</div>
              </div>
              {users.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus pegawai ${u.nama}?`)) deleteUser(u.id);
                  }}
                  className="p-1 text-slate-400 hover:text-red-700 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backup and Restore Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
          <ShieldAlert className="w-4 h-4 text-emerald-800" /> Manajemen Data, Cadangan &amp; Pemulihan
        </div>

        <p className="text-slate-500 leading-relaxed">
          Semua data tersimpan secara lokal dan aman. Anda dapat mengunduh salinan berkas cadangan (JSON) untuk arsip, mengunggah kembali file cadangan, atau menyetel ulang ke data simulasi default.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700 shadow-xs"
          >
            <Download className="w-4 h-4" /> Unduh Cadangan Database (.json)
          </button>

          <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 font-bold text-emerald-800 shadow-xs">
            <Upload className="w-4 h-4" /> Pulihkan dari File (.json)
            <input type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
          </label>

          <button
            type="button"
            onClick={() => {
              if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh database ke data awal standar sekolah?')) {
                resetToDefaultData();
                setFormData({ ...config });
                alert('Database berhasil direset.');
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 font-bold shadow-xs ml-auto"
          >
            <RotateCcw className="w-4 h-4 text-red-700" /> Reset ke Data Bawaan
          </button>
        </div>
      </div>

      {/* Cloud Sync & Automated Backup Panel */}
      <CloudSyncBackupPanel />

      {/* Modal Add User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 p-5 space-y-3.5 text-xs">
            <div className="font-bold text-sm text-slate-900 border-b pb-2">
              Tambah Guru / Pegawai Baru
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hendra Wijaya, S.Pd."
                  value={newUser.nama}
                  onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">NIP / NUPTK</label>
                <input
                  type="text"
                  required
                  placeholder="19920101 201901 1 001"
                  value={newUser.nip}
                  onChange={(e) => setNewUser({ ...newUser, nip: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jabatan / Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Guru Kelas 4, Tenaga Perpustakaan..."
                  value={newUser.jabatan}
                  onChange={(e) => setNewUser({ ...newUser, jabatan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Email (opsional)</label>
                <input
                  type="email"
                  placeholder="guru@sd.belajar.id"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                >
                  Simpan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
