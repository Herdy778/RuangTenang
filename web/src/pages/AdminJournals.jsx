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
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchJournals();
  }, []);

    // Filter journals berdasarkan search dan mood
  const getFilteredJournals = () => {
    let filtered = [...journals];
    
    // Filter by search (judul/isi jurnal atau nama user)
    if (searchTerm) {
      filtered = filtered.filter(j => 
        j.teks_curhat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.user_nama?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by mood
    if (moodFilter !== "all") {
      filtered = filtered.filter(j => j.hasil_mood === moodFilter);
    }
    
    return filtered;
  };

  // Pagination
  const filteredJournals = getFilteredJournals();
  const totalPages = Math.ceil(filteredJournals.length / itemsPerPage);
  const paginatedJournals = filteredJournals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, moodFilter]);

  // Kirim rekomendasi artikel
  const sendRecommendation = async (journalId, articleId) => {
  try {
    await API.post("/admin/journals/send-article", {
      journal_id: journalId,
      article_id: articleId,
    });

    toast.success("Rekomendasi berhasil dikirim!");
    setShowRecommendModal(false);

  } catch (err) {
    console.error(err.response || err);
    toast.error(
      err.response?.data?.message ||
      "Gagal mengirim rekomendasi"
    );
  }
};

  async function fetchJournals() {
    try {
      const res = await API.get("/admin/journals");
      setJournals(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
  try {
    await API.put(`/journals/${id}/status`, { status });
    fetchJournals();
  } catch (err) {
    console.error(err);
  }
}

async function handleDelete(id) {
  const confirmDelete = window.confirm("Yakin hapus jurnal?");
  if (!confirmDelete) return;

  try {
    await API.delete(`/admin/journals/${id}`);
    fetchJournals();
  } catch (err) {
    console.error(err);
  }
}

  async function doLogout() {
    await API.post("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  const moodColors = {
    Burnout: { bg: "#FEF3C7", color: "#92400E", emoji: "😤" },
    Cemas: { bg: "#EDE9FE", color: "#5B21B6", emoji: "😰" },
    Sedih: { bg: "#DBEAFE", color: "#1E40AF", emoji: "😢" },
    Netral: { bg: "#F0FDF4", color: "#166534", emoji: "😌" },
    Krisis: { bg: "#FFE4E6", color: "#9F1239", emoji: "🆘" },
  };

  return (
    <div style={styles.bg}>
       <Toaster position="top-right" />
      <div style={styles.blob1}/>
      <div style={styles.blob2}/>

      {/* NAVBAR (SAMA PERSIS DENGAN DASHBOARD) */}
      <nav style={styles.nav}>
  <div style={styles.navLogo}>
    <span style={styles.navLogoIcon}>🌿</span>
    <span style={styles.navLogoText}>RuangTenang</span>
  </div>

  <div style={styles.navLinks}>
    <span
      style={styles.navLink}
      onClick={() => navigate("/dashboard")}
    >
      Dashboard
    </span>

    <span
      style={styles.navLink}
      onClick={() => navigate("/admin/users")}
    >
      Data User
    </span>

    <span
      style={{ ...styles.navLink, ...styles.navLinkActive }}
    >
      Data Jurnal
    </span>

    <span
      style={styles.navLink}
      onClick={() => navigate("/admin/articles")}
    >
      Artikel
    </span>

    <button style={styles.logoutBtn} onClick={doLogout}>
      Logout
    </button>
  </div>
</nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Data Jurnal User</h1>
          <p style={styles.subtitle}>
            Semua jurnal yang ditulis oleh pengguna
          </p>
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{journals.length}</div>
            <div style={styles.statLabel}>Total Jurnal</div>
          </div>
          <div style={{ ...styles.statCard, borderTop: "3px solid #F59E0B" }}>
            <div style={{ ...styles.statValue, color: "#F59E0B" }}>{journals.filter(j => j.hasil_mood === "Burnout").length}</div>
            <div style={styles.statLabel}>😤 Burnout</div>
          </div>
          <div style={{ ...styles.statCard, borderTop: "3px solid #8B5CF6" }}>
            <div style={{ ...styles.statValue, color: "#8B5CF6" }}>{journals.filter(j => j.hasil_mood === "Cemas").length}</div>
            <div style={styles.statLabel}>😰 Cemas</div>
          </div>
          <div style={{ ...styles.statCard, borderTop: "3px solid #3B82F6" }}>
            <div style={{ ...styles.statValue, color: "#3B82F6" }}>{journals.filter(j => j.hasil_mood === "Sedih").length}</div>
            <div style={styles.statLabel}>😢 Sedih</div>
          </div>
        </div>

                {/* SEARCH & FILTER */}
        <div style={styles.controlBar}>
          <input
            type="text"
            placeholder="🔍 Cari jurnal atau nama user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          
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
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>Memuat data...</p>
          </div>
        ) : journals.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyEmoji}>📝</p>
            <p style={styles.emptyText}>Belum ada jurnal dari user</p>
          </div>
        ) : (
          <div style={styles.journalList}>
            {paginatedJournals.map((j) => {
              const mood = moodColors[j.hasil_mood] || {
                bg: "#F4F4F5",
                color: "#52525B",
                emoji: "😐",
              };
              const status = j.status || "normal";

              return (
                <div key={j._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span
                      style={{
                        ...styles.moodBadge,
                        background: mood.bg,
                        color: mood.color,
                      }}
                    >
                      {mood.emoji} {j.hasil_mood}
                    </span>

                    <span style={{
  ...styles.moodBadge,
  background:
    status === "perhatian"
      ? "#FEF3C7"
      : status === "darurat"
      ? "#FEE2E2"
      : "#E5E7EB",
}}>
  {status}
</span>

                    <span style={styles.date}>
                      {new Date(j.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  <p style={styles.text}>
                    {j.teks_curhat}
                  </p>

                  <div style={styles.footer}>
                    <span style={styles.user}>
                      👤 {j.user_nama || "User"}
                    </span>
                    <button
  style={styles.recommendBtn}
  onClick={async () => {
    try {
      setSelectedJournal(j);

      const res = await API.get(
        `/admin/journals/${j._id}/recommended-articles`
      );

      setArticles(res.data.data || []);
      setShowRecommendModal(true);

    } catch (err) {
      console.error(err);
      toast.error(
        "Gagal mengambil rekomendasi artikel"
      );
    }
  }}
>
  📖 Rekomendasi Artikel
</button>
                  </div>
                  <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
  <button 
    onClick={() => updateStatus(j._id, "perhatian")}
    style={styles.statusBtn}
  >
    ⚠️ Perhatian
  </button>

  <button 
    onClick={() => updateStatus(j._id, "darurat")}
    style={styles.statusBtnDanger}
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
              Menampilkan {((currentPage-1)*itemsPerPage)+1} - {Math.min(currentPage*itemsPerPage, filteredJournals.length)} dari {filteredJournals.length} jurnal
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
              
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} style={styles.pageBtn}>«</button>
              <button onClick={() => setCurrentPage(prev => Math.max(prev-1, 1))} disabled={currentPage === 1} style={styles.pageBtn}>‹</button>
              <span style={styles.pageInfo}>Halaman {currentPage} dari {totalPages || 1}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev+1, totalPages))} disabled={currentPage === totalPages} style={styles.pageBtn}>›</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} style={styles.pageBtn}>»</button>
            </div>
          </div>
        )}
      </div>
             {showRecommendModal && selectedJournal && (
  <div style={styles.modalOverlay} onClick={() => setShowRecommendModal(false)}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <h2 style={styles.modalTitle}>Rekomendasikan Artikel</h2>
        <button style={styles.modalClose} onClick={() => setShowRecommendModal(false)}>✕</button>
      </div>
      <div style={styles.modalBody}>
        <p style={styles.modalJournalText}>
          <strong>Isi Jurnal:</strong><br/>
          {selectedJournal.teks_curhat?.substring(0, 150)}...
        </p>
        <h4>Pilih Artikel:</h4>
        {articles.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: 20 }}>
            ⏳ Memuat daftar artikel...
          </p>
        ) : (
          <div style={styles.articleList}>
            {articles.map(article => (
              <div key={article._id} style={styles.articleItem}>
                <div style={{ flex: 1 }}>
                  <strong>{article.judul_artikel}</strong>

<p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
  {article.kategori_tag || "Artikel"}
</p>
                </div>
                <button 
                  style={styles.selectArticleBtn}
                  onClick={() => sendRecommendation(selectedJournal._id, article._id)}
                >
                  Kirim Rekomendasi
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
    background: "white",
    borderBottom: "1px solid #eee",
    padding: "0 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
  },

  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  navLogoIcon: {
    fontSize: 20,
  },

  navLogoText: {
    fontWeight: 600,
    fontSize: 18,
  },

  navLinks: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  navLink: {
    padding: "8px 14px",
    cursor: "pointer",
    borderRadius: 8,
    color: "#555",
  },

  navLinkActive: {
    background: "#EDE9FE",
    color: "#7C3AED",
  },

  logoutBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
  },

  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: 30,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 600,
  },

  subtitle: {
    color: "#777",
  },

  journalList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  card: {
    background: "white",
    padding: 20,
    borderRadius: 14,
    border: "1px solid #eee",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  moodBadge: {
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
  },

  date: {
    fontSize: 12,
    color: "#777",
  },

  text: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
  },

  footer: {
    borderTop: "1px solid #eee",
    paddingTop: 10,
  },

  user: {
    fontSize: 12,
    color: "#777",
  },

  emptyCard: {
    background: "white",
    padding: 30,
    borderRadius: 14,
    textAlign: "center",
  },

  emptyEmoji: {
    fontSize: 32,
  },

  emptyText: {
    color: "#888",
  },

  // ========== TAMBAHKAN STYLE BARU INI ==========
  
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "white",
    padding: "16px",
    borderRadius: 12,
    border: "1px solid #F4F4F5",
    textAlign: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
  },
  statLabel: {
    fontSize: 13,
    color: "#71717A",
    marginTop: 4,
  },
  controlBar: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #E4E4E7",
    borderRadius: 10,
    fontSize: 14,
  },
  filterSelect: {
    padding: "10px 14px",
    border: "1px solid #E4E4E7",
    borderRadius: 10,
    background: "white",
  },
  recommendBtn: {
    padding: "6px 12px",
    background: "#8B5CF6",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    marginLeft: "auto",
  },
    statusBtn: {
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 8,
    border: "none",
    background: "#FEF3C7",
    color: "#92400E",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  statusBtnDanger: {
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 8,
    border: "none",
    background: "#FEE2E2",
    color: "#991B1B",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deleteBtn: {
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 8,
    border: "none",
    background: "#EF4444",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    marginTop: 16,
    background: "white",
    borderRadius: 12,
    border: "1px solid #F4F4F5",
    flexWrap: "wrap",
    gap: 12,
  },
  paginationInfo: {
    fontSize: 13,
    color: "#71717A",
  },
  paginationControls: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  perPageSelect: {
    padding: "6px 10px",
    border: "1px solid #E4E4E7",
    borderRadius: 8,
  },
  pageBtn: {
    padding: "6px 12px",
    border: "1px solid #E4E4E7",
    background: "white",
    borderRadius: 8,
    cursor: "pointer",
  },
  pageInfo: {
    fontSize: 13,
    color: "#374151",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: 16,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #F4F4F5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
  },
  modalBody: {
    padding: 20,
  },
  modalJournalText: {
    background: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  articleList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 12,
  },
  articleItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    border: "1px solid #F4F4F5",
    borderRadius: 8,
  },
  selectArticleBtn: {
    padding: "6px 16px",
    background: "#10B981",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};

