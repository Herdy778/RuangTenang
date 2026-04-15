import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ nama_lengkap: '', email: '', password: '' });

  async function doLogin(e) {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const res = await API.post('/login', loginForm);

    const user = res.data.data;

    // CEK ROLE ADMIN
    if (user.role !== 'admin') {
      setError('Akses ditolak. Hanya admin yang dapat login.');
      setLoading(false);
      return;
    }

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(user));

    navigate('/dashboard');

  } catch (err) {
    setError(err.response?.data?.pesan || 'Login gagal.');
  } finally {
    setLoading(false);
  }
}

  async function doRegister(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await API.post('/register', regForm);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data));
      setSuccess('Registrasi berhasil! Mengalihkan...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const msg = err.response?.data?.errors?.email?.[0] || err.response?.data?.pesan || 'Registrasi gagal.';
      setError(msg);
    } finally { setLoading(false); }
  }

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} className="blob" />
      <div style={styles.blob2} className="blob blob-delay" />
      <div style={styles.blob3} className="blob blob-delay-2" />

      <div style={styles.card} className="card-enter">
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🌿</div>
          <span style={styles.logoText}>RuangTenang</span>
        </div>

        <div style={styles.tabBar}>
          <button style={{...styles.tabBtn, ...(tab==='login' ? styles.tabActive : {})}} onClick={() => { setTab('login'); setError(''); }}>Masuk</button>
          <button style={{...styles.tabBtn, ...(tab==='register' ? styles.tabActive : {})}} onClick={() => { setTab('register'); setError(''); }}>Daftar</button>
        </div>

        {error && <div style={styles.alertError}>⚠️ {error}</div>}
        {success && <div style={styles.alertSuccess}>✅ {success}</div>}

        {tab === 'login' && (
          <form onSubmit={doLogin}>
            <div style={styles.heading}>
              <h1 style={styles.h1}>Selamat datang<br /><em>kembali</em> 👋</h1>
              <p style={styles.subtext}>Masuk untuk melanjutkan perjalananmu</p>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} className="input-animated" type="email" placeholder="kamu@email.com"
                value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input style={styles.input} className="input-animated" type="password" placeholder="••••••••"
                value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
            </div>
            <button style={{...styles.btnPrimary, opacity: loading ? 0.7 : 1}} className="btn-animated" disabled={loading} type="submit">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
            <p style={styles.footerNote}>Belum punya akun? <span style={styles.link} onClick={() => { setTab('register'); setError(''); }}>Daftar sekarang</span></p>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={doRegister}>
            <div style={styles.heading}>
              <h1 style={styles.h1}>Mulai<br /><em>perjalananmu</em> 🌱</h1>
              <p style={styles.subtext}>Buat akun gratis dan mulai bercerita</p>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nama Lengkap</label>
              <input style={styles.input} className="input-animated" type="text" placeholder="Nama kamu"
                value={regForm.nama_lengkap} onChange={e => setRegForm({...regForm, nama_lengkap: e.target.value})} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} className="input-animated" type="email" placeholder="kamu@email.com"
                value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input style={styles.input} className="input-animated" type="password" placeholder="Min. 6 karakter"
                value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} required />
            </div>
            <button style={{...styles.btnPrimary, opacity: loading ? 0.7 : 1}} className="btn-animated" disabled={loading} type="submit">
              {loading ? 'Memproses...' : 'Buat Akun'}
            </button>
            <p style={styles.footerNote}>Sudah punya akun? <span style={styles.link} onClick={() => { setTab('login'); setError(''); }}>Masuk</span></p>
            <div style={styles.moodTags}>
              {[['😤','Burnout','#FEF3C7','#92400E'],['😰','Cemas','#EDE9FE','#5B21B6'],
                ['😢','Sedih','#DBEAFE','#1E40AF'],['😌','Netral','#F0FDF4','#166534'],
                ['🆘','Krisis','#FFE4E6','#9F1239']].map(([icon, label, bg, color]) => (
                <span key={label} style={{...styles.moodTag, background: bg, color}} className="mood-bounce">{icon} {label}</span>
              ))}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  bg: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" },
  blob1: { position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: '#C4B5FD', filter: 'blur(80px)', opacity: 0.35, top: -100, right: -100, pointerEvents: 'none' },
  blob2: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#34D399', filter: 'blur(80px)', opacity: 0.3, bottom: -80, left: -80, pointerEvents: 'none' },
  blob3: { position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: '#A78BFA', filter: 'blur(80px)', opacity: 0.25, top: '50%', left: '30%', pointerEvents: 'none' },
  card: { background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 28, width: '100%', maxWidth: 440, padding: '48px 44px', position: 'relative', zIndex: 10, boxShadow: '0 8px 40px rgba(139,92,246,0.12)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoIcon: { width: 40, height: 40, background: 'linear-gradient(135deg, #8B5CF6, #10B981)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  logoText: { fontFamily: 'Georgia, serif', fontSize: 20, color: '#18181B', fontWeight: 500 },
  tabBar: { display: 'flex', background: '#F4F4F5', borderRadius: 14, padding: 4, marginBottom: 32, gap: 4 },
  tabBtn: { flex: 1, padding: '10px', border: 'none', background: 'transparent', borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#A1A1AA', cursor: 'pointer', fontFamily: 'inherit' },
  tabActive: { background: '#FFFFFF', color: '#7C3AED', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  alertError: { background: '#FFF1F2', color: '#BE123C', border: '1px solid #FECDD3', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 16 },
  alertSuccess: { background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 16 },
  heading: { marginBottom: 24 },
  h1: { fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 500, color: '#18181B', lineHeight: 1.3, marginBottom: 6 },
  subtext: { fontSize: 14, color: '#A1A1AA', fontWeight: 300, margin: 0 },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#52525B', marginBottom: 8 },
  input: { width: '100%', padding: '13px 16px', border: '1.5px solid #E4E4E7', borderRadius: 12, fontSize: 15, color: '#18181B', background: '#FFFFFF', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  btnPrimary: { width: '100%', padding: 14, background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer', marginTop: 8, fontFamily: 'inherit' },
  footerNote: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#A1A1AA' },
  link: { color: '#8B5CF6', fontWeight: 500, cursor: 'pointer' },
  moodTags: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  moodTag: { padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
};