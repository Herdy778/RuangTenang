/**
 * MoodChart.jsx
 * Visualisasi tren mood 7 hari terakhir menggunakan Recharts AreaChart.
 *
 * Props:
 *   journals  – array of journal objects dari /api/journals (sudah di-fetch oleh Dashboard)
 *
 * Jika `journals` kosong, komponen menampilkan Mock Data sebagai preview.
 */

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Pemetaan Mood → Nilai Numerik (1-5) ─────────────────────────
const MOOD_VALUE = {
  Krisis:  1,
  Burnout: 2,
  Sedih:   2.5,
  Cemas:   3,
  Netral:  4.5,
};

const MOOD_COLOR = {
  Krisis:  '#FB7185',
  Burnout: '#FCA27D',
  Sedih:   '#7DD3FC',
  Cemas:   '#C4B5FD',
  Netral:  '#6EE7B7',
};

// Label Y-axis (5 tingkatan)
const Y_LABELS = {
  1: 'Krisis',
  2: 'Berat',
  3: 'Cemas',
  4: 'Netral',
  5: 'Baik',
};

// ─── Mock Data (dipakai jika belum ada jurnal) ────────────────────
function buildMockData() {
  const moods = ['Cemas', 'Burnout', 'Sedih', 'Netral', 'Cemas', 'Netral', 'Netral'];
  const snippets = [
    'Tugas menumpuk, rasanya tidak sanggup menyelesaikan semuanya.',
    'Kelelahan setelah seminggu penuh presentasi dan deadline.',
    'Merindukan rumah dan keluarga, hati terasa berat hari ini.',
    'Hari yang cukup tenang, bisa fokus belajar.',
    'Khawatir soal ujian akhir yang semakin dekat.',
    'Jalan pagi tadi menyegarkan, mood jauh lebih baik.',
    'Berhasil menyelesaikan semua tugas, lega sekali!',
  ];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
      isoDate: d.toISOString().slice(0, 10),
      mood: moods[i],
      value: MOOD_VALUE[moods[i]],
      snippet: snippets[i],
      isMock: true,
    };
  });
}

// ─── Proses jurnal nyata menjadi data 7 hari ──────────────────────
function processJournals(journals) {
  // Buat 7 hari terakhir
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  // Kelompokkan jurnal per hari
  const byDay = {};
  journals.forEach(j => {
    const day = new Date(j.created_at).toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(j);
  });

  return days.map(isoDate => {
    const dayJournals = byDay[isoDate] || [];
    const d = new Date(isoDate);
    const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });

    if (dayJournals.length === 0) {
      return { date: label, isoDate, mood: null, value: null, snippet: null };
    }

    // Ambil jurnal dengan mood paling berat di hari itu
    const sorted = dayJournals.slice().sort(
      (a, b) => (MOOD_VALUE[a.hasil_mood] ?? 3) - (MOOD_VALUE[b.hasil_mood] ?? 3)
    );
    const main = sorted[0];
    return {
      date: label,
      isoDate,
      mood: main.hasil_mood,
      value: MOOD_VALUE[main.hasil_mood] ?? 3,
      snippet: main.teks_curhat?.substring(0, 80) + (main.teks_curhat?.length > 80 ? '...' : ''),
    };
  });
}

// ─── Custom Tooltip ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d?.mood) return null;
  const color = MOOD_COLOR[d.mood] || '#8B5CF6';

  return (
    <div style={tooltipStyles.box}>
      <div style={tooltipStyles.date}>{label}</div>
      <div style={{ ...tooltipStyles.mood, color }}>
        {d.mood}
      </div>
      {d.snippet && (
        <div style={tooltipStyles.snippet}>"{d.snippet}"</div>
      )}
      {d.isMock && (
        <div style={tooltipStyles.mock}>✦ Data contoh</div>
      )}
    </div>
  );
}

