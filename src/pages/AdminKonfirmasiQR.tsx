import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Search, CheckCircle, XCircle, User, Mail, QrCode } from 'lucide-react';

export default function AdminKonfirmasiQR() {
  const [manualCode, setManualCode] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [voter, setVoter] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // Initialize QR Scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        setScannedCode(decodedText);
        handleSearch(decodedText);
        // Optional: scanner.clear() to stop scanning after success
      },
      (err) => {
        // ignore errors during scanning
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const handleSearch = async (code: string) => {
    if (!code) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setVoter(null);

    try {
      const { data, error } = await supabase
        .from('users_qr')
        .select('*')
        .eq('qr_code_value', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('QR Code tidak ditemukan dalam sistem.');
        }
        throw error;
      }

      setVoter(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mencari data.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(manualCode);
  };

  const handleConfirm = async () => {
    if (!voter) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users_qr')
        .update({ is_confirmed: true })
        .eq('id', voter.id);

      if (error) throw error;

      setVoter({ ...voter, is_confirmed: true });
      setSuccessMsg('Pemilih berhasil dikonfirmasi!');
    } catch (err: any) {
      setError(err.message || 'Gagal mengkonfirmasi pemilih.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Konfirmasi QR Pemilih</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Scan QR Code</h2>
          <div id="reader" className="w-full overflow-hidden rounded-lg border border-gray-200"></div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-sm text-gray-500">ATAU INPUT MANUAL</span>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="mt-6 flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Masukkan kode QR..."
                className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Hasil Pencarian</h2>

          {loading && (
            <div className="flex-1 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {successMsg && !loading && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-sm text-green-700">{successMsg}</p>
              </div>
            </div>
          )}

          {!voter && !loading && !error && (
            <div className="flex-1 flex flex-col justify-center items-center text-gray-400">
              <QrCode className="h-16 w-16 mb-2 opacity-20" />
              <p>Scan atau masukkan kode QR untuk melihat data pemilih.</p>
            </div>
          )}

          {voter && !loading && (
            <div className="flex-1 flex flex-col">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6 space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                    <Mail className="h-3 w-3 mr-1" /> Email
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {voter.email || 'Tidak tersedia'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                    <QrCode className="h-3 w-3 mr-1" /> Kode QR
                  </p>
                  <p className="text-md font-mono text-indigo-600 font-bold mt-1 bg-indigo-50 inline-block px-2 py-1 rounded">
                    {voter.qr_code_value}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Status Saat Ini</p>
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${voter.is_confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {voter.is_confirmed ? 'Terkonfirmasi' : 'Belum Konfirmasi'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${voter.has_voted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {voter.has_voted ? 'Sudah Memilih' : 'Belum Memilih'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <button
                  onClick={handleConfirm}
                  disabled={voter.is_confirmed}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    voter.is_confirmed 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {voter.is_confirmed ? 'Pemilih Sudah Dikonfirmasi' : 'Konfirmasi Pemilih'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
