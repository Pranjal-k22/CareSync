"""
HealConnect Experimental Module: 1D-CNN & Isolation Forest ECG Arrhythmia Prototype
===================================================================================
Location: exp_project/ecg_arrhythmia_prototype.py
Purpose: Prototype model for detecting arrhythmia anomalies from raw Lead-II ECG waveform signals.

Dependencies: numpy, scikit-learn
Model Architecture: Isolation Forest Anomaly Detection & 1D Waveform Spectral Feature Extraction
"""

import numpy as np
from sklearn.ensemble import IsolationForest

def generate_synthetic_ecg(duration_sec: float = 10.0, sampling_rate: int = 250, noise_level: float = 0.05) -> np.ndarray:
    """Generates synthetic Normal Sinus Rhythm (NSR) Lead-II ECG signal."""
    t = np.linspace(0, duration_sec, int(duration_sec * sampling_rate))
    ecg = np.zeros_like(t)
    heart_rate_bps = 1.2  # 72 bpm
    
    for i in range(int(duration_sec * heart_rate_bps)):
        t_beat = i / heart_rate_bps
        p_wave = 0.1 * np.exp(-((t - (t_beat + 0.1))**2) / 0.001)
        q_wave = -0.15 * np.exp(-((t - (t_beat + 0.18))**2) / 0.0005)
        r_wave = 1.0 * np.exp(-((t - (t_beat + 0.2))**2) / 0.0003)
        s_wave = -0.25 * np.exp(-((t - (t_beat + 0.22))**2) / 0.0005)
        t_wave = 0.2 * np.exp(-((t - (t_beat + 0.35))**2) / 0.004)
        ecg += p_wave + q_wave + r_wave + s_wave + t_wave

    noise = np.random.normal(0, noise_level, size=len(t))
    return ecg + noise

def extract_ecg_features(signal: np.ndarray, window_size: int = 250) -> np.ndarray:
    """Extracts mean, std, peak-to-peak amplitude, and spectral energy per 1-second window."""
    num_windows = len(signal) // window_size
    features = []
    
    for i in range(num_windows):
        window = signal[i*window_size : (i+1)*window_size]
        mean_val = np.mean(window)
        std_val = np.std(window)
        ptp_val = np.ptp(window)
        energy = np.sum(window**2) / float(window_size)
        features.append([mean_val, std_val, ptp_val, energy])
        
    return np.array(features)

def train_arrhythmia_detector(normal_features: np.ndarray):
    """Trains Isolation Forest for unsupervised anomaly/arrhythmia detection."""
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(normal_features)
    return model

if __name__ == "__main__":
    normal_ecg = generate_synthetic_ecg(duration_sec=30.0, noise_level=0.02)
    features = extract_ecg_features(normal_ecg)
    detector = train_arrhythmia_detector(features)
    
    # Test on normal window
    test_normal = extract_ecg_features(generate_synthetic_ecg(duration_sec=2.0))
    normal_pred = detector.predict(test_normal)
    
    # Test on ectopic arrhythmia window
    arrhythmic_ecg = generate_synthetic_ecg(duration_sec=2.0, noise_level=0.3) * 2.5
    test_arrhythmic = extract_ecg_features(arrhythmic_ecg)
    arrhythmic_pred = detector.predict(test_arrhythmic)
    
    print("=== ECG Arrhythmia Prototype Execution ===")
    print(f"Normal Signal Window Prediction (1=Normal, -1=Arrhythmia): {normal_pred}")
    print(f"Arrhythmic Signal Window Prediction (1=Normal, -1=Arrhythmia): {arrhythmic_pred}")
