import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ChevronRight } from 'lucide-react';

export default function VoteCategory() {
  const [categories, setCategories] = useState<any[]>([]);
  const [votedCategories, setVotedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = sessionStorage.getItem('vote_session_id');
    const voterId = sessionStorage.getItem('voter_id');
    const userId = sessionStorage.getItem('user_id');
    
    if (!sessionId || !voterId || !userId) {
      navigate('/vote');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (catError) throw catError;
        setCategories(catData || []);

        // Fetch user's votes in this session
        const { data: voteData, error: voteError } = await supabase
          .from('votes')
          .select('category_id')
          .eq('user_id', userId)
          .eq('session_id', sessionId);

        if (voteError) throw voteError;
        setVotedCategories(voteData.map(v => v.category_id) || []);
      } catch (err) {
        console.error('Error fetching category data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSelectCategory = (categoryId: string) => {
    if (votedCategories.includes(categoryId)) return;
    sessionStorage.setItem('vote_category_id', categoryId);
    navigate('/vote/select');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 font-mono text-sm tracking-widest uppercase animate-pulse">
          Memuat kategori...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Pilih Kategori Pemilihan
        </h2>
        <p className="text-gray-400 mt-3">Silakan pilih kategori untuk mulai memberikan suara.</p>
      </div>
      
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-10 text-center">
            <p className="text-gray-500">Tidak ada kategori tersedia untuk sesi ini.</p>
          </div>
        ) : (
          categories.map((category) => {
            const isVoted = votedCategories.includes(category.id);
            return (
              <button 
                key={category.id}
                onClick={() => handleSelectCategory(category.id)}
                disabled={isVoted}
                className={`w-full bg-gray-900/80 backdrop-blur-sm border rounded-2xl p-6 flex items-center justify-between transition-all group text-left shadow-lg ${
                  isVoted 
                    ? 'border-emerald-500/30 opacity-75 cursor-not-allowed' 
                    : 'border-gray-800 hover:border-indigo-500/50 hover:bg-gray-800'
                }`}
              >
                <div>
                  <h3 className={`text-2xl font-semibold transition-colors ${isVoted ? 'text-emerald-400' : 'text-gray-200 group-hover:text-white'}`}>
                    {category.name}
                  </h3>
                  <p className={`text-sm mt-1 font-medium ${isVoted ? 'text-emerald-500/70' : 'text-gray-500'}`}>
                    {isVoted ? 'Sudah dipilih' : 'Belum dipilih'}
                  </p>
                </div>
                <div className={`flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all ${
                  isVoted 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-gray-950 group-hover:bg-indigo-600 text-gray-400 group-hover:text-white'
                }`}>
                  <span className="hidden sm:inline">{isVoted ? 'Selesai' : 'Pilih Kandidat'}</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
