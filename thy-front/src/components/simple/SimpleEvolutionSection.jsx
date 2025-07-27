// src/components/simple/SimpleEvolutionSection.jsx - Seção de evolução para usuários simples
import React from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

const SimpleEvolutionSection = ({ habits }) => {


  if (!habits || habits.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Nenhum hábito encontrado</h3>
          <p className="text-sm">Crie hábitos primeiro para ver sua evolução</p>
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
            Evolução dos Hábitos
          </h2>
        </div>
        
        <p className="text-sm text-gray-600">
          Acompanhe o progresso de todos os seus hábitos
        </p>
      </div>

      {/* Estatísticas por hábito */}
      {habits.map(habit => (
        <div key={habit.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{habit.emoji}</span>
            <h3 className="text-lg font-semibold text-gray-800">{habit.name}</h3>
          </div>
          
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
                {habit.createdAt ? Math.ceil((Date.now() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <div className="text-sm text-gray-600">
                Dias desde criação
              </div>
            </div>
            
            <div className="text-center bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {habit.completedDays && habit.createdAt ? 
                  Math.round((habit.completedDays.length / Math.ceil((Date.now() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24))) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">
                Taxa de sucesso
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Resumo geral */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Resumo Geral
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {habits.length}
            </div>
            <div className="text-sm text-gray-600">
              Hábitos ativos
            </div>
          </div>
          
          <div className="text-center bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {habits.reduce((total, habit) => total + (habit.completedDays ? habit.completedDays.length : 0), 0)}
            </div>
            <div className="text-sm text-gray-600">
              Total de dias completados
            </div>
          </div>
          
          <div className="text-center bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {habits.length > 0 ? 
                Math.round(
                  habits.reduce((total, habit) => {
                    const daysSince = habit.createdAt ? Math.ceil((Date.now() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)) : 1;
                    const completedDays = habit.completedDays ? habit.completedDays.length : 0;
                    return total + (completedDays / daysSince * 100);
                  }, 0) / habits.length
                ) : 0}%
            </div>
            <div className="text-sm text-gray-600">
              Média de sucesso geral
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEvolutionSection;