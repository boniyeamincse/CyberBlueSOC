"""
AI-Powered Anomaly Detection Service for CyberBlueSOC

This module implements machine learning-based anomaly detection using Isolation Forest
to identify unusual patterns in system logs, network traffic, and user behavior.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder
from datetime import datetime, timedelta
import psutil
import joblib
import os
from typing import List, Dict, Optional, Tuple
from .models import AnomalyDetection, AnomalyType, AnomalySeverity, SystemMetrics
from .database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
import asyncio
import logging

logger = logging.getLogger(__name__)

class AnomalyDetectionService:
    """Service for detecting anomalies using machine learning models"""

    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.label_encoders = {}
        self.model_dir = "models/anomaly_detection"
        os.makedirs(self.model_dir, exist_ok=True)

        # Contamination parameters for different anomaly types
        self.contamination_rates = {
            AnomalyType.cpu_spike: 0.05,  # 5% expected anomalies
            AnomalyType.memory_anomaly: 0.03,  # 3% expected anomalies
            AnomalyType.login_anomaly: 0.02,  # 2% expected anomalies
            AnomalyType.network_traffic: 0.08,  # 8% expected anomalies
            AnomalyType.data_exfiltration: 0.01,  # 1% expected anomalies
        }

    def _get_model_path(self, anomaly_type: AnomalyType) -> str:
        """Get the file path for a specific anomaly type model"""
        return os.path.join(self.model_dir, f"{anomaly_type.value}_model.pkl")

    def _get_scaler_path(self, anomaly_type: AnomalyType) -> str:
        """Get the file path for a specific anomaly type scaler"""
        return os.path.join(self.model_dir, f"{anomaly_type.value}_scaler.pkl")

    async def train_cpu_anomaly_model(self, db: AsyncSession) -> None:
        """Train Isolation Forest model for CPU usage anomalies"""
        # Get historical CPU metrics
        result = await db.execute(
            select(SystemMetrics).order_by(desc(SystemMetrics.timestamp)).limit(1000)
        )
        metrics = result.scalars().all()

        if len(metrics) < 50:
            logger.warning("Insufficient CPU metrics data for training")
            return

        # Prepare training data
        data = pd.DataFrame([{
            'cpu_percent': m.cpu_percent,
            'memory_percent': m.memory_percent,
            'hour': m.timestamp.hour,
            'weekday': m.timestamp.weekday(),
        } for m in metrics])

        # Train model
        model = IsolationForest(
            contamination=self.contamination_rates[AnomalyType.cpu_spike],
            random_state=42,
            n_estimators=100
        )

        # Scale features
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(data)

        model.fit(scaled_data)

        # Save model and scaler
        anomaly_type = AnomalyType.cpu_spike
        joblib.dump(model, self._get_model_path(anomaly_type))
        joblib.dump(scaler, self._get_scaler_path(anomaly_type))

        self.models[anomaly_type] = model
        self.scalers[anomaly_type] = scaler

        logger.info("CPU anomaly detection model trained successfully")

    async def train_memory_anomaly_model(self, db: AsyncSession) -> None:
        """Train Isolation Forest model for memory usage anomalies"""
        result = await db.execute(
            select(SystemMetrics).order_by(desc(SystemMetrics.timestamp)).limit(1000)
        )
        metrics = result.scalars().all()

        if len(metrics) < 50:
            logger.warning("Insufficient memory metrics data for training")
            return

        # Prepare training data with memory patterns
        data = pd.DataFrame([{
            'memory_percent': m.memory_percent,
            'memory_used': m.memory_used,
            'memory_total': m.memory_total,
            'cpu_percent': m.cpu_percent,
            'hour': m.timestamp.hour,
        } for m in metrics])

        # Train model
        model = IsolationForest(
            contamination=self.contamination_rates[AnomalyType.memory_anomaly],
            random_state=42,
            n_estimators=100
        )

        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(data)

        model.fit(scaled_data)

        # Save model and scaler
        anomaly_type = AnomalyType.memory_anomaly
        joblib.dump(model, self._get_model_path(anomaly_type))
        joblib.dump(scaler, self._get_scaler_path(anomaly_type))

        self.models[anomaly_type] = model
        self.scalers[anomaly_type] = scaler

        logger.info("Memory anomaly detection model trained successfully")

    async def train_login_anomaly_model(self, db: AsyncSession) -> None:
        """Train model for detecting unusual login patterns"""
        # For now, create a simple mock model based on login times
        # In production, integrate with actual authentication logs
        login_data = []

        # Generate synthetic login patterns for training
        for hour in range(24):
            for weekday in range(7):
                # Normal login patterns: 8-18 on weekdays, less on weekends
                normal_logins = 10 if weekday < 5 and 8 <= hour <= 18 else 3
                login_data.extend([{
                    'hour': hour,
                    'weekday': weekday,
                    'login_count': normal_logins + np.random.normal(0, 2)
                } for _ in range(normal_logins)])

        data = pd.DataFrame(login_data)

        model = IsolationForest(
            contamination=self.contamination_rates[AnomalyType.login_anomaly],
            random_state=42,
            n_estimators=100
        )

        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(data)

        model.fit(scaled_data)

        anomaly_type = AnomalyType.login_anomaly
        joblib.dump(model, self._get_model_path(anomaly_type))
        joblib.dump(scaler, self._get_scaler_path(anomaly_type))

        self.models[anomaly_type] = model
        self.scalers[anomaly_type] = scaler

        logger.info("Login anomaly detection model trained successfully")

    def load_models(self) -> None:
        """Load trained models from disk"""
        for anomaly_type in AnomalyType:
            model_path = self._get_model_path(anomaly_type)
            scaler_path = self._get_scaler_path(anomaly_type)

            if os.path.exists(model_path) and os.path.exists(scaler_path):
                try:
                    self.models[anomaly_type] = joblib.load(model_path)
                    self.scalers[anomaly_type] = joblib.load(scaler_path)
                    logger.info(f"Loaded {anomaly_type.value} model")
                except Exception as e:
                    logger.error(f"Failed to load {anomaly_type.value} model: {e}")

    async def train_all_models(self, db: AsyncSession) -> None:
        """Train all anomaly detection models"""
        await self.train_cpu_anomaly_model(db)
        await self.train_memory_anomaly_model(db)
        await self.train_login_anomaly_model(db)
        logger.info("All anomaly detection models trained")

    def detect_cpu_anomaly(self, current_metrics: Dict) -> Optional[Tuple[float, str]]:
        """Detect CPU usage anomalies"""
        anomaly_type = AnomalyType.cpu_spike
        if anomaly_type not in self.models:
            return None

        # Prepare data
        data = pd.DataFrame([{
            'cpu_percent': current_metrics.get('cpu_percent', 0),
            'memory_percent': current_metrics.get('memory_percent', 0),
            'hour': datetime.now().hour,
            'weekday': datetime.now().weekday(),
        }])

        # Scale and predict
        scaled_data = self.scalers[anomaly_type].transform(data)
        prediction = self.models[anomaly_type].predict(scaled_data)
        score = self.models[anomaly_type].decision_function(scaled_data)[0]

        if prediction[0] == -1:  # Anomaly detected
            severity = self._calculate_severity(score, anomaly_type)
            description = f"CPU spike detected: {current_metrics.get('cpu_percent', 0):.1f}% usage"
            return score, severity, description

        return None

    def detect_memory_anomaly(self, current_metrics: Dict) -> Optional[Tuple[float, str, str]]:
        """Detect memory usage anomalies"""
        anomaly_type = AnomalyType.memory_anomaly
        if anomaly_type not in self.models:
            return None

        data = pd.DataFrame([{
            'memory_percent': current_metrics.get('memory_percent', 0),
            'memory_used': current_metrics.get('memory_used', 0),
            'memory_total': current_metrics.get('memory_total', 0),
            'cpu_percent': current_metrics.get('cpu_percent', 0),
            'hour': datetime.now().hour,
        }])

        scaled_data = self.scalers[anomaly_type].transform(data)
        prediction = self.models[anomaly_type].predict(scaled_data)
        score = self.models[anomaly_type].decision_function(scaled_data)[0]

        if prediction[0] == -1:
            severity = self._calculate_severity(score, anomaly_type)
            description = f"Memory anomaly detected: {current_metrics.get('memory_percent', 0):.1f}% usage"
            return score, severity, description

        return None

    def detect_login_anomaly(self, login_data: Dict) -> Optional[Tuple[float, str, str]]:
        """Detect unusual login patterns"""
        anomaly_type = AnomalyType.login_anomaly
        if anomaly_type not in self.models:
            return None

        data = pd.DataFrame([{
            'hour': login_data.get('hour', datetime.now().hour),
            'weekday': login_data.get('weekday', datetime.now().weekday()),
            'login_count': login_data.get('login_count', 1),
        }])

        scaled_data = self.scalers[anomaly_type].transform(data)
        prediction = self.models[anomaly_type].predict(scaled_data)
        score = self.models[anomaly_type].decision_function(scaled_data)[0]

        if prediction[0] == -1:
            severity = self._calculate_severity(score, anomaly_type)
            description = "Unusual login pattern detected"
            return score, severity, description

        return None

    def _calculate_severity(self, score: float, anomaly_type: AnomalyType) -> str:
        """Calculate severity based on anomaly score"""
        # More negative scores indicate higher confidence in anomaly
        if anomaly_type in [AnomalyType.data_exfiltration, AnomalyType.login_anomaly]:
            if score < -0.6:
                return AnomalySeverity.critical.value
            elif score < -0.3:
                return AnomalySeverity.high.value
            elif score < -0.1:
                return AnomalySeverity.medium.value
            else:
                return AnomalySeverity.low.value
        else:
            if score < -0.5:
                return AnomalySeverity.high.value
            elif score < -0.2:
                return AnomalySeverity.medium.value
            else:
                return AnomalySeverity.low.value

    async def process_current_metrics(self, db: AsyncSession) -> List[Dict]:
        """Process current system metrics and detect anomalies"""
        # Get current system metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()

        current_metrics = {
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'memory_used': memory.used,
            'memory_total': memory.total,
        }

        anomalies = []

        # Check for CPU anomalies
        cpu_anomaly = self.detect_cpu_anomaly(current_metrics)
        if cpu_anomaly:
            score, severity, description = cpu_anomaly
            anomalies.append({
                'type': AnomalyType.cpu_spike.value,
                'severity': severity,
                'score': score,
                'description': description,
                'source': 'system_metrics',
                'details': json.dumps(current_metrics)
            })

        # Check for memory anomalies
        memory_anomaly = self.detect_memory_anomaly(current_metrics)
        if memory_anomaly:
            score, severity, description = memory_anomaly
            anomalies.append({
                'type': AnomalyType.memory_anomaly.value,
                'severity': severity,
                'score': score,
                'description': description,
                'source': 'system_metrics',
                'details': json.dumps(current_metrics)
            })

        # Save detected anomalies to database
        for anomaly_data in anomalies:
            anomaly = AnomalyDetection(
                type=AnomalyType(anomaly_data['type']),
                severity=AnomalySeverity(anomaly_data['severity']),
                score=anomaly_data['score'],
                description=anomaly_data['description'],
                details=anomaly_data['details'],
                source=anomaly_data['source']
            )
            db.add(anomaly)

        await db.commit()

        # Broadcast anomalies via WebSocket if any detected
        if anomalies:
            from .websocket import manager
            await manager.broadcast({
                "type": "anomaly_detected",
                "data": anomalies,
                "timestamp": datetime.utcnow().isoformat()
            })

        return anomalies

# Global service instance
anomaly_service = AnomalyDetectionService()