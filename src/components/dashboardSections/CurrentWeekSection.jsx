// src/components/dashboardSections/CurrentWeekSection.jsx - MOBILE RESPONSIVO
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { getDayHabits } from '../../firebase/habitsService';
import useDashboardData from '../../hooks/useDashboardData';

const CurrentWeekSection = ({ isExpanded, onToggle }) => {
  const { refreshData } = useDashboardData(); // Só para sincronização
  const [currentWeekData, setCurrentWeekData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(0);

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

  // Emojis de sentimento (iguais ao formulário)
  const sentimentEmojis = {
    'ansioso': '😟',
    'normal': '😐', 
    'produtivo': '😊'
  };

  // Função para obter datas da semana atual
  const getCurrentWeekDates = () => {
    const today = new Date();
    const brasiliaOffset = -3;
    const utcTime = today.getTime() + (today.getTimezoneOffset() * 60000);
    const brasiliaTime = new Date(utcTime + (brasiliaOffset * 3600000));
    
    const currentDay = brasiliaTime.getDay();
    const weekDates = [];
    const sunday = new Date(brasiliaTime);
    sunday.setDate(brasiliaTime.getDate() - currentDay);
    
    for (let i = 0; i <= currentDay; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i];
      
      weekDates.push({
        date: dateStr,
        dayName: dayName,
        dayNumber: date.getDate(),
        isToday: dateStr === brasiliaTime.toISOString().split('T')[0]
      });
    }
    
    return weekDates;
  };

  // Função para carregar dados da semana atual
  const loadCurrentWeekData = async () => {
    setLoading(true);
    
    try {
      const weekDates = getCurrentWeekDates();
      const weekData = {};
      
      for (const dayInfo of weekDates) {
        try {
          const dayData = await getDayHabits(dayInfo.date);
          
          if (dayData.success && dayData.data) {
            console.log(`🔍 [CurrentWeekSection] Dados carregados para ${dayInfo.date}:`, dayData.data);
            console.log(`🔍 [CurrentWeekSection] Sentimento específico para ${dayInfo.date}:`, dayData.data.sentimento);
            weekData[dayInfo.date] = {
              ...dayData.data,
              dayInfo: dayInfo,
              hasData: true
            };
          } else {
            weekData[dayInfo.date] = {
              dayInfo: dayInfo,
              hasData: false
            };
          }
        } catch (error) {
          weekData[dayInfo.date] = {
            dayInfo: dayInfo,
            hasData: false
          };
        }
      }
      
      setCurrentWeekData(weekData);
      
    } catch (error) {
      console.error('Erro ao carregar dados da semana:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados inicialmente
  useEffect(() => {
    loadCurrentWeekData();
  }, []);

  // Listener para mudanças globais (quando formulário salva)
  useEffect(() => {    
    // Listener personalizado para mudanças locais
    const handleLocalUpdate = () => {
      console.log('📢 [CurrentWeekSection] Detectada atualização local, recarregando...');
      // Force um delay pequeno para garantir que o Firebase foi atualizado
      setTimeout(() => {
        loadCurrentWeekData();
      }, 500);
    };

    window.addEventListener('habitsUpdated', handleLocalUpdate);

    return () => {
      window.removeEventListener('habitsUpdated', handleLocalUpdate);
    };
  }, []);

  // 🆕 Método público para forçar refresh (para debug)
  window.refreshCurrentWeek = () => {
    console.log('🔄 [CurrentWeekSection] Refresh manual ativado');
    loadCurrentWeekData();
  };

  const allDays = Object.values(currentWeekData)
    .sort((a, b) => a.dayInfo.date.localeCompare(b.dayInfo.date));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando semana atual...</span>
        </div>
      </div>
    );
  }

  if (allDays.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="text-center text-gray-500 p-6">
          <Calendar className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Nenhum dia da semana atual disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 overflow-hidden">
      {/* Conteúdo sempre visível */}
      <div className="p-3 sm:p-6 overflow-x-auto">
        {/* ✅ CORREÇÃO: Tabela com larguras controladas mas tamanhos adequados */}
        <div className="min-w-0 w-full">
          <table className="w-full table-auto">{/* ✅ Mudou para table-auto para mais flexibilidade */}
            
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
                  <td key={day.dayInfo.date} className="text-center py-3 px-1">
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

              {/* Linhas dos Hábitos */}
              {habitsList.map(habit => (
                <tr key={habit.key} className="hover:bg-gray-50">
                  <td className="py-3 px-2 sm:py-4 sm:px-3 font-medium text-gray-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl sm:text-3xl">{habit.label}</span>
                      <span className="text-base sm:text-lg font-medium">{habit.name}</span>
                    </div>
                  </td>
                  {allDays.map(day => (
                    <td key={day.dayInfo.date} className="text-center py-3 px-1">
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
                  ))}
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
                  <td key={day.dayInfo.date} className="text-center py-3 px-1">
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
      </div>
    </div>
  );
};

export default CurrentWeekSection;