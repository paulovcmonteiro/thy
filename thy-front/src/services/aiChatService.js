// src/services/aiChatService.js - Serviço para Chat com IA
import { getGeneralClassification, getHabitClassification } from '../data/metricsCalculations';

const AI_BASE_URL = import.meta.env.VITE_N8N_URL || 'https://thyself.app.n8n.cloud/webhook';

/**
 * Coleta TODOS os dados do debriefing para enviar à IA
 * @param {Object} lastDebriefing - Dados do último debriefing finalizado
 * @param {Object} previousWeekData - Dados diários da semana atual (do WeeklyDebriefingSection)
 * @param {Object} dashboardData - Dados gerais do dashboard (useDashboardData)
 * @param {Array} allDebriefings - TODOS os debriefings históricos
 * @param {Object} historicalWeekData - Dados diários das últimas 12 semanas
 * @returns {Object} Todos os dados estruturados para IA
 */
export const collectDebriefingData = (lastDebriefing, previousWeekData, dashboardData, allDebriefings = [], historicalWeekData = {}) => {
  console.log('🔍 [collectDebriefingData] Verificando dados recebidos:');
  console.log('  - lastDebriefing:', !!lastDebriefing, lastDebriefing);
  console.log('  - previousWeekData:', !!previousWeekData, Object.keys(previousWeekData || {}));
  console.log('  - dashboardData:', !!dashboardData, dashboardData);
  console.log('  - allDebriefings:', allDebriefings.length, 'debriefings históricos');
  console.log('  - historicalWeekData:', Object.keys(historicalWeekData).length, 'semanas de dados diários');
  
  if (!lastDebriefing || !previousWeekData || !dashboardData) {
    console.warn('❌ Dados insuficientes para coletar contexto completo');
    console.warn('  - lastDebriefing presente:', !!lastDebriefing);
    console.warn('  - previousWeekData presente:', !!previousWeekData);
    console.warn('  - dashboardData presente:', !!dashboardData);
    return null;
  }

  // 1. DADOS GERAIS DA SEMANA
  const weekData = {
    weekDate: lastDebriefing.weekDate,
    weekStart: calculateWeekStart(lastDebriefing.weekDate),
    weekEnd: lastDebriefing.weekDate
  };

  // 2. DADOS DE EVOLUÇÃO (últimas 8 semanas)
  const evolutionData = getEvolutionData(dashboardData, lastDebriefing.weekDate);

  // 3. ANÁLISE POR HÁBITO
  const habitAnalysis = getHabitAnalysis(dashboardData, lastDebriefing.weekDate);

  // 4. REFLEXÕES DO DEBRIEFING
  const weekReflection = {
    weekRating: lastDebriefing.weekRating || null,
    proudOf: lastDebriefing.proudOf || '',
    notSoGood: lastDebriefing.notSoGood || '',
    improveNext: lastDebriefing.improveNext || '',
    habitComments: lastDebriefing.habitComments || {}
  };

  // 5. DADOS DIÁRIOS DETALHADOS (com observações!)
  const dailyData = processDailyData(previousWeekData);

  // 6. 🆕 HISTÓRICO COMPLETO DE DEBRIEFINGS
  const debriefingHistory = processDebriefingHistory(allDebriefings);

  // 7. 🆕 DADOS DIÁRIOS DAS ÚLTIMAS 12 SEMANAS
  const historicalDailyData = processHistoricalDailyData(historicalWeekData);

  return {
    weekData,
    evolutionData,
    habitAnalysis,
    weekReflection,
    dailyData,
    // 🆕 NOVOS DADOS HISTÓRICOS
    debriefingHistory,
    historicalDailyData,
    // Meta-dados úteis
    metadata: {
      totalDaysWithData: Object.keys(dailyData).length,
      totalHistoricalDebriefings: debriefingHistory.length,
      totalHistoricalWeeks: Object.keys(historicalDailyData).length,
      weekSummary: generateWeekSummary(dailyData, habitAnalysis),
      collectedAt: new Date().toISOString()
    }
  };
};

/**
 * Calcula início da semana (domingo) baseado no sábado
 */
