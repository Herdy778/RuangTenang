import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

// ─── Konfigurasi Kategori & Warna Identitas ──────────────────────
const CATEGORIES = [
  { label: 'Semua',   emoji: '✨', bg: '#F4F4F5', color: '#52525B', activeBg: '#18181B',  activeColor: '#FFFFFF' },
  { label: 'Burnout', emoji: '😤', bg: '#FEF3C7', color: '#92400E', activeBg: '#D97706',  activeColor: '#FFFFFF' },
  { label: 'Cemas',   emoji: '😰', bg: '#EDE9FE', color: '#5B21B6', activeBg: '#7C3AED',  activeColor: '#FFFFFF' },
  { label: 'Sedih',   emoji: '😢', bg: '#DBEAFE', color: '#1E40AF', activeBg: '#2563EB',  activeColor: '#FFFFFF' },
  { label: 'Netral',  emoji: '😌', bg: '#D1FAE5', color: '#065F46', activeBg: '#059669',  activeColor: '#FFFFFF' },
  { label: 'Krisis',  emoji: '🆘', bg: '#FFE4E6', color: '#9F1239', activeBg: '#E11D48',  activeColor: '#FFFFFF' },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.label, c]));

// Strip HTML tags untuk preview teks bersih
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// ─────────────────────────────────────────────────────────────────

