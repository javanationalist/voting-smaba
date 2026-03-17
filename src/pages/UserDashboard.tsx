import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import { LogOut, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

interface UserQRData {
  id: string;
  user_id: string;
  email: string;
  qr_code_value: string;
  is_confirmed: boolean;
  has_voted: boolean;
}

// ─── Card drawing constants (logical px, before scale) ────────────────────────
const CARD_W = 900;
const CARD_H = 420;
const LEFT_W = 300;
const CARD_R = 24; // corner radius

// ─── Helpers ─────────────────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

// Shield + checkmark icon
function drawShieldIcon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, fillColor: string
) {
  const s = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(s, s);
  // Shield fill
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.moveTo(12, 2); ctx.lineTo(22, 6); ctx.lineTo(22, 12);
  ctx.bezierCurveTo(22, 17.5, 17.5, 21.5, 12, 23);
  ctx.bezierCurveTo(6.5, 21.5, 2, 17.5, 2, 12);
  ctx.lineTo(2, 6); ctx.closePath(); ctx.fill();
  // Checkmark
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(8, 12); ctx.lineTo(11, 15); ctx.lineTo(16, 9);
  ctx.stroke();
  ctx.restore();
}

// Outline shield + check for badge
function drawShieldOutline(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
) {
  const s = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(s, s);
  ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(12, 2); ctx.lineTo(22, 6); ctx.lineTo(22, 12);
  ctx.bezierCurveTo(22, 17.5, 17.5, 21.5, 12, 23);
  ctx.bezierCurveTo(6.5, 21.5, 2, 17.5, 2, 12);
  ctx.lineTo(2, 6); ctx.closePath(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, 12); ctx.lineTo(11, 15); ctx.lineTo(16, 9);
  ctx.stroke();
  ctx.restore();
}

// Alert circle icon
function drawAlertCircle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
) {
  const s = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(s, s);
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(12, 12, 10, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12, 8); ctx.lineTo(12, 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12, 16); ctx.lineTo(12.01, 16); ctx.stroke();
  ctx.restore();
}

// ─── Main card drawing function ───────────────────────────────────────────────
async function buildCardCanvas(
  nama: string,
  email: string,
  cardId: string,
  dateStr: string,
  qrSource: HTMLCanvasElement,
  scale = 3
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width  = CARD_W * scale;
  canvas.height = CARD_H * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // Clip everything to rounded card shape
  ctx.save();
  roundRect(ctx, 0, 0, CARD_W, CARD_H, CARD_R);
  ctx.clip();

  // ── White right background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // ── Left gradient
  const leftGrad = ctx.createLinearGradient(0, 0, LEFT_W * 0.7, CARD_H);
  leftGrad.addColorStop(0,    '#3730a3');
  leftGrad.addColorStop(0.30, '#312e81');
  leftGrad.addColorStop(0.65, '#1e1b4b');
  leftGrad.addColorStop(1,    '#13104a');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(0, 0, LEFT_W, CARD_H);

  // Decorative circles (clipped to left panel)
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, LEFT_W, CARD_H); ctx.clip();
  const circles: [number, number, number, string][] = [
    [LEFT_W + 10, -70, 160, 'rgba(255,255,255,0.10)'],
    [-45, CARD_H + 20, 100, 'rgba(255,255,255,0.08)'],
    [LEFT_W / 2, CARD_H / 2, 70, 'rgba(255,255,255,0.06)'],
  ];
  for (const [cx, cy, r, col] of circles) {
    ctx.strokeStyle = col; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();

  // ── Left: logo box
  const PAD = 28;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  roundRect(ctx, PAD, PAD, 48, 48, 12);
  ctx.fill();
  drawShieldIcon(ctx, PAD + 24, PAD + 24, 28, 'rgba(255,255,255,0.9)');

  // ── Left: KARTU PEMILIH
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 38px 'Syne', sans-serif`;
  ctx.fillText('VOTERS',   PAD, 134);
  ctx.fillText('CARD', PAD, 174);

  // Teal divider
  const dg = ctx.createLinearGradient(PAD, 0, PAD + 38, 0);
  dg.addColorStop(0, '#2dd4bf'); dg.addColorStop(1, 'rgba(45,212,191,0)');
  ctx.fillStyle = dg;
  ctx.fillRect(PAD, 183, 38, 3);

  // E-VOTING SYSTEM
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `600 10.5px 'Syne', sans-serif`;
  ctx.letterSpacing = '3.5px';
  ctx.fillText('E-VOTING SMABA', PAD, 205);
  ctx.letterSpacing = '0px';

  // ID KARTU
  ctx.fillStyle = 'rgba(255,255,255,0.40)';
  ctx.font = `600 9px 'DM Sans', sans-serif`;
  ctx.letterSpacing = '2px';
  ctx.fillText('ID KARTU', PAD, CARD_H - 44);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(255,255,255,0.70)';
  ctx.font = `400 12px 'DM Sans', monospace`;
  ctx.fillText(cardId, PAD, CARD_H - 27);

  // ── Instruction bar (bottom of right side)
  const BAR_H  = 44;
  const barY   = CARD_H - BAR_H;
  const barGrd = ctx.createLinearGradient(LEFT_W, 0, CARD_W, 0);
  barGrd.addColorStop(0, '#ede9fe'); barGrd.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = barGrd;
  ctx.fillRect(LEFT_W, barY, CARD_W - LEFT_W, BAR_H);
  ctx.strokeStyle = 'rgba(86,83,232,0.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(LEFT_W, barY); ctx.lineTo(CARD_W, barY); ctx.stroke();

  // Icon + text — all baseline-aligned at barY + BAR_H/2 + 4 (text baseline)
  const barTxtY = barY + Math.round(BAR_H / 2) + 4;
  const iconCY  = barY + Math.round(BAR_H / 2);
  drawAlertCircle(ctx, LEFT_W + 24, iconCY, 15, '#4338ca');

  ctx.fillStyle = '#3730a3';
  ctx.font      = `700 11px 'DM Sans', sans-serif`;
  const labelTxt  = 'INFORMASI: ';
  ctx.fillText(labelTxt, LEFT_W + 40, barTxtY);
  const labelW = ctx.measureText(labelTxt).width;

  ctx.fillStyle = '#4338ca';
  ctx.font      = `400 11px 'DM Sans', sans-serif`;
  ctx.fillText('Tunjukkan kartu ini kepada panitia di tempat pemilihan untuk melakukan pemilihan.', LEFT_W + 40 + labelW, barTxtY);

  // ── Right: info fields
  const INFO_X   = LEFT_W + 32;
  const INFO_TOP = 30;
  const lineH    = 20;
  const groupGap = 14;

  function drawLabelValue(label: string, value: string, valueColor: string, y: number) {
    ctx.fillStyle = '#9396b4'; ctx.font = `600 9.5px 'DM Sans', sans-serif`;
    ctx.letterSpacing = '1.8px';
    ctx.fillText(label.toUpperCase(), INFO_X, y);
    ctx.letterSpacing = '0px';
    ctx.fillStyle = valueColor; ctx.font = `700 15.5px 'Syne', sans-serif`;
    ctx.fillText(value, INFO_X, y + lineH);
  }

  let fy = INFO_TOP + 18;
  drawLabelValue('Nama Lengkap',       nama,    '#16182b', fy); fy += lineH + groupGap + 16;
  drawLabelValue('Email Terdaftar',    email,   '#2d2a8a', fy); fy += lineH + groupGap + 16;
  drawLabelValue('Dicetak', dateStr, '#16182b', fy); fy += lineH + groupGap + 14;

  // TERVERIFIKASI badge
  const badgeLabel = 'TERVERIFIKASI';
  ctx.font = `700 9.5px 'DM Sans', sans-serif`; ctx.letterSpacing = '1.5px';
  const badgeTxtW = ctx.measureText(badgeLabel).width;
  ctx.letterSpacing = '0px';
  const BADGE_H   = 24;
  const BADGE_PAD = 10;
  const ICON_W    = 18;
  const badgeW    = ICON_W + BADGE_PAD + badgeTxtW + BADGE_PAD;
  const badgeX    = INFO_X;
  const badgeTop  = fy - 2;

  ctx.fillStyle   = 'rgba(16,185,129,0.10)';
  ctx.strokeStyle = 'rgba(16,185,129,0.28)'; ctx.lineWidth = 1;
  roundRect(ctx, badgeX, badgeTop, badgeW, BADGE_H, 100);
  ctx.fill(); ctx.stroke();

  drawShieldOutline(ctx, badgeX + BADGE_PAD + 1, badgeTop + BADGE_H / 2, 13, '#059669');

  ctx.fillStyle = '#059669'; ctx.font = `700 9.5px 'DM Sans', sans-serif`;
  ctx.letterSpacing = '1.5px';
  ctx.fillText(badgeLabel, badgeX + ICON_W + BADGE_PAD, badgeTop + BADGE_H / 2 + 3.5);
  ctx.letterSpacing = '0px';

  // ── QR code
  const QR_SIZE  = 160;
  const QR_INNER = QR_SIZE - 16; // 8px padding each side
  const qrX      = CARD_W - QR_SIZE - 32;
  const qrY      = (barY - QR_SIZE) / 2;

  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#e2e4f3'; ctx.lineWidth = 2;
  roundRect(ctx, qrX, qrY, QR_SIZE, QR_SIZE, 10);
  ctx.fill(); ctx.stroke();
  ctx.drawImage(qrSource, qrX + 8, qrY + 8, QR_INNER, QR_INNER);

  ctx.fillStyle = '#9396b4'; ctx.font = `700 8.5px 'DM Sans', sans-serif`;
  ctx.letterSpacing = '2.5px'; ctx.textAlign = 'center';
  ctx.fillText('SCAN QR CODE', qrX + QR_SIZE / 2, qrY + QR_SIZE + 16);
  ctx.textAlign = 'left'; ctx.letterSpacing = '0px';

  ctx.restore(); // end card clip

  // Subtle border overlay
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
  roundRect(ctx, 0.5, 0.5, CARD_W - 1, CARD_H - 1, CARD_R);
  ctx.stroke();

  return canvas;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [user, setUser]               = useState<any>(null);
  const [qrData, setQrData]           = useState<UserQRData | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Hidden high-res QR canvas — used as pixel source when drawing the card
  const hiddenQrRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) { navigate('/login'); return; }
        setUser(authUser);

        const { data: dbData, error: dbError } = await supabase
          .from('users_qr').select('*').eq('user_id', authUser.id).maybeSingle();
        if (dbError) throw dbError;

        if (!dbData) {
          const email    = authUser.email || '';
          const namePart = email.split('@')[0] || 'user';
          const last3    = namePart.length >= 3 ? namePart.slice(-3) : namePart;
          const qrValue  = `${Math.floor(1000000000 + Math.random() * 9000000000)}${last3}`;
          const { data: newData, error: insertError } = await supabase
            .from('users_qr')
            .insert([{ user_id: authUser.id, email, qr_code_value: qrValue, is_confirmed: false, has_voted: false }])
            .select().single();
          if (insertError) throw insertError;
          setQrData(newData);
        } else {
          setQrData(dbData);
        }
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError('Gagal memuat data pengguna. Periksa koneksi internet dan pastikan sinyal stabil.');
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

  const downloadCard = async () => {
    if (!qrData) return;
    setDownloading(true);
    try {
      const qrEl = hiddenQrRef.current;
      if (!qrEl) throw new Error('QR canvas not ready');

      const nama    = user?.user_metadata?.full_name || 'Nama Tidak Tersedia';
      const email   = user?.email || 'Email Tidak Tersedia';
      const cardId  = qrData.qr_code_value;
      const dateStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

      // Build card at 3× — always 2700×1260 px regardless of device/viewport
      const output = await buildCardCanvas(nama, email, cardId, dateStr, qrEl, 3);

      const link    = document.createElement('a');
      link.href     = output.toDataURL('image/png', 1.0);
      link.download = `Kartu-Pemilih-${cardId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      alert('Gagal mengunduh Kartu Pemilih. Coba lagi.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-voters flex flex-col justify-center items-center">
        <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
        <p className="mt-4 text-gray-400">Memuat data...</p>
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
          <span>Dashboard</span>
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
            AKTIF
          </div>
          <h1 className="dash-title-v">Kartu Pemilih <em>Digital</em></h1>
          <p className="dash-sub-v">Tunjukkan kepada panitia saat pemilihan.</p>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-200 z-10">
            {error}
          </div>
        ) : (
          <>
            {/* ── Visible preview card (pure CSS, for display only) ─────────── */}
            <div className="card-container-v">
              <div className="voters-card-v" id="votersCard">
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
                      <p className="card-system-name-v">E-VOTING SMABA</p>
                    </div>
                    <div className="card-id-label-v">ACCOUNT ID</div>
                    <div className="card-id-value-v">
                      {qrData?.qr_code_value || '----------'}
                    </div>
                  </div>
                </div>

                <div className="card-right-v">
                  <div className="card-right-top-v">
                    <div className="card-info-v">
                      <div className="card-field">
                        <span className="card-field-label-v">Nama</span>
                        <span className="card-field-value-v">
                          {user?.user_metadata?.full_name || 'Nama Belum Didaftarkan'}
                        </span>
                      </div>
                      <div className="card-field">
                        <span className="card-field-label-v">Email</span>
                        <span className="card-field-value-v card-email-v">
                          {user?.email || 'Email Belum Didaftarkan'}
                        </span>
                      </div>
                      <div className="card-field">
                        <span className="card-field-label-v">Tanggal Dicetak</span>
                        <span className="card-field-value-v">
                          {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="card-status-badge-v">
                        <ShieldCheck className="w-3 h-3" style={{ flexShrink: 0 }} />
                        <span>TERDAFTAR DI DATABASE</span>
                      </div>
                    </div>

                    <div className="card-qr-wrap-v">
                      <div className="qr-frame-v">
                        {qrData?.qr_code_value && (
                          <QRCodeCanvas value={qrData.qr_code_value} size={144} level="M" />
                        )}
                      </div>
                      <p className="qr-caption-v">E-Voting SMABA</p>
                    </div>
                  </div>

                  <div className="card-instruction-bar-v">
                    <AlertCircle className="w-4 h-4" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>INFORMASI:</strong> Tunjukkan kartu ini kepada panitia di tempat pemilihan untuk melakukan pemilihan.
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-glow-v"></div>
            </div>

            {/*
              Hidden high-res QR canvas (480px) rendered off-screen.
              This is the pixel source for Canvas 2D drawing on download.
              Must stay in DOM so bitmap data is accessible.
            */}
            {qrData?.qr_code_value && (
              <div
                aria-hidden="true"
                style={{ position: 'fixed', top: '-9999px', left: '-9999px', pointerEvents: 'none' }}
              >
                <QRCodeCanvas
                  value={qrData.qr_code_value}
                  size={480}
                  level="M"
                  ref={(node) => {
                    // QRCodeCanvas exposes the underlying <canvas> via ref
                    hiddenQrRef.current = node as unknown as HTMLCanvasElement;
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[900px] z-10">
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center">
                <div className={`w-4 h-4 rounded-full mr-4 ${qrData?.is_confirmed ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Konfirmasi</p>
                  <p className="text-lg font-bold text-white">{qrData?.is_confirmed ? 'Terkonfirmasi' : 'Belum Konfirmasi Panitia'}</p>
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
              <button onClick={downloadCard} disabled={downloading} className="btn-download-v">
                {downloading ? 'Memproses...' : 'Download Kartu'}
              </button>
              <button className="btn-secondary-v" onClick={handleLogout}>Daftar Akun Baru</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
