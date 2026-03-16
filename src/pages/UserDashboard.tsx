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
                      <p className="card-system-name-v">E-VOTING SMABA</p>
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
                        TERDAFTAR DI DATABASE
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
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
                  <p className="text-lg font-bold text-white">{qrData?.is_confirmed ? 'Terkonfirmasi' : 'Menunggu Konfirmasi'}</p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center">
                <div className={`w-4 h-4 rounded-full mr-4 shadow-sm ${qrData?.has_voted ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Voting</p>
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
                    Download Kartu
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
        setUser(authUser);

        // Fetch user's QR data from users_qr table
        const { data: dbData, error: dbError } = await supabase
          .from('users_qr')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (dbError) {
          throw dbError;
        }

        if (!dbData) {
          // If user exists in Auth but not in users_qr (e.g. registered before table was created)
          // Let's auto-generate their QR data now
          const email = authUser.email || '';
          const namePart = email.split('@')[0] || 'user';
          const last3 = namePart.length >= 3 ? namePart.slice(-3) : namePart;
          const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
          const qrValue = `${randomDigits}${last3}`;

          const { data: newData, error: insertError } = await supabase
            .from('users_qr')
            .insert([
              {
                user_id: authUser.id,
                email: email,
                qr_code_value: qrValue,
                is_confirmed: false,
                has_voted: false
              }
            ])
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }
          
          setQrData(newData);
        } else {
          setQrData(dbData);
        }
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError('Gagal memuat data pengguna. Pastikan Anda sudah terdaftar dengan benar.');
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
      // Create a canvas from the ticket element
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2, // 2 is enough and avoids memory issues
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Kartu-Pemilih-${qrData.qr_code_value}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error generating PNG:', err);
      alert('Gagal mengunduh Kartu Pemilih. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-gray-600">Memuat data Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Pemilih</h1>
            <p className="text-sm text-gray-500">E-Voting System</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Professional Ticket Design (This is what gets downloaded) */}
            <div className="flex justify-center mb-8 overflow-x-auto pb-4">
              {/* Ref attached here for PDF generation. Fixed dimensions ensure perfect PDF output */}
              <div 
                ref={ticketRef} 
                className="bg-white flex-shrink-0 rounded-2xl shadow-xl overflow-hidden flex relative border border-gray-200"
                style={{ width: '800px', height: '400px' }}
              >
                {/* Left Color Bar / Header */}
                <div className="w-1/3 bg-indigo-600 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <ShieldCheck className="h-12 w-12 mb-4 text-indigo-200" />
                    <h2 className="text-3xl font-black tracking-tight leading-tight">KARTU<br/>PEMILIH</h2>
                    <p className="text-indigo-200 mt-2 text-sm font-medium tracking-wide uppercase">E-Voting System</p>
                  </div>
                  <div className="relative z-10 mt-auto">
                    <p className="text-xs text-indigo-200 opacity-90 leading-relaxed">
                      Dokumen ini adalah identitas sah Anda. Harap tunjukkan QR Code ini kepada panitia saat pemilihan.
                    </p>
                  </div>
                  {/* Decorative circles */}
                  <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500 rounded-full opacity-50"></div>
                  <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-700 rounded-full opacity-50"></div>
                </div>
                
                {/* Right Content */}
                <div className="w-2/3 p-8 flex items-center justify-between bg-white">
                  <div className="flex-1 pr-8">
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                      <p className="text-2xl font-black text-gray-900 uppercase tracking-wide leading-normal py-1" title={user?.user_metadata?.full_name}>
                        {user?.user_metadata?.full_name || 'Nama Tidak Tersedia'}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Terdaftar</p>
                      <p className="text-lg font-medium text-gray-700 leading-normal py-1" title={user?.email}>
                        {user?.email || 'Email Tidak Tersedia'}
                      </p>
                    </div>
                    <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Instruksi Pemilihan</p>
                      <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                        Saat ingin melakukan pemilihan, tunjukkan kartu ini kepada panitia di tempat pemilihan.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl shadow-sm border border-gray-100 z-10 relative">
                    {qrData?.qr_code_value ? (
                      <QRCodeCanvas 
                        value={qrData.qr_code_value} 
                        size={160}
                        level="H"
                        includeMargin={false}
                      />
                    ) : (
                      <div className="w-[160px] h-[160px] bg-gray-50 flex items-center justify-center rounded-xl border border-dashed border-gray-300">
                        <span className="text-gray-400 text-xs font-medium">QR Tidak Tersedia</span>
                      </div>
                    )}
                    <p className="mt-4 font-mono text-sm font-bold text-gray-900 tracking-widest bg-gray-100 px-4 py-1.5 rounded-md">
                      {qrData?.qr_code_value || '----------'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Indicators (Visible on Dashboard only) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center">
                <div className={`w-4 h-4 rounded-full mr-4 shadow-sm ${qrData?.is_confirmed ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Konfirmasi</p>
                  <p className="text-lg font-bold text-gray-900">{qrData?.is_confirmed ? 'Terkonfirmasi' : 'Menunggu Konfirmasi'}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center">
                <div className={`w-4 h-4 rounded-full mr-4 shadow-sm ${qrData?.has_voted ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Voting</p>
                  <p className="text-lg font-bold text-gray-900">{qrData?.has_voted ? 'Sudah Memilih' : 'Belum Memilih'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={downloadQRCode}
                disabled={downloading || !qrData}
                className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${downloading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Menyiapkan PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Download Kartu Pemilih (PNG)
                  </>
                )}
              </button>
            </div>

            {/* Notice */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Informasi Penting</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Halaman ini hanya untuk mengunduh Kartu Pemilih Anda. Proses pemberian suara (voting) dilakukan pada sistem terpisah di lokasi pemilihan atau melalui tautan khusus (<strong>/vote</strong>).
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
