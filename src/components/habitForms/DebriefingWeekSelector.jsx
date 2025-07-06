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
      
      // Adicionar semanas com dados de hábitos
      weeksWithData.forEach(week => {
        const weekSaturday = convertSemanaToSaturday(week.semana);
        if (weekSaturday) {
          const existingDebriefing = existingDebriefings.find(d => d.weekDate === weekSaturday);
          weekOptions.push({
            weekDate: weekSaturday,
            displayName: week.semana,
            hasData: true,
            hasDebriefing: !!existingDebriefing,
            debriefingStatus: existingDebriefing?.status || null
          });
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
          debriefingStatus: currentDebriefing?.status || null
        });
      }
      
      // Ordenar por data (mais recentes primeiro)
      weekOptions.sort((a, b) => new Date(b.weekDate) - new Date(a.weekDate));
      
      setAvailableWeeks(weekOptions);
      console.log('📅 [WeekSelector] Semanas carregadas:', weekOptions.length);
      
    } catch (error) {
      console.error('❌ [WeekSelector] Erro ao carregar semanas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Converter formato "16/06" para sábado da semana
  const convertSemanaToSaturday = (semanaStr) => {
    try {
      // semanaStr vem como "16/06" (DD/MM)
      const [day, month] = semanaStr.split('/');
      const currentYear = new Date().getFullYear();
      
      // Criar data assumindo o ano atual
      const date = new Date(currentYear, parseInt(month) - 1, parseInt(day));
      
      // Encontrar o sábado dessa semana
      return getWeekSaturday(date);
    } catch (error) {
      console.warn('⚠️ [WeekSelector] Erro ao converter semana:', semanaStr, error);
      return null;
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