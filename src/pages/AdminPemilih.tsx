import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, QrCode, RefreshCw } from 'lucide-react';

export default function AdminPemilih() {
  const [voters, setVoters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      const { data, error } = await supabase
        .from('users_qr')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      setVoters(data || []);
    } catch (error) {
      console.error('Error fetching voters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirmation = async (voterId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin mereset status konfirmasi pemilih ini? Pemilih harus melakukan konfirmasi QR ulang.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users_qr')
        .update({ is_confirmed: false })
        .eq('id', voterId);

      if (error) throw error;
      
      // Update local state
      setVoters(voters.map(v => v.id === voterId ? { ...v, is_confirmed: false } : v));
      alert('Status konfirmasi berhasil direset.');
    } catch (error: any) {
      console.error('Error resetting confirmation:', error);
      alert('Gagal mereset konfirmasi: ' + error.message);
    }
  };

  const filteredVoters = voters.filter(v => 
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.qr_code_value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pemilih</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan email atau QR code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QR Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Konfirmasi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Memilih
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada data pemilih ditemukan.
                  </td>
                </tr>
              ) : (
                filteredVoters.map((voter) => (
                  <tr key={voter.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{voter.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                        <QrCode className="w-4 h-4 mr-2 text-gray-500" />
                        {voter.qr_code_value}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${voter.is_confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {voter.is_confirmed ? 'Terkonfirmasi' : 'Belum'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${voter.has_voted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {voter.has_voted ? 'Sudah' : 'Belum'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {voter.is_confirmed && !voter.has_voted && (
                        <button
                          onClick={() => handleResetConfirmation(voter.id)}
                          className="text-orange-600 hover:text-orange-900 flex items-center justify-end w-full"
                          title="Reset Konfirmasi"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reset
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
