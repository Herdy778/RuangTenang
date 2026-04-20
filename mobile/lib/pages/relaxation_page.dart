import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

class RelaxationPage extends StatefulWidget {
  const RelaxationPage({super.key});

  @override
  State<RelaxationPage> createState() => _RelaxationPageState();
}

class _RelaxationPageState extends State<RelaxationPage>
    with TickerProviderStateMixin {
  int? _playingIndex;
  bool _isSaving = false;
  late AnimationController _waveController;
  final AudioPlayer _audioPlayer = AudioPlayer();
  Duration? _actualDuration;

  final List<Map<String, dynamic>> _musicTracks = [
    {
      "title": "Suara Hujan",
      "subtitle": "Cocok untuk tidur dan ketenangan",
      "icon": "🌧️",
      "duration": 5,
      "source": "audio/rain.mp3",
    },
    {
      "title": "Angin Hutan",
      "subtitle": "Kicau burung dan angin sepoi",
      "icon": "🍃",
      "duration": 10,
      "source": "audio/forest.mp3",
    },
    {
      "title": "Lo-fi Coffee Shop",
      "subtitle": "Fokus belajar atau kerja santai",
      "icon": "☕",
      "duration": 15,
      "source": "audio/lofi.mp3",
    },
  ];

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    _audioPlayer.onDurationChanged.listen((Duration d) {
      if (mounted && _playingIndex != null) {
        setState(() {
          _actualDuration = d;
        });
      }
    });
  }

  String _formatDuration(Duration? duration) {
    if (duration == null) return "Menghitung durasi...";
    String twoDigitSeconds = duration.inSeconds
        .remainder(60)
        .toString()
        .padLeft(2, "0");
    return "${duration.inMinutes}:$twoDigitSeconds mnt";
  }

  @override
  void dispose() {
    _waveController.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  void _togglePlay(int index) async {
    if (_playingIndex == index) {
      // Pause playing
      await _audioPlayer.pause();
      setState(() {
        _playingIndex = null;
        _actualDuration = null; // Clean up durasi saat di-stop
        _waveController.stop();
      });
    } else {
      final track = _musicTracks[index];
      print('Memutar musik: ${track["title"]}'); // Debugging kemulusan fungsi

      // Start playing newly selected music INSTANTLY
      final String assetPath = track["source"] as String;

      await _audioPlayer.play(AssetSource(assetPath));
      _audioPlayer.setReleaseMode(ReleaseMode.loop);

      // FIX UI LAG: Langsung kembalikan state agar animasi hidup
      setState(() {
        _actualDuration = null; // Reset menunggu deteksi baru
        _playingIndex = index;
        _waveController.repeat(reverse: true);
      });

      // 1. Ambil Durasi Secara Paksa
      Duration? d = await _audioPlayer.getDuration();

      // 2. Tambahkan Fallback (Cadangan)
      if (d == null) {
        await Future.delayed(const Duration(seconds: 1));
        d = await _audioPlayer.getDuration();

        // Jika limitasi browser membuat durasi tetap ghaib, pasang default 1 menit
        if (d == null) {
          d = const Duration(minutes: 1);
        }
      }

      // 3. Update UI agar teks tombol segera berubah
      if (mounted && _playingIndex == index) {
        setState(() {
          _actualDuration = d;
        });
      }
    }
  }

  Future<void> _finishSession(int index) async {
    final track = _musicTracks[index];
    int recordedDuration = track["duration"] as int;

    // Perbarui panjang durasi di backend jika audionya asli dan dihitung
    if (_actualDuration != null) {
      // Jika durasinya terdeteksi (meski kurang 1 menit), gunakan batas inMinutes, atau minimal 1
      recordedDuration = _actualDuration!.inMinutes > 0
          ? _actualDuration!.inMinutes
          : 1;
    }

    // Matikan audio saat sedang diproses untuk ditutup
    await _audioPlayer.stop();

    setState(() {
      _playingIndex = null;
      _actualDuration = null;
      _waveController.stop();
    });

    // Sinkronisasi API (tanpa await) dikembalikan utuh ke tombol Selesai
    ApiService().recordRelaxation(
      track["title"] as String,
      duration: recordedDuration,
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sesi relaksasi selesai! Tubuhmu berterima kasih.'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.pop(
        context,
        true,
      ); // Return true untuk memicu refresh dashboard
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new,
            color: AppColors.textPrimary,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "Sesi Relaksasi",
          style: AppTextStyles.titleLG.copyWith(color: AppColors.textPrimary),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          // Latar Belakang Aksen Ungu Pastel
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.deepPurple[100]!.withOpacity(0.3),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            left: -50,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.purple[50]!.withOpacity(0.5),
              ),
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Pilih Suasana", style: AppTextStyles.headingMD),
                  const SizedBox(height: 8),
                  Text(
                    "Dengarkan suara alam untuk menenangkan dan menjernihkan pikiranmu.",
                    style: AppTextStyles.bodyMD.copyWith(
                      color: AppColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 32),
                  Expanded(
                    child: ListView.separated(
                      itemCount: _musicTracks.length,
                      separatorBuilder: (context, index) =>
                          const SizedBox(height: 16),
                      itemBuilder: (context, index) {
                        final track = _musicTracks[index];
                        final isPlaying = _playingIndex == index;

                        return _buildMusicCard(track, index, isPlaying);
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

          if (_isSaving)
            Container(
              color: Colors.white.withOpacity(0.6),
              child: const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMusicCard(
    Map<String, dynamic> track,
    int index,
    bool isPlaying,
  ) {
    final bgColor = isPlaying ? Colors.deepPurple[50] : Colors.white;
    final borderColor = isPlaying ? Colors.deepPurple[200]! : Colors.grey[200]!;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor, width: 2),
        boxShadow: isPlaying
            ? [
                BoxShadow(
                  color: Colors.deepPurple.withOpacity(0.1),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ]
            : [
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Column(
        children: [
          ListTile(
            onTap: () => _togglePlay(index),
            leading: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.grey[100]!),
              ),
              child: Center(
                child: Text(
                  track["icon"] as String,
                  style: const TextStyle(fontSize: 24),
                ),
              ),
            ),
            title: Text(
              track["title"] as String,
              style: AppTextStyles.titleMD.copyWith(
                color: isPlaying
                    ? Colors.deepPurple[800]
                    : AppColors.textPrimary,
              ),
            ),
            subtitle: Text(
              track["subtitle"] as String,
              style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
            ),
            trailing: IconButton(
              iconSize: 40,
              padding: EdgeInsets.zero,
              icon: CircleAvatar(
                backgroundColor: isPlaying
                    ? Colors.deepPurple
                    : Colors.grey[100],
                child: Icon(
                  isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                  color: isPlaying ? Colors.white : Colors.grey[600],
                ),
              ),
              onPressed: () => _togglePlay(
                index,
              ), // Memanggil play langsung saat ikon bulat ditekan
            ),
          ),

          // Ruang Kontrol Aktif (Waveform & Simpan)
          if (isPlaying)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  SizedBox(
                    height:
                        50, // Fixed height agar gelombang tidak mendorong tombol di bawahnya
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment
                          .center, // Pusatkan gelombang secara vertikal
                      children: [
                        _buildWaveBar(0.2),
                        _buildWaveBar(0.5),
                        _buildWaveBar(0.8),
                        _buildWaveBar(0.3),
                        _buildWaveBar(0.7),
                        _buildWaveBar(0.4),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => _finishSession(index),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.deepPurple,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: Text(
                        _actualDuration == null
                            ? "Menghitung durasi..."
                            : "Selesai & Simpan Sesi (${_formatDuration(_actualDuration)})",
                        style: AppTextStyles.titleSM.copyWith(
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildWaveBar(double offset) {
    return AnimatedBuilder(
      animation: _waveController,
      builder: (context, child) {
        // Simple sin wave formula mixing offset
        final height =
            15 +
            (math.sin(
                      (_waveController.value * 2 * math.pi) +
                          (offset * math.pi * 2),
                    ) *
                    10)
                .abs();
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: 4,
          height: height,
          decoration: BoxDecoration(
            color: Colors.deepPurple[300],
            borderRadius: BorderRadius.circular(4),
          ),
        );
      },
    );
  }
}
