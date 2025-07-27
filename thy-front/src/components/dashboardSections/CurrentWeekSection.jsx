// src/components/dashboardSections/CurrentWeekSection.jsx - REFATORADO com WeekTable
import React, { useState, useEffect } from 'react';
import { getDayHabits } from '../../firebase/habitsService';
import useDashboardData from '../../hooks/useDashboardData';
import WeekTable from '../common/WeekTable';

const CurrentWeekSection = ({ isExpanded, onToggle }) => {
  const { refreshData } = useDashboardData(); // Só para sincronização
  const [currentWeekData, setCurrentWeekData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(0);

  // Nota: habitsList e sentimentEmojis agora estão no WeekTable

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
      
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i];
      
      weekDates.push({
        date: dateStr,
        dayName: dayName,
        dayNumber: date.getDate(),
        isToday: dateStr === `${brasiliaTime.getFullYear()}-${String(brasiliaTime.getMonth() + 1).padStart(2, '0')}-${String(brasiliaTime.getDate()).padStart(2, '0')}`
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

  // Usar o componente WeekTable
  return (
    <WeekTable
      weekData={currentWeekData}
      title="Semana Atual"
      loading={loading}
      showTitle={false}  // Não mostrar título pois está na aba
      isEditable={false}
      onDayClick={null}
    />
  );
};

export default CurrentWeekSection;