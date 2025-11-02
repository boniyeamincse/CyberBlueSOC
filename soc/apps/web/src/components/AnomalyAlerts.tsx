import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

interface Anomaly {
  id: number;
  timestamp: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  description: string;
  details: string;
  source: string;
  acknowledged: boolean;
  acknowledged_by?: number;
  acknowledged_at?: string;
}

interface AnomalyAlertsProps {
  maxItems?: number;
}

export const AnomalyAlerts: React.FC<AnomalyAlertsProps> = ({ maxItems = 10 }) => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  // WebSocket connection for real-time updates
  useWebSocket((message) => {
    if (message.type === 'anomaly_detected') {
      // Refresh anomalies when new ones are detected
      fetchAnomalies();
    }
  });

  useEffect(() => {
    fetchAnomalies();
  }, [showAcknowledged]);

  const fetchAnomalies = async () => {
    try {
      const response = await fetch(`/api/ai/anomalies?acknowledged=${showAcknowledged}&limit=${maxItems}`);
      if (response.ok) {
        const data = await response.json();
        setAnomalies(data.anomalies || []);
      }
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAnomaly = async (anomalyId: number) => {
    try {
      const response = await fetch('/api/ai/anomalies/acknowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anomaly_ids: [anomalyId] }),
      });

      if (response.ok) {
        // Update local state
        setAnomalies(prev => prev.map(anomaly =>
          anomaly.id === anomalyId
            ? { ...anomaly, acknowledged: true, acknowledged_at: new Date().toISOString() }
            : anomaly
        ));
      }
    } catch (error) {
      console.error('Failed to acknowledge anomaly:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return <AlertTriangle className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            AI Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            AI Anomaly Detection
            {anomalies.filter(a => !a.acknowledged).length > 0 && (
              <Badge variant="destructive">
                {anomalies.filter(a => !a.acknowledged).length} Active
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAcknowledged(!showAcknowledged)}
          >
            {showAcknowledged ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAcknowledged ? 'Hide' : 'Show'} Acknowledged
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>No anomalies detected</p>
            {showAcknowledged && <p className="text-sm">Toggle to show acknowledged anomalies</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className={`p-3 border rounded-lg ${
                  anomaly.acknowledged ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${getSeverityColor(anomaly.severity)} text-white`}>
                        {getSeverityIcon(anomaly.severity)}
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{anomaly.type.replace('_', ' ')}</Badge>
                      {anomaly.acknowledged && (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1">{anomaly.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Source: {anomaly.source}</p>
                      <p>Score: {anomaly.score.toFixed(3)}</p>
                      <p>Time: {new Date(anomaly.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  {!anomaly.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeAnomaly(anomaly.id)}
                      className="ml-2"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Acknowledge
                    </Button>
                  )}
                </div>
                {anomaly.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      Show details
                    </summary>
                    <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-x-auto">
                      {JSON.stringify(JSON.parse(anomaly.details), null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {anomalies.length >= maxItems && (
          <div className="text-center mt-4">
            <Button variant="outline" size="sm" onClick={fetchAnomalies}>
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};