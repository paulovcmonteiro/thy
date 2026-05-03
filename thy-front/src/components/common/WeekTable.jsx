// src/components/common/WeekTable.jsx - Componente genérico para tabelas de semana
import React from 'react';
import { Calendar } from 'lucide-react';
import { HABITS_CONFIG } from '../../data/appConstants';

const WeekTable = ({
  weekData = {},           // Dados da semana
  title = "Semana",        // Título da tabela
  loading = false,         // Estado de carregamento
  showTitle = true,        // Mostrar título ou não
  isEditable = false,      // Se os dias são editáveis (futuro)
  onDayClick = null        // Função chamada ao clicar num dia (futuro)
}) => {

  // Lista de hábitos com seus emojis
  const habitsList = [
    { key: 'meditar', label: '🧘', name: 'Meditar' },
    { key: 'medicar', label: '💊', name: 'Medicar' },
    { key: 'exercitar', label: '🏃', name: 'Exercitar' },
    { key: 'comunicar', label: '💬', name: 'Comunicar' },
    { key: 'alimentar', label: '🍎', name: 'Alimentar' },
    { key: 'estudar', label: '📚', name: 'Estudar' },
    { key: 'descansar', label: '😴', name: 'Descansar' }
  ];

  // 🆕 Separar hábitos diários dos semanais (1x/semana)
  const isWeeklyHabit = (key) => HABITS_CONFIG[key]?.constraint === 'once-per-week';
  const dailyHabits = habitsList.filter(h => !isWeeklyHabit(h.key));
  const weeklyHabits = habitsList.filter(h => isWeeklyHabit(h.key));

  // Emojis de sentimento
  const sentimentEmojis = {
    'ansioso': '😟',
    'normal': '😐', 
    'produtivo': '😊'
  };

  // 🔧 PADRONIZADO: Ordenar dias por data (domingo primeiro)
  const allDays = Object.values(weekData)
    .filter(day => day && day.dayInfo) // Garantir que temos dados válidos
    .sort((a, b) => {
      // Ordenar por data para garantir ordem cronológica (domingo primeiro)
      return a.dayInfo.date.localeCompare(b.dayInfo.date);
    });

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

  // Sem dados
  if (allDays.length === 0) {
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
                  {/* Cabeçalho vazio para a coluna dos hábitos */}
                </th>
                {allDays.map(day => (
                  <th key={day.dayInfo.date} className="w-14 sm:w-18 text-center py-3 px-1">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-600">{day.dayInfo.dayName}</span>
                      <span className={`text-lg font-bold ${day.dayInfo.isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {day.dayInfo.dayNumber}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              
              {/* Linha do Peso */}
              <tr>
                <td className="py-3 px-2 sm:py-4 sm:px-3 font-medium text-gray-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl sm:text-3xl">⚖️</span>
                    <span className="text-base sm:text-lg font-medium">Peso</span>
                  </div>
                </td>
                {allDays.map(day => (
                  <td 
                    key={day.dayInfo.date} 
                    className={`text-center py-3 px-1 ${isEditable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    onClick={() => isEditable && onDayClick && onDayClick(day.dayInfo.date)}
                  >
                    {day.peso ? (
                      <span className="text-sm font-medium text-gray-800 bg-blue-50 px-2 py-1 rounded">
                        {day.peso}kg
                      </span>
                    ) : (
                      <span className="text-gray-300 text-lg">-</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Linhas dos Hábitos (apenas diários — semanais ficam fora da tabela) */}
              {dailyHabits.map(habit => (
                <tr key={habit.key} className="hover:bg-gray-50">
                  <td className="py-3 px-2 sm:py-4 sm:px-3 font-medium text-gray-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl sm:text-3xl">{habit.label}</span>
                      <span className="text-base sm:text-lg font-medium">{habit.name}</span>
                    </div>
                  </td>
                  {allDays.map(day => {
                    return (
                      <td
                        key={day.dayInfo.date}
                        className={`text-center py-3 px-1 ${isEditable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                        onClick={() => isEditable && onDayClick && onDayClick(day.dayInfo.date)}
                      >
                        {day[habit.key] ? (
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
              ))}

              {/* Linha de Sentimento */}
              <tr>
                <td className="py-3 px-2 sm:py-4 sm:px-3 font-medium text-gray-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl sm:text-3xl">💭</span>
                    <span className="text-base sm:text-lg font-medium">Sentimento</span>
                  </div>
                </td>
                {allDays.map(day => (
                  <td 
                    key={day.dayInfo.date} 
                    className={`text-center py-3 px-1 ${isEditable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    onClick={() => isEditable && onDayClick && onDayClick(day.dayInfo.date)}
                  >
                    {day.sentimento && sentimentEmojis[day.sentimento] ? (
                      <span className="text-xl sm:text-2xl">
                        {sentimentEmojis[day.sentimento]}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-lg">-</span>
                    )}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

        {/* 🆕 Seção: Hábitos semanais (1x/semana) */}
        {weeklyHabits.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Hábitos semanais
            </h4>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
              {weeklyHabits.map(habit => {
                const completedDay = allDays.find(day => day[habit.key]);
                const dayLabel = completedDay
                  ? `${completedDay.dayInfo.dayName.toLowerCase()} ${String(completedDay.dayInfo.dayNumber).padStart(2, '0')}/${completedDay.dayInfo.date.split('-')[1]}`
                  : null;

                return (
                  <div
                    key={habit.key}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                      completedDay
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{habit.label}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">{habit.name}</div>
                      <div className={`text-xs ${completedDay ? 'text-green-700' : 'text-gray-500'}`}>
                        {completedDay ? `✅ ${dayLabel}` : '○ não feito esta semana'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeekTable;