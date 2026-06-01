import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ nama_lengkap: '', email: '', password: '' });

  async function doLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/login', loginForm);
      const user = res.data.data;
      if (user.role !== 'admin') {
        setError('Akses ditolak. Hanya admin yang dapat masuk.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.pesan || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  }

  async function doRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/register', regForm);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data));
      setSuccess('Akun berhasil dibuat! Mengalihkan...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const msg = err.response?.data?.errors?.email?.[0] || err.response?.data?.pesan || 'Registrasi gagal.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const switchTab = (t) => { setTab(t); setError(''); setSuccess(''); };

  return (
    <div style={s.page}>
      {/* Background blobs */}
      <div style={s.blob1} className="blob" />
      <div style={s.blob2} className="blob blob-delay" />
      <div style={s.blob3} className="blob blob-delay-2" />

      {/* Centered container: split layout on large screens */}
      <div style={s.wrapper} className="card-enter">

        {/* LEFT: Branding panel */}
        <div style={s.brandPanel}>
          <div style={s.brandInner}>
            <div style={s.logoCircle}>
  <svg width="32" height="32" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="22" y1="34" x2="22" y2="25" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="22" y1="34" x2="17" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="22" y1="34" x2="27" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="17" cy="16" r="6.5" fill="white" opacity="0.95"/>
    <circle cx="27" cy="16" r="6.5" fill="white" opacity="0.95"/>
    <circle cx="22" cy="14" r="6" fill="white" opacity="0.95"/>
    <line x1="22" y1="8" x2="22" y2="23" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M9 34 Q6 28 10 25 Q15 22 17 27" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <path d="M35 34 Q38 28 34 25 Q29 22 27 27" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
  </svg>
</div>
            <h1 style={s.brandTitle}>RuangTenang</h1>
            <p style={s.brandSubtitle}>
              Platform kesehatan mental berbasis AI untuk memantau dan memahami kondisi emosionalmu.
            </p>
            <div style={s.featureList}>
              {[
                ['🧠', 'Analisis PHQ-9 berbasis AI'],
                ['💬', 'Sesi curhat dengan NLP'],
                ['📊', 'Dashboard monitoring admin'],
                ['🔒', 'Data terenkripsi & aman'],
              ].map(([icon, text]) => (
                <div key={text} style={s.featureItem}>
                  <span style={s.featureIcon}>{icon}</span>
                  <span style={s.featureText}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Form panel */}
        <div style={s.formPanel}>
          {/* Tab toggle */}
          <div style={s.tabBar}>
            <button
              style={{ ...s.tabBtn, ...(tab === 'login' ? s.tabActive : {}) }}
              onClick={() => switchTab('login')}
            >
              Masuk
            </button>
            <button
              style={{ ...s.tabBtn, ...(tab === 'register' ? s.tabActive : {}) }}
              onClick={() => switchTab('register')}
            >
              Daftar
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div style={s.alertError}>
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div style={s.alertSuccess}>
              <span>✅</span> {success}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={doLogin} style={{ animation: 'fadeInUp 0.4s ease both' }}>
              <div style={s.formHeading}>
                <h2 style={s.formTitle}>Selamat Datang Kembali</h2>
                <p style={s.formSubtitle}>Masuk untuk melanjutkan ke dashboard admin</p>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Email</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>✉️</span>
                  <input
                    style={s.input}
                    className="input-animated"
                    type="email"
                    placeholder="admin@email.com"
                    value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Password</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🔑</span>
                  <input
                    style={{ ...s.input, paddingRight: 48 }}
                    className="input-animated"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
                className="btn-animated"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <span style={s.spinnerRow}><span className="spinner" />Memproses...</span>
                ) : 'Masuk ke Dashboard'}
              </button>

              <p style={s.footerNote}>
                Belum punya akun?{' '}
                <span style={s.link} onClick={() => switchTab('register')}>
                  Daftar sekarang
                </span>
              </p>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={doRegister} style={{ animation: 'fadeInUp 0.4s ease both' }}>
              <div style={s.formHeading}>
                <h2 style={s.formTitle}>Buat Akun Baru</h2>
                <p style={s.formSubtitle}>Isi data diri untuk mendaftar sebagai admin</p>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Nama Lengkap</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>👤</span>
                  <input
                    style={s.input}
                    className="input-animated"
                    type="text"
                    placeholder="Nama kamu"
                    value={regForm.nama_lengkap}
                    onChange={e => setRegForm({ ...regForm, nama_lengkap: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Email</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>✉️</span>
                  <input
                    style={s.input}
                    className="input-animated"
                    type="email"
                    placeholder="kamu@email.com"
                    value={regForm.email}
                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Password</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🔑</span>
                  <input
                    style={{ ...s.input, paddingRight: 48 }}
                    className="input-animated"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min. 6 karakter"
                    value={regForm.password}
                    onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                    required
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
                className="btn-animated"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <span style={s.spinnerRow}><span className="spinner" />Memproses...</span>
                ) : 'Daftar Sekarang'}
              </button>

              <p style={s.footerNote}>
                Sudah punya akun?{' '}
                <span style={s.link} onClick={() => switchTab('login')}>
                  Masuk
                </span>
              </p>

              {/* Mood tags */}
              <div style={s.moodSection}>
                <p style={s.moodLabel}>Kategori yang dideteksi sistem:</p>
                <div style={s.moodTags}>
                  {[
                    ['😤', 'Burnout', 'rgba(253,186,116,0.15)', '#FCD34D'],
                    ['😰', 'Cemas', 'rgba(167,139,250,0.15)', '#C4B5FD'],
                    ['😢', 'Sedih', 'rgba(96,165,250,0.15)', '#93C5FD'],
                    ['😌', 'Netral', 'rgba(52,211,153,0.15)', '#6EE7B7'],
                    ['🆘', 'Krisis', 'rgba(251,113,133,0.15)', '#FCA5A5'],
                  ].map(([icon, label, bg, color]) => (
                    <span key={label} style={{ ...s.moodTag, background: bg, color }} className="mood-bounce">
                      {icon} {label}
                    </span>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
        }
        .input-animated:focus {
          border-color: rgba(196, 181, 253, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2) !important;
          outline: none;
        }
        @media (max-width: 768px) {
          .brand-panel-hide { display: none !important; }
          .auth-wrapper { flex-direction: column !important; max-width: 480px !important; border-radius: 24px !important; }
          .form-panel-full { border-radius: 24px !important; }
        }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1E0A3C 0%, #2D1065 30%, #3B0764 70%, #1A0533 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'DM Sans', sans-serif",
    padding: '24px 16px',
  },
  blob1: {
    position: 'fixed', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, #8B5CF6, #7C3AED)',
    filter: 'blur(90px)', opacity: 0.25, top: -150, right: -100, pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, #A855F7, #6D28D9)',
    filter: 'blur(90px)', opacity: 0.2, bottom: -100, left: -80, pointerEvents: 'none',
  },
  blob3: {
    position: 'fixed', width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, #C084FC, #9333EA)',
    filter: 'blur(80px)', opacity: 0.15, top: '40%', left: '20%', pointerEvents: 'none',
  },
  wrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: 900,
    borderRadius: 28,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
    position: 'relative',
    zIndex: 10,
  },

  // LEFT brand panel
  brandPanel: {
    flex: '0 0 42%',
    background: 'linear-gradient(160deg, rgba(139,92,246,0.35) 0%, rgba(124,58,237,0.2) 100%)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 36px',
  },
  brandInner: { display: 'flex', flexDirection: 'column', gap: 20 },
  logoCircle: {
  width: 64, height: 64, borderRadius: 20,
  background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 8px 32px rgba(139,92,246,0.5)',
},
  brandTitle: {
    fontSize: 28, fontWeight: 700, color: '#fff',
    letterSpacing: 0.3, margin: 0,
  },
  brandSubtitle: {
    fontSize: 14, color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.7, margin: 0,
  },
  featureList: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: 'rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, flexShrink: 0,
  },
  featureText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 },

  // RIGHT form panel
  formPanel: {
    flex: 1,
    padding: '40px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  tabBar: {
    display: 'flex',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 28,
    gap: 4,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  tabBtn: {
    flex: 1, padding: '10px', border: 'none',
    background: 'transparent', borderRadius: 10,
    fontSize: 14, fontWeight: 500,
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
  },
  alertError: {
    background: 'rgba(239,68,68,0.12)',
    color: '#FCA5A5',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 10, padding: '12px 16px',
    fontSize: 13, marginBottom: 16,
    display: 'flex', gap: 8, alignItems: 'center',
  },
  alertSuccess: {
    background: 'rgba(52,211,153,0.12)',
    color: '#6EE7B7',
    border: '1px solid rgba(52,211,153,0.25)',
    borderRadius: 10, padding: '12px 16px',
    fontSize: 13, marginBottom: 16,
    display: 'flex', gap: 8, alignItems: 'center',
  },
  formHeading: { marginBottom: 24 },
  formTitle: { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 6px' },
  formSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 },
  fieldGroup: { marginBottom: 16 },
  label: {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: {
    position: 'absolute', left: 14, fontSize: 16,
    pointerEvents: 'none', zIndex: 1,
  },
  input: {
    width: '100%', padding: '13px 16px 13px 44px',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 12, fontSize: 14,
    color: '#fff',
    background: 'rgba(255,255,255,0.06)',
    outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  eyeBtn: {
    position: 'absolute', right: 12,
    background: 'none', border: 'none',
    cursor: 'pointer', fontSize: 16, padding: 4,
  },
  btnPrimary: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    color: 'white', border: 'none',
    borderRadius: 12, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginTop: 8,
    fontFamily: 'inherit', letterSpacing: 0.3,
    boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
  },
  spinnerRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  footerNote: {
    textAlign: 'center', marginTop: 20,
    fontSize: 13, color: 'rgba(255,255,255,0.4)',
  },
  link: {
    color: '#C4B5FD', fontWeight: 600, cursor: 'pointer',
    textDecoration: 'underline', textDecorationColor: 'transparent',
    transition: 'color 0.2s',
  },
  moodSection: { marginTop: 24 },
  moodLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase' },
  moodTags: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  moodTag: {
    padding: '5px 12px', borderRadius: 20,
    fontSize: 12, fontWeight: 500,
    border: '1px solid rgba(255,255,255,0.08)',
  },
};