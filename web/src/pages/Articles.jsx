import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function Articles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMood, setActiveMood] = useState('Semua');
  const [search, setSearch] = useState('');

  const moods = ['Semua', 'Burnout', 'Cemas', 'Sedih', 'Netral', 'Krisis'];
  const moodColors = {
    Burnout: { bg: '#FEF3C7', color: '#92400E', emoji: '😤' },
    Cemas:   { bg: '#EDE9FE', color: '#5B21B6', emoji: '😰' },
    Sedih:   { bg: '#DBEAFE', color: '#1E40AF', emoji: '😢' },
    Netral:  { bg: '#F0FDF4', color: '#166534', emoji: '😌' },
    Krisis:  { bg: '#FFE4E6', color: '#9F1239', emoji: '🆘' },
  };

  useEffect(() => { fetchArticles(); }, []);

  useEffect(() => {
    let result = articles;
    if (activeMood !== 'Semua') {
      result = result.filter(a =>
        Array.isArray(a.kategori_tag)
          ? a.kategori_tag.includes(activeMood)
          : a.kategori_tag === activeMood
      );
    }
    if (search.trim()) {
      result = result.filter(a =>
        a.judul_artikel.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [articles, activeMood, search]);

  async function fetchArticles() {
    try {
      const res = await API.get('/articles');
      setArticles(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const [expanded, setExpanded] = useState(null);

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} className="blob" />

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navLogo} onClick={() => navigate('/dashboard')}>
          <span>🌿</span>
          <span style={styles.navLogoText}>RuangTenang</span>
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/journal')}>Jurnal</span>
          <span style={{...styles.navLink, ...styles.navLinkActive}} className="nav-link-animated">Artikel</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/breathing')}>Relaksasi</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/profile')}>Profil</span>
        </div>
      </nav>

      <div style={styles.container} className="page-enter">
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Artikel <em>Bibliotherapy</em> 📚</h1>
          <p style={styles.pageSub}>Bacaan yang dipilih khusus untuk membantu pemulihan mental kamu.</p>
        </div>

        {/* Search */}
        <input
          style={styles.searchInput}
          className="input-animated"
          type="text"
          placeholder="🔍  Cari artikel..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Mood Filter */}
        <div style={styles.filterBar} className="stagger">
          {moods.map(mood => (
            <button
              key={mood}
              style={{
                ...styles.filterBtn,
                ...(activeMood === mood ? styles.filterBtnActive : {})
              }}
              className="btn-animated"
              onClick={() => setActiveMood(mood)}
            >
              {mood !== 'Semua' && moodColors[mood]?.emoji + ' '}{mood}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <p style={styles.emptyText}>Memuat artikel...</p>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={{fontSize: 40, marginBottom: 12}}>📭</p>
            <p style={styles.emptyText}>Tidak ada artikel ditemukan.</p>
          </div>
        ) : (
          <div style={styles.grid} className="stagger">
            {filtered.map((a) => {
              const tags = Array.isArray(a.kategori_tag) ? a.kategori_tag : [a.kategori_tag];
              const isOpen = expanded === a._id;
              return (
                <div key={a._id} style={styles.articleCard} className="hover-card">
                  {a.thumbnail_url && (
                    <img src={a.thumbnail_url} alt={a.judul_artikel} style={styles.thumbnail} onError={e => e.target.style.display='none'} />
                  )}
                  <div style={styles.articleBody}>
                    <div style={styles.tagRow}>
                      {tags.map(tag => {
                        const m = moodColors[tag];
                        return m ? (
                          <span key={tag} style={{...styles.tag, background: m.bg, color: m.color}}>
                            {m.emoji} {tag}
                          </span>
                        ) : null;
                      })}
                    </div>
                    <h3 style={styles.articleTitle}>{a.judul_artikel}</h3>
                    <div
                      style={styles.articleContent}
                      dangerouslySetInnerHTML={{
                        __html: isOpen ? a.isi_konten : a.isi_konten?.substring(0, 150) + '...'
                      }}
                    />
                    <button
                      style={styles.readMoreBtn}
                      onClick={() => setExpanded(isOpen ? null : a._id)}
                    >
                      {isOpen ? 'Tutup ↑' : 'Baca selengkapnya →'}
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
  bg: { minHeight: '100vh', background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  blob1: { position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: '#A7F3D0', filter: 'blur(100px)', opacity: 0.2, top: -100, left: -100, pointerEvents: 'none', zIndex: 0 },
  nav: { position: 'sticky', top: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F4F4F5', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, zIndex: 100 },
  navLogo: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  navLogoText: { fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 500, color: '#18181B' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 8 },
  navLink: { padding: '8px 16px', borderRadius: 8, fontSize: 14, color: '#52525B', cursor: 'pointer' },
  navLinkActive: { background: '#D1FAE5', color: '#065F46', fontWeight: 500 },
  container: { maxWidth: 1100, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 },
  pageHeader: { marginBottom: 28 },
  pageTitle: { fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 500, color: '#18181B', marginBottom: 8 },
  pageSub: { fontSize: 15, color: '#A1A1AA' },
  searchInput: { width: '100%', padding: '14px 20px', border: '1.5px solid #E4E4E7', borderRadius: 14, fontSize: 15, fontFamily: 'inherit', outline: 'none', marginBottom: 16, boxSizing: 'border-box', background: 'white' },
  filterBar: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 },
  filterBtn: { padding: '8px 18px', border: '1.5px solid #E4E4E7', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'white', color: '#52525B', fontFamily: 'inherit', transition: 'all 0.2s ease' },
  filterBtnActive: { background: '#8B5CF6', color: 'white', border: '1.5px solid #8B5CF6' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 },
  articleCard: { background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid #F4F4F5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' },
  thumbnail: { width: '100%', height: 160, objectFit: 'cover' },
  articleBody: { padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' },
  tagRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  tag: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
  articleTitle: { fontSize: 16, fontWeight: 600, color: '#18181B', marginBottom: 10, lineHeight: 1.4 },
  articleContent: { fontSize: 14, color: '#52525B', lineHeight: 1.7, flex: 1, marginBottom: 12 },
  readMoreBtn: { background: 'none', border: 'none', color: '#8B5CF6', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: 0, fontFamily: 'inherit', textAlign: 'left' },
  emptyCard: { textAlign: 'center', padding: '60px 0' },
  emptyText: { fontSize: 14, color: '#A1A1AA', textAlign: 'center' },
};