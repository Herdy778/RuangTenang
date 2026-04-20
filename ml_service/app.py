from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

# ─── Load Model PHQ-9 ────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    model_path = os.path.join(BASE_DIR, 'model_phq9.pkl')
    label_path = os.path.join(BASE_DIR, 'label_encoder_phq9.pkl')
    
    model         = joblib.load(model_path)
    label_encoder = joblib.load(label_path)
    print("[OK] PHQ-9 Model Loaded Successfully!")
    print(f"     Label classes: {label_encoder.classes_}")
except Exception as e:
    print(f"[ERROR] Error loading model: {e}")
    model         = None
    label_encoder = None

# ─── Fitur yang dipakai (harus sama dengan saat training) ─────────────────────
FEATURE_COLUMNS = [
    'perasaan_sedih',
    'minat_kegiatan',
    'kualitas_tidur',
    'tingkat_lelah',
    'kesulitan_konsentrasi',
]

# ─── Pesan per kategori ───────────────────────────────────────────────────────
PESAN_MAP = {
    'Minimal': 'Kondisimu terlihat baik! Terus pertahankan kebiasaan positifmu.',
    'Ringan':  'Ada tanda kelelahan ringan. Coba istirahat cukup dan lakukan aktivitas yang kamu sukai.',
    'Sedang':  'Kondisimu memerlukan perhatian. Pertimbangkan berbicara dengan orang terpercaya atau konselor.',
    'Berat':   'Kondisimu memerlukan bantuan profesional. Kamu tidak harus menghadapi ini sendirian.',
}

# ─── Endpoint Prediksi ────────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    if model is None or label_encoder is None:
        return jsonify({
            'status':  'error',
            'message': 'Model belum dimuat. Jalankan train_phq9.py terlebih dahulu.'
        }), 500

    try:
        data = request.json

        # Validasi semua field wajib ada
        missing = [col for col in FEATURE_COLUMNS if col not in data]
        if missing:
            return jsonify({
                'status':  'error',
                'message': f'Field berikut tidak ditemukan: {missing}'
            }), 400

        # Konversi ke integer dan buat DataFrame
        input_values = {col: int(data[col]) for col in FEATURE_COLUMNS}
        input_df     = pd.DataFrame([input_values])

        # Validasi rentang nilai (0–3)
        for col, val in input_values.items():
            if not (0 <= val <= 3):
                return jsonify({
                    'status':  'error',
                    'message': f'Nilai {col} harus antara 0–3, didapat: {val}'
                }), 400

        # Hitung skor total & prediksi
        skor_total = sum(input_values.values())
        prediction = model.predict(input_df[FEATURE_COLUMNS])
        kategori   = label_encoder.inverse_transform(prediction)[0]

        return jsonify({
            'status':     'success',
            'prediction': kategori,          # Minimal / Ringan / Sedang / Berat
            'skor_total': skor_total,        # 0–15
            'message':    PESAN_MAP.get(kategori, 'Analisis selesai.'),
        })

    except (ValueError, TypeError) as e:
        return jsonify({
            'status':  'error',
            'message': f'Format data tidak valid: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'status':  'error',
            'message': f'Terjadi kesalahan: {str(e)}'
        }), 500


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model':  'PHQ-9 (5 fitur)',
        'loaded': model is not None,
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)