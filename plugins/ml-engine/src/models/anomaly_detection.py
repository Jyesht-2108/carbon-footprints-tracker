"""
Anomaly Detection Model
Detects unusual emission patterns using Isolation Forest
"""
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from loguru import logger
import joblib
import os


class AnomalyDetector:
    """Detect anomalies in emissions data"""
    
    def __init__(self, contamination: float = 0.1, model_path: str = "models/anomaly"):
        """
        Initialize anomaly detector
        
        Args:
            contamination: Expected proportion of anomalies (0.1 = 10%)
            model_path: Path to save/load model
        """
        self.contamination = contamination
        self.model_path = model_path
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = []
        
    def train(self, data: pd.DataFrame, features: List[str] = None):
        """
        Train anomaly detection model
        
        Args:
            data: Training data
            features: List of feature columns to use
        """
        try:
            if features is None:
                # Use numeric columns
                features = data.select_dtypes(include=[np.number]).columns.tolist()
                # Remove timestamp-related columns
                features = [f for f in features if f not in ['id', 'timestamp']]
            
            self.feature_names = features
            
            # Prepare features
            X = data[features].fillna(0)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train Isolation Forest
            self.model = IsolationForest(
                contamination=self.contamination,
                random_state=42,
                n_estimators=100
            )
            self.model.fit(X_scaled)
            
            logger.info(f"Anomaly detection model trained on {len(features)} features")
            return True
            
        except Exception as e:
            logger.error(f"Error training anomaly detection model: {str(e)}")
            return False
    
    def detect(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Detect anomalies in data
        
        Returns:
            Dictionary with anomaly detection results
        """
        try:
            if not self.model:
                raise ValueError("Model not trained. Call train() first.")
            
            # Prepare features
            X = data[self.feature_names].fillna(0)
            X_scaled = self.scaler.transform(X)
            
            # Predict anomalies (-1 for anomaly, 1 for normal)
            predictions = self.model.predict(X_scaled)
            
            # Get anomaly scores (lower = more anomalous)
            scores = self.model.score_samples(X_scaled)
            
            # Normalize scores to 0-100 (0 = most anomalous, 100 = most normal)
            normalized_scores = self._normalize_scores(scores)
            
            # Identify anomalies
            anomalies = []
            for idx, (pred, score, norm_score) in enumerate(zip(predictions, scores, normalized_scores)):
                if pred == -1:  # Anomaly detected
                    anomaly_data = data.iloc[idx].to_dict()
                    anomalies.append({
                        'index': int(idx),
                        'timestamp': anomaly_data.get('timestamp', ''),
                        'source': anomaly_data.get('source', 'Unknown'),
                        'emissions': float(anomaly_data.get('emissions', 0)),
                        'anomaly_score': round(float(norm_score), 2),
                        'severity': self._get_severity(norm_score),
                        'features': {k: float(anomaly_data.get(k, 0)) for k in self.feature_names}
                    })
            
            # Sort by severity
            anomalies.sort(key=lambda x: x['anomaly_score'])
            
            result = {
                'anomalies': anomalies,
                'summary': {
                    'total_samples': len(data),
                    'anomalies_detected': len(anomalies),
                    'anomaly_rate': round(len(anomalies) / len(data) * 100, 2),
                    'severity_breakdown': self._get_severity_breakdown(anomalies)
                },
                'metadata': {
                    'model_type': 'isolation_forest',
                    'contamination': self.contamination,
                    'features_used': self.feature_names
                }
            }
            
            logger.info(f"Detected {len(anomalies)} anomalies in {len(data)} samples")
            return result
            
        except Exception as e:
            logger.error(f"Error detecting anomalies: {str(e)}")
            raise
    
    def detect_realtime(self, sample: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect if a single sample is anomalous (for real-time monitoring)
        
        Args:
            sample: Dictionary with feature values
            
        Returns:
            Anomaly detection result for the sample
        """
        try:
            if not self.model:
                raise ValueError("Model not trained")
            
            # Prepare features
            features = {k: sample.get(k, 0) for k in self.feature_names}
            X = pd.DataFrame([features])
            X_scaled = self.scaler.transform(X)
            
            # Predict
            prediction = self.model.predict(X_scaled)[0]
            score = self.model.score_samples(X_scaled)[0]
            normalized_score = self._normalize_scores([score])[0]
            
            is_anomaly = prediction == -1
            
            return {
                'is_anomaly': bool(is_anomaly),
                'anomaly_score': round(float(normalized_score), 2),
                'severity': self._get_severity(normalized_score),
                'confidence': round(abs(float(score)) * 100, 2),
                'features': features
            }
            
        except Exception as e:
            logger.error(f"Error in real-time detection: {str(e)}")
            raise
    
    def _normalize_scores(self, scores: np.ndarray) -> np.ndarray:
        """Normalize anomaly scores to 0-100 range"""
        # Scores are typically between -0.5 and 0.5
        # Convert to 0-100 where lower = more anomalous
        normalized = (scores + 0.5) * 100
        return np.clip(normalized, 0, 100)
    
    def _get_severity(self, score: float) -> str:
        """Determine severity level based on anomaly score"""
        if score < 20:
            return "critical"
        elif score < 40:
            return "high"
        elif score < 60:
            return "medium"
        else:
            return "low"
    
    def _get_severity_breakdown(self, anomalies: List[Dict]) -> Dict[str, int]:
        """Get count of anomalies by severity"""
        breakdown = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        for anomaly in anomalies:
            severity = anomaly.get('severity', 'low')
            breakdown[severity] = breakdown.get(severity, 0) + 1
        return breakdown
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get relative importance of features in anomaly detection
        (simplified version)
        """
        if not self.model:
            return {}
        
        # For Isolation Forest, we can't directly get feature importance
        # Return equal importance for now
        importance = {feature: 1.0 / len(self.feature_names) for feature in self.feature_names}
        return importance
    
    def save(self, path: Optional[str] = None):
        """Save model to disk"""
        save_path = path or self.model_path
        os.makedirs(save_path, exist_ok=True)
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'contamination': self.contamination
        }
        
        model_file = os.path.join(save_path, "anomaly_model.pkl")
        joblib.dump(model_data, model_file)
        logger.info(f"Model saved to {model_file}")
    
    def load(self, path: Optional[str] = None):
        """Load model from disk"""
        load_path = path or self.model_path
        model_file = os.path.join(load_path, "anomaly_model.pkl")
        
        if os.path.exists(model_file):
            model_data = joblib.load(model_file)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.contamination = model_data['contamination']
            logger.info(f"Model loaded from {model_file}")
            return True
        else:
            logger.warning(f"Model file not found: {model_file}")
            return False
