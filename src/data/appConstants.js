// data/constants.js
// Constantes do projeto (cores, escalas de avaliação, configurações)

// Escalas de avaliação para classificação
export const EVALUATION_SCALES = {
    // Escala para completude geral (mais exigente)
    general: {
      excellent: { min: 70, label: 'Excelente', emoji: '🤩' },
      veryGood: { min: 60, label: 'Muito bom', emoji: '😊' },
      good: { min: 50, label: 'Bom', emoji: '🙂' },
      ok: { min: 40, label: 'Legal', emoji: '😐' },
      poor: { min: 0, label: 'Ruim', emoji: '😞' }
    },
    
    // Escala para hábitos individuais (menos exigente)
    habit: {
      excellent: { min: 60, label: 'Excelente', emoji: '🤩' },
      good: { min: 50, label: 'Bom', emoji: '😊' },
      ok: { min: 40, label: 'Legal', emoji: '🙂' },
      fair: { min: 20, label: 'Ok', emoji: '😐' },
      poor: { min: 0, label: 'Ruim', emoji: '😞' }
    }
  };
  
  // Cores padrão para diferentes elementos
  export const COLORS = {
    // Cores principais
    primary: '#2563eb',      // Azul
    secondary: '#10b981',    // Verde
    accent: '#f59e0b',       // Laranja
    warning: '#ef4444',      // Vermelho
    info: '#8b5cf6',         // Roxo
    success: '#06b6d4',      // Ciano
    light: '#84cc16',        // Verde claro
    
    // Cores para gráficos
    chart: {
      line: '#2563eb',
      lineActive: '#1d4ed8',
      weight: '#f59e0b',
      weightActive: '#d97706'
    },
    
    // Cores para métricas
    metrics: {
      general: '#2563eb',      // Azul para média geral
      active: '#10b981',       // Verde para % ativas
      average: '#8b5cf6'       // Roxo para média ativas
    },
    
    // Cores para backgrounds de insights
    backgrounds: {
      blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700' },
      green: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700' },
      red: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700' }
    }
  };
  
  // Configurações de gráficos
  export const CHART_CONFIG = {
    // Configurações comuns para todos os gráficos
    common: {
      height: 256, // h-64 em pixels
      fontSize: {
        xAxis: 9,
        yAxis: 10
      },
      strokeWidth: 2,
      dotRadius: 3,
      activeDotRadius: 5
    },
    
    // Configurações específicas por tipo
    completion: {
      domain: [0, 100],
      strokeDasharray: "3 3"
    },
    
    weight: {
      domain: [80, 90],
      strokeDasharray: "3 3"
    },
    
    habits: {
      height: 160, // h-40 em pixels
      domain: [0, 100],
      barRadius: [2, 2, 0, 0]
    }
  };
  
  // Mensagens padrão para diferentes estados
  export const MESSAGES = {
    loading: 'Carregando dados...',
    noData: 'Nenhum dado disponível',
    error: 'Erro ao carregar dados',
    
    // Mensagens de insights
    insights: {
      weightLoss: 'Progresso consistente!',
      weightGain: 'Pequena oscilação - normal no processo!',
      noChange: 'Peso estável neste período',
      
      completionLow: 'Foco na consistência pode ajudar',
      completionGood: 'Bom progresso, continue assim!',
      completionExcellent: 'Performance excelente!'
    }
  };
  
  // Configurações de formatação
  export const FORMATS = {
    percentage: {
      decimals: 1,
      suffix: '%'
    },
    
    weight: {
      decimals: 1,
      suffix: 'kg'
    },
    
    date: {
      format: 'DD/MM' // formato brasileiro
    }
  };
  
  // Limites e thresholds importantes
  export const THRESHOLDS = {
    // Para considerar uma semana "ativa"
    activeWeek: 1, // > 0% de completude
    
    // Para considerações de peso
    weightChange: {
      significant: 0.5, // mudanças > 0.5kg são significativas
      concerning: 2.0   // mudanças > 2kg precisam atenção
    },
    
    // Para streaks e padrões
    streak: {
      minimum: 2, // mínimo para considerar um streak
      good: 4,    // streak considerado bom
      excellent: 6 // streak excelente
    }
  };