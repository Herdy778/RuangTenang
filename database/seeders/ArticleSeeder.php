<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Article;

class ArticleSeeder extends Seeder
{
    /**
     * Jalankan dengan perintah:
     *   php artisan db:seed --class=ArticleSeeder
     *
     * Untuk menjalankan ulang tanpa duplikat, seeder ini sudah memanggil
     * Article::truncate() secara otomatis di awal.
     */
    public function run(): void
    {
        Article::truncate();

        $articles = [

            // ─────────────────────────────────────────────────────────
            // 1. BURNOUT — Pacing & Energy Management
            // ─────────────────────────────────────────────────────────
            [
                'judul_artikel' => 'Pacing & Energy Management: Strategi Ilmiah Melawan Burnout Akademik',
                'kategori_tag'  => 'Burnout',
                'penulis'       => 'Tim Psikologi RuangTenang',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                'referensi'     => [
                    'Maslach, C., & Leiter, M. P. (2016). Burnout. Stress: Concepts, Cognition, Emotion, and Behavior. Academic Press.',
                    'World Health Organization. (2019). Burn-out an "occupational phenomenon": International Classification of Diseases.',
                    'Sonnentag, S. (2012). Psychological detachment from work during leisure time. Current Directions in Psychological Science, 21(2), 114–118.',
                ],
                'isi_konten' => '
<p><strong>Apa itu Burnout Akademik?</strong><br>
Burnout bukan sekadar kelelahan biasa. Organisasi Kesehatan Dunia (WHO) secara resmi mengklasifikasikan burnout sebagai "occupational phenomenon" dalam International Classification of Diseases (ICD-11) — kondisi yang diakibatkan oleh stres kronis yang tidak berhasil dikelola. Dalam konteks akademik, burnout mahasiswa ditandai oleh tiga dimensi: kelelahan emosional yang mendalam (exhaustion), sikap sinis atau menjauh terhadap studi (cynicism), dan rasa tidak efektif atau tidak berdaya (inefficacy). Mengenali ketiga dimensi ini penting karena pemulihannya berbeda untuk setiap dimensi.</p>

<p><strong>Apa itu Pacing dan Mengapa Penting?</strong><br>
<em>Pacing</em> adalah strategi manajemen energi yang berasal dari rehabilitasi medis dan kini diadopsi oleh psikologi kesehatan. Prinsipnya sederhana namun sering dilanggar: sesuaikan aktivitas dengan kapasitas energimu saat ini, bukan dengan harapan tentang seberapa produktif kamu "seharusnya" bisa. Dalam praktiknya, ini berarti memecah sesi belajar menjadi blok-blok kecil (misalnya teknik Pomodoro: 25 menit fokus + 5 menit istirahat aktif), secara sadar bergantian antara tugas yang menguras energi tinggi dan rendah, serta menetapkan "batas atas" aktivitas harian — bahkan di hari yang terasa baik sekalipun — untuk mencegah boom-bust cycle yang memperparah burnout.</p>

<p><strong>Energy Management: Mengisi Tangki, Bukan Hanya Menghemat Bahan Bakar</strong><br>
Peneliti Sonnentag (2012) mengidentifikasi empat mekanisme <em>recovery</em> dari stres: <em>psychological detachment</em> (benar-benar melepaskan pikiran dari kuliah saat istirahat), <em>relaxation</em> (aktivitas yang menurunkan arousal, bukan sekadar duduk diam), <em>mastery</em> (pengalaman kompetensi di luar akademik — olahraga, memasak, bermain alat musik), dan <em>control</em> (memilih sendiri bagaimana mengisi waktu bebas). Keempat mekanisme ini terbukti memulihkan sumber daya mental lebih efektif daripada sekadar "tidak melakukan apa-apa". Tidak semua istirahat punya nilai recovery yang sama.</p>

<p><strong>Langkah Konkret Mulai Hari Ini</strong><br>
Pertama, audit energimu selama satu minggu: tandai kapan kamu merasa paling segar, paling terkuras, dan apa yang dilakukan sebelumnya. Ini memberimu data personal tentang ritme energimu sendiri. Kedua, jadwalkan istirahat berbasis energi, bukan hanya berbasis waktu — ambil jeda 10 menit setelah tugas kognitif berat, meski jam baru menunjukkan 30 menit berlalu. Ketiga, lindungi satu aktivitas "pengisi energi" setiap hari sebagai non-negotiable — dan tolak rasa bersalah yang menyertainya. Ingat: kamu bukan mesin. Pemulihan adalah bagian dari produktivitas, bukan kebalikannya.</p>
                ',
            ],

            // ─────────────────────────────────────────────────────────
            // 2. CEMAS — Grounding 5-4-3-2-1 (CBT)
            // ─────────────────────────────────────────────────────────
            [
                'judul_artikel' => 'Panduan Lengkap Grounding 5-4-3-2-1: Teknik CBT untuk Menghentikan Spiral Cemas',
                'kategori_tag'  => 'Cemas',
                'penulis'       => 'Tim Psikologi RuangTenang',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
                'referensi'     => [
                    'Beck, J. S. (2020). Cognitive Behavior Therapy: Basics and Beyond (3rd ed.). Guilford Press.',
                    'American Psychological Association. (2023). What is Cognitive Behavioral Therapy?',
                    'Kessler, R. C., et al. (2005). Lifetime prevalence of DSM-IV disorders. Archives of General Psychiatry, 62(6), 617–627.',
                ],
                'isi_konten' => '
<p><strong>Mengapa Kecemasan Membuat Pikiran "Kabur"?</strong><br>
Saat kecemasan melanda, otak mengaktifkan respons fight-or-flight: amygdala memicu lonjakan kortisol dan adrenalin, aliran darah dialihkan dari korteks prefrontal (pusat pikiran logis) ke sistem motorik. Hasilnya? Pikiran berputar tak terkendali, sulit berkonsentrasi, dan realitas terasa terdistorsi. Kecemasan pada mahasiswa sangat umum — riset Kessler et al. menemukan bahwa gangguan kecemasan adalah jenis gangguan mental paling prevalen secara global — namun juga sangat dapat dikelola dengan teknik yang tepat.</p>

<p><strong>Teknik Grounding 5-4-3-2-1: Cara Kerja dan Dasar Ilmiahnya</strong><br>
Grounding adalah teknik inti dalam Cognitive Behavioral Therapy (CBT) yang bekerja dengan cara "mengembalikan" perhatian dari pikiran abstrak tentang masa depan ke realitas sensoris yang konkret saat ini. Teknik 5-4-3-2-1 secara sistematis mengaktifkan kelima indera untuk memutus koneksi antara amygdala yang hiperaktif dan pikiran katastrofik. Caranya:<br>
<strong>5 hal yang kamu LIHAT</strong> — sebutkan secara detail (bukan hanya "kursi", tapi "kursi kayu cokelat dengan goresan di kaki kirinya").<br>
<strong>4 hal yang kamu SENTUH/RASAKAN</strong> — tekstur pakaian, suhu udara, berat tubuhmu di kursi.<br>
<strong>3 hal yang kamu DENGAR</strong> — suara latar yang selama ini diabaikan: kipas angin, langkah kaki, angin.<br>
<strong>2 hal yang kamu CIUM</strong> — bau ruangan, makanan, atau udara segar.<br>
<strong>1 hal yang kamu RASAKAN DI MULUT</strong> — rasa kopi, air, atau udara yang kamu hirup.</p>

<p><strong>Protokol Pelaksanaan untuk Hasil Maksimal</strong><br>
Lakukan dengan duduk tegak, jika memungkinkan letakkan kedua kaki flat di lantai. Proses setiap item secara sadar, jangan terburu-buru — semakin detail deskripsimu, semakin kuat efek groundingnya. Lengkapi dengan 3 siklus napas dalam (tarik 4 hitungan, tahan 4, hembuskan 6) sebelum memulai. Keseluruhan proses memakan waktu 3–7 menit. Tidak perlu kondisi sempurna — teknik ini bisa dilakukan di kamar kos, toilet kampus, atau bahkan di dalam kelas saat menunggu ujian.</p>

<p><strong>Membangun Kebiasaan: Melatih Sebelum Kamu Membutuhkannya</strong><br>
CBT mengajarkan bahwa keterampilan regulasi emosi perlu dilatih saat kondisi netral agar tersedia secara otomatis saat krisis. Coba praktikkan 5-4-3-2-1 satu kali setiap hari selama dua minggu, meski tidak sedang cemas — misalnya saat sarapan atau sebelum tidur. Otak yang sudah "tahu jalan" ke respons grounding akan jauh lebih cepat menggunakannya saat dibutuhkan. Keterampilan ini bukan obat ajaib, tapi dengan latihan ia menjadi alat yang sangat andal.</p>
                ',
            ],

            // ─────────────────────────────────────────────────────────
            // 3. SEDIH — Self-Compassion (Kristin Neff)
            // ─────────────────────────────────────────────────────────
            [
                'judul_artikel' => 'Self-Compassion ala Kristin Neff: Ilmu di Balik Bersikap Baik pada Diri Sendiri',
                'kategori_tag'  => 'Sedih',
                'penulis'       => 'Tim Psikologi RuangTenang',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80',
                'referensi'     => [
                    'Neff, K. D. (2003). Self-compassion: An alternative conceptualization of a healthy attitude toward oneself. Self and Identity, 2(2), 85–101.',
                    'Neff, K. D., & Germer, C. (2018). The Mindful Self-Compassion Workbook. Guilford Press.',
                    'MacBeth, A., & Gumley, A. (2012). Exploring compassion: A meta-analysis of MSC. Clinical Psychology Review, 32(6), 545–552.',
                ],
                'isi_konten' => '
<p><strong>Mengapa Kita Lebih Keras pada Diri Sendiri daripada pada Orang Lain?</strong><br>
Bayangkan sahabat terbaikmu baru saja gagal ujian penting. Apa yang kamu katakan kepadanya? Kemungkinan besar kata-kata penuh dukungan, pengertian, dan dorongan. Sekarang bayangkan kamu sendiri yang gagal. Apa yang kamu katakan kepada dirimu? Penelitian Dr. Kristin Neff dari University of Texas menunjukkan bahwa sebagian besar orang jauh lebih kritis, keras, dan tidak pengertian pada diri sendiri dibandingkan pada orang lain yang mereka cintai. Paradoks ini — memperlakukan diri sendiri lebih buruk dari standar yang kita terapkan pada orang lain — adalah akar dari banyak penderitaan emosional yang tidak perlu.</p>

<p><strong>Tiga Komponen Self-Compassion Menurut Neff</strong><br>
Self-compassion bukan narsisme atau memanjakan diri. Secara ilmiah, ia terdiri dari tiga elemen yang saling menopang. Pertama, <em>Self-Kindness</em>: bersikap hangat dan memahami kepada diri sendiri saat mengalami kesulitan atau kegagalan, alih-alih menghakimi diri dengan keras. Kedua, <em>Common Humanity</em>: menyadari bahwa penderitaan, ketidaksempurnaan, dan kegagalan adalah bagian dari pengalaman manusia yang universal — bukan nasib buruk yang unik menimpa dirimu saja. Ketiga, <em>Mindfulness</em>: mengamati pikiran dan perasaan menyakitkan dengan kesadaran yang seimbang, tanpa menekan maupun melebih-lebihkannya. Meta-analisis oleh MacBeth & Gumley (2012) terhadap 14 studi menemukan korelasi kuat antara self-compassion tinggi dan rendahnya tingkat kecemasan, depresi, dan stres.</p>

<p><strong>Latihan: Self-Compassion Break (5 Menit)</strong><br>
Ini adalah latihan inti yang diajarkan dalam program Mindful Self-Compassion (MSC) oleh Neff dan Germer. Saat kamu merasa sedih atau gagal, lakukan ini:<br>
<em>Langkah 1 — Acknowledgment:</em> "Ini adalah momen penderitaan. Ini sangat menyakitkan bagiku saat ini."<br>
<em>Langkah 2 — Common Humanity:</em> "Penderitaan adalah bagian dari kehidupan manusia. Banyak orang merasakan hal serupa."<br>
<em>Langkah 3 — Self-Kindness:</em> Letakkan tangan di dada, rasakan kehangatan dan detak jantungmu, dan katakan: "Semoga aku dapat bersikap baik pada diriku sendiri. Semoga aku dapat memberikan kebaikan yang aku butuhkan."<br>
Tidak harus terasa "benar" di percobaan pertama. Seperti otot, self-compassion menguat dengan latihan.</p>

<p><strong>Meluruskan Mitos: Self-Compassion Bukan Alasan untuk Tidak Berkembang</strong><br>
Kekhawatiran umum adalah bahwa bersikap baik pada diri sendiri akan membuat kita malas atau kehilangan motivasi. Riset Neff justru menemukan sebaliknya: individu yang memiliki self-compassion tinggi lebih bertanggung jawab atas kesalahan mereka (bukan membenarkannya), lebih termotivasi untuk berkembang (karena motivasinya dari keinginan tulus, bukan dari rasa takut), dan lebih tangguh setelah kegagalan. Self-criticism menciptakan ketakutan akan gagal yang menghambat pengambilan risiko. Self-compassion menciptakan rasa aman yang justru memungkinkan pertumbuhan.</p>
                ',
            ],

            // ─────────────────────────────────────────────────────────
            // 4. NETRAL — Mindfulness dalam Kehidupan Sehari-hari
            // ─────────────────────────────────────────────────────────
            [
                'judul_artikel' => 'Mindfulness dalam 5 Momen Sehari-hari: Panduan Praktis Tanpa Perlu Meditasi Formal',
                'kategori_tag'  => 'Netral',
                'penulis'       => 'Tim Psikologi RuangTenang',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
                'referensi'     => [
                    'Kabat-Zinn, J. (1994). Wherever You Go, There You Are: Mindfulness Meditation in Everyday Life. Hyperion.',
                    'Hölzel, B. K., et al. (2011). Mindfulness practice leads to increases in regional brain gray matter density. Psychiatry Research, 191(1), 36–43.',
                    'Lazar, S. W., et al. (2005). Meditation experience is associated with increased cortical thickness. NeuroReport, 16(17), 1893–1897.',
                ],
                'isi_konten' => '
<p><strong>Mindfulness Bukan Hanya Meditasi</strong><br>
Jon Kabat-Zinn, ilmuwan yang mempopulerkan mindfulness di dunia medis Barat, mendefinisikannya sebagai "perhatian yang disengaja, di momen saat ini, tanpa penilaian." Definisi ini tidak mensyaratkan bantal meditasi, musik relaksasi, atau waktu khusus 30 menit. Mindfulness adalah kualitas perhatian yang bisa dilatih kapan saja, di tengah aktivitas sehari-hari yang paling biasa sekalipun. Sains mendukung ini: studi Hölzel et al. (2011) dari Harvard menemukan bahwa program mindfulness 8 minggu secara literal meningkatkan kepadatan materi abu-abu di hippocampus (memori dan pembelajaran) dan menurunkannya di amygdala (pusat respons stres).</p>

<p><strong>5 Momen Sehari-hari untuk Melatih Mindfulness</strong><br>
<strong>1. Saat Mandi:</strong> Alih-alih memikirkan jadwal hari ini, alihkan perhatian penuh ke sensasi air — suhu, tekanan, aroma sabun. Ini juga momen detachment sempurna dari layar.<br>
<strong>2. Saat Makan:</strong> Makan satu suapan pertama dengan penuh perhatian — tekstur, rasa, dan aroma. Makan sambil scrolling mengurangi kepuasan makan dan meningkatkan kecenderungan makan berlebih.<br>
<strong>3. Saat Berjalan:</strong> Di antara kelas, perhatikan ritme langkahmu, kontak telapak kaki dengan tanah, suara dan pemandangan sekitar. Berjalan dengan sadar adalah meditasi berjalan ala Thich Nhat Hanh.<br>
<strong>4. Saat Antre atau Menunggu:</strong> Alih-alih refleks membuka ponsel, ambil 5 napas dalam dan perhatikan satu hal yang menarik di lingkungan sekitar.<br>
<strong>5. Saat Sebelum Tidur:</strong> 2 menit body scan — pindai perhatian dari kaki ke kepala, rasakan setiap bagian tubuh, lepaskan ketegangan yang kamu temukan.</p>

<p><strong>Mengapa Konsistensi Kecil Lebih Baik dari Sesi Panjang yang Jarang?</strong><br>
Otak belajar melalui pengulangan, bukan durasi. Studi neuroimaging Lazar et al. (2005) di Massachusetts General Hospital menunjukkan korteks prefrontal yang lebih tebal pada meditator berpengalaman — tapi ini dicapai melalui praktik harian yang konsisten selama bertahun-tahun, bukan satu retret meditasi panjang. Lima momen mindful per hari, dilakukan konsisten selama 30 hari, memberi perubahan yang lebih signifikan dibandingkan satu sesi meditasi 60 menit yang dilakukan sekali seminggu.</p>

<p><strong>Mulai Dari Satu Momen, Bukan Lima</strong><br>
Jangan coba melakukan semua lima momen sekaligus. Pilih satu momen yang paling alami bagimu — misalnya saat mandi — dan jadikan itu anchor mindfulness harianmu selama satu minggu penuh. Setelah konsisten, tambahkan satu momen lagi. Pendekatan bertahap ini jauh lebih efektif dan berkelanjutan daripada berusaha "menjadi mindful sepanjang hari" yang justru menambah beban kognitif dan rasa gagal.</p>
                ',
            ],

            // ─────────────────────────────────────────────────────────
            // 5. KRISIS — Psychological First Aid (PFA)
            // ─────────────────────────────────────────────────────────
            [
                'judul_artikel' => 'Psychological First Aid: Yang Harus Kamu Lakukan (dan Katakan) Saat Dirimu atau Temanmu dalam Krisis',
                'kategori_tag'  => 'Krisis',
                'penulis'       => 'Tim Psikologi RuangTenang',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?w=800&q=80',
                'referensi'     => [
                    'World Health Organization. (2011). Psychological First Aid: Guide for Field Workers. WHO Press.',
                    'National Institute of Mental Health. (2023). Suicide Prevention. NIMH.',
                    'Into The Light Indonesia. (2024). Hotline Kesehatan Jiwa Nasional: 119 ext 8.',
                ],
                'isi_konten' => '
<p><strong>Jika Kamu Membaca Ini Saat Krisis</strong><br>
Jika saat ini kamu memiliki pikiran untuk menyakiti dirimu sendiri atau merasakan dorongan untuk mengakhiri hidupmu, langkah pertama adalah menghubungi bantuan sekarang. <strong>Hotline Kesehatan Jiwa Nasional Indonesia: 119 ext 8</strong> — tersedia 24 jam, gratis, dan anonim. Kamu tidak harus tahu kata-kata yang tepat untuk diucapkan. Cukup katakan: "Saya butuh bantuan." Jika kamu merasa dalam bahaya langsung, pergi ke UGD rumah sakit terdekat. Krisis mental adalah kedaruratan medis yang sama validnya dengan kedaruratan fisik.</p>

<p><strong>Apa itu Psychological First Aid (PFA)?</strong><br>
Psychological First Aid adalah kerangka respons krisis berbasis bukti yang dikembangkan oleh WHO untuk membantu individu yang mengalami tekanan emosional berat. PFA bukan terapi, bukan konseling, dan tidak membutuhkan gelar psikologi untuk dipraktikkan. Delapan elemen inti PFA menurut WHO meliputi: kontak dan keterlibatan (mendekati dengan tenang dan non-judgmental), keamanan dan kenyamanan (memastikan kebutuhan dasar terpenuhi), stabilisasi (menenangkan individu yang overwhelmed), pengumpulan informasi (memahami kebutuhan dan kekhawatiran utama), bantuan praktis (menghubungkan dengan layanan yang tepat), koneksi sosial (memfasilitasi dukungan dari jaringan sosial), informasi tentang coping (memberikan psikoeduaksi yang relevan), dan linkage to services (menghubungkan ke layanan kesehatan mental profesional).</p>

<p><strong>Yang Harus dan Tidak Boleh Dikatakan Saat Menemani Seseorang dalam Krisis</strong><br>
<em>Katakan:</em> "Aku di sini bersamamu." — "Kamu tidak harus menanggung ini sendiri." — "Aku tidak akan menghakimimu." — "Mau ceritakan apa yang kamu rasakan?" — "Keselamatanmu yang paling penting sekarang."<br>
<em>Hindari:</em> "Banyak yang lebih susah darimu." — "Kamu harus bersyukur." — "Jangan lebay." — "Itu hanya pikiran negatif, abaikan saja." — "Kamu kuat, pasti bisa lewati ini." (Meski niatnya baik, pernyataan ini bisa membuat orang merasa tidak didengar dan semakin tertutup.)<br>
Mendengarkan secara aktif — tanpa solusi langsung, tanpa minimalisasi, tanpa penilaian — adalah tindakan yang paling terapeutik yang bisa kamu lakukan untuk seseorang dalam krisis.</p>

<p><strong>Daftar Kontak Bantuan Kesehatan Mental di Indonesia</strong><br>
🆘 <strong>Hotline Nasional Kesehatan Jiwa:</strong> 119 ext 8 (24 jam)<br>
💙 <strong>Into The Light Indonesia:</strong> 119 ext 8 | intothelightid.org<br>
🟢 <strong>Yayasan Pulih:</strong> (021) 788-42580 | yayasanpulih.org<br>
🔵 <strong>LSM Jangan Bunuh Diri:</strong> (021) 7884-5555 (14.00–22.00)<br>
🟣 <strong>Biro Konseling Kampus:</strong> Cek website kampusmu untuk layanan konseling gratis<br>
<em>Menyimpan nomor-nomor ini di ponselmu sekarang adalah tindakan pencegahan yang bijak — untuk dirimu maupun orang sekitarmu.</em></p>
                ',
            ],

        ];

        foreach ($articles as $data) {
            Article::create($data);
        }

        $this->command->info('✅ ArticleSeeder selesai: 5 artikel berhasil dimasukkan ke MongoDB.');
        $this->command->table(
            ['No', 'Judul Artikel', 'Kategori'],
            collect($articles)->map(fn($a, $i) => [
                $i + 1,
                \Illuminate\Support\Str::limit($a['judul_artikel'], 58),
                $a['kategori_tag'],
            ])->toArray()
        );
    }
}
