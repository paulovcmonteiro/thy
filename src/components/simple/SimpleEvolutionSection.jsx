// src/components/simple/SimpleEvolutionSection.jsx - Seção de evolução para usuários simples
import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

const SimpleEvolutionSection = ({ habit }) => {
  const [weeklyProgress, setWeeklyProgress] = useState([]);

  // Função para calcular progresso semanal
  const calculateWeeklyProgress = () => {
    if (!habit || !habit.completedDays) return [];

    // Simulação de dados semanais - em produção, viria do Firebase
    const weeks = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // Conta quantos dias da semana foram completados
      let completedDays = 0;
      let totalDays = 0;
      
      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        if (d <= today) {
          totalDays++;
          const dateStr = d.toISOString().split('T')[0];
          if (habit.completedDays.includes(dateStr)) {
            completedDays++;
          }
        }
      }
      
      if (totalDays > 0) {
        const percentage = Math.round((completedDays / totalDays) * 100);
        weeks.push({
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          completedDays,
          totalDays,
          percentage,
          label: i === 0 ? 'Esta semana' : `${i} semana${i > 1 ? 's' : ''} atrás`
        });
      }
    }
    
    return weeks.reverse();
  };

  useEffect(() => {
    if (habit) {
      const progress = calculateWeeklyProgress();
      setWeeklyProgress(progress);
    }
  }, [habit]);

  // Função para obter cor baseada na porcentagem
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Função para obter cor do texto
  const getTextColor = (percentage) => {
    if (percentage >= 80) return 'text-green-700';
    if (percentage >= 60) return 'text-yellow-700';
    if (percentage >= 40) return 'text-orange-700';
    return 'text-red-700';
  };

  if (!habit) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Nenhum hábito encontrado</h3>
          <p className="text-sm">Crie um hábito primeiro para ver sua evolução</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Evolução: {habit.name}
          </h2>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-2xl">{habit.emoji}</span>
          <p className="text-sm">
            Acompanhe seu progresso ao longo das semanas
          </p>
        </div>
      </div>

      {/* Progresso semanal */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Progresso por Semana
        </h3>
        
        {weeklyProgress.length > 0 ? (
          <div className="space-y-4">
            {weeklyProgress.map((week, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {week.label}
                  </span>
                  <span className={`text-sm font-bold ${getTextColor(week.percentage)}`}>
                    {week.percentage}%
                  </span>
                </div>
                
                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(week.percentage)}`}
                    style={{ width: `${week.percentage}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-500">
                  {week.completedDays} de {week.totalDays} dias completados
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Ainda não há dados suficientes para mostrar a evolução.</p>
            <p className="text-sm mt-1">Continue marcando seus dias!</p>
          </div>
        )}
      </div>

      {/* Estatísticas gerais */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Estatísticas Gerais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {habit.completedDays ? habit.completedDays.length : 0}
            </div>
            <div className="text-sm text-gray-600">
              Dias completados
            </div>
          </div>
          
          <div className="text-center bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {weeklyProgress.length > 0 ? 
                Math.round(weeklyProgress.reduce((acc, week) => acc + week.percentage, 0) / weeklyProgress.length) 
                : 0}%
            </div>
            <div className="text-sm text-gray-600">
              Média semanal
            </div>
          </div>
          
          <div className="text-center bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {weeklyProgress.length}
            </div>
            <div className="text-sm text-gray-600">
              Semanas monitoradas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEvolutionSection;