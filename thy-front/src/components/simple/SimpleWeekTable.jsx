// src/components/simple/SimpleWeekTable.jsx - Tabela de semana para SimpleDashboard
import React from 'react';
import { Calendar } from 'lucide-react';

const SimpleWeekTable = ({ 
  habit,                   // Hábito único do SimpleDashboard
  weekDates = [],          // Array de datas da semana
  title = "Semana",        // Título da tabela
  loading = false,         // Estado de carregamento
  showTitle = true,        // Mostrar título ou não
  isEditable = false,      // Se os dias são editáveis
  onDayClick = null        // Função chamada ao clicar num dia
}) => {

  // Estado de loading
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando {title.toLowerCase()}...</span>
        </div>
      </div>
    );
  }

  // Sem hábito ou sem dados da semana
  if (!habit || weekDates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 overflow-hidden">
        {showTitle && (
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
        )}
        <div className="text-center text-gray-500 p-6">
          <Calendar className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Nenhum dado disponível para esta semana</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 overflow-hidden">
      
      {/* Título opcional */}
      {showTitle && (
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}

      {/* Tabela */}
      <div className="p-3 sm:p-6 overflow-x-auto">
        <div className="min-w-0 w-full">
          <table className="w-full table-auto">
            
            {/* Cabeçalho com dias da semana */}
            <thead>
              <tr>
                <th className="w-24 sm:w-32 text-left py-3 px-2 sm:py-4 sm:px-3">
                  {/* Cabeçalho para o hábito */}
                </th>
                {weekDates.map(day => (
                  <th key={day.date} className="w-14 sm:w-18 text-center py-3 px-1">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-600">{day.dayName}</span>
                      <span className={`text-lg font-bold ${day.isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {day.dayNumber}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Linha do hábito único */}
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-2 sm:py-4 sm:px-3 font-medium text-gray-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl sm:text-3xl">{habit.emoji}</span>
                    <span className="text-base sm:text-lg font-medium">{habit.name}</span>
                  </div>
                </td>
                {weekDates.map(day => {
                  const isCompleted = habit.completedDays && habit.completedDays.includes(day.date);
                  
                  return (
                    <td 
                      key={day.date} 
                      className={`text-center py-3 px-1 ${isEditable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                      onClick={() => isEditable && onDayClick && onDayClick(day.date)}
                    >
                      {isCompleted ? (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-100 rounded-full mx-auto"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Estatísticas da semana */}
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {habit.completedDays ? habit.completedDays.filter(date => 
                weekDates.some(day => day.date === date)
              ).length : 0}/{weekDates.length}
            </div>
            <div className="text-sm text-gray-600">
              dias concluídos nesta semana
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleWeekTable;