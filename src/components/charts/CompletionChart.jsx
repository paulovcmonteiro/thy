import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import MetricsCard from '../ui/MetricsCard.jsx';

const CompletionChart = ({ data, metrics }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="text-green-600" />
        Evolução da Completude
      </h3>
      
      <MetricsCard metrics={metrics} />
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="semana" 
              angle={-45} 
              textAnchor="end" 
              height={60} 
              fontSize={9} 
            />
            <YAxis 
              domain={[0, 100]} 
              tickFormatter={(value) => value + '%'} 
              fontSize={10} 
            />
            <Tooltip 
              formatter={(value) => [value + '%', 'Completude']}
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="completude" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }} 
              activeDot={{ r: 5, fill: '#1d4ed8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CompletionChart;