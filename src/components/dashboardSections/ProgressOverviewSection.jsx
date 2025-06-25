// src/components/dashboardSections/ProgressOverviewSection.jsx - CORRIGIDA SEM DEPENDÊNCIAS
import React from 'react';
import { TrendingUp, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProgressOverviewSection = ({ data, isExpanded, onToggle }) => {
  
  // VERIFICAÇÕES DE SEGURANÇA
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
          <p>Dados não disponíveis</p>
        </div>
      </div>
    );
  }

  const { weeklyCompletionData = [], weightData = [] } = data;

  // Calcular métricas de completude
  const calculateCompletionMetrics = () => {
    if (!weeklyCompletionData || weeklyCompletionData.length === 0) {
      return {
        avgGeral: 0,
        percentActive: 0,
        avgActive: 0
      };
    }

    const total = weeklyCompletionData.length;
    const totalValue = weeklyCompletionData.reduce((sum, week) => sum + (week.completude || 0), 0);
    const avgGeral = total > 0 ? totalValue / total : 0;

    const activeWeeks = weeklyCompletionData.filter(week => (week.completude || 0) > 0);
    const percentActive = total > 0 ? (activeWeeks.length / total) * 100 : 0;
    
    const activeTotal = activeWeeks.reduce((sum, week) => sum + (week.completude || 0), 0);
    const avgActive = activeWeeks.length > 0 ? activeTotal / activeWeeks.length : 0;

    return {
      avgGeral: Number(avgGeral.toFixed(1)),
      percentActive: Number(percentActive.toFixed(1)),
      avgActive: Number(avgActive.toFixed(1))
    };
  };

  // Calcular tendência de peso
  const calculateWeightTrend = () => {
    if (!weightData || weightData.length < 2) {
      return {
        trend: 0,
        firstWeight: 0,
        lastWeight: 0,
        hasData: false
      };
    }

    const firstWeight = weightData[0].peso || 0;
    const lastWeight = weightData[weightData.length - 1].peso || 0;
    const trend = lastWeight - firstWeight;

    return {
      trend: Number(trend.toFixed(1)),
      firstWeight: Number(firstWeight.toFixed(1)),
      lastWeight: Number(lastWeight.toFixed(1)),
      hasData: true
    };
  };

  const completionMetrics = calculateCompletionMetrics();
  const weightTrend = calculateWeightTrend();

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
            <TrendingUp className="text-green-600" />
            1. Evolução Geral (Completude e Peso)
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {weeklyCompletionData.length} semanas
            </span>
            <TrendingUp 
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
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* GRÁFICO DE COMPLETUDE */}
            <div className="bg-white">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-600" />
                📈 Evolução da Completude
              </h3>
              
              {/* Métricas */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#4682B4]">{completionMetrics.avgGeral}%</div>
                  <div className="text-sm text-gray-600">Média Geral</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completionMetrics.percentActive}%</div>
                  <div className="text-sm text-gray-600">% Semanas Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{completionMetrics.avgActive}%</div>
                  <div className="text-sm text-gray-600">Média Ativas</div>
                </div>
              </div>

              {/* Gráfico */}
              {weeklyCompletionData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyCompletionData}>
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
                        tickFormatter={(value) => `${value}%`}
                        fontSize={10}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Completude']}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{ 
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completude" 
                        stroke="#4682B4" 
                        strokeWidth={2}
                        dot={{ fill: '#4682B4', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, fill: '#3a6d99' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>Nenhum dado de completude disponível</p>
                </div>
              )}
            </div>

            {/* GRÁFICO DE PESO */}
            <div className="bg-white">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="text-orange-600" />
                ⚖️ Evolução do Peso
              </h3>
              
              {/* Métricas de Peso */}
              {weightTrend.hasData ? (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {weightTrend.trend > 0 ? '+' : ''}{weightTrend.trend}kg
                    </div>
                    <div className="text-sm text-gray-600">Variação Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{weightTrend.firstWeight}kg</div>
                    <div className="text-sm text-gray-600">Peso Inicial</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{weightTrend.lastWeight}kg</div>
                    <div className="text-sm text-gray-600">Peso Atual</div>
                  </div>
                </div>
              ) : (
                <div className="text-center mb-6 text-gray-500">
                  <p>Adicione dados de peso para ver a evolução</p>
                </div>
              )}

              {/* Gráfico de Peso */}
              {weightData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="semana" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        fontSize={9}
                      />
                      <YAxis 
                        domain={['dataMin - 2', 'dataMax + 2']}
                        tickFormatter={(value) => `${value}kg`}
                        fontSize={10}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}kg`, 'Peso']}
                        labelStyle={{ color: '#374151' }}
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
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>Nenhum dado de peso disponível</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressOverviewSection