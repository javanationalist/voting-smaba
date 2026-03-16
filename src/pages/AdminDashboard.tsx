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
}        setUser(authUser);

        const { data: dbData, error: dbError } = await supabase
          .from('users_qr')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (dbError) throw dbError;

        if (!dbData) {
          const email = authUser.email || '';
          const namePart = email.split('@')[0] || 'user';
          const last3 = namePart.length >= 3 ? namePart.slice(-3) : namePart;
          const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
          const qrValue = `${randomDigits}${last3}`;

          const { data: newData, error: insertError } = await supabase
            .from('users_qr')
            .insert([{
              user_id: authUser.id,
              email: email,
              qr_code_value: qrValue,
              is_confirmed: false,
              has_voted: false
            }])
            .select()
            .single();

          if (insertError) throw insertError;
          setQrData(newData);
        } else {
          setQrData(dbData);
        }
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError('Gagal memuat data pengguna.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const downloadQRCode = async () => {
    if (!ticketRef.current || !qrData) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Kartu-Pemilih-${qrData.qr_code_value}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating PNG:', err);
      alert('Gagal mengunduh Kartu Pemilih.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-voters flex flex-col justify-center items-center">
        <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
        <p className="mt-4 text-gray-400">Memuat data Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-voters relative overflow-hidden">
      {/* Background blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      {/* Topbar */}
      <nav className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon small bg-indigo-600 flex items-center justify-center rounded-lg p-1">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span>E-Voting System</span>
        </div>
        <button className="btn-logout-v" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </button>
      </nav>

      <div className="dashboard-wrapper-v">
        {/* Page header */}
        <div className="dash-header-v">
          <div className="status-pill-v">
            <span className="status-dot-v"></span>
            TERDAFTAR
          </div>
          <h1 className="dash-title-v">Kartu Pemilih <em>Digital</em></h1>
          <p className="dash-sub-v">Kartu Anda siap digunakan. Tunjukkan kepada panitia saat pemilihan.</p>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-200 z-10">
            {error}
          </div>
        ) : (
          <>
            {/* THE CARD */}
            <div className="card-container-v">
              <div className="voters-card-v" id="votersCard" ref={ticketRef}>
                {/* LEFT SIDE */}
                <div className="card-left-v">
                  <div className="deco-circle c1"></div>
                  <div className="deco-circle c2"></div>
                  <div className="deco-circle c3"></div>
                  <div className="card-noise"></div>

                  <div className="card-left-content-v">
                    <div className="card-logo-area">
                      <div className="card-logo-icon-v">
                        <ShieldCheck className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    <div className="card-title-block-v">
                      <h2 className="card-main-title-v">KARTU<br/>PEMILIH</h2>
                      <div className="card-divider-v"></div>
                      <p className="card-system-name-v">E-VOTING SYSTEM</p>
                    </div>

                    <div className="card-id-label-v">ID KARTU</div>
                    <div className="card-id-value-v" id="cardId">
                      {qrData?.qr_code_value || '----------'}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="card-right-v">
                  <div className="card-right-top-v">
                    <div className="card-info-v">
                      <div className="card-field">
                        <span className="card-field-label-v">Nama Lengkap</span>
                        <span className="card-field-value-v" id="cardNama">
                          {user?.user_metadata?.full_name || 'Nama Tidak Tersedia'}
                        </span>
                      </div>
                      <div className="card-field">
                        <span className="card-field-label-v">Email Terdaftar</span>
                        <span className="card-field-value-v card-email-v" id="cardEmail">
                          {user?.email || 'Email Tidak Tersedia'}
                        </span>
                      </div>
                      <div className="card-field">
                        <span className="card-field-label-v">Tanggal Registrasi</span>
                        <span className="card-field-value-v" id="cardDate">
                          {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="card-status-badge-v">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        TERVERIFIKASI
                      </div>
                    </div>

                    <div className="card-qr-wrap-v">
                      <div className="qr-frame-v">
                        {qrData?.qr_code_value ? (
                          <QRCodeCanvas 
                            value={qrData.qr_code_value} 
                            size={144}
                            level="M"
                            includeMargin={false}
                          />
                        ) : (
                          <div className="w-[144px] h-[144px] bg-gray-50 flex items-center justify-center rounded-xl border border-dashed border-gray-300">
                            <span className="text-gray-400 text-xs font-medium">QR Tidak Tersedia</span>
                          </div>
                        )}
                      </div>
                      <p className="qr-caption-v">SCAN QR CODE</p>
                    </div>
                  </div>

                  <div className="card-instruction-bar-v">
                    <AlertCircle className="w-4 h-4" />
                    <span><strong>INSTRUKSI PEMILIHAN:</strong> Tunjukkan kartu ini kepada panitia di tempat pemilihan.</span>
                  </div>
                </div>
              </div>
              <div className="card-glow-v"></div>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[900px] z-10">
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center">
                <div className={`w-4 h-4 rounded-full mr-4 shadow-sm ${qrData?.is_confirmed ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Konfirmasi</p>
                  <p className="text-lg font-bold text-white">{qrData?.is_confirmed ? 'Terkonfirmasi' : 'Menunggu Konfirmasi'}</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center">
                <div className={`w-4 h-4 rounded-full mr-4 shadow-sm ${qrData?.has_voted ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Voting</p>
                  <p className="text-lg font-bold text-white">{qrData?.has_voted ? 'Sudah Memilih' : 'Belum Memilih'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="dash-actions-v">
              <button
                onClick={downloadQRCode}
                disabled={downloading || !qrData}
                className="btn-download-v"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Download Kartu Pemilih (PNG)
                  </>
                )}
              </button>

              <button className="btn-secondary-v" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Daftar Akun Baru
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
