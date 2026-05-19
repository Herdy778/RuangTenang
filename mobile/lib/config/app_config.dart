import 'package:flutter/foundation.dart';
import 'dart:io' show Platform;

class AppConfig {
  // ⚠️ Ganti dengan IP lokal PC/laptop kamu (cek via `ipconfig` / `ifconfig`)
  static const String _localIp = '192.168.1.51';
  static const int _port = 8000;

  static String get baseUrl {
    // 1. Web (Chrome, browser)
    if (kIsWeb) {
      return 'http://localhost:$_port/api';
    }

    // 2. Android
    if (Platform.isAndroid) {
      // Emulator Android → 10.0.2.2 adalah alias untuk localhost PC
      // HP fisik          → pakai IP lokal
      return _isAndroidEmulator
          ? 'http://10.0.2.2:$_port/api'
          : 'http://$_localIp:$_port/api';
    }

    // 3. iOS
    if (Platform.isIOS) {
      // iOS Simulator → localhost
      // iPhone fisik  → IP lokal
      return _isIOSSimulator
          ? 'http://localhost:$_port/api'
          : 'http://$_localIp:$_port/api';
    }

    // 4. Desktop native (Windows / macOS / Linux)
    if (Platform.isWindows || Platform.isMacOS || Platform.isLinux) {
      return 'http://localhost:$_port/api';
    }

    // Fallback
    return 'http://$_localIp:$_port/api';
  }

  /// Android Emulator set env variable ANDROID_EMULATOR_DEVICE
  static bool get _isAndroidEmulator {
    try {
      return Platform.environment.containsKey('ANDROID_EMULATOR_DEVICE');
    } catch (_) {
      return false;
    }
  }

  /// iOS Simulator set env variable SIMULATOR_DEVICE_NAME
  static bool get _isIOSSimulator {
    try {
      return Platform.environment.containsKey('SIMULATOR_DEVICE_NAME');
    } catch (_) {
      return false;
    }
  }
}