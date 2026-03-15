import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, X } from 'lucide-react';

export default function VoteSelect() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const categoryId = sessionStorage.getItem('vote_category_id');
    if (!categoryId) {
      navigate('/vote/category');
      return;
    }

    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('category_id', categoryId)
        .order('candidate_number', { ascending: true });

      if (!error && data) {
        setCandidates(data);
      }
      setLoading(false);
    };

    fetchCandidates();
  }, [navigate]);

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;
    setIsSubmitting(true);

    try {
      const voterId = sessionStorage.getItem('voter_id');
      const userId = sessionStorage.getItem('user_id');
      const sessionId = sessionStorage.getItem('vote_session_id');
      const categoryId = sessionStorage.getItem('vote_category_id');

      if (!voterId || !userId || !sessionId || !categoryId) {
        throw new Error('Data sesi tidak lengkap. Silakan ulangi.');
      }

      // Insert vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert([{
          session_id: sessionId,
          category_id: categoryId,
          candidate_id: selectedCandidate.id,
          user_id: userId
        }]);

      if (voteError) throw voteError;

      // Update user has_voted
      const { error: updateError } = await supabase
        .from('users_qr')
        .update({ has_voted: true })
        .eq('id', voterId);

      if (updateError) throw updateError;

      // Success
      navigate('/vote/success');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan suara.');
      setIsSubmitting(false);
      setSelectedCandidate(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 font-mono text-sm tracking-widest uppercase animate-pulse">
          Memuat kandidat...
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white tracking-tight">
          Pilih Kandidat
        </h2>
        <p className="text-gray-400 mt-4 text-lg">Pelajari visi misi dan tentukan pilihan Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id}
            className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl hover:border-gray-700 transition-colors"
          >
            <div className="relative aspect-video bg-gray-950 border-b border-gray-800">
              {candidate.candidate_photo ? (
                <img 
                  src={candidate.candidate_photo} 
                  alt={`Kandidat ${candidate.candidate_number}`}
                  className="w-full h-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-800">
                  <span className="text-6xl font-bold">{candidate.candidate_number}</span>
                </div>
              )}
              <div className="absolute top-6 left-6 bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg border-2 border-gray-900/50 backdrop-blur-md">
                {candidate.candidate_number}
              </div>
            </div>

            <div className="p-8 flex-grow flex flex-col">
              <div className="mb-8">
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{candidate.candidate_name_1}</h3>
                  <p className="text-indigo-400 font-medium uppercase tracking-wider text-xs mt-1">{candidate.candidate_role_1}</p>
                </div>
                {candidate.candidate_name_2 && (
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{candidate.candidate_name_2}</h3>
                    <p className="text-indigo-400 font-medium uppercase tracking-wider text-xs mt-1">{candidate.candidate_role_2}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6 mb-10 flex-grow">
                <div className="bg-gray-950/50 p-5 rounded-2xl border border-gray-800/50">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Visi</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{candidate.vision}</p>
                </div>
                <div className="bg-gray-950/50 p-5 rounded-2xl border border-gray-800/50">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Misi</h4>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{candidate.mission}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidate(candidate)}
                className="w-full bg-white hover:bg-gray-200 text-gray-950 font-black py-5 rounded-2xl transition-all text-xl shadow-xl shadow-white/5 active:scale-[0.98]"
              >
                PILIH KANDIDAT {candidate.candidate_number}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-lg w-full p-10 shadow-2xl transform transition-all">
            <div className="text-center mb-10">
              <div className="mx-auto w-20 h-20 bg-indigo-900/30 border border-indigo-500/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Konfirmasi Pilihan</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Apakah Anda yakin memilih kandidat nomor urut <strong className="text-white font-black text-xl">{selectedCandidate.candidate_number}</strong>?
              </p>
              <p className="text-sm text-red-400 mt-4 font-medium">Pilihan yang sudah dikonfirmasi tidak dapat diubah.</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedCandidate(null)}
                disabled={isSubmitting}
                className="flex-1 bg-gray-950 border border-gray-800 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmVote}
                disabled={isSubmitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/20"
              >
                {isSubmitting ? 'Menyimpan...' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
