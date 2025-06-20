import React from 'react';
import { TrendingUp } from 'lucide-react';

// Importando dados
import { weeklyCompletionData, weightData } from '../../data/habitData.js';
import { calculateCompletionMetrics, getWeightTrend } from '../../data/calculations.js';

// Componentes
import CollapsibleSection from '../ui/CollapsibleSection.jsx';
import CompletionChart from '../charts/CompletionChart.jsx';
import WeightChart from '../charts/WeightChart.jsx';

const EvolutionSection = ({ isExpanded, onToggle }) => {
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

export default EvolutionSection;