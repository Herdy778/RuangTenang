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
    await API.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  const moodColors = {
    Burnout: { bg: '#FEF3C7', color: '#92400E', emoji: '😤' },
    Cemas: { bg: '#EDE9FE', color: '#5B21B6', emoji: '😰' },
    Sedih: { bg: '#DBEAFE', color: '#1E40AF', emoji: '😢' },
    Netral: { bg: '#F0FDF4', color: '#166534', emoji: '😌' },
    Krisis: { bg: '#FFE4E6', color: '#9F1239', emoji: '🆘' },
  };

  const moodCount = journals.reduce((acc, j) => {
    acc[j.hasil_mood] = (acc[j.hasil_mood] || 0) + 1;
    return acc;
  }, {});

  const dominantMood =
    Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={styles.navLogoIcon}>🌿</span>
          <span style={styles.navLogoText}>RuangTenang Admin</span>
        </div>

        <div style={styles.navLinks}>
          <span style={{ ...styles.navLink, ...styles.navLinkActive }}>
            Dashboard
          </span>

          <span
            style={styles.navLink}
            onClick={() => navigate('/admin/users')}
          >
            Data User
          </span>

          <span
            style={styles.navLink}
            onClick={() => navigate('/admin/journals')}
          >
            Data Jurnal
          </span>

          <span
            style={styles.navLink}
            onClick={() => navigate('/admin/articles')}
          >
            Artikel
          </span>

          <button style={styles.logoutBtn} onClick={doLogout}>
            Keluar
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Dashboard Admin</h1>
          <p style={styles.subtitle}>
            Monitoring data pengguna dan analisis mood
          </p>
        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNum}>{journals.length}</div>
            <div style={styles.statLabel}>Total Jurnal</div>
          </div>

          <div
            style={{
              ...styles.statCard,
              background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)',
              color: 'white'
            }}
          >
            <div style={{ ...styles.statNum, color: 'white' }}>
              {dominantMood
                ? `${moodColors[dominantMood]?.emoji} ${dominantMood}`
                : '-'}
            </div>
            <div style={{ ...styles.statLabel, color: 'rgba(255,255,255,0.8)' }}>
              Mood Dominan Global
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNum}>
              {Object.keys(moodCount).length}
            </div>
            <div style={styles.statLabel}>Variasi Mood</div>
          </div>
        </div>

        {/* CHART */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Grafik Mood Semua User</h2>
          <MoodChart journals={journals} />
        </div>

        {/* RECENT JOURNAL */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Data Jurnal Terbaru User
          </h2>

          {loading ? (
            <div style={styles.loading}>Memuat...</div>
          ) : journals.length === 0 ? (
            <div style={styles.emptyCard}>
              <p style={styles.emptyEmoji}>📝</p>
              <p style={styles.emptyText}>
                Belum ada jurnal dari user
              </p>
            </div>
          ) : (
            <div style={styles.journalList}>
              {journals.slice(0, 5).map((j) => {
                const mood =
                  moodColors[j.hasil_mood] || {
                    bg: '#F4F4F5',
                    color: '#52525B',
                    emoji: '😐',
                  };

                return (
                  <div key={j._id} style={styles.journalCard}>
                    <div style={styles.journalHeader}>
                      <span
                        style={{
                          ...styles.moodBadge,
                          background: mood.bg,
                          color: mood.color,
                        }}
                      >
                        {mood.emoji} {j.hasil_mood}
                      </span>

                      <span style={styles.journalDate}>
                        {new Date(j.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    <p style={styles.journalText}>
                      {j.teks_curhat.substring(0, 120)}
                      {j.teks_curhat.length > 120 ? '...' : ''}
                    </p>
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
  bg: {
    minHeight: "100vh",
    background: "#FAFAFA",
    fontFamily: "'DM Sans', sans-serif",
  },

  blob1: {
    position: "fixed",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "#C4B5FD",
    filter: "blur(100px)",
    opacity: 0.2,
    top: -200,
    right: -200,
  },

  blob2: {
    position: "fixed",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "#34D399",
    filter: "blur(80px)",
    opacity: 0.15,
    bottom: -100,
    left: -100,
  },

  nav: {
    position: "sticky",
    top: 0,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid #F4F4F5",
    padding: "0 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    zIndex: 100,
  },

  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  navLogoIcon: {
    fontSize: 22,
  },

  navLogoText: {
    fontFamily: "Georgia, serif",
    fontSize: 18,
    fontWeight: 500,
    color: "#18181B",
  },

  navLinks: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  navLink: {
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 14,
    color: "#52525B",
    cursor: "pointer",
  },

  navLinkActive: {
    background: "#EDE9FE",
    color: "#7C3AED",
    fontWeight: 500,
  },

  logoutBtn: {
    marginLeft: 8,
    padding: "8px 16px",
    background: "transparent",
    border: "1px solid #E4E4E7",
    borderRadius: 8,
    fontSize: 14,
    color: "#52525B",
    cursor: "pointer",
  },

  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "40px 24px",
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: 600,
    color: "#18181B",
  },

  subtitle: {
    fontSize: 14,
    color: "#A1A1AA",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 16,
    marginBottom: 30,
  },

  statCard: {
    background: "white",
    padding: 20,
    borderRadius: 16,
    border: "1px solid #F4F4F5",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },

  statNum: {
    fontSize: 26,
    fontWeight: 600,
  },

  statLabel: {
    fontSize: 13,
    color: "#71717A",
  },

  section: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 14,
    color: "#18181B"
  },

  journalList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  journalCard: {
    background: "white",
    padding: 20,
    borderRadius: 16,
    border: "1px solid #F4F4F5",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },

  journalHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  moodBadge: {
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },

  journalDate: {
    fontSize: 12,
    color: "#A1A1AA",
  },

  journalText: {
    fontSize: 14,
    color: "#52525B",
  },

  emptyCard: {
    background: "white",
    padding: 40,
    borderRadius: 16,
    textAlign: "center",
    border: "1px solid #F4F4F5",
  },

  emptyEmoji: {
    fontSize: 32,
  },

  emptyText: {
    color: "#A1A1AA",
  },

  loading:{
    textAlign:"center",
    padding:20,
    color:"#71717A"
  }
};