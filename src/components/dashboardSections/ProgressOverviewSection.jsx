import React from 'react';
import { TrendingUp } from 'lucide-react';

// Importando dados
import { calculateCompletionMetrics, getWeightTrend } from '../../data/metricsCalculations.js';

// Componentes
import CollapsibleSection from '../commonUI/CollapsibleSection.jsx';
import CompletionChart from '../visualizations/CompletionChart.jsx';
import WeightChart from '../visualizations/WeightChart.jsx';

const ProgressSection = ({ isExpanded, onToggle, weeklyCompletionData, weightData }) => {
  // Calculando métricas para esta seção
  const completionMetrics = calculateCompletionMetrics(weeklyCompletionData);
  const weightTrend = getWeightTrend(weightData);

  return (
    <CollapsibleSection
      title="1. Evolução Geral (Completude e Peso)"
      icon={TrendingUp}
      iconColor="text-green-600"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="grid md:grid-cols-2 gap-8">
        <CompletionChart 
          data={weeklyCompletionData} 
          metrics={completionMetrics} 
        />
        
        <WeightChart 
          data={weightData} 
          weightTrend={weightTrend} 
        />
      </div>
    </CollapsibleSection>
  );
};

export default ProgressSection;