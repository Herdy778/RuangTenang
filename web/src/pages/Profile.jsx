import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  const moodColors = {
    Burnout: { bg: '#FEF3C7', color: '#92400E', emoji: '😤' },
    Cemas:   { bg: '#EDE9FE', color: '#5B21B6', emoji: '😰' },
    Sedih:   { bg: '#DBEAFE', color: '#1E40AF', emoji: '😢' },
    Netral:  { bg: '#F0FDF4', color: '#166534', emoji: '😌' },
    Krisis:  { bg: '#FFE4E6', color: '#9F1239', emoji: '🆘' },
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchJournals();
  }, []);

  async function fetchJournals() {
    try {
      const res = await API.get('/journals');
      setJournals(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function doLogout() {
    try { await API.post('/logout'); } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  }

  const moodCount = journals.reduce((acc, j) => {
    acc[j.hasil_mood] = (acc[j.hasil_mood] || 0) + 1;
    return acc;
  }, {});

  const totalMoods = Object.values(moodCount).reduce((a, b) => a + b, 0);
  const dominantMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const initials = user?.nama_lengkap?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'RT';

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} className="blob" />
      <div style={styles.blob2} className="blob blob-delay" />

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navLogo} onClick={() => navigate('/dashboard')}>
          <span>🌿</span>
          <span style={styles.navLogoText}>RuangTenang</span>
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/journal')}>Jurnal</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/articles')}>Artikel</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/breathing')}>Relaksasi</span>
          <span style={{...styles.navLink, ...styles.navLinkActive}} className="nav-link-animated">Profil</span>
        </div>
      </nav>

      <div style={styles.container} className="page-enter">

        {/* Profile Card */}
        <div style={styles.profileCard} className="hover-lift">
          <div style={styles.avatarWrap}>
            <div style={styles.avatar}>{initials}</div>
            <div style={styles.avatarBadge}>🌿</div>
          </div>
          <div style={styles.profileInfo}>
            <h1 style={styles.profileName}>{user?.nama_lengkap || 'Pengguna'}</h1>
            <p style={styles.profileEmail}>{user?.email || ''}</p>
            <span style={styles.roleBadge}>{user?.role || 'mahasiswa'}</span>
          </div>
          <button style={styles.logoutBtn} className="btn-animated" onClick={doLogout}>
            Keluar 👋
          </button>
        </div>

        {/* Stats Row */}
        <div style={styles.statsRow} className="stagger">
          <div style={styles.statCard} className="hover-card">
            <div style={styles.statEmoji}>📝</div>
            <div style={styles.statNum}>{journals.length}</div>
            <div style={styles.statLabel}>Total Jurnal</div>
          </div>
          <div style={styles.statCard} className="hover-card">
            <div style={styles.statEmoji}>🎭</div>
            <div style={styles.statNum}>{Object.keys(moodCount).length}</div>
            <div style={styles.statLabel}>Variasi Mood</div>
          </div>
          <div style={styles.statCard} className="hover-card">
            <div style={styles.statEmoji}>
              {dominantMood ? moodColors[dominantMood]?.emoji : '—'}
            </div>
            <div style={styles.statNum}>{dominantMood || '—'}</div>
            <div style={styles.statLabel}>Mood Dominan</div>
          </div>
          <div style={styles.statCard} className="hover-card">
            <div style={styles.statEmoji}>📅</div>
            <div style={styles.statNum}>
              {journals.length > 0
                ? new Date(journals[0].created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})
                : '—'}
            </div>
            <div style={styles.statLabel}>Jurnal Terakhir</div>
          </div>
        </div>

        <div style={styles.twoCol}>
          {/* Mood Distribution */}
          <div style={styles.card} className="hover-lift">
            <h2 style={styles.cardTitle}>Distribusi Mood 🎭</h2>
            {loading ? (
              <p style={styles.emptyText}>Memuat...</p>
            ) : Object.keys(moodCount).length === 0 ? (
              <p style={styles.emptyText}>Belum ada data mood.</p>
            ) : (
              <div style={styles.moodList} className="stagger">
                {Object.entries(moodCount).sort((a, b) => b[1] - a[1]).map(([mood, count]) => {
                  const m = moodColors[mood] || { bg: '#F4F4F5', color: '#52525B', emoji: '😐' };
                  const pct = Math.round((count / totalMoods) * 100);
                  return (
                    <div key={mood} style={styles.moodRow}>
                      <div style={styles.moodRowLeft}>
                        <span style={{...styles.moodBadge, background: m.bg, color: m.color}}>
                          {m.emoji} {mood}
                        </span>
                        <span style={styles.moodCount}>{count}x</span>
                      </div>
                      <div style={styles.progressBg}>
                        <div style={{ ...styles.progressFill, width: `${pct}%`, background: m.color }}
                          className="progress-animated" />
                      </div>
                      <span style={styles.pctText}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Akun */}
          <div style={styles.card} className="hover-lift">
            <h2 style={styles.cardTitle}>Info Akun 👤</h2>
            <div style={styles.infoList}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Nama Lengkap</span>
                <span style={styles.infoValue}>{user?.nama_lengkap || '—'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email</span>
                <span style={styles.infoValue}>{user?.email || '—'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Role</span>
                <span style={styles.infoValue}>{user?.role || '—'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Bergabung</span>
                <span style={styles.infoValue}>
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})
                    : '—'}
                </span>
              </div>
            </div>
            <div style={styles.ctaBox}>
              <p style={styles.ctaText}>Mau cerita lagi hari ini? 💬</p>
              <button style={styles.ctaBtn} className="btn-animated" onClick={() => navigate('/journal')}>
                Buka Jurnal →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  bg: { minHeight: '100vh', background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  blob1: { position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: '#C4B5FD', filter: 'blur(100px)', opacity: 0.15, top: -100, right: -100, pointerEvents: 'none', zIndex: 0 },
  blob2: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#34D399', filter: 'blur(80px)', opacity: 0.12, bottom: -100, left: -100, pointerEvents: 'none', zIndex: 0 },
  nav: { position: 'sticky', top: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F4F4F5', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, zIndex: 100 },
  navLogo: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  navLogoText: { fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 500, color: '#18181B' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 8 },
  navLink: { padding: '8px 16px', borderRadius: 8, fontSize: 14, color: '#52525B', cursor: 'pointer' },
  navLinkActive: { background: '#EDE9FE', color: '#7C3AED', fontWeight: 500 },
  container: { maxWidth: 900, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 },
  profileCard: { background: 'white', borderRadius: 24, padding: '32px 36px', border: '1px solid #F4F4F5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 600, color: 'white' },
  avatarBadge: { position: 'absolute', bottom: 0, right: 0, fontSize: 18 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 24, fontWeight: 600, color: '#18181B', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: '#A1A1AA', marginBottom: 10 },
  roleBadge: { padding: '4px 12px', background: '#EDE9FE', color: '#7C3AED', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  logoutBtn: { padding: '10px 20px', background: 'transparent', border: '1.5px solid #E4E4E7', borderRadius: 10, fontSize: 14, color: '#52525B', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: 'white', borderRadius: 16, padding: '20px', border: '1px solid #F4F4F5', textAlign: 'center' },
  statEmoji: { fontSize: 24, marginBottom: 8 },
  statNum: { fontSize: 20, fontWeight: 600, color: '#18181B', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#A1A1AA' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: 'white', borderRadius: 20, padding: '28px', border: '1px solid #F4F4F5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: 18, fontWeight: 600, color: '#18181B', marginBottom: 20 },
  moodList: { display: 'flex', flexDirection: 'column', gap: 14 },
  moodRow: { display: 'flex', alignItems: 'center', gap: 10 },
  moodRowLeft: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 },
  moodBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  moodCount: { fontSize: 12, color: '#A1A1AA' },
  progressBg: { flex: 1, height: 6, background: '#F4F4F5', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10, transition: 'width 0.5s ease' },
  pctText: { fontSize: 12, color: '#A1A1AA', minWidth: 32, textAlign: 'right' },
  infoList: { display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 24 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F4F4F5' },
  infoLabel: { fontSize: 13, color: '#A1A1AA' },
  infoValue: { fontSize: 13, color: '#18181B', fontWeight: 500 },
  ctaBox: { background: '#F5F3FF', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  ctaText: { fontSize: 14, color: '#52525B' },
  ctaBtn: { padding: '8px 16px', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  emptyText: { fontSize: 14, color: '#A1A1AA', textAlign: 'center', padding: '20px 0' },
};