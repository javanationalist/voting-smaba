import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Download, LogOut, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

interface UserQRData {
  id: string;
  user_id: string;
  email: string;
  qr_code_value: string;
  is_confirmed: boolean;
  has_voted: boolean;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [qrData, setQrData] = useState<UserQRData | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          navigate('/login');
          return;
        }
        
        setUser(authUser);

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
        setError('Gagal memuat data pengguna. Pastikan koneksi internet stabil.');
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
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

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
            <div className="card-container-v">
              <div className="voters-card-v" id="votersCard" ref={ticketRef}>
                <div className="card-left-v">
                  <div className="deco-circle c1"></div>
                  <div className="deco-circle c2"></div>
                  <div className="deco-circle c3"></div>
                  <div className="card-noise"></div>
                  <div className="card-left-content-v">
                    <div className="card-logo-icon-v">
                      <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <div className="card-title-block-v">
                      <h2 className="card-main-title-v">KARTU<br/>PEMILIH</h2>
                      <div className="card-divider-v"></div>
                      <p className="card-system-name-v">E-VOTING SYSTEM</p>
                    </div>
                    <div className="card-id-label-v">ID KARTU</div>
                    <div className="card-id-value-v">
                      {qrData?.qr_code_value || '----------'}
                    </div>
                  </div>
                </div>

                <div className="card-right-v">
                  <div className="card-right-top-v">
                    <div className="card-info-v">
                      <div className="card-field">
                        <span className="card-field-label-v">Nama Lengkap</span>
                        <span className="card-field-value-v">
                          {user?.user_metadata?.full_name || 'Nama Tidak Tersedia'}
                        </span>
                      </div>
                      <div className="card-field">
                        <span className="card-field-label-v">Email Terdaftar</span>
                        <span className="card-field-value-v card-email-v">
                          {user?.email || 'Email Tidak Tersedia'}
                        </span>
                      </div>
                      <div className="card-field">
                        <span className="card-field-label-v">Tanggal Registrasi</span>
                        <span className="card-field-value-v">
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
                        {qrData?.qr_code_value && (
                          <QRCodeCanvas value={qrData.qr_code_value} size={144} level="M" />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[900px] z-10">
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center">
                <div className={`w-4 h-4 rounded-full mr-4 ${qrData?.is_confirmed ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Konfirmasi</p>
                  <p className="text-lg font-bold text-white">{qrData?.is_confirmed ? 'Terkonfirmasi' : 'Menunggu Konfirmasi'}</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center">
                <div className={`w-4 h-4 rounded-full mr-4 ${qrData?.has_voted ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Voting</p>
                  <p className="text-lg font-bold text-white">{qrData?.has_voted ? 'Sudah Memilih' : 'Belum Memilih'}</p>
                </div>
              </div>
            </div>

            <div className="dash-actions-v">
              <button onClick={downloadQRCode} disabled={downloading} className="btn-download-v">
                {downloading ? 'Memproses...' : 'Download Kartu Pemilih (PNG)'}
              </button>
              <button className="btn-secondary-v" onClick={handleLogout}>Daftar Akun Baru</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
