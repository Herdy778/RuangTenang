import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "Gusti Ayu Dhyananti",
    email: "ayudhyananti@gmail.com",
    role: "admin",
    bio: "Tetap tenang, tetap bertumbuh 🌿",
    joined: "Mei 2026",
    mood: "Burnout 😤",
  });

  const [formData, setFormData] = useState(user);

  return (
    <div style={styles.bg}>
      {/* BACKGROUND */}
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
  onClick={() => navigate("/admin/manajemen")}
>
  Manajemen Admin
</span>

          {/* ACTIVE */}
          <span style={{ ...styles.navLink, ...styles.navLinkActive }}>
            Profile
          </span>

          <button style={styles.logoutBtn}>
            Keluar
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Profile Admin
          </h1>

          <p style={styles.subtitle}>
            Kelola informasi akun admin RuangTenang
          </p>
        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>
          <div style={styles.statsCard}>
            <div style={styles.statsNumber}>
              19
            </div>

            <div style={styles.statsLabel}>
              Total Jurnal
            </div>
          </div>

          <div style={styles.statsCard}>
            <div style={{ ...styles.statsNumber, color: "#7C3AED" }}>
              {user.mood}
            </div>

            <div style={styles.statsLabel}>
              Mood Dominan
            </div>
          </div>

          <div style={styles.statsCard}>
            <div style={{ ...styles.statsNumber, color: "#166534" }}>
              {user.joined}
            </div>

            <div style={styles.statsLabel}>
              Bergabung Sejak
            </div>
          </div>
        </div>

        {/* PROFILE CARD */}
        <div style={styles.card}>
          {/* HEADER */}
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Informasi Profile
              </h2>

              <p style={styles.cardSubtitle}>
                Data lengkap admin RuangTenang
              </p>
            </div>
          </div>

          {/* BODY */}
          <div style={styles.cardBody}>
            {/* PROFILE TOP */}
            <div style={styles.profileTop}>
              {/* AVATAR */}
              <div style={styles.avatarWrapper}>
                <div style={styles.avatar}>
                  G
                </div>

                <div style={styles.onlineDot} />
              </div>

              {/* USER INFO */}
              <div style={styles.profileInfo}>
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
                    Admin
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

                <p style={styles.bio}>
                  {user.bio}
                </p>
              </div>
            </div>

            {/* FORM */}
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

              {/* ROLE */}
              <div>
                <label style={styles.label}>
                Role
              </label>

              <select
              value={user.role}
              onChange={(e) =>
              setUser({
              ...user,
              role: e.target.value,
              })
              }
              style={styles.select}
              >
              <option value="admin">Admin</option>
              <option value="user">User</option>
              </select>
              </div>

              <div>
                <label style={styles.label}>
                  Bergabung Sejak
                </label>

                <input
                  type="text"
                  defaultValue={user.joined}
                  style={styles.input}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
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

            {/* BUTTON */}
            <div style={styles.buttonGroup}>
              <button
              style={styles.primaryBtn}
              onClick={() => alert("Perubahan berhasil disimpan")}
              >
              Simpan Perubahan
              </button>

<button
  style={styles.secondaryBtn}
  onClick={() => window.location.reload()}
>
  Batal
</button>
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
    fontSize: 42,
    fontWeight: 700,
    color: "#18181B",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#71717A",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24,
  },

  statsCard: {
    background: "white",
    padding: 24,
    borderRadius: 16,
    border: "1px solid #F4F4F5",
    textAlign: "center",
  },

  statsNumber: {
    fontSize: 36,
    fontWeight: 700,
    color: "#18181B",
  },

  statsLabel: {
    fontSize: 14,
    color: "#71717A",
    marginTop: 10,
  },

  card: {
    background: "white",
    borderRadius: 20,
    border: "1px solid #F4F4F5",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    overflow: "hidden",
  },

  cardHeader: {
    padding: "24px 28px",
    borderBottom: "1px solid #F4F4F5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#18181B",
  },

  cardSubtitle: {
    fontSize: 14,
    color: "#71717A",
    marginTop: 4,
  },

  saveBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },

  cardBody: {
    padding: 28,
  },

  profileTop: {
    display: "flex",
    gap: 24,
    alignItems: "center",
    paddingBottom: 28,
    borderBottom: "1px solid #F4F4F5",
    marginBottom: 28,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: 42,
    fontWeight: 700,
  },

  onlineDot: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#22C55E",
    border: "3px solid white",
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 34,
    fontWeight: 700,
    color: "#18181B",
  },

  profileEmail: {
    fontSize: 16,
    color: "#71717A",
    marginTop: 6,
  },

  badgeGroup: {
    display: "flex",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },

  badge: {
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
  },

  bio: {
    marginTop: 18,
    fontSize: 15,
    lineHeight: 1.7,
    color: "#52525B",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 20,
  },

  label: {
    display: "block",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 500,
    color: "#52525B",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #E4E4E7",
    background: "#FAFAFA",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },

  select: {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid #E4E4E7",
  background: "#FAFAFA",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  cursor: "pointer",
  },

  textarea: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #E4E4E7",
    background: "#FAFAFA",
    fontSize: 14,
    outline: "none",
    resize: "none",
    boxSizing: "border-box",
  },

  buttonGroup: {
    display: "flex",
    gap: 12,
    marginTop: 28,
  },

  primaryBtn: {
    padding: "12px 20px",
    background: "#7C3AED",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },

  secondaryBtn: {
    padding: "12px 20px",
    background: "white",
    color: "#52525B",
    border: "1px solid #E4E4E7",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },
};