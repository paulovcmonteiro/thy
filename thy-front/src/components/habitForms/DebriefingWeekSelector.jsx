// components/habitForms/DebriefingWeekSelector.jsx - SELETOR DE SEMANA PARA DEBRIEFING
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { getAllDebriefings, getWeekSaturday, formatWeekDate } from '../../firebase/debriefingService';
import useDashboardData from '../../hooks/useDashboardData';

const DebriefingWeekSelector = ({ selectedWeek, onWeekChange, className = '' }) => {
  const { data } = useDashboardData();
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 🔧 CORREÇÃO: Função melhorada para converter semana com lógica de ano
  const convertSemanaToSaturday = (semanaStr) => {
    try {
      // semanaStr vem como "16/06" (DD/MM)
      const [day, month] = semanaStr.split('/');
      
      // 🔧 CORREÇÃO: Determinar ano correto baseado no mês atual
      const currentDate = new Date();
      let year = currentDate.getFullYear(); // ano atual
      const currentMonth = currentDate.getMonth() + 1; // 1-12 (janeiro = 1)
      
      // LÓGICA CORRIGIDA: Se o mês é dezembro e estamos em janeiro/fevereiro, é do ano anterior
      if (parseInt(month) === 12 && currentMonth <= 2) {
        year = year - 1;
      }
      // Se o mês é janeiro e estamos em dezembro, é do próximo ano
      else if (parseInt(month) === 1 && currentMonth === 12) {
        year = year + 1;
      }
      
      // Criar data com ano correto
      const date = new Date(year, parseInt(month) - 1, parseInt(day));
      
      console.log(`🔧 [WeekSelector] Convertendo ${semanaStr} -> ${date.toISOString().split('T')[0]} (ano ${year})`);
      
      // Encontrar o sábado dessa semana
      return getWeekSaturday(date);
    } catch (error) {
      console.warn('⚠️ [WeekSelector] Erro ao converter semana:', semanaStr, error);
      return null;
    }
  };

  // Carregar semanas disponíveis
  const loadAvailableWeeks = async () => {
    setLoading(true);
    try {
      // Buscar debriefings existentes
      const debriefingsResult = await getAllDebriefings();
      const existingDebriefings = debriefingsResult.success ? debriefingsResult.data : [];
      
      // Buscar semanas com dados de hábitos (do dashboard)
      const weeksWithData = data?.weeklyCompletionData || [];
      
      // Combinar e criar lista de semanas disponíveis
      const weekOptions = [];
      
      // 🔧 CORREÇÃO: Filtrar apenas semanas recentes e válidas
      const currentDate = new Date();
      const threeMonthsAgo = new Date(currentDate);
      threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
      
      // Adicionar semanas com dados de hábitos (apenas últimas 12 semanas)
      const recentWeeks = weeksWithData.slice(-12); // Últimas 12 semanas apenas
      
      recentWeeks.forEach(week => {
        const weekSaturday = convertSemanaToSaturday(week.semana);
        if (weekSaturday) {
          const weekDate = new Date(weekSaturday);
          
          // 🔧 Filtrar apenas semanas dos últimos 3 meses
          if (weekDate >= threeMonthsAgo) {
            const existingDebriefing = existingDebriefings.find(d => d.weekDate === weekSaturday);
            weekOptions.push({
              weekDate: weekSaturday,
              displayName: week.semana,
              hasData: true,
              hasDebriefing: !!existingDebriefing,
              debriefingStatus: existingDebriefing?.status || null,
              rawDate: weekDate
            });
          }
        }
      });
      
      // Adicionar semana atual se ainda não estiver na lista
      const currentSaturday = getWeekSaturday();
      const currentWeekExists = weekOptions.find(w => w.weekDate === currentSaturday);
      if (!currentWeekExists) {
        const currentDebriefing = existingDebriefings.find(d => d.weekDate === currentSaturday);
        weekOptions.push({
          weekDate: currentSaturday,
          displayName: formatWeekForDisplay(currentSaturday),
          hasData: false,
          hasDebriefing: !!currentDebriefing,
          debriefingStatus: currentDebriefing?.status || null,
          rawDate: new Date(currentSaturday) // 🆕 Para ordenação correta
        });
      }
      
      // 🔧 CORREÇÃO: Remover duplicatas e ordenar por data (mais recentes primeiro)
      const uniqueWeeks = weekOptions.reduce((acc, week) => {
        const exists = acc.find(w => w.weekDate === week.weekDate);
        if (!exists) {
          acc.push(week);
        }
        return acc;
      }, []);
      
      uniqueWeeks.sort((a, b) => b.rawDate - a.rawDate);
      
      // 🆕 Log para debug
      console.log('📅 [WeekSelector] Semanas processadas:', uniqueWeeks.map(w => `${w.displayName} (${w.weekDate})`));
      
      setAvailableWeeks(uniqueWeeks);
      console.log('📅 [WeekSelector] Semanas carregadas:', uniqueWeeks.length);
      
    } catch (error) {
      console.error('❌ [WeekSelector] Erro ao carregar semanas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formatar data do sábado para exibição
  const formatWeekForDisplay = (saturdayDate) => {
    try {
      const date = new Date(saturdayDate + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch (error) {
      return saturdayDate;
    }
  };

  // Carregar semanas quando componente montar ou dados mudarem
  useEffect(() => {
    if (data) {
      loadAvailableWeeks();
    }
  }, [data]);

  // Encontrar semana selecionada
  const selectedWeekData = availableWeeks.find(week => week.weekDate === selectedWeek);

  // Renderizar opção de semana
  const renderWeekOption = (week) => {
    const isSelected = week.weekDate === selectedWeek;
    
    return (
      <div
        key={week.weekDate}
        onClick={() => {
          onWeekChange(week.weekDate);
          setIsOpen(false);
        }}
        className={`px-4 py-3 cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
          isSelected ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
        }`}
      >
        <div>
          <span className="font-medium">Semana {week.displayName}</span>
          {!week.hasData && (
            <span className="text-xs text-gray-500 ml-2">(sem dados)</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {week.hasDebriefing && (
            <span className={`text-xs px-2 py-1 rounded ${
              week.debriefingStatus === 'completed' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {week.debriefingStatus === 'completed' ? 'Finalizado' : 'Em progresso'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      
      {/* Botão seletor */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
      >
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <span className="text-gray-700">
            {loading ? 'Carregando...' : selectedWeekData ? `Semana ${selectedWeekData.displayName}` : 'Selecionar semana'}
          </span>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {availableWeeks.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              Nenhuma semana disponível
            </div>
          ) : (
            availableWeeks.map(renderWeekOption)
          )}
        </div>
      )}

      {/* Overlay para fechar dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default DebriefingWeekSelector;