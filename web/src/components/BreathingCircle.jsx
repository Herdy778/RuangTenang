import { useState, useEffect, useRef } from 'react';

// ─── Konfigurasi Timing & Warna (mudah disesuaikan) ──────────────
const PHASES = [
  { label: 'Tarik Napas', sublabel: 'Hirup perlahan...', duration: 4000, scale: 1.62, color: '#6EE7B7', glow: '#6EE7B7' },
  { label: 'Tahan',       sublabel: 'Tahan napasmu...',  duration: 4000, scale: 1.62, color: '#7DD3FC', glow: '#7DD3FC' },
  { label: 'Hembuskan',   sublabel: 'Lepaskan...',       duration: 6000, scale: 1.0,  color: '#C4B5FD', glow: '#A5B4FC' },
];

const BASE_SIZE = 176; // px — ukuran dasar lingkaran saat idle
// ──────────────────────────────────────────────────────────────────

export default function BreathingCircle() {
  const [isActive,   setIsActive]   = useState(false);
  const [phaseIdx,   setPhaseIdx]   = useState(0);
  const [scale,      setScale]      = useState(1.0);
  const [countdown,  setCountdown]  = useState(0);
  // State fade-in teks
  const [textVisible, setTextVisible] = useState(true);
  const [displayPhase, setDisplayPhase] = useState(PHASES[0]);

  const timerRef = useRef(null);
  const countRef = useRef(null);
  const fadeRef  = useRef(null);

  // ── Fade-in teks saat fase berubah ────────────────────────────
  function updatePhaseWithFade(idx) {
    setTextVisible(false);
    fadeRef.current = setTimeout(() => {
      setPhaseIdx(idx);
      setDisplayPhase(PHASES[idx]);
      setTextVisible(true);
    }, 160); // singkat agar tidak delay terasa
  }

  // ── Siklus Pernapasan ─────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return;

    const runPhase = (idx) => {
      const current = PHASES[idx];
      updatePhaseWithFade(idx);
      setScale(current.scale);
      setCountdown(Math.round(current.duration / 1000));

      let remaining = Math.round(current.duration / 1000);
      countRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
      }, 1000);

      timerRef.current = setTimeout(() => {
        clearInterval(countRef.current);
        runPhase((idx + 1) % PHASES.length);
      }, current.duration);
    };

    runPhase(0);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(fadeRef.current);
      clearInterval(countRef.current);
    };
  }, [isActive]);

  // ── Kontrol ───────────────────────────────────────────────────
  function handleStart() {
    setScale(1.0);
    setPhaseIdx(0);
    setDisplayPhase(PHASES[0]);
    setTextVisible(true);
    setIsActive(true);
  }

  function handleStop() {
    clearTimeout(timerRef.current);
    clearTimeout(fadeRef.current);
    clearInterval(countRef.current);
    setIsActive(false);
    setScale(1.0);
    setPhaseIdx(0);
    setDisplayPhase(PHASES[0]);
    setCountdown(0);
    setTextVisible(true);
  }

  // ── Nilai Dinamis Berdasarkan Fase & Scale ────────────────────
  const activeColor = isActive ? displayPhase.color : '#C4B5FD';
  const activeGlow  = isActive ? displayPhase.glow  : '#A5B4FC';

  // Intensitas glow mengikuti scale (lebih besar = lebih terang)
  const glowIntensity = ((scale - 1.0) / (1.62 - 1.0)).toFixed(2); // 0 → 1
  const shadowBlur1 = Math.round(40  + glowIntensity * 60);   // 40–100 px
  const shadowBlur2 = Math.round(80  + glowIntensity * 120);  // 80–200 px
  const shadowBlur3 = Math.round(120 + glowIntensity * 180);  // 120–300 px
  const alpha1 = (0.35 + glowIntensity * 0.35).toFixed(2);    // 0.35–0.70
  const alpha2 = (0.15 + glowIntensity * 0.20).toFixed(2);    // 0.15–0.35
  const alpha3 = (0.05 + glowIntensity * 0.10).toFixed(2);    // 0.05–0.15

  const dynamicBoxShadow = isActive
    ? `0 0 ${shadowBlur1}px ${activeGlow}${toHex(alpha1)},` +
      `0 0 ${shadowBlur2}px ${activeGlow}${toHex(alpha2)},` +
      `0 0 ${shadowBlur3}px ${activeGlow}${toHex(alpha3)},` +
      `inset 0 1px 0 rgba(255,255,255,0.35),` +
      `inset 0 0 40px rgba(255,255,255,0.08)`
    : '0 8px 40px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.3)';

  // Durasi transisi sesuai fase aktif
  const scaleDuration = isActive ? displayPhase.duration : 1000;
  const circleTransition = `transform ${scaleDuration}ms cubic-bezier(0.45,0.05,0.55,0.95),` +
                           `box-shadow ${Math.round(scaleDuration * 0.8)}ms ease`;

  return (
    <div style={styles.wrapper}>

      {/* ── Area Lingkaran ─────────────────────────────────────── */}
      <div style={{ ...styles.circleOuter, width: BASE_SIZE * 2.6, height: BASE_SIZE * 2.6 }}>

        {/* Layer 1 — Aura terluar (radial gradient melebar) */}
        <div style={{
          ...styles.layer,
          width: BASE_SIZE * 2.6,
          height: BASE_SIZE * 2.6,
          background: `radial-gradient(circle, ${activeGlow}${toHex(0.13 + glowIntensity * 0.14)} 0%, transparent 68%)`,
          transform: `scale(${1 + glowIntensity * 0.15})`,
          transition: `transform ${scaleDuration}ms cubic-bezier(0.45,0.05,0.55,0.95), background 800ms ease`,
        }} />

        {/* Layer 2 — Cincin blur tengah (glassmorphism ring) */}
        <div style={{
          ...styles.layer,
          width: BASE_SIZE * 2.0,
          height: BASE_SIZE * 2.0,
          borderRadius: '50%',
          border: `1.5px solid ${activeColor}${toHex(0.18 + glowIntensity * 0.22)}`,
          background: `rgba(255,255,255,${(0.04 + glowIntensity * 0.04).toFixed(2)})`,
          backdropFilter: 'blur(4px)',
          transform: `scale(${1 + glowIntensity * 0.08})`,
          transition: `transform ${scaleDuration}ms cubic-bezier(0.45,0.05,0.55,0.95), border-color 800ms ease, background 800ms ease`,
        }} />

        {/* Layer 3 — Lingkaran Glassmorphism Utama */}
        <div style={{
          ...styles.circle,
          width: BASE_SIZE,
          height: BASE_SIZE,
          // Glassmorphism: lapisan kaca dengan shine di atas
          background: `
            radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.38) 0%, transparent 55%),
            radial-gradient(ellipse at 70% 75%, ${activeColor}44 0%, transparent 50%),
            linear-gradient(135deg, ${activeColor}CC 0%, #8B5CF6BB 60%, #6366F1AA 100%)
          `,
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.45)',
          boxShadow: dynamicBoxShadow,
          transform: `scale(${scale})`,
          transition: circleTransition,
        }}>
          {/* Highlight kaca (shine spot) */}
          <div style={styles.glassShine} />

          {/* Konten Teks — fade-in saat ganti fase */}
          <div style={{
            ...styles.circleContent,
            opacity: textVisible ? 1 : 0,
            transform: textVisible ? 'translateY(0px)' : 'translateY(6px)',
            transition: 'opacity 200ms ease, transform 200ms ease',
          }}>
            {isActive ? (
              <>
                <span style={styles.phaseLabel}>{displayPhase.label}</span>
                <span style={styles.countdownNum}>{countdown}</span>
                <span style={styles.phaseSub}>{displayPhase.sublabel}</span>
              </>
            ) : (
              <>
                <span style={styles.idleEmoji}>🌿</span>
                <span style={styles.idleText}>Siap bernapas</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Indikator Fase ────────────────────────────────────── */}
      <div style={styles.phaseIndicator}>
        {PHASES.map((p, i) => {
          const isHere = isActive && phaseIdx === i;
          return (
            <div key={i} style={styles.phaseStep}>
              <div style={{
                ...styles.phaseDot,
                background: isHere ? p.color : '#E4E4E7',
                transform: isHere ? 'scale(1.5)' : 'scale(1)',
                boxShadow: isHere ? `0 0 12px ${p.glow}99` : 'none',
              }} />
              <span style={{
                ...styles.phaseStepLabel,
                color: isHere ? '#18181B' : '#A1A1AA',
                fontWeight: isHere ? 600 : 400,
              }}>{p.label}</span>
            </div>
          );
        })}
      </div>

      {/* ── Kontrol ───────────────────────────────────────────── */}
      <div style={styles.controls}>
        {!isActive ? (
          <button style={styles.btnStart} onClick={handleStart}>
            ▶&nbsp; Mulai Relaksasi
          </button>
        ) : (
          <button style={styles.btnStop} onClick={handleStop}>
            ■&nbsp; Berhenti
          </button>
        )}
      </div>

      {/* ── Hint siklus ───────────────────────────────────────── */}
      <div style={{
        ...styles.hint,
        opacity: isActive ? 0 : 1,
        transition: 'opacity 400ms ease',
        pointerEvents: isActive ? 'none' : 'auto',
      }}>
        Siklus: <strong>Tarik 4s</strong> → <strong>Tahan 4s</strong> → <strong>Hembuskan 6s</strong>
      </div>
    </div>
  );
}

