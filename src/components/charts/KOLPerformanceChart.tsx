'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface KOLData {
  name: string;
  winRate: number;
  pnl: number;
  trades: number;
}

interface KOLPerformanceChartProps {
  data: KOLData[];
}

export default function KOLPerformanceChart({ data }: KOLPerformanceChartProps) {
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: KOLData }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-green-400 text-sm">Win Rate: {data.winRate}%</p>
            <p className="text-blue-400 text-sm">PNL: +{data.pnl}%</p>
            <p className="text-gray-300 text-sm">Trades: {data.trades}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (value: number) => {
    if (value >= 80) return '#10B981'; // Green
    if (value >= 60) return '#3B82F6'; // Blue
    if (value >= 40) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.winRate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
