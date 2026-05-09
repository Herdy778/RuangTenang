import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import toast, { Toaster } from "react-hot-toast";


export default function AdminDataAdmin() {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // dummy data sementara
    setAdmins([
      {
        _id: 1,
        nama_lengkap: "Admin Utama",
        email: "admin@gmail.com",
        role: "admin",
      },
      {
        _id: 2,
        nama_lengkap: "Super Admin",
        email: "superadmin@gmail.com",
        role: "admin",
      },
    ]);

    setLoading(false);
  }, []);

  function doLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div style={styles.bg}>
      <Toaster position="top-right" />

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          🌿 RuangTenang Admin
        </div>

        <div style={styles.navMenu}>
          <span
            style={styles.link}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </span>

          <span
            style={styles.link}
            onClick={() => navigate("/admin/users")}
          >
            Data User
          </span>

          <span style={styles.activeLink}>
            Data Admin
          </span>

          <span
            style={styles.link}
            onClick={() => navigate("/admin/journals")}
          >
            Data Jurnal
          </span>

          <span
            style={styles.link}
            onClick={() => navigate("/admin/articles")}
          >
            Artikel
          </span>

          <button style={styles.logoutBtn} onClick={doLogout}>
            Keluar
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={styles.container}>
        <h1 style={styles.title}>Data Admin</h1>

        <div style={styles.card}>
          {loading ? (
            <p>Memuat data...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>No</th>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                </tr>
              </thead>

              <tbody>
                {admins.map((admin, i) => (
                  <tr key={admin._id}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>{admin.nama_lengkap}</td>
                    <td style={styles.td}>{admin.email}</td>
                    <td style={styles.td}>
                      <span style={styles.badge}>
                        👑 {admin.role}
                      </span>
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
    fontFamily: "sans-serif",
  },

  nav: {
    height: 64,
    background: "white",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 30px",
  },

  logo: {
    fontWeight: "bold",
    fontSize: 18,
  },

  navMenu: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  link: {
    padding: "8px 14px",
    cursor: "pointer",
  },

  activeLink: {
    padding: "8px 14px",
    background: "#EDE9FE",
    borderRadius: 8,
    color: "#7C3AED",
    fontWeight: 600,
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
    margin: "40px auto",
    padding: 20,
  },

  title: {
    fontSize: 28,
    marginBottom: 20,
  },

  card: {
    background: "white",
    borderRadius: 12,
    padding: 20,
    border: "1px solid #eee",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: 12,
    borderBottom: "1px solid #eee",
  },

  td: {
    padding: 12,
    borderBottom: "1px solid #eee",
  },

  badge: {
    padding: "4px 10px",
    borderRadius: 20,
    background: "#EDE9FE",
    color: "#7C3AED",
    fontSize: 12,
  },
};