import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ApiService {
  static String get baseUrl => AppConfig.baseUrl;

  // 🔥 Ambil token
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // 🔥 Header default + token
  Future<Map<String, String>> _headers() async {
    final String? token = await _getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // =============================
  // DASHBOARD
  // =============================
  Future<Map<String, dynamic>> fetchDashboardStats() async {
    final response = await http.get(
      Uri.parse('$baseUrl/dashboard-stats'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> body = jsonDecode(response.body);
      return body['data'];
    } else {
      throw Exception('Gagal ambil data statistik');
    }
  }

  // =============================
  // RELAXATION
  // =============================
  Future<bool> recordRelaxation(String name, {int duration = 5}) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/relaxation-sessions'),
            headers: await _headers(),
            body: jsonEncode({'activity_name': name, 'duration': duration}),
          )
          .timeout(const Duration(seconds: 3));

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      debugPrint('Error relaxation: $e');
      return false;
    }
  }

  // =============================
  // MOOD
  // =============================
  Future<bool> saveMood(String mood, int score, String catatan) async {
    final response = await http.post(
      Uri.parse('$baseUrl/moods'),
      headers: await _headers(),
      body: jsonEncode({'mood': mood, 'score': score, 'catatan': catatan}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return true;
    } else {
      throw Exception('Gagal menyimpan mood');
    }
  }

  Future<List<dynamic>> fetchMoodStats() async {
    final response = await http.get(
      Uri.parse('$baseUrl/mood-stats'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> body = jsonDecode(response.body);
      return body['data'];
    } else {
      throw Exception('Gagal ambil data mood');
    }
  }

  // =============================
  // JOURNAL
  // =============================
  Future<List<dynamic>> fetchRecentJournals({int limit = 3}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/journals'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      final List<dynamic> all = body['data'] ?? [];
      return all.take(limit).toList();
    } else {
      throw Exception('Gagal ambil jurnal terbaru');
    }
  }

  // =============================
  // ARTIKEL REKOMENDASI
  // =============================

  /// Versi lama — dipertahankan agar tidak breaking change di tempat lain
  /// yang masih memakainya. Internally memanggil versi baru.
  Future<List<dynamic>> fetchRecommendedArticles() async {
    final result = await fetchRecommendedArticlesWithCount();
    return result['data'] as List<dynamic>;
  }

  /// Versi baru — mengembalikan { 'total_count': int, 'data': List }
  /// Dipakai oleh dashboard_page.dart untuk menampilkan badge & tombol
  /// "Lihat Semua" beserta indikator belum-dibaca.
  Future<Map<String, dynamic>> fetchRecommendedArticlesWithCount() async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/my-recommended-articles'),
        headers: await _headers(),
      );

      debugPrint('ARTICLE RESPONSE: ${res.body}');

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body) as Map<String, dynamic>;
        if (body['status'] == 'success') {
          return {
            'total_count': body['total_count'] ?? 0,
            'data': body['data'] ?? [],
          };
        }
      }

      // Gagal atau status bukan success → kembalikan kosong
      return {'total_count': 0, 'data': []};
    } catch (e) {
      debugPrint('Error fetchRecommendedArticlesWithCount: $e');
      return {'total_count': 0, 'data': []};
    }
  }

  /// Tandai artikel sudah dibaca oleh user.
  /// Dipanggil saat user membuka detail artikel di dashboard.
  /// Silent fail — tidak blokir UI jika request gagal.
  Future<void> markArticleAsRead(String articleId) async {
    if (articleId.isEmpty) return;
    try {
      await http.post(
        Uri.parse('$baseUrl/articles/$articleId/read'),
        headers: await _headers(),
      );
    } catch (e) {
      debugPrint('markArticleAsRead error (ignored): $e');
    }
  }

  // =============================
  // GENERIC
  // =============================
  Future<dynamic> get(String endpoint) async {
    final res = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: await _headers(),
    );
    return jsonDecode(res.body);
  }
}