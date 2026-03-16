import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function VoteProgress() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkProgress = async () => {
      const voterId = sessionStorage.getItem('voter_id');
      const userId = sessionStorage.getItem('user_id');
      const sessionId = sessionStorage.getItem('vote_session_id');

      if (!voterId || !userId || !sessionId) {
        navigate('/vote');
        return;
      }

      // Wait for 2 seconds as requested
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        // 1. Get all categories in the session
        const { data: categories, error: catError } = await supabase
          .from('categories')
          .select('id')
          .eq('session_id', sessionId);

        if (catError) throw catError;

        // 2. Get categories already voted by this voter
        const { data: votes, error: voteError } = await supabase
          .from('votes')
          .select('category_id')
          .eq('user_id', userId)
          .eq('session_id', sessionId);

        if (voteError) throw voteError;

        const votedCategoryIds = votes.map(v => v.category_id);
        const allCategoryIds = categories.map(c => c.id);

        const remainingCategories = allCategoryIds.filter(id => !votedCategoryIds.includes(id));

        if (remainingCategories.length > 0) {
          // Still have categories to vote
          navigate('/vote/category');
        } else {
          // All categories voted
          const { error: updateError } = await supabase
            .from('users_qr')
            .update({ has_voted: true })
            .eq('id', voterId);

          if (updateError) throw updateError;

          navigate('/vote/success');
        }
      } catch (err) {
        console.error('Error checking progress:', err);
        navigate('/vote/category');
      }
    };

    checkProgress();
  }, [navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
        <div className="relative bg-gray-900 border border-gray-800 p-8 rounded-full shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-indigo-500 animate-pulse" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Suara dikirim</h2>
      <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
        Kembali ke halaman kategori untuk melanjutkan pemilihan.
      </p>
      
      <div className="mt-10 flex items-center gap-3 text-indigo-400 font-mono text-sm tracking-widest uppercase">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Memproses...</span>
      </div>
    </div>
  );
}
