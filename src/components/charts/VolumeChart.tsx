'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface VolumeData {
  time: string;
  volume: number;
  kols: number;
  tokens: number;
}

interface VolumeChartProps {
  data: VolumeData[];
  selectedMetric: 'volume' | 'kols' | 'tokens';
}

export default function VolumeChart({ data, selectedMetric }: VolumeChartProps) {
  const formatValue = (value: number) => {
    if (selectedMetric === 'volume') {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return value.toLocaleString();
  };

  const getMetricColor = () => {
    switch (selectedMetric) {
      case 'volume': return '#3B82F6';
      case 'kols': return '#8B5CF6';
      case 'tokens': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          <p className="text-white font-medium">
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}: {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id={`color${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatValue}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={selectedMetric}
            stroke={getMetricColor()}
            strokeWidth={2}
            fill={`url(#color${selectedMetric})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
