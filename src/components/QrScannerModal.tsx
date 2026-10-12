import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Building2, Wrench } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { AssetRecord } from '../types';
import { formatRupiah, formatTanggalIndo } from '../utils/format';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMutasiAsset?: (asset: AssetRecord) => void;
  onServiceAsset?: (asset: AssetRecord) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onMutasiAsset,
  onServiceAsset,
}) => {
  const { assets } = useInventory();
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [matchedAsset, setMatchedAsset] = useState<AssetRecord | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader-container';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setMatchedAsset(null);
      setErrorMsg('');
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    setErrorMsg('');
    setMatchedAsset(null);
    try {
      if (scannerRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode(containerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      setScanning(true);

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );
    } catch (err: any) {
      console.error('Error starting QR scanner:', err);
      setScanning(false);
      setErrorMsg(
        err?.message ||
          'Tidak dapat mengakses kamera. Pastikan izin kamera aktif pada browser Anda.'
      );
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    let targetCode = decodedText.trim();

    // Check if JSON
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.kodeAset) {
        targetCode = parsed.kodeAset;
      }
    } catch (e) {
      // not JSON, use plain string
    }

    const found = assets.find(
      (a) =>
        a.kodeAset.toLowerCase() === targetCode.toLowerCase() ||
        (a.nomorSeri && a.nomorSeri.toLowerCase() === targetCode.toLowerCase())
    );

    if (found) {
      setMatchedAsset(found);
      stopScanner();
    } else {
      setErrorMsg(`QR Terdeteksi: "${targetCode}", namun tidak ditemukan pada daftar Aset terdaftar.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-emerald-950 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm">Pemindai Kamera QR Code Label Aset</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{errorMsg}</p>
                {!scanning && (
                  <button
                    onClick={startScanner}
                    className="mt-2 text-xs font-bold text-emerald-800 underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Coba Nyalakan Kamera Lagi
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Scanner Viewport */}
          {!matchedAsset && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-900 shadow-inner">
              <div id={containerId} className="w-full min-h-[280px]" />
              <div className="p-2.5 bg-slate-900/80 text-white text-[11px] text-center font-medium">
                Arahkan kamera ke stiker label QR Code yang tertempel di inventaris sekolah.
              </div>
            </div>
          )}

          {/* Matched Asset Result Card */}
          {matchedAsset && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Aset Teridentifikasi!
                </div>
                <span className="font-mono text-xs font-bold bg-white text-emerald-950 px-2 py-0.5 rounded border border-emerald-300">
                  {matchedAsset.kodeAset}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Nama Barang &amp; Merk:</span>
                  <div className="font-bold text-slate-900 text-sm">{matchedAsset.namaBarang}</div>
                  <div className="text-slate-600">{matchedAsset.merk} {matchedAsset.nomorSeri ? `(SN: ${matchedAsset.nomorSeri})` : ''}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Lokasi Ruangan:</span>
                    <strong className="text-slate-800">{matchedAsset.lokasi}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Penanggung Jawab:</span>
                    <strong className="text-slate-800">{matchedAsset.penanggungJawab}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Kondisi Fisik:</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        matchedAsset.kondisi === 'BAIK'
                          ? 'bg-emerald-200 text-emerald-900'
                          : matchedAsset.kondisi === 'RUSAK_RINGAN'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-red-200 text-red-900'
                      }`}
                    >
                      {matchedAsset.kondisi}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Nilai Perolehan:</span>
                    <strong className="text-emerald-950">{formatRupiah(matchedAsset.totalNilai || matchedAsset.hargaSatuan)}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2">
                {onMutasiAsset && (
                  <button
                    onClick={() => {
                      onMutasiAsset(matchedAsset);
                      onClose();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-700 transition"
                  >
                    <Building2 className="w-3.5 h-3.5" /> Mutasi Ruangan
                  </button>
                )}
                {onServiceAsset && (
                  <button
                    onClick={() => {
                      onServiceAsset(matchedAsset);
                      onClose();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 text-amber-950 font-bold text-xs hover:bg-amber-400 transition"
                  >
                    <Wrench className="w-3.5 h-3.5" /> Ajukan Servis
                  </button>
                )}
                <button
                  onClick={() => {
                    setMatchedAsset(null);
                    startScanner();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Pindai QR Aset Lainnya
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
