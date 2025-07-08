// src/components/dashboardSections/CurrentWeekSection.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { getDayHabits } from '../../firebase/habitsService';

const CurrentWeekSection = ({ data, isExpanded, onToggle }) => {
  const [currentWeekData, setCurrentWeekData] = useState({});
  const [loading, setLoading] = useState(true);

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

  // Emojis de sentimento (do AddDayForm)
  const sentimentEmojis = {
    'ansioso': '😩',
    'normal': '😐', 
    'produtivo': '🔥'
  };

  // 🔧 FUNÇÃO CORRIGIDA: obter datas da semana atual (timezone Brasil)
  const getCurrentWeekDates = () => {
    // 🇧🇷 CORREÇÃO: Usar timezone do Brasil em vez de UTC
    const today = new Date();
    const brasiliaOffset = -3; // GMT-3 (horário de Brasília)
    const utcTime = today.getTime() + (today.getTimezoneOffset() * 60000);
    const brasiliaTime = new Date(utcTime + (brasiliaOffset * 3600000));
    
    const currentDay = brasiliaTime.getDay(); // 0 = domingo, 1 = segunda, etc.
    
    console.log('📅 [getCurrentWeekDates] Hoje (Brasília):', brasiliaTime.toISOString().split('T')[0]);
    console.log('📅 [getCurrentWeekDates] Hoje (UTC):', today.toISOString().split('T')[0]);
    console.log('📅 [getCurrentWeekDates] Dia da semana:', currentDay, ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][currentDay]);
    
    const weekDates = [];
    
    // Calcular domingo da semana atual (usando horário de Brasília)
    const sunday = new Date(brasiliaTime);
    sunday.setDate(brasiliaTime.getDate() - currentDay);
    
    console.log('📅 [getCurrentWeekDates] Domingo da semana:', sunday.toISOString().split('T')[0]);
    
    // 🔧 CORREÇÃO: Gerar datas de domingo até hoje (INCLUINDO HOJE)
    for (let i = 0; i <= currentDay; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i];
      
      weekDates.push({
        date: dateStr,
        dayName: dayName,
        dayNumber: date.getDate(), // ← Pega o dia correto da data calculada
        isToday: dateStr === brasiliaTime.toISOString().split('T')[0]
      });
      
      console.log(`📅 [getCurrentWeekDates] Adicionado: ${dayName} ${date.getDate()} (${dateStr})`);
    }
    
    console.log('📅 [getCurrentWeekDates] Total de dias:', weekDates.length);
    return weekDates;
  };

  // Função para carregar dados da semana atual
  const loadCurrentWeekData = async () => {
    setLoading(true);
    
    try {
      const weekDates = getCurrentWeekDates();
      const weekData = {};
      
      console.log('🔄 [loadCurrentWeekData] Carregando dados para', weekDates.length, 'dias');
      
      // 🆕 TESTE DIRETO: Verificar se o dia 07 existe no Firebase
      const today = new Date().toISOString().split('T')[0];
      if (today === '2025-01-07') {
        console.log('🧪 [TESTE] Hoje é 07/01, fazendo teste direto no Firebase...');
        const testResult = await getDayHabits('2025-01-07');
        console.log('🧪 [TESTE] Resultado direto getDayHabits("2025-01-07"):', testResult);
      }
      
      // Buscar dados para cada dia da semana
      for (const dayInfo of weekDates) {
        try {
          console.log(`🔍 [loadCurrentWeekData] Buscando dados para: ${dayInfo.date}`);
          
          const dayData = await getDayHabits(dayInfo.date);
          
          console.log(`📦 [loadCurrentWeekData] Resultado getDayHabits para ${dayInfo.date}:`, dayData);
          
          if (dayData.success && dayData.data) {
            console.log(`📊 [loadCurrentWeekData] Dados detalhados para ${dayInfo.date}:`, dayData.data);
            weekData[dayInfo.date] = {
              ...dayData.data,
              dayInfo: dayInfo,
              hasData: true
            };
            console.log(`✅ [loadCurrentWeekData] ${dayInfo.date} marcado como COM dados`);
          } else {
            console.log(`❌ [loadCurrentWeekData] ${dayInfo.date} - getDayHabits falhou:`, dayData.error || 'Sem dados');
            // 🔧 MUDANÇA: Incluir dia mesmo sem dados
            weekData[dayInfo.date] = {
              dayInfo: dayInfo,
              hasData: false
            };
            console.log(`⚪ [loadCurrentWeekData] ${dayInfo.date} marcado como SEM dados`);
          }
        } catch (error) {
          console.warn(`❌ [loadCurrentWeekData] Erro ao carregar ${dayInfo.date}:`, error);
          weekData[dayInfo.date] = {
            dayInfo: dayInfo,
            hasData: false
          };
        }
      }
      
      setCurrentWeekData(weekData);
      console.log('📅 [loadCurrentWeekData] Dados carregados:', weekData);
      
    } catch (error) {
      console.error('❌ [loadCurrentWeekData] Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando componente montar
  useEffect(() => {
    loadCurrentWeekData();
  }, []);

  // 🔧 MUDANÇA: Incluir TODOS os dias (com dados ou não)
  const allDays = Object.values(currentWeekData)
    .sort((a, b) => a.dayInfo.date.localeCompare(b.dayInfo.date));

  console.log('📊 [CurrentWeekSection] Dias para exibir:', allDays.length);
  allDays.forEach(day => {
    console.log(`📊 ${day.dayInfo.dayName} ${day.dayInfo.dayNumber}: ${day.hasData ? 'COM dados' : 'SEM dados'}`);
  });

  // Se não há dias (nem mesmo vazios), mostrar loading ou estado vazio
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando semana atual...</span>
        </div>
      </div>
    );
  }

  if (allDays.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <Calendar className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Nenhum dia da semana atual disponível</p>
          <p className="text-sm">Erro ao calcular dias da semana</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg mb-8">
      {/* Conteúdo sempre visível */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            
            {/* Cabeçalho com dias da semana */}
            <thead>
              <tr>
                <th className="text-left py-4 px-4 lg:px-6">
                  {/* Cabeçalho vazio para a coluna dos hábitos */}
                </th>
                {allDays.map(day => (
                  <th key={day.dayInfo.date} className="text-center py-4 px-2">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-600">{day.dayInfo.dayName}</span>
                      <span className={`text-xl font-bold ${day.dayInfo.isToday ? 'text-blue-600' : 'text-gray-700'}`}>
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
                <td className="py-4 px-4 lg:px-6 font-medium text-gray-700 flex items-center gap-3">
                  <span className="text-3xl lg:text-4xl">⚖️</span>
                  <span className="text-lg lg:text-xl">Peso</span>
                </td>
                {allDays.map(day => (
                  <td key={day.dayInfo.date} className="text-center py-4 px-2">
                    {day.peso ? (
                      <span className="text-sm lg:text-base font-medium text-gray-800 bg-blue-50 px-3 py-2 rounded-lg">
                        {day.peso}kg
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xl">-</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Linhas dos Hábitos */}
              {habitsList.map(habit => (
                <tr key={habit.key} className="hover:bg-gray-50">
                  <td className="py-4 px-4 lg:px-6 font-medium text-gray-700 flex items-center gap-3">
                    <span className="text-3xl lg:text-4xl">{habit.label}</span>
                    <span className="text-lg lg:text-xl">{habit.name}</span>
                  </td>
                  {allDays.map(day => (
                    <td key={day.dayInfo.date} className="text-center py-4 px-2">
                      {day[habit.key] ? (
                        <div className="w-7 h-7 lg:w-8 lg:h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gray-100 rounded-full mx-auto"></div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Linha de Sentimento */}
              <tr>
                <td className="py-4 px-4 lg:px-6 font-medium text-gray-700 flex items-center gap-3">
                  <span className="text-3xl lg:text-4xl">💭</span>
                  <span className="text-lg lg:text-xl">Sentimento</span>
                </td>
                {allDays.map(day => (
                  <td key={day.dayInfo.date} className="text-center py-4 px-2">
                    {day.sentimento && sentimentEmojis[day.sentimento] ? (
                      <span className="text-2xl lg:text-3xl">
                        {sentimentEmojis[day.sentimento]}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xl">-</span>
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