const calculateWeekStart = (weekDate) => {
  const saturday = new Date(weekDate + 'T00:00:00');
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() - 6); // 6 dias antes do sábado
  return sunday.toISOString().split('T')[0];
};

/**
 * Extrai dados de evolução das últimas 8 semanas
 */
const getEvolutionData = (dashboardData, currentWeekDate) => {
  if (!dashboardData.weeklyCompletionData || !dashboardData.weightData) {
    return { completudeData: [], weightData: [] };
  }

  // Encontrar índice da semana atual
  const allWeeks = dashboardData.weeklyCompletionData;
  const currentWeekIndex = allWeeks.findIndex(week => {
    // Converter semana para sábado e comparar
    const weekSaturday = convertSemanaToSaturday(week.semana);
    return weekSaturday === currentWeekDate;
  });

  if (currentWeekIndex === -1) {
    return { completudeData: [], weightData: [] };
  }

  // Pegar últimas 8 semanas + atual
  const startIndex = Math.max(0, currentWeekIndex - 8);
  const endIndex = currentWeekIndex + 1;
  const recentWeeks = allWeeks.slice(startIndex, endIndex);

  // Dados de completude
  const completudeData = recentWeeks.map((week, index) => ({
    semana: week.semana,
    completude: week.completude,
    isCurrentWeek: index === recentWeeks.length - 1
  }));

  // Dados de peso correspondentes
  const weightData = recentWeeks.map((week, index) => {
    const weightWeek = dashboardData.weightData.find(w => w.semana === week.semana);
    return {
      semana: week.semana,
      peso: weightWeek?.peso || null,
      isCurrentWeek: index === recentWeeks.length - 1
    };
  }).filter(w => w.peso !== null);

  return { completudeData, weightData };
};

/**
 * Converte formato de semana DD/MM para sábado YYYY-MM-DD
 */
const convertSemanaToSaturday = (semanaStr) => {
  try {
    const [day, month] = semanaStr.split('/');
    let year = new Date().getFullYear();
    
    // Se é dezembro e estamos em janeiro+, é do ano anterior
    if (parseInt(month) === 12 && new Date().getMonth() >= 0) {
      year = year - 1;
    }
    
    const date = new Date(year, parseInt(month) - 1, parseInt(day));
    // Assumindo que o formato é o sábado da semana
    return date.toISOString().split('T')[0];
  } catch (error) {
    return null;
  }
};

/**
 * Analisa performance de cada hábito
 */
const getHabitAnalysis = (dashboardData, currentWeekDate) => {
  const habitsList = ['meditar', 'medicar', 'exercitar', 'comunicar', 'alimentar', 'estudar', 'descansar'];
  const analysis = {};

  habitsList.forEach(habitKey => {
    const habitData = dashboardData.habitDataByType?.[habitKey]?.data || [];
    
    // Encontrar dados da semana atual
    const currentWeekData = habitData.find(week => {
      const weekSaturday = convertSemanaToSaturday(week.semana);
      return weekSaturday === currentWeekDate;
    });

    const currentValue = currentWeekData?.valor || 0;

    // Calcular média das 8 semanas anteriores
    const currentIndex = habitData.findIndex(week => {
      const weekSaturday = convertSemanaToSaturday(week.semana);
      return weekSaturday === currentWeekDate;
    });

    let averageValue = 0;
    if (currentIndex > 0) {
      const startIndex = Math.max(0, currentIndex - 8);
      const previousWeeks = habitData.slice(startIndex, currentIndex);
      averageValue = previousWeeks.reduce((sum, week) => sum + week.valor, 0) / previousWeeks.length;
    }

    const classification = getHabitClassification(currentValue);

    // Determinar tendência
    let trend = 'estável';
    if (currentValue > averageValue + 5) {
      trend = 'melhora';
    } else if (currentValue < averageValue - 5) {
      trend = 'declínio';
    }

    analysis[habitKey] = {
      current: currentValue,
      average: Math.round(averageValue * 10) / 10, // 1 casa decimal
      classification,
      trend,
      difference: Math.round((currentValue - averageValue) * 10) / 10
    };
  });

  return analysis;
};

/**
 * Processa dados diários incluindo observações
 */
