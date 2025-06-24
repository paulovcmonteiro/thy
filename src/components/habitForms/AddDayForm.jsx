// components/forms/AddDayForm.jsx - FORMULÁRIO COM AUTO-SAVE
import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Save, Check, AlertCircle, Clock } from 'lucide-react';
import useDashboardData from '../../hooks/useDashboardData';
import { getDayHabits } from '../../firebase/habitsService';

const AddDayForm = ({ isOpen, onClose }) => {
  const { addNewDay, refreshData } = useDashboardData();

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

  // Estado do formulário
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
        
        // Carregar dados no formulário
        setFormData({
          date: dateISO,
          peso: existingData.peso ? existingData.peso.toString() : '',
          meditar: existingData.meditar || false,
          medicar: existingData.medicar || false,
          exercitar: existingData.exercitar || false,
          comunicar: existingData.comunicar || false,
          alimentar: existingData.alimentar || false,
          estudar: existingData.estudar || false,
          descansar: existingData.descansar || false,
          obs: existingData.obs || ''
        });
        
        setSaveStatus('saved');
        setHasLoadedExistingData(true);
        console.log('✅ [AddDayForm] Dados carregados no formulário');
        
      } else {
        console.log('ℹ️ [AddDayForm] Nenhum dado encontrado para', dateISO, '- novo dia');
        setHasLoadedExistingData(true);
        setSaveStatus('idle');
      }
      
    } catch (error) {
      console.error('❌ [AddDayForm] Erro ao carregar dados existentes:', error);
      setHasLoadedExistingData(true);
      setSaveStatus('idle');
    }
  }, []);

  // 🆕 FUNÇÃO: AUTO-SAVE COM DEBOUNCE
  const performAutoSave = useCallback(async (dataToSave) => {
    try {
      setSaveStatus('saving');
      console.log('💾 [AddDayForm] Auto-salvando...', dataToSave.date);

      const result = await addNewDay(dataToSave);
      
      if (result.success) {
        setSaveStatus('saved');
        console.log('✅ [AddDayForm] Auto-save realizado com sucesso');
        
        // Limpar indicador de "saved" após 2 segundos
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
        
      } else {
        setSaveStatus('error');
        console.error('❌ [AddDayForm] Erro no auto-save:', result.error);
        
        // Limpar status de erro após 3 segundos
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }

    } catch (error) {
      setSaveStatus('error');
      console.error('❌ [AddDayForm] Erro inesperado no auto-save:', error);
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  }, [addNewDay]);

  // 🆕 FUNÇÃO: TRIGGER AUTO-SAVE COM DEBOUNCE
  const triggerAutoSave = useCallback((newFormData) => {
    // Só auto-salvar se já carregou dados existentes (evita salvar antes de carregar)
    if (!hasLoadedExistingData) {
      return;
    }

    // Validações básicas para auto-save
    if (!newFormData.date) {
      return;
    }

    // Limpar timeout anterior
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Agendar novo auto-save com debounce de 1.5 segundos
    const timeoutId = setTimeout(() => {
      console.log('⏰ [AddDayForm] Trigger auto-save após debounce');
      
      // Preparar dados para auto-save
      const autoSaveData = {
        date: newFormData.date,
        peso: newFormData.peso ? Number(newFormData.peso) : null,
        meditar: Boolean(newFormData.meditar),
        medicar: Boolean(newFormData.medicar),
        exercitar: Boolean(newFormData.exercitar),
        comunicar: Boolean(newFormData.comunicar),
        alimentar: Boolean(newFormData.alimentar),
        estudar: Boolean(newFormData.estudar),
        descansar: Boolean(newFormData.descansar),
        obs: newFormData.obs || ''
      };

      performAutoSave(autoSaveData);
    }, 1500); // 1.5 segundos de debounce

    setAutoSaveTimeout(timeoutId);
  }, [autoSaveTimeout, hasLoadedExistingData, performAutoSave]);

  // Handle mudanças no formulário COM AUTO-SAVE
  const handleInputChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);
    
    // 🆕 SALVAR DATA NO LOCALSTORAGE QUANDO MUDAR
    if (field === 'date') {
      saveLastUsedDate(value);
    }
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // 🆕 TRIGGER AUTO-SAVE
    triggerAutoSave(newFormData);
  };

  // Handle toggle de hábitos COM AUTO-SAVE
  const handleHabitToggle = (habitKey) => {
    const newFormData = {
      ...formData,
      [habitKey]: !formData[habitKey]
    };
    
    setFormData(newFormData);

    // 🆕 TRIGGER AUTO-SAVE
    triggerAutoSave(newFormData);
  };

  // 🆕 CARREGAR DADOS QUANDO DATA MUDAR
  useEffect(() => {
    if (isOpen && formData.date) {
      setHasLoadedExistingData(false);
      setSaveStatus('idle');
      loadExistingDay(formData.date);
    }
  }, [formData.date, isOpen, loadExistingDay]);

  // 🆕 CARREGAR DADOS INICIAIS QUANDO ABRIR MODAL
  useEffect(() => {
    if (isOpen) {
      setHasLoadedExistingData(false);
      setSaveStatus('idle');
      const dateToLoad = getInitialDate(); // Usar última data salva
      setFormData(prev => ({ ...prev, date: dateToLoad })); // Atualizar estado se necessário
      loadExistingDay(dateToLoad);
    }
  }, [isOpen, loadExistingDay]);

  // 🆕 LIMPAR TIMEOUT AO DESMONTAR
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Validações mais rigorosas (mantidas iguais)
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

  // 🔄 MODIFICADO: Handle submit manual (quando usuário clica "Salvar")
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

  // Reset ao fechar
  const handleClose = () => {
    if (!loading) {
      // Cancelar auto-save pendente
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      
      setFormData({
        date: getInitialDate(), // 🆕 Usar última data salva em vez de hoje
        peso: '',
        meditar: false,
        medicar: false,
        exercitar: false,
        comunicar: false,
        alimentar: false,
        estudar: false,
        descansar: false,
        obs: ''
      });
      setErrors({});
      setSuccessMessage('');
      setSaveStatus('idle');
      setHasLoadedExistingData(false);
      onClose();
    }
  };

  // 🆕 COMPONENTE: INDICADOR DE STATUS DE SALVAMENTO
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
                className="w-full text-xl px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center font-semibold mb-3"
                disabled={loading}
                style={{ fontSize: '1.2rem' }}
              />
              {/* Peso */}
              <input
                type="number"
                step="0.1"
                value={formData.peso}
                onChange={(e) => handleInputChange('peso', e.target.value)}
                placeholder="Peso (kg)"
                className="w-full text-xl px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center font-semibold mb-4"
                disabled={loading}
                style={{ fontSize: '1.2rem' }}
              />
              {/* Hábitos em lista vertical, botões grandes */}
              <div className="flex flex-col gap-3 my-4">
                {habitsList.map((habit, idx) => (
                  <button
                    key={habit.key}
                    type="button"
                    onClick={() => handleHabitToggle(habit.key)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-300 text-3xl w-full ${
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
                className="w-full py-5 rounded-2xl bg-blue-600 text-white text-2xl font-bold flex items-center justify-center gap-3 shadow-lg disabled:opacity-60"
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
              <div className="mb-8 mt-8">
                <div className="text-2xl font-bold text-gray-800 mb-6 text-center">Como foi hoje?</div>
                <textarea
                  value={formData.obs}
                  onChange={(e) => handleInputChange('obs', e.target.value)}
                  placeholder="Escreva aqui seu comentário, reflexão ou diagnóstico do dia..."
                  rows={8}
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg resize-none"
                  style={{ minHeight: 180 }}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-blue-600 text-white text-2xl font-bold flex items-center justify-center gap-3 shadow-lg mt-auto disabled:opacity-60"
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
          </>
        )}
      </div>
      
      {/* DESKTOP: TUDO EM UMA TELA SÓ */}
      <div className="hidden lg:flex items-center justify-center fixed inset-0 z-50 bg-black bg-opacity-10">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-0 relative flex flex-col" style={{ maxHeight: '90vh', minWidth: '520px' }}>
          {/* Header com status e botão fechar */}
          <div className="flex items-center justify-between px-10 pt-6">
            <SaveStatusIndicator />
            <button
              onClick={handleCloseAndReset}
              disabled={loading}
              className="text-gray-400 hover:text-gray-700 text-3xl z-20"
            >
              <X size={32} />
            </button>
          </div>
          
          {/* Conteúdo rolável */}
          <div className="flex-1 overflow-y-auto px-10 pt-4 pb-32">
            <form onSubmit={handleFinalSubmit} className="flex flex-col gap-8">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                max={today}
                className="w-full max-w-2xl mx-auto text-xl px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center font-semibold"
                disabled={loading}
                style={{ fontSize: '1.2rem' }}
              />
              <input
                type="number"
                step="0.1"
                value={formData.peso}
                onChange={(e) => handleInputChange('peso', e.target.value)}
                placeholder="Peso (kg)"
                className="w-full max-w-2xl mx-auto text-xl px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center font-semibold"
                disabled={loading}
                style={{ fontSize: '1.2rem' }}
              />
              <div className="flex flex-col gap-4 my-2 w-full max-w-2xl mx-auto">
                {habitsList.map((habit, idx) => (
                  <button
                    key={habit.key}
                    type="button"
                    onClick={() => handleHabitToggle(habit.key)}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-300 text-3xl w-full ${
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
              <textarea
                value={formData.obs}
                onChange={(e) => handleInputChange('obs', e.target.value)}
                placeholder="Escreva aqui seu comentário, reflexão ou diagnóstico do dia..."
                rows={5}
                className="w-full max-w-2xl mx-auto px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg resize-none"
                style={{ minHeight: 120 }}
                disabled={loading}
              />
            </form>
          </div>
          
          {/* Botão Finalizar Dia fixo na base */}
          <div className="w-full px-10 pb-8 pt-4 bg-white sticky bottom-0 left-0 z-30 border-t border-gray-100">
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={loading}
              className="w-full max-w-2xl mx-auto py-5 rounded-2xl bg-blue-600 text-white text-2xl font-bold flex items-center justify-center gap-3 shadow-lg disabled:opacity-60"
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
          </div>
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