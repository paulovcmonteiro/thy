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

  // 🔧 PADRONIZADO: Converte semana DD/MM para sábado (compatibilidade)
  // 📝 NOTA: Debriefings são salvos com data do sábado, mas EXIBIDOS com início no domingo
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
      
      // 📝 Retorna sábado para compatibilidade com debriefings salvos
      return getWeekSaturday(date);
    } catch (error) {
      console.warn('⚠️ [WeekSelector] Erro ao converter semana:', semanaStr, error);
      return null;
    }
  };

  // 🔧 CORRIGIDO: Carregar semanas relevantes para debriefing
  const loadAvailableWeeks = async () => {
    setLoading(true);
    try {
      // Buscar debriefings existentes
      const debriefingsResult = await getAllDebriefings();
      const existingDebriefings = debriefingsResult.success ? debriefingsResult.data : [];

      const weekOptions = [];
      const currentDate = new Date();
      const currentSaturday = getWeekSaturday();

      console.log('📅 [WeekSelector] Data atual:', currentDate.toISOString().split('T')[0]);
      console.log('📅 [WeekSelector] Sábado atual:', currentSaturday);

      // 🆕 1. Gerar as últimas N semanas (incluindo semana atual)
      // Isso garante que semanas recentes apareçam mesmo sem debriefing
      const NUM_RECENT_WEEKS = 8; // Mostrar últimas 8 semanas

      for (let i = 0; i < NUM_RECENT_WEEKS; i++) {
        const weekDate = new Date(currentDate);
        weekDate.setDate(currentDate.getDate() - (i * 7));
        const saturdayDate = getWeekSaturday(weekDate);

        // Verificar se já existe debriefing para esta semana
        const existingDebriefing = existingDebriefings.find(d => d.weekDate === saturdayDate);

        weekOptions.push({
          weekDate: saturdayDate,
          displayName: formatWeekForDisplay(saturdayDate),
          hasData: true,
          hasDebriefing: !!existingDebriefing,
          debriefingStatus: existingDebriefing?.status || null,
          rawDate: new Date(saturdayDate),
          isCurrent: i === 0 // Primeira iteração = semana atual
        });
      }

      // 🆕 2. Adicionar semanas com debriefings FINALIZADOS que não estão nas recentes
      existingDebriefings
        .filter(debriefing => {
          // Filtrar apenas debriefings finalizados
          if (debriefing.status !== 'completed') return false;

          // Não incluir se já está na lista de semanas recentes
          if (weekOptions.find(w => w.weekDate === debriefing.weekDate)) return false;

          // Filtrar apenas semanas dos últimos 3 meses
          const debriefingDate = new Date(debriefing.weekDate);
          const threeMonthsAgo = new Date(currentDate);
          threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

          return debriefingDate >= threeMonthsAgo;
        })
        .forEach(debriefing => {
          weekOptions.push({
            weekDate: debriefing.weekDate,
            displayName: formatWeekForDisplay(debriefing.weekDate),
            hasData: true,
            hasDebriefing: true,
            debriefingStatus: 'completed',
            rawDate: new Date(debriefing.weekDate),
            isCurrent: false
          });
        });

      // 🔧 3. Remover duplicatas e ordenar (mais recentes primeiro)
      const uniqueWeeks = weekOptions.reduce((acc, week) => {
        const exists = acc.find(w => w.weekDate === week.weekDate);
        if (!exists) {
          acc.push(week);
        }
        return acc;
      }, []);

      uniqueWeeks.sort((a, b) => b.rawDate - a.rawDate);

      // 🆕 4. Log para debug
      console.log('📅 [WeekSelector] Semanas finais:', uniqueWeeks.map(w =>
        `${w.displayName} (${w.weekDate}) - ${w.isCurrent ? 'ATUAL' : w.debriefingStatus || 'pendente'}`
      ));

      setAvailableWeeks(uniqueWeeks);
      console.log('📅 [WeekSelector] Total semanas:', uniqueWeeks.length);

    } catch (error) {
      console.error('❌ [WeekSelector] Erro ao carregar semanas:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔧 CORRIGIDO: Formatar semana para mostrar DOMINGO (início) ao invés do sábado
  const formatWeekForDisplay = (saturdayDate) => {
    try {
      // saturdayDate é a data do sábado, mas queremos mostrar o domingo
      const saturday = new Date(saturdayDate + 'T00:00:00');
      
      // 🔧 Calcular o domingo (início da semana)
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() - 6); // 6 dias antes do sábado = domingo
      
      return sunday.toLocaleDateString('pt-BR', {
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

  // 🔧 MELHORADO: Renderizar opção de semana com destaque para atual
  const renderWeekOption = (week) => {
    const isSelected = week.weekDate === selectedWeek;
    const isCurrent = week.isCurrent;
    
    return (
      <div
        key={week.weekDate}
        onClick={() => {
          onWeekChange(week.weekDate);
          setIsOpen(false);
        }}
        className={`px-4 py-3 cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
          isSelected ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
        } ${isCurrent ? 'border-l-4 border-blue-500' : ''}`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Semana {week.displayName}</span>
            {isCurrent && (
              <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white font-medium">
                ATUAL
              </span>
            )}
          </div>
          {isCurrent && (
            <span className="text-xs text-blue-600 mt-1">Para fazer debriefing</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!isCurrent && (
            <span className={`text-xs px-2 py-1 rounded ${
              week.debriefingStatus === 'completed'
                ? 'bg-green-100 text-green-700'
                : week.debriefingStatus === 'in_progress'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-500'
            }`}>
              {week.debriefingStatus === 'completed'
                ? 'Finalizado'
                : week.debriefingStatus === 'in_progress'
                  ? 'Em progresso'
                  : 'Pendente'}
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