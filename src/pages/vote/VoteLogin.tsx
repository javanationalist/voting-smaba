import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { QrCode, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function VoteLogin() {
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!showScanner) {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        }).catch(console.error);
      }
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        // Small delay to ensure DOM is fully painted
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return;

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            if (isMounted) {
              setQrCode(decodedText);
              setShowScanner(false);
            }
          },
          (errorMessage) => {
            // ignore
          }
        );
      } catch (err) {
        console.error("Error starting scanner:", err);
        if (isMounted) {
          setError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
          setShowScanner(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        }).catch(console.error);
      }
    };
  }, [showScanner]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!qrCode) return;
    
    setError('');
    setLoading(true);

    try {
      const { data, error: dbError } = await supabase
        .from('users_qr')
        .select('*')
        .eq('qr_code_value', qrCode)
        .single();

      if (dbError || !data) {
        throw new Error('Kode tidak valid');
      }

      if (!data.is_confirmed) {
        throw new Error('Akun belum dikonfirmasi oleh panitia');
      }

      if (data.has_voted) {
        throw new Error('Anda sudah melakukan voting');
      }

      // Valid
      sessionStorage.setItem('voter_id', data.id);
      sessionStorage.setItem('user_id', data.user_id);
      sessionStorage.setItem('voter_qr', data.qr_code_value);
      
      navigate('/vote/session');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-gray-700 shadow-inner">
            <QrCode className="h-10 w-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bilik Suara Digital</h1>
          <p className="text-gray-400 mt-3 text-sm">Masukkan kode QR Anda untuk memulai</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-center text-sm font-medium">
            {error}
          </div>
        )}

        {showScanner ? (
          <div className="mb-6">
            <div id="reader" className="w-full overflow-hidden rounded-xl border border-gray-700 bg-black min-h-[300px] flex items-center justify-center">
              <span className="text-gray-500 text-sm">Memuat kamera...</span>
            </div>
            <button
              type="button"
              onClick={() => setShowScanner(false)}
              className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-all text-sm"
            >
              Tutup Scanner
            </button>
          </div>
        ) : (
          <button
            disabled={true} 
            type="button"
            onClick={() => setShowScanner(true)}
            className="w-full mb-6 bg-gray-800 hover:bg-gray-700 text-white font-medium py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-700"
          >
            <Camera className="w-5 h-5 text-indigo-400" />
            Bilik suara dipantau. Kamera nyala.
          </button>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-gray-900 text-xs font-medium text-gray-500 uppercase tracking-wider">Masukkan kode</span>
            </div>
          </div>

          <div>
            <input
              type="text"
              required
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              className="w-full px-4 py-4 bg-gray-950 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-center text-xl tracking-[0.2em] uppercase placeholder-gray-600"
              placeholder="KODE QR"
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !qrCode}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
          >
            {loading ? 'Memeriksa...' : 'Lanjutkan'}
          </button>
        </form>
      </div>
    </div>
  );
}
