import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface MetricsChartProps {
  metricType: string;
  title: string;
  data: Array<{ timestamp: number; value: number }>;
  color: string;
  height?: number;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  metricType,
  title,
  data,
  color,
  height = 300
}) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Transform data for Recharts
    const transformed = data.map(point => ({
      time: new Date(point.timestamp * 1000).toLocaleTimeString(),
      value: point.value,
      timestamp: point.timestamp
    }));
    setChartData(transformed);
  }, [data]);

  const formatTooltipValue = (value: number, name: string) => {
    if (metricType === 'cpu' || metricType === 'memory') {
      return [`${value.toFixed(1)}%`, name];
    }
    if (metricType === 'active_agents') {
      return [`${value}`, 'Active Agents'];
    }
    return [value, name];
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`gradient-${metricType}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#F9FAFB'
            }}
            formatter={formatTooltipValue}
            labelStyle={{ color: '#F9FAFB' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fillOpacity={1}
            fill={`url(#gradient-${metricType})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};