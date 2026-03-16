import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserCheck, CheckSquare, Percent } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRegistered: 0,
    confirmedVoters: 0,
    alreadyVoted: 0,
    participationRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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
    { title: 'Total Pemilih Terdaftar', value: stats.totalRegistered, icon: <Users className="h-8 w-8 text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Pemilih Terkonfirmasi', value: stats.confirmedVoters, icon: <UserCheck className="h-8 w-8 text-green-500" />, bg: 'bg-green-50' },
    { title: 'Sudah Memilih', value: stats.alreadyVoted, icon: <CheckSquare className="h-8 w-8 text-indigo-500" />, bg: 'bg-indigo-50' },
    { title: 'Persentase Partisipasi', value: `${stats.participationRate}%`, icon: <Percent className="h-8 w-8 text-purple-500" />, bg: 'bg-purple-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8 font-syne">Admin Dashboard</h1>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>{stat.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
