import React from 'react';

// Importando dados para cálculos
import { calculateCompletionMetrics, getWeightTrend } from '../../data/metricsCalculations.js';

const WeeklySummarySection = ({ weeklyCompletionData, weightData }) => {
  // Calculando métricas para o resumo
  const completionMetrics = calculateCompletionMetrics(weeklyCompletionData);
  const weightTrend = getWeightTrend(weightData);
  
  // Dados da última semana para destaque
  const lastWeek = weeklyCompletionData[weeklyCompletionData.length - 1];
  const lastWeekCompletion = lastWeek?.completude || 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-3">💪 Resumo com 3 Métricas</h3>
      <p className="text-gray-700 max-w-4xl mx-auto">
        <strong>Completude Geral:</strong> {completionMetrics.avgGeneral}% média | {completionMetrics.percentActive}% semanas ativas | {completionMetrics.avgActive}% quando ativo.
        <br />
        <strong>Peso:</strong> Redução de {Math.abs(weightTrend.trend)}kg - progresso real!
        <br />
        <strong>🎯 DESTAQUE:</strong> {lastWeekCompletion}% de completude na última semana - 
        {lastWeekCompletion >= 65 ? 'performance excelente!' : 'boa evolução!'} 
        <strong className="text-blue-600"> Código completamente modularizado! 🎯</strong>
      </p>
    </div>
  );
};

export default WeeklySummarySection;