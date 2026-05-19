import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    bio: "",
    joined: "-",
    mood: "🌿",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setUser({
          name: result.user.nama_lengkap,
          email: result.user.email,
          role: result.user.role,
          bio: result.user.bio || "Tetap tenang, tetap bertumbuh 🌿",
          joined: result.user.created_at
            ? new Date(result.user.created_at).toLocaleDateString(
                "id-ID",
                {
                  month: "long",
                  year: "numeric",
                }
              )
            : "-",
          mood: "🌿",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nama_lengkap: user.name,
            email: user.email,
            bio: user.bio,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Profil berhasil diperbarui");
      } else {
        toast.error(result.pesan || "Gagal update profile");
      }
    } catch (error) {
      console.log(error);
      toast.error("Gagal update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Berhasil keluar");
    navigate("/");
  };

  // Fungsi untuk mendapatkan badge role
  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return { background: "#FEF3C7", color: "#92400E", icon: "👑", label: "Admin" };
      case "psikolog":
        return { background: "#EDE9FE", color: "#5B21B6", icon: "🧠", label: "Psikolog" };
      case "mahasiswa":
        return { background: "#ECFDF5", color: "#065F46", icon: "🎓", label: "Mahasiswa" };
      default:
        return { background: "#F1F5F9", color: "#475569", icon: "👤", label: role || "Pengguna" };
    }
  };

  const roleStyle = getRoleBadge(user.role);

  return (
    <div style={styles.bg}>
      <Toaster position="top-right" />
      
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      {/* NAVBAR - Tanpa Manajemen Admin */}
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
          <span style={styles.navLink} onClick={() => navigate("/admin/articles")}>Artikel</span>
          <span style={styles.navLink} onClick={() => navigate("/admin/data-admin")}>Data Admin</span>
          <span style={{ ...styles.navLink, ...styles.navLinkActive }}>Profil</span>
          <span style={styles.navLink} onClick={() => navigate('/api-tester')}>🧪 API</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Keluar</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>👤 Profil Admin</h1>
            <p style={styles.subtitle}>Kelola informasi akun Anda</p>
          </div>
          <div style={styles.dateBadge}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Memuat profil...</p>
          </div>
        ) : (
          <div style={styles.profileLayout}>
            {/* LEFT - Profile Card */}
            <div style={styles.sideCard}>
              <div style={styles.avatarWrapper}>
                <div style={styles.avatar}>
                  {user.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div style={styles.onlineDot} />
              </div>

              <h2 style={styles.profileName}>{user.name}</h2>
              <p style={styles.profileEmail}>{user.email}</p>

              <div style={styles.badgeGroup}>
                <span style={{ ...styles.badge, background: roleStyle.background, color: roleStyle.color }}>
                  {roleStyle.icon} {roleStyle.label}
                </span>
                <span style={{ ...styles.badge, background: "#F0FDF4", color: "#166534" }}>
                  ✅ Aktif
                </span>
              </div>

              <div style={styles.infoList}>
                <div style={styles.infoItem}>
                  <span>📅 Bergabung</span>
                  <strong>{user.joined}</strong>
                </div>
                <div style={styles.infoItem}>
                  <span>😊 Mood Hari Ini</span>
                  <strong>{user.mood}</strong>
                </div>
              </div>

              <div style={styles.bioSection}>
                <p style={styles.bioLabel}>📝 Bio</p>
                <p style={styles.bio}>{user.bio}</p>
              </div>
            </div>

            {/* RIGHT - Edit Form */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>✏️ Edit Profile</h2>
                <p style={styles.cardSubtitle}>Perbarui informasi akun Anda</p>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Nama Lengkap</label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      style={styles.input}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Email</label>
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      style={styles.input}
                      placeholder="Masukkan email"
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Bio</label>
                    <textarea
                      rows="4"
                      value={user.bio}
                      onChange={(e) => setUser({ ...user, bio: e.target.value })}
                      style={styles.textarea}
                      placeholder="Tuliskan bio singkat tentang Anda..."
                    />
                  </div>
                </div>

                <div style={styles.buttonGroup}>
                  <button style={styles.primaryBtn} onClick={handleSave} disabled={saving}>
                    {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
                  </button>
                  <button style={styles.secondaryBtn} onClick={fetchProfile}>
                    🔄 Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
  profileLayout: {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: 24,
  },
  sideCard: {
    background: "white",
    borderRadius: 24,
    padding: "28px 24px",
    textAlign: "center",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
    height: "fit-content",
  },
  avatarWrapper: {
    position: "relative",
    display: "inline-block",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366F1, #A855F7)",
    color: "white",
    fontSize: 36,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    right: 5,
    bottom: 5,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#22C55E",
    border: "3px solid white",
  },
  profileName: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: 700,
    color: "#0F172A",
  },
  profileEmail: {
    color: "#64748B",
    marginTop: 4,
    fontSize: 13,
  },
  badgeGroup: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
  },
  badge: {
    padding: "6px 14px",
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 600,
  },
  infoList: {
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    background: "#F8FAFC",
    padding: "12px 16px",
    borderRadius: 12,
    fontSize: 13,
  },
  bioSection: {
    marginTop: 20,
    textAlign: "left",
  },
  bioLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748B",
    marginBottom: 8,
  },
  bio: {
    color: "#334155",
    fontSize: 13,
    lineHeight: 1.5,
    background: "#F8FAFC",
    padding: "12px 16px",
    borderRadius: 12,
  },
  card: {
    background: "white",
    borderRadius: 24,
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #E2E8F0",
    background: "#F8FAFC",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0F172A",
  },
  cardSubtitle: {
    color: "#64748B",
    marginTop: 4,
    fontSize: 13,
  },
  cardBody: {
    padding: "24px",
  },
  formGrid: {
    display: "grid",
    gap: 20,
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: 500,
    fontSize: 13,
    color: "#475569",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    fontSize: 14,
    outline: "none",
    transition: "all 0.2s ease",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    fontSize: 14,
    resize: "vertical",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  buttonGroup: {
    display: "flex",
    gap: 12,
    marginTop: 28,
  },
  primaryBtn: {
    padding: "12px 24px",
    borderRadius: 40,
    border: "none",
    background: "linear-gradient(135deg, #6366F1, #4F46E5)",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  secondaryBtn: {
    padding: "12px 24px",
    borderRadius: 40,
    border: "1px solid #E2E8F0",
    background: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: "#475569",
    transition: "all 0.2s ease",
  },
};

// CSS untuk animasi spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);