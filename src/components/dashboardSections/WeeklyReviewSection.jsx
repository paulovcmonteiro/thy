// src/components/dashboardSections/WeeklyReviewSection.jsx - VERSÃO SEGURA
import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

const WeeklyReviewSection = ({ data, isExpanded, onToggle }) => {
  
  // VERIFICAÇÕES DE SEGURANÇA
  if (!data || !data.weeklyCompletionData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <Calendar className="w-8 h-8 mx-auto mb-2" />
          <p>Dados semanais não disponíveis</p>
        </div>
      </div>
    );
  }

  const { weeklyCompletionData } = data;

  if (!weeklyCompletionData || weeklyCompletionData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <Calendar className="w-8 h-8 mx-auto mb-2" />
          <p>Nenhuma semana registrada ainda</p>
        </div>
      </div>
    );
  }

  // Dados da última semana
  const lastWeek = weeklyCompletionData[weeklyCompletionData.length - 1];
  const previousWeek = weeklyCompletionData.length > 1 ? weeklyCompletionData[weeklyCompletionData.length - 2] : null;
  
  // Média geral (excluindo a última semana)
  const otherWeeks = weeklyCompletionData.slice(0, -1);
  const avgGeneral = otherWeeks.length > 0 
    ? otherWeeks.reduce((sum, week) => sum + (week.completude || 0), 0) / otherWeeks.length 
    : 0;

  // Comparação com semana anterior
  const weekComparison = previousWeek 
    ? (lastWeek.completude || 0) - (previousWeek.completude || 0)
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
            <Calendar className="text-[#4682B4]" />
            4. Análise da Última Semana
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {lastWeek.semana}
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
          <div className="grid gap-4">
            
            {/* Completude da última semana */}
            <div className="bg-blue-50 border-l-4 border-[#4682B4] p-4 rounded-r-lg">
              <h3 className="font-semibold text-[#4682B4] mb-2">
                📊 Completude da Semana ({lastWeek.semana})
              </h3>
              <p className="text-blue-600">
                <strong>{(lastWeek.completude || 0).toFixed(1)}%</strong> de completude na última semana.
                {avgGeneral > 0 && (
                  <>
                    {' '}Comparado com sua média geral de <strong>{avgGeneral.toFixed(1)}%</strong>,
                    {(lastWeek.completude || 0) > avgGeneral ? (
                      <span className="text-green-600"> está <strong>acima da média</strong> 📈</span>
                    ) : (
                      <span className="text-orange-600"> está <strong>abaixo da média</strong> 📉</span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Comparação com semana anterior */}
            {previousWeek && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-green-700 mb-2">
                  📈 Evolução Semanal
                </h3>
                <p className="text-green-600">
                  {weekComparison > 0 ? (
                    <>
                      <strong>Melhoria de {weekComparison.toFixed(1)} pontos</strong> comparado à semana anterior 
                      ({(previousWeek.completude || 0).toFixed(1)}% → {(lastWeek.completude || 0).toFixed(1)}%). 
                      Continue assim! 🎉
                    </>
                  ) : weekComparison < 0 ? (
                    <>
                      <strong>Queda de {Math.abs(weekComparison).toFixed(1)} pontos</strong> comparado à semana anterior 
                      ({(previousWeek.completude || 0).toFixed(1)}% → {(lastWeek.completude || 0).toFixed(1)}%). 
                      Não desanime, semana que vem pode ser melhor! 💪
                    </>
                  ) : (
                    <>
                      <strong>Manteve o mesmo nível</strong> da semana anterior 
                      ({(lastWeek.completude || 0).toFixed(1)}%). Consistência é importante! ⚖️
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Recomendações */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-yellow-700 mb-2">
                💡 Recomendações
              </h3>
              <div className="text-yellow-600 space-y-1">
                {(lastWeek.completude || 0) >= 70 ? (
                  <p>Excelente semana! Continue mantendo essa disciplina e consistência. 🌟</p>
                ) : (lastWeek.completude || 0) >= 50 ? (
                  <p>Boa semana! Tente focar nos hábitos que ficaram mais baixos para a próxima. 📚</p>
                ) : (lastWeek.completude || 0) >= 30 ? (
                  <p>Semana desafiadora. Escolha 1-2 hábitos prioritários para focar mais. 🎯</p>
                ) : (
                  <p>Semana difícil. Comece pequeno: escolha apenas 1 hábito para focar esta semana. 🌱</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyReviewSection;