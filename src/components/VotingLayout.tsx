import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function VotingLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(60);
  const [isFullscreenError, setIsFullscreenError] = useState(false);

  useEffect(() => {
    const voterId = sessionStorage.getItem('voter_id');
    if (!voterId) {
      navigate('/vote');
    }
  }, [navigate]);

  useEffect(() => {
    // Attempt fullscreen
    const elem = document.documentElement;
    const requestFS = () => {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => setIsFullscreenError(true));
      }
    };
    
    requestFS();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreenError(true);
      } else {
        setIsFullscreenError(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    // Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // Stop timer if on success page
        if (window.location.pathname === '/vote/success') {
          return prev;
        }
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTimeout = () => {
    sessionStorage.removeItem('voter_id');
    sessionStorage.removeItem('voter_qr');
    sessionStorage.removeItem('vote_session_id');
    sessionStorage.removeItem('vote_category_id');
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    alert('Waktu voting telah habis.');
    navigate('/vote');
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && location.pathname !== '/vote/success') {
        alert("Peringatan: Anda meninggalkan halaman voting! Aktivitas ini dicatat.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [location.pathname]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (location.pathname !== '/vote/success') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location.pathname]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30">
      {isFullscreenError && location.pathname !== '/vote/success' && (
        <div className="fixed top-0 left-0 right-0 bg-red-900/90 backdrop-blur-sm text-white px-4 py-3 text-center z-50 flex items-center justify-center gap-3 border-b border-red-500/50 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-sm font-medium">Sistem membutuhkan mode layar penuh untuk keamanan.</span>
          <button 
            onClick={() => document.documentElement.requestFullscreen()}
            className="ml-2 bg-white text-red-900 px-4 py-1.5 rounded-md text-sm font-bold hover:bg-gray-100 transition-colors"
          >
            Aktifkan
          </button>
        </div>
      )}
      
      {location.pathname !== '/vote/success' && (
        <div className="fixed top-6 right-6 bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-full px-5 py-2.5 flex items-center gap-3 shadow-xl z-40">
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${timeLeft <= 15 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
          <span className={`font-mono font-bold text-xl tracking-tight ${timeLeft <= 15 ? 'text-red-400' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      )}

      <main 
        className={`container mx-auto px-4 py-16 max-w-5xl relative z-10 transition-all duration-300 ${
          isFullscreenError && location.pathname !== '/vote/success' 
            ? 'pointer-events-none opacity-50 blur-sm' 
            : ''
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
