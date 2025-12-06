import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { ReviewData } from '../types';

interface SentimentChartProps {
  data: ReviewData[];
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ data }) => {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate moving average for smoother trend line
  const smoothData = sortedData.map((item, index, arr) => {
    const windowSize = 5;
    const start = Math.max(0, index - Math.floor(windowSize / 2));
    const end = Math.min(arr.length, index + Math.floor(windowSize / 2) + 1);
    const subset = arr.slice(start, end);
    const avg = subset.reduce((sum, curr) => sum + curr.sentiment, 0) / subset.length;
    return { ...item, smoothSentiment: Math.round(avg) };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900">Sentiment Trend</h3>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
            <span className="text-slate-500">Sentiment Score</span>
          </div>
          <div className="flex items-center">
             <span className="w-3 h-3 bg-indigo-200 rounded-full mr-2"></span>
             <span className="text-slate-500">Moving Avg</span>
          </div>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={smoothData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              stroke="#94a3b8"
              fontSize={12}
              tickMargin={10}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#1e293b', fontSize: '13px' }}
              labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
              formatter={(value: number) => [`${value}/100`, 'Score']}
              labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            />
            <Area 
              type="monotone" 
              dataKey="smoothSentiment" 
              stroke="none" 
              fillOpacity={1} 
              fill="url(#colorSentiment)" 
            />
            <Line 
              type="monotone" 
              dataKey="smoothSentiment" 
              stroke="#6366f1" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#4338ca' }}
            />
            <Line 
              type="monotone" 
              dataKey="sentiment" 
              stroke="#cbd5e1" 
              strokeWidth={1} 
              strokeDasharray="4 4" 
              dot={{ r: 2, fill: '#cbd5e1', strokeWidth: 0 }}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};