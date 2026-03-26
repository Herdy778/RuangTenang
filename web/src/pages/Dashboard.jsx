import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import MoodChart from '../components/MoodChart';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await API.post('/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  }

  const moodColors = {
    Burnout: { bg: '#FEF3C7', color: '#92400E', emoji: '😤' },
    Cemas:   { bg: '#EDE9FE', color: '#5B21B6', emoji: '😰' },
    Sedih:   { bg: '#DBEAFE', color: '#1E40AF', emoji: '😢' },
    Netral:  { bg: '#F0FDF4', color: '#166534', emoji: '😌' },
    Krisis:  { bg: '#FFE4E6', color: '#9F1239', emoji: '🆘' },
  };

  const moodCount = journals.reduce((acc, j) => {
    acc[j.hasil_mood] = (acc[j.hasil_mood] || 0) + 1;
    return acc;
  }, {});

  const dominantMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} className="blob" />
      <div style={styles.blob2} className="blob blob-delay" />

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={styles.navLogoIcon}>🌿</span>
          <span style={styles.navLogoText}>RuangTenang</span>
        </div>
        <div style={styles.navLinks}>
          <span style={{...styles.navLink, ...styles.navLinkActive}} className="nav-link-animated">Dashboard</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/journal')}>Jurnal</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/articles')}>Artikel</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/breathing')}>Relaksasi</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/profile')}>Profil</span>
          <button style={styles.logoutBtn} className="btn-animated" onClick={doLogout}>Keluar</button>
        </div>
      </nav>

      <div style={styles.container} className="page-enter">
        {/* Greeting */}
        <div style={styles.greeting}>
          <h1 style={styles.greetTitle}>
            Halo, <em>{user?.nama_lengkap?.split(' ')[0] || 'Kamu'}</em> 👋
          </h1>
          <p style={styles.greetSub}>Bagaimana perasaanmu hari ini?</p>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid} className="stagger">
          <div style={styles.statCard} className="hover-card">
            <div style={styles.statNum}>{journals.length}</div>
            <div style={styles.statLabel}>Total Jurnal</div>
          </div>
          <div style={{...styles.statCard, background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: 'white'}} className="hover-card">
            <div style={{...styles.statNum, color: 'white'}}>
              {dominantMood ? `${moodColors[dominantMood]?.emoji} ${dominantMood}` : '—'}
            </div>
            <div style={{...styles.statLabel, color: 'rgba(255,255,255,0.8)'}}>Mood Dominan</div>
          </div>
          <div style={styles.statCard} className="hover-card">
            <div style={styles.statNum}>{Object.keys(moodCount).length}</div>
            <div style={styles.statLabel}>Variasi Mood</div>
          </div>
        </div>

        {/* Mood Chart */}
        <div style={styles.section}>
          <MoodChart journals={journals} />
        </div>

        {/* CTA */}
        <div style={styles.ctaCard} className="hover-lift">
          <div>
            <h3 style={styles.ctaTitle}>Mau curhat hari ini? 💬</h3>
            <p style={styles.ctaSub}>Ceritakan perasaanmu, AI akan membantu menganalisis mood dan memberikan rekomendasi artikel.</p>
          </div>
          <button style={styles.ctaBtn} className="btn-animated" onClick={() => navigate('/journal')}>
            Mulai Jurnal →
          </button>
        </div>

        {/* Recent Journals */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Jurnal Terbaru</h2>
          {loading ? (
            <p style={styles.emptyText}>Memuat...</p>
          ) : journals.length === 0 ? (
            <div style={styles.emptyCard}>
              <p style={styles.emptyEmoji}>📝</p>
              <p style={styles.emptyText}>Belum ada jurnal. Yuk mulai curhat!</p>
            </div>
          ) : (
            <div style={styles.journalList} className="stagger">
              {journals.slice(0, 5).map((j) => {
                const mood = moodColors[j.hasil_mood] || { bg: '#F4F4F5', color: '#52525B', emoji: '😐' };
                return (
                  <div key={j._id} style={styles.journalCard} className="hover-card">
                    <div style={styles.journalHeader}>
                      <span style={{...styles.moodBadge, background: mood.bg, color: mood.color}}>
                        {mood.emoji} {j.hasil_mood}
                      </span>
                      <span style={styles.journalDate}>
                        {new Date(j.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <p style={styles.journalText}>{j.teks_curhat.substring(0, 120)}{j.teks_curhat.length > 120 ? '...' : ''}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  bg: { minHeight: '100vh', background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  blob1: { position: 'fixed', width: 600, height: 600, borderRadius: '50%', background: '#C4B5FD', filter: 'blur(100px)', opacity: 0.2, top: -200, right: -200, pointerEvents: 'none', zIndex: 0 },
  blob2: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#34D399', filter: 'blur(80px)', opacity: 0.15, bottom: -100, left: -100, pointerEvents: 'none', zIndex: 0 },
  nav: { position: 'sticky', top: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F4F4F5', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, zIndex: 100 },
  navLogo: { display: 'flex', alignItems: 'center', gap: 8 },
  navLogoIcon: { fontSize: 22 },
  navLogoText: { fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 500, color: '#18181B' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 8 },
  navLink: { padding: '8px 16px', borderRadius: 8, fontSize: 14, color: '#52525B', cursor: 'pointer', fontWeight: 400 },
  navLinkActive: { background: '#EDE9FE', color: '#7C3AED', fontWeight: 500 },
  logoutBtn: { marginLeft: 8, padding: '8px 16px', background: 'transparent', border: '1px solid #E4E4E7', borderRadius: 8, fontSize: 14, color: '#52525B', cursor: 'pointer', fontFamily: 'inherit' },
  container: { maxWidth: 900, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 },
  greeting: { marginBottom: 32 },
  greetTitle: { fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 500, color: '#18181B', marginBottom: 8 },
  greetSub: { fontSize: 16, color: '#A1A1AA' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: 'white', borderRadius: 16, padding: '24px', border: '1px solid #F4F4F5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  statNum: { fontSize: 28, fontWeight: 600, color: '#18181B', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#A1A1AA' },
  ctaCard: { background: 'linear-gradient(135deg, #EDE9FE, #F5F3FF)', borderRadius: 20, padding: '28px 32px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, border: '1px solid #DDD6FE' },
  ctaTitle: { fontSize: 18, fontWeight: 600, color: '#18181B', marginBottom: 6 },
  ctaSub: { fontSize: 14, color: '#52525B', maxWidth: 480, lineHeight: 1.6 },
  ctaBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 600, color: '#18181B', marginBottom: 16 },
  emptyCard: { background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', border: '1px solid #F4F4F5' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#A1A1AA' },
  journalList: { display: 'flex', flexDirection: 'column', gap: 12 },
  journalCard: { background: 'white', borderRadius: 16, padding: '20px 24px', border: '1px solid #F4F4F5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  journalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  moodBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  journalDate: { fontSize: 12, color: '#A1A1AA' },
  journalText: { fontSize: 14, color: '#52525B', lineHeight: 1.6, margin: 0 },
};