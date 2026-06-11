import React from 'react';
import { motion } from 'motion/react';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center max-w-md w-full"
      >
        <div className="mb-6 rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle size={48} />
        </div>

        <h1 className="mb-2 text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          404
        </h1>
        <h2 className="mb-4 text-2xl font-bold text-gray-700 dark:text-gray-300">
          Halaman Tidak Ditemukan
        </h2>
        <p className="mb-8 text-gray-500 dark:text-gray-400">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan ke alamat lain.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
          >
            <Home size={18} />
            Ke Beranda
          </a>
        </div>
      </motion.div>
    </div>
  );
}
