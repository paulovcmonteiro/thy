import React from 'react';
import { Calendar } from 'lucide-react';

// Importando dados
import { habitDataByType, habitsList } from '../../data/habitData.js';
import { calculateHabitMetrics, getHabitClassification } from '../../data/calculations.js';

// Componentes
import CollapsibleSection from '../ui/CollapsibleSection.jsx';
import HabitChart from '../charts/HabitChart.jsx';

const HabitsSection = ({ isExpanded, onToggle }) => {
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

export default HabitsSection;