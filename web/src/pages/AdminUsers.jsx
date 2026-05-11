
import { useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // State untuk modal
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', content: null });

  const [sortConfig, setSortConfig] = useState({
    key: "nama_lengkap",
    direction: "asc",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ PERBAIKAN: HAPUS FILTER MAHASISWA, TAMPILKAN SEMUA USER
  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      const data = res.data.data || [];
      
      // LANGSUNG SET SEMUA DATA TANPA FILTER
      setAllUsers(data);
      
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }

  const getSortedUsers = useMemo(() => {
    let filtered = [...allUsers];
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    const sorted = [...filtered];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";
        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [allUsers, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <span style={{ opacity: 0.4 }}>⇅</span>;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  async function deleteUser(id) {
    if (!confirm("⚠️ Hapus user ini? Data tidak dapat dikembalikan.")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User berhasil dihapus");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus user");
    }
  }

  async function doLogout() {
    try {
      await API.post("/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  }

  const totalUsers = getSortedUsers.length;

  // Hitung statistik berdasarkan role dari MongoDB
  const roleStats = useMemo(() => {
    const stats = {};
    allUsers.forEach(user => {
      const role = user.role || "unknown";
      stats[role] = (stats[role] || 0) + 1;
    });
    return stats;
  }, [allUsers]);

  // Fungsi badge role dinamis - mengikuti role dari MongoDB
  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return { background: "#FEF3C7", color: "#92400E", icon: "👑", label: "Admin" };
      case "psikolog":
        return { background: "#EDE9FE", color: "#5B21B6", icon: "🧠", label: "Psikolog" };
      case "mahasiswa":
        return { background: "#ECFDF5", color: "#065F46", icon: "🎓", label: "Mahasiswa" };
      default:
        // Jika ada role lain di MongoDB, tetap ditampilkan
        return { background: "#F1F5F9", color: "#475569", icon: "👤", label: role || "Unknown" };
    }
  };

  const handleExportCSV = () => {
    const headers = ["No", "Nama Lengkap", "Email", "Role"];
    const csvData = getSortedUsers.map((user, i) => [i + 1, user.nama_lengkap, user.email, user.role || "-"]);
    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data berhasil diexport");
  };

  // Handler untuk klik card statistik
  const handleCardClick = (type, role = null, count = 0) => {
    switch(type) {
      case 'total_users':
        setModalData({
          title: '👥 Detail Total Pengguna',
          content: (
            <div>
              <p style={{ marginBottom: 12 }}>Seluruh pengguna yang terdaftar di RuangTenang:</p>
              <p style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: '#4F46E5' }}>{totalUsers}</p>
              <hr style={{ margin: '16px 0', border: '1px solid #E2E8F0' }} />
              <div style={{ marginTop: 16 }}>
                <p style={{ fontWeight: 600, marginBottom: 12 }}>📊 Distribusi Role:</p>
                {Object.entries(roleStats).map(([r, c]) => {
                  const style = getRoleBadgeStyle(r);
                  const percentage = totalUsers > 0 ? Math.round((c / totalUsers) * 100) : 0;
                  return (
                    <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ width: 40 }}>{style.icon}</span>
                      <span style={{ width: 100 }}>{style.label}</span>
                      <div style={{ flex: 1, background: '#E2E8F0', borderRadius: 10, height: 24, overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, background: style.color, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, color: 'white', fontSize: 11, fontWeight: 600 }}>
                          {c}
                        </div>
                      </div>
                      <span style={{ width: 50, textAlign: 'right' }}>{percentage}%</span>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setShowModal(false)} style={modalButtonStyle}>
                Tutup
              </button>
            </div>
          )
        });
        setShowModal(true);
        break;
        
      case 'role_detail':
        const roleStyle = getRoleBadgeStyle(role);
        const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
        setModalData({
          title: `${roleStyle.icon} Detail Role: ${roleStyle.label}`,
          content: (
            <div>
              <p style={{ marginBottom: 12 }}>Jumlah pengguna dengan role <strong>{roleStyle.label}</strong>:</p>
              <div style={{ textAlign: 'center', padding: 20, background: roleStyle.background, borderRadius: 16 }}>
                <span style={{ fontSize: 64 }}>{roleStyle.icon}</span>
                <p style={{ fontSize: 48, fontWeight: 700, marginTop: 8, color: roleStyle.color }}>{count}</p>
                <p style={{ fontSize: 14, marginTop: 8 }}>pengguna ({percentage}% dari total)</p>
              </div>
              <hr style={{ margin: '16px 0', border: '1px solid #E2E8F0' }} />
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5 }}>
                {roleStyle.label === 'Admin' && '👑 Admin memiliki akses penuh untuk mengelola seluruh data, user, jurnal, dan artikel.'}
                {roleStyle.label === 'Psikolog' && '🧠 Psikolog dapat memberikan konseling, melihat jurnal user, dan memberikan rekomendasi.'}
                {roleStyle.label === 'Mahasiswa' && '🎓 Mahasiswa adalah pengguna utama yang menulis jurnal, memantau mood, dan menerima rekomendasi.'}
                {!['Admin', 'Psikolog', 'Mahasiswa'].includes(roleStyle.label) && `📌 Role "${roleStyle.label}" memiliki akses terbatas sesuai konfigurasi sistem.`}
              </p>
              <button onClick={() => setShowModal(false)} style={modalButtonStyle}>
                Tutup
              </button>
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

  const paginatedUsers = getSortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={styles.bg}>
      <Toaster position="top-right" />
      
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
          <span style={{ ...styles.navLink, ...styles.navLinkActive }}>Data User</span>
          <span style={styles.navLink} onClick={() => navigate("/admin/journals")}>Data Jurnal</span>
          <span style={styles.navLink} onClick={() => navigate("/admin/articles")}>Artikel</span>
          <span style={styles.navLink} onClick={() => navigate("/profile")}>Profil</span>
          <button style={styles.logoutBtn} onClick={doLogout}>Keluar</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>👥 Data Pengguna</h1>
            <p style={styles.subtitle}>Kelola seluruh pengguna RuangTenang (semua role)</p>
          </div>
          <div style={styles.dateBadge}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* STATS CARDS - Bisa diklik */}
        <div style={styles.statsGrid}>
          <div 
            style={{ ...styles.statCard, cursor: 'pointer', transition: 'all 0.2s ease' }}
            onClick={() => handleCardClick('total_users')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statNum}>{totalUsers}</div>
            <div style={styles.statLabel}>Total Pengguna</div>
            <div style={styles.statTrend}>Semua role</div>
            <div style={styles.clickHint}>✨ Klik untuk detail</div>
          </div>
          
          {Object.entries(roleStats).map(([role, count]) => {
            const roleStyle = getRoleBadgeStyle(role);
            return (
              <div 
                key={role} 
                style={{ ...styles.statCard, background: roleStyle.background, border: `1px solid ${roleStyle.color}20`, cursor: 'pointer', transition: 'all 0.2s ease' }}
                onClick={() => handleCardClick('role_detail', role, count)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={styles.statIcon}>{roleStyle.icon}</div>
                <div style={{ ...styles.statNum, color: roleStyle.color }}>{count}</div>
                <div style={{ ...styles.statLabel, color: roleStyle.color }}>{roleStyle.label}</div>
                <div style={{ ...styles.clickHint, color: roleStyle.color }}>✨ Klik untuk detail</div>
              </div>
            );
          })}
        </div>

        <div style={styles.actionBar}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Cari user berdasarkan nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button style={styles.clearBtn} onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>
          <button onClick={handleExportCSV} style={styles.exportBtn}>
            📎 Export CSV
          </button>
        </div>

        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Memuat data pengguna...</p>
            </div>
          ) : getSortedUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔍</div>
              <p style={styles.emptyText}>Tidak ada user ditemukan</p>
              <p style={styles.emptySubtext}>Coba ubah kata kunci pencarian</p>
            </div>
          ) : (
            <>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.theadRow}>
                    <th style={styles.thNo}>No</th>
                    <th style={styles.th} onClick={() => handleSort("nama_lengkap")}>
                      Nama Lengkap {getSortIcon("nama_lengkap")}
                    </th>
                    <th style={styles.th} onClick={() => handleSort("email")}>
                      Email {getSortIcon("email")}
                    </th>
                    <th style={styles.th} onClick={() => handleSort("role")}>
                      Role {getSortIcon("role")}
                    </th>
                    <th style={styles.thAksi}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((u, i) => {
                    const roleStyle = getRoleBadgeStyle(u.role);
                    return (
                      <tr key={u._id} style={styles.tr}>
                        <td style={styles.tdNo}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                        <td style={styles.td}>
                          <div style={styles.userName}>
                            <span style={styles.userAvatar}>
                              {u.nama_lengkap?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                            {u.nama_lengkap}
                          </div>
                        </td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, background: roleStyle.background, color: roleStyle.color }}>
                            {roleStyle.icon} {roleStyle.label}
                          </span>
                        </td>
                        <td style={styles.tdAksi}>
                          <button style={styles.deleteBtn} onClick={() => deleteUser(u._id)}>
                            🗑️ Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={styles.pagination}>
                <div style={styles.paginationInfo}>
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, getSortedUsers.length)} dari {getSortedUsers.length} data
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
                    <option value={10}>10 / halaman</option>
                    <option value={25}>25 / halaman</option>
                    <option value={50}>50 / halaman</option>
                  </select>
                  <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}>
                    «
                  </button>
                  <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}>
                    ‹
                  </button>
                  <span style={styles.pageInfo}>
                    Halaman {currentPage} dari {Math.ceil(getSortedUsers.length / itemsPerPage) || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(getSortedUsers.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(getSortedUsers.length / itemsPerPage)}
                    style={{ ...styles.pageBtn, opacity: currentPage === Math.ceil(getSortedUsers.length / itemsPerPage) ? 0.5 : 1 }}
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.ceil(getSortedUsers.length / itemsPerPage))}
                    disabled={currentPage === Math.ceil(getSortedUsers.length / itemsPerPage)}
                    style={{ ...styles.pageBtn, opacity: currentPage === Math.ceil(getSortedUsers.length / itemsPerPage) ? 0.5 : 1 }}
                  >
                    »
                  </button>
                </div>
              </div>
            </>
          )}
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
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
  actionBar: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  searchWrapper: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 14,
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
    background: "#F1F5F9",
    border: "none",
    borderRadius: 20,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    color: "#64748B",
  },
  exportBtn: {
    padding: "12px 28px",
    background: "linear-gradient(135deg, #3B82F6, #2563EB)",
    color: "white",
    border: "none",
    borderRadius: 48,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s ease",
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
    cursor: "pointer",
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
  userName: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 32,
    background: "linear-gradient(135deg, #6366F1, #A855F7)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 600,
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

  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderTop: "1px solid #E2E8F0",
    flexWrap: "wrap",
    gap: 12,
  },

  paginationInfo: {
    fontSize: 13,
    color: "#64748B",
  },

  paginationControls: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  perPageSelect: {
    padding: "6px 10px",
    border: "1px solid #E2E8F0",
    borderRadius: 30,
    fontSize: 13,
    cursor: "pointer",
    background: "white",
  },

  pageBtn: {
    padding: "6px 12px",
    border: "1px solid #E2E8F0",
    background: "white",
    borderRadius: 30,
    cursor: "pointer",
    fontSize: 13,
    transition: "all 0.2s ease",
  },

  pageInfo: {
    fontSize: 13,
    color: "#475569",
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

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet); 