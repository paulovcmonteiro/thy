import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target } from 'lucide-react';

const WeightChart = ({ data, weightTrend }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="text-orange-600" />
        Evolução do Peso
      </h3>
      
      <div className="mb-4 text-center text-sm">
        <div className="bg-orange-50 p-2 rounded">
          <div className="font-semibold text-orange-700">Redução Total</div>
          <div className="text-lg text-orange-600">{Math.abs(weightTrend.trend)}kg</div>
          <div className="text-xs text-orange-500">
            {weightTrend.firstWeight}kg → {weightTrend.lastWeight}kg
          </div>
        </div>
      </div>
      
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
              domain={[80, 90]} 
              tickFormatter={(value) => value + 'kg'} 
              fontSize={10} 
            />
            <Tooltip 
              formatter={(value) => [value + 'kg', 'Peso']}
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="peso" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }} 
              activeDot={{ r: 5, fill: '#d97706' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeightChart;