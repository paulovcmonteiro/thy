// components/forms/AddDayForm.jsx - FORMULÁRIO COM AUTO-SAVE + HUMOR
import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Save, Check, AlertCircle, Clock } from 'lucide-react';
import { getDayHabits } from '../../firebase/habitsService';

const AddDayForm = ({ isOpen, onClose, addNewDay, refreshData }) => {

  // 🆕 FUNÇÃO: RECUPERAR ÚLTIMA DATA USADA
  const getInitialDate = () => {
    try {
      const savedDate = localStorage.getItem('habitTracker_lastUsedDate');
      const today = new Date().toISOString().split('T')[0];
      
      if (savedDate) {
        // Verificar se a data salva é válida e não é futura
        const savedDateObj = new Date(savedDate);
        const todayObj = new Date(today);
        
        if (!isNaN(savedDateObj.getTime()) && savedDateObj <= todayObj) {
          console.log('📅 [AddDayForm] Recuperando última data usada:', savedDate);
          return savedDate;
        }
      }
      
      console.log('📅 [AddDayForm] Usando data de hoje:', today);
      return today;
    } catch (error) {
      console.warn('⚠️ [AddDayForm] Erro ao recuperar última data, usando hoje');
      return new Date().toISOString().split('T')[0];
    }
  };

  const today = new Date().toISOString().split('T')[0]; // "2025-06-22"
  const todayFormatted = new Date().toLocaleDateString('pt-BR'); // "22/06/2025"
  const initialDate = getInitialDate(); // Data inicial (última usada ou hoje)

  // Estado do formulário - ADICIONADO: humor
  const [formData, setFormData] = useState({
    date: initialDate,
    peso: '',
    meditar: false,
    medicar: false,
    exercitar: false,
    comunicar: false,
    alimentar: false,
    estudar: false,
    descansar: false,
    humor: '', // 🆕 NOVO CAMPO: 'ansioso', 'ok', 'produtivo'
    obs: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // 🆕 ESTADOS PARA AUTO-SAVE
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [hasLoadedExistingData, setHasLoadedExistingData] = useState(false);

  // Novo estado para controlar o passo do formulário mobile
  const [step, setStep] = useState(1);

  // Lista de hábitos com emojis
  const habitsList = [
    { key: 'meditar', label: '🧘 Meditar', description: 'Meditação ou mindfulness' },
    { key: 'medicar', label: '💊 Medicar', description: 'Tomar medicamentos' },
    { key: 'exercitar', label: '🏃 Exercitar', description: 'Atividade física' },
    { key: 'comunicar', label: '💬 Comunicar', description: 'Comunicação importante' },
    { key: 'alimentar', label: '🍎 Alimentar', description: 'Alimentação saudável' },
    { key: 'estudar', label: '📚 Estudar', description: 'Estudos ou aprendizado' },
    { key: 'descansar', label: '😴 Descansar', description: 'Descanso adequado' }
  ];

  // 🆕 OPÇÕES DE HUMOR COM EMOJIS
  const humorOptions = [
    { key: 'ansioso', emoji: '😰', label: 'Ansioso' },
    { key: 'ok', emoji: '😐', label: 'Ok' },
    { key: 'produtivo', emoji: '😊', label: 'Produtivo' }
  ];

  // 🆕 FUNÇÃO: SALVAR DATA NO LOCALSTORAGE
  const saveLastUsedDate = (dateISO) => {
    try {
      localStorage.setItem('habitTracker_lastUsedDate', dateISO);
      console.log('💾 [AddDayForm] Data salva no localStorage:', dateISO);
    } catch (error) {
      console.warn('⚠️ [AddDayForm] Erro ao salvar data no localStorage:', error);
    }
  };

  // 🆕 FUNÇÃO: CARREGAR DADOS EXISTENTES DO DIA
  const loadExistingDay = useCallback(async (dateISO) => {
    try {
      console.log('🔄 [AddDayForm] Carregando dados existentes para:', dateISO);
      
      const result = await getDayHabits(dateISO);
      
      if (result.success && result.data) {
        const existingData = result.data;
        console.log('✅ [AddDayForm] Dados encontrados:', existingData);
        
        // Carregar dados no formulário - INCLUINDO HUMOR
        setFormData({
          date: dateISO,
          peso: existingData.peso ? existingData.peso.toString() : '',
          meditar: Boolean(existingData.meditar),
          medicar: Boolean(existingData.medicar),
          exercitar: Boolean(existingData.exercitar),
          comunicar: Boolean(existingData.comunicar),
          alimentar: Boolean(existingData.alimentar),
          estudar: Boolean(existingData.estudar),
          descansar: Boolean(existingData.descansar),
          humor: existingData.humor || '', // 🆕 CARREGAR HUMOR
          obs: existingData.obs || ''
        });
        
        setHasLoadedExistingData(true);
        setSaveStatus('saved');
      } else {
        console.log('ℹ️ [AddDayForm] Nenhum dado existente para esta data');
        // Manter data, resetar resto
        setFormData(prev => ({
          date: dateISO,
          peso: '',
          meditar: false,
          medicar: false,
          exercitar: false,
          comunicar: false,
          alimentar: false,
          estudar: false,
          descansar: false,
          humor: '', // 🆕 RESETAR HUMOR
          obs: ''
        }));
        setHasLoadedExistingData(false);
        setSaveStatus('idle');
      }
    } catch (error) {
      console.error('❌ [AddDayForm] Erro ao carregar dados existentes:', error);
      setHasLoadedExistingData(false);
      setSaveStatus('error');
    }
  }, []);

  // 🔄 EFEITO: Carregar dados quando data muda
  useEffect(() => {
    if (isOpen && formData.date) {
      loadExistingDay(formData.date);
    }
  }, [isOpen, formData.date, loadExistingDay]);

  // 🆕 FUNÇÃO: AUTO-SAVE INTELIGENTE
  const triggerAutoSave = useCallback(async () => {
    // Só fazer auto-save se há dados significativos para salvar
    const hasHabitsData = habitsList.some(h => formData[h.key]);
    const hasWeightData = formData.peso && formData.peso.trim() !== '';
    const hasObsData = formData.obs && formData.obs.trim() !== '';
    const hasHumorData = formData.humor !== ''; // 🆕 VERIFICAR HUMOR
    
    if (!hasHabitsData && !hasWeightData && !hasObsData && !hasHumorData) {
      console.log('🤷 [AddDayForm] Nenhum dado significativo para auto-save');
      setSaveStatus('idle');
      return;
    }

    setSaveStatus('saving');

    try {
      const autoSaveData = {
        date: formData.date,
        peso: formData.peso ? Number(formData.peso) : null,
        meditar: Boolean(formData.meditar),
        medicar: Boolean(formData.medicar),
        exercitar: Boolean(formData.exercitar),
        comunicar: Boolean(formData.comunicar),
        alimentar: Boolean(formData.alimentar),
        estudar: Boolean(formData.estudar),
        descansar: Boolean(formData.descansar),
        humor: formData.humor, // 🆕 SALVAR HUMOR
        obs: formData.obs || ''
      };

      const result = await addNewDay(autoSaveData);
      
      if (result.success) {
        console.log('✅ [AddDayForm] Auto-save realizado com sucesso');
        setSaveStatus('saved');
        saveLastUsedDate(formData.date);
      } else {
        console.error('❌ [AddDayForm] Erro no auto-save:', result.error);
        setSaveStatus('error');
      }

    } catch (error) {
      console.error('❌ [AddDayForm] Erro inesperado no auto-save:', error);
      setSaveStatus('error');
    }
  }, [formData, addNewDay, habitsList]);

  // 🔄 MODIFICADO: Handle input changes com auto-save
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));

    // Cancelar auto-save anterior
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Agendar novo auto-save em 2 segundos
    const timeoutId = setTimeout(() => {
      triggerAutoSave();
    }, 2000);

    setAutoSaveTimeout(timeoutId);
  };

  // 🎨 FUNÇÃO: Estilos do humor (modo greyed limpo)
  const getHumorButtonStyles = (isSelected, isAnySelected) => {
    const isOtherSelected = isAnySelected && !isSelected;
    return {
      base: "flex flex-col items-center gap-3 p-4 rounded-none border-0 transition-all duration-300 bg-transparent",
      emoji: isOtherSelected ? "grayscale opacity-40" : (isSelected ? "drop-shadow-lg" : "drop-shadow-sm"),
      text: isOtherSelected ? 'text-gray-300' : (isSelected ? 'text-blue-600 font-bold' : 'text-gray-600')
    };
  };

  // 🆕 FUNÇÃO: SELECIONAR HUMOR
  const handleHumorSelect = (humorKey) => {
    handleInputChange('humor', humorKey);
  };
  const handleClose = () => {
    // Cancelar auto-save pendente
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Reset estados
    setFormData({
      date: getInitialDate(),
      peso: '',
      meditar: false,
      medicar: false,
      exercitar: false,
      comunicar: false,
      alimentar: false,
      estudar: false,
      descansar: false,
      humor: '', // 🆕 RESETAR HUMOR
      obs: ''
    });
    setErrors({});
    setSuccessMessage('');
    setSaveStatus('idle');
    setHasLoadedExistingData(false);
    
    onClose();
  };

  // Validação do formulário
  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.date)) {
        newErrors.date = 'Formato de data inválido';
      } else {
        const date = new Date(formData.date);
        if (isNaN(date.getTime())) {
          newErrors.date = 'Data inválida';
        }
        
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (date > today) {
          newErrors.date = 'Não é possível registrar dias futuros';
        }
      }
    }

    if (formData.peso && (isNaN(formData.peso) || formData.peso < 0 || formData.peso > 200)) {
      newErrors.peso = 'Peso deve ser um número válido entre 0 e 200kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔄 MODIFICADO: Handle submit manual com humor
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Cancelar auto-save pendente
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    setLoading(true);
    setSuccessMessage('');
    setErrors({});

    try {
      const submitData = {
        date: formData.date,
        peso: formData.peso ? Number(formData.peso) : null,
        meditar: Boolean(formData.meditar),
        medicar: Boolean(formData.medicar),
        exercitar: Boolean(formData.exercitar),
        comunicar: Boolean(formData.comunicar),
        alimentar: Boolean(formData.alimentar),
        estudar: Boolean(formData.estudar),
        descansar: Boolean(formData.descansar),
        humor: formData.humor, // 🆕 INCLUIR HUMOR NO SUBMIT
        obs: formData.obs || ''
      };

      const result = await addNewDay(submitData);
      
      if (result.success) {
        setSuccessMessage('✅ Dia salvo com sucesso! Semana recalculada automaticamente 🎉');
        setSaveStatus('saved');
        
        // Fechar modal após 2 segundos
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 2000);

      } else {
        setErrors({ submit: result.error || 'Erro ao salvar dia' });
        setSaveStatus('error');
      }

    } catch (error) {
      setErrors({ submit: 'Erro inesperado. Tente novamente.' });
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Componente para mostrar status do auto-save
  const SaveStatusIndicator = () => {
    const configs = {
      idle: { icon: <Clock size={20} />, text: 'Pronto', color: 'text-gray-500', border: 'border-gray-300' },
      saving: { icon: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>, text: 'Salvando...', color: 'text-blue-600', border: 'border-blue-300' },
      saved: { icon: <Check size={20} />, text: 'Salvo', color: 'text-green-600', border: 'border-green-300' },
      error: { icon: <AlertCircle size={20} />, text: 'Erro', color: 'text-red-600', border: 'border-red-300' }
    };

    const config = configs[saveStatus];

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${config.color} ${config.border}`}>
        {config.icon}
        <span>{config.text}</span>
      </div>
    );
  };

  // Contar hábitos marcados
  const habitosCompletos = habitsList.filter(h => formData[h.key]).length;

  if (!isOpen) return null;

  // Função para resetar passo ao fechar
  const handleCloseAndReset = () => {
    setStep(1);
    handleClose();
  };

  // Função para submit final
  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    await handleSubmit(e);
    setStep(1);
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-0 sm:p-4">
      {/* MOBILE/TABLET: FLUXO EM 2 TELAS */}
      <div className="w-full h-full max-w-md mx-auto flex flex-col justify-between p-0 sm:max-w-lg md:max-w-xl lg:hidden relative bg-white">
        {/* Header fixo com X e indicador de status */}
        <div className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10" style={{ minHeight: 56 }}>
          <SaveStatusIndicator />
          <button
            onClick={handleCloseAndReset}
            disabled={loading}
            className="text-gray-400 hover:text-gray-700 text-3xl"
            style={{ zIndex: 10 }}
          >
            <X size={32} />
          </button>
        </div>
        
        {step === 1 && (
          <>
            {/* Conteúdo principal com scroll se necessário */}
            <div className="flex-1 overflow-y-auto px-4 pt-2 pb-32 w-full">
              {/* Data */}
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                max={today}
                className="w-full text-xl px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center font-semibold mb-8 bg-white"
                disabled={loading}
                style={{ fontSize: '1.2rem' }}
              />

              {/* Peso */}
              <input
                type="number"
                value={formData.peso}
                onChange={(e) => handleInputChange('peso', e.target.value)}
                placeholder="Peso (kg)"
                step="0.1"
                min="0"
                max="200"
                className="w-full text-xl px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center mb-8 bg-white"
                disabled={loading}
                style={{ fontSize: '1.2rem' }}
              />

              {/* Hábitos */}
              <div className="grid grid-cols-1 gap-4 mb-8">
                {habitsList.map((habit) => (
                  <button
                    key={habit.key}
                    type="button"
                    onClick={() => handleInputChange(habit.key, !formData[habit.key])}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                      formData[habit.key] 
                        ? 'bg-green-100 border-green-500 scale-105'
                        : 'bg-gray-50 border-gray-200 opacity-90'
                    }`}
                    style={{ minHeight: 64 }}
                    disabled={loading}
                  >
                    <span className="text-5xl">{habit.label.split(' ')[0]}</span>
                    <span className="text-base font-semibold text-gray-800 flex-1 text-left">{habit.label.replace(/^[^ ]+ /, '')}</span>
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full border-2 ${formData[habit.key] ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>{formData[habit.key] && <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Botão Próximo fixo na base */}
            <div className="w-full px-4 pb-4 pt-2 bg-white fixed bottom-0 left-0 z-20">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-[#4682B4] hover:bg-[#3a6d99] text-white text-2xl font-bold flex items-center justify-center gap-3 shadow-lg disabled:opacity-60"
                style={{ minHeight: 64 }}
              >
                Próximo 1/2
              </button>
            </div>
          </>
        )}
        
        {step === 2 && (
          <>
            <div className="flex flex-col justify-between h-full w-full">
              <div className="mb-8 mt-8 px-4">
                
                {/* 🆕 SEÇÃO DE HUMOR - MOBILE (greyed clean) */}
                <div className="mb-10">
                  <div className="text-2xl font-bold text-gray-800 mb-8 text-center">Como você se sentiu hoje?</div>
                  <div className="flex justify-center gap-8">
                    {humorOptions.map((option) => {
                      const isSelected = formData.humor === option.key;
                      const isAnySelected = formData.humor !== '';
                      const styles = getHumorButtonStyles(isSelected, isAnySelected);
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => handleHumorSelect(option.key)}
                          className={styles.base}
                          disabled={loading}
                        >
                          <span 
                            className={`text-7xl transition-all duration-300 ${styles.emoji}`}
                          >
                            {option.emoji}
                          </span>
                          <span className={`text-sm transition-all duration-300 ${styles.text}`}>
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 🔄 MODIFICADO: Textarea com novo texto */}
                <div className="mb-10">
                  <div className="text-2xl font-bold text-gray-800 mb-6 text-center">Conte me mais</div>
                  <textarea
                    value={formData.obs}
                    onChange={(e) => handleInputChange('obs', e.target.value)}
                    placeholder="Escreva aqui seu comentário, reflexão ou diagnóstico do dia..."
                    rows={6}
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg resize-none"
                    style={{ minHeight: 150 }}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="w-full py-5 rounded-2xl bg-[#4682B4] hover:bg-[#3a6d99] text-white text-2xl font-bold flex items-center justify-center gap-3 shadow-lg mt-auto disabled:opacity-60"
                  style={{ minHeight: 64 }}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={28} />
                      Finalizar Dia
                    </>
                  )}
                </button>
                {/* Voltar */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 text-3xl"
                  style={{ zIndex: 10 }}
                >
                  &#8592;
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* DESKTOP: FLUXO EM 2 ETAPAS (igual mobile) */}
      <div className="hidden lg:flex items-center justify-center fixed inset-0 z-50 bg-black bg-opacity-10">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 relative flex flex-col" style={{ maxHeight: '90vh', minWidth: '480px' }}>
          {/* Header com status e botão fechar */}
          <div className="flex items-center justify-between px-8 pt-6">
            <SaveStatusIndicator />
            <button
              onClick={handleCloseAndReset}
              disabled={loading}
              className="text-gray-400 hover:text-gray-700 text-3xl z-20"
            >
              <X size={32} />
            </button>
          </div>
          
          {step === 1 && (
            <>
              {/* Conteúdo rolável - ETAPA 1 */}
              <div className="flex-1 overflow-y-auto px-8 pt-4 pb-32">
                <form className="flex flex-col gap-6">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    max={today}
                    className="w-full text-xl px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center font-semibold"
                    disabled={loading}
                    style={{ fontSize: '1.2rem' }}
                  />
                  <input
                    type="number"
                    value={formData.peso}
                    onChange={(e) => handleInputChange('peso', e.target.value)}
                    placeholder="Peso (kg)"
                    step="0.1"
                    min="0"
                    max="200"
                    className="w-full text-xl px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center"
                    disabled={loading}
                    style={{ fontSize: '1.2rem' }}
                  />
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {habitsList.map((habit) => (
                      <button
                        key={habit.key}
                        type="button"
                        onClick={() => handleInputChange(habit.key, !formData[habit.key])}
                        className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                          formData[habit.key] 
                            ? 'bg-green-100 border-green-500 scale-105'
                            : 'bg-gray-50 border-gray-200 opacity-90'
                        }`}
                        style={{ minHeight: 72 }}
                        disabled={loading}
                      >
                        <span className="text-5xl">{habit.label.split(' ')[0]}</span>
                        <span className="text-lg font-semibold text-gray-800 flex-1 text-left">{habit.label.replace(/^[^ ]+ /, '')}</span>
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${formData[habit.key] ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>{formData[habit.key] && <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}</span>
                      </button>
                    ))}
                  </div>
                </form>
              </div>
              
              {/* Botão Próximo fixo na base - DESKTOP ETAPA 1 */}
              <div className="w-full px-8 pb-8 pt-4 bg-white sticky bottom-0 left-0 z-30 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="w-full py-5 rounded-2xl bg-[#4682B4] hover:bg-[#3a6d99] text-white text-2xl font-bold flex items-center justify-center gap-3 shadow-lg disabled:opacity-60"
                  style={{ minHeight: 64 }}
                >
                  Próximo 1/2
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Conteúdo rolável - ETAPA 2 */}
              <div className="flex-1 overflow-y-auto px-8 pt-4 pb-32">
                
                {/* 🆕 SEÇÃO DE HUMOR - DESKTOP (greyed clean) */}
                <div className="mb-10">
                  <div className="text-2xl font-bold text-gray-800 mb-8 text-center">Como você se sentiu hoje?</div>
                  <div className="flex justify-center gap-8">
                    {humorOptions.map((option) => {
                      const isSelected = formData.humor === option.key;
                      const isAnySelected = formData.humor !== '';
                      const styles = getHumorButtonStyles(isSelected, isAnySelected);
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => handleHumorSelect(option.key)}
                          className={styles.base}
                          disabled={loading}
                        >
                          <span 
                            className={`text-6xl transition-all duration-300 ${styles.emoji}`}
                          >
                            {option.emoji}
                          </span>
                          <span className={`text-sm transition-all duration-300 ${styles.text}`}>
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 🔄 MODIFICADO: Textarea com novo texto - DESKTOP */}
                <div className="mb-10">
                  <div className="text-2xl font-bold text-gray-800 mb-6 text-center">Conte me mais</div>
                  <textarea
                    value={formData.obs}
                    onChange={(e) => handleInputChange('obs', e.target.value)}
                    placeholder="Escreva aqui seu comentário, reflexão ou diagnóstico do dia..."
                    rows={5}
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg resize-none"
                    style={{ minHeight: 120 }}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Botão Finalizar + Voltar - DESKTOP ETAPA 2 */}
              <div className="w-full px-8 pb-8 pt-4 bg-white sticky bottom-0 left-0 z-30 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="w-full py-5 rounded-2xl bg-[#4682B4] hover:bg-[#3a6d99] text-white text-2xl font-bold flex items-center justify-center gap-3 shadow-lg disabled:opacity-60"
                  style={{ minHeight: 64 }}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={28} />
                      Finalizar Dia
                    </>
                  )}
                </button>
                {/* Botão Voltar */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="absolute top-4 left-8 text-gray-400 hover:text-gray-700 text-3xl"
                  style={{ zIndex: 10 }}
                >
                  &#8592;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Mensagem de sucesso (se houver) */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default AddDayForm;