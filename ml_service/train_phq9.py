"""
train_phq9.py — RuangTenang ML Service
Generate synthetic PHQ-9 dataset (5 fitur terpilih) dan training model.

Fitur:
  perasaan_sedih       : 0-3
  minat_kegiatan       : 0-3
  kualitas_tidur       : 0-3
  tingkat_lelah        : 0-3
  kesulitan_konsentrasi: 0-3

Output Label (adaptasi skor PHQ):
  Skor 0-3  → Minimal
  Skor 4-7  → Ringan
  Skor 8-11 → Sedang
  Skor 12-15 → Berat
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib

np.random.seed(42)

# ─── 1. Load Authentic Dataset (Kaggle) ──────────────────────────────────────
csv_file = 'Dataset_14-day_AA_depression_symptoms_mood_and_PHQ-9.csv'
print(f"Membaca dataset asli: {csv_file}...")

df_raw = pd.read_csv(csv_file)

# Ekstrak 5 fitur PHQ yang kita butuhkan
# phq2 -> perasaan_sedih
# phq1 -> minat_kegiatan
# phq3 -> kualitas_tidur
# phq4 -> tingkat_lelah
# phq7 -> kesulitan_konsentrasi
kolom_dipakai = ['phq2', 'phq1', 'phq3', 'phq4', 'phq7']

# Pastikan data ada dan buang nilai kosong (NaN)
df = df_raw[kolom_dipakai].dropna().copy()
df = df.astype(int)

# Ganti nama kolom agar sesuai dengan aplikasi kita
df.columns = [
    'perasaan_sedih',
    'minat_kegiatan',
    'kualitas_tidur',
    'tingkat_lelah',
    'kesulitan_konsentrasi'
]

# Hapus baris duplikat karena di data asli, user yang sama mengisi mood berkali-kali
# tapi skor PHQ-nya tetap sama. Kita hanya butuh kombinasi unik untuk training ML.
df = df.drop_duplicates()

print(f"Total baris data unik setelah pembersihan: {len(df)}")

df['skor_total'] = df.sum(axis=1)


def kategorisasi(skor):
    if skor <= 3:
        return 'Minimal'
    elif skor <= 7:
        return 'Ringan'
    elif skor <= 11:
        return 'Sedang'
    else:
        return 'Berat'


df['kategori'] = df['skor_total'].apply(kategorisasi)

print("Distribusi dataset:")
print(df['kategori'].value_counts())
print()

# ─── 2. Encode Label ──────────────────────────────────────────────────────────
FEATURES = [
    'perasaan_sedih',
    'minat_kegiatan',
    'kualitas_tidur',
    'tingkat_lelah',
    'kesulitan_konsentrasi',
]

X = df[FEATURES]
y = df['kategori']

le = LabelEncoder()
y_encoded = le.fit_transform(y)

print(f"Label classes: {le.classes_}")

# ─── 3. Split & Train ─────────────────────────────────────────────────────────
# Split 1: Pisahkan 20% untuk Test. Sisa 80% untuk Train & Validation.
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# Split 2: Dari 80% sisa, ambil 12.5% (1/8) untuk Validation, yang setara dengan 10% dari total data.
# Sisanya 87.5% dari 80% (yaitu 70% dari total) untuk Train.
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.125, random_state=42, stratify=y_train_val
)

print(f"Data Split: {len(X_train)} Train (70%), {len(X_test)} Test (20%), {len(X_val)} Validation (10%)")

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train, y_train)

# ─── 4. Evaluasi ──────────────────────────────────────────────────────────────
y_val_pred = model.predict(X_val)
acc_val = accuracy_score(y_val, y_val_pred)
print(f"Validation Accuracy: {acc_val * 100:.2f}%")

y_test_pred = model.predict(X_test)
acc_test = accuracy_score(y_test, y_test_pred)
print(f"Test Accuracy: {acc_test * 100:.2f}%")
print()
print("Test Classification Report:")
print(classification_report(y_test, y_test_pred, target_names=le.classes_))

# ─── 5. Testing dengan Data Baru ──────────────────────────────────────────────
print("Testing Model dengan Data Baru (Simulasi Input User):")
new_data = pd.DataFrame([
    {'perasaan_sedih': 1, 'minat_kegiatan': 0, 'kualitas_tidur': 1, 'tingkat_lelah': 0, 'kesulitan_konsentrasi': 0}, # Harus Minimal (Total 2)
    {'perasaan_sedih': 3, 'minat_kegiatan': 3, 'kualitas_tidur': 3, 'tingkat_lelah': 3, 'kesulitan_konsentrasi': 3}, # Harus Berat (Total 15)
    {'perasaan_sedih': 2, 'minat_kegiatan': 2, 'kualitas_tidur': 1, 'tingkat_lelah': 2, 'kesulitan_konsentrasi': 1}, # Harus Sedang (Total 8)
])
new_predictions = model.predict(new_data)
new_predictions_labels = le.inverse_transform(new_predictions)
for i, (idx, row) in enumerate(new_data.iterrows()):
    print(f"Data {i+1}: {row.to_dict()} -> Prediksi: {new_predictions_labels[i]}")
print()

# ─── 6. Simpan Model ──────────────────────────────────────────────────────────
joblib.dump(model, 'model_phq9.pkl')
joblib.dump(le, 'label_encoder_phq9.pkl')

print("Model disimpan: model_phq9.pkl & label_encoder_phq9.pkl")
print("Training selesai! Jalankan app.py untuk menggunakan model baru.")
