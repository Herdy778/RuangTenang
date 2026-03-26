import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function Journal() {
  const navigate = useNavigate();
  const [teks, setTeks] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [journals, setJournals] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const moodColors = {
    Burnout: { bg: '#FEF3C7', color: '#92400E', emoji: '😤' },
    Cemas:   { bg: '#EDE9FE', color: '#5B21B6', emoji: '😰' },
    Sedih:   { bg: '#DBEAFE', color: '#1E40AF', emoji: '😢' },
    Netral:  { bg: '#F0FDF4', color: '#166534', emoji: '😌' },
    Krisis:  { bg: '#FFE4E6', color: '#9F1239', emoji: '🆘' },
  };

  useEffect(() => { fetchJournals(); }, []);

  async function fetchJournals() {
    try {
      const res = await API.get('/journals');
      setJournals(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  }

  async function submitJournal(e) {
    e.preventDefault();
    if (!teks.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await API.post('/journals', { teks_curhat: teks });
      setResult(res.data);
      setTeks('');
      fetchJournals();
    } catch (err) {
      alert('Gagal mengirim jurnal: ' + (err.response?.data?.pesan || err.message));
    } finally {
      setLoading(false);
    }
  }

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
          <span style={{...styles.navLink, ...styles.navLinkActive}} className="nav-link-animated">Jurnal</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/articles')}>Artikel</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/breathing')}>Relaksasi</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/profile')}>Profil</span>
        </div>
      </nav>

      <div style={styles.container} className="page-enter">
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Jurnal <em>Harianmu</em> 📝</h1>
          <p style={styles.pageSub}>Ceritakan perasaanmu, AI akan menganalisis mood dan memberikan rekomendasi.</p>
        </div>

        <div style={styles.layout}>
          {/* Form Curhat */}
          <div style={styles.leftCol}>
            <div style={styles.card} className="hover-lift">
              <h2 style={styles.cardTitle}>Curhat Sekarang 💬</h2>
              <form onSubmit={submitJournal}>
                <textarea
                  style={styles.textarea}
                  className="textarea-animated"
                  placeholder="Ceritakan apa yang kamu rasakan hari ini... Tidak ada yang menghakimi di sini 🌸"
                  value={teks}
                  onChange={e => setTeks(e.target.value)}
                  rows={6}
                  required
                />
                <div style={styles.charCount}>{teks.length} karakter</div>
                <button
                  style={{...styles.submitBtn, opacity: loading || !teks.trim() ? 0.6 : 1}}
                  className="btn-animated"
                  disabled={loading || !teks.trim()}
                  type="submit"
                >
                  {loading ? '🤖 AI sedang menganalisis...' : 'Kirim & Analisis Mood →'}
                </button>
              </form>
            </div>

            {/* Hasil Analisis */}
            {result && (
              <div style={styles.resultCard} className="result-pop">
                <h3 style={styles.resultTitle}>Hasil Analisis AI 🤖</h3>
                <div style={styles.moodResult}>
                  <span style={{
                    ...styles.moodBig,
                    background: moodColors[result.mood_terdeteksi]?.bg || '#F4F4F5',
                    color: moodColors[result.mood_terdeteksi]?.color || '#52525B'
                  }}>
                    {moodColors[result.mood_terdeteksi]?.emoji} {result.mood_terdeteksi}
                  </span>
                  <p style={styles.moodDesc}>Mood yang terdeteksi dari curahanmu</p>
                </div>

                {result.rekomendasi_artikel?.length > 0 && (
                  <div className="stagger">
                    <h4 style={styles.rekoTitle}>📚 Rekomendasi Artikel</h4>
                    {result.rekomendasi_artikel.map((a) => (
                      <div key={a._id} style={styles.artikelCard} className="hover-card">
                        <h5 style={styles.artikelTitle}>{a.judul_artikel}</h5>
                        <p style={styles.artikelPreview} dangerouslySetInnerHTML={{__html: a.isi_konten?.substring(0, 100) + '...'}} />
                        <div style={styles.artikelTags}>
                          {(Array.isArray(a.kategori_tag) ? a.kategori_tag : [a.kategori_tag]).map(tag => (
                            <span key={tag} style={styles.tag}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Riwayat Jurnal */}
          <div style={styles.rightCol}>
            <div style={styles.card} className="hover-lift">
              <h2 style={styles.cardTitle}>Riwayat Jurnal 📋</h2>
              {loadingList ? (
                <p style={styles.emptyText}>Memuat...</p>
              ) : journals.length === 0 ? (
                <p style={styles.emptyText}>Belum ada jurnal. Yuk mulai!</p>
              ) : (
                <div style={styles.journalList} className="stagger">
                  {journals.map((j) => {
                    const mood = moodColors[j.hasil_mood] || { bg: '#F4F4F5', color: '#52525B', emoji: '😐' };
                    return (
                      <div key={j._id} style={styles.journalItem} className="hover-card">
                        <div style={styles.journalItemHeader}>
                          <span style={{...styles.moodBadge, background: mood.bg, color: mood.color}}>
                            {mood.emoji} {j.hasil_mood}
                          </span>
                          <span style={styles.journalDate}>
                            {new Date(j.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                          </span>
                        </div>
                        <p style={styles.journalPreview}>{j.teks_curhat.substring(0, 80)}...</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  bg: { minHeight: '100vh', background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  blob1: { position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: '#C4B5FD', filter: 'blur(100px)', opacity: 0.15, top: -100, right: -100, pointerEvents: 'none', zIndex: 0 },
  nav: { position: 'sticky', top: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F4F4F5', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, zIndex: 100 },
  navLogo: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  navLogoText: { fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 500, color: '#18181B' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 8 },
  navLink: { padding: '8px 16px', borderRadius: 8, fontSize: 14, color: '#52525B', cursor: 'pointer' },
  navLinkActive: { background: '#EDE9FE', color: '#7C3AED', fontWeight: 500 },
  container: { maxWidth: 1100, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 },
  pageHeader: { marginBottom: 32 },
  pageTitle: { fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 500, color: '#18181B', marginBottom: 8 },
  pageSub: { fontSize: 15, color: '#A1A1AA' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: 20 },
  rightCol: {},
  card: { background: 'white', borderRadius: 20, padding: '28px', border: '1px solid #F4F4F5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: 18, fontWeight: 600, color: '#18181B', marginBottom: 20 },
  textarea: { width: '100%', padding: '16px', border: '1.5px solid #E4E4E7', borderRadius: 14, fontSize: 15, color: '#18181B', fontFamily: 'inherit', lineHeight: 1.7, resize: 'vertical', outline: 'none', boxSizing: 'border-box' },
  charCount: { fontSize: 12, color: '#A1A1AA', textAlign: 'right', marginTop: 6, marginBottom: 12 },
  submitBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  resultCard: { background: 'white', borderRadius: 20, padding: '28px', border: '1px solid #DDD6FE', boxShadow: '0 2px 12px rgba(139,92,246,0.08)' },
  resultTitle: { fontSize: 16, fontWeight: 600, color: '#18181B', marginBottom: 16 },
  moodResult: { textAlign: 'center', marginBottom: 24 },
  moodBig: { display: 'inline-block', padding: '12px 28px', borderRadius: 50, fontSize: 20, fontWeight: 600 },
  moodDesc: { fontSize: 13, color: '#A1A1AA', marginTop: 8 },
  rekoTitle: { fontSize: 15, fontWeight: 600, color: '#18181B', marginBottom: 12 },
  artikelCard: { background: '#FAFAFA', borderRadius: 12, padding: '16px', marginBottom: 10, border: '1px solid #F4F4F5' },
  artikelTitle: { fontSize: 14, fontWeight: 600, color: '#18181B', marginBottom: 6 },
  artikelPreview: { fontSize: 13, color: '#52525B', lineHeight: 1.5, marginBottom: 8 },
  artikelTags: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tag: { padding: '3px 10px', background: '#EDE9FE', color: '#7C3AED', borderRadius: 20, fontSize: 11, fontWeight: 500 },
  journalList: { display: 'flex', flexDirection: 'column', gap: 10 },
  journalItem: { padding: '14px', background: '#FAFAFA', borderRadius: 12, border: '1px solid #F4F4F5' },
  journalItemHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  moodBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  journalDate: { fontSize: 12, color: '#A1A1AA' },
  journalPreview: { fontSize: 13, color: '#52525B', lineHeight: 1.5, margin: 0 },
  emptyText: { fontSize: 14, color: '#A1A1AA', textAlign: 'center', padding: '20px 0' },
};