const processDailyData = (previousWeekData) => {
  const dailyData = {};

  Object.entries(previousWeekData).forEach(([date, dayData]) => {
    if (dayData.hasData) {
      dailyData[date] = {
        // Hábitos (booleanos)
        meditar: dayData.meditar || false,
        medicar: dayData.medicar || false,
        exercitar: dayData.exercitar || false,
        comunicar: dayData.comunicar || false,
        alimentar: dayData.alimentar || false,
        estudar: dayData.estudar || false,
        descansar: dayData.descansar || false,
        
        // Dados qualitativos
        peso: dayData.peso || null,
        sentimento: dayData.sentimento || null,
        obs: dayData.obs || '', // OBSERVAÇÕES DIÁRIAS!
        
        // Meta-dados
        dayInfo: dayData.dayInfo,
        hasData: true
      };
    }
  });

  return dailyData;
};

/**
 * Gera resumo da semana para contexto
 */
const generateWeekSummary = (dailyData, habitAnalysis) => {
  const totalDays = Object.keys(dailyData).length;
  const daysWithObservations = Object.values(dailyData).filter(day => day.obs && day.obs.trim()).length;
  
  // Calcular completude geral da semana
  const habitsList = ['meditar', 'medicar', 'exercitar', 'comunicar', 'alimentar', 'estudar', 'descansar'];
  let totalHabits = 0;
  let completedHabits = 0;
  
  Object.values(dailyData).forEach(day => {
    habitsList.forEach(habit => {
      totalHabits++;
      if (day[habit]) completedHabits++;
    });
  });

  const weekCompletude = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  return {
    totalDays,
    daysWithObservations,
    weekCompletude,
    bestHabit: getBestHabit(habitAnalysis),
    worstHabit: getWorstHabit(habitAnalysis)
  };
};

const getBestHabit = (habitAnalysis) => {
  let best = null;
  let bestValue = -1;
  
  Object.entries(habitAnalysis).forEach(([habit, data]) => {
    if (data.current > bestValue) {
      bestValue = data.current;
      best = { habit, value: data.current, classification: data.classification };
    }
  });
  
  return best;
};

const getWorstHabit = (habitAnalysis) => {
  let worst = null;
  let worstValue = 101;
  
  Object.entries(habitAnalysis).forEach(([habit, data]) => {
    if (data.current < worstValue) {
      worstValue = data.current;
      worst = { habit, value: data.current, classification: data.classification };
    }
  });
  
  return worst;
};

/**
 * 🆕 Processa histórico completo de debriefings
 * @param {Array} allDebriefings - Array com todos os debriefings
 * @returns {Array} Debriefings processados e ordenados
 */
const processDebriefingHistory = (allDebriefings) => {
  if (!allDebriefings || allDebriefings.length === 0) {
    return [];
  }

  // Ordenar por data (mais recente primeiro) e processar
  return allDebriefings
    .filter(debriefing => debriefing.status === 'completed') // Só debriefings finalizados
    .sort((a, b) => new Date(b.weekDate) - new Date(a.weekDate))
    .map(debriefing => ({
      weekDate: debriefing.weekDate,
      weekFormatted: new Date(debriefing.weekDate).toLocaleDateString('pt-BR'),
      weekRating: debriefing.weekRating,
      proudOf: debriefing.proudOf || '',
      notSoGood: debriefing.notSoGood || '',
      improveNext: debriefing.improveNext || '',
      habitComments: debriefing.habitComments || {},
      createdAt: debriefing.createdAt,
      // Meta-informações úteis
      hasReflections: !!(debriefing.proudOf || debriefing.notSoGood || debriefing.improveNext),
      habitsWithComments: Object.keys(debriefing.habitComments || {}).filter(h => debriefing.habitComments[h])
    }));
};

/**
 * 🆕 Processa dados diários das últimas 12 semanas
 * @param {Object} historicalWeekData - Objeto com dados por semana
 * @returns {Object} Dados organizados por semana e otimizados
 */
