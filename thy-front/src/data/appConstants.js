// data/appConstants.js
// Constantes do projeto (cores atualizadas para #4682B4, escalas de avaliação, configurações)

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
  // Cores principais - ATUALIZADO PARA #4682B4
  primary: '#4682B4',         // Novo azul principal
  secondary: '#10b981',       // Verde
  accent: '#f59e0b',          // Laranja
  warning: '#ef4444',         // Vermelho
  info: '#8b5cf6',            // Roxo
  success: '#06b6d4',         // Ciano
  light: '#84cc16',           // Verde claro
  
  // Cores para gráficos
  chart: {
    line: '#4682B4',          // Novo azul para linha principal
    lineActive: '#3a6d99',    // Azul mais escuro para hover
    weight: '#f59e0b',
    weightActive: '#d97706'
  },
  
  // Cores para métricas
  metrics: {
    general: '#4682B4',       // Novo azul para média geral
    active: '#10b981',        // Verde para % ativas
    average: '#8b5cf6'        // Roxo para média ativas
  },
  
  // Cores para backgrounds de insights
  backgrounds: {
    blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700' },
    green: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700' },
    red: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-500', text: 'text-gray-700' }
  }
};

// Configurações de formatação
export const FORMAT_SETTINGS = {
  // Configurações de data
  dateFormats: {
    display: 'dd/MM/yyyy',        // Para exibição
    storage: 'yyyy-MM-dd',        // Para armazenamento
    chart: 'dd/MM'                // Para gráficos
  },
  
  // Configurações numéricas
  numbers: {
    decimal: 1,                   // Casas decimais padrão
    percentage: 1                 // Casas decimais para percentuais
  }
};

// Lista de hábitos com configurações
export const HABITS_CONFIG = {
  meditar: { emoji: '🧘', label: 'Meditar', color: '#8b5cf6' },
  medicar: {
    emoji: '💊',
    label: 'Medicar',
    color: '#ef4444',
    constraint: 'once-per-week',
    maxPerWeek: 1
  },
  exercitar: { emoji: '🏃', label: 'Exercitar', color: '#10b981' },
  comunicar: {
    emoji: '💬',
    label: 'Comunicar',
    color: '#4682B4',
    constraint: 'once-per-week',
    maxPerWeek: 1
  },
  alimentar: { emoji: '🍎', label: 'Alimentar', color: '#84cc16' },
  estudar: { emoji: '📚', label: 'Estudar', color: '#f59e0b' },
  descansar: { emoji: '😴', label: 'Descansar', color: '#06b6d4' }
};

// Limites e configurações de validação
export const VALIDATION_LIMITS = {
  peso: { min: 0, max: 200 },
  obs: { maxLength: 500 },
  semanas: { min: 1, max: 52 }
};

// Configurações de UI
export const UI_SETTINGS = {
  // Tamanhos de tela para responsividade
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  },
  
  // Animações
  animations: {
    duration: 200,              // Duração padrão das transições (ms)
    easing: 'ease-in-out'       // Tipo de easing
  }
};