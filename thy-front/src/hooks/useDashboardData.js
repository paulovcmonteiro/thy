// src/hooks/useHabitsData.js - ATUALIZADO PARA DADOS DIÁRIOS
import { useState, useEffect } from 'react';
// 🔄 MUDANÇA PRINCIPAL: Importar novas funções para dados diários
import { getWeeklyAggregates, saveDailyHabits } from '../firebase/habitsService'; // ✅ NOVO

const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 MANTIDO: Configurações dos hábitos (para validação e conversão)
  const habitMaxValues = {
    meditar: 7,
    medicar: 3,
    exercitar: 7,
    comunicar: 5,
    alimentar: 7,
    estudar: 7,
    descansar: 7
  };

  // 🔄 FUNÇÃO DE CARREGAMENTO ADAPTADA
  const loadData = async () => {
    try {
      console.log('🔄 [useHabitsData] Carregando dados das semanas agregadas...');
      setLoading(true);
      setError(null);
      
      // 🔄 MUDANÇA: getWeeklyAggregates em vez de getAllWeeks
      const weeks = await getWeeklyAggregates();
      
      if (weeks && weeks.length > 0) {
        
        // Verificar compatibilidade da estrutura
        const firstWeek = weeks[0];
        console.log('🔍 [useHabitsData] Propriedades da semana agregada:', Object.keys(firstWeek));
        console.log('🔍 [useHabitsData] Estrutura compatível?', {
          temSemana: !!firstWeek.semana,
          temCompletude: !!firstWeek.completude,
          temPeso: !!firstWeek.peso,
          temHabitos: {
            meditar: firstWeek.meditar,
            medicar: firstWeek.medicar,
            exercitar: firstWeek.exercitar
          },
          // 🆕 Novos campos disponíveis
          temPontosBase: !!firstWeek.pontosBase,
          temBonusPeso: !!firstWeek.bonusPeso
        });
      }
      
      // 🔄 MESMA FUNÇÃO DE PROCESSAMENTO (compatibilidade total!)
      const processedData = processFirestoreData(weeks);
      console.log('🔍 [DEBUG] Dados processados:', processedData);
      
      console.log('🔄 [useHabitsData] Dados processados para dashboard:', {
        weeklyCompletion: processedData?.weeklyCompletionData?.length || 0,
        weight: processedData?.weightData?.length || 0,
        habits: Object.keys(processedData?.habitDataByType || {}),
        totalWeeks: processedData?.analysisInfo?.totalWeeks || 0
      });
      
      setData(processedData);
      console.log('🎉 [useHabitsData] Dados carregados e processados com sucesso!');
      
    } catch (err) {
      console.error('❌ [useHabitsData] Erro ao carregar dados:', err);
      console.error('❌ [useHabitsData] Stack trace:', err.stack);
      console.error('❌ [useHabitsData] Mensagem do erro:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('🏁 [useHabitsData] Carregamento finalizado');
    }
  };

  // 🆕 NOVA FUNÇÃO: ADICIONAR DIA (substitui addNewWeek)
  const addNewDay = async (dayData) => {
    try {
      console.log('🆕 [useHabitsData] Adicionando novo dia:', dayData);

      // Validar data obrigatória (formato ISO: YYYY-MM-DD)
      if (!dayData.date) {
        throw new Error('Campo "date" é obrigatório (formato YYYY-MM-DD)');
      }

      // Validar formato da data
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dayData.date)) {
        throw new Error('Data deve estar no formato YYYY-MM-DD (ex: 2025-06-21)');
      }

      // Preparar dados do dia (boolean para hábitos)
      const dailyHabits = {
        peso: dayData.peso ? Number(dayData.peso) : null,
        meditar: Boolean(dayData.meditar),
        medicar: Boolean(dayData.medicar),
        exercitar: Boolean(dayData.exercitar),
        comunicar: Boolean(dayData.comunicar),
        alimentar: Boolean(dayData.alimentar),
        estudar: Boolean(dayData.estudar),
        descansar: Boolean(dayData.descansar),
        obs: dayData.obs || '',
        sentimento: dayData.sentimento || '' // 🆕 Incluir sentimento
      };

      console.log('📤 [useHabitsData] Dados para salvar:', {
        date: dayData.date,
        ...dailyHabits
      });

      // Salvar via habitsService (automaticamente recalcula semana)
      const result = await saveDailyHabits(dayData.date, dailyHabits);

      if (result.success) {
        console.log('✅ [useHabitsData] Dia adicionado + semana recalculada automaticamente');
        
        // 🔄 Recarregar dados para refletir mudanças
        await loadData();
        
        return { success: true, data: result.data };
      } else {
        console.error('❌ [useHabitsData] Erro ao adicionar dia:', result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      console.error('❌ [useHabitsData] Erro inesperado ao adicionar dia:', error);
      return { 
        success: false, 
        error: error.message || 'Erro inesperado' 
      };
    }
  };

  // 🚫 FUNÇÃO DEPRECIADA: addNewWeek (mantida para compatibilidade temporária)
  const addNewWeek = async (weekData) => {
    return {
      success: false,
      error: 'Função addNewWeek() foi substituída. Use addNewDay() para salvar dias individuais.'
    };
  };

  // 🔄 MANTIDO: useEffect exatamente igual
  useEffect(() => {
    loadData();
  }, []);

  console.log('📊 [useHabitsData] Estado atual:', { 
    hasData: !!data, 
    loading, 
    hasError: !!error 
  });

  // 🔄 INTERFACE ATUALIZADA
  return { 
    data, 
    loading, 
    error, 
    refreshData: loadData,     // 🔄 Mantido
    addNewDay,                 // 🆕 Nova função principal
    addNewWeek                 // 🚫 Depreciada (compatibilidade)
  };
};

