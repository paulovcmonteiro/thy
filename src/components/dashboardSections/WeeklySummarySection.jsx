// src/components/dashboardSections/WeeklySummarySection.jsx - VERSÃO SEGURA
import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

const WeeklySummarySection = ({ data, isExpanded, onToggle }) => {
  
  // VERIFICAÇÕES DE SEGURANÇA
  if (!data || !data.weeklyCompletionData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <p>Dados de resumo não disponíveis</p>
        </div>
      </div>
    );
  }

  const { weeklyCompletionData, weightData = [] } = data;

  if (!weeklyCompletionData || weeklyCompletionData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <p>Nenhum dado para resumir ainda</p>
        </div>
      </div>
    );
  }

  // Cálculos de resumo
  const totalWeeks = weeklyCompletionData.length;
  const lastWeek = weeklyCompletionData[weeklyCompletionData.length - 1];
  
  // Média geral
  const avgCompletion = weeklyCompletionData.reduce((sum, week) => sum + (week.completude || 0), 0) / totalWeeks;
  
  // Semanas ativas
  const activeWeeks = weeklyCompletionData.filter(week => (week.completude || 0) > 0);
  const percentActive = (activeWeeks.length / totalWeeks) * 100;
  const avgActive = activeWeeks.length > 0 
    ? activeWeeks.reduce((sum, week) => sum + (week.completude || 0), 0) / activeWeeks.length 
    : 0;

  // Melhor semana
  const bestWeek = weeklyCompletionData.reduce((best, current) => 
    (current.completude || 0) > (best.completude || 0) ? current : best
  );

  // Tendência das últimas 5 semanas
  const recentWeeks = weeklyCompletionData.slice(-5);
  const recentAvg = recentWeeks.length > 0 
    ? recentWeeks.reduce((sum, week) => sum + (week.completude || 0), 0) / recentWeeks.length 
    : 0;

  // Tendência de peso
  const hasWeightData = weightData && weightData.length >= 2;
  const weightTrend = hasWeightData 
    ? (weightData[weightData.length - 1].peso || 0) - (weightData[0].peso || 0)
    : 0;

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
            <BarChart3 className="text-green-600" />
            5. Resumo Geral
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {totalWeeks} semanas
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
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Métricas Principais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">📊 Métricas Principais</h3>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-[#4682B4] text-sm">Média Geral</div>
                <div className="text-[#4682B4] text-xl font-bold">{avgCompletion.toFixed(1)}%</div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-600 text-sm">% Semanas Ativas</div>
                <div className="text-green-800 text-xl font-bold">{percentActive.toFixed(1)}%</div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-purple-600 text-sm">Média quando Ativo</div>
                <div className="text-purple-800 text-xl font-bold">{avgActive.toFixed(1)}%</div>
              </div>

              {hasWeightData && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-orange-600 text-sm">Evolução do Peso</div>
                  <div className="text-orange-800 text-xl font-bold">
                    {weightTrend > 0 ? '+' : ''}{weightTrend.toFixed(1)}kg
                  </div>
                </div>
              )}
            </div>

            {/* Destaques */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">🌟 Destaques</h3>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3">
                <div className="text-yellow-700 font-semibold">Melhor Semana</div>
                <div className="text-yellow-600">
                  {bestWeek.semana}: {(bestWeek.completude || 0).toFixed(1)}% 🏆
                </div>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-3">
                <div className="text-green-700 font-semibold">Última Semana</div>
                <div className="text-green-600">
                  {lastWeek.semana}: {(lastWeek.completude || 0).toFixed(1)}%
                  {(lastWeek.completude || 0) >= avgCompletion ? ' 📈' : ' 📉'}
                </div>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-[#4682B4] p-3">
                <div className="text-[#4682B4] font-semibold">Tendência Recente</div>
                <div className="text-blue-600">
                  Últimas 5 semanas: {recentAvg.toFixed(1)}%
                  {recentAvg >= avgCompletion ? ' ⬆️' : ' ⬇️'}
                </div>
              </div>

              {/* Motivação */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-3">
                <div className="text-purple-700 font-semibold">💪 Motivação</div>
                <div className="text-purple-600 text-sm">
                  {avgCompletion >= 60 ? 
                    'Você está indo muito bem! Continue assim!' :
                    avgCompletion >= 40 ?
                    'Bom progresso! Pequenos ajustes farão diferença.' :
                    'Cada pequeno passo conta. Foque no progresso, não na perfeição!'
                  }
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklySummarySection;