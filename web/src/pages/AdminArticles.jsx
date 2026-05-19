import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function AdminArticles() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  
  // State untuk modal statistik
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsModalData, setStatsModalData] = useState({ title: '', content: null });

  const [form, setForm] = useState({
    judul_artikel: "",
    penulis: "",
    thumbnail_url: "",
    kategori_tag: "Netral",
    isi_konten: "",
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const res = await API.get("/admin/articles");
      setArticles(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data artikel");
    } finally {
      setLoading(false);
    }
  }

  async function tambahArtikel() {
    if (!form.judul_artikel || !form.penulis || !form.isi_konten) {
      toast.error("Harap isi judul, penulis, dan konten artikel");
      return;
    }
    try {
      await API.post("/admin/articles", form);
      setForm({
        judul_artikel: "",
        penulis: "",
        thumbnail_url: "",
        kategori_tag: "Netral",
        isi_konten: "",
      });
      toast.success("Artikel berhasil ditambahkan");
      fetchArticles();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menambahkan artikel");
    }
  }

  async function deleteArtikel(id) {
    if (!window.confirm("⚠️ Hapus artikel ini? Data tidak dapat dikembalikan.")) return;
    try {
      await API.delete(`/admin/articles/${id}`);
      toast.success("Artikel berhasil dihapus");
      fetchArticles();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus artikel");
    }
  }

  async function doLogout() {
    await API.post("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  const filtered = articles.filter((a) =>
    a.judul_artikel?.toLowerCase().includes(search.toLowerCase())
  );

  // Hitung statistik artikel per kategori
  const kategoriStats = {
    total: articles.length,
    Burnout: articles.filter(a => a.kategori_tag === "Burnout").length,
    Cemas: articles.filter(a => a.kategori_tag === "Cemas").length,
    Sedih: articles.filter(a => a.kategori_tag === "Sedih").length,
    Netral: articles.filter(a => a.kategori_tag === "Netral").length,
    Krisis: articles.filter(a => a.kategori_tag === "Krisis").length,
  };

  // 🎨 WARNA BERBEDA UNTUK CARD (tidak sama dengan halaman Data Jurnal)
  const kategoriColors = {
    Burnout: { bg: "#FFF7ED", color: "#EA580C", emoji: "😤", gradient: "linear-gradient(135deg, #FFF7ED, #FFEDD5)" },
    Cemas: { bg: "#F5F3FF", color: "#7C3AED", emoji: "😰", gradient: "linear-gradient(135deg, #F5F3FF, #EDE9FE)" },
    Sedih: { bg: "#EFF6FF", color: "#2563EB", emoji: "😢", gradient: "linear-gradient(135deg, #EFF6FF, #DBEAFE)" },
    Netral: { bg: "#F0FDF4", color: "#16A34A", emoji: "😌", gradient: "linear-gradient(135deg, #F0FDF4, #DCFCE7)" },
    Krisis: { bg: "#FFF1F2", color: "#E11D48", emoji: "🆘", gradient: "linear-gradient(135deg, #FFF1F2, #FFE4E6)" },
  };

  // Handler untuk klik card statistik
  const handleStatsCardClick = (type, kategoriName = null) => {
    if (type === 'total') {
      setStatsModalData({
        title: '📊 Detail Total Artikel',
        content: (
          <div>
            <p style={{ marginBottom: 12 }}>Seluruh artikel yang tersedia di RuangTenang:</p>
            <p style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: '#4F46E5' }}>{kategoriStats.total}</p>
            <hr style={{ margin: '16px 0', border: '1px solid #E2E8F0' }} />
            <div style={{ marginTop: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>📊 Distribusi per Kategori:</p>
              {Object.entries(kategoriStats).filter(([key]) => key !== 'total').map(([kategori, count]) => {
                const color = kategoriColors[kategori] || { emoji: '📄', color: '#94A3B8' };
                const percentage = kategoriStats.total > 0 ? Math.round((count / kategoriStats.total) * 100) : 0;
                return (
                  <div key={kategori} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ width: 48 }}>{color.emoji}</span>
                    <span style={{ width: 80 }}>{kategori}</span>
                    <div style={{ flex: 1, background: '#E2E8F0', borderRadius: 10, height: 24, overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, background: color.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, color: 'white', fontSize: 11, fontWeight: 600 }}>
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
    } else if (kategoriName) {
      const color = kategoriColors[kategoriName] || { emoji: '📄', color: '#94A3B8', bg: '#F1F5F9' };
      const count = kategoriStats[kategoriName];
      const percentage = kategoriStats.total > 0 ? Math.round((count / kategoriStats.total) * 100) : 0;
      setStatsModalData({
        title: `${color.emoji} Detail Kategori: ${kategoriName}`,
        content: (
          <div>
            <div style={{ textAlign: 'center', padding: 20, background: color.bg, borderRadius: 16 }}>
              <span style={{ fontSize: 64 }}>{color.emoji}</span>
              <p style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: color.color }}>{kategoriName}</p>
              <p style={{ fontSize: 48, fontWeight: 700, marginTop: 8 }}>{count}</p>
              <p style={{ fontSize: 14, marginTop: 4 }}>artikel ({percentage}% dari total)</p>
            </div>
            <hr style={{ margin: '16px 0', border: '1px solid #E2E8F0' }} />
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5 }}>
              {kategoriName === 'Burnout' && 'Artikel untuk membantu mengatasi kelelahan mental dan fisik akibat tekanan berkepanjangan.'}
              {kategoriName === 'Cemas' && 'Artikel untuk mengurangi perasaan gelisah, khawatir berlebih, dan tidak tenang.'}
              {kategoriName === 'Sedih' && 'Artikel untuk mengatasi perasaan kehilangan motivasi dan semangat.'}
              {kategoriName === 'Netral' && 'Artikel tentang kesehatan mental umum dan tips menjaga keseimbangan emosi.'}
              {kategoriName === 'Krisis' && 'Artikel penting untuk kondisi darurat yang membutuhkan perhatian segera.'}
            </p>
            <button onClick={() => setShowStatsModal(false)} style={{ ...modalButtonStyle, background: color.color }}>
              Tutup
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
      
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <div style={styles.navLogoIcon}>🌿</div>
          <span style={styles.navLogoText}>RuangTenang</span>
          <span style={styles.navBadge}>Admin</span>
        </div>

        <div style={styles.navLinks}>
          <span style={styles.navLink} onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span style={styles.navLink} onClick={() => navigate("/admin/users")}>Data User</span>
          <span style={styles.navLink} onClick={() => navigate("/admin/journals")}>Data Jurnal</span>
          <span style={{ ...styles.navLink, ...styles.navLinkActive }}>Artikel</span>
          <span style={styles.navLink} onClick={() => navigate("/admin/data-admin")}>Data Admin</span>
          <span style={styles.navLink} onClick={() => navigate("/profile")}>Profil</span>
          <span style={styles.navLink} onClick={() => navigate('/api-tester')}>🧪 API</span>
          <button style={styles.logoutBtn} onClick={doLogout}>Keluar</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📚 Manajemen Artikel</h1>
            <p style={styles.subtitle}>Kelola artikel rekomendasi berdasarkan mood pengguna</p>
          </div>
          <div style={styles.dateBadge}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* STATS CARDS - Warna berbeda dengan halaman lain */}
        <div style={styles.statsGrid}>
          <div 
            style={{ ...styles.statCard, cursor: 'pointer', background: 'linear-gradient(135deg, #6366F1, #818CF8)', color: 'white' }}
            onClick={() => handleStatsCardClick('total')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={styles.statIcon}>📚</div>
            <div style={{ ...styles.statNum, color: 'white' }}>{kategoriStats.total}</div>
            <div style={{ ...styles.statLabel, color: 'rgba(255,255,255,0.8)' }}>Total Artikel</div>
            <div style={{ ...styles.statTrend, color: 'rgba(255,255,255,0.6)' }}>Semua kategori</div>
            <div style={{ ...styles.clickHint, color: 'rgba(255,255,255,0.6)' }}>✨ Klik untuk detail</div>
          </div>
          
          <div 
            style={{ ...styles.statCard, background: kategoriColors.Burnout.gradient, cursor: 'pointer', border: 'none' }}
            onClick={() => handleStatsCardClick('kategori', 'Burnout')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={styles.statIcon}>{kategoriColors.Burnout.emoji}</div>
            <div style={{ ...styles.statNum, color: kategoriColors.Burnout.color }}>{kategoriStats.Burnout}</div>
            <div style={{ ...styles.statLabel, color: kategoriColors.Burnout.color }}>Burnout</div>
            <div style={{ ...styles.clickHint, color: kategoriColors.Burnout.color }}>✨ Klik untuk detail</div>
          </div>

          <div 
            style={{ ...styles.statCard, background: kategoriColors.Cemas.gradient, cursor: 'pointer', border: 'none' }}
            onClick={() => handleStatsCardClick('kategori', 'Cemas')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={styles.statIcon}>{kategoriColors.Cemas.emoji}</div>
            <div style={{ ...styles.statNum, color: kategoriColors.Cemas.color }}>{kategoriStats.Cemas}</div>
            <div style={{ ...styles.statLabel, color: kategoriColors.Cemas.color }}>Cemas</div>
            <div style={{ ...styles.clickHint, color: kategoriColors.Cemas.color }}>✨ Klik untuk detail</div>
          </div>

          <div 
            style={{ ...styles.statCard, background: kategoriColors.Sedih.gradient, cursor: 'pointer', border: 'none' }}
            onClick={() => handleStatsCardClick('kategori', 'Sedih')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={styles.statIcon}>{kategoriColors.Sedih.emoji}</div>
            <div style={{ ...styles.statNum, color: kategoriColors.Sedih.color }}>{kategoriStats.Sedih}</div>
            <div style={{ ...styles.statLabel, color: kategoriColors.Sedih.color }}>Sedih</div>
            <div style={{ ...styles.clickHint, color: kategoriColors.Sedih.color }}>✨ Klik untuk detail</div>
          </div>
        </div>

        {/* FORM TAMBAH ARTIKEL */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>➕ Tambah Artikel Baru</h3>
          </div>
          <div style={styles.formBody}>
            <input
              style={styles.input}
              placeholder="📝 Judul Artikel"
              value={form.judul_artikel}
              onChange={(e) => setForm({ ...form, judul_artikel: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="✍️ Penulis"
              value={form.penulis}
              onChange={(e) => setForm({ ...form, penulis: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="🖼️ Thumbnail URL (opsional)"
              value={form.thumbnail_url}
              onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
            />
            <select
              style={styles.select}
              value={form.kategori_tag}
              onChange={(e) => setForm({ ...form, kategori_tag: e.target.value })}
            >
              <option value="Burnout">😤 Burnout</option>
              <option value="Cemas">😰 Cemas</option>
              <option value="Sedih">😢 Sedih</option>
              <option value="Netral">😌 Netral</option>
              <option value="Krisis">🆘 Krisis</option>
            </select>
            <textarea
              style={styles.textarea}
              placeholder="📄 Isi artikel (HTML format)..."
              value={form.isi_konten}
              onChange={(e) => setForm({ ...form, isi_konten: e.target.value })}
              rows={6}
            />
            <button style={styles.addBtn} onClick={tambahArtikel}>
              + Tambah Artikel
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Cari artikel berdasarkan judul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* TABLE ARTIKEL */}
        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Memuat data artikel...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p style={styles.emptyText}>Tidak ada artikel ditemukan</p>
              <p style={styles.emptySubtext}>Coba ubah kata kunci pencarian atau tambah artikel baru</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.thNo}>No</th>
                  <th style={styles.th}>Artikel</th>
                  <th style={styles.th}>Kategori</th>
                  <th style={styles.thAksi}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const kategori = kategoriColors[a.kategori_tag] || { emoji: "📄", color: "#94A3B8", bg: "#F1F5F9" };
                  return (
                    <tr key={a._id} style={styles.tr}>
                      <td style={styles.tdNo}>{i + 1}</td>
                      <td style={styles.td}>
                        <div style={styles.articleCell} onClick={() => setSelected(a)}>
                          {a.thumbnail_url ? (
                            <img src={a.thumbnail_url} style={styles.thumbnail} alt={a.judul_artikel} />
                          ) : (
                            <div style={styles.thumbnailPlaceholder}>📖</div>
                          )}
                          <div>
                            <div style={styles.articleTitle}>{a.judul_artikel}</div>
                            <div style={styles.articleAuthor}>✍️ {a.penulis}</div>
                          </div>
                        </div>
                       </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, background: kategori.bg, color: kategori.color }}>
                          {kategori.emoji} {a.kategori_tag}
                        </span>
                       </td>
                      <td style={styles.tdAksi}>
                        <button style={styles.deleteBtn} onClick={() => deleteArtikel(a._id)}>
                          🗑️ Hapus
                        </button>
                       </td>
                     </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL DETAIL ARTIKEL */}
      {selected && (
        <div style={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{selected.judul_artikel}</h3>
              <button style={styles.modalClose} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalMeta}>
                <span>✍️ {selected.penulis}</span>
                <span style={styles.modalKategori}>
                  {kategoriColors[selected.kategori_tag]?.emoji} {selected.kategori_tag}
                </span>
              </div>
              <div style={styles.modalContentArtikel} dangerouslySetInnerHTML={{ __html: selected.isi_konten }} />
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
  formCard: {
    background: "white",
    borderRadius: 24,
    border: "1px solid #E2E8F0",
    marginBottom: 32,
    overflow: "hidden",
  },
  formHeader: {
    padding: "16px 24px",
    borderBottom: "1px solid #E2E8F0",
    background: "#F8FAFC",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#0F172A",
    margin: 0,
  },
  formBody: {
    padding: "24px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 16,
    outline: "none",
    transition: "all 0.2s ease",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 16,
    outline: "none",
    background: "white",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 16,
    outline: "none",
    fontFamily: "monospace",
    resize: "vertical",
  },
  addBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    color: "white",
    border: "none",
    borderRadius: 40,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  searchWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 14,
    opacity: 0.5,
  },
  searchInput: {
    width: "100%",
    padding: "12px 14px 12px 38px",
    border: "1px solid #E2E8F0",
    borderRadius: 48,
    fontSize: 14,
    background: "white",
    outline: "none",
    transition: "all 0.2s ease",
  },
  clearBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "#F1F5F9",
    border: "none",
    borderRadius: 20,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    color: "#64748B",
  },
  card: {
    background: "white",
    borderRadius: 24,
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  theadRow: {
    background: "#F8FAFC",
  },
  th: {
    textAlign: "left",
    padding: "16px 20px",
    fontSize: 13,
    fontWeight: 600,
    color: "#475569",
    borderBottom: "1px solid #E2E8F0",
  },
  thNo: {
    textAlign: "center",
    padding: "16px 20px",
    fontSize: 13,
    fontWeight: 600,
    color: "#475569",
    borderBottom: "1px solid #E2E8F0",
    width: 70,
  },
  thAksi: {
    textAlign: "center",
    padding: "16px 20px",
    fontSize: 13,
    fontWeight: 600,
    color: "#475569",
    borderBottom: "1px solid #E2E8F0",
    width: 100,
  },
  td: {
    padding: "16px 20px",
    fontSize: 14,
    color: "#1E293B",
    borderBottom: "1px solid #F1F5F9",
  },
  tdNo: {
    textAlign: "center",
    padding: "16px 20px",
    fontSize: 14,
    color: "#64748B",
    borderBottom: "1px solid #F1F5F9",
  },
  tdAksi: {
    textAlign: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #F1F5F9",
  },
  tr: {
    transition: "background 0.2s ease",
  },
  articleCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
  },
  thumbnail: {
    width: 60,
    height: 50,
    objectFit: "cover",
    borderRadius: 10,
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 50,
    borderRadius: 10,
    background: "#F1F5F9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
  },
  articleTitle: {
    fontWeight: 600,
    marginBottom: 2,
    color: "#0F172A",
  },
  articleAuthor: {
    fontSize: 12,
    color: "#94A3B8",
  },
  badge: {
    padding: "4px 14px",
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-block",
  },
  deleteBtn: {
    padding: "6px 16px",
    fontSize: 12,
    borderRadius: 30,
    border: "1px solid #FECACA",
    background: "#FEF2F2",
    color: "#DC2626",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  loading: {
    padding: "60px 24px",
    textAlign: "center",
    color: "#64748B",
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
  emptyState: {
    padding: "60px 24px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 500,
    color: "#1E293B",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94A3B8",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white",
    borderRadius: 28,
    maxWidth: 700,
    width: "90%",
    maxHeight: "80vh",
    overflow: "auto",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #E2E8F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#0F172A",
    margin: 0,
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    color: "#94A3B8",
    padding: "0 8px",
  },
  modalBody: {
    padding: "24px",
  },
  modalMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid #E2E8F0",
  },
  modalKategori: {
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    background: "#F1F5F9",
    color: "#475569",
  },
  modalContentArtikel: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#334155",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);