import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function AdminManajemen() {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([
    {
      id: 1,
      nama: "Gusti Ayu Dhyananti",
      email: "gusti@example.com",
      role: "Super Admin",
      status: "Aktif",
    },
    {
      id: 2,
      nama: "Budi Santoso",
      email: "budi@example.com",
      role: "Admin",
      status: "Aktif",
    },
  ]);

  const [search, setSearch] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    role: "Admin",
    status: "Aktif",
  });

  const filteredAdmins = useMemo(() => {
    return admins.filter(
      (admin) =>
        admin.nama.toLowerCase().includes(search.toLowerCase()) ||
        admin.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [admins, search]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function resetForm() {
    setForm({
      nama: "",
      email: "",
      password: "",
      role: "Admin",
      status: "Aktif",
    });

    setIsEdit(false);
    setSelectedId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.nama || !form.email || !form.role) {
      toast.error("Lengkapi semua data");
      return;
    }

    if (isEdit) {
      const updated = admins.map((admin) =>
        admin.id === selectedId
          ? {
              ...admin,
              nama: form.nama,
              email: form.email,
              role: form.role,
              status: form.status,
            }
          : admin
      );

      setAdmins(updated);
      toast.success("Data admin berhasil diupdate");
    } else {
      const newAdmin = {
        id: Date.now(),
        nama: form.nama,
        email: form.email,
        role: form.role,
        status: form.status,
      };

      setAdmins([...admins, newAdmin]);
      toast.success("Admin berhasil ditambahkan");
    }

    resetForm();
  }

  function handleEdit(admin) {
    setIsEdit(true);
    setSelectedId(admin.id);

    setForm({
      nama: admin.nama,
      email: admin.email,
      password: "",
      role: admin.role,
      status: admin.status,
    });
  }

  function handleDelete(id) {
    const confirmDelete = window.confirm("Yakin ingin menghapus admin?");

    if (!confirmDelete) return;

    const filtered = admins.filter((admin) => admin.id !== id);
    setAdmins(filtered);

    toast.success("Admin berhasil dihapus");
  }

  return (
    <div style={styles.bg}>
      <Toaster position="top-right" />

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
            style={{ ...styles.navLink, ...styles.navLinkActive }}
          >
            Admin Manajemen
          </span>

          <button style={styles.logoutBtn}>
            Keluar
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Manajemen</h1>

          <p style={styles.subtitle}>
            Tambah, edit, dan hapus data admin aplikasi
          </p>
        </div>

        {/* CARD FORM */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              {isEdit ? "Edit Admin" : "Tambah Admin"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={styles.formGrid}>
            <div>
              <label style={styles.label}>Nama Lengkap</label>

              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Email</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Masukkan email"
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Password</label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Role</label>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Admin">👑 Admin</option>
                <option value="Super Admin">⭐ Super Admin</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Aktif">🟢 Aktif</option>
                <option value="Nonaktif">🔴 Nonaktif</option>
              </select>
            </div>

            <div style={styles.buttonWrapper}>
              <button type="submit" style={styles.primaryBtn}>
                {isEdit ? "Update Admin" : "Tambah Admin"}
              </button>

              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={resetForm}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* SEARCH */}
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="🔍 Cari admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* TABLE */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>No</th>
                <th style={styles.th}>Nama</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredAdmins.map((admin, index) => (
                <tr key={admin.id}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{admin.nama}</td>
                  <td style={styles.td}>{admin.email}</td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background:
                          admin.role === "Super Admin"
                            ? "#FEF3C7"
                            : "#EDE9FE",
                        color:
                          admin.role === "Super Admin"
                            ? "#92400E"
                            : "#7C3AED",
                      }}
                    >
                      {admin.role}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background:
                          admin.status === "Aktif"
                            ? "#F0FDF4"
                            : "#FEF2F2",
                        color:
                          admin.status === "Aktif"
                            ? "#166534"
                            : "#DC2626",
                      }}
                    >
                      {admin.status}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.actionWrapper}>
                      <button
                        style={styles.editBtn}
                        onClick={() => handleEdit(admin)}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(admin.id)}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    background: "#FAFAFA",
    fontFamily: "DM Sans, sans-serif",
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
    fontSize: 18,
    fontWeight: 600,
    color: "#18181B",
  },

  navLinks: {
    display: "flex",
    gap: 10,
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
    fontWeight: 600,
  },

  logoutBtn: {
    padding: "8px 16px",
    border: "1px solid #E4E4E7",
    background: "white",
    borderRadius: 8,
    cursor: "pointer",
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 24px",
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 40,
    fontWeight: 700,
    color: "#18181B",
  },

  subtitle: {
    fontSize: 14,
    color: "#71717A",
    marginTop: 6,
  },

  card: {
    background: "white",
    borderRadius: 18,
    border: "1px solid #F4F4F5",
    overflow: "hidden",
    marginBottom: 24,
  },

  cardHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #F4F4F5",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#18181B",
  },

  formGrid: {
    padding: 24,
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

  buttonWrapper: {
    display: "flex",
    gap: 12,
    alignItems: "end",
  },

  primaryBtn: {
    padding: "12px 18px",
    background: "#7C3AED",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 500,
  },

  secondaryBtn: {
    padding: "12px 18px",
    background: "white",
    color: "#52525B",
    border: "1px solid #E4E4E7",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 500,
  },

  searchWrapper: {
    marginBottom: 20,
  },

  searchInput: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #E4E4E7",
    background: "white",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "16px 20px",
    fontSize: 13,
    color: "#71717A",
    borderBottom: "1px solid #F4F4F5",
  },

  td: {
    padding: "16px 20px",
    fontSize: 14,
    color: "#18181B",
    borderBottom: "1px solid #F4F4F5",
  },

  badge: {
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },

  actionWrapper: {
    display: "flex",
    gap: 10,
  },

  editBtn: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #E4E4E7",
    background: "white",
    cursor: "pointer",
  },

  deleteBtn: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #FECACA",
    background: "#FEF2F2",
    color: "#DC2626",
    cursor: "pointer",
  },
};