// src/components/dashboardSections/HabitInsightsSection.jsx - VERSÃO SEGURA
import React from 'react';
import { Lightbulb, TrendingUp } from 'lucide-react';

const HabitInsightsSection = ({ data, isExpanded, onToggle }) => {
  
  // VERIFICAÇÕES DE SEGURANÇA
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <Lightbulb className="w-8 h-8 mx-auto mb-2" />
          <p>Dados não disponíveis para insights</p>
        </div>
      </div>
    );
  }

  const { 
    weeklyCompletionData = [], 
    weightData = [], 
    habitDataByType = {}, 
    habitsList = [] 
  } = data;

  // Função para calcular métricas de completude geral
  const calculateCompletionMetrics = () => {
    if (!weeklyCompletionData || weeklyCompletionData.length === 0) {
      return {
        avgGeneral: 0,
        percentActive: 0,
        avgActive: 0
      };
    }

    const total = weeklyCompletionData.length;
    const totalValue = weeklyCompletionData.reduce((sum, week) => sum + (week.completude || 0), 0);
    const avgGeneral = total > 0 ? totalValue / total : 0;

    const activeWeeks = weeklyCompletionData.filter(week => (week.completude || 0) > 0);
    const percentActive = total > 0 ? (activeWeeks.length / total) * 100 : 0;
    
    const activeTotal = activeWeeks.reduce((sum, week) => sum + (week.completude || 0), 0);
    const avgActive = activeWeeks.length > 0 ? activeTotal / activeWeeks.length : 0;

    return {
      avgGeneral: Number(avgGeneral.toFixed(1)),
      percentActive: Number(percentActive.toFixed(1)),
      avgActive: Number(avgActive.toFixed(1))
    };
  };

  // Função para calcular tendência de peso
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

  // Função para calcular métricas de hábito
  const calculateHabitMetrics = (habitData) => {
    if (!habitData || !habitData.length) {
      return {
        avgGeral: 0,
        percentActive: 0,
        avgActive: 0,
        classification: 'Sem dados 📊'
      };
    }

    const total = habitData.length;
    const totalValue = habitData.reduce((sum, week) => sum + (week.valor || 0), 0);
    const avgGeral = total > 0 ? totalValue / total : 0;

    const activeWeeks = habitData.filter(week => (week.valor || 0) > 0);
    const percentActive = total > 0 ? (activeWeeks.length / total) * 100 : 0;
    
    const activeTotal = activeWeeks.reduce((sum, week) => sum + (week.valor || 0), 0);
    const avgActive = activeWeeks.length > 0 ? activeTotal / activeWeeks.length : 0;

    // Classificação
    let classification = 'Ruim 😞';
    if (avgGeral >= 60) classification = 'Excelente 🤩';
    else if (avgGeral >= 50) classification = 'Bom 😊';
    else if (avgGeral >= 40) classification = 'Legal 🙂';
    else if (avgGeral >= 20) classification = 'Ok 😐';

    return {
      avgGeral: Number(avgGeral.toFixed(1)),
      percentActive: Number(percentActive.toFixed(1)),
      avgActive: Number(avgActive.toFixed(1)),
      classification
    };
  };

  // Calcular métricas
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
            <Lightbulb className="text-yellow-600" />
            3. Insights Principais
          </h2>
          <TrendingUp 
            className={`w-5 h-5 text-gray-400 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {/* Conteúdo colapsível */}
      {isExpanded && (
        <div className="p-6">
          <div className="grid gap-4">
            
            {/* Insight de Desempenho Geral */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                📊 Desempenho Geral
              </h3>
              <p className="text-blue-600">
                {weeklyCompletionData.length > 0 ? (
                  <>
                    Sua média geral de completude é <strong>{completionMetrics.avgGeneral}%</strong>. 
                    Você tem <strong>{completionMetrics.percentActive}% de semanas ativas</strong> e quando ativo, 
                    atinge <strong>{completionMetrics.avgActive}%</strong> de completude.
                  </>
                ) : (
                  'Adicione mais dados para ver insights de desempenho geral.'
                )}
              </p>
            </div>

            {/* Insight de Evolução do Peso */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                ⚖️ Evolução do Peso
              </h3>
              <p className="text-orange-600">
                {weightTrend.hasData ? (
                  weightTrend.trend < 0 ? (
                    <>
                      <strong>Progresso consistente!</strong> Redução de <strong>{Math.abs(weightTrend.trend)}kg</strong> 
                      ({weightTrend.firstWeight}kg → {weightTrend.lastWeight}kg). 
                      Tendência de redução constante e saudável!
                    </>
                  ) : weightTrend.trend > 0 ? (
                    <>
                      Aumento de <strong>{weightTrend.trend}kg</strong> 
                      ({weightTrend.firstWeight}kg → {weightTrend.lastWeight}kg). 
                      Continue monitorando e ajuste conforme necessário.
                    </>
                  ) : (
                    <>
                      Peso estável em <strong>{weightTrend.lastWeight}kg</strong>. 
                      Ótima manutenção!
                    </>
                  )
                ) : (
                  'Adicione dados de peso para ver a evolução ao longo do tempo.'
                )}
              </p>
            </div>

            {/* Insight de Destaques por Hábito */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                🎯 Destaques por Hábito
              </h3>
              <div className="text-green-600 space-y-1">
                {habitsList && habitsList.length > 0 ? (
                  habitsList.map((habitKey) => {
                    const habitInfo = habitDataByType[habitKey];
                    if (!habitInfo || !habitInfo.data) {
                      return (
                        <p key={habitKey} className="text-sm">
                          <strong className="capitalize">{habitKey}:</strong> Sem dados disponíveis
                        </p>
                      );
                    }

                    const metrics = calculateHabitMetrics(habitInfo.data);
                    
                    return (
                      <p key={habitKey} className="text-sm">
                        <strong>{metrics.classification.split(' ')[1]} {habitInfo.habit || habitKey}:</strong> {' '}
                        {metrics.avgGeral}% geral | {metrics.percentActive}% ativas | {metrics.avgActive}% quando engajado
                      </p>
                    );
                  })
                ) : (
                  <p>Adicione dados de hábitos para ver análises detalhadas.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default HabitInsightsSection;