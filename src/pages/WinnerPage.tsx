import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WinnerPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllResults();
  }, []);

  const fetchAllResults = async () => {
    setLoading(true);
    try {
      // Fetch all categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (catError && catError.code !== '42P01') throw catError;
      setCategories(catData || []);

      // Fetch all candidates
      const { data: candData, error: candError } = await supabase
        .from('candidates')
        .select('*')
        .order('candidate_number', { ascending: true });
        
      if (candError && candError.code !== '42P01') throw candError;
      setCandidates(candData || []);

      // Fetch all votes
      const { data: voteData, error: voteError } = await supabase
        .from('votes')
        .select('candidate_id, category_id');
        
      if (voteError && voteError.code !== '42P01') throw voteError;
      setVotes(voteData || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVoteCount = (candidateId: string) => {
    return votes.filter(v => v.candidate_id === candidateId).length;
  };

  const getTotalCategoryVotes = (categoryId: string) => {
    return votes.filter(v => v.category_id === categoryId).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </button>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
              Hasil Akhir Pemilihan
            </h1>
            <p className="mt-2 text-gray-600">Rekapitulasi Suara Keseluruhan</p>
          </div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
            <p className="text-gray-500">Belum ada data hasil pemilihan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {categories.map(category => {
              const categoryCandidates = candidates.filter(c => c.category_id === category.id);
              const totalVotes = getTotalCategoryVotes(category.id);
              
              // Sort candidates by vote count descending
              const sortedCandidates = [...categoryCandidates].sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id));
              const winner = sortedCandidates[0];

              return (
                <div key={category.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold">{category.name}</h2>
                    <div className="flex items-center bg-indigo-500 px-3 py-1 rounded-full text-sm font-medium">
                      <Users className="w-4 h-4 mr-2" />
                      Total: {totalVotes} Suara
                    </div>
                  </div>
                  
                  <div className="p-8">
                    {sortedCandidates.length === 0 ? (
                      <p className="text-gray-500 text-center">Belum ada kandidat.</p>
                    ) : (
                      <div className="space-y-8">
                        {/* Winner Highlight */}
                        {winner && getVoteCount(winner.id) > 0 && (
                          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 flex flex-col items-center text-center">
                            <div className="bg-yellow-400 p-3 rounded-full mb-4">
                              <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-widest mb-1">Pemenang</h3>
                            <p className="text-2xl font-black text-gray-900 uppercase">
                              {winner.candidate_name_1}
                              {winner.candidate_name_2 && ` & ${winner.candidate_name_2}`}
                            </p>
                            <p className="text-yellow-700 font-bold mt-2">
                              {getVoteCount(winner.id)} Suara ({totalVotes > 0 ? Math.round((getVoteCount(winner.id) / totalVotes) * 100) : 0}%)
                            </p>
                          </div>
                        )}

                        {/* All Candidates List */}
                        <div className="space-y-4">
                          {sortedCandidates.map((candidate, index) => {
                            const voteCount = getVoteCount(candidate.id);
                            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                            const isWinner = index === 0 && voteCount > 0;

                            return (
                              <div key={candidate.id} className="group">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 ${
                                      isWinner ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {index + 1}
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-900">
                                        {candidate.candidate_name_1}
                                        {candidate.candidate_name_2 && ` & ${candidate.candidate_name_2}`}
                                      </p>
                                      <p className="text-xs text-gray-500">Nomor Urut {candidate.candidate_number}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-lg font-black text-gray-900">{voteCount}</span>
                                    <span className="text-xs text-gray-500 ml-1 uppercase font-bold">Suara</span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      isWinner ? 'bg-yellow-400' : 'bg-indigo-400'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-end mt-1">
                                  <span className="text-xs font-bold text-gray-400">{percentage}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
