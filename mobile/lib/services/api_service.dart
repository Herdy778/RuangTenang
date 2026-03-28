import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // GANTI INI DENGAN IP LAPTOP KAMU!
  static const String baseUrl = 'http://192.168.100.117:8000/api';

  Future<Map<String, dynamic>> fetchDashboardStats() async {
    final response = await http.get(Uri.parse('$baseUrl/dashboard-stats'));

    if (response.statusCode == 200) {
      Map<String, dynamic> body = jsonDecode(response.body);
      return body['data'];
    } else {
      throw Exception('Gagal ambil data statistik dari server');
    }
  }

  Future<bool> recordRelaxation(String name, {int duration = 5}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/relaxation-sessions'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'activity_name': name,
          'duration': duration,
        }),
      ).timeout(const Duration(seconds: 2)); // UI tidak terhambat jika API lemot

      if (response.statusCode == 201 || response.statusCode == 200) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      print('Log API Background gagal: $e');
      return false; // Jangan throw, agar UI flutter tidak hang/crash
    }
  }

  Future<bool> saveMood(String mood, int score, String catatan) async {
    final response = await http.post(
      Uri.parse('$baseUrl/moods'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'mood': mood,
        'score': score,
        'catatan': catatan,
      }),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return true;
    } else {
      throw Exception('Gagal menyimpan mood');
    }
  }

  Future<List<dynamic>> fetchMoodStats() async {
    final response = await http.get(Uri.parse('$baseUrl/mood-stats'));

    if (response.statusCode == 200) {
      Map<String, dynamic> body = jsonDecode(response.body);
      return body['data']; // Mengambil list data mood
    } else {
      throw Exception('Gagal ambil data dari server');
    }
  }
}