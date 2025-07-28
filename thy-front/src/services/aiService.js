// src/services/aiService.js - Serviço para integração com IA
const AI_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:3001';

// Função para gerar insights inteligentes de debriefing
export const generateDebriefingInsights = async (weekData, habitData, userResponses = {}) => {
  try {
    console.log('🤖 Gerando insights de debriefing...', { weekData, habitData });

    // Construir prompt contextual
    const prompt = buildDebriefingPrompt(weekData, habitData, userResponses);
    
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
    console.log('✅ Insights gerados:', data);

    return {
      success: true,
      insights: data.response,
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

// Função para construir prompt contextual
const buildDebriefingPrompt = (weekData, habitData, userResponses) => {
  console.log('🔍 Debug buildDebriefingPrompt:', { weekData, habitData, userResponses });
  
  const weekStart = new Date(weekData.weekStart);
  const weekEnd = new Date(weekData.weekEnd);
  
  // Verificar se habitData existe e tem o formato correto
  if (!habitData || typeof habitData !== 'object') {
    console.warn('⚠️ habitData inválido:', habitData);
    habitData = {};
  }
  
  // Calcular estatísticas da semana
  const totalHabits = Object.keys(habitData).length;
  const completedDays = Object.values(habitData).reduce((total, habit) => {
    // Verificar se habit existe e tem completedDays
    if (!habit || !habit.completedDays || !Array.isArray(habit.completedDays)) {
      console.warn('⚠️ Habit inválido:', habit);
      return total;
    }
    
    return total + habit.completedDays.filter(date => 
      date >= weekData.weekStart && date <= weekData.weekEnd
    ).length;
  }, 0);
  
  const totalPossibleDays = totalHabits * 7;
  const completionRate = Math.round((completedDays / totalPossibleDays) * 100);

  // Analisar performance por hábito
  const habitPerformance = Object.entries(habitData).map(([habitId, habit]) => {
    // Verificar se habit existe e tem completedDays
    if (!habit || !habit.completedDays || !Array.isArray(habit.completedDays)) {
      return {
        name: habitId,
        emoji: '',
        completedDays: 0,
        percentage: 0
      };
    }
    
    const weekDays = habit.completedDays.filter(date => 
      date >= weekData.weekStart && date <= weekData.weekEnd
    ).length;
    
    return {
      name: habit.name || habitId,
      emoji: habit.emoji || '',
      completedDays: weekDays,
      percentage: Math.round((weekDays / 7) * 100)
    };
  });

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

**INSTRUÇÕES**: 
Forneça um feedback em português, positivo e construtivo com:
1. **Parabéns** pelo que foi bem feito
2. **Insights** sobre padrões identificados  
3. **Sugestões práticas** para melhorar
4. **Motivação** para a próxima semana

Limite: 200 palavras, tom amigável e encorajador.`;

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