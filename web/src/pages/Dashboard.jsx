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
<<<<<<< HEAD
    const userData = localStorage.getItem('user');

    if (userData) {
      setUser(JSON.parse(userData));
    }

=======
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
    fetchJournals();
  }, []);

 const fetchJournals = async () => {
  try {
    const res = await API.get("/journals");
    
    // 🔴 INI BAGIAN RESPONSE API
    const rawData = res.data.data || res.data || [];
    
    // 🔴 MAPPING DATA DARI RESPONSE API
    const mappedData = rawData.map((item) => ({
      _id: item.id || item._id,
      hasil_mood: item.mood || item.hasil_mood || "Netral",
      teks_curhat: item.isi || item.teks_curhat || item.content || "",
      created_at: item.created_at || item.createdAt || new Date().toISOString(),
    }));
      
      setJournals(sortedData);
      
    } catch (err) {
      console.error("Error ambil jurnal:", err);
      setJournals([]);
    } finally {
      setLoading(false);
    }
  };

  async function doLogout() {
    try {
      await API.post('/logout');
    } catch (err) {
<<<<<<< HEAD
      console.error(err);
=======
      console.error("Logout error:", err);
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  }

  const moodColors = {
    Burnout: {
      bg: '#FEF3C7',
      color: '#92400E',
      emoji: '😤',
    },

    Cemas: {
      bg: '#EDE9FE',
      color: '#5B21B6',
      emoji: '😰',
    },

    Sedih: {
      bg: '#DBEAFE',
      color: '#1E40AF',
      emoji: '😢',
    },

    Netral: {
      bg: '#F0FDF4',
      color: '#166534',
      emoji: '😌',
    },

    Krisis: {
      bg: '#FFE4E6',
      color: '#9F1239',
      emoji: '🆘',
    },
  };

  // Hitung jumlah mood untuk statistik
  const moodCount = journals.reduce((acc, j) => {
    const moodName = j.hasil_mood;
    acc[moodName] = (acc[moodName] || 0) + 1;
    return acc;
  }, {});

<<<<<<< HEAD
  const dominantMood =
    Object.entries(moodCount).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || null;
=======
  const dominantMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={styles.navLogoIcon}>🌿</span>

          <span style={styles.navLogoText}>
            RuangTenang Admin
          </span>
        </div>

        <div style={styles.navLinks}>
          {/* DASHBOARD */}
          <span
            style={{
              ...styles.navLink,
              ...styles.navLinkActive,
            }}
          >
            Dashboard
          </span>

          {/* DATA USER */}
          <span
            style={styles.navLink}
            onClick={() =>
              navigate('/admin/users')
            }
          >
            Data User
          </span>

          {/* DATA JURNAL */}
          <span
            style={styles.navLink}
            onClick={() =>
              navigate('/admin/journals')
            }
          >
            Data Jurnal
          </span>

          {/* ARTIKEL */}
          <span
            style={styles.navLink}
            onClick={() =>
              navigate('/admin/articles')
            }
          >
            Artikel
          </span>

<<<<<<< HEAD
          {/* MANAJEMEN ADMIN */}
          <span
            style={styles.navLink}
            onClick={() =>
              navigate('/admin/manage')
            }
          >
            Manajemen Admin
          </span>

          {/* LOGOUT */}
          <button
            style={styles.logoutBtn}
            onClick={doLogout}
          >
=======

          <span
            style={styles.navLink}
            onClick={() => navigate('/profile')}
          >

            Profile
          </span>

          <button style={styles.logoutBtn} onClick={doLogout}>
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
            Keluar
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Dashboard Admin
          </h1>

          <p style={styles.subtitle}>
            Monitoring data pengguna dan
            analisis mood
          </p>
        </div>

<<<<<<< HEAD
        {/* STATISTIK */}
=======
        {/* STATS CARDS */}
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
        <div style={styles.statsGrid}>
          {/* TOTAL JURNAL */}
          <div style={styles.statCard}>
            <div style={styles.statNum}>
              {journals.length}
            </div>

            <div style={styles.statLabel}>
              Total Jurnal
            </div>
          </div>

          {/* MOOD DOMINAN */}
          <div
            style={{
              ...styles.statCard,
              background:
                'linear-gradient(135deg,#8B5CF6,#7C3AED)',
              color: 'white',
            }}
          >
            <div
              style={{
                ...styles.statNum,
                color: 'white',
              }}
            >
              {dominantMood
                ? `${moodColors[dominantMood]?.emoji || '😐'} ${dominantMood}`
                : '-'}
            </div>

            <div
              style={{
                ...styles.statLabel,
                color:
                  'rgba(255,255,255,0.8)',
              }}
            >
              Mood Dominan Global
            </div>
          </div>

          {/* VARIASI MOOD */}
          <div style={styles.statCard}>
            <div style={styles.statNum}>
              {Object.keys(moodCount).length}
            </div>

            <div style={styles.statLabel}>
              Variasi Mood
            </div>
          </div>
        </div>

        {/* CHART SECTION */}
        <div style={styles.section}>
<<<<<<< HEAD
          <h2 style={styles.sectionTitle}>
            Grafik Mood Semua User
          </h2>

          <MoodChart journals={journals} />
        </div>

        {/* JURNAL TERBARU */}
=======
          <h2 style={styles.sectionTitle}>Grafik Mood Semua User</h2>
          <p style={styles.chartHint}>
            Tren Mood 7 Hari - Mulai jurnal untuk melihat tren mood aktualmu ➡️
          </p>
          <MoodChart journals={journals} />
        </div>

        {/* RECENT JOURNALS SECTION */}
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Data Jurnal Terbaru User
          </h2>

          {loading ? (
            <div style={styles.loading}>
<<<<<<< HEAD
              Memuat...
=======
              <div style={styles.spinner}></div>
              <p>Memuat data jurnal...</p>
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
            </div>
          ) : journals.length === 0 ? (
            <div style={styles.emptyCard}>
              <p style={styles.emptyEmoji}>
                📝
              </p>

              <p style={styles.emptyText}>
                Belum ada jurnal dari user
              </p>
              <p style={styles.emptySubtext}>
                User akan muncul di sini setelah menulis jurnal pertama mereka
              </p>
            </div>
          ) : (
            <div style={styles.journalList}>
<<<<<<< HEAD
              {journals
                .slice(0, 5)
                .map((j) => {
                  const mood =
                    moodColors[j.hasil_mood] || {
                      bg: '#F4F4F5',
                      color: '#52525B',
                      emoji: '😐',
                    };

                  return (
                    <div
                      key={j._id}
                      style={styles.journalCard}
                    >
                      <div
                        style={
                          styles.journalHeader
                        }
                      >
                        <span
                          style={{
                            ...styles.moodBadge,
                            background:
                              mood.bg,
                            color:
                              mood.color,
                          }}
                        >
                          {mood.emoji}{' '}
                          {j.hasil_mood}
                        </span>

                        <span
                          style={
                            styles.journalDate
                          }
                        >
                          {new Date(
                            j.created_at
                          ).toLocaleDateString(
                            'id-ID'
                          )}
                        </span>
                      </div>

                      <p
                        style={
                          styles.journalText
                        }
                      >
                        {j.teks_curhat.substring(
                          0,
                          120
                        )}

                        {j.teks_curhat.length >
                        120
                          ? '...'
                          : ''}
                      </p>
                    </div>
                  );
                })}
=======
              {journals.slice(0, 5).map((j, index) => {
                const mood = moodColors[j.hasil_mood] || {
                  bg: '#F4F4F5',
                  color: '#52525B',
                  emoji: '😐',
                };

                const formattedDate = j.created_at
                  ? new Date(j.created_at).toLocaleDateString("id-ID", {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : "Tanggal tidak tersedia";

                return (
                  <div key={j._id || index} style={styles.journalCard}>
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
                        {formattedDate}
                      </span>
                    </div>

                    <p style={styles.journalText}>
                      {j.teks_curhat && j.teks_curhat.trim() !== "" 
                        ? (j.teks_curhat.length > 120 
                          ? j.teks_curhat.substring(0, 120) + "..." 
                          : j.teks_curhat)
                        : "Tidak ada catatan jurnal"}
                    </p>
                    
                    {j.teks_curhat && j.teks_curhat.length > 120 && (
                      <button style={styles.readMoreBtn}>
                        Baca selengkapnya
                      </button>
                    )}
                  </div>
                );
              })}
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
            </div>
          )}
          
          {journals.length > 5 && (
            <div style={styles.viewAllContainer}>
              <button 
                style={styles.viewAllBtn}
                onClick={() => navigate('/admin/journals')}
              >
                Lihat Semua Jurnal ({journals.length})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: '100vh',
    background: '#FAFAFA',
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  
  blob1: {
    position: 'fixed',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: '#C4B5FD',
    filter: 'blur(100px)',
    opacity: 0.2,
    top: -200,
    right: -200,
    zIndex: 0,
    pointerEvents: "none",
  },
  
  blob2: {
    position: 'fixed',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: '#34D399',
    filter: 'blur(80px)',
    opacity: 0.15,
    bottom: -100,
    left: -100,
    zIndex: 0,
    pointerEvents: "none",
  },
  
  nav: {
    position: 'sticky',
    top: 0,
<<<<<<< HEAD
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid #F4F4F5',
    padding: '0 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
=======
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid #F4F4F5",
    padding: "0 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
    height: 64,
    zIndex: 100,
  },
  
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  
  navLogoIcon: {
    fontSize: 22,
  },
  
  navLogoText: {
    fontFamily: 'Georgia, serif',
    fontSize: 18,
    fontWeight: 500,
    color: '#18181B',
  },
  
  navLinks: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  
  navLink: {
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 14,
<<<<<<< HEAD
    color: '#52525B',
    cursor: 'pointer',
=======
    color: "#52525B",
    cursor: "pointer",
    transition: "all 0.2s ease",
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
  },
  
  navLinkActive: {
    background: '#EDE9FE',
    color: '#7C3AED',
    fontWeight: 500,
  },
  
  logoutBtn: {
    marginLeft: 8,
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #E4E4E7',
    borderRadius: 8,
    fontSize: 14,
<<<<<<< HEAD
    color: '#52525B',
    cursor: 'pointer',
=======
    color: "#52525B",
    cursor: "pointer",
    transition: "all 0.2s ease",
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
  },
  
  container: {
    maxWidth: 1000,
<<<<<<< HEAD
    margin: '0 auto',
    padding: '40px 24px',
=======
    margin: "0 auto",
    padding: "40px 24px",
    position: "relative",
    zIndex: 1,
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
  },
  
  header: {
    marginBottom: 24,
  },
  
  title: {
    fontSize: 28,
    fontWeight: 600,
<<<<<<< HEAD
    color: '#18181B',
=======
    color: "#18181B",
    marginBottom: 8,
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
  },
  
  subtitle: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  
  statsGrid: {
<<<<<<< HEAD
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
=======
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
    gap: 16,
    marginBottom: 30,
  },
  
  statCard: {
    background: 'white',
    padding: 20,
    borderRadius: 16,
<<<<<<< HEAD
    border: '1px solid #F4F4F5',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.04)',
=======
    border: "1px solid #F4F4F5",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "transform 0.2s ease",
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
  },
  
  statNum: {
    fontSize: 26,
    fontWeight: 600,
  },
  
  statLabel: {
    fontSize: 13,
<<<<<<< HEAD
    color: '#71717A',
=======
    color: "#71717A",
    marginTop: 5,
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
  },
  
  section: {
    marginBottom: 30,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 14,
<<<<<<< HEAD
    color: '#18181B',
=======
    color: "#18181B",
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
  },
  
  chartHint: {
    fontSize: 13,
    color: "#A1A1AA",
    marginBottom: 16,
    fontStyle: "italic",
  },
  
  journalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  
  journalCard: {
    background: 'white',
    padding: 20,
    borderRadius: 16,
<<<<<<< HEAD
    border: '1px solid #F4F4F5',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.04)',
=======
    border: "1px solid #F4F4F5",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "all 0.2s ease",
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
  },
  
  journalHeader: {
<<<<<<< HEAD
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10,
=======
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
  },
  
  moodBadge: {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },
  
  journalDate: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  
  journalText: {
    fontSize: 14,
<<<<<<< HEAD
    color: '#52525B',
=======
    color: "#52525B",
    lineHeight: 1.5,
    marginBottom: 8,
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
  },
  
  readMoreBtn: {
    background: "none",
    border: "none",
    color: "#7C3AED",
    fontSize: 12,
    cursor: "pointer",
    padding: 0,
    marginTop: 5,
  },
  
  emptyCard: {
<<<<<<< HEAD
    background: 'white',
    padding: 40,
=======
    background: "white",
    padding: 60,
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
    borderRadius: 16,
    textAlign: 'center',
    border: '1px solid #F4F4F5',
  },
  
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  
  emptyText: {
<<<<<<< HEAD
    color: '#A1A1AA',
=======
    fontSize: 16,
    color: "#52525B",
    marginBottom: 8,
  },
  
  emptySubtext: {
    fontSize: 13,
    color: "#A1A1AA",
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
  },
  
  loading: {
    textAlign: "center",
    padding: 60,
    color: "#71717A",
    background: "white",
    borderRadius: 16,
    border: "1px solid #F4F4F5",
  },
  
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #F4F4F5",
    borderTop: "3px solid #7C3AED",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  
  viewAllContainer: {
    textAlign: "center",
    marginTop: 20,
  },
  
  viewAllBtn: {
    background: "white",
    border: "1px solid #E4E4E7",
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 14,
    color: "#7C3AED",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

<<<<<<< HEAD
  loading: {
    textAlign: 'center',
    padding: 20,
    color: '#71717A',
  },
};
=======
// Tambahkan CSS untuk animasi spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
>>>>>>> e3c5cdf1af2c0b4fb4ede83269096aa85fd366be
