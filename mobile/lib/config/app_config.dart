import 'package:flutter/foundation.dart';
import 'dart:io' show Platform;

class AppConfig {
  static const String _localIp = '192.168.0.203';
  static const int _port = 8000;

  static String get baseUrl {
    // Web
    if (kIsWeb) {
      return 'http://localhost:$_port/api';
    }

    // Android
    if (!kIsWeb && Platform.isAndroid) {
      return _isAndroidEmulator
          ? 'http://10.0.2.2:$_port/api'
          : 'http://$_localIp:$_port/api';
    }

    // iOS
    if (!kIsWeb && Platform.isIOS) {
      return _isIOSSimulator
          ? 'http://localhost:$_port/api'
          : 'http://$_localIp:$_port/api';
    }

    // Desktop
    if (!kIsWeb &&
        (Platform.isWindows || Platform.isMacOS || Platform.isLinux)) {
      return 'http://localhost:$_port/api';
    }

    return 'http://$_localIp:$_port/api';
  }

  /// Deteksi emulator Android secara lebih reliable
  static bool get _isAndroidEmulator {
    try {
      // Cek beberapa env variable yang biasanya ada di emulator
      final env = Platform.environment;
      if (env.containsKey('ANDROID_EMULATOR_DEVICE')) return true;
      if (env.containsKey('ANDROID_SDK_ROOT')) {
        // Kalau ada SDK root tapi bukan dari device fisik
        // fallback ke false agar pakai IP lokal
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  /// Deteksi iOS Simulator
  static bool get _isIOSSimulator {
    try {
      return Platform.environment.containsKey('SIMULATOR_DEVICE_NAME');
    } catch (_) {
      return false;
    }
  }
}