const tooltipStyles = {
  box: {
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(228,228,231,0.7)',
    borderRadius: 14,
    padding: '12px 16px',
    boxShadow: '0 8px 32px rgba(139,92,246,0.12)',
    maxWidth: 220,
    fontFamily: "'DM Sans', sans-serif",
  },
  date:    { fontSize: 11, color: '#A1A1AA', marginBottom: 4, fontWeight: 500 },
  mood:    { fontSize: 15, fontWeight: 700, marginBottom: 6 },
  snippet: { fontSize: 12, color: '#52525B', lineHeight: 1.5, fontStyle: 'italic' },
  mock:    { fontSize: 10, color: '#D1D5DB', marginTop: 6 },
};

// ─── Custom Dot (titik khusus untuk Krisis) ───────────────────────
function CustomDot(props) {
  const { cx, cy, payload } = props;
  if (!payload?.mood) return null;  // hari tanpa jurnal: sembunyikan dot

  if (payload.mood === 'Krisis') {
    return (
      <g>
        {/* Cincin peringatan merah */}
        <circle cx={cx} cy={cy} r={10} fill="rgba(251,113,133,0.15)" />
        <circle cx={cx} cy={cy} r={5}  fill="#FB7185" strokeWidth={0} />
      </g>
    );
  }
  const color = MOOD_COLOR[payload.mood] || '#8B5CF6';
  return <circle cx={cx} cy={cy} r={4} fill={color} strokeWidth={2} stroke="white" />;
}

// ─── Komponen Utama ───────────────────────────────────────────────
export default function MoodChart({ journals = [] }) {
  const useMock = journals.length === 0;
  const data    = useMock ? buildMockData() : processJournals(journals);

  // Hitung warna dominan untuk gradient
  const validMoods  = data.filter(d => d.mood);
  const avgValue    = validMoods.length
    ? validMoods.reduce((s, d) => s + d.value, 0) / validMoods.length
    : 3;
  const gradColor   = avgValue >= 4 ? '#6EE7B7' : avgValue >= 3 ? '#7DD3FC' : avgValue >= 2 ? '#C4B5FD' : '#FB7185';

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Tren Mood 7 Hari</h2>
          <p style={styles.sub}>
            {useMock ? 'Mulai jurnal untuk melihat tren mood aktualmu ✨' : 'Berdasarkan jurnal yang kamu tulis'}
          </p>
        </div>
        {useMock && (
          <span style={styles.mockBadge}>Contoh Data</span>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={gradColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={gradColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Sumbu X — Tanggal */}
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#A1A1AA', fontFamily: "'DM Sans', sans-serif" }}
            axisLine={false}
            tickLine={false}
          />

          {/* Sumbu Y — Level mood */}
          <YAxis
            domain={[0.5, 5]}
            ticks={[1, 2, 3, 4]}
            tickFormatter={v => Y_LABELS[v] || ''}
            tick={{ fontSize: 10, fill: '#D1D5DB', fontFamily: "'DM Sans', sans-serif" }}
            axisLine={false}
            tickLine={false}
            width={44}
          />

          {/* Tooltip estetik */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#E4E4E7', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          {/* Area utama */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={gradColor}
            strokeWidth={2.5}
            fill="url(#moodGradient)"
            connectNulls={false}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: gradColor, stroke: 'white', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend mood */}
      <div style={styles.legend}>
        {Object.entries(MOOD_COLOR).map(([mood, color]) => (
          <span key={mood} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: color }} />
            {mood}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = {
  wrapper: {
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: '24px 24px 16px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  title: {
    fontSize: 16, fontWeight: 600, color: '#18181B', marginBottom: 3,
    fontFamily: "'DM Sans', sans-serif",
  },
  sub: { fontSize: 12, color: '#A1A1AA' },
  mockBadge: {
    fontSize: 11, fontWeight: 600, padding: '3px 10px',
    background: '#FEF3C7', color: '#92400E',
    borderRadius: 50, flexShrink: 0,
  },
  legend: {
    display: 'flex', flexWrap: 'wrap', gap: '8px 18px',
    marginTop: 14, paddingTop: 12,
    borderTop: '1px solid #F4F4F5',
  },
  legendItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, color: '#A1A1AA',
    fontFamily: "'DM Sans', sans-serif",
  },
  legendDot: {
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
  },
};
