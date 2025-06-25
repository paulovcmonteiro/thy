// src/components/dashboardSections/HabitPerformanceSection.jsx - VERSÃO SEGURA
import React from 'react';
import { Calendar, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HabitPerformanceSection = ({ data, isExpanded, onToggle }) => {
  
  // VERIFICAÇÕES DE SEGURANÇA
  if (!data || !data.habitDataByType || !data.habitsList) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <Calendar className="w-8 h-8 mx-auto mb-2" />
          <p>Dados de hábitos não disponíveis</p>
        </div>
      </div>
    );
  }

  const { habitDataByType, habitsList } = data;

  // Verificar se há dados válidos
  if (!habitsList || habitsList.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <Calendar className="w-8 h-8 mx-auto mb-2" />
          <p>Nenhum hábito encontrado</p>
        </div>
      </div>
    );
  }

  // Função para calcular métricas de um hábito
  const calculateHabitMetrics = (habitData) => {
    if (!habitData || !habitData.length) {
      return {
        avgGeral: 0,
        percentAtivas: 0,
        avgAtivas: 0,
        classification: 'Sem dados 📊'
      };
    }

    const total = habitData.length;
    const totalValue = habitData.reduce((sum, week) => sum + (week.valor || 0), 0);
    const avgGeral = total > 0 ? totalValue / total : 0;

    const activeWeeks = habitData.filter(week => (week.valor || 0) > 0);
    const percentAtivas = total > 0 ? (activeWeeks.length / total) * 100 : 0;
    
    const activeTotal = activeWeeks.reduce((sum, week) => sum + (week.valor || 0), 0);
    const avgAtivas = activeWeeks.length > 0 ? activeTotal / activeWeeks.length : 0;

    // Classificação baseada na média geral
    let classification = 'Ruim 😞';
    if (avgGeral >= 60) classification = 'Excelente 🤩';
    else if (avgGeral >= 50) classification = 'Bom 😊';
    else if (avgGeral >= 40) classification = 'Legal 🙂';
    else if (avgGeral >= 20) classification = 'Ok 😐';

    return {
      avgGeral: Number(avgGeral.toFixed(1)),
      percentAtivas: Number(percentAtivas.toFixed(1)),
      avgAtivas: Number(avgAtivas.toFixed(1)),
      classification
    };
  };

  // Seção colapsível
  const toggleSection = () => {
    if (onToggle) onToggle();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg mb-8">
      {/* Header clicável */}
      <div 
        className="p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleSection}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="text-purple-600" />
            2. Performance por Hábito Individual
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {habitsList.length} hábitos
            </span>
            <BarChart3 
              className={`w-5 h-5 text-gray-400 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </div>
      </div>

      {/* Conteúdo colapsível */}
      {isExpanded && (
        <div className="p-6">
          <div className="grid gap-6">
            {habitsList.map((habitKey, index) => {
              const habitInfo = habitDataByType[habitKey];
              
              // Verificações de segurança para cada hábito
              if (!habitInfo || !habitInfo.data) {
                return (
                  <div key={habitKey} className="border-l-4 border-gray-300 pl-4">
                    <h3 className="text-lg font-medium text-gray-500 capitalize">
                      {habitKey} - Sem dados
                    </h3>
                  </div>
                );
              }

              const metrics = calculateHabitMetrics(habitInfo.data);
              const colors = ['#4682B4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
              const color = colors[index % colors.length];
              
              return (
                <div key={habitKey} className="border-l-4 border-gray-300 pl-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-700 capitalize">
                      {habitInfo.habit || habitKey}
                    </h3>
                    <div className="text-right">
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <div className="text-gray-600">
                          <span className="font-semibold">Média Geral:</span> {metrics.avgGeral}%
                        </div>
                        <div className="text-green-600">
                          <span className="font-semibold">% Ativas:</span> {metrics.percentAtivas}%
                        </div>
                        <div className="text-blue-600">
                          <span className="font-semibold">Média Ativas:</span> {metrics.avgAtivas}%
                        </div>
                        <div className="text-gray-500 mt-1">
                          {metrics.classification}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Gráfico do hábito */}
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={habitInfo.data}>
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
                          tickFormatter={(value) => `${value}%`}
                          fontSize={10}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Completude']}
                          contentStyle={{ 
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar 
                          dataKey="valor" 
                          fill={color}
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitPerformanceSection;