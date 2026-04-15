import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function AdminJournals() {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJournals();
  }, []);

  async function fetchJournals() {
    try {
      const res = await API.get("/journals");
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
    await API.delete(`/journals/${id}`);
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

        {loading ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>Memuat data...</p>
          </div>
        ) : journals.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyEmoji}>📝</p>
            <p style={styles.emptyText}>
              Belum ada jurnal dari user
            </p>
          </div>
        ) : (
          <div style={styles.journalList}>
            {journals.map((j) => {
              const mood =
                moodColors[j.hasil_mood] || {
                  bg: "#F4F4F5",
                  color: "#52525B",
                  emoji: "😐",
                };
                const status = j.status || "normal"; // ✅ aman

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
                  </div>
                  <div style={{ marginTop: 10 }}>
  <button onClick={() => updateStatus(j._id, "perhatian")}>
    ⚠️
  </button>

  <button onClick={() => updateStatus(j._id, "darurat")}>
    🚨
  </button>

  <button
  onClick={() => handleDelete(j._id)}>
  🗑️
</button>
</div>
                </div>
              );
            })}
          </div>
        )}
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
};