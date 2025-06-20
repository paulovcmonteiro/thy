// data/calculations.js
// Todas as funções de cálculo de métricas

// Calcula as 3 métricas principais para qualquer conjunto de dados
export const calculateMetrics = (data, valueKey = 'completude') => {
    if (!data || data.length === 0) return { avgGeneral: 0, percentActive: 0, avgActive: 0 };
    
    const total = data.length;
    const activeData = data.filter(item => item[valueKey] > 0);
    const activeCount = activeData.length;
    
    const avgGeneral = data.reduce((sum, item) => sum + item[valueKey], 0) / total;
    const percentActive = (activeCount / total) * 100;
    const avgActive = activeCount > 0 
      ? activeData.reduce((sum, item) => sum + item[valueKey], 0) / activeCount 
      : 0;
    
    return {
      avgGeneral: Number(avgGeneral.toFixed(1)),
      percentActive: Number(percentActive.toFixed(1)),
      avgActive: Number(avgActive.toFixed(1))
    };
  };
  
  // Calcula métricas específicas para dados de completude geral
  export const calculateCompletionMetrics = (weeklyCompletionData) => {
    return calculateMetrics(weeklyCompletionData, 'completude');
  };
  
  // Calcula métricas para um hábito específico
  export const calculateHabitMetrics = (habitData) => {
    return calculateMetrics(habitData, 'valor');
  };
  
  // Calcula classificação baseada na média geral de um hábito
  export const getHabitClassification = (avgGeneral) => {
    if (avgGeneral >= 60) return { label: 'Excelente', emoji: '🤩' };
    if (avgGeneral >= 50) return { label: 'Bom', emoji: '😊' };
    if (avgGeneral >= 40) return { label: 'Legal', emoji: '🙂' };
    if (avgGeneral >= 20) return { label: 'Ok', emoji: '😐' };
    return { label: 'Ruim', emoji: '😞' };
  };
  
  // Calcula classificação para completude geral (mais exigente)
  export const getGeneralClassification = (avgGeneral) => {
    if (avgGeneral >= 70) return { label: 'Excelente', emoji: '🤩' };
    if (avgGeneral >= 60) return { label: 'Muito bom', emoji: '😊' };
    if (avgGeneral >= 50) return { label: 'Bom', emoji: '🙂' };
    if (avgGeneral >= 40) return { label: 'Legal', emoji: '😐' };
    return { label: 'Ruim', emoji: '😞' };
  };
  
  // Encontra a melhor semana
  export const getBestWeek = (weeklyCompletionData) => {
    return weeklyCompletionData.reduce((best, current) => 
      current.completude > best.completude ? current : best
    );
  };
  
  // Calcula média das últimas N semanas
  export const getRecentAverage = (weeklyCompletionData, weekCount = 5) => {
    const recentWeeks = weeklyCompletionData.slice(-weekCount);
    return recentWeeks.reduce((sum, week) => sum + week.completude, 0) / recentWeeks.length;
  };
  
  // Calcula tendência de peso (primeiro vs último peso registrado)
  export const getWeightTrend = (weightData) => {
    if (!weightData || weightData.length < 2) return { trend: 0, firstWeight: 0, lastWeight: 0 };
    
    const firstWeight = weightData[0].peso;
    const lastWeight = weightData[weightData.length - 1].peso;
    const trend = lastWeight - firstWeight;
    
    return {
      trend: Number(trend.toFixed(1)),
      firstWeight,
      lastWeight
    };
  }