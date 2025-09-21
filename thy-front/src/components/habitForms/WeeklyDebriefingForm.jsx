// components/habitForms/WeeklyDebriefingForm.jsx - DEBRIEFING SEMANAL COM 3 PÁGINAS - UX MOBILE MELHORADA
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, AlertCircle, Clock, Star, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import useDashboardData from '../../hooks/useDashboardData';
import { getGeneralClassification, getHabitClassification } from '../../data/metricsCalculations';
import { COLORS } from '../../data/appConstants';
import { 
  saveDebriefing, 
  getDebriefing, 
  completeDebriefing, 
  getWeekSaturday 
} from '../../firebase/debriefingService';
import DebriefingWeekSelector from './DebriefingWeekSelector';
import WeekTable from '../common/WeekTable';

const WeeklyDebriefingForm = ({ isOpen, onClose }) => {
  const { data } = useDashboardData();

  // Estados principais
  const [currentPage, setCurrentPage] = useState(1); // 1, 2 ou 3
  const [selectedWeek, setSelectedWeek] = useState('');
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    // Página 2: Comentários por hábito
    habitComments: {},
    
    // Página 3: Reflexão final
    weekRating: null,
    proudOf: '',
    notSoGood: '',
    improveNext: ''
  });

  // Estados de controle
  const [saveStatus, setSaveStatus] = useState('idle');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Lista de hábitos
  const habitsList = [
    { key: 'meditar', label: '🧘 Meditar', description: 'Meditação ou mindfulness' },
    { key: 'medicar', label: '💊 Medicar', description: 'Tomar medicamentos' },
    { key: 'exercitar', label: '🏃 Exercitar', description: 'Atividade física' },
    { key: 'comunicar', label: '💬 Comunicar', description: 'Comunicação importante' },
    { key: 'alimentar', label: '🍎 Alimentar', description: 'Alimentação saudável' },
    { key: 'estudar', label: '📚 Estudar', description: 'Estudos ou aprendizado' },
    { key: 'descansar', label: '😴 Descansar', description: 'Descanso adequado' }
  ];

  // 🆕 FUNÇÃO: Determinar semana default baseada no dia da semana
  const getDefaultWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=domingo, 1=segunda, ..., 6=sábado
    
    if (dayOfWeek === 6) {
      // É sábado -> usar semana atual
      const currentWeekSaturday = getWeekSaturday(today);
      console.log('📅 [WeeklyDebriefing] É sábado! Usando semana atual:', currentWeekSaturday);
      return currentWeekSaturday;
    } else {
      // Não é sábado -> usar semana anterior
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7); // 7 dias atrás
      const lastWeekSaturday = getWeekSaturday(lastWeek);
      console.log('📅 [WeeklyDebriefing] Não é sábado! Usando semana anterior:', lastWeekSaturday);
      return lastWeekSaturday;
    }
  };

  // Função para obter dados das últimas 4 semanas vs atual
  const getWeekComparison = () => {
    if (!data || !selectedWeek) {
      return { completudeData: [], weightData: [], currentWeek: null, last4Weeks: [] };
    }

    const allWeeks = data.weeklyCompletionData;
    const allWeights = data.weightData;
    
    // Encontrar índice da semana selecionada
    const selectedWeekIndex = allWeeks.findIndex(week => {
      const weekSaturday = convertSemanaToSaturday(week.semana);
      return weekSaturday === selectedWeek;
    });

    if (selectedWeekIndex === -1) {
      return { completudeData: [], weightData: [], currentWeek: null, last4Weeks: [] };
    }

    // Pegar 8 semanas anteriores + semana selecionada
    const startIndex = Math.max(0, selectedWeekIndex - 8);
    const endIndex = selectedWeekIndex + 1;
    const comparisonWeeks = allWeeks.slice(startIndex, endIndex);
    
    // Separar última semana das anteriores
    const currentWeek = comparisonWeeks[comparisonWeeks.length - 1];
    const last4Weeks = comparisonWeeks.slice(0, -1);

    // Preparar dados para gráficos
    const completudeData = comparisonWeeks.map((week, index) => ({
      semana: week.semana,
      completude: week.completude,
      isCurrentWeek: index === comparisonWeeks.length - 1
    }));

    // Dados de peso correspondentes
    const weightData = comparisonWeeks.map((week, index) => {
      const weightWeek = allWeights.find(w => w.semana === week.semana);
      return {
        semana: week.semana,
        peso: weightWeek?.peso || null,
        isCurrentWeek: index === comparisonWeeks.length - 1
      };
    }).filter(w => w.peso !== null);

    return { completudeData, weightData, currentWeek, last4Weeks };
  };

  // 🔧 CORREÇÃO: Função melhorada para converter semana
  const convertSemanaToSaturday = (semanaStr) => {
    try {
      const [day, month] = semanaStr.split('/');
      
      // Determinar ano correto baseado no mês
      let year = new Date().getFullYear();
      
      // Se o mês é dezembro e estamos em janeiro ou posterior, é do ano anterior
      if (parseInt(month) === 12 && new Date().getMonth() >= 0) {
        year = year - 1;
      }
      
      const date = new Date(year, parseInt(month) - 1, parseInt(day));
      return getWeekSaturday(date);
    } catch (error) {
      return null;
    }
  };

  // Obter dados de hábito específico para análise
  const getHabitData = (habitKey) => {
    if (!data || !selectedWeek) return { current: 0, average: 0, classification: null };

    const habitData = data.habitDataByType[habitKey]?.data || [];
    
    // Encontrar dados da semana selecionada
    const selectedWeekData = habitData.find(week => {
      const weekSaturday = convertSemanaToSaturday(week.semana);
      return weekSaturday === selectedWeek;
    });

    const currentValue = selectedWeekData?.valor || 0;

    // Calcular média das últimas 4 semanas
    const selectedIndex = habitData.findIndex(week => {
      const weekSaturday = convertSemanaToSaturday(week.semana);
      return weekSaturday === selectedWeek;
    });

    let averageValue = 0;
    if (selectedIndex > 0) {
      const startIndex = Math.max(0, selectedIndex - 8);
      const previousWeeks = habitData.slice(startIndex, selectedIndex);
      averageValue = previousWeeks.reduce((sum, week) => sum + week.valor, 0) / previousWeeks.length;
    }

    const classification = getHabitClassification(currentValue);

    return {
      current: currentValue,
      average: averageValue,
      classification
    };
  };

  // Auto-save com debounce
  const performAutoSave = useCallback(async (dataToSave) => {
    if (!selectedWeek || !hasLoadedData) return;

    try {
      setSaveStatus('saving');
      console.log('💾 [WeeklyDebriefing] Auto-salvando...', selectedWeek);

      const result = await saveDebriefing(selectedWeek, dataToSave);
      
      if (result.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
      
    } catch (error) {
      setSaveStatus('error');
      console.error('❌ [WeeklyDebriefing] Erro no auto-save:', error);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [selectedWeek, hasLoadedData]);

  // Trigger auto-save com debounce
  const triggerAutoSave = useCallback((newFormData) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeoutId = setTimeout(() => {
      performAutoSave(newFormData);
    }, 1500);

    setAutoSaveTimeout(timeoutId);
  }, [autoSaveTimeout, performAutoSave]);

  // Handle mudanças no formulário
  const handleInputChange = (field, value, habitKey = null) => {
    let newFormData;
    
    if (habitKey) {
      // Comentário de hábito específico
      newFormData = {
        ...formData,
        habitComments: {
          ...formData.habitComments,
          [habitKey]: value
        }
      };
    } else {
      // Campo geral
      newFormData = {
        ...formData,
        [field]: value
      };
    }
    
    setFormData(newFormData);
    triggerAutoSave(newFormData);
  };

  // Carregar dados do debriefing
  const loadDebriefingData = useCallback(async (weekDate) => {
    try {
      console.log('🔄 [WeeklyDebriefing] Carregando dados para semana:', weekDate);
      
      const result = await getDebriefing(weekDate);
      
      if (result.success && result.data) {
        const debriefingData = result.data;
        setFormData({
          habitComments: debriefingData.habitComments || {},
          weekRating: debriefingData.weekRating || null,
          proudOf: debriefingData.proudOf || '',
          notSoGood: debriefingData.notSoGood || '',
          improveNext: debriefingData.improveNext || ''
        });
        console.log('✅ [WeeklyDebriefing] Dados carregados');
      } else {
        // Resetar formulário para nova semana
        setFormData({
          habitComments: {},
          weekRating: null,
          proudOf: '',
          notSoGood: '',
          improveNext: ''
        });
        console.log('ℹ️ [WeeklyDebriefing] Nova semana, formulário resetado');
      }
      
      setHasLoadedData(true);
      
    } catch (error) {
      console.error('❌ [WeeklyDebriefing] Erro ao carregar dados:', error);
      setHasLoadedData(true);
    }
  }, []);

  // Finalizar debriefing
  const handleComplete = async () => {
    try {
      // Salvar dados finais
      await performAutoSave({
        ...formData,
        status: 'completed'
      });
      
      // Finalizar debriefing
      const result = await completeDebriefing(selectedWeek);
      
      if (result.success) {
        alert('✅ Debriefing finalizado com sucesso!');
        onClose();
      } else {
        alert('❌ Erro ao finalizar debriefing: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ [WeeklyDebriefing] Erro ao finalizar:', error);
      alert('❌ Erro inesperado ao finalizar debriefing');
    }
  };

  // Navegação entre páginas
  const goToPage = (page) => {
    if (page >= 1 && page <= 3) {
      setCurrentPage(page);
    }
  };

  // 🔧 CORREÇÃO: Inicializar com semana default baseada no dia da semana
  useEffect(() => {
    if (isOpen) {
      const defaultWeek = getDefaultWeek(); // Usar lógica de semana default
      setSelectedWeek(defaultWeek);
      setCurrentPage(1);
      setHasLoadedData(false);
    }
  }, [isOpen]);

  // Carregar dados quando semana mudar
  useEffect(() => {
    if (selectedWeek && isOpen) {
      loadDebriefingData(selectedWeek);
    }
  }, [selectedWeek, isOpen, loadDebriefingData]);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Fechar modal
  const handleClose = () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    setCurrentPage(1);
    setSelectedWeek('');
    setFormData({
      habitComments: {},
      weekRating: null,
      proudOf: '',
      notSoGood: '',
      improveNext: ''
    });
    setHasLoadedData(false);
    setSaveStatus('idle');
    onClose();
  };

  // Componente do indicador de status
  const SaveStatusIndicator = () => {
    const statusConfig = {
      idle: { icon: null, text: '', color: '' },
      saving: { 
        icon: <Clock size={16} className="animate-spin" />, 
        text: 'Salvando...', 
        color: 'text-blue-600' 
      },
      saved: { 
        icon: <Check size={16} />, 
        text: 'Salvo automaticamente', 
        color: 'text-green-600' 
      },
      error: { 
        icon: <AlertCircle size={16} />, 
        text: 'Erro ao salvar', 
        color: 'text-red-600' 
      }
    };

    const config = statusConfig[saveStatus];
    
    if (saveStatus === 'idle') return null;

    return (
      <div className={`flex items-center gap-2 text-sm ${config.color} bg-white px-3 py-1 rounded-full shadow-sm border`}>
        {config.icon}
        <span>{config.text}</span>
      </div>
    );
  };

  if (!isOpen) return null;

  const { completudeData, weightData, currentWeek, last4Weeks } = getWeekComparison();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Debriefing da Semana</h2>
            
            {/* Seletor de semana */}
            <div className="max-w-xs">
              <DebriefingWeekSelector 
                selectedWeek={selectedWeek}
                onWeekChange={setSelectedWeek}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <SaveStatusIndicator />
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Conteúdo das páginas */}
        <div className="p-6">
          
          {/* PÁGINA 1: Visão Geral */}
          {currentPage === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 Visão Geral da Semana</h3>
              
              {/* Gráficos lado a lado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Gráfico de Completude */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4">Completude de Hábitos</h4>
                  
                  {completudeData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={completudeData}>
                          <XAxis dataKey="semana" fontSize={12} />
                          <YAxis domain={[0, 100]} fontSize={12} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Completude']} />
                          <Line 
                            type="monotone" 
                            dataKey="completude" 
                            stroke={COLORS.primary}
                            strokeWidth={3}
                            dot={(props) => {
                              const isCurrentWeek = completudeData[props.payload?.index]?.isCurrentWeek;
                              return (
                                <circle
                                  cx={props.cx}
                                  cy={props.cy}
                                  r={isCurrentWeek ? 8 : 5}
                                  fill={isCurrentWeek ? COLORS.warning : COLORS.primary}
                                  stroke={isCurrentWeek ? COLORS.warning : COLORS.primary}
                                  strokeWidth={2}
                                />
                              );
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Dados insuficientes
                    </div>
                  )}

                  {/* Observação automática de completude */}
                  {currentWeek && last4Weeks.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-100 rounded border-l-4 border-blue-500">
                      <p className="text-sm text-blue-800">
                        <strong>Análise:</strong> {(() => {
                          const current = currentWeek.completude;
                          const avg = last4Weeks.reduce((sum, w) => sum + w.completude, 0) / last4Weeks.length;
                          const classification = getGeneralClassification(current);
                          const diff = current - avg;
                          
                          if (diff > 5) {
                            return `Excelente! ${classification.emoji} Melhora significativa de ${diff.toFixed(1)}pp.`;
                          } else if (diff > 0) {
                            return `Progresso! ${classification.emoji} Leve melhora de ${diff.toFixed(1)}pp.`;
                          } else if (diff < -5) {
                            return `Semana desafiadora. ${classification.emoji} Queda de ${Math.abs(diff).toFixed(1)}pp.`;
                          } else {
                            return `Performance estável. ${classification.emoji} Variação de ${diff.toFixed(1)}pp.`;
                          }
                        })()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Gráfico de Peso */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-orange-800 mb-4">Evolução do Peso</h4>
                  
                  {weightData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightData}>
                          <XAxis dataKey="semana" fontSize={12} />
                          <YAxis domain={[75, 85]} fontSize={12} />
                          <Tooltip formatter={(value) => [`${value}kg`, 'Peso']} />
                          <Line 
                            type="monotone" 
                            dataKey="peso" 
                            stroke={COLORS.chart.weight}
                            strokeWidth={3}
                            dot={(props) => {
                              const isCurrentWeek = weightData[props.payload?.index]?.isCurrentWeek;
                              return (
                                <circle
                                  cx={props.cx}
                                  cy={props.cy}
                                  r={isCurrentWeek ? 8 : 5}
                                  fill={isCurrentWeek ? COLORS.warning : COLORS.chart.weight}
                                  stroke={isCurrentWeek ? COLORS.warning : COLORS.chart.weight}
                                  strokeWidth={2}
                                />
                              );
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Dados de peso insuficientes
                    </div>
                  )}

                  {/* Observação automática de peso */}
                  {weightData.length >= 2 && (
                    <div className="mt-4 p-3 bg-orange-100 rounded border-l-4 border-orange-500">
                      <p className="text-sm text-orange-800">
                        <strong>Análise:</strong> {(() => {
                          const currentWeight = weightData[weightData.length - 1].peso;
                          const previousWeights = weightData.slice(0, -1);
                          const avgPrevious = previousWeights.reduce((sum, w) => sum + w.peso, 0) / previousWeights.length;
                          const diff = currentWeight - avgPrevious;
                          
                          if (diff < -0.5) {
                            return `🎯 Redução de ${Math.abs(diff).toFixed(1)}kg! Tendência positiva.`;
                          } else if (diff > 0.5) {
                            return `📈 Aumento de ${diff.toFixed(1)}kg. Variação normal.`;
                          } else {
                            return `⚖️ Peso estável (${Math.abs(diff).toFixed(1)}kg de variação).`;
                          }
                        })()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PÁGINA 2: Análise por Hábito */}
          {currentPage === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🎯 Análise por Hábito</h3>
              
              {/* Tabela da semana - DESKTOP ONLY */}
              <div className="hidden lg:block mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Visão Geral da Semana</h4>
                  {selectedWeek && data && (
                    <WeekTable 
                      weekData={data}
                      title={`Semana de ${new Date(selectedWeek).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`}
                      showTitle={false}
                    />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habitsList.map(habit => {
                  const habitData = getHabitData(habit.key);
                  
                  return (
                    <div key={habit.key} className="bg-gray-50 rounded-lg p-4 border">
                      
                      {/* Header do hábito */}
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">
                          {habit.label}
                        </h4>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-600">
                            {habitData.current}%
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            {habitData.classification?.emoji}
                          </span>
                        </div>
                      </div>

                      {/* Observação automática */}
                      <div className="mb-3 p-2 bg-white rounded border text-sm">
                        <strong>Status:</strong> {habitData.classification?.label || 'N/A'} {habitData.classification?.emoji}
                        {habitData.average > 0 && (
                          <>
                            <br />
                            <strong>vs Média anterior:</strong> {
                              habitData.current > habitData.average + 5 ? '📈 Muito melhor' :
                              habitData.current > habitData.average ? '↗️ Melhor' :
                              habitData.current < habitData.average - 5 ? '📉 Abaixo' :
                              '➡️ Similar'
                            } ({habitData.average.toFixed(1)}%)
                          </>
                        )}
                      </div>

                      {/* Campo de comentário */}
                      <textarea
                        value={formData.habitComments[habit.key] || ''}
                        onChange={(e) => handleInputChange('habitComments', e.target.value, habit.key)}
                        placeholder={`Como foi ${habit.label.toLowerCase()} nesta semana?`}
                        className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PÁGINA 3: Reflexão Final */}
          {currentPage === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">✨ Reflexão Final</h3>
              
              {/* Nota da semana - MELHORADA PARA MOBILE */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border">
                <h4 className="font-semibold text-gray-800 mb-6 flex items-center justify-center gap-2 text-xl">
                  <Star className="text-yellow-500" size={24} />
                  Que nota você dá para esta semana?
                </h4>
                
                {/* DESKTOP: Layout original */}
                <div className="hidden md:flex items-center justify-center gap-4">
                  {[
                    { rating: 1, emoji: '😞', label: 'Muito ruim' },
                    { rating: 2, emoji: '😕', label: 'Ruim' },
                    { rating: 3, emoji: '😐', label: 'Satisfatório' },
                    { rating: 4, emoji: '😊', label: 'Bom' },
                    { rating: 5, emoji: '🤩', label: 'Muito bom!' }
                  ].map(option => (
                    <button
                      key={option.rating}
                      onClick={() => handleInputChange('weekRating', option.rating)}
                      className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 min-w-[100px] ${
                        formData.weekRating === option.rating
                          ? 'bg-purple-100 border-purple-500 scale-105 shadow-lg'
                          : 'bg-white border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{option.emoji}</div>
                      <div className="text-sm font-medium text-gray-700 text-center">{option.label}</div>
                      <div className="text-lg font-bold text-purple-600 mt-1">{option.rating}</div>
                    </button>
                  ))}
                </div>

                {/* MOBILE: Layout simplificado - só emojis em linha */}
                <div className="flex md:hidden items-center justify-center gap-4">
                  {[
                    { rating: 1, emoji: '😞' },
                    { rating: 2, emoji: '😕' },
                    { rating: 3, emoji: '😐' },
                    { rating: 4, emoji: '😊' },
                    { rating: 5, emoji: '🤩' }
                  ].map(option => (
                    <button
                      key={option.rating}
                      onClick={() => handleInputChange('weekRating', option.rating)}
                      className={`flex items-center justify-center rounded-full transition-all duration-200 w-16 h-16 ${
                        formData.weekRating === option.rating
                          ? 'bg-purple-200 scale-110 shadow-lg'
                          : 'bg-gray-100 hover:bg-purple-100'
                      }`}
                    >
                      <div className="text-3xl">{option.emoji}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Três perguntas */}
              <div className="space-y-4">
                
                {/* O que me orgulho */}
                <div>
                  <label className="block font-semibold text-gray-800 mb-2">
                    🏆 O que me orgulho dessa semana?
                  </label>
                  <textarea
                    value={formData.proudOf}
                    onChange={(e) => handleInputChange('proudOf', e.target.value)}
                    placeholder="Conquistas, vitórias, momentos especiais..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* O que não foi tão bom */}
                <div>
                  <label className="block font-semibold text-gray-800 mb-2">
                    🤔 O que não foi tão bom essa semana?
                  </label>
                  <textarea
                    value={formData.notSoGood}
                    onChange={(e) => handleInputChange('notSoGood', e.target.value)}
                    placeholder="Desafios, dificuldades, o que poderia ter sido melhor..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* O que quero melhorar */}
                <div>
                  <label className="block font-semibold text-gray-800 mb-2">
                    🚀 O que quero melhorar para a semana seguinte?
                  </label>
                  <textarea
                    value={formData.improveNext}
                    onChange={(e) => handleInputChange('improveNext', e.target.value)}
                    placeholder="Ajustes, metas, focos para a próxima semana..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Botão de finalizar */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-800">Finalizar Debriefing</h4>
                    <p className="text-green-700 text-sm">
                      Marcar como completo e salvar todas as reflexões
                    </p>
                  </div>
                  <button
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Check size={20} />
                    Finalizar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer com navegação - MELHORADO PARA MOBILE */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          {/* Botão Anterior */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* DESKTOP: Com texto */}
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          
          {/* Indicador de página - SIMPLIFICADO */}
          <span className="text-gray-600 font-medium">
            {/* DESKTOP: Texto completo */}
            <span className="hidden sm:inline">Página {currentPage} de 3</span>
            {/* MOBILE: Formato curto */}
            <span className="sm:hidden">{currentPage}/3</span>
          </span>
          
          {/* Botão Próximo */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === 3}
            className="flex items-center gap-2 px-4 py-2 text-white bg-purple-600 border border-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* DESKTOP: Com texto */}
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyDebriefingForm;