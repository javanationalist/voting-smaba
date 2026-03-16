import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Download, RefreshCw, Users, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function AdminWinner() {
  const [categories, setCategories] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

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

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan-Hasil-Pemilihan-${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal mengunduh PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Rekapitulasi Pemenang</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAllResults}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-70"
          >
            {downloading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download Laporan (PDF)
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-r-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Halaman ini menampilkan rekapitulasi suara keseluruhan dari semua sesi pemilihan yang aktif.
            </p>
          </div>
        </div>
      </div>

      <div ref={reportRef} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-12 border-b pb-8">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Laporan Hasil Akhir Pemilihan</h2>
          <p className="text-gray-500 mt-2">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 italic">Belum ada data kategori pemilihan.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map(category => {
              const categoryCandidates = candidates.filter(c => c.category_id === category.id);
              const totalVotes = getTotalCategoryVotes(category.id);
              const sortedCandidates = [...categoryCandidates].sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id));
              const winner = sortedCandidates[0];

              return (
                <div key={category.id} className="page-break-inside-avoid">
                  <div className="flex items-center justify-between mb-6 border-l-4 border-indigo-600 pl-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">Total Partisipasi: {totalVotes} Suara</p>
                    </div>
                    {winner && getVoteCount(winner.id) > 0 && (
                      <div className="flex items-center bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg border border-yellow-100">
                        <Trophy className="w-5 h-5 mr-2" />
                        <span className="font-bold">Pemenang Terdeteksi</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {sortedCandidates.map((candidate, index) => {
                      const voteCount = getVoteCount(candidate.id);
                      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                      const isWinner = index === 0 && voteCount > 0;

                      return (
                        <div 
                          key={candidate.id} 
                          className={`p-5 rounded-xl border flex items-center justify-between transition-all ${
                            isWinner ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-100'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mr-5 ${
                              isWinner ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {candidate.candidate_number}
                            </div>
                            <div>
                              <p className={`font-bold text-lg ${isWinner ? 'text-indigo-900' : 'text-gray-800'}`}>
                                {candidate.candidate_name_1}
                                {candidate.candidate_name_2 && ` & ${candidate.candidate_name_2}`}
                              </p>
                              <div className="flex items-center mt-1">
                                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${isWinner ? 'bg-indigo-600' : 'bg-indigo-300'}`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-bold text-gray-500">{percentage}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-gray-900">{voteCount}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Suara</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-20 pt-8 border-t border-dashed border-gray-200 text-center">
          <p className="text-sm text-gray-400 italic">Laporan ini dihasilkan secara otomatis oleh Sistem E-Voting</p>
        </div>
      </div>
    </div>
  );
}