// 🔄 FUNÇÃO DE PROCESSAMENTO ADAPTADA (mas mantendo compatibilidade)
const processFirestoreData = (weeks) => {
  
  if (!weeks || weeks.length === 0) {
    return {
      weeklyCompletionData: [],
      weightData: [],
      habitDataByType: {},
      habitsList: [],
      analysisInfo: {}
    };
  }

  try {
    // 1. Weekly Completion Data (COM ID para comparação precisa entre anos)
    const weeklyCompletionData = weeks.map(week => ({
      id: week.id,                     // "2026-01-12" (weekStartISO com ano)
      semana: week.semana,             // "12/01" (formato DD/MM para exibição)
      completude: week.completude || 0
    }));
    console.log('✅ [processFirestoreData] Completude processada:', weeklyCompletionData.length, 'entradas');

    // 2. Weight Data (COM ID para comparação precisa entre anos)
    const weightData = weeks
      .filter(week => week.peso && week.peso > 0)
      .map(week => ({
        id: week.id,                   // "2026-01-12" (weekStartISO com ano)
        semana: week.semana,           // "12/01"
        peso: week.peso
      }));
    console.log('✅ [processFirestoreData] Peso processado:', weightData.length, 'entradas');

    // 3. Habit Data By Type (ADAPTADO para novos dados)
    const habitsList = ['meditar', 'medicar', 'exercitar', 'comunicar', 'alimentar', 'estudar', 'descansar'];
    
    // Configurações para conversão
    const habitMaxValues = {
      meditar: 7, medicar: 3, exercitar: 7, comunicar: 5,
      alimentar: 7, estudar: 7, descansar: 7
    };
    
    const habitDataByType = {};
    
    habitsList.forEach(habit => {
      console.log(`🔧 [processFirestoreData] Processando hábito: ${habit}`);
      
      // 🔄 CONVERSÃO: Contagem de dias → Porcentagem (compatibilidade com gráficos)
      const habitData = weeks.map(week => {
        const count = week[habit] || 0;              // Ex: 5 dias
        const maxValue = habitMaxValues[habit];      // Ex: 7 dias máximo
        const percentage = maxValue > 0 ? Math.round((count / maxValue) * 100) : 0; // Ex: 71%

        return {
          id: week.id,         // "2026-01-12" (weekStartISO com ano)
          semana: week.semana, // "12/01" (formato DD/MM para exibição)
          valor: percentage    // Dashboard espera % para os gráficos
        };
      });
      
      habitDataByType[habit] = {
        data: habitData,
        habit: habit.charAt(0).toUpperCase() + habit.slice(1)
      };
      
      console.log(`✅ [processFirestoreData] ${habit}:`, habitData.length, 'entradas (convertidas para %)');
    });

    // 4. Analysis Info (IGUAL ao formato anterior)
    const analysisInfo = {
      startDate: weeks[0]?.semana || 'N/A',
      endDate: weeks[weeks.length - 1]?.semana || 'N/A',
      totalWeeks: weeks.length,
      userName: 'Paulo'
    };

    const result = {
      weeklyCompletionData,
      weightData,
      habitDataByType,
      habitsList,
      analysisInfo
    };

    console.log('✅ [processFirestoreData] Processamento concluído com sucesso!');
    console.log('📊 [processFirestoreData] Resultado final compatível:', {
      weeklyCompletion: result.weeklyCompletionData.length,
      weight: result.weightData.length,
      habits: Object.keys(result.habitDataByType).length,
      totalWeeks: result.analysisInfo.totalWeeks
    });

    // 🔍 Debug: Mostrar exemplo de conversão
    if (weeks.length > 0 && result.habitDataByType.meditar) {
      const firstWeek = weeks[0];
      const meditarExample = result.habitDataByType.meditar.data[0];
      console.log('🔍 [processFirestoreData] Exemplo de conversão - Meditar:', {
        original: `${firstWeek.meditar} dias de ${habitMaxValues.meditar}`,
        convertido: `${meditarExample.valor}%`
      });
    }

    return result;

  } catch (error) {
    console.error('❌ [processFirestoreData] Erro durante processamento:', error);
    console.error('❌ [processFirestoreData] Stack trace:', error.stack);
    throw error;
  }
};

export default useDashboardData;