import { useEffect, useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(id, role) {
    try {
      await API.put(`/admin/users/${id}`, { role });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteUser(id) {
    if (!confirm("Hapus user ini?")) return;

    try {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
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
          <span
            style={styles.navLink}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </span>

          <span
            style={{
              ...styles.navLink,
              ...styles.navLinkActive,
            }}
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

          <button style={styles.logoutBtn} onClick={doLogout}>
            Keluar
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Data Pengguna</h1>
          <p style={styles.subtitle}>
            Daftar semua pengguna aplikasi RuangTenang
          </p>
        </div>

        {/* CARD */}
        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>Memuat data...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>No</th>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={styles.tr}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>{u.nama_lengkap}</td>
                    <td style={styles.td}>{u.email}</td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background:
                            u.role === "admin"
                              ? "#EDE9FE"
                              : "#F0FDF4",
                          color:
                            u.role === "admin"
                              ? "#7C3AED"
                              : "#166534",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <button
                        style={styles.actionBtn}
                        onClick={() =>
                          updateRole(
                            u._id,
                            u.role === "admin"
                              ? "mahasiswa"
                              : "admin"
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        style={styles.deleteBtn}
                        onClick={() => deleteUser(u._id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

  card: {
    background: "white",
    borderRadius: 16,
    border: "1px solid #F4F4F5",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    overflow: "hidden",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "14px 18px",
    fontSize: 13,
    color: "#71717A",
    borderBottom: "1px solid #F4F4F5",
  },

  td: {
    padding: "14px 18px",
    fontSize: 14,
    color: "#18181B",
    borderBottom: "1px solid #F4F4F5",
  },

  tr: {
    transition: "0.2s",
  },

  badge: {
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },

  actionBtn: {
    padding: "6px 12px",
    fontSize: 13,
    borderRadius: 8,
    border: "1px solid #E4E4E7",
    background: "white",
    cursor: "pointer",
    marginRight: 8,
  },

  deleteBtn: {
    padding: "6px 12px",
    fontSize: 13,
    borderRadius: 8,
    border: "1px solid #FECACA",
    background: "#FEF2F2",
    color: "#DC2626",
    cursor: "pointer",
  },

  loading: {
    padding: 30,
    textAlign: "center",
    color: "#71717A",
  },
};