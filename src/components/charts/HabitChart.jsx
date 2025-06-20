import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CompactMetricsCard } from '../ui/MetricsCard.jsx';

const HabitChart = ({ habit, metrics, classification }) => {
  return (
    <div className={`border-l-4 ${habit.borderColor} pl-4`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-gray-700">
          {habit.name} (máx: {habit.maxDays} dias)
        </h3>
        
        <CompactMetricsCard metrics={metrics} classification={classification} />
      </div>
      
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={habit.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="semana" 
              fontSize={9} 
              angle={-45} 
              textAnchor="end" 
              height={50} 
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
            <Bar 
              dataKey="valor" 
              fill={habit.color} 
              radius={[2, 2, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HabitChart;