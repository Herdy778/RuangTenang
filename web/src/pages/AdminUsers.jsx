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

  const [sortConfig, setSortConfig] = useState({
    key: "nama_lengkap",
    direction: "asc",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);

      const res = await API.get("/admin/users");
      const data = res.data.data || [];

      // HANYA TAMPILKAN USER MAHASISWA
      const mahasiswaOnly = data.filter(
        (user) => user.role === "mahasiswa"
      );

      setAllUsers(mahasiswaOnly);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }

  const getSortedUsers = useMemo(() => {
    let filtered = [...allUsers];

    // SEARCH
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nama_lengkap
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // SORT
    const sorted = [...filtered];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal)
          return sortConfig.direction === "asc" ? -1 : 1;

        if (aVal > bVal)
          return sortConfig.direction === "asc" ? 1 : -1;

        return 0;
      });
    }

    return sorted;
  }, [allUsers, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  async function deleteUser(id) {
    if (!confirm("Hapus user ini?")) return;

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

  const handleExportCSV = () => {
    const headers = ["No", "Nama Lengkap", "Email"];

    const csvData = getSortedUsers.map((user, i) => [
      i + 1,
      user.nama_lengkap,
      user.email,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date()
      .toISOString()
      .slice(0, 19)}.csv`;

    a.click();

    URL.revokeObjectURL(url);

    toast.success("Data berhasil diexport");
  };

  const paginatedUsers = getSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={styles.bg}>
      <Toaster position="top-right" />

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

          <button
            style={styles.logoutBtn}
            onClick={doLogout}
          >
            Keluar
          </button>
          <button
            onClick={() => navigate("/admin/manajemen")}
          >
            Manajemen Admin
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Data Pengguna</h1>

          <p style={styles.subtitle}>
            Daftar seluruh mahasiswa pengguna aplikasi
            RuangTenang
          </p>
        </div>

        {/* CARD TOTAL */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #F4F4F5",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#166534",
              }}
            >
              {totalUsers}
            </div>

            <div
              style={{
                fontSize: 14,
                color: "#71717A",
              }}
            >
              Total Mahasiswa
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <input
            type="text"
            placeholder="🔍 Cari user berdasarkan nama atau email..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            style={{
              flex: 1,
              padding: "10px 14px",
              border: "1px solid #E4E4E7",
              borderRadius: 8,
              fontSize: 14,
            }}
          />

          <button
            onClick={handleExportCSV}
            style={styles.exportBtn}
          >
            📎 Export CSV
          </button>
        </div>

        {/* TABLE */}
        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>
              Memuat data...
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.thNo}>No</th>

                  <th
                    style={styles.th}
                    onClick={() =>
                      handleSort("nama_lengkap")
                    }
                  >
                    Nama{" "}
                    {getSortIcon("nama_lengkap")}
                  </th>

                  <th
                    style={styles.th}
                    onClick={() =>
                      handleSort("email")
                    }
                  >
                    Email {getSortIcon("email")}
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                  <th style={styles.thAksi}>
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.map((u, i) => (
                  <tr key={u._id} style={styles.tr}>
                    <td style={styles.tdNo}>
                      {(currentPage - 1) *
                        itemsPerPage +
                        i +
                        1}
                    </td>

                    <td style={styles.td}>
                      {u.nama_lengkap}
                    </td>

                    <td style={styles.td}>
                      {u.email}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background: "#F0FDF4",
                          color: "#166534",
                        }}
                      >
                        🎓 Mahasiswa
                      </span>
                    </td>

                    <td style={styles.tdAksi}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() =>
                          deleteUser(u._id)
                        }
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PAGINATION */}
          <div style={styles.pagination}>
            <div style={styles.paginationInfo}>
              Menampilkan{" "}
              {((currentPage - 1) * itemsPerPage) + 1} -{" "}
              {Math.min(
                currentPage * itemsPerPage,
                getSortedUsers.length
              )}{" "}
              dari {getSortedUsers.length} data
            </div>

            <div style={styles.paginationControls}>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(
                    Number(e.target.value)
                  );
                  setCurrentPage(1);
                }}
                style={styles.perPageSelect}
              >
                <option value={10}>
                  10 / halaman
                </option>

                <option value={25}>
                  25 / halaman
                </option>

                <option value={50}>
                  50 / halaman
                </option>
              </select>

              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageBtn,
                  opacity:
                    currentPage === 1 ? 0.5 : 1,
                }}
              >
                «
              </button>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                disabled={currentPage === 1}
                style={{
                  ...styles.pageBtn,
                  opacity:
                    currentPage === 1 ? 0.5 : 1,
                }}
              >
                ‹
              </button>

              <span style={styles.pageInfo}>
                Halaman {currentPage} dari{" "}
                {Math.ceil(
                  getSortedUsers.length /
                    itemsPerPage
                ) || 1}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(
                        getSortedUsers.length /
                          itemsPerPage
                      )
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(
                    getSortedUsers.length /
                      itemsPerPage
                  )
                }
                style={{
                  ...styles.pageBtn,
                  opacity:
                    currentPage ===
                    Math.ceil(
                      getSortedUsers.length /
                        itemsPerPage
                    )
                      ? 0.5
                      : 1,
                }}
              >
                ›
              </button>

              <button
                onClick={() =>
                  setCurrentPage(
                    Math.ceil(
                      getSortedUsers.length /
                        itemsPerPage
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(
                    getSortedUsers.length /
                      itemsPerPage
                  )
                }
                style={{
                  ...styles.pageBtn,
                  opacity:
                    currentPage ===
                    Math.ceil(
                      getSortedUsers.length /
                        itemsPerPage
                    )
                      ? 0.5
                      : 1,
                }}
              >
                »
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
    cursor: "pointer",
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

  thNo: {
    textAlign: "center",
    padding: "14px 18px",
    fontSize: 13,
    fontWeight: 600,
    color: "#71717A",
    borderBottom: "1px solid #F4F4F5",
    width: 60,
  },

  thAksi: {
    textAlign: "center",
    padding: "14px 18px",
    fontSize: 13,
    fontWeight: 600,
    color: "#71717A",
    borderBottom: "1px solid #F4F4F5",
    width: 120,
  },

  tdNo: {
    textAlign: "center",
    padding: "14px 18px",
    fontSize: 14,
    color: "#71717A",
    borderBottom: "1px solid #F4F4F5",
  },

  tdAksi: {
    textAlign: "center",
    padding: "14px 18px",
    borderBottom: "1px solid #F4F4F5",
  },

  exportBtn: {
    padding: "10px 20px",
    background:
      "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },

  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderTop: "1px solid #F4F4F5",
    flexWrap: "wrap",
    gap: 12,
  },

  paginationInfo: {
    fontSize: 13,
    color: "#71717A",
  },

  paginationControls: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  perPageSelect: {
    padding: "6px 10px",
    border: "1px solid #E4E4E7",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
  },

  pageBtn: {
    padding: "6px 12px",
    border: "1px solid #E4E4E7",
    background: "white",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
  },

  pageInfo: {
    fontSize: 13,
    color: "#374151",
  },
};