import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Settings, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

export default function AdminPengaturan() {
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {}
  });

  const handleAction = async (actionFn: () => Promise<void>) => {
    setLoading(true);
    try {
      await actionFn();
      alert('Aksi berhasil dilakukan.');
    } catch (error: any) {
      alert(`Gagal: ${error.message}`);
    } finally {
      setLoading(false);
      setModalConfig({ ...modalConfig, isOpen: false });
    }
  };

  const confirmAction = (title: string, message: string, action: () => Promise<void>) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      action
    });
  };

  // --- Reset Actions ---

  const resetKonfirmasiPemilih = async () => {
    const { error } = await supabase.from('users_qr').update({ is_confirmed: false }).neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to update all
    if (error) throw error;
  };

  const resetStatusVoting = async () => {
    const { error } = await supabase.from('users_qr').update({ has_voted: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
  };

  const resetSemuaDataVoting = async () => {
    const { error } = await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
  };

  const resetKandidat = async () => {
    const { error } = await supabase.from('candidates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
  };

  const resetKategori = async () => {
    const { error } = await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
  };

  const resetSesi = async () => {
    const { error } = await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
  };

  const settingsOptions = [
    {
      title: 'Reset Konfirmasi Pemilih',
      description: 'Mengubah status semua pemilih menjadi "Belum Dikonfirmasi" (is_confirmed = false).',
      icon: <RefreshCw className="h-5 w-5 text-yellow-600" />,
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      btnColor: 'bg-yellow-600 hover:bg-yellow-700',
      action: () => confirmAction('Reset Konfirmasi Pemilih', 'Apakah Anda yakin ingin mereset status konfirmasi semua pemilih?', resetKonfirmasiPemilih)
    },
    {
      title: 'Reset Status Voting',
      description: 'Mengizinkan semua pemilih untuk melakukan voting kembali (has_voted = false).',
      icon: <RefreshCw className="h-5 w-5 text-orange-600" />,
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      btnColor: 'bg-orange-600 hover:bg-orange-700',
      action: () => confirmAction('Reset Status Voting', 'Apakah Anda yakin ingin mereset status voting semua pemilih? Mereka akan bisa memilih lagi.', resetStatusVoting)
    },
    {
      title: 'Reset Semua Data Voting',
      description: 'Menghapus SELURUH data suara yang telah masuk di tabel votes.',
      icon: <Trash2 className="h-5 w-5 text-red-600" />,
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      btnColor: 'bg-red-600 hover:bg-red-700',
      action: () => confirmAction('Reset Semua Data Voting', 'PERINGATAN KERAS: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA SUARA? Tindakan ini tidak dapat dibatalkan.', resetSemuaDataVoting)
    },
    {
      title: 'Reset Kandidat',
      description: 'Menghapus semua data kandidat dari sistem.',
      icon: <Trash2 className="h-5 w-5 text-red-600" />,
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      btnColor: 'bg-red-600 hover:bg-red-700',
      action: () => confirmAction('Reset Kandidat', 'Apakah Anda yakin ingin menghapus semua data kandidat?', resetKandidat)
    },
    {
      title: 'Reset Kategori',
      description: 'Menghapus semua data kategori pemilihan.',
      icon: <Trash2 className="h-5 w-5 text-red-600" />,
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      btnColor: 'bg-red-600 hover:bg-red-700',
      action: () => confirmAction('Reset Kategori', 'Apakah Anda yakin ingin menghapus semua kategori? Pastikan kandidat sudah dihapus terlebih dahulu.', resetKategori)
    },
    {
      title: 'Reset Sesi',
      description: 'Menghapus semua data sesi pemilihan.',
      icon: <Trash2 className="h-5 w-5 text-red-600" />,
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      btnColor: 'bg-red-600 hover:bg-red-700',
      action: () => confirmAction('Reset Sesi', 'Apakah Anda yakin ingin menghapus semua sesi? Pastikan kategori sudah dihapus terlebih dahulu.', resetSesi)
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <Settings className="h-8 w-8 text-gray-800 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Zona Berbahaya (Danger Zone)</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Tindakan di halaman ini akan mengubah atau menghapus data secara permanen. Harap berhati-hati.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsOptions.map((option, index) => (
          <div key={index} className={`border rounded-xl p-6 transition-colors ${option.color}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-lg shadow-sm mr-4">
                  {option.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{option.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={option.action}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${option.btnColor}`}
              >
                Jalankan Aksi
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {modalConfig.isOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalConfig.title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {modalConfig.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAction(modalConfig.action)}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Memproses...' : 'Ya, Reset'}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
