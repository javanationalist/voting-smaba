import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { PlayCircle } from 'lucide-react';

export default function VoteSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('status', 'active')
          .single();

        if (error || !data) {
          setError('Belum ada pemilihan yang aktif.');
        } else {
          setSession(data);
          sessionStorage.setItem('vote_session_id', data.id);
        }
      } catch (err: any) {
        setError('Belum ada pemilihan yang aktif.');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSession();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 font-mono text-sm tracking-widest uppercase animate-pulse">
          Memeriksa sesi aktif...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-gray-900/50 border border-red-900/50 rounded-2xl p-10 max-w-md w-full text-center backdrop-blur-sm">
          <h2 className="text-xl font-medium text-red-400 mb-6">{error}</h2>
          <button
            onClick={() => navigate('/vote')}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors border-b border-transparent hover:border-gray-400 pb-1"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center max-w-2xl w-full">
        <div className="inline-block mb-4 px-3 py-1 bg-indigo-900/30 border border-indigo-500/30 rounded-full text-indigo-400 text-xs font-bold tracking-widest uppercase">
          Sesi Aktif
        </div>
        <h1 className="text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
          {session.session_name}
        </h1>
        {session.description && (
          <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-xl mx-auto">
            {session.description}
          </p>
        )}
        
        <button
          onClick={() => navigate('/vote/category')}
          className="group relative inline-flex items-center justify-center gap-4 bg-white hover:bg-gray-100 text-gray-950 text-xl font-bold py-5 px-10 rounded-2xl transition-all transform hover:scale-105 shadow-2xl shadow-white/10"
        >
          <PlayCircle className="w-7 h-7 text-indigo-600 group-hover:scale-110 transition-transform" />
          Mulai Voting
        </button>
      </div>
    </div>
  );
}