// ─── Helper: angka desimal 0–1 → hex opacity string ───────────────
function toHex(alpha) {
  return Math.round(Number(alpha) * 255).toString(16).padStart(2, '0');
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 32,
    padding: '44px 24px 40px',
    width: '100%',
    boxSizing: 'border-box',
  },
  circleOuter: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Responsif: tidak melebihi layar kecil
    maxWidth: '90vw',
    maxHeight: '90vw',
  },
  layer: {
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  circle: {
    position: 'relative',
    zIndex: 5,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'default',
    willChange: 'transform',
  },
  // Highlight efek kaca — titik terang di kiri atas
  glassShine: {
    position: 'absolute',
    top: '14%',
    left: '18%',
    width: '36%',
    height: '28%',
    borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 6,
  },
  circleContent: {
    position: 'relative',
    zIndex: 7,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    color: 'white',
    textAlign: 'center',
    padding: '0 12px',
  },
  phaseLabel: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    opacity: 0.92,
    textShadow: '0 1px 8px rgba(0,0,0,0.15)',
  },
  countdownNum: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1,
    fontFamily: 'Georgia, serif',
    textShadow: '0 2px 12px rgba(0,0,0,0.12)',
  },
  phaseSub: {
    fontSize: 11,
    opacity: 0.78,
    fontWeight: 300,
    letterSpacing: '0.02em',
  },
  idleEmoji: { fontSize: 34 },
  idleText: {
    fontSize: 12,
    opacity: 0.82,
    fontWeight: 400,
    textShadow: '0 1px 6px rgba(0,0,0,0.1)',
  },
  phaseIndicator: {
    display: 'flex',
    gap: 36,
    alignItems: 'flex-start',
  },
  phaseStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 7,
  },
  phaseDot: {
    width: 9,
    height: 9,
    borderRadius: '50%',
    transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
  },
  phaseStepLabel: {
    fontSize: 12,
    transition: 'all 0.4s ease',
    fontFamily: "'DM Sans', sans-serif",
  },
  controls: {
    display: 'flex',
    gap: 12,
  },
  btnStart: {
    padding: '13px 38px',
    background: 'linear-gradient(135deg, #6EE7B7 0%, #7DD3FC 100%)',
    color: '#064E3B',
    border: 'none',
    borderRadius: 50,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.02em',
    boxShadow: '0 4px 24px rgba(110,231,183,0.40), 0 1px 0 rgba(255,255,255,0.6) inset',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
  },
  btnStop: {
    padding: '13px 38px',
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(12px)',
    color: '#52525B',
    border: '1.5px solid rgba(228,228,231,0.8)',
    borderRadius: 50,
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'transform 150ms ease',
  },
  hint: {
    fontSize: 13,
    color: '#A1A1AA',
    textAlign: 'center',
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: 1.7,
  },
};
