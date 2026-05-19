import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import toast, { Toaster } from 'react-hot-toast';

export default function AdminJournals() {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [articles, setArticles] = useState(null);
  
  // State untuk modal statistik
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsModalData, setStatsModalData] = useState({ title: '', content: null });

  useEffect(() => {
    fetchJournals();
  }, []);

  const getFilteredJournals = () => {
    let filtered = [...journals];
    if (searchTerm) {
      filtered = filtered.filter(j => 
        j.teks_curhat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.user_nama?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (moodFilter !== "all") {
      filtered = filtered.filter(j => j.hasil_mood === moodFilter);
    }
    return filtered;
  };

  const filteredJournals = getFilteredJournals();
  const totalPages = Math.ceil(filteredJournals.length / itemsPerPage);
  const paginatedJournals = filteredJournals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, moodFilter]);

  const fetchArticles = async (mood) => {
    try {
      setArticles(null);
      const res = await API.get(`/articles/mood/${mood.trim()}`);
      const data = res.data?.data || res.data?.articles || [];
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setArticles([]);
    }
  };

  // ✅ FIX: URL dan nama field disesuaikan dengan route Laravel
  const sendRecommendation = async (journalId, articleId) => {
    try {
      await API.post(`/admin/journals/send-article`, {
        journal_id: journalId,
        article_id: articleId,
      });
      toast.success("Rekomendasi berhasil dikirim!");
      setShowRecommendModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal mengirim rekomendasi");
    }
  };

  async function fetchJournals() {
  try {
    const res = await API.get("/admin/journals");
    const rawData = res.data.data || [];
    
    const mappedData = rawData.map((item) => {
      let userName = item.user_nama;
      
      if (!userName || userName === "User Tidak Diketahui") {
        if (item.nama_lengkap) userName = item.nama_lengkap;
        else if (item.user?.nama_lengkap) userName = item.user.nama_lengkap;
        else if (item.user_id?.nama_lengkap) userName = item.user_id.nama_lengkap;
        else userName = "User";
      }
      
      return {
        ...item,
        user_nama: userName,
        display_name: userName
      };
    });
    
    setJournals(mappedData);
    
  } catch (err) {
    console.error(err);
    toast.error("Gagal memuat data jurnal");
  } finally {
    setLoading(false);
  }
}

  async function updateStatus(id, status) {
    try {
      await API.put(`/journals/${id}/status`, { status });
      toast.success(`Status berhasil diubah menjadi ${status}`);
      fetchJournals();
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengubah status");
    }
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm("⚠️ Hapus jurnal ini? Data tidak dapat dikembalikan.");
    if (!confirmDelete) return;
    try {
      await API.delete(`/admin/journals/${id}`);
      toast.success("Jurnal berhasil dihapus");
      fetchJournals();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus jurnal");
    }
  }

  async function doLogout() {
    await API.post("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  const moodColors = {
    Burnout: { bg: "#FEF3C7", color: "#92400E", emoji: "😤", borderLeft: "#F59E0B", description: "Kelelahan mental dan fisik akibat tekanan berkepanjangan" },
    Cemas: { bg: "#EDE9FE", color: "#5B21B6", emoji: "😰", borderLeft: "#8B5CF6", description: "Perasaan gelisah, khawatir berlebih, dan tidak tenang" },
    Sedih: { bg: "#DBEAFE", color: "#1E40AF", emoji: "😢", borderLeft: "#3B82F6", description: "Perasaan kehilangan motivasi dan semangat" },
    Netral: { bg: "#F0FDF4", color: "#166534", emoji: "😌", borderLeft: "#10B981", description: "Kondisi emosional yang stabil dan seimbang" },
    Krisis: { bg: "#FFE4E6", color: "#9F1239", emoji: "🆘", borderLeft: "#EF4444", description: "Kondisi darurat yang membutuhkan perhatian segera" },
  };

  const moodStats = {
    total: journals.length,
    Burnout: journals.filter(j => j.hasil_mood === "Burnout").length,
    Cemas: journals.filter(j => j.hasil_mood === "Cemas").length,
    Sedih: journals.filter(j => j.hasil_mood === "Sedih").length,
    Netral: journals.filter(j => j.hasil_mood === "Netral").length,
    Krisis: journals.filter(j => j.hasil_mood === "Krisis").length,
  };

  const handleStatsCardClick = (type, moodName = null) => {
    if (type === 'total') {
      setStatsModalData({
        title: '📊 Detail Total Jurnal',
        content: (
          <div>
            <p style={{ marginBottom: 12 }}>Seluruh jurnal yang telah ditulis oleh user:</p>
            <p style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: '#4F46E5' }}>{moodStats.total}</p>
            <hr style={{ margin: '16px 0', border: '1px solid #E2E8F0' }} />
            <div style={{ marginTop: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>📈 Distribusi Mood:</p>
              {Object.entries(moodStats).filter(([key]) => key !== 'total').map(([mood, count]) => {
                const color = moodColors[mood] || { emoji: '😐', color: '#94A3B8', borderLeft: '#94A3B8' };
                const percentage = moodStats.total > 0 ? Math.round((count / moodStats.total) * 100) : 0;
                return (
                  <div key={mood} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ width: 48 }}>{color.emoji}</span>
                    <span style={{ width: 80 }}>{mood}</span>
                    <div style={{ flex: 1, background: '#E2E8F0', borderRadius: 10, height: 24, overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, background: color.borderLeft, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, color: 'white', fontSize: 11, fontWeight: 600 }}>
                        {count}
                      </div>
                    </div>
                    <span style={{ width: 50, textAlign: 'right' }}>{percentage}%</span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowStatsModal(false)} style={modalButtonStyle}>
              Tutup
            </button>
          </div>
        )
      });
      setShowStatsModal(true);
    } else if (moodName) {
      const mood = moodColors[moodName] || { emoji: '😐', color: '#94A3B8', borderLeft: '#94A3B8', description: 'Tidak ada deskripsi' };
      const count = moodStats[moodName];
      const percentage = moodStats.total > 0 ? Math.round((count / moodStats.total) * 100) : 0;
      setStatsModalData({
        title: `${mood.emoji} Detail Mood: ${moodName}`,
        content: (
          <div>
            <div style={{ textAlign: 'center', padding: 20, background: moodColors[moodName]?.bg || '#F1F5F9', borderRadius: 16 }}>
              <span style={{ fontSize: 64 }}>{mood.emoji}</span>
              <p style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: mood.color }}>{moodName}</p>
              <p style={{ fontSize: 48, fontWeight: 700, marginTop: 8 }}>{count}</p>
              <p style={{ fontSize: 14, marginTop: 4 }}>jurnal ({percentage}% dari total)</p>
            </div>
            <hr style={{ margin: '16px 0', border: '1px solid #E2E8F0' }} />
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5 }}>{mood.description}</p>
            <button 
              onClick={() => {
                setShowStatsModal(false);
                setMoodFilter(moodName);
              }} 
              style={{ ...modalButtonStyle, background: mood.color }}
            >
              🔍 Filter Jurnal {moodName}
            </button>
          </div>
        )
      });
      setShowStatsModal(true);
    }
  };

  const closeStatsModal = () => {
    setShowStatsModal(false);
    setStatsModalData({ title: '', content: null });
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'perhatian':
        return { background: '#FEF3C7', color: '#92400E', icon: '⚠️' };
      case 'darurat':
        return { background: '#FEE2E2', color: '#991B1B', icon: '🚨' };
      default:
        return { background: '#E5E7EB', color: '#4B5563', icon: '✅' };
    }
  };

  return (
    <div style={styles.bg}>
      <Toaster position="top-right" />
      
      {/* MODAL STATISTIK */}
      {showStatsModal && (
        <div style={styles.modalOverlay} onClick={closeStatsModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{statsModalData.title}</h3>
              <button style={styles.modalClose} onClick={closeStatsModal}>✕</button>
            </div>
            <div style={styles.modalBody}>
              {statsModalData.content}
            </div>
          </div>
        </div>
      )}
      
      <div style={styles.blob1}/>
      <div style={styles.blob2}/>
      <div style={styles.blob3}/>

      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <div style={styles.navLogoIcon}>🌿</div>
          <span style={styles.navLogoText}>RuangTenang</span>
          <span style={styles.navBadge}>Admin</span>
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLink} onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span style={styles.navLink} onClick={() => navigate("/admin/users")}>Data User</span>
          <span style={{ ...styles.navLink, ...styles.navLinkActive }}>Data Jurnal</span>
          <span style={styles.navLink} onClick={() => navigate("/admin/articles")}>Artikel</span>
          <span style={styles.navLink} onClick={() => navigate("/profile")}>Profil</span>
          <span style={styles.navLink} onClick={() => navigate('/api-tester')}>🧪 API</span>
          <button style={styles.logoutBtn} onClick={doLogout}>Keluar</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📓 Data Jurnal User</h1>
            <p style={styles.subtitle}>Pantau dan kelola seluruh jurnal yang ditulis oleh pengguna</p>
          </div>
          <div style={styles.dateBadge}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* STATS CARDS */}
        <div style={styles.statsGrid}>
          <div 
            style={{ ...styles.statCard, cursor: 'pointer' }}
            onClick={() => handleStatsCardClick('total')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statNum}>{moodStats.total}</div>
            <div style={styles.statLabel}>Total Jurnal</div>
            <div style={styles.statTrend}>Semua mood</div>
            <div style={styles.clickHint}>✨ Klik untuk detail</div>
          </div>
          
          <div 
            style={{ ...styles.statCard, background: moodColors.Burnout.bg, border: `1px solid ${moodColors.Burnout.borderLeft}40`, cursor: 'pointer' }}
            onClick={() => handleStatsCardClick('mood', 'Burnout')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={styles.statIcon}>{moodColors.Burnout.emoji}</div>
            <div style={{ ...styles.statNum, color: moodColors.Burnout.color }}>{moodStats.Burnout}</div>
            <div style={{ ...styles.statLabel, color: moodColors.Burnout.color }}>Burnout</div>
            <div style={styles.clickHint}>✨ Klik untuk detail</div>
          </div>

          <div 
            style={{ ...styles.statCard, background: moodColors.Cemas.bg, border: `1px solid ${moodColors.Cemas.borderLeft}40`, cursor: 'pointer' }}
            onClick={() => handleStatsCardClick('mood', 'Cemas')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={styles.statIcon}>{moodColors.Cemas.emoji}</div>
            <div style={{ ...styles.statNum, color: moodColors.Cemas.color }}>{moodStats.Cemas}</div>
            <div style={{ ...styles.statLabel, color: moodColors.Cemas.color }}>Cemas</div>
            <div style={styles.clickHint}>✨ Klik untuk detail</div>
          </div>

          <div 
            style={{ ...styles.statCard, background: moodColors.Sedih.bg, border: `1px solid ${moodColors.Sedih.borderLeft}40`, cursor: 'pointer' }}
            onClick={() => handleStatsCardClick('mood', 'Sedih')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={styles.statIcon}>{moodColors.Sedih.emoji}</div>
            <div style={{ ...styles.statNum, color: moodColors.Sedih.color }}>{moodStats.Sedih}</div>
            <div style={{ ...styles.statLabel, color: moodColors.Sedih.color }}>Sedih</div>
            <div style={styles.clickHint}>✨ Klik untuk detail</div>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div style={styles.actionBar}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Cari jurnal atau nama user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button style={styles.clearBtn} onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>
          
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">📋 Semua Mood</option>
            <option value="Burnout">😤 Burnout</option>
            <option value="Cemas">😰 Cemas</option>
            <option value="Sedih">😢 Sedih</option>
            <option value="Netral">😌 Netral</option>
            <option value="Krisis">🆘 Krisis</option>
          </select>
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
            {paginatedJournals.map((j) => {
              const mood = moodColors[j.hasil_mood] || {
                bg: "#F4F4F5",
                color: "#52525B",
                emoji: "😐",
                borderLeft: "#A1A1AA",
              };
              const statusStyle = getStatusStyle(j.status || "normal");

              return (
                <div key={j._id} style={{ ...styles.journalCard, borderLeftColor: mood.borderLeft }}>
                  <div style={styles.journalHeader}>
                    <div style={{ ...styles.moodBadge, background: mood.bg, color: mood.color }}>
                      {mood.emoji} {j.hasil_mood}
                    </div>
                    <div style={{ ...styles.statusBadge, background: statusStyle.background, color: statusStyle.color }}>
                      {statusStyle.icon} {j.status || "Normal"}
                    </div>
                    <div style={styles.journalMeta}>
                      <span style={styles.journalDate}>
                        📅 {new Date(j.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <p style={styles.journalText}>
                    {j.teks_curhat?.length > 200 ? j.teks_curhat.substring(0, 200) + "..." : j.teks_curhat}
                  </p>

                  <div style={styles.journalFooter}>
                    <div style={styles.userInfo}>
                      <span style={styles.userAvatar}>
                        {j.user_nama && j.user_nama !== "User Tidak Diketahui" 
                          ? j.user_nama.charAt(0).toUpperCase() 
                          : "U"}
                      </span>
                      <span style={styles.userName}>
                        {j.user_nama && j.user_nama !== "User Tidak Diketahui" 
                          ? j.user_nama 
                          : "User"}
                      </span>
                    </div>
                    
                    <button 
                      style={styles.recommendBtn}
                      onClick={() => {
                        setSelectedJournal(j);
                        setShowRecommendModal(true);
                        fetchArticles(j.hasil_mood);
                      }}
                    >
                      📖 Rekomendasi Artikel
                    </button>
                  </div>
                  
                  <div style={styles.actionButtons}>
                    <button 
                      onClick={() => updateStatus(j._id, "perhatian")}
                      style={styles.statusWarningBtn}
                    >
                      ⚠️ Perhatian
                    </button>
                    <button 
                      onClick={() => updateStatus(j._id, "darurat")}
                      style={styles.statusDangerBtn}
                    >
                      🚨 Darurat
                    </button>
                    <button
                      onClick={() => handleDelete(j._id)}
                      style={styles.deleteBtn}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {filteredJournals.length > 0 && (
          <div style={styles.pagination}>
            <div style={styles.paginationInfo}>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredJournals.length)} dari {filteredJournals.length} jurnal
            </div>
            <div style={styles.paginationControls}>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={styles.perPageSelect}
              >
                <option value={5}>5 / halaman</option>
                <option value={10}>10 / halaman</option>
                <option value={20}>20 / halaman</option>
              </select>
              
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}>«</button>
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}>‹</button>
              <span style={styles.pageInfo}>Halaman {currentPage} dari {totalPages || 1}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}>›</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}>»</button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL REKOMENDASI ARTIKEL */}
      {showRecommendModal && selectedJournal && (
        <div style={styles.modalOverlay} onClick={() => setShowRecommendModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>📖 Rekomendasikan Artikel</h3>
              <button style={styles.modalClose} onClick={() => setShowRecommendModal(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalJournalPreview}>
                <p><strong>Isi Jurnal:</strong></p>
                <p style={styles.modalJournalText}>{selectedJournal.teks_curhat?.substring(0, 150)}...</p>
              </div>
              <h4 style={{ marginBottom: 12 }}>Pilih Artikel:</h4>
              {articles === null ? (
                <p>⏳ Memuat artikel...</p>
              ) : articles.length === 0 ? (
                <div style={styles.noArticles}>
                  <p>❌ Tidak ada artikel yang tersedia untuk mood ini</p>
                </div>
              ) : (
                <div style={styles.articleList}>
                  {Array.isArray(articles) && articles.map((article, index) => (
                    <div key={article._id || index} style={styles.articleItem}>
                      <div style={{ flex: 1 }}>
                        <strong>{article?.judul_artikel || "Judul tidak tersedia"}</strong>
                        <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                          {article?.kategori_tag || "Kategori tidak tersedia"}
                        </p>
                      </div>
                      <button
                        style={styles.selectArticleBtn}
                        onClick={() => sendRecommendation(selectedJournal._id, article._id)}
                      >
                        Kirim →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
    minHeight: "100vh",
    background: "#F8FAFC",
    fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  blob1: {
    position: "fixed",
    width: "50vw",
    height: "50vw",
    borderRadius: "50%",
    background: "#818CF8",
    filter: "blur(120px)",
    opacity: 0.12,
    top: "-20vh",
    right: "-10vw",
    zIndex: 0,
    pointerEvents: "none",
  },
  blob2: {
    position: "fixed",
    width: "40vw",
    height: "40vw",
    borderRadius: "50%",
    background: "#34D399",
    filter: "blur(100px)",
    opacity: 0.08,
    bottom: "-10vh",
    left: "-10vw",
    zIndex: 0,
    pointerEvents: "none",
  },
  blob3: {
    position: "fixed",
    width: "30vw",
    height: "30vw",
    borderRadius: "50%",
    background: "#F472B6",
    filter: "blur(100px)",
    opacity: 0.07,
    bottom: "30vh",
    right: "20vw",
    zIndex: 0,
    pointerEvents: "none",
  },
  nav: {
    position: "sticky",
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
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  navLogoIcon: {
    fontSize: 26,
    background: "linear-gradient(135deg, #6366F1, #A855F7)",
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navLogoText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    background: "linear-gradient(135deg, #1E293B, #3B82F6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  navBadge: {
    fontSize: 11,
    background: "#EDE9FE",
    padding: "2px 10px",
    borderRadius: 20,
    color: "#7C3AED",
    fontWeight: 500,
  },
  navLinks: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  navLink: {
    padding: "8px 18px",
    borderRadius: 40,
    fontSize: 14,
    fontWeight: 500,
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  navLinkActive: {
    background: "#EEF2FF",
    color: "#4F46E5",
  },
  logoutBtn: {
    marginLeft: 8,
    padding: "8px 20px",
    background: "transparent",
    border: "1px solid #E2E8F0",
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: 8,
    letterSpacing: "-0.3px",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  dateBadge: {
    fontSize: 13,
    background: "white",
    padding: "8px 18px",
    borderRadius: 40,
    border: "1px solid #E2E8F0",
    color: "#475569",
    fontWeight: 500,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 32,
  },
  statCard: {
    background: "white",
    padding: "20px 24px",
    borderRadius: 24,
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
    transition: "all 0.2s ease",
  },
  statIcon: { fontSize: 28, marginBottom: 12 },
  statNum: { fontSize: 32, fontWeight: 800, color: "#0F172A" },
  statLabel: { fontSize: 13, fontWeight: 500, color: "#64748B", marginTop: 6 },
  statTrend: { fontSize: 11, color: "#10B981", marginTop: 10 },
  clickHint: { fontSize: 10, color: "#94A3B8", marginTop: 10, textAlign: 'center', fontStyle: 'italic' },
  actionBar: { display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" },
  searchWrapper: { flex: 1, position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: 14, fontSize: 14, opacity: 0.5 },
  searchInput: {
    width: "100%", padding: "12px 14px 12px 38px",
    border: "1px solid #E2E8F0", borderRadius: 48,
    fontSize: 14, background: "white", outline: "none", transition: "all 0.2s ease",
  },
  clearBtn: {
    position: "absolute", right: 12, background: "#F1F5F9",
    border: "none", borderRadius: 20, padding: "4px 10px",
    fontSize: 12, cursor: "pointer", color: "#64748B",
  },
  filterSelect: { padding: "12px 20px", border: "1px solid #E2E8F0", borderRadius: 48, fontSize: 14, background: "white", cursor: "pointer" },
  loading: { textAlign: "center", padding: "60px 24px", color: "#64748B", background: "white", borderRadius: 24, border: "1px solid #E2E8F0" },
  spinner: { width: 40, height: 40, border: "3px solid #E2E8F0", borderTop: "3px solid #6366F1", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" },
  emptyCard: { background: "white", padding: "60px 24px", borderRadius: 24, textAlign: 'center', border: '1px solid #E2E8F0' },
  emptyIllustration: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: 500, color: "#1E293B", marginBottom: 8 },
  emptySubtext: { fontSize: 13, color: "#94A3B8" },
  journalList: { display: "flex", flexDirection: "column", gap: 16 },
  journalCard: { background: "white", padding: "20px 24px", borderRadius: 20, border: "1px solid #E2E8F0", borderLeftWidth: 4, borderLeftStyle: "solid", transition: "all 0.2s ease" },
  journalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 },
  moodBadge: { padding: "4px 14px", borderRadius: 30, fontSize: 12, fontWeight: 600 },
  statusBadge: { padding: "4px 12px", borderRadius: 30, fontSize: 11, fontWeight: 500 },
  journalMeta: { display: "flex", gap: 12 },
  journalDate: { fontSize: 12, color: "#94A3B8" },
  journalText: { fontSize: 14, color: "#334155", lineHeight: 1.55, marginBottom: 16 },
  journalFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 },
  userInfo: { display: "flex", alignItems: "center", gap: 10 },
  userAvatar: { width: 32, height: 32, borderRadius: 32, background: "linear-gradient(135deg, #6366F1, #A855F7)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 },
  userName: { fontSize: 13, fontWeight: 500, color: "#1E293B" },
  recommendBtn: { padding: "8px 20px", background: "#8B5CF6", color: "white", border: "none", borderRadius: 40, cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.2s ease" },
  actionButtons: { display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid #F1F5F9" },
  statusWarningBtn: { padding: "6px 16px", fontSize: 12, fontWeight: 500, borderRadius: 30, border: "none", background: "#FEF3C7", color: "#92400E", cursor: "pointer", transition: "all 0.2s ease" },
  statusDangerBtn: { padding: "6px 16px", fontSize: 12, fontWeight: 500, borderRadius: 30, border: "none", background: "#FEE2E2", color: "#991B1B", cursor: "pointer", transition: "all 0.2s ease" },
  deleteBtn: { padding: "6px 16px", fontSize: 12, fontWeight: 500, borderRadius: 30, border: "none", background: "#EF4444", color: "white", cursor: "pointer", transition: "all 0.2s ease" },
  pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: "1px solid #E2E8F0", flexWrap: "wrap", gap: 12 },
  paginationInfo: { fontSize: 13, color: "#64748B" },
  paginationControls: { display: "flex", gap: 8, alignItems: "center" },
  perPageSelect: { padding: "6px 10px", border: "1px solid #E2E8F0", borderRadius: 30, fontSize: 13, cursor: "pointer", background: "white" },
  pageBtn: { padding: "6px 12px", border: "1px solid #E2E8F0", background: "white", borderRadius: 30, cursor: "pointer", fontSize: 13, transition: "all 0.2s ease" },
  pageInfo: { fontSize: 13, color: "#475569" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { background: "white", borderRadius: 28, maxWidth: 500, width: "90%", maxHeight: "80vh", overflow: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #E2E8F0" },
  modalTitle: { fontSize: 20, fontWeight: 600, color: "#0F172A", margin: 0 },
  modalClose: { background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#94A3B8", padding: "0 8px" },
  modalBody: { padding: "24px" },
  modalJournalPreview: { marginBottom: 16 },
  modalJournalText: { background: "#F8FAFC", padding: "12px", borderRadius: 12, fontSize: 14, color: "#475569", marginTop: 8 },
  articleList: { display: "flex", flexDirection: "column", gap: 12, marginTop: 12 },
  articleItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid #E2E8F0", borderRadius: 12 },
  selectArticleBtn: { padding: "6px 16px", background: "#10B981", color: "white", border: "none", borderRadius: 30, cursor: "pointer", fontSize: 12, fontWeight: 500 },
  noArticles: { textAlign: "center", padding: "40px", color: "#94A3B8" },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
