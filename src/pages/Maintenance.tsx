import React from "react";
import { Wrench, ShieldAlert, RefreshCw } from "lucide-react";

export default function Maintenance() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>

      <div className="max-w-lg w-full bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 text-center relative z-10 shadow-2xl">
        {/* Animated gear/wrench icon container */}
        <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
          <Wrench className="w-10 h-10 text-amber-500 animate-pulse" />
        </div>

        {/* Small Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-500/20">
          <ShieldAlert className="w-3.5 h-3.5 animate-spin" />
          System Maintenance
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Pemeliharaan Sistem
        </h1>

        {/* Description */}
        <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
          Sistem <strong className="text-indigo-400">Voting SMASA</strong> sedang ditingkatkan untuk memberikan pengalaman pemilihan yang lebih adil, cepat, dan aman. Kami akan segera kembali!
        </p>

        {/* Status indicators */}
        <div className="mt-8 border border-slate-700/60 bg-slate-900/60 rounded-xl p-5 text-left text-xs font-mono space-y-2 text-slate-400">
          <div className="flex justify-between items-center">
            <span>Grup Server:</span>
            <span className="text-emerald-400">Amankan Data (Backup OK)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Estimasi Selesai:</span>
            <span className="text-amber-400 font-medium">Beberapa menit lagi</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Database Status:</span>
            <span className="text-indigo-400">Optimizing Indexes</span>
          </div>
        </div>

        {/* Footer info & Reload button */}
        <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col items-center justify-center gap-4">
          <p className="text-xs text-slate-500">
            Terima kasih atas kesabaran dan kerja sama Anda.
          </p>
          <button
            onClick={handleReload}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-900 bg-amber-500 rounded-xl hover:bg-amber-400 active:bg-amber-600 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <RefreshCw className="w-4 h-4" />
            Cek Status Terbaru
          </button>
        </div>
      </div>
    </div>
  );
}
