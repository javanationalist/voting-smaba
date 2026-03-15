import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function VoteSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Clear all session data
    sessionStorage.removeItem('voter_id');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('voter_qr');
    sessionStorage.removeItem('vote_session_id');
    sessionStorage.removeItem('vote_category_id');

    // Auto redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleFinish = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    navigate('/vote');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-[2.5rem] p-16 text-center max-w-xl w-full shadow-2xl">
        <div className="mx-auto w-32 h-32 bg-emerald-900/20 border border-emerald-500/20 rounded-full flex items-center justify-center mb-10">
          <CheckCircle className="w-16 h-16 text-emerald-500" />
        </div>
        
        <h1 className="text-5xl font-black text-white mb-6 tracking-tight">Terima Kasih</h1>
        <p className="text-2xl text-gray-400 mb-8 font-medium">
          Suara Anda telah berhasil direkam.
        </p>

        <p className="text-sm text-gray-500 mb-12">
          Halaman akan kembali dalam <span className="font-bold text-white">{countdown}</span> detik...
        </p>

        <button
          onClick={handleFinish}
          className="w-full bg-white hover:bg-gray-200 text-gray-950 font-black py-5 rounded-2xl transition-all text-xl shadow-xl shadow-white/5 active:scale-[0.98]"
        >
          Selesai
        </button>
      </div>
    </div>
  );
}
