import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ApiService {
  static String get baseUrl => AppConfig.baseUrl;

  // Timeout default untuk semua request
  static const Duration _timeout = Duration(seconds: 15);

  // ─── Token ────────────────────────────────────────────────
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<Map<String, String>> _headers() async {
    final String? token = await _getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ─── Helper: decode response body ─────────────────────────
  dynamic _decode(http.Response res) {
    try {
      return jsonDecode(res.body);
    } catch (_) {
      throw Exception('Response bukan JSON valid (status ${res.statusCode})');
    }
  }

  // =========================================================
  // AUTH
  // =========================================================
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final res = await http
          .post(
            Uri.parse('$baseUrl/login'),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: jsonEncode({'email': email, 'password': password}),
          )
          .timeout(_timeout);

      final body = _decode(res) as Map<String, dynamic>;

      if (res.statusCode == 200) {
        return body;
      } else {
        throw Exception(
          body['message'] ?? 'Login gagal (${res.statusCode})',
        );
      }
    } on Exception {
      rethrow;
    } catch (e) {
      throw Exception('Koneksi gagal: $e\nPastikan server berjalan di $baseUrl');
    }
  }

  Future<void> logout() async {
    try {
      await http
          .post(
            Uri.parse('$baseUrl/logout'),
            headers: await _headers(),
          )
          .timeout(_timeout);
    } catch (_) {
      // Silent fail — tetap hapus token lokal
    } finally {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
    }
  }

  // =========================================================
  // DASHBOARD
  // =========================================================
  Future<Map<String, dynamic>> fetchDashboardStats() async {
    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl/dashboard-stats'),
            headers: await _headers(),
          )
          .timeout(_timeout);

      if (res.statusCode == 200) {
        final body = _decode(res) as Map<String, dynamic>;
        return body['data'] as Map<String, dynamic>;
      } else if (res.statusCode == 401) {
        throw Exception('Sesi habis, silakan login ulang');
      } else {
        throw Exception('Gagal ambil statistik (${res.statusCode})');
      }
    } on Exception {
      rethrow;
    } catch (e) {
      throw Exception('Koneksi gagal: $e');
    }
  }

  // =========================================================
  // RELAXATION
  // =========================================================
  Future<bool> recordRelaxation(String name, {int duration = 5}) async {
    try {
      final res = await http
          .post(
            Uri.parse('$baseUrl/relaxation-sessions'),
            headers: await _headers(),
            body: jsonEncode({'activity_name': name, 'duration': duration}),
          )
          .timeout(const Duration(seconds: 5));

      return res.statusCode == 200 || res.statusCode == 201;
    } catch (e) {
      debugPrint('recordRelaxation error: $e');
      return false;
    }
  }

  // =========================================================
  // MOOD
  // =========================================================
  Future<bool> saveMood(String mood, int score, String catatan) async {
    try {
      final res = await http
          .post(
            Uri.parse('$baseUrl/moods'),
            headers: await _headers(),
            body: jsonEncode({
              'mood': mood,
              'score': score,
              'catatan': catatan,
            }),
          )
          .timeout(_timeout);

      if (res.statusCode == 200 || res.statusCode == 201) {
        return true;
      } else {
        final body = _decode(res) as Map<String, dynamic>;
        throw Exception(body['message'] ?? 'Gagal menyimpan mood');
      }
    } on Exception {
      rethrow;
    } catch (e) {
      throw Exception('Koneksi gagal: $e');
    }
  }

  Future<List<dynamic>> fetchMoodStats() async {
    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl/mood-stats'),
            headers: await _headers(),
          )
          .timeout(_timeout);

      if (res.statusCode == 200) {
        final body = _decode(res) as Map<String, dynamic>;
        return body['data'] as List<dynamic>? ?? [];
      } else {
        throw Exception('Gagal ambil data mood (${res.statusCode})');
      }
    } on Exception {
      rethrow;
    } catch (e) {
      throw Exception('Koneksi gagal: $e');
    }
  }

  // =========================================================
  // JOURNAL
  // =========================================================
  Future<List<dynamic>> fetchRecentJournals({int limit = 3}) async {
    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl/journals'),
            headers: await _headers(),
          )
          .timeout(_timeout);

      if (res.statusCode == 200) {
        final body = _decode(res) as Map<String, dynamic>;
        final List<dynamic> all = body['data'] ?? [];
        return all.take(limit).toList();
      } else {
        throw Exception('Gagal ambil jurnal (${res.statusCode})');
      }
    } on Exception {
      rethrow;
    } catch (e) {
      throw Exception('Koneksi gagal: $e');
    }
  }

  // =========================================================
  // ARTIKEL REKOMENDASI
  // =========================================================

  /// Backward-compatible: hanya ambil list artikel
  Future<List<dynamic>> fetchRecommendedArticles() async {
    final result = await fetchRecommendedArticlesWithCount();
    return result['data'] as List<dynamic>;
  }

  /// Ambil artikel + total_count (untuk badge & tombol "Lihat Semua")
  Future<Map<String, dynamic>> fetchRecommendedArticlesWithCount() async {
    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl/my-recommended-articles'),
            headers: await _headers(),
          )
          .timeout(_timeout);

      debugPrint('ARTICLE RESPONSE [${res.statusCode}]: ${res.body}');

      if (res.statusCode == 200) {
        final body = _decode(res) as Map<String, dynamic>;
        if (body['status'] == 'success') {
          return {
            'total_count': body['total_count'] ?? 0,
            'data': body['data'] ?? [],
          };
        }
      }

      return {'total_count': 0, 'data': []};
    } catch (e) {
      debugPrint('fetchRecommendedArticlesWithCount error: $e');
      return {'total_count': 0, 'data': []};
    }
  }

  /// Tandai artikel sudah dibaca — silent fail
  Future<void> markArticleAsRead(String articleId) async {
    if (articleId.isEmpty) return;
    try {
      await http
          .post(
            Uri.parse('$baseUrl/articles/$articleId/read'),
            headers: await _headers(),
          )
          .timeout(const Duration(seconds: 5));
    } catch (e) {
      debugPrint('markArticleAsRead error (ignored): $e');
    }
  }

  // =========================================================
  // PROFILE
  // =========================================================
  Future<Map<String, dynamic>> fetchProfile() async {
    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl/profile'),
            headers: await _headers(),
          )
          .timeout(_timeout);

      if (res.statusCode == 200) {
        final body = _decode(res) as Map<String, dynamic>;
        return body['data'] as Map<String, dynamic>? ?? body;
      } else {
        throw Exception('Gagal ambil profil (${res.statusCode})');
      }
    } on Exception {
      rethrow;
    } catch (e) {
      throw Exception('Koneksi gagal: $e');
    }
  }

  // =========================================================
  // GENERIC GET
  // =========================================================
  Future<dynamic> get(String endpoint) async {
    try {
      final res = await http
          .get(
            Uri.parse('$baseUrl$endpoint'),
            headers: await _headers(),
          )
          .timeout(_timeout);
      return _decode(res);
    } catch (e) {
      throw Exception('GET $endpoint gagal: $e');
    }
  }
}