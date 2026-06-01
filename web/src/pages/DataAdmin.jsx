import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import API from "../utils/api";

export default function DataAdmin() {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clickEffect, setClickEffect] = useState(null);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({
    nama_lengkap: "",
    email: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      const data = res.data.data || [];
      setAllUsers(data);
      const adminOnly = data.filter((user) => user.role === "admin");
      setAdmins(adminOnly);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  const handleExportCSV = () => {
    try {
      if (filteredAdmins.length === 0) {
        toast.error("Tidak ada data admin untuk diexport");
        return;
      }

      const headers = ["No", "Nama Lengkap", "Email", "Role"];
      
      const csvData = filteredAdmins.map((admin, i) => [
        i + 1,
        admin.nama_lengkap,
        admin.email,
        admin.role || "admin"
      ]);
      
      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `data_admin_${new Date().toISOString().slice(0, 19)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Data admin berhasil diexport");
    } catch (err) {
      console.error(err);
      toast.error("Gagal export data");
    }
  };

  async function deleteAdmin(id) {
    const confirmDelete = window.confirm("⚠️ Hapus admin ini? Data tidak dapat dikembalikan.");
    if (!confirmDelete) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("Admin berhasil dihapus");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus admin");
    }
  }

  function openEditModal(admin) {
    setEditingAdmin(admin);
    setEditForm({
      nama_lengkap: admin.nama_lengkap || "",
      email: admin.email || "",
    });
  }

  async function saveEdit() {
    try {
      await API.put(`/admin/users/${editingAdmin._id}`, editForm);
      toast.success("Data admin berhasil diupdate");
      setEditingAdmin(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Gagal update admin");
    }
  }

  async function doLogout() {
    try {
      await API.post("/logout");
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  }

  const handleAdminCardClick = () => {
    setClickEffect('admin');
    setTimeout(() => {
      setClickEffect(null);
      alert(`📊 Total Admin: ${admins.length}\n\nAdmin terdaftar:\n${admins.map(a => `- ${a.nama_lengkap}`).join('\n')}`);
    }, 150);
  };

  const handleUserCardClick = () => {
    setClickEffect('user');
    setTimeout(() => {
      setClickEffect(null);
      navigate("/admin/users");
    }, 150);
  };

  const filteredAdmins = admins.filter((admin) =>
    admin.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!document.querySelector('#admin-data-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'admin-data-styles';
    styleSheet.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes cardClick {
        0% { transform: scale(1); }
        50% { transform: scale(0.97); }
        100% { transform: scale(1); }
      }
      .card-click-animation {
        animation: cardClick 0.15s ease-in-out;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  return (
    <div style={styles.bg}>
      <Toaster position="top-right" />

      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <div style={styles.navLogoIcon}>
  <svg width="22" height="22" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Trunk */}
    <line x1="22" y1="34" x2="22" y2="25" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Roots */}
    <line x1="22" y1="34" x2="17" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="22" y1="34" x2="27" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    {/* Brain lobes */}
    <circle cx="17" cy="16" r="6.5" fill="white" opacity="0.95"/>
    <circle cx="27" cy="16" r="6.5" fill="white" opacity="0.95"/>
    <circle cx="22" cy="14" r="6" fill="white" opacity="0.95"/>
    {/* Brain center line */}
    <line x1="22" y1="8" x2="22" y2="23" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Hands */}
    <path d="M9 34 Q6 28 10 25 Q15 22 17 27" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <path d="M35 34 Q38 28 34 25 Q29 22 27 27" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
  </svg>
</div>
<span style={styles.navLogoText}>RuangTenang</span>
          <span style={styles.navBadge}>Admin</span>
        </div>

        <div style={styles.navLinks}>
          <span style={styles.navLink} onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span style={styles.navLink} onClick={() => navigate("/admin/users")}>Data User</span>
          <span style={styles.navLink} onClick={() => navigate("/admin/journals")}>Data Jurnal</span>
          <span style={styles.navLink} onClick={() => navigate("/admin/articles")}>Artikel</span>
          <span style={{ ...styles.navLink, ...styles.navLinkActive }}>Data Admin</span>
          <span style={styles.navLink} onClick={() => navigate("/profile")}>Profil</span>
          <button style={styles.logoutBtn} onClick={doLogout}>Keluar</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>👑 Data Admin</h1>
            <p style={styles.subtitle}>Kelola seluruh admin RuangTenang</p>
          </div>
          <div style={styles.dateBadge}>
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* STATS CARDS */}
        <div style={styles.statsGrid}>
          {/* Total Admin Card - Soft Purple */}
          <div 
            className={clickEffect === 'admin' ? 'card-click-animation' : ''}
            style={{ 
              ...styles.statCard, 
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              background: 'linear-gradient(135deg, #A78BFA, #8B5CF6)'
            }}
            onClick={handleAdminCardClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 35px -12px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
            }}
          >
            <div style={styles.statIcon}>👑</div>
            <div style={styles.statNum}>{admins.length}</div>
            <div style={styles.statLabel}>Total Admin</div>
            <div style={styles.statTrend}>✨ Klik untuk detail</div>
          </div>

          {/* Total User Card - Soft Blue */}
          <div 
            className={clickEffect === 'user' ? 'card-click-animation' : ''}
            style={{ 
              ...styles.statCard, 
              background: "linear-gradient(135deg, #93C5FD, #60A5FA)", 
              color: "white", 
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
            }}
            onClick={handleUserCardClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 35px -12px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
            }}
          >
            <div style={styles.statIcon}>👥</div>
            <div style={{ ...styles.statNum, color: "white" }}>{allUsers.length}</div>
            <div style={{ ...styles.statLabel, color: "rgba(255,255,255,0.8)" }}>Total User</div>
            <div style={{ ...styles.statTrend, color: "rgba(255,255,255,0.7)" }}>✨ Klik untuk lihat data</div>
          </div>
        </div>

        {/* SEARCH BAR + EXPORT CSV */}
        <div style={styles.actionBar}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Cari admin berdasarkan nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button style={styles.clearBtn} onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>
          <button style={styles.exportBtn} onClick={handleExportCSV}>
            📎 Export CSV
          </button>
        </div>

        {/* TABLE */}
        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Memuat data admin...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👑</div>
              <p style={styles.emptyText}>Tidak ada admin ditemukan</p>
              <p style={styles.emptySubtext}>Coba ubah kata kunci pencarian</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.thNo}>No</th>
                  <th style={styles.th}>Nama Admin</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.thAksi}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin, i) => (
                  <tr key={admin._id} style={styles.tr}>
                    <td style={styles.tdNo}>{i + 1}</td>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>
                          {admin.nama_lengkap?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <div style={styles.userName}>{admin.nama_lengkap}</div>
                          <div style={styles.userSub}>Administrator</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{admin.email}</td>
                    <td style={styles.td}>
                      <span style={styles.badge}>👑 Admin</span>
                    </td>
                    <td style={styles.tdAksi}>
                      <div style={styles.actionWrapper}>
                        <button style={styles.editBtn} onClick={() => openEditModal(admin)}>
                          ✏️ Edit
                        </button>
                        <button style={styles.deleteBtn} onClick={() => deleteAdmin(admin._id)}>
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL EDIT ADMIN */}
      {editingAdmin && (
        <div style={styles.modalOverlay} onClick={() => setEditingAdmin(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>✏️ Edit Admin</h3>
              <button style={styles.modalClose} onClick={() => setEditingAdmin(null)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <input
                style={styles.input}
                placeholder="Nama lengkap"
                value={editForm.nama_lengkap}
                onChange={(e) => setEditForm({ ...editForm, nama_lengkap: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
              <div style={styles.modalActions}>
                <button style={styles.cancelBtn} onClick={() => setEditingAdmin(null)}>Batal</button>
                <button style={styles.saveBtn} onClick={saveEdit}>Simpan</button>
              </div>
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
    background: "#A78BFA",
    filter: "blur(120px)",
    opacity: 0.1,
    top: "-20vh",
    right: "-10vw",
    pointerEvents: "none",
    zIndex: 0,
  },
  blob2: {
    position: "fixed",
    width: "40vw",
    height: "40vw",
    borderRadius: "50%",
    background: "#93C5FD",
    filter: "blur(100px)",
    opacity: 0.08,
    bottom: "-10vh",
    left: "-10vw",
    pointerEvents: "none",
    zIndex: 0,
  },
  blob3: {
    position: "fixed",
    width: "30vw",
    height: "30vw",
    borderRadius: "50%",
    background: "#F9A8D4",
    filter: "blur(100px)",
    opacity: 0.07,
    bottom: "30vh",
    right: "20vw",
    pointerEvents: "none",
    zIndex: 0,
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
    fontWeight: 600,
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
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
    marginBottom: 32,
  },
  statCard: {
    background: "linear-gradient(135deg, #A78BFA, #8B5CF6)",
    padding: "24px 28px",
    borderRadius: 24,
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
    transition: "all 0.2s ease-in-out",
    color: "white",
    textAlign: "center",
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  statNum: {
    fontSize: 38,
    fontWeight: 800,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: 500,
    marginTop: 8,
    opacity: 0.9,
  },
  statTrend: {
    fontSize: 11,
    marginTop: 8,
    opacity: 0.8,
  },
  actionBar: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
    alignItems: "center",
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
    padding: "10px 24px",
    background: "linear-gradient(135deg, #3B82F6, #2563EB)",
    color: "white",
    border: "none",
    borderRadius: 40,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
  },
  card: {
    background: "white",
    borderRadius: 24,
    overflow: "hidden",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
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
    width: 70,
    textAlign: "center",
  },
  thAksi: {
    width: 180,
    textAlign: "center",
  },
  td: {
    padding: "16px 20px",
    fontSize: 14,
    color: "#1E293B",
    borderBottom: "1px solid #F1F5F9",
  },
  tdNo: {
    textAlign: "center",
    borderBottom: "1px solid #F1F5F9",
  },
  tdAksi: {
    textAlign: "center",
    borderBottom: "1px solid #F1F5F9",
  },
  tr: {
    transition: "background 0.2s ease",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #A78BFA, #8B5CF6)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 600,
  },
  userName: {
    fontWeight: 600,
    color: "#0F172A",
  },
  userSub: {
    fontSize: 12,
    color: "#94A3B8",
  },
  badge: {
    padding: "6px 14px",
    borderRadius: 30,
    background: "#FEF3C7",
    color: "#92400E",
    fontSize: 12,
    fontWeight: 600,
    display: "inline-block",
  },
  actionWrapper: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
  },
  editBtn: {
    padding: "6px 16px",
    fontSize: 12,
    borderRadius: 30,
    border: "1px solid #BFDBFE",
    background: "#EFF6FF",
    color: "#2563EB",
    cursor: "pointer",
    transition: "all 0.2s ease",
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
    borderTop: "3px solid #60A5FA",
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
  modal: {
    background: "white",
    borderRadius: 28,
    width: 450,
    maxWidth: "90%",
    overflow: "hidden",
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
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    fontSize: 14,
    marginBottom: 16,
    outline: "none",
    transition: "all 0.2s ease",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: 40,
    border: "1px solid #E2E8F0",
    background: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: "#475569",
  },
  saveBtn: {
    padding: "10px 24px",
    borderRadius: 40,
    border: "none",
    background: "linear-gradient(135deg, #A78BFA, #8B5CF6)",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
};