export default function BibliotherapyPage() {
  const navigate = useNavigate();

  const [articles,   setArticles]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [activeTab,  setActiveTab]  = useState('Semua');
  const [expanded,   setExpanded]   = useState(null);
  const [gridOpacity, setGridOpacity] = useState(1);

  const searchRef = useRef(null);

  // ── Fetch artikel dari API ─────────────────────────────────────
  useEffect(() => {
    API.get('/articles')
      .then(res => setArticles(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Filter real-time ──────────────────────────────────────────
  const filtered = articles.filter(a => {
    const matchCat = activeTab === 'Semua' || a.kategori_tag === activeTab;
    const matchSearch = a.judul_artikel?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Animasi cross-fade saat ganti tab ─────────────────────────
  function handleTabChange(label) {
    if (label === activeTab) return;
    setGridOpacity(0);
    setTimeout(() => {
      setActiveTab(label);
      setExpanded(null);
      setGridOpacity(1);
    }, 180);
  }

  const activeCat = CATEGORY_MAP[activeTab] || CATEGORY_MAP['Semua'];

  return (
    <div style={styles.bg}>
      {/* Ambient blobs */}
      <div style={styles.blob1} className="blob" />
      <div style={styles.blob2} className="blob blob-delay" />

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav style={styles.nav}>
        <div style={styles.navLogo} onClick={() => navigate('/dashboard')}>
          <span>🌿</span>
          <span style={styles.navLogoText}>RuangTenang</span>
        </div>
        <div style={styles.navLinks}>
          {[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Jurnal',    path: '/journal'   },
            { label: 'Artikel',   path: '/articles', active: true },
            { label: 'Relaksasi', path: '/breathing' },
            { label: 'Profil',    path: '/profile'   },
          ].map(({ label, path, active }) => (
            <span
              key={label}
              style={{ ...styles.navLink, ...(active ? styles.navLinkActive : {}) }}
              className="nav-link-animated"
              onClick={() => !active && navigate(path)}
            >
              {label}
            </span>
          ))}
        </div>
      </nav>

      {/* ── Konten Utama ─────────────────────────────────────────── */}
      <div style={styles.container} className="page-enter">

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerBadge}>📚 Bibliotherapy</div>
          <h1 style={styles.pageTitle}>Bacaan yang <em>Menyembuhkan</em></h1>
          <p style={styles.pageSub}>
            Artikel berbasis psikologi yang dipilih khusus untuk menemanimu
            melewati berbagai kondisi emosional.
          </p>
        </div>

        {/* Search Bar */}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            ref={searchRef}
            style={styles.searchInput}
            type="text"
            placeholder="Cari artikel berdasarkan judul..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => { setSearch(''); searchRef.current?.focus(); }}>
              ✕
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div style={styles.tabBar}>
          {CATEGORIES.map(cat => {
            const isActive = activeTab === cat.label;
            return (
              <button
                key={cat.label}
                style={{
                  ...styles.tabBtn,
                  background:  isActive ? cat.activeBg  : cat.bg,
                  color:       isActive ? cat.activeColor : cat.color,
                  boxShadow:   isActive ? `0 4px 16px ${cat.activeBg}55` : 'none',
                  transform:   isActive ? 'translateY(-2px)' : 'translateY(0)',
                  borderColor: isActive ? cat.activeBg : 'transparent',
                }}
                onClick={() => handleTabChange(cat.label)}
                className="btn-animated"
              >
                {cat.emoji} {cat.label}
              </button>
            );
          })}
        </div>

        {/* Jumlah Hasil */}
        {!loading && (
          <p style={styles.resultCount}>
            {filtered.length === 0
              ? 'Tidak ada artikel'
              : `${filtered.length} artikel ditemukan${activeTab !== 'Semua' ? ` untuk "${activeTab}"` : ''}`}
          </p>
        )}

        {/* ── Grid Artikel / States ───────────────────────────── */}
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState search={search} category={activeTab} />
        ) : (
          <div style={{ ...styles.grid, opacity: gridOpacity, transition: 'opacity 180ms ease' }}>
            {filtered.map(article => (
              <ArticleCard
                key={article._id}
                article={article}
                isExpanded={expanded === article._id}
                onToggle={() => setExpanded(prev => prev === article._id ? null : article._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-komponen: ArticleCard ────────────────────────────────────
function ArticleCard({ article, isExpanded, onToggle }) {
  const cat     = CATEGORY_MAP[article.kategori_tag] || CATEGORY_MAP['Semua'];
  const plain   = stripHtml(article.isi_konten);
  const preview = plain.substring(0, 160) + (plain.length > 160 ? '...' : '');
  const refs    = article.referensi || [];

  return (
    <div style={styles.card} className="hover-card">
      {/* Thumbnail */}
      {article.thumbnail_url && (
        <div style={styles.thumbWrap}>
          <img
            src={article.thumbnail_url}
            alt={article.judul_artikel}
            style={styles.thumb}
            onError={e => { e.target.parentElement.style.display = 'none'; }}
          />
          {/* Gradient overlay */}
          <div style={styles.thumbOverlay} />
          {/* Category badge over image */}
          <span style={{ ...styles.catBadgeImg, background: cat.activeBg }}>
            {cat.emoji} {article.kategori_tag}
          </span>
        </div>
      )}

      <div style={styles.cardBody}>
        {/* Category badge (jika tidak ada thumbnail) */}
        {!article.thumbnail_url && (
          <span style={{ ...styles.catBadge, background: cat.bg, color: cat.color }}>
            {cat.emoji} {article.kategori_tag}
          </span>
        )}

        {/* Judul */}
        <h2 style={styles.cardTitle}>{article.judul_artikel}</h2>

        {/* Penulis */}
        {article.penulis && (
          <p style={styles.cardAuthor}>✍️ {article.penulis}</p>
        )}

        {/* Preview / Full content */}
        {isExpanded ? (
          <div
            style={styles.cardContentFull}
            dangerouslySetInnerHTML={{ __html: article.isi_konten }}
          />
        ) : (
          <p style={styles.cardPreview}>{preview}</p>
        )}

        {/* Referensi (saat expanded) */}
        {isExpanded && refs.length > 0 && (
          <div style={styles.refsBox}>
            <p style={styles.refsTitle}>📖 Referensi Ilmiah</p>
            <ul style={styles.refsList}>
              {refs.map((ref, i) => (
                <li key={i} style={styles.refItem}>{ref}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tombol Baca Selengkapnya */}
        <ReadMoreButton isExpanded={isExpanded} onToggle={onToggle} color={cat.activeBg} />
      </div>
    </div>
  );
}

// ─── Sub-komponen: ReadMoreButton ────────────────────────────────
function ReadMoreButton({ isExpanded, onToggle, color }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        ...styles.readMoreBtn,
        background: hovered ? color : 'transparent',
        color:      hovered ? '#fff' : color,
        borderColor: color,
        transform:  hovered ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow:  hovered ? `0 4px 14px ${color}44` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggle}
    >
      {isExpanded ? '↑ Tutup' : 'Baca Selengkapnya →'}
    </button>
  );
}

// ─── Sub-komponen: Loading Skeleton ──────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={styles.grid}>
      {[1, 2, 3].map(i => (
        <div key={i} style={styles.skeleton}>
          <div style={styles.skeletonThumb} />
          <div style={styles.skeletonBody}>
            <div style={{ ...styles.skeletonLine, width: '40%', height: 14 }} />
            <div style={{ ...styles.skeletonLine, width: '90%', height: 20, marginTop: 8 }} />
            <div style={{ ...styles.skeletonLine, width: '70%', height: 20, marginTop: 6 }} />
            <div style={{ ...styles.skeletonLine, width: '100%', height: 12, marginTop: 16 }} />
            <div style={{ ...styles.skeletonLine, width: '85%', height: 12, marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sub-komponen: Empty State ────────────────────────────────────
function EmptyState({ search, category }) {
  return (
    <div style={styles.emptyWrap}>
      <div style={styles.emptyEmoji}>📭</div>
      <h3 style={styles.emptyTitle}>
        {search
          ? `Artikel untuk "${search}" belum tersedia`
          : `Belum ada artikel untuk kategori "${category}"`}
      </h3>
      <p style={styles.emptyDesc}>
        Maaf, artikel yang kamu cari belum tersedia. Coba kata kunci lain, ya! 🌸
      </p>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = {
  // Layout
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #FAFAFA 0%, #F5F3FF 50%, #ECFDF5 100%)',
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
  },
  blob1: {
    position: 'fixed', width: 560, height: 560, borderRadius: '50%',
    background: '#C4B5FD', filter: 'blur(110px)', opacity: 0.18,
    top: -160, right: -160, pointerEvents: 'none', zIndex: 0,
  },
  blob2: {
    position: 'fixed', width: 440, height: 440, borderRadius: '50%',
    background: '#6EE7B7', filter: 'blur(90px)', opacity: 0.15,
    bottom: -120, left: -120, pointerEvents: 'none', zIndex: 0,
  },

  // Navbar
  nav: {
    position: 'sticky', top: 0, zIndex: 100, height: 64,
    background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(244,244,245,0.9)',
    padding: '0 40px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  navLogoText: { fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 500, color: '#18181B' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 6 },
  navLink: {
    padding: '7px 14px', borderRadius: 8, fontSize: 14,
    color: '#52525B', cursor: 'pointer', fontWeight: 400,
  },
  navLinkActive: { background: '#EDE9FE', color: '#7C3AED', fontWeight: 600 },

  // Container
  container: {
    maxWidth: 1140, margin: '0 auto',
    padding: '48px 28px 60px', position: 'relative', zIndex: 1,
  },

  // Header
  header: { textAlign: 'center', marginBottom: 44 },
  headerBadge: {
    display: 'inline-block', padding: '6px 18px',
    background: 'rgba(139,92,246,0.1)', color: '#7C3AED',
    borderRadius: 50, fontSize: 13, fontWeight: 600,
    marginBottom: 16, letterSpacing: '0.04em',
  },
  pageTitle: {
    fontFamily: 'Georgia, serif', fontSize: 38, fontWeight: 500,
    color: '#18181B', marginBottom: 14, lineHeight: 1.25,
  },
  pageSub: {
    fontSize: 16, color: '#71717A', maxWidth: 520,
    margin: '0 auto', lineHeight: 1.7,
  },

  // Search
  searchWrap: {
    position: 'relative', marginBottom: 24, maxWidth: 560, margin: '0 auto 28px',
  },
  searchIcon: {
    position: 'absolute', left: 18, top: '50%',
    transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none',
  },
  searchInput: {
    width: '100%', padding: '14px 44px 14px 48px',
    background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)',
    border: '1.5px solid rgba(228,228,231,0.8)', borderRadius: 50,
    fontSize: 15, color: '#18181B', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
    boxShadow: '0 2px 16px rgba(139,92,246,0.07)',
    transition: 'border-color 200ms ease, box-shadow 200ms ease',
  },
  clearBtn: {
    position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
    background: '#F4F4F5', border: 'none', borderRadius: '50%',
    width: 24, height: 24, fontSize: 11, color: '#71717A',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  // Filter Tabs
  tabBar: {
    display: 'flex', gap: 10, flexWrap: 'wrap',
    justifyContent: 'center', marginBottom: 12,
  },
  tabBtn: {
    padding: '9px 20px', borderRadius: 50, fontSize: 13.5, fontWeight: 600,
    cursor: 'pointer', border: '1.5px solid transparent',
    fontFamily: 'inherit', transition: 'all 250ms cubic-bezier(0.34,1.56,0.64,1)',
    letterSpacing: '0.01em',
  },

  // Result count
  resultCount: {
    textAlign: 'center', fontSize: 13, color: '#A1A1AA',
    marginBottom: 28, marginTop: 4,
  },

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
    gap: 24,
  },

  // Card
  card: {
    background: 'rgba(255,255,255,0.78)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: 22,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    transition: 'transform 240ms ease, box-shadow 240ms ease',
  },
  thumbWrap: { position: 'relative', height: 175, overflow: 'hidden', flexShrink: 0 },
  thumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  thumbOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 60%)',
  },
  catBadgeImg: {
    position: 'absolute', top: 14, left: 14,
    padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600,
    color: '#fff', backdropFilter: 'blur(6px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
  },
  cardBody: { padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 },
  catBadge: {
    display: 'inline-block', padding: '4px 12px', borderRadius: 50,
    fontSize: 12, fontWeight: 600, marginBottom: 12, alignSelf: 'flex-start',
  },
  cardTitle: {
    fontSize: 17, fontWeight: 700, color: '#18181B',
    lineHeight: 1.4, marginBottom: 8, fontFamily: 'Georgia, serif',
  },
  cardAuthor: { fontSize: 12, color: '#A1A1AA', marginBottom: 12, fontWeight: 400 },
  cardPreview: {
    fontSize: 14, color: '#52525B', lineHeight: 1.75,
    flex: 1, marginBottom: 18,
  },
  cardContentFull: {
    fontSize: 14, color: '#3F3F46', lineHeight: 1.85,
    flex: 1, marginBottom: 18,
  },

  // References
  refsBox: {
    background: 'rgba(139,92,246,0.05)', borderRadius: 12,
    padding: '14px 16px', marginBottom: 18,
    borderLeft: '3px solid #8B5CF6',
  },
  refsTitle: { fontSize: 13, fontWeight: 600, color: '#7C3AED', marginBottom: 8 },
  refsList: { paddingLeft: 18, margin: 0 },
  refItem: { fontSize: 12, color: '#52525B', lineHeight: 1.7, marginBottom: 4 },

  // Read more button
  readMoreBtn: {
    alignSelf: 'flex-start', padding: '9px 20px',
    border: '1.5px solid', borderRadius: 50,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 200ms ease',
  },

  // Skeleton
  skeleton: {
    background: 'rgba(255,255,255,0.7)', borderRadius: 22,
    overflow: 'hidden', border: '1px solid rgba(244,244,245,0.9)',
  },
  skeletonThumb: {
    height: 175,
    background: 'linear-gradient(90deg, #F4F4F5 25%, #EBEBEB 50%, #F4F4F5 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  skeletonBody: { padding: '22px 24px' },
  skeletonLine: {
    borderRadius: 8, marginBottom: 4,
    background: 'linear-gradient(90deg, #F4F4F5 25%, #EBEBEB 50%, #F4F4F5 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },

  // Empty
  emptyWrap: {
    textAlign: 'center', padding: '80px 20px',
    gridColumn: '1 / -1',
  },
  emptyEmoji: { fontSize: 52, marginBottom: 20 },
  emptyTitle: {
    fontSize: 18, fontWeight: 600, color: '#18181B', marginBottom: 10,
  },
  emptyDesc: { fontSize: 14, color: '#A1A1AA', lineHeight: 1.7 },
};
