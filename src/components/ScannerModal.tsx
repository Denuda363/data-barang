import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedCode: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'interactive-barcode-reader';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setScannedValue(null);
      setErrorMsg(null);
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setErrorMsg(null);
        setIsScanning(true);

        // Ensure container exists
        await new Promise((r) => setTimeout(r, 100));

        if (!isMounted) return;

        const html5QrcodeScanner = new Html5Qrcode(containerId);
        scannerRef.current = html5QrcodeScanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 180 },
          aspectRatio: 1.0,
        };

        await html5QrcodeScanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isMounted) {
              setScannedValue(decodedText);
              // Vibration feedback if supported
              if (navigator.vibrate) {
                navigator.vibrate(100);
              }
              onScanSuccess(decodedText);
              stopScanner();
            }
          },
          () => {
            // Ignore scan failures (happens every frame when no QR/barcode detected)
          }
        );
      } catch (err: any) {
        console.error('Failed to start camera scanner', err);
        if (isMounted) {
          setIsScanning(false);
          setErrorMsg(
            'Kamera tidak dapat diakses atau izin ditolak. Pastikan izin kamera telah diberikan di browser Anda.'
          );
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error clearing scanner instance', e);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Scan Barcode / QR Barang
            </h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col items-center justify-center min-h-[300px]">
          {errorMsg ? (
            <div className="text-center p-6 bg-rose-950/40 border border-rose-800/50 rounded-xl my-4 text-rose-200 space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-sm">{errorMsg}</p>
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setIsScanning(true);
                  // Trigger re-render effect
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full overflow-hidden rounded-xl bg-black border border-slate-800 shadow-inner min-h-[260px] flex items-center justify-center">
                <div id={containerId} className="w-full h-full"></div>
                
                {scannedValue && (
                  <div className="absolute inset-0 bg-emerald-950/80 flex flex-col items-center justify-center p-4 text-center z-20">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce mb-2" />
                    <p className="text-xs text-emerald-200">Barcode Terdeteksi!</p>
                    <p className="text-lg font-bold text-white font-mono mt-1 bg-emerald-900/60 px-3 py-1 rounded-md border border-emerald-500/40">
                      {scannedValue}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 text-center mt-3">
                Arahkan kamera ke kode barcode atau QR code pada kemasan barang
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors"
          >
            Tutup Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
