import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
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
    }
  };

  const handleSave = async () => {
    try {
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
        alert("Profil berhasil diperbarui");
      } else {
        alert(result.pesan);
      }
    } catch (error) {
      console.log(error);
      alert("Gagal update profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={styles.navLogoIcon}>🌿</span>
          <span style={styles.navLogoText}>
            RuangTenang Admin
          </span>
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
            style={styles.navLink}
            onClick={() =>
              navigate("/admin/manajemen")
            }
          >
            Manajemen Admin
          </span>

          <span
            style={{
              ...styles.navLink,
              ...styles.navLinkActive,
            }}
          >
            Profile
          </span>

          <button
            style={styles.logoutBtn}
            onClick={handleLogout}
          >
            Keluar
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Profile Admin
          </h1>

          <p style={styles.subtitle}>
            Kelola informasi akun admin
            RuangTenang
          </p>
        </div>

        <div style={styles.profileLayout}>
          {/* LEFT */}
          <div style={styles.sideCard}>
            <div style={styles.avatarWrapper}>
              <div style={styles.avatar}>
                {user.name.charAt(0)}
              </div>

              <div style={styles.onlineDot} />
            </div>

            <h2 style={styles.profileName}>
              {user.name}
            </h2>

            <p style={styles.profileEmail}>
              {user.email}
            </p>

            <div style={styles.badgeGroup}>
              <span
                style={{
                  ...styles.badge,
                  background: "#EDE9FE",
                  color: "#7C3AED",
                }}
              >
                {user.role}
              </span>

              <span
                style={{
                  ...styles.badge,
                  background: "#F0FDF4",
                  color: "#166534",
                }}
              >
                Aktif
              </span>
            </div>

            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <span>Bergabung</span>
                <strong>{user.joined}</strong>
              </div>

              <div style={styles.infoItem}>
                <span>Mood</span>
                <strong>{user.mood}</strong>
              </div>
            </div>

            <p style={styles.bio}>
              {user.bio}
            </p>
          </div>

          {/* RIGHT */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                Edit Profile
              </h2>

              <p style={styles.cardSubtitle}>
                Perbarui informasi akun
              </p>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>
                    Nama Lengkap
                  </label>

                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        name: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    Email
                  </label>

                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        email: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    Bio
                  </label>

                  <textarea
                    rows="5"
                    value={user.bio}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        bio: e.target.value,
                      })
                    }
                    style={styles.textarea}
                  />
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  style={styles.primaryBtn}
                  onClick={handleSave}
                >
                  Simpan Perubahan
                </button>

                <button
                  style={styles.secondaryBtn}
                  onClick={fetchProfile}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
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
    justifyContent: "space-between",
    alignItems: "center",
    height: 64,
    zIndex: 100,
  },

  navLogo: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  navLogoIcon: {
    fontSize: 22,
  },

  navLogoText: {
    fontSize: 18,
    fontWeight: 600,
  },

  navLinks: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  navLink: {
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    color: "#52525B",
  },

  navLinkActive: {
    background: "#EDE9FE",
    color: "#7C3AED",
    fontWeight: 600,
  },

  logoutBtn: {
    padding: "8px 16px",
    border: "1px solid #E4E4E7",
    borderRadius: 8,
    background: "white",
    cursor: "pointer",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 24px",
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 34,
    fontWeight: 700,
  },

  subtitle: {
    color: "#71717A",
  },

  profileLayout: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 24,
  },

  sideCard: {
    background: "white",
    borderRadius: 20,
    padding: 28,
    textAlign: "center",
    border: "1px solid #F4F4F5",
    height: "fit-content",
  },

  avatarWrapper: {
    position: "relative",
    display: "inline-block",
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#A78BFA,#7C3AED)",
    color: "white",
    fontSize: 32,
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
    marginTop: 16,
    fontSize: 22,
    fontWeight: 700,
  },

  profileEmail: {
    color: "#71717A",
    marginTop: 4,
  },

  badgeGroup: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },

  badge: {
    padding: "6px 12px",
    borderRadius: 20,
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
    background: "#FAFAFA",
    padding: "12px 14px",
    borderRadius: 10,
  },

  bio: {
    marginTop: 20,
    color: "#52525B",
  },

  card: {
    background: "white",
    borderRadius: 20,
    border: "1px solid #F4F4F5",
  },

  cardHeader: {
    padding: 24,
    borderBottom: "1px solid #F4F4F5",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
  },

  cardSubtitle: {
    color: "#71717A",
    marginTop: 4,
  },

  cardBody: {
    padding: 24,
  },

  formGrid: {
    display: "grid",
    gap: 18,
  },

  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: 500,
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    border: "1px solid #E4E4E7",
    background: "#FAFAFA",
  },

  textarea: {
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    border: "1px solid #E4E4E7",
    background: "#FAFAFA",
    resize: "none",
  },

  buttonGroup: {
    display: "flex",
    gap: 12,
    marginTop: 24,
  },

  primaryBtn: {
    padding: "12px 20px",
    borderRadius: 10,
    border: "none",
    background: "#7C3AED",
    color: "white",
    cursor: "pointer",
  },

  secondaryBtn: {
    padding: "12px 20px",
    borderRadius: 10,
    border: "1px solid #E4E4E7",
    background: "white",
    cursor: "pointer",
  },
};