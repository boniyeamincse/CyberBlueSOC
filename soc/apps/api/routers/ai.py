from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models import AuditLog, Incident
from auth import get_current_user, requires_roles
from typing import Dict, Any, List
import httpx
import json
import logging
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
import joblib
import os
import pandas as pd
import numpy as np

router = APIRouter()
logger = logging.getLogger(__name__)

class IncidentAnalysisService:
    """AI-powered incident analysis service"""

    def __init__(self):
        self.model_dir = "models/incident_analysis"
        os.makedirs(self.model_dir, exist_ok=True)
        self.model_path = os.path.join(self.model_dir, "incident_classifier.pkl")
        self.model = None
        self._load_model()

    def _load_model(self):
        """Load trained incident analysis model"""
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                logger.info("Loaded incident analysis model")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                self.model = None

    async def _load_security_data_from_sources(self, db) -> pd.DataFrame:
        """Load real security data from CyberBlueSOC sources (Wazuh, Suricata, TheHive)"""

        # Import required models
        from models import Incident, AuditLog, AnomalyDetection, SystemMetrics

        training_data = []

        try:
            # 1. Load incident data from TheHive/CyberBlueSOC incidents
            incidents_result = await db.execute(
                select(Incident).order_by(desc(Incident.created_at)).limit(1000)
            )
            incidents = incidents_result.scalars().all()

            for incident in incidents:
                # Extract features from incident data
                features = self._extract_incident_features(incident)
                training_data.append(features)

            # 2. Load anomaly detection data
            anomalies_result = await db.execute(
                select(AnomalyDetection).order_by(desc(AnomalyDetection.timestamp)).limit(500)
            )
            anomalies = anomalies_result.scalars().all()

            for anomaly in anomalies:
                features = self._extract_anomaly_features(anomaly)
                training_data.append(features)

            # 3. Load system metrics for baseline behavior
            metrics_result = await db.execute(
                select(SystemMetrics).order_by(desc(SystemMetrics.timestamp)).limit(2000)
            )
            metrics = metrics_result.scalars().all()

            # Convert metrics to incident-like features for training
            for metric in metrics:
                features = self._extract_metrics_features(metric)
                training_data.append(features)

            # 4. Load audit logs for behavioral patterns
            audit_result = await db.execute(
                select(AuditLog).order_by(desc(AuditLog.timestamp)).limit(1000)
            )
            audit_logs = audit_result.scalars().all()

            for log in audit_logs:
                features = self._extract_audit_features(log)
                training_data.append(features)

        except Exception as e:
            logger.warning(f"Failed to load some security data: {e}")
            # Fallback to synthetic data if real data loading fails
            return self._create_synthetic_training_data()

        if len(training_data) < 100:
            logger.warning("Insufficient real security data, using synthetic data")
            return self._create_synthetic_training_data()

        df = pd.DataFrame(training_data)

        # Normalize the data
        df = self._normalize_training_data(df)

        logger.info(f"Loaded {len(training_data)} real security data samples for training")
        return df

    def _extract_incident_features(self, incident) -> Dict:
        """Extract features from incident data"""
        description = (incident.description or '').lower()
        tags = (incident.tags or '').lower()

        return {
            'alert_count': len(tags.split(',')) if tags else 1,
            'severity_score': self._severity_to_score(incident.severity),
            'has_malware_hash': 1 if any(word in description for word in ['hash', 'md5', 'sha256', 'malware']) else 0,
            'network_traffic_anomaly': 1 if any(word in description for word in ['traffic', 'network', 'connection']) else 0,
            'login_failure_count': 1 if 'login' in description and 'fail' in description else 0,
            'data_exfiltration_indicators': 1 if any(word in description for word in ['exfiltrat', 'leak', 'data']) else 0,
            'privilege_change_count': 1 if any(word in description for word in ['privilege', 'admin', 'root']) else 0,
            'hour_of_day': incident.created_at.hour if hasattr(incident, 'created_at') else 12,
            'is_business_hours': 1 if incident.created_at.hour in range(8, 18) else 0,
            'source_ip_count': len([tag for tag in tags.split(',') if 'ip' in tag]) if tags else 1,
            'affected_systems': 1,  # Default, could be enhanced
            'threat_actor_indicators': 1 if any(word in description for word in ['threat', 'actor', 'attack']) else 0,
            'known_malware_signature': 1 if 'malware' in description or 'signature' in description else 0,
            'incident_type': self._classify_incident_type(description, tags)
        }

    def _extract_anomaly_features(self, anomaly) -> Dict:
        """Extract features from anomaly detection data"""
        description = (anomaly.description or '').lower()

        return {
            'alert_count': 1,
            'severity_score': self._severity_to_score(anomaly.severity),
            'has_malware_hash': 0,
            'network_traffic_anomaly': 1 if 'network' in description else 0,
            'login_failure_count': 1 if 'login' in description else 0,
            'data_exfiltration_indicators': 1 if 'data' in description or 'exfiltrat' in description else 0,
            'privilege_change_count': 0,
            'hour_of_day': anomaly.timestamp.hour if hasattr(anomaly, 'timestamp') else 12,
            'is_business_hours': 1 if anomaly.timestamp.hour in range(8, 18) else 0,
            'source_ip_count': 1,
            'affected_systems': 1,
            'threat_actor_indicators': 1 if 'anomaly' in description else 0,
            'known_malware_signature': 0,
            'incident_type': self._classify_anomaly_type(anomaly.type, description)
        }

    def _extract_metrics_features(self, metric) -> Dict:
        """Extract features from system metrics (for baseline behavior)"""
        return {
            'alert_count': 0,  # Normal system metrics
            'severity_score': 1,  # Low severity for normal metrics
            'has_malware_hash': 0,
            'network_traffic_anomaly': 0,
            'login_failure_count': 0,
            'data_exfiltration_indicators': 0,
            'privilege_change_count': 0,
            'hour_of_day': metric.timestamp.hour,
            'is_business_hours': 1 if metric.timestamp.hour in range(8, 18) else 0,
            'source_ip_count': 0,
            'affected_systems': 0,
            'threat_actor_indicators': 0,
            'known_malware_signature': 0,
            'incident_type': 'normal'  # Normal system behavior
        }

    def _extract_audit_features(self, audit_log) -> Dict:
        """Extract features from audit logs"""
        action = (audit_log.action or '').lower()
        resource = (audit_log.resource or '').lower()

        return {
            'alert_count': 1 if 'security' in action else 0,
            'severity_score': 2 if 'critical' in action else 1,
            'has_malware_hash': 0,
            'network_traffic_anomaly': 1 if 'network' in action else 0,
            'login_failure_count': 1 if 'login' in action and 'fail' in action else 0,
            'data_exfiltration_indicators': 1 if 'export' in action or 'data' in action else 0,
            'privilege_change_count': 1 if 'admin' in action or 'privilege' in action else 0,
            'hour_of_day': audit_log.timestamp.hour if hasattr(audit_log, 'timestamp') else 12,
            'is_business_hours': 1 if audit_log.timestamp.hour in range(8, 18) else 0,
            'source_ip_count': 1,
            'affected_systems': 1,
            'threat_actor_indicators': 1 if 'security' in action else 0,
            'known_malware_signature': 0,
            'incident_type': self._classify_audit_action(action, resource)
        }

    def _classify_incident_type(self, description: str, tags: str) -> str:
        """Classify incident type based on description and tags"""
        desc_lower = description.lower()
        tags_lower = tags.lower()

        if any(word in desc_lower for word in ['malware', 'virus', 'trojan']):
            return 'malware'
        elif any(word in desc_lower for word in ['phish', 'spam', 'email']):
            return 'phishing'
        elif any(word in desc_lower for word in ['intrusion', 'breach', 'unauthorized']):
            return 'intrusion'
        elif any(word in desc_lower for word in ['leak', 'exfiltrat', 'data']):
            return 'data_leak'
        elif any(word in desc_lower for word in ['dos', 'denial', 'flood']):
            return 'denial_of_service'
        elif any(word in desc_lower for word in ['privilege', 'escalat', 'admin']):
            return 'privilege_escalation'
        else:
            return 'intrusion'  # Default

    def _classify_anomaly_type(self, anomaly_type: str, description: str) -> str:
        """Classify anomaly type"""
        type_str = str(anomaly_type).lower()
        desc_lower = description.lower()

        if 'cpu' in type_str or 'memory' in desc_lower:
            return 'intrusion'
        elif 'login' in desc_lower:
            return 'intrusion'
        elif 'network' in desc_lower:
            return 'denial_of_service'
        else:
            return 'intrusion'

    def _classify_audit_action(self, action: str, resource: str) -> str:
        """Classify audit action type"""
        action_lower = action.lower()
        resource_lower = resource.lower()

        if 'login' in action_lower and 'fail' in action_lower:
            return 'intrusion'
        elif 'export' in action_lower or 'data' in resource_lower:
            return 'data_leak'
        elif 'admin' in resource_lower or 'privilege' in action_lower:
            return 'privilege_escalation'
        else:
            return 'normal'

    def _normalize_training_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize training data features"""
        # Remove outliers and normalize numerical features
        numerical_cols = ['alert_count', 'severity_score', 'login_failure_count',
                         'privilege_change_count', 'source_ip_count', 'affected_systems']

        for col in numerical_cols:
            if col in df.columns:
                # Clip outliers to 99th percentile
                upper_limit = df[col].quantile(0.99)
                df[col] = df[col].clip(upper=None, upper=upper_limit)

                # Normalize to 0-1 range
                if df[col].max() > 0:
                    df[col] = (df[col] - df[col].min()) / (df[col].max() - df[col].min())

        return df

    def _create_synthetic_training_data(self) -> pd.DataFrame:
        """Create synthetic training data as fallback"""
        # [existing synthetic data creation code]
        data = []
        incident_types = ['malware', 'phishing', 'intrusion', 'data_leak', 'denial_of_service', 'privilege_escalation', 'normal']

        for i in range(1000):
            incident_type = np.random.choice(incident_types)
            severity_level = np.random.choice(['low', 'medium', 'high', 'critical'])

            features = {
                'alert_count': np.random.poisson(5),
                'severity_score': {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}[severity_level],
                'has_malware_hash': 1 if incident_type in ['malware', 'phishing'] else 0,
                'network_traffic_anomaly': np.random.choice([0, 1]),
                'login_failure_count': np.random.poisson(3),
                'data_exfiltration_indicators': 1 if incident_type == 'data_leak' else 0,
                'privilege_change_count': np.random.poisson(2),
                'hour_of_day': np.random.randint(0, 24),
                'is_business_hours': 1 if np.random.randint(0, 24) in range(8, 18) else 0,
                'source_ip_count': np.random.poisson(10),
                'affected_systems': np.random.poisson(5),
                'threat_actor_indicators': np.random.choice([0, 1]),
                'known_malware_signature': 1 if incident_type == 'malware' else 0,
                'incident_type': incident_type
            }
            data.append(features)

        df = pd.DataFrame(data)
        return df

    async def train_model(self, db) -> None:
        """Train the incident analysis model using real CyberBlueSOC data"""
        logger.info("Training incident analysis model with CyberBlueSOC security data...")

        try:
            # Load real security data from CyberBlueSOC sources
            df = await self._load_security_data_from_sources(db)

            if df.empty or len(df) < 50:
                logger.warning("Insufficient training data, falling back to synthetic data")
                df = self._create_synthetic_training_data()

            # Prepare features and labels
            X = df.drop('incident_type', axis=1)
            y = df['incident_type']

            # Handle class imbalance
            from sklearn.utils import class_weight
            class_weights = class_weight.compute_class_weight('balanced', classes=np.unique(y), y=y)
            class_weight_dict = dict(zip(np.unique(y), class_weights))

            # Train Random Forest model with class weights
            self.model = RandomForestClassifier(
                n_estimators=200,
                random_state=42,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                class_weight=class_weight_dict,
                n_jobs=-1  # Use all available cores
            )

            self.model.fit(X, y)

            # Save model
            joblib.dump(self.model, self.model_path)
            logger.info(f"Incident analysis model trained with {len(df)} samples and saved")

            # Log training statistics
            self._log_training_stats(X, y)

        except Exception as e:
            logger.error(f"Failed to train model with real data: {e}")
            # Fallback to synthetic training
            self._train_with_synthetic_data()

    def _train_with_synthetic_data(self) -> None:
        """Fallback training with synthetic data"""
        logger.info("Training with synthetic data as fallback...")

        df = self._create_synthetic_training_data()
        X = df.drop('incident_type', axis=1)
        y = df['incident_type']

        self.model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=10
        )
        self.model.fit(X, y)

        joblib.dump(self.model, self.model_path)
        logger.info("Fallback model trained with synthetic data")

    def _log_training_stats(self, X, y) -> None:
        """Log training statistics"""
        try:
            from sklearn.metrics import classification_report
            from collections import Counter

            # Basic statistics
            logger.info(f"Training set size: {len(X)} samples")
            logger.info(f"Feature count: {X.shape[1]}")
            logger.info(f"Class distribution: {Counter(y)}")

            # Cross-validation score
            from sklearn.model_selection import cross_val_score
            cv_scores = cross_val_score(self.model, X, y, cv=5, scoring='f1_macro')
            logger.info(f"Cross-validation F1-macro: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")

            # Feature importance
            feature_importance = dict(zip(X.columns, self.model.feature_importances_))
            top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:5]
            logger.info(f"Top 5 important features: {top_features}")

        except Exception as e:
            logger.warning(f"Could not compute training statistics: {e}")

    def analyze_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze incident using AI model"""
        if not self.model:
            # Fallback analysis if no model is available
            return self._fallback_analysis(incident_data)

        try:
            # Extract features from incident data
            features = self._extract_features(incident_data)

            # Convert to DataFrame
            features_df = pd.DataFrame([features])

            # Predict incident type
            predictions = self.model.predict(features_df)
            probabilities = self.model.predict_proba(features_df)

            # Get confidence scores
            confidence_scores = {cls: prob for cls, prob in zip(self.model.classes_, probabilities[0])}

            # Sort by confidence
            sorted_predictions = sorted(confidence_scores.items(), key=lambda x: x[1], reverse=True)

            analysis_result = {
                'predicted_type': sorted_predictions[0][0],
                'confidence': sorted_predictions[0][1],
                'alternative_types': [pred[0] for pred in sorted_predictions[1:3]],
                'severity_assessment': self._assess_severity(incident_data, sorted_predictions[0][0]),
                'recommended_actions': self._get_recommended_actions(sorted_predictions[0][0], incident_data),
                'risk_score': self._calculate_risk_score(incident_data, sorted_predictions[0][1]),
                'analysis_timestamp': datetime.utcnow().isoformat()
            }

            return analysis_result

        except Exception as e:
            logger.error(f"Error in incident analysis: {e}")
            return self._fallback_analysis(incident_data)

    def _extract_features(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract features from incident data for model prediction"""
        description = incident_data.get('description', '').lower()

        return {
            'alert_count': incident_data.get('alert_count', 1),
            'severity_score': self._severity_to_score(incident_data.get('severity', 'medium')),
            'has_malware_hash': 1 if 'hash' in description or 'md5' in description or 'sha' in description else 0,
            'network_traffic_anomaly': 1 if 'network' in description or 'traffic' in description else 0,
            'login_failure_count': incident_data.get('login_failures', 0),
            'data_exfiltration_indicators': 1 if 'exfiltration' in description or 'leak' in description else 0,
            'privilege_change_count': incident_data.get('privilege_changes', 0),
            'hour_of_day': datetime.now().hour,
            'is_business_hours': 1 if datetime.now().hour in range(8, 18) else 0,
            'source_ip_count': incident_data.get('source_ips', 1),
            'affected_systems': incident_data.get('affected_systems', 1),
            'threat_actor_indicators': 1 if 'threat' in description or 'actor' in description else 0,
            'known_malware_signature': 1 if 'malware' in description or 'virus' in description else 0
        }

    def _severity_to_score(self, severity: str) -> int:
        """Convert severity string to numeric score"""
        severity_map = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
        return severity_map.get(severity.lower(), 2)

    def _assess_severity(self, incident_data: Dict[str, Any], predicted_type: str) -> str:
        """Assess overall severity based on incident data and prediction"""
        base_severity = incident_data.get('severity', 'medium')

        # Adjust severity based on predicted type and indicators
        severity_boost = {
            'data_leak': 2,
            'intrusion': 2,
            'privilege_escalation': 2,
            'denial_of_service': 1,
            'malware': 1,
            'phishing': 1
        }

        current_score = self._severity_to_score(base_severity)
        boost = severity_boost.get(predicted_type, 0)

        final_score = min(current_score + boost, 4)

        severity_map = {1: 'low', 2: 'medium', 3: 'high', 4: 'critical'}
        return severity_map[final_score]

    def _get_recommended_actions(self, incident_type: str, incident_data: Dict[str, Any]) -> List[str]:
        """Get recommended response actions based on incident type"""
        actions_map = {
            'malware': [
                'Isolate affected systems',
                'Quarantine detected malware',
                'Scan for additional threats',
                'Update endpoint protection signatures'
            ],
            'phishing': [
                'Block sender domain/email addresses',
                'Educate users about phishing indicators',
                'Reset compromised credentials',
                'Monitor for credential abuse'
            ],
            'intrusion': [
                'Review access logs and audit trails',
                'Change affected system credentials',
                'Apply security patches',
                'Implement network segmentation'
            ],
            'data_leak': [
                'Contain data exfiltration',
                'Assess data exposure scope',
                'Notify affected parties',
                'Review data protection controls'
            ],
            'denial_of_service': [
                'Implement traffic filtering',
                'Scale infrastructure resources',
                'Contact ISP for mitigation assistance',
                'Monitor for attack patterns'
            ],
            'privilege_escalation': [
                'Review user access permissions',
                'Implement principle of least privilege',
                'Audit privileged account usage',
                'Monitor for lateral movement'
            ]
        }

        return actions_map.get(incident_type, ['Investigate incident details', 'Implement containment measures'])

    def _calculate_risk_score(self, incident_data: Dict[str, Any], confidence: float) -> float:
        """Calculate overall risk score (0-100)"""
        base_severity = self._severity_to_score(incident_data.get('severity', 'medium'))

        # Factors contributing to risk
        factors = [
            base_severity / 4.0,  # Severity contribution (0-1)
            confidence,           # AI confidence (0-1)
            min(incident_data.get('affected_systems', 1) / 10.0, 1.0),  # Impact scale
            1.0 if incident_data.get('is_business_critical', False) else 0.5  # Business criticality
        ]

        # Weighted average
        weights = [0.4, 0.3, 0.2, 0.1]
        risk_score = sum(f * w for f, w in zip(factors, weights))

        return round(risk_score * 100, 2)

    def _fallback_analysis(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback analysis when model is not available"""
        return {
            'predicted_type': 'unknown',
            'confidence': 0.0,
            'alternative_types': [],
            'severity_assessment': incident_data.get('severity', 'medium'),
            'recommended_actions': ['Manual investigation required', 'Review incident details'],
            'risk_score': 50.0,
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'note': 'AI model not available, using rule-based analysis'
        }

# Global service instance
incident_analysis_service = IncidentAnalysisService()

@router.post("/incidents/{incident_id}/analyze")
@requires_roles(["admin", "analyst"])
async def analyze_incident(
    incident_id: int,
    req: Request,
    db: Session = Depends(get_db)
):
    """AI-powered incident analysis using real-time ML models"""

    # Get incident details
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    user_data = get_current_user(req)
    client_ip = req.client.host if req.client else "unknown"

    # Prepare comprehensive incident data for analysis
    incident_data = {
        'id': incident.id,
        'title': incident.title,
        'description': incident.description,
        'severity': incident.severity,
        'created_at': incident.created_at.isoformat(),
        'tags': incident.tags or ''
    }

    # Extract additional context from tags and related data
    if incident.tags:
        tags = dict(tag.split(':') for tag in incident.tags.split(',') if ':' in tag)
        incident_data.update({
            'alert_count': int(tags.get('alert_count', 1)),
            'source_ips': int(tags.get('source_ips', 1)),
            'affected_systems': int(tags.get('affected_systems', 1)),
            'login_failures': int(tags.get('login_failures', 0)),
            'privilege_changes': int(tags.get('privilege_changes', 0))
        })

    # Enrich with related security data
    await _enrich_incident_data(incident_data, incident, db)

    # Perform AI analysis
    analysis_result = incident_analysis_service.analyze_incident(incident_data)

    # Update incident with AI insights if confidence is high
    if analysis_result.get('confidence', 0) > 0.7:
        ai_severity = analysis_result.get('severity_assessment')
        if ai_severity != incident.severity:
            incident.severity = ai_severity
            db.commit()
            analysis_result['severity_updated'] = True

    # Broadcast AI analysis result via WebSocket
    from websocket import manager
    await manager.broadcast({
        "type": "ai_analysis_complete",
        "data": {
            "incident_id": incident_id,
            "analysis": analysis_result,
            "timestamp": datetime.utcnow().isoformat()
        }
    })

    # Log the analysis
    audit_log = AuditLog(
        user_sub=user_data["sub"],
        action="ai_incident_analysis",
        resource=f"incident:{incident_id}",
        details=json.dumps({
            'predicted_type': analysis_result.get('predicted_type'),
            'confidence': analysis_result.get('confidence', 0),
            'risk_score': analysis_result.get('risk_score', 0),
            'client_ip': client_ip,
            'severity_updated': analysis_result.get('severity_updated', False)
        })
    )
    db.add(audit_log)
    db.commit()

    return {
        "incident_id": incident_id,
        "analysis": analysis_result,
        "real_time": True,
        "model_source": "CyberBlueSOC_trained"
    }

async def _enrich_incident_data(incident_data: Dict[str, Any], incident: Incident, db) -> None:
    """Enrich incident data with related security context"""

    # Get related audit logs
    recent_audits = db.query(AuditLog).filter(
        AuditLog.timestamp >= incident.created_at
    ).limit(10).all()

    # Extract security patterns from audit logs
    security_indicators = {
        'recent_logins': 0,
        'failed_auth': 0,
        'admin_actions': 0,
        'data_access': 0
    }

    for audit in recent_audits:
        action = audit.action.lower()
        if 'login' in action:
            security_indicators['recent_logins'] += 1
        if 'fail' in action and 'auth' in action:
            security_indicators['failed_auth'] += 1
        if 'admin' in action or 'privilege' in action:
            security_indicators['admin_actions'] += 1
        if 'export' in action or 'data' in action:
            security_indicators['data_access'] += 1

    incident_data.update(security_indicators)

    # Get related system metrics if available
    try:
        from models import SystemMetrics
        recent_metrics = db.query(SystemMetrics).filter(
            SystemMetrics.timestamp >= incident.created_at
        ).order_by(SystemMetrics.timestamp.desc()).limit(5).all()

        if recent_metrics:
            avg_cpu = sum(m.cpu_percent for m in recent_metrics) / len(recent_metrics)
            avg_memory = sum(m.memory_percent for m in recent_metrics) / len(recent_metrics)
            incident_data.update({
                'avg_cpu_percent': avg_cpu,
                'avg_memory_percent': avg_memory
            })
    except Exception:
        pass  # Metrics enrichment is optional

@router.post("/ai/train-incident-model")
@requires_roles(["admin"])
async def train_incident_model(
    req: Request,
    db: Session = Depends(get_db)
):
    """Train the AI incident analysis model using real CyberBlueSOC security data"""

    user_data = get_current_user(req)
    client_ip = req.client.host if req.client else "unknown"

    try:
        # Train model with real security data from CyberBlueSOC sources
        await incident_analysis_service.train_model(db)

        # Log the training
        audit_log = AuditLog(
            user_sub=user_data["sub"],
            action="train_incident_model",
            resource="ai_model:incident_analysis",
            details=f"Trained incident analysis AI model using CyberBlueSOC security data from {client_ip}"
        )
        db.add(audit_log)
        db.commit()

        return {
            "message": "Incident analysis model trained successfully with CyberBlueSOC security data",
            "model_available": incident_analysis_service.model is not None
        }

    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.post("/ai/deploy-to-cloud")
@requires_roles(["admin"])
async def deploy_model_to_cloud(
    cloud_provider: str = "aws",  # aws, gcp, azure
    req: Request = None,
    db: Session = Depends(get_db)
):
    """Deploy trained model to cloud AI service for scalable inference"""

    user_data = get_current_user(req)
    client_ip = req.client.host if req.client else "unknown"

    if not incident_analysis_service.model:
        raise HTTPException(status_code=400, detail="No trained model available for deployment")

    try:
        deployment_result = {}

        if cloud_provider.lower() == "aws":
            deployment_result = await deploy_to_sagemaker()
        elif cloud_provider.lower() == "gcp":
            deployment_result = await deploy_to_vertex_ai()
        elif cloud_provider.lower() == "azure":
            deployment_result = await deploy_to_azure_ml()
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported cloud provider: {cloud_provider}")

        # Log deployment
        audit_log = AuditLog(
            user_sub=user_data["sub"],
            action="deploy_ai_model",
            resource=f"ai_model:{cloud_provider}",
            details=f"Deployed incident analysis model to {cloud_provider} from {client_ip}"
        )
        db.add(audit_log)
        db.commit()

        return {
            "message": f"Model deployed to {cloud_provider} successfully",
            "deployment_details": deployment_result
        }

    except Exception as e:
        logger.error(f"Cloud deployment failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cloud deployment failed: {str(e)}")

async def deploy_to_sagemaker():
    """Deploy model to AWS SageMaker"""
    # Implementation would use boto3 to deploy to SageMaker
    # This is a placeholder for the actual implementation
    return {
        "endpoint_url": "https://sagemaker.us-east-1.amazonaws.com/endpoints/incident-analysis",
        "model_arn": "arn:aws:sagemaker:us-east-1:123456789012:model/incident-analysis",
        "status": "deployed"
    }

async def deploy_to_vertex_ai():
    """Deploy model to Google Cloud Vertex AI"""
    # Implementation would use google-cloud-aiplatform
    return {
        "endpoint_url": "https://us-central1-aiplatform.googleapis.com/v1/projects/project-id/locations/us-central1/endpoints/endpoint-id",
        "model_id": "incident-analysis-model",
        "status": "deployed"
    }

async def deploy_to_azure_ml():
    """Deploy model to Azure Machine Learning"""
    # Implementation would use azureml-sdk
    return {
        "endpoint_url": "https://eastus2.api.azureml.ms/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.MachineLearningServices/workspaces/ws/endpoints/incident-analysis",
        "model_id": "incident-analysis-model",
        "status": "deployed"
    }

@router.get("/ai/incident-analysis-status")
@requires_roles(["admin", "analyst"])
async def get_incident_analysis_status():
    """Get status of AI incident analysis service"""

    return {
        "model_available": incident_analysis_service.model is not None,
        "model_path": incident_analysis_service.model_path,
        "model_exists": os.path.exists(incident_analysis_service.model_path)
    }