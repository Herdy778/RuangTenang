import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function AdminArticles() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    judul_artikel: "",
    penulis: "",
    thumbnail_url: "",
    kategori_tag: "Netral",
    isi_konten: "",
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const res = await API.get("/admin/articles");
      setArticles(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function tambahArtikel() {
    try {
      await API.post("/admin/articles", form);

      setForm({
        judul_artikel: "",
        penulis: "",
        thumbnail_url: "",
        kategori_tag: "Netral",
        isi_konten: "",
      });

      fetchArticles();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteArtikel(id) {
    if (!window.confirm("Hapus artikel ini?")) return;

    try {
      await API.delete(`/admin/articles/${id}`);
      fetchArticles();
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

  const filtered = articles.filter((a) =>
    a.judul_artikel?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={styles.navLogoIcon}>🌿</span>
          <span style={styles.navLogoText}>RuangTenang Admin</span>
        </div>

        <div style={styles.navLinks}>
          <span style={styles.navLink} onClick={() => navigate("/dashboard")}>
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

          <span style={{ ...styles.navLink, ...styles.navLinkActive }}>
            Artikel
          </span>

          <button style={styles.logoutBtn} onClick={doLogout}>
            Keluar
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Data Artikel</h1>
          <p style={styles.subtitle}>Artikel rekomendasi berdasarkan mood</p>
        </div>

        {/* FORM TAMBAH */}
        <div style={styles.card}>
          <div style={{ padding: 20 }}>
            <input
              style={styles.input}
              placeholder="Judul Artikel"
              value={form.judul_artikel}
              onChange={(e) =>
                setForm({ ...form, judul_artikel: e.target.value })
              }
            />

            <input
              style={styles.input}
              placeholder="Penulis"
              value={form.penulis}
              onChange={(e) =>
                setForm({ ...form, penulis: e.target.value })
              }
            />

            <input
              style={styles.input}
              placeholder="Thumbnail URL"
              value={form.thumbnail_url}
              onChange={(e) =>
                setForm({ ...form, thumbnail_url: e.target.value })
              }
            />

            <select
              style={styles.input}
              value={form.kategori_tag}
              onChange={(e) =>
                setForm({ ...form, kategori_tag: e.target.value })
              }
            >
              <option>Burnout</option>
              <option>Cemas</option>
              <option>Sedih</option>
              <option>Netral</option>
              <option>Krisis</option>
            </select>

            <textarea
              style={styles.textarea}
              placeholder="Paste isi artikel dari google (HTML)"
              value={form.isi_konten}
              onChange={(e) =>
                setForm({ ...form, isi_konten: e.target.value })
              }
            />

            <button style={styles.addBtn} onClick={tambahArtikel}>
              Tambah Artikel
            </button>
          </div>
        </div>

        <div style={{ height: 20 }} />

        {/* SEARCH */}
        <input
          style={styles.search}
          placeholder="Cari artikel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>Memuat data...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>No</th>
                  <th style={styles.th}>Artikel</th>
                  <th style={styles.th}>Kategori</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a._id}>
                    <td style={styles.td}>{i + 1}</td>

                    <td style={styles.td}>
                      <div
                        style={styles.articleCell}
                        onClick={() => setSelected(a)}
                      >
                        <img
                          src={a.thumbnail_url}
                          style={styles.thumbnail}
                        />

                        <div>
                          <div style={styles.articleTitle}>
                            {a.judul_artikel}
                          </div>

                          <div style={styles.articleAuthor}>
                            {a.penulis}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.badge}>
                        {a.kategori_tag}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => deleteArtikel(a._id)}
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

      {/* MODAL DETAIL */}
      {selected && (
        <div style={styles.modalBg} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{selected.judul_artikel}</h2>

            <div
              dangerouslySetInnerHTML={{
                __html: selected.isi_konten,
              }}
            />

            <button
              style={styles.closeBtn}
              onClick={() => setSelected(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
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

  articleCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer"
  },

  thumbnail: {
    width: 70,
    height: 50,
    objectFit: "cover",
    borderRadius: 8,
  },

  articleTitle: {
    fontWeight: 500,
    marginBottom: 2,
  },

  articleAuthor: {
    fontSize: 12,
    color: "#A1A1AA",
  },

  badge: {
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    background: "#EDE9FE",
    color: "#7C3AED",
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

  input:{
    width:"100%",
    padding:12,
    border:"1px solid #E4E4E7",
    borderRadius:8,
    marginBottom:10
  },

  textarea:{
    width:"100%",
    minHeight:150,
    padding:12,
    border:"1px solid #E4E4E7",
    borderRadius:8,
    marginBottom:10
  },

  addBtn:{
    padding:"10px 16px",
    background:"#7C3AED",
    color:"white",
    border:"none",
    borderRadius:8,
    cursor:"pointer"
  },

  search:{
    width:"100%",
    padding:12,
    border:"1px solid #E4E4E7",
    borderRadius:8,
    marginBottom:15
  },

  modalBg:{
    position:"fixed",
    top:0,
    left:0,
    right:0,
    bottom:0,
    background:"rgba(0,0,0,0.4)",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    zIndex:999
  },

  modal:{
    background:"white",
    padding:30,
    borderRadius:12,
    maxWidth:700,
    width:"90%",
    maxHeight:"80vh",
    overflow:"auto"
  },

  closeBtn:{
    marginTop:20,
    padding:"8px 14px",
    border:"none",
    background:"#7C3AED",
    color:"white",
    borderRadius:8,
    cursor:"pointer"
  }
};