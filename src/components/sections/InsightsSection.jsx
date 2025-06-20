import React from 'react';
import { Lightbulb } from 'lucide-react';

// Importando dados
import { weeklyCompletionData, weightData, habitDataByType, habitsList } from '../../data/habitData.js';
import { 
  calculateCompletionMetrics, 
  calculateHabitMetrics, 
  getHabitClassification, 
  getWeightTrend 
} from '../../data/calculations.js';

// Componentes
import CollapsibleSection from '../ui/CollapsibleSection.jsx';
import InsightsCard from '../ui/InsightsCard.jsx';

const InsightsSection = ({ isExpanded, onToggle }) => {
  // Calculando métricas para os insights
  const completionMetrics = calculateCompletionMetrics(weeklyCompletionData);
  const weightTrend = getWeightTrend(weightData);

  return (
    <CollapsibleSection
      title="3. Insights Principais"
      icon={Lightbulb}
      iconColor="text-yellow-600"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="grid gap-4">
        
        {/* Insight de Desempenho Geral */}
        <InsightsCard title="Desempenho Geral" variant="blue" icon="📊">
          <p>
            Sua média geral de completude é <strong>{completionMetrics.avgGeneral}%</strong>. 
            Você tem <strong>{completionMetrics.percentActive}% de semanas ativas</strong> e quando ativo, 
            atinge <strong>{completionMetrics.avgActive}%</strong> de completude.
          </p>
        </InsightsCard>

        {/* Insight de Evolução do Peso */}
        <InsightsCard title="Evolução do Peso" variant="orange" icon="⚖️">
          <p>
            <strong>Progresso consistente!</strong> Redução de <strong>{Math.abs(weightTrend.trend)}kg</strong> 
            ({weightTrend.firstWeight}kg → {weightTrend.lastWeight}kg). 
            Tendência de redução constante e saudável!
          </p>
        </InsightsCard>

        {/* Insight de Destaques por Hábito */}
        <InsightsCard title="Destaques por Hábito" variant="green" icon="🎯">
          <div className="space-y-1">
            {habitsList.map((habitKey) => {
              const habit = habitDataByType[habitKey];
              const metrics = calculateHabitMetrics(habit.data);
              const classification = getHabitClassification(metrics.avgGeneral);
              
              return (
                <p key={habitKey}>
                  <strong>{classification.emoji} {habit.name}:</strong> {metrics.avgGeneral}% geral | {metrics.percentActive}% ativas | {metrics.avgActive}% quando engajado
                </p>
              );
            })}
          </div>
        </InsightsCard>

      </div>
    </CollapsibleSection>
  );
};

export default InsightsSection;