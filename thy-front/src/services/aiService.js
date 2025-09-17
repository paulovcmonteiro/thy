// src/services/aiService.js - Serviço para integração com IA
const AI_BASE_URL = import.meta.env.VITE_AI_API_URL || 'https://thyapp.app.n8n.cloud/webhook';

// Função para gerar insights inteligentes de debriefing
export const generateDebriefingInsights = async (weekData, habitData, userResponses = {}, allWeeklyData = null) => {
  try {
    console.log('🤖 Gerando insights de debriefing...', { weekData, habitData });

    // Construir prompt contextual - REMOVIDO: n8n faz isso agora
    // const prompt = buildDebriefingPrompt(weekData, habitData, userResponses, allWeeklyData);
    
    const response = await fetch(`${AI_BASE_URL}/generate-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        weekData, 
        habitData, 
        userResponses 
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Resposta completa do N8N:', data);
    
    // N8N retorna estrutura diferente do backend antigo
    // Backend antigo: { response: "texto" }
    // N8N: { content: [{ text: "texto" }] }
    const insights = data.content?.[0]?.text || data.response || 'Erro ao processar resposta';
    
    console.log('📝 Conteúdo dos insights:', insights);
    console.log('📏 Tamanho da resposta:', insights.length);

    return {
      success: true,
      insights: insights,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Erro ao gerar insights:', error);
    return {
      success: false,
      error: error.message,
      fallbackMessage: 'Não foi possível gerar insights no momento. Tente novamente.'
    };
  }
};

// Função para processar dados por dia no formato real
const processHabitDataByDay = (habitData, weekStart, weekEnd) => {
  console.log('🔄 Processando dados por dia:', { habitData, weekStart, weekEnd });
  
  // Lista de hábitos conhecidos
  const habitLabels = {
    meditar: { name: '🧘 Meditar', emoji: '🧘' },
    medicar: { name: '💊 Medicar', emoji: '💊' },
    exercitar: { name: '🏃 Exercitar', emoji: '🏃' },
    comunicar: { name: '💬 Comunicar', emoji: '💬' },
    alimentar: { name: '🍎 Alimentar', emoji: '🍎' },
    estudar: { name: '📚 Estudar', emoji: '📚' },
    descansar: { name: '😴 Descansar', emoji: '😴' }
  };

  // Identificar todos os hábitos presentes
  const allHabits = new Set();
  Object.values(habitData).forEach(dayData => {
    if (dayData && typeof dayData === 'object') {
      Object.keys(dayData).forEach(key => {
        if (habitLabels[key] !== undefined) {
          allHabits.add(key);
        }
      });
    }
  });

  console.log('🎯 Hábitos encontrados:', Array.from(allHabits));

  // Processar performance de cada hábito
  const habitPerformance = Array.from(allHabits).map(habitKey => {
    let completedDays = 0;
    
    // Contar dias completados para este hábito
    Object.entries(habitData).forEach(([dateStr, dayData]) => {
      if (dateStr >= weekStart && dateStr <= weekEnd && dayData && dayData[habitKey] === true) {
        completedDays++;
      }
    });

    const percentage = Math.round((completedDays / 7) * 100);
    
    return {
      name: habitLabels[habitKey]?.name || habitKey,
      emoji: habitLabels[habitKey]?.emoji || '',
      habitKey: habitKey,
      completedDays: completedDays,
      percentage: percentage
    };
  });

  console.log('📊 Performance calculada:', habitPerformance);
  return habitPerformance;
};

// Função para extrair dados adicionais (peso, observações, sentimentos)
const extractAdditionalData = (habitData, weekStart, weekEnd) => {
  const additionalData = {
    weightData: [],
    observations: [],
    sentiments: []
  };

  Object.entries(habitData).forEach(([dateStr, dayData]) => {
    if (dateStr >= weekStart && dateStr <= weekEnd && dayData && typeof dayData === 'object') {
      // Extrair peso
      if (dayData.peso && typeof dayData.peso === 'number') {
        additionalData.weightData.push({
          date: dateStr,
          weight: dayData.peso
        });
      }

      // Extrair observações
      if (dayData.obs && typeof dayData.obs === 'string' && dayData.obs.trim()) {
        additionalData.observations.push({
          date: dateStr,
          observation: dayData.obs.trim()
        });
      }

      // Extrair sentimentos
      if (dayData.sentimento && typeof dayData.sentimento === 'string') {
        additionalData.sentiments.push({
          date: dateStr,
          sentiment: dayData.sentimento
        });
      }
    }
  });

  return additionalData;
};

// Função para processar dados de comparação com semanas anteriores
const processHistoricalComparison = (allWeeklyData, currentWeek) => {
  if (!allWeeklyData || !Array.isArray(allWeeklyData) || allWeeklyData.length < 2) {
    return null; // Não há dados suficientes para comparação
  }

  // Pegar as últimas 4 semanas (excluindo a atual)
  const historicalWeeks = allWeeklyData
    .filter(week => week.semana !== currentWeek)
    .slice(-4);

  if (historicalWeeks.length === 0) return null;

  // Calcular médias históricas
  const avgCompletude = Math.round(
    historicalWeeks.reduce((sum, week) => sum + (week.completude || 0), 0) / historicalWeeks.length
  );

  // Comparação por hábito (se disponível)
  const habitComparison = {};
  
  // Encontrar semana atual para comparação
  const currentWeekData = allWeeklyData.find(week => week.semana === currentWeek);
  const currentCompletude = currentWeekData ? currentWeekData.completude : 0;

  return {
    avgCompletude,
    currentCompletude,
    weekCount: historicalWeeks.length,
    trend: currentCompletude > avgCompletude ? 'melhora' : 
           currentCompletude < avgCompletude ? 'declínio' : 'estável',
    difference: currentCompletude - avgCompletude
  };
};

// Função para construir prompt contextual
const buildDebriefingPrompt = (weekData, habitData, userResponses, allWeeklyData = null) => {
  console.log('🔍 Debug buildDebriefingPrompt:', { weekData, habitData, userResponses });
  
  const weekStart = new Date(weekData.weekStart);
  const weekEnd = new Date(weekData.weekEnd);
  
  // Verificar se habitData existe e tem o formato correto
  if (!habitData || typeof habitData !== 'object') {
    console.warn('⚠️ habitData inválido:', habitData);
    habitData = {};
  }

  // Processar dados no formato real: { "2025-07-20": { meditar: true, exercitar: false } }
  const habitPerformance = processHabitDataByDay(habitData, weekData.weekStart, weekData.weekEnd);
  const additionalData = extractAdditionalData(habitData, weekData.weekStart, weekData.weekEnd);
  
  // Processar comparação histórica se disponível
  const historicalData = allWeeklyData ? processHistoricalComparison(allWeeklyData, weekData.weekStart) : null;
  
  const totalHabits = habitPerformance.length;
  const completedDays = habitPerformance.reduce((total, habit) => total + habit.completedDays, 0);
  const totalPossibleDays = totalHabits * 7;
  const completionRate = totalPossibleDays > 0 ? Math.round((completedDays / totalPossibleDays) * 100) : 0;

  // Identificar melhores e piores hábitos
  const bestHabit = habitPerformance.length > 0 ? 
    habitPerformance.reduce((best, current) => 
      current.percentage > best.percentage ? current : best, habitPerformance[0]) : 
    { name: 'N/A', emoji: '', percentage: 0 };
  
  const worstHabit = habitPerformance.length > 0 ?
    habitPerformance.reduce((worst, current) => 
      current.percentage < worst.percentage ? current : worst, habitPerformance[0]) :
    { name: 'N/A', emoji: '', percentage: 0 };

  const prompt = `
Você é um coach de hábitos especializado em análise comportamental. Analise esta semana de hábitos e forneça insights personalizados:

📅 **PERÍODO**: ${weekStart.toLocaleDateString('pt-BR')} - ${weekEnd.toLocaleDateString('pt-BR')}

📊 **ESTATÍSTICAS GERAIS**:
- Taxa de completude geral: ${completionRate}%
- Total de hábitos: ${totalHabits}
- Total de dias completados: ${completedDays}/${totalPossibleDays}

🎯 **PERFORMANCE POR HÁBITO**:
${habitPerformance.length > 0 ? 
  habitPerformance.map(habit => 
    `- ${habit.emoji} ${habit.name}: ${habit.completedDays}/7 dias (${habit.percentage}%)`
  ).join('\n') : 
  '- Nenhum dado de hábito disponível para esta semana'
}

${habitPerformance.length > 0 ? `
🏆 **DESTAQUE**: ${bestHabit.emoji} ${bestHabit.name} foi o melhor hábito (${bestHabit.percentage}%)
⚠️ **ATENÇÃO**: ${worstHabit.emoji} ${worstHabit.name} precisa de mais foco (${worstHabit.percentage}%)
` : ''}

${userResponses.habitComments ? `
💭 **COMENTÁRIOS DO USUÁRIO**:
${Object.entries(userResponses.habitComments).map(([habit, comment]) => 
  comment ? `- ${habit}: "${comment}"` : ''
).filter(Boolean).join('\n')}
` : ''}

${userResponses.proudOf ? `🌟 **O que foi bem**: "${userResponses.proudOf}"` : ''}
${userResponses.notSoGood ? `🤔 **Desafios**: "${userResponses.notSoGood}"` : ''}
${userResponses.improveNext ? `🚀 **Planos**: "${userResponses.improveNext}"` : ''}

${additionalData.weightData.length > 0 ? `
⚖️ **DADOS DE PESO**:
${additionalData.weightData.map(w => `- ${w.date}: ${w.weight}kg`).join('\n')}
` : ''}

${additionalData.sentiments.length > 0 ? `
😊 **SENTIMENTOS DA SEMANA**:
${additionalData.sentiments.map(s => `- ${s.date}: ${s.sentiment}`).join('\n')}
` : ''}

${additionalData.observations.length > 0 ? `
📝 **OBSERVAÇÕES DIÁRIAS**:
${additionalData.observations.map(o => `- ${o.date}: "${o.observation}"`).join('\n')}
` : ''}

**INSTRUÇÕES**: 
Forneça um feedback estruturado em português, positivo e construtivo seguindo EXATAMENTE este formato:

## 🎉 Parabéns!
[O que foi bem feito esta semana - cite dados específicos e use emojis relevantes no texto 🎯✨]

## 🔍 Insights Identificados
[4-6 insights detalhados baseados nos dados, sempre citando a fonte e usando emojis no texto:]
- **Insight sobre hábitos:** [observação com emojis 💪🏃‍♀️🧘] *(baseado na performance: X/7 dias)*
- **Insight sobre peso:** [observação com emojis ⚖️📈📉] *(baseado nos dados: Xkg→Ykg)*  
- **Insight comportamental:** [observação com emojis 🤔💭🔄] *(baseado na observação: "texto")*
- **Insight emocional:** [observação com emojis 😊😰🌟] *(baseado no sentimento: X)*

${historicalData ? `
## 📊 Comparação com Semanas Anteriores
[Análise comparativa detalhada com as últimas ${historicalData.weekCount} semanas, usando emojis 📈📉🔄:]
- **Performance geral:** ${completionRate}% esta semana vs ${historicalData.avgCompletude}% média histórica *(${historicalData.trend}: ${historicalData.difference > 0 ? '+' : ''}${historicalData.difference}% de diferença)*
- **Tendência identificada:** [análise da tendência com emojis 🚀📉⚡]
- **Padrões observados:** [padrões comportamentais com emojis 🔍💡📅]
` : ''}

## 💡 Sugestões Práticas
[3-4 ações específicas e detalhadas para melhorar, cada uma com emojis relevantes 🎯⏰💪]

## 🚀 Motivação
[Mensagem encorajadora para próxima semana com emojis motivacionais 💪🌟✨🔥]

IMPORTANTE: 
- SEMPRE use emojis relevantes dentro do texto para torná-lo mais visual e engajador
- Sempre cite a fonte dos dados entre parênteses
- Limite: 1000 palavras, tom amigável e detalhado
- Use encoding UTF-8 para emojis aparecerem corretamente`;

  return prompt;
};

// Função para gerar sugestões de comentários para hábitos
export const generateHabitSuggestions = async (habitName, performanceData) => {
  try {
    const prompt = `
Como coach de hábitos, sugira 3 comentários reflexivos (máximo 20 palavras cada) para o hábito "${habitName}" baseado nesta performance:

Dias completados esta semana: ${performanceData.completedDays}/7
Porcentagem: ${performanceData.percentage}%
Tendência: ${performanceData.trend || 'estável'}

Formate como lista simples:
- Sugestão 1
- Sugestão 2  
- Sugestão 3

Seja específico, construtivo e focado em ações práticas.`;

    const response = await fetch(`${AI_BASE_URL}/api/claude`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    
    // Extrair sugestões da resposta
    const suggestions = data.response
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .slice(0, 3);

    return {
      success: true,
      suggestions,
      habitName
    };

  } catch (error) {
    console.error('❌ Erro ao gerar sugestões:', error);
    return {
      success: false,
      error: error.message,
      suggestions: [
        'Reflita sobre os obstáculos enfrentados',
        'Identifique o que funcionou bem',
        'Planeje ajustes para a próxima semana'
      ]
    };
  }
};

export default {
  generateDebriefingInsights,
  generateHabitSuggestions
};