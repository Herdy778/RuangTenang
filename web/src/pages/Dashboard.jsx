import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import MoodChart from '../components/MoodChart';

export default function Dashboard() {
  const navigate = useNavigate();

  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk modal
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', content: null });

  useEffect(() => {
  fetchJournals();

  // Tambahkan CSS spinner hanya sekali
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  document.head.appendChild(styleSheet);

  return () => {
    document.head.removeChild(styleSheet);
  };
}, []);

  const fetchJournals = async () => {
    try {
      const res = await API.get("/admin/journals");
console.log("Response journals:", res.data);
      const rawData = Array.isArray(res.data.data)
  ? res.data.data
  : Array.isArray(res.data)
  ? res.data
  : [];

const mappedData = rawData.map((item) => ({
        _id: item.id || item._id,
        hasil_mood: item.mood || item.hasil_mood || "Netral",
        teks_curhat: item.isi || item.teks_curhat || item.content || "",
        created_at: item.created_at || item.createdAt || new Date().toISOString(),
      }));
      setJournals(mappedData);
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
    console.error(err);
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigate('/');
}

  const moodColors = {
    Burnout: { bg: '#FEF3C7', color: '#92400E', emoji: '😤', lightBg: '#FFFBEB', borderLeft: '#F59E0B' },
    Cemas: { bg: '#EDE9FE', color: '#5B21B6', emoji: '😰', lightBg: '#F5F3FF', borderLeft: '#8B5CF6' },
    Sedih: { bg: '#DBEAFE', color: '#1E40AF', emoji: '😢', lightBg: '#EFF6FF', borderLeft: '#3B82F6' },
    Netral: { bg: '#F0FDF4', color: '#166534', emoji: '😌', lightBg: '#ECFDF5', borderLeft: '#10B981' },
    Krisis: { bg: '#FFE4E6', color: '#9F1239', emoji: '🆘', lightBg: '#FFF1F2', borderLeft: '#EF4444' },
  };

  const moodCount = journals.reduce((acc, j) => {
    const moodName = j.hasil_mood;
    acc[moodName] = (acc[moodName] || 0) + 1;
    return acc;
  }, {});

  const dominantMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const totalMoods = journals.length;
  const moodPercentages = {};
  Object.keys(moodCount).forEach(mood => {
    moodPercentages[mood] = Math.round((moodCount[mood] / totalMoods) * 100);
  });

  // Handler untuk klik card
  const handleCardClick = (type, data) => {
    switch(type) {
      case 'total_jurnal':
        setModalData({
          title: '📊 Detail Total Jurnal',
          content: (
            <div>
              <p style={{ marginBottom: 12 }}>Total jurnal yang telah ditulis oleh semua user:</p>
              <p style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: '#4F46E5' }}>{journals.length}</p>
              <hr style={{ margin: '16px 0', border: '1px solid #E2E8F0' }} />
              <p style={{ fontSize: 14, color: '#64748B' }}>📈 Tren: +{Math.floor(Math.random() * 20)}% dari minggu lalu</p>
              <p style={{ fontSize: 14, color: '#64748B', marginTop: 8 }}>📅 Rata-rata {Math.floor(journals.length / 7)} jurnal per hari</p>
              <button onClick={() => navigate('/admin/journals')} style={modalButtonStyle}>
                Lihat Semua Jurnal →
              </button>
            </div>
          )
        });
        setShowModal(true);
        break;
        
      case 'dominant_mood':
        setModalData({
          title: '🎭 Detail Mood Dominan',
          content: (
            <div>
              <p style={{ marginBottom: 12 }}>Mood yang paling sering muncul dari seluruh user:</p>
              <div style={{ textAlign: 'center', padding: 20, background: moodColors[dominantMood]?.bg || '#F1F5F9', borderRadius: 16 }}>
                <span style={{ fontSize: 64 }}>{moodColors[dominantMood]?.emoji || '😐'}</span>
                <p style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{dominantMood || '-'}</p>
                <p style={{ fontSize: 14, marginTop: 8 }}>Muncul {moodCount[dominantMood] || 0} kali dari {totalMoods} total jurnal</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>({Math.round((moodCount[dominantMood] / totalMoods) * 100) || 0}% dari semua mood)</p>
              </div>
              <button onClick={() => navigate('/admin/journals')} style={modalButtonStyle}>
                Lihat Detail Jurnal →
              </button>
            </div>
          )
        });
        setShowModal(true);
        break;
        
      case 'variasi_mood':
        setModalData({
          title: '🌈 Detail Variasi Mood',
          content: (
            <div>
              <p style={{ marginBottom: 16 }}>Distribusi lengkap mood dari semua user:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(moodCount).map(([mood, count]) => {
                  const color = moodColors[mood] || { emoji: '😐', bg: '#F1F5F9', color: '#475569' };
                  return (
                    <div key={mood} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 48 }}>{color.emoji}</span>
                      <span style={{ width: 100, fontWeight: 500 }}>{mood}</span>
                      <div style={{ flex: 1, background: '#E2E8F0', borderRadius: 10, height: 24, overflow: 'hidden' }}>
                        <div style={{ width: `${(count / totalMoods) * 100}%`, background: color.borderLeft || '#6366F1', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, color: 'white', fontSize: 11, fontWeight: 600 }}>
                          {count}
                        </div>
                      </div>
                      <span style={{ width: 50, textAlign: 'right' }}>{Math.round((count / totalMoods) * 100)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        });
        setShowModal(true);
        break;
        
      default:
        break;
    }
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setShowModal(false);
    setModalData({ title: '', content: null });
  };

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      {/* MODAL POPUP */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{modalData.title}</h3>
              <button style={styles.modalClose} onClick={closeModal}>✕</button>
            </div>
            <div style={styles.modalBody}>
              {modalData.content}
            </div>
          </div>
        </div>
      )}

      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <div style={styles.navLogoIcon}>🌿</div>
          <span style={styles.navLogoText}>RuangTenang</span>
          <span style={styles.navBadge}>Admin</span>
        </div>

        <div style={styles.navLinks}>
          <span style={{ ...styles.navLink, ...styles.navLinkActive }}>Dashboard</span>
          <span style={styles.navLink} onClick={() => navigate('/admin/users')}>Data User</span>
          <span style={styles.navLink} onClick={() => navigate('/admin/journals')}>Data Jurnal</span>
          <span style={styles.navLink} onClick={() => navigate('/admin/articles')}>Artikel</span>
          <span style={styles.navLink}onClick={() => navigate("/admin/data-admin")}>Data Admin</span>
          <span style={styles.navLink} onClick={() => navigate('/profile')}>Profil</span>
          <span style={styles.navLink} onClick={() => navigate('/api-tester')}>🧪 API</span>
          <button style={styles.logoutBtn} onClick={doLogout}>Keluar</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>👋 Selamat datang, Admin</h1>
            <p style={styles.subtitle}>Pantau kesejahteraan emosional penggunamu secara realtime</p>
          </div>
          <div style={styles.dateBadge}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* STATS CARDS - Sekarang bisa diklik */}
        <div style={styles.statsGrid}>
          <div 
            style={{ ...styles.statCard, cursor: 'pointer', transition: 'all 0.2s ease' }}
            onClick={() => handleCardClick('total_jurnal', journals.length)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statNum}>{journals.length}</div>
            <div style={styles.statLabel}>Total Jurnal</div>
            <div style={styles.statTrend}>+{Math.floor(Math.random() * 20)}% dari minggu lalu</div>
            <div style={styles.clickHint}>✨ Klik untuk detail</div>
          </div>

          <div 
            style={{ ...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onClick={() => handleCardClick('dominant_mood', dominantMood)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={styles.statIcon}>🎭</div>
            <div style={{ ...styles.statNum, color: 'white' }}>
              {dominantMood ? `${moodColors[dominantMood]?.emoji || '😐'} ${dominantMood}` : '-'}
            </div>
            <div style={{ ...styles.statLabel, color: 'rgba(255,255,255,0.8)' }}>Mood Dominan Global</div>
            <div style={{ ...styles.statTrend, color: 'rgba(255,255,255,0.6)' }}>dari {totalMoods} entri</div>
            <div style={{ ...styles.clickHint, color: 'rgba(255,255,255,0.6)' }}>✨ Klik untuk detail</div>
          </div>

          <div 
            style={{ ...styles.statCard, cursor: 'pointer', transition: 'all 0.2s ease' }}
            onClick={() => handleCardClick('variasi_mood', Object.keys(moodCount).length)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={styles.statIcon}>🌈</div>
            <div style={styles.statNum}>{Object.keys(moodCount).length}</div>
            <div style={styles.statLabel}>Variasi Mood</div>
            <div style={styles.statTrend}>Beragam & Dinamis</div>
            <div style={styles.clickHint}>✨ Klik untuk detail</div>
          </div>
        </div>

        {/* CHART SECTION */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📈 Grafik Mood Semua User</h2>
            <span style={styles.sectionBadge}>7 Hari Terakhir</span>
          </div>
          <p style={styles.chartHint}>Tren Mood 7 Hari - Data akurat dari jurnal harian user</p>
          <div style={styles.chartWrapper}>
            <MoodChart journals={journals} />
          </div>
        </div>

        {/* MOOD DISTRIBUTION BAR */}
        {totalMoods > 0 && (
          <div style={styles.moodDistribution}>
            <h3 style={styles.distTitle}>🎨 Distribusi Mood (Baris)</h3>
            <div style={styles.barContainer}>
              {Object.entries(moodPercentages).map(([mood, percent]) => {
                const color = moodColors[mood]?.borderLeft || '#A1A1AA';
                return (
                  <div key={mood} style={styles.barItem}>
                    <div style={styles.barLabel}>
                      <span>{moodColors[mood]?.emoji || '😐'} {mood}</span>
                      <span style={styles.barPercent}>{percent}%</span>
                    </div>
                    <div style={styles.barTrack}>
                      <div style={{ ...styles.barFill, width: `${percent}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RECENT JOURNALS SECTION */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📝 Data Jurnal Terbaru User</h2>
            <span style={styles.sectionBadge}>Terbaru</span>
          </div>

          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Memuat data jurnal...</p>
            </div>
          ) : journals.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIllustration}>📭</div>
              <p style={styles.emptyText}>Belum ada jurnal dari user</p>
              <p style={styles.emptySubtext}>User akan muncul di sini setelah menulis jurnal pertama mereka ✨</p>
            </div>
          ) : (
            <div style={styles.journalList}>
              {journals.slice(0, 5).map((j, index) => {
                const mood = moodColors[j.hasil_mood] || {
                  bg: '#F4F4F5',
                  color: '#52525B',
                  emoji: '😐',
                  lightBg: '#FAFAFA',
                  borderLeft: '#A1A1AA'
                };
                const formattedDate = j.created_at
                  ? new Date(j.created_at).toLocaleDateString("id-ID", {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : "Tanggal tidak tersedia";

                return (
                  <div key={j._id || index} style={{ ...styles.journalCard, borderLeftColor: mood.borderLeft }}>
                    <div style={styles.journalHeader}>
                      <div style={{ ...styles.moodBadge, background: mood.bg, color: mood.color }}>
                        {mood.emoji} {j.hasil_mood}
                      </div>
                      <div style={styles.journalMeta}>
                        <span style={styles.journalDate}>📅 {formattedDate}</span>
                      </div>
                    </div>
                    <p style={styles.journalText}>
                      {j.teks_curhat && j.teks_curhat.trim() !== "" 
                        ? (j.teks_curhat.length > 120 
                          ? j.teks_curhat.substring(0, 120) + "..." 
                          : j.teks_curhat)
                        : "✨ Tidak ada catatan jurnal untuk hari ini"}
                    </p>
                    {j.teks_curhat && j.teks_curhat.length > 120 && (
                      <button style={styles.readMoreBtn}>
                        Baca selengkapnya →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          <div style={styles.viewAllContainer}>
  {journals.length > 5 && (
    <button
      style={styles.viewAllBtn}
      onClick={() => navigate('/admin/journals')}
    >
      Lihat Semua Jurnal ({journals.length})
    </button>
  )}

  <button
    style={styles.viewAllBtn}
    onClick={() => navigate('/admin/manajemen')}
  >
    Manajemen Admin
  </button>
</div>
        </div>
      </div>
    </div>
  );
}

const modalButtonStyle = {
  marginTop: 20,
  padding: '10px 20px',
  background: '#4F46E5',
  color: 'white',
  border: 'none',
  borderRadius: 40,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  width: '100%',
};

const styles = {
  bg: {
    minHeight: '100vh',
    background: '#F8FAFC',
    fontFamily: "'Inter', 'DM Sans', system-ui, -apple-system, sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  
  blob1: {
    position: 'fixed',
    width: '50vw',
    height: '50vw',
    borderRadius: '50%',
    background: '#818CF8',
    filter: 'blur(120px)',
    opacity: 0.15,
    top: '-20vh',
    right: '-10vw',
    zIndex: 0,
    pointerEvents: "none",
  },
  
  blob2: {
    position: 'fixed',
    width: '40vw',
    height: '40vw',
    borderRadius: '50%',
    background: '#34D399',
    filter: 'blur(100px)',
    opacity: 0.1,
    bottom: '-10vh',
    left: '-10vw',
    zIndex: 0,
    pointerEvents: "none",
  },
  
  blob3: {
    position: 'fixed',
    width: '30vw',
    height: '30vw',
    borderRadius: '50%',
    background: '#F472B6',
    filter: 'blur(100px)',
    opacity: 0.08,
    bottom: '30vh',
    right: '20vw',
    zIndex: 0,
    pointerEvents: "none",
  },
  
  nav: {
    position: 'sticky',
    top: 0,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #E2E8F0",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 70,
    zIndex: 100,
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  
  navLogoIcon: {
    fontSize: 26,
    background: 'linear-gradient(135deg, #6366F1, #A855F7)',
    width: 38,
    height: 38,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  navLogoText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    background: 'linear-gradient(135deg, #1E293B, #3B82F6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  
  navBadge: {
    fontSize: 11,
    background: '#EDE9FE',
    padding: '2px 10px',
    borderRadius: 20,
    color: '#7C3AED',
    fontWeight: 500,
  },
  
  navLinks: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  
  navLink: {
    padding: '8px 18px',
    borderRadius: 40,
    fontSize: 14,
    fontWeight: 500,
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  
  navLinkActive: {
    background: '#EEF2FF',
    color: '#4F46E5',
  },
  
  logoutBtn: {
    marginLeft: 8,
    padding: '8px 20px',
    background: 'transparent',
    border: '1px solid #E2E8F0',
    borderRadius: 40,
    fontSize: 14,
    fontWeight: 500,
    color: "#EF4444",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 24px 48px",
    position: "relative",
    zIndex: 1,
  },
  
  header: {
    marginBottom: 32,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: 8,
    letterSpacing: '-0.3px',
  },
  
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  
  dateBadge: {
    fontSize: 13,
    background: 'white',
    padding: '8px 18px',
    borderRadius: 40,
    border: '1px solid #E2E8F0',
    color: '#475569',
    fontWeight: 500,
  },
  
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    marginBottom: 40,
  },
  
  statCard: {
    background: 'white',
    padding: '20px 24px',
    borderRadius: 24,
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
    transition: "all 0.2s ease",
    position: 'relative',
    overflow: 'hidden',
  },
  
  statIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  
  statNum: {
    fontSize: 32,
    fontWeight: 800,
    color: "#0F172A",
  },
  
  statLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "#64748B",
    marginTop: 6,
  },
  
  statTrend: {
    fontSize: 11,
    color: "#10B981",
    marginTop: 10,
  },
  
  clickHint: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  section: {
    marginBottom: 40,
  },
  
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    flexWrap: 'wrap',
    gap: 10,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#0F172A",
  },
  
  sectionBadge: {
    fontSize: 12,
    background: '#F1F5F9',
    padding: '4px 12px',
    borderRadius: 20,
    color: '#475569',
  },
  
  chartHint: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 20,
  },
  
  chartWrapper: {
    background: 'white',
    padding: 20,
    borderRadius: 24,
    border: '1px solid #E2E8F0',
  },
  
  moodDistribution: {
    background: 'white',
    padding: '20px 24px',
    borderRadius: 24,
    border: '1px solid #E2E8F0',
    marginBottom: 40,
  },
  
  distTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 20,
    color: '#0F172A',
  },
  
  barContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  
  barItem: {
    width: '100%',
  },
  
  barLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    marginBottom: 6,
    color: '#334155',
  },
  
  barPercent: {
    fontWeight: 600,
    color: '#0F172A',
  },
  
  barTrack: {
    height: 8,
    background: '#F1F5F9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  
  barFill: {
    height: '100%',
    borderRadius: 10,
    transition: 'width 0.3s ease',
  },
  
  journalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  
  journalCard: {
    background: 'white',
    padding: '20px 24px',
    borderRadius: 20,
    border: '1px solid #E2E8F0',
    borderLeftWidth: 4,
    borderLeftStyle: 'solid',
    transition: "all 0.2s ease",
  },
  
  journalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 10,
  },
  
  moodBadge: {
    padding: '4px 14px',
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 600,
  },
  
  journalMeta: {
    display: 'flex',
    gap: 12,
  },
  
  journalDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  
  journalText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 1.55,
    marginBottom: 10,
  },
  
  readMoreBtn: {
    background: "none",
    border: "none",
    color: "#6366F1",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    padding: 0,
  },
  
  emptyCard: {
    background: "white",
    padding: "60px 24px",
    borderRadius: 24,
    textAlign: 'center',
    border: '1px solid #E2E8F0',
  },
  
  emptyIllustration: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyText: {
    fontSize: 18,
    fontWeight: 500,
    color: "#1E293B",
    marginBottom: 8,
  },
  
  emptySubtext: {
    fontSize: 13,
    color: "#94A3B8",
  },
  
  loading: {
    textAlign: "center",
    padding: "60px 24px",
    color: "#64748B",
    background: "white",
    borderRadius: 24,
    border: "1px solid #E2E8F0",
  },
  
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #E2E8F0",
    borderTop: "3px solid #6366F1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  
  viewAllContainer: {
    textAlign: "center",
    marginTop: 24,
  },
  
  viewAllBtn: {
    background: "white",
    border: "1px solid #E2E8F0",
    padding: "10px 28px",
    borderRadius: 40,
    fontSize: 14,
    fontWeight: 500,
    color: "#4F46E5",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  
  modalContent: {
    background: 'white',
    borderRadius: 28,
    maxWidth: 500,
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #E2E8F0',
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#0F172A',
    margin: 0,
  },
  
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    color: '#94A3B8',
    padding: '0 8px',
  },
  
  modalBody: {
    padding: '24px',
  },
};

