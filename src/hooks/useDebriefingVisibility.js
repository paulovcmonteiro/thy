// src/hooks/useDebriefingVisibility.js
import { useState, useEffect } from 'react';
import { 
  isTodaySaturday, 
  getWeekSaturday, 
  getInProgressDebriefing 
} from '../firebase/debriefingService';

const useDebriefingVisibility = () => {
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkDebriefingVisibility = async () => {
    try {
      setLoading(true);
      
      // 1. Verificar se hoje é sábado ou depois
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=domingo, 1=segunda, ..., 6=sábado
      const isSaturdayOrAfter = dayOfWeek >= 6 || dayOfWeek === 0; // sábado=6, domingo=0
      
      // 2. Verificar se existe debriefing em progresso
      const inProgressResult = await getInProgressDebriefing();
      const hasInProgressDebriefing = inProgressResult.success && inProgressResult.data;
      
      // 3. Se existe debriefing em progresso, verificar se é da semana atual
      let isCurrentWeekInProgress = false;
      if (hasInProgressDebriefing) {
        const currentWeekSaturday = getWeekSaturday(today);
        isCurrentWeekInProgress = inProgressResult.data.weekDate === currentWeekSaturday;
      }
      
      // 4. Lógica corrigida: mostrar botão se...
      // - É sábado/domingo E não há debriefing finalizado da semana atual
      // - OU existe debriefing em progresso da semana atual (qualquer dia)
      const shouldShow = isSaturdayOrAfter || isCurrentWeekInProgress;
      
      setShouldShowButton(shouldShow);
      
      console.log('🔍 [useDebriefingVisibility] Debug:', {
        dayOfWeek,
        isSaturdayOrAfter,
        hasInProgressDebriefing: !!hasInProgressDebriefing,
        isCurrentWeekInProgress,
        shouldShow
      });
      
    } catch (error) {
      console.error('❌ [useDebriefingVisibility] Erro:', error);
      setShouldShowButton(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDebriefingVisibility();
  }, []);

  return {
    shouldShowButton,
    loading,
    refresh: checkDebriefingVisibility
  };
};

export default useDebriefingVisibility;