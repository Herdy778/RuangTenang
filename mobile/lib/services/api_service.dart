import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://127.0.0.1:8000/api';

  // 🔥 Ambil token
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // 🔥 Header default + token
  Future<Map<String, String>> _headers() async {
    String? token = await _getToken();

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
      Map<String, dynamic> body = jsonDecode(response.body);
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
      print('Error relaxation: $e');
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
      Map<String, dynamic> body = jsonDecode(response.body);
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
      // Ambil hanya N entry terbaru
      return all.take(limit).toList();
    } else {
      throw Exception('Gagal ambil jurnal terbaru');
    }
  }

 Future<List<dynamic>> fetchRecommendedArticles() async {
  final response = await get('/my-recommended-articles');

  print("ARTICLE RESPONSE: $response");

  if (response['status'] == 'success') {
    return response['data'];
  } else {
    return [];
  }
}

Future<dynamic> get(String endpoint) async {
   final res = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: await _headers(),
   );

   return jsonDecode(res.body);
}
}
