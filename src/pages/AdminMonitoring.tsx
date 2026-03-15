import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, Users, UserCheck, CheckSquare, Percent } from 'lucide-react';

export default function AdminMonitoring() {
  const [stats, setStats] = useState({
    totalRegistered: 0,
    confirmedVoters: 0,
    alreadyVoted: 0,
    participationRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Set up real-time subscription for users_qr table
    const subscription = supabase
      .channel('public:users_qr')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users_qr' }, (payload) => {
        console.log('Change received!', payload);
        fetchStats(); // Refresh stats on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('users_qr')
        .select('is_confirmed, has_voted');

      if (error) throw error;

      const total = data.length;
      const confirmed = data.filter(v => v.is_confirmed).length;
      const voted = data.filter(v => v.has_voted).length;
      const rate = total > 0 ? Math.round((voted / total) * 100) : 0;

      setStats({
        totalRegistered: total,
        confirmedVoters: confirmed,
        alreadyVoted: voted,
        participationRate: rate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Pemilih', value: stats.totalRegistered, icon: <Users className="h-10 w-10 text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Pemilih Terkonfirmasi', value: stats.confirmedVoters, icon: <UserCheck className="h-10 w-10 text-green-500" />, bg: 'bg-green-50' },
    { title: 'Suara Masuk', value: stats.alreadyVoted, icon: <CheckSquare className="h-10 w-10 text-indigo-500" />, bg: 'bg-indigo-50' },
    { title: 'Partisipasi', value: `${stats.participationRate}%`, icon: <Percent className="h-10 w-10 text-purple-500" />, bg: 'bg-purple-50' },
  ];

  return (
    <div>
      <div className="flex items-center mb-8">
        <Activity className="h-8 w-8 text-indigo-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Monitoring Voting Real-time</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} opacity-50`}></div>
              <div className="relative z-10 mb-4">
                {stat.icon}
              </div>
              <p className="text-4xl font-black text-gray-900 mb-2 relative z-10">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider relative z-10">{stat.title}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Sistem</h2>
        <div className="flex items-center text-sm text-gray-600">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Terhubung ke database. Data diperbarui secara otomatis.
        </div>
      </div>
    </div>
  );
}
