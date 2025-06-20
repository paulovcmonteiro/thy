import React from 'react';
import { CheckCircle } from 'lucide-react';

// Importando dados para cálculos dinâmicos
import { weeklyCompletionData } from '../../data/habitData.js';
import { calculateCompletionMetrics } from '../../data/calculations.js';

// Componentes
import CollapsibleSection from '../ui/CollapsibleSection.jsx';
import InsightsCard from '../ui/InsightsCard.jsx';

const WeekAnalysisSection = ({ isExpanded, onToggle }) => {
  // Cálculos para a análise da semana
  const completionMetrics = calculateCompletionMetrics(weeklyCompletionData);
  
  // Dados da última semana (08/06)
  const lastWeek = weeklyCompletionData[weeklyCompletionData.length - 1];
  const lastWeekCompletion = lastWeek.completude;
  
  // Diferença vs média geral
  const differenceFromAverage = (lastWeekCompletion - completionMetrics.avgGeneral).toFixed(1);
  
  // Encontrar melhor semana para comparação
  const bestWeek = weeklyCompletionData.reduce((best, current) => 
    current.completude > best.completude ? current : best
  );

  return (
    <CollapsibleSection
      title="4. Análise da Semana 08/06"
      icon={CheckCircle}
      iconColor="text-green-600"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="grid gap-6">
        
        {/* Card Principal de Destaque */}
        <InsightsCard 
          title="DESTAQUE: Semana 08/06 - Sua Melhor Performance!" 
          variant="green" 
          icon="🎯"
        >
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Números da Semana */}
            <div className="bg-green-100 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">📊 Números da Semana</h4>
              <div className="text-green-700 space-y-1 text-sm">
                <p>
                  <strong>Completude:</strong> {lastWeekCompletion}% - 
                  {lastWeekCompletion === bestWeek.completude ? 
                    ' Sua melhor semana de todos os tempos!' : 
                    ` Sua ${lastWeekCompletion >= 65 ? '2ª' : ''} melhor semana!`
                  }
                </p>
                <p><strong>Peso:</strong> 82.1kg - Voltou ao menor peso já registrado</p>
                <p><strong>Hábitos ativos:</strong> 7/7 - Primeira vez com 100% dos hábitos ativos!</p>
                <p><strong>Streak:</strong> 4ª semana consecutiva produtiva (desde 18/05)</p>
              </div>
            </div>
            
            {/* Comparação com Histórico */}
            <div className="bg-blue-100 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">📈 Comparação com Histórico</h4>
              <div className="text-blue-700 space-y-1 text-sm">
                <p>
                  <strong>Vs Média Geral:</strong> 
                  {differenceFromAverage > 0 ? `+${differenceFromAverage}` : differenceFromAverage} pontos 
                  {differenceFromAverage > 0 ? 'acima' : 'abaixo'} da média!
                </p>
                <p><strong>Vs Maio:</strong> Manteve o nível alto (maio: 52% média)</p>
                <p>
                  <strong>Ranking:</strong> 
                  {lastWeekCompletion === bestWeek.completude ? 
                    ' 1º lugar - recorde!' : 
                    ` 2º lugar (atrás apenas dos ${bestWeek.completude}% de ${bestWeek.semana})`
                  }
                </p>
                <p><strong>Tendência:</strong> 4 semanas em linha ascendente</p>
              </div>
            </div>
          </div>
        </InsightsCard>

        {/* Análise das Observações */}
        <InsightsCard title="Análise das Suas Observações" variant="yellow" icon="🔍">
          <div className="space-y-2 text-sm">
            <p>
              <strong>✅ Sucessos:</strong> Descoberta do sono (dormir antes 23h = semanas 60-70%), 
              hábitos naturais, evolução curso
            </p>
            <p>
              <strong>⚠️ Desafios:</strong> Tênis 22h sabota sono otimizado, stress quinta-feira, 
              temperatura sono
            </p>
            <p>
              <strong>🎯 Recomendações:</strong> Começar tênis 19h, ritual anti-stress quinta, 
              meta 80% alcançável!
            </p>
          </div>
        </InsightsCard>

        {/* Insights Adicionais */}
        <InsightsCard title="Insights da Evolução" variant="purple" icon="💡">
          <div className="space-y-2 text-sm">
            <p>
              <strong>🔍 Padrão identificado:</strong> Semanas com sono otimizado (dormir antes 23h) 
              consistentemente geram 60-70% de completude.
            </p>
            <p>
              <strong>📈 Progresso notável:</strong> De 0% em março para 70% em junho - 
              uma recuperação impressionante!
            </p>
            <p>
              <strong>🎯 Próximo objetivo:</strong> Com a fórmula do sono descoberta, 
              80% de completude está ao seu alcance nas próximas semanas.
            </p>
          </div>
        </InsightsCard>

      </div>
    </CollapsibleSection>
  );
};

export default WeekAnalysisSection;