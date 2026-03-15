import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

export default function AdminKandidat() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  
  const [categoryName, setCategoryName] = useState('');
  
  const [candidateForm, setCandidateForm] = useState({
    id: '',
    candidate_number: '',
    candidate_photo: '',
    candidate_name_1: '',
    candidate_role_1: '',
    candidate_name_2: '',
    candidate_role_2: '',
    vision: '',
    mission: ''
  });
  const [isEditingCandidate, setIsEditingCandidate] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchCategories(selectedSession);
    } else {
      setCategories([]);
      setSelectedCategory('');
    }
  }, [selectedSession]);

  useEffect(() => {
    if (selectedCategory) {
      fetchCandidates(selectedCategory);
    } else {
      setCandidates([]);
    }
  }, [selectedCategory]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase.from('sessions').select('*').order('created_at', { ascending: false });
      if (error && error.code !== '42P01') throw error;
      setSessions(data || []);
      if (data && data.length > 0) setSelectedSession(data[0].id);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.from('categories').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
      if (error && error.code !== '42P01') throw error;
      setCategories(data || []);
      if (data && data.length > 0) setSelectedCategory(data[0].id);
      else setSelectedCategory('');
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCandidates = async (categoryId: string) => {
    try {
      const { data, error } = await supabase.from('candidates').select('*').eq('category_id', categoryId).order('candidate_number', { ascending: true });
      if (error && error.code !== '42P01') throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return alert('Pilih sesi terlebih dahulu');
    try {
      const { error } = await supabase.from('categories').insert([{ session_id: selectedSession, name: categoryName }]);
      if (error) throw error;
      setIsCategoryModalOpen(false);
      setCategoryName('');
      fetchCategories(selectedSession);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Hapus kategori ini beserta semua kandidat di dalamnya?')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      fetchCategories(selectedSession);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return alert('Pilih kategori terlebih dahulu');
    
    const payload = {
      category_id: selectedCategory,
      candidate_number: parseInt(candidateForm.candidate_number),
      candidate_photo: candidateForm.candidate_photo,
      candidate_name_1: candidateForm.candidate_name_1,
      candidate_role_1: candidateForm.candidate_role_1,
      candidate_name_2: candidateForm.candidate_name_2 || null,
      candidate_role_2: candidateForm.candidate_role_2 || null,
      vision: candidateForm.vision,
      mission: candidateForm.mission
    };

    try {
      if (isEditingCandidate) {
        const { error } = await supabase.from('candidates').update(payload).eq('id', candidateForm.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('candidates').insert([payload]);
        if (error) throw error;
      }
      setIsCandidateModalOpen(false);
      fetchCandidates(selectedCategory);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!window.confirm('Hapus kandidat ini?')) return;
    try {
      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (error) throw error;
      fetchCandidates(selectedCategory);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const openCandidateModal = (candidate?: any) => {
    if (candidate) {
      setCandidateForm({
        id: candidate.id,
        candidate_number: candidate.candidate_number.toString(),
        candidate_photo: candidate.candidate_photo || '',
        candidate_name_1: candidate.candidate_name_1 || '',
        candidate_role_1: candidate.candidate_role_1 || '',
        candidate_name_2: candidate.candidate_name_2 || '',
        candidate_role_2: candidate.candidate_role_2 || '',
        vision: candidate.vision || '',
        mission: candidate.mission || ''
      });
      setIsEditingCandidate(true);
    } else {
      setCandidateForm({
        id: '',
        candidate_number: '',
        candidate_photo: '',
        candidate_name_1: '',
        candidate_role_1: '',
        candidate_name_2: '',
        candidate_role_2: '',
        vision: '',
        mission: ''
      });
      setIsEditingCandidate(false);
    }
    setIsCandidateModalOpen(true);
  };

  if (loading) return <div className="p-8 text-center">Memuat...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Kandidat</h1>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Sesi</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            <option value="">-- Pilih Sesi --</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>{s.session_name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kategori</label>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!selectedSession}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border disabled:bg-gray-100"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              disabled={!selectedSession}
              className="mt-1 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              <Plus className="h-4 w-4" />
            </button>
            {selectedCategory && (
              <button
                onClick={() => handleDeleteCategory(selectedCategory)}
                className="mt-1 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedCategory && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Daftar Kandidat</h2>
            <button
              onClick={() => openCandidateModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kandidat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
                Belum ada kandidat di kategori ini.
              </div>
            ) : (
              candidates.map(candidate => (
                <div key={candidate.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="aspect-video bg-gray-100 relative">
                    {candidate.candidate_photo ? (
                      <img src={candidate.candidate_photo} alt="Kandidat" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">
                      {candidate.candidate_number}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-gray-900">{candidate.candidate_name_1}</h3>
                      <p className="text-sm text-indigo-600 font-medium">{candidate.candidate_role_1}</p>
                      
                      {candidate.candidate_name_2 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <h3 className="font-bold text-lg text-gray-900">{candidate.candidate_name_2}</h3>
                          <p className="text-sm text-indigo-600 font-medium">{candidate.candidate_role_2}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-4 flex justify-end space-x-2 border-t border-gray-100">
                      <button onClick={() => openCandidateModal(candidate)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteCandidate(candidate.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true"><div className="absolute inset-0 bg-gray-500 opacity-75"></div></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddCategory}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Tambah Kategori Baru</h3>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ketua & Wakil Ketua OSIS"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                  />
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Simpan</button>
                  <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Batal</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Modal */}
      {isCandidateModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true"><div className="absolute inset-0 bg-gray-500 opacity-75"></div></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleCandidateSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[70vh] overflow-y-auto">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {isEditingCandidate ? 'Edit Kandidat' : 'Tambah Kandidat'}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Nomor Urut</label>
                      <input type="number" required min="1" value={candidateForm.candidate_number} onChange={(e) => setCandidateForm({...candidateForm, candidate_number: e.target.value})} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">URL Foto (16:9)</label>
                      <input type="url" value={candidateForm.candidate_photo} onChange={(e) => setCandidateForm({...candidateForm, candidate_photo: e.target.value})} placeholder="https://..." className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                    </div>

                    <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Kandidat 1</h4>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Nama</label>
                      <input type="text" required value={candidateForm.candidate_name_1} onChange={(e) => setCandidateForm({...candidateForm, candidate_name_1: e.target.value})} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Peran (Role)</label>
                      <input type="text" required placeholder="Calon Ketua" value={candidateForm.candidate_role_1} onChange={(e) => setCandidateForm({...candidateForm, candidate_role_1: e.target.value})} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                    </div>

                    <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Kandidat 2 (Opsional)</h4>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Nama</label>
                      <input type="text" value={candidateForm.candidate_name_2} onChange={(e) => setCandidateForm({...candidateForm, candidate_name_2: e.target.value})} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Peran (Role)</label>
                      <input type="text" placeholder="Calon Wakil Ketua" value={candidateForm.candidate_role_2} onChange={(e) => setCandidateForm({...candidateForm, candidate_role_2: e.target.value})} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                    </div>

                    <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
                      <label className="block text-sm font-medium text-gray-700">Visi</label>
                      <textarea rows={3} value={candidateForm.vision} onChange={(e) => setCandidateForm({...candidateForm, vision: e.target.value})} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Misi</label>
                      <textarea rows={4} value={candidateForm.mission} onChange={(e) => setCandidateForm({...candidateForm, mission: e.target.value})} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Simpan</button>
                  <button type="button" onClick={() => setIsCandidateModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Batal</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
