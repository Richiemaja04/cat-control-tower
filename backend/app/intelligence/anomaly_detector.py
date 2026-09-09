import numpy as np
from sklearn.ensemble import IsolationForest
import datetime
from typing import Dict, Any, List

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.is_fitted = False

    def fit_model(self, telemetry_records: List[Any]):
        """Fits IsolationForest model on historical telemetry feature vectors."""
        if not telemetry_records or len(telemetry_records) < 10:
            return
        
        feature_matrix = []
        for t in telemetry_records:
            feature_matrix.append([
                t.current_load_tons,
                t.speed,
                t.idle_hours,
                t.engine_temperature,
                t.hydraulic_pressure
            ])
        
        X = np.array(feature_matrix)
        self.model.fit(X)
        self.is_fitted = True

    def detect_behavioral_anomaly(self, telemetry: Any, asset: Any) -> Dict[str, Any]:
        """Evaluates single telemetry point using IsolationForest if fitted, or statistical z-score fallback."""
        if not telemetry:
            return None

        # Features: [load, speed, idle, temp, pressure]
        features = np.array([[
            telemetry.current_load_tons,
            telemetry.speed,
            telemetry.idle_hours,
            telemetry.engine_temperature,
            telemetry.hydraulic_pressure
        ]])

        is_anomaly = False
        score = 0.0

        if self.is_fitted:
            pred = self.model.predict(features)[0]  # -1 for anomaly, 1 for normal
            if pred == -1:
                is_anomaly = True
                score = float(self.model.score_samples(features)[0])
        else:
            # Fallback statistical thresholding
            if telemetry.engine_temperature > 95.0 or telemetry.hydraulic_pressure > 240.0:
                is_anomaly = True
                score = -0.75

        if is_anomaly:
            return {
                "type": "BEHAVIORAL_ANOMALY",
                "severity": "HIGH" if telemetry.engine_temperature > 95.0 else "MEDIUM",
                "observed_value": f"Temp: {telemetry.engine_temperature:.1f}°C, Pressure: {telemetry.hydraulic_pressure:.1f} bar",
                "threshold_value": "Normal Range (Temp < 90°C, Press < 220 bar)",
                "explanation": f"ML IsolationForest detected abnormal telemetry pattern for {asset.name} (Temp: {telemetry.engine_temperature:.1f}°C, Pressure: {telemetry.hydraulic_pressure:.1f} bar, Anomaly Score: {score:.2f}). Potential mechanical stress.",
                "timestamp": datetime.datetime.utcnow()
            }
        return None

anomaly_detector_instance = AnomalyDetector()
