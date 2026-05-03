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

# ─── 1. Generate Synthetic Dataset ───────────────────────────────────────────
N = 6000  # jumlah baris

data = {
    'perasaan_sedih':        np.random.randint(0, 4, N),
    'minat_kegiatan':        np.random.randint(0, 4, N),
    'kualitas_tidur':        np.random.randint(0, 4, N),
    'tingkat_lelah':         np.random.randint(0, 4, N),
    'kesulitan_konsentrasi': np.random.randint(0, 4, N),
}

df = pd.DataFrame(data)
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

print("📊 Distribusi dataset:")
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

print(f"🏷️  Label classes: {le.classes_}")

# ─── 3. Split & Train ─────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train, y_train)

# ─── 4. Evaluasi ──────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"✅ Accuracy: {acc * 100:.2f}%")
print()
print("📋 Classification Report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# ─── 5. Simpan Model ──────────────────────────────────────────────────────────
joblib.dump(model, 'model_phq9.pkl')
joblib.dump(le, 'label_encoder_phq9.pkl')

print("💾 Model disimpan: model_phq9.pkl & label_encoder_phq9.pkl")
print("🎉 Training selesai! Jalankan app.py untuk menggunakan model baru.")
