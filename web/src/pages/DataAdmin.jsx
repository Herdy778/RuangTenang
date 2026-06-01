import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import API from "../utils/api";

export default function DataAdmin() {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // EDIT
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [editForm, setEditForm] = useState({
    nama_lengkap: "",
    email: "",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      setLoading(true);

      const res = await API.get("/admin/users");

      const data = res.data.data || [];

      const adminOnly = data.filter(
        (user) => user.role === "admin"
      );

      setAdmins(adminOnly);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data admin");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAdmin(id) {
    const confirmDelete = window.confirm(
      "⚠️ Hapus admin ini?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/admin/users/${id}`);

      toast.success("Admin berhasil dihapus");

      fetchAdmins();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus admin");
    }
  }

  // BUKA MODAL EDIT
  function openEditModal(admin) {
    setEditingAdmin(admin);

    setEditForm({
      nama_lengkap: admin.nama_lengkap || "",
      email: admin.email || "",
    });
  }

  // SIMPAN EDIT
  async function saveEdit() {
    try {
      await API.put(
        `/admin/users/${editingAdmin._id}`,
        editForm
      );

      toast.success("Data admin berhasil diupdate");

      setEditingAdmin(null);

      fetchAdmins();
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

  return (
    <div style={styles.bg}>
      <Toaster position="top-right" />

      {/* BACKGROUND */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      {/* NAVBAR */}
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
            style={styles.navLink}
            onClick={() => navigate("/admin/journals")}
          >
            Data Jurnal
          </span>

          <span
            style={styles.navLink}
            onClick={() => navigate("/admin/articles")}
          >
            Artikel
          </span>

          <span
            style={{
              ...styles.navLink,
              ...styles.navLinkActive,
            }}
          >
            Data Admin
          </span>

          <span
            style={styles.navLink}
            onClick={() => navigate("/profile")}
          >
            Profil
          </span>
          
          <span 
            style={styles.navLink} 
            onClick={() => navigate('/api-tester')}
            >
              🧪 API
            </span>

          <button
            style={styles.logoutBtn}
            onClick={doLogout}
          >
            Keluar
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              👑 Data Admin
            </h1>

            <p style={styles.subtitle}>
              Kelola seluruh admin RuangTenang
            </p>
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

        {/* STAT CARD */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👑</div>

            <div style={styles.statNum}>
              {admins.length}
            </div>

            <div style={styles.statLabel}>
              Total Admin
            </div>

            <div style={styles.statTrend}>
              Admin aktif RuangTenang
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>

              <p>Memuat data admin...</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.thNo}>No</th>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.thAksi}>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {admins.map((admin, i) => (
                  <tr
                    key={admin._id}
                    style={styles.tr}
                  >
                    <td style={styles.tdNo}>
                      {i + 1}
                    </td>

                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>
                          👤
                        </div>

                        <div>
                          <div style={styles.userName}>
                            {admin.nama_lengkap}
                          </div>

                          <div style={styles.userSub}>
                            Administrator
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      {admin.email}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.badge}>
                        👑 Admin
                      </span>
                    </td>

                    <td style={styles.tdAksi}>
                      <div style={styles.actionWrapper}>
                        <button
                          style={styles.editBtn}
                          onClick={() =>
                            openEditModal(admin)
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          style={styles.deleteBtn}
                          onClick={() =>
                            deleteAdmin(admin._id)
                          }
                        >
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

      {/* MODAL EDIT */}
      {editingAdmin && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              ✏️ Edit Admin
            </h2>

            <input
              style={styles.input}
              placeholder="Nama lengkap"
              value={editForm.nama_lengkap}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  nama_lengkap:
                    e.target.value,
                })
              }
            />

            <input
              style={styles.input}
              placeholder="Email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  email: e.target.value,
                })
              }
            />

            <div style={styles.modalActions}>
              <button
                style={styles.cancelBtn}
                onClick={() =>
                  setEditingAdmin(null)
                }
              >
                Batal
              </button>

              <button
                style={styles.saveBtn}
                onClick={saveEdit}
              >
                Simpan
              </button>
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
    background: "#818CF8",
    filter: "blur(120px)",
    opacity: 0.12,
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
    background: "#34D399",
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
    background: "#F472B6",
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
    background:
      "rgba(255,255,255,0.92)",
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
    padding: "32px 24px",
    position: "relative",
    zIndex: 1,
  },

  header: {
    marginBottom: 32,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#0F172A",
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
  },

 statsGrid: {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 20,
  marginBottom: 32,
},

  statCard: {
  width: "100%",
  background: "linear-gradient(135deg, #6366F1, #818CF8)",
  padding: "28px 32px",
  borderRadius: 24,
  border: "1px solid #E2E8F0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
  transition: "all 0.2s ease",
  color: "white",
},

  statIcon: {
    fontSize: 28,
    marginBottom: 12,
  },

  statNum: {
    fontSize: 34,
    fontWeight: 800,
  },

  statLabel: {
    marginTop: 6,
  },

  statTrend: {
    fontSize: 12,
    marginTop: 10,
    opacity: 0.8,
  },

  card: {
    background: "white",
    borderRadius: 24,
    overflow: "hidden",
    border: "1px solid #E2E8F0",
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
    width: 220,
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
    position: "relative",
    zIndex: 2,
  },

  tr: {
    position: "relative",
  },

  userCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    background: "#EEF2FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  userName: {
    fontWeight: 600,
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
    padding: 50,
    textAlign: "center",
  },

  spinner: {
    width: 40,
    height: 40,
    border:
      "3px solid #E2E8F0",
    borderTop:
      "3px solid #6366F1",
    borderRadius: "50%",
    margin: "0 auto 16px",
    animation:
      "spin 1s linear infinite",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  modal: {
    background: "white",
    padding: 28,
    borderRadius: 24,
    width: 400,
  },

  modalTitle: {
    marginBottom: 20,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    marginBottom: 16,
    fontSize: 14,
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },

  cancelBtn: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    background: "white",
    cursor: "pointer",
  },

  saveBtn: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "none",
    background: "#4F46E5",
    color: "white",
    cursor: "pointer",
  },
};

const styleSheet =
  document.createElement("style");

styleSheet.textContent = `
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
`;

document.head.appendChild(styleSheet);