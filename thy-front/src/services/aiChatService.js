// src/services/aiChatService.js - Serviço para Chat com IA
import { getGeneralClassification, getHabitClassification } from '../data/metricsCalculations';

const AI_BASE_URL = import.meta.env.VITE_N8N_URL || 'https://thyapp.app.n8n.cloud/webhook';

/**
 * Coleta TODOS os dados do debriefing para enviar à IA
 * @param {Object} lastDebriefing - Dados do último debriefing finalizado
 * @param {Object} previousWeekData - Dados diários da semana (do WeeklyDebriefingSection)
 * @param {Object} dashboardData - Dados gerais do dashboard (useDashboardData)
 * @returns {Object} Todos os dados estruturados para IA
 */
export const collectDebriefingData = (lastDebriefing, previousWeekData, dashboardData) => {
  console.log('🔍 [collectDebriefingData] Verificando dados recebidos:');
  console.log('  - lastDebriefing:', !!lastDebriefing, lastDebriefing);
  console.log('  - previousWeekData:', !!previousWeekData, Object.keys(previousWeekData || {}));
  console.log('  - dashboardData:', !!dashboardData, dashboardData);
  
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

  return {
    weekData,
    evolutionData,
    habitAnalysis,
    weekReflection,
    dailyData,
    // Meta-dados úteis
    metadata: {
      totalDaysWithData: Object.keys(dailyData).length,
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
 * Função para futura integração com N8N (Chat com IA)
 * @param {Object} debriefingData - Dados coletados
 * @param {string} userMessage - Mensagem do usuário
 * @returns {Promise<Object>} Resposta da IA
 */
export const chatWithAI = async (debriefingData, userMessage) => {
  try {
    const response = await fetch(`${AI_BASE_URL}/chat-ai`, {
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