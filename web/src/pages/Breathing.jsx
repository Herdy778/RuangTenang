import { useNavigate } from 'react-router-dom';
import BreathingCircle from '../components/BreathingCircle';

export default function Breathing() {
  const navigate = useNavigate();

  return (
    <div style={styles.bg}>
      <div style={styles.blob1} className="blob" />
      <div style={styles.blob2} className="blob blob-delay" />

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navLogo} onClick={() => navigate('/dashboard')}>
          <span>🌿</span>
          <span style={styles.navLogoText}>RuangTenang</span>
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/journal')}>Jurnal</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/articles')}>Artikel</span>
          <span style={{ ...styles.navLink, ...styles.navLinkActive }} className="nav-link-animated">Relaksasi</span>
          <span style={styles.navLink} className="nav-link-animated" onClick={() => navigate('/profile')}>Profil</span>
        </div>
      </nav>

      <div style={styles.container} className="page-enter">
        {/* Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Latihan <em>Pernapasan</em> 🌬️</h1>
          <p style={styles.pageSub}>
            Teknik pernapasan 4-4-6 untuk menenangkan pikiran dan mengurangi kecemasan.
          </p>
        </div>

        {/* Breathing Component */}
        <div style={styles.card}>
          <BreathingCircle />
        </div>

        {/* Tips Section */}
        <div style={styles.tipsGrid}>
          {[
            { icon: '🧘', title: 'Posisi Nyaman', desc: 'Duduk tegak atau berbaring, pastikan tubuhmu rileks.' },
            { icon: '👁️', title: 'Tutup Mata', desc: 'Fokus pada sensasi napas, abaikan gangguan sekitar.' },
            { icon: '🔁', title: 'Ulangi 3-5x', desc: 'Lakukan minimal 3 siklus untuk hasil yang optimal.' },
          ].map((tip) => (
            <div key={tip.title} style={styles.tipCard} className="hover-card">
              <span style={styles.tipIcon}>{tip.icon}</span>
              <h3 style={styles.tipTitle}>{tip.title}</h3>
              <p style={styles.tipDesc}>{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  bg: { minHeight: '100vh', background: '#FAFAFA', fontFamily: "'DM Sans', sans-serif", position: 'relative' },
  blob1: { position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: '#A7F3D0', filter: 'blur(100px)', opacity: 0.2, top: -100, right: -100, pointerEvents: 'none', zIndex: 0 },
  blob2: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#BAE6FD', filter: 'blur(80px)', opacity: 0.2, bottom: -80, left: -80, pointerEvents: 'none', zIndex: 0 },
  nav: { position: 'sticky', top: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F4F4F5', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, zIndex: 100 },
  navLogo: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  navLogoText: { fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 500, color: '#18181B' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 8 },
  navLink: { padding: '8px 16px', borderRadius: 8, fontSize: 14, color: '#52525B', cursor: 'pointer', fontWeight: 400 },
  navLinkActive: { background: '#D1FAE5', color: '#065F46', fontWeight: 500 },
  container: { maxWidth: 860, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 },
  pageHeader: { marginBottom: 32, textAlign: 'center' },
  pageTitle: { fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 500, color: '#18181B', marginBottom: 8 },
  pageSub: { fontSize: 15, color: '#A1A1AA', maxWidth: 480, margin: '0 auto' },
  card: { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 28, marginBottom: 28, boxShadow: '0 4px 30px rgba(110,231,183,0.1)' },
  tipsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  tipCard: { background: 'white', borderRadius: 16, padding: '22px 20px', border: '1px solid #F4F4F5', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  tipIcon: { fontSize: 28, display: 'block', marginBottom: 10 },
  tipTitle: { fontSize: 14, fontWeight: 600, color: '#18181B', marginBottom: 6 },
  tipDesc: { fontSize: 13, color: '#A1A1AA', lineHeight: 1.6, margin: 0 },
};