const processHistoricalDailyData = (historicalWeekData) => {
  if (!historicalWeekData || Object.keys(historicalWeekData).length === 0) {
    return {};
  }

  const processedData = {};

  Object.entries(historicalWeekData).forEach(([weekDate, weekData]) => {
    // Processar dados de cada dia da semana
    const dailyEntries = {};
    let weekSummary = {
      totalDaysWithData: 0,
      totalObservations: 0,
      averageWeight: null,
      habitCounts: {
        meditar: 0, medicar: 0, exercitar: 0, comunicar: 0,
        alimentar: 0, estudar: 0, descansar: 0
      }
    };

    Object.entries(weekData).forEach(([date, dayData]) => {
      if (dayData.hasData) {
        weekSummary.totalDaysWithData++;
        
        // Contar observações
        if (dayData.obs && dayData.obs.trim()) {
          weekSummary.totalObservations++;
        }

        // Calcular peso médio
        if (dayData.peso) {
          weekSummary.averageWeight = weekSummary.averageWeight 
            ? (weekSummary.averageWeight + dayData.peso) / 2 
            : dayData.peso;
        }

        // Contar hábitos
        Object.keys(weekSummary.habitCounts).forEach(habit => {
          if (dayData[habit]) weekSummary.habitCounts[habit]++;
        });

        // Armazenar dados do dia (só se tiver observações ou dados importantes)
        if (dayData.obs || dayData.sentimento || dayData.peso) {
          dailyEntries[date] = {
            hasObservation: !!(dayData.obs && dayData.obs.trim()),
            observation: dayData.obs || '',
            sentiment: dayData.sentimento || null,
            weight: dayData.peso || null,
            dayOfWeek: dayData.dayInfo?.dayName || null
          };
        }
      }
    });

    // Só incluir semana se tiver dados relevantes
    if (weekSummary.totalDaysWithData > 0) {
      processedData[weekDate] = {
        weekDate,
        weekFormatted: new Date(weekDate).toLocaleDateString('pt-BR'),
        summary: weekSummary,
        dailyEntries: dailyEntries,
        // Meta-informações
        hasObservations: weekSummary.totalObservations > 0,
        completionRate: Math.round((weekSummary.totalDaysWithData / 7) * 100)
      };
    }
  });

  return processedData;
};

/**
 * Função para futura integração com N8N (Chat com IA)
 * @param {Object} debriefingData - Dados coletados
 * @param {string} userMessage - Mensagem do usuário
 * @returns {Promise<Object>} Resposta da IA
 */
export const chatWithAI = async (debriefingData, userMessage) => {
  try {
    const fullUrl = `${AI_BASE_URL}/chat-ai`;
    console.log('🌐 [URL CHECK] AI_BASE_URL:', AI_BASE_URL);
    console.log('🌐 [URL CHECK] Full URL:', fullUrl);
    console.log('🌐 [URL CHECK] ENV VITE_N8N_URL:', import.meta.env.VITE_N8N_URL);
    
    // 🔍 Debug: Verificar estrutura e tamanho dos dados
    console.log('📊 [DEBUG] Estrutura dos dados enviados:', {
      hasDebriefingHistory: !!debriefingData.debriefingHistory,
      debriefingHistoryCount: debriefingData.debriefingHistory?.length || 0,
      hasHistoricalDailyData: !!debriefingData.historicalDailyData,
      historicalDailyDataWeeks: Object.keys(debriefingData.historicalDailyData || {}).length,
      payloadSizeKB: Math.round(JSON.stringify({debriefingData, userMessage}).length / 1024)
    });
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        debriefingData,
        userMessage,
        requestType: 'chat'
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log('🤖 [N8N] Response object:', response);
    console.log('🤖 [N8N] Response data:', data);
    console.log('🤖 [N8N] Data keys:', Object.keys(data));
    
    // Tentar diferentes formatos de resposta do N8N
    let aiResponse = data.response || 
                    data.content?.[0]?.text || 
                    data.text || 
                    data.output || 
                    data.result ||
                    JSON.stringify(data);
    
    console.log('🤖 [N8N] Final AI response:', aiResponse);
    
    return {
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Erro ao conversar com IA:', error);
    return {
      success: false,
      error: error.message,
      fallbackMessage: 'Não foi possível conversar com a IA no momento. Tente novamente.'
    };
  }
};

export default {
  collectDebriefingData,
  chatWithAI
};