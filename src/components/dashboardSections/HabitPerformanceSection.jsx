import React from 'react';
import { Calendar } from 'lucide-react';

// Importando dados
import { calculateHabitMetrics, getHabitClassification } from '../../data/metricsCalculations.js';

// Componentes
import CollapsibleSection from '../commonUI/CollapsibleSection.jsx';
import HabitChart from '../visualizations/HabitChart.jsx';

const HabitPerformanceSection = ({ isExpanded, onToggle, habitDataByType, habitsList }) => {
  return (
    <CollapsibleSection
      title="2. Performance por Hábito Individual"
      icon={Calendar}
      iconColor="text-purple-600"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="grid gap-6">
        {habitsList.map((habitKey) => {
          const habit = habitDataByType[habitKey];
          const metrics = calculateHabitMetrics(habit.data);
          const classification = getHabitClassification(metrics.avgGeneral);
          
          return (
            <HabitChart
              key={habitKey}
              habit={habit}
              metrics={metrics}
              classification={classification}
            />
          );
        })}
      </div>
    </CollapsibleSection>
  );
};

export default HabitPerformanceSection;