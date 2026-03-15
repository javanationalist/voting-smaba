import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, Trophy, Users } from 'lucide-react';

export default function AdminHasil() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  
  const [selectedSession, setSelectedSession] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (sessionError && sessionError.code !== '42P01') throw sessionError;
      setSessions(sessionData || []);
      
      if (sessionData && sessionData.length > 0) {
        setSelectedSession(sessionData[0].id);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSession) {
      fetchResultsData(selectedSession);
    } else {
      setCategories([]);
      setCandidates([]);
      setVotes([]);
    }
  }, [selectedSession]);

  const fetchResultsData = async (sessionId: string) => {
    setLoading(true);
    try {
      // Fetch categories for this session
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (catError && catError.code !== '42P01') throw catError;
      const fetchedCategories = catData || [];
      setCategories(fetchedCategories);

      if (fetchedCategories.length > 0) {
        const categoryIds = fetchedCategories.map(c => c.id);
        
        // Fetch candidates for these categories
        const { data: candData, error: candError } = await supabase
          .from('candidates')
          .select('*')
          .in('category_id', categoryIds)
          .order('candidate_number', { ascending: true });
          
        if (candError && candError.code !== '42P01') throw candError;
        setCandidates(candData || []);

        // Fetch votes for these categories
        const { data: voteData, error: voteError } = await supabase
          .from('votes')
          .select('candidate_id, category_id')
          .in('category_id', categoryIds);
          
        if (voteError && voteError.code !== '42P01') throw voteError;
        setVotes(voteData || []);
      } else {
        setCandidates([]);
        setVotes([]);
      }
    } catch (error) {
      console.error('Error fetching results data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate votes for a candidate
  const getVoteCount = (candidateId: string) => {
    return votes.filter(v => v.candidate_id === candidateId).length;
  };

  // Helper to calculate total votes in a category
  const getTotalCategoryVotes = (categoryId: string) => {
    return votes.filter(v => v.category_id === categoryId).length;
  };

  if (loading && !selectedSession) return <div className="p-8 text-center">Memuat...</div>;

  return (
    <div>
      <div className="flex items-center mb-8">
        <BarChart3 className="h-8 w-8 text-indigo-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Hasil Pemilu</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Sesi Pemilihan</label>
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="block w-full max-w-md pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
        >
          <option value="">-- Pilih Sesi --</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>{s.session_name}</option>
          ))}
        </select>
      </div>

      {loading && selectedSession ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : selectedSession && categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
          Belum ada data kategori/kandidat untuk sesi ini.
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map(category => {
            const categoryCandidates = candidates.filter(c => c.category_id === category.id);
            const totalVotes = getTotalCategoryVotes(category.id);
            
            // Sort candidates by vote count descending
            const sortedCandidates = [...categoryCandidates].sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id));

            return (
              <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">{category.name}</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    Total Suara: {totalVotes}
                  </span>
                </div>
                
                <div className="p-6">
                  {sortedCandidates.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Belum ada kandidat.</p>
                  ) : (
                    <div className="space-y-6">
                      {sortedCandidates.map((candidate, index) => {
                        const voteCount = getVoteCount(candidate.id);
                        const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                        const isWinner = index === 0 && voteCount > 0;

                        return (
                          <div key={candidate.id} className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mr-3">
                                  {candidate.candidate_number}
                                </div>
                                <div>
                                  <span className="font-bold text-gray-900 flex items-center">
                                    {candidate.candidate_name_1}
                                    {candidate.candidate_name_2 && ` & ${candidate.candidate_name_2}`}
                                    {isWinner && <Trophy className="w-4 h-4 text-yellow-500 ml-2" />}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold text-gray-900">{voteCount}</span>
                                <span className="text-sm text-gray-500 ml-1">suara</span>
                              </div>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                              <div 
                                className={`h-4 rounded-full ${isWinner ? 'bg-indigo-600' : 'bg-indigo-400'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-right mt-1">
                              <span className="text-xs font-semibold text-gray-500">{percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
