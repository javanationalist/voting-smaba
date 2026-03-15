import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ChevronRight } from 'lucide-react';

export default function VoteCategory() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = sessionStorage.getItem('vote_session_id');
    if (!sessionId) {
      navigate('/vote/session');
      return;
    }

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, [navigate]);

  const handleSelectCategory = (categoryId: string) => {
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
          categories.map((category) => (
            <button 
              key={category.id}
              onClick={() => handleSelectCategory(category.id)}
              className="w-full bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 flex items-center justify-between hover:border-indigo-500/50 hover:bg-gray-800 transition-all group text-left shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-gray-200 group-hover:text-white transition-colors">
                {category.name}
              </h3>
              <div className="flex items-center gap-3 bg-gray-950 group-hover:bg-indigo-600 text-gray-400 group-hover:text-white px-5 py-3 rounded-xl font-medium transition-all">
                <span className="hidden sm:inline">Pilih Kandidat</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
