// components/forms/AddDayForm.jsx - FORMULÁRIO DIÁRIO SIMPLES
import React, { useState } from 'react';
import { X, Calendar, Save } from 'lucide-react';
import useDashboardData from '../../hooks/useDashboardData';

const AddDayForm = ({ isOpen, onClose }) => {
  const { addNewDay, refreshData } = useDashboardData();

  // Data de hoje por padrão
  const today = new Date().toISOString().split('T')[0]; // "2025-06-22"
  const todayFormatted = new Date().toLocaleDateString('pt-BR'); // "22/06/2025"

  // Estado do formulário
  const [formData, setFormData] = useState({
    date: today,
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

  // Handle mudanças no formulário
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle toggle de hábitos
  const handleHabitToggle = (habitKey) => {
    setFormData(prev => ({
      ...prev,
      [habitKey]: !prev[habitKey]
    }));
  };

  // Validações mais rigorosas (seguindo padrão do AddWeekForm)
  const validateForm = () => {
    const newErrors = {};

    // Validar data obrigatória (formato ISO: YYYY-MM-DD)
    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.date)) {
        newErrors.date = 'Formato de data inválido';
      } else {
        // Verificar se é uma data válida
        const date = new Date(formData.date);
        if (isNaN(date.getTime())) {
          newErrors.date = 'Data inválida';
        }
        
        // Verificar se não é uma data futura
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Até o final do dia de hoje
        if (date > today) {
          newErrors.date = 'Não é possível registrar dias futuros';
        }
      }
    }

    // Validar peso (seguindo mesmo padrão do AddWeekForm)
    if (formData.peso && (isNaN(formData.peso) || formData.peso < 0 || formData.peso > 200)) {
      newErrors.peso = 'Peso deve ser um número válido entre 0 e 200kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrors({});

    try {
      // Preparar dados para envio (seguindo padrão)
      const submitData = {
        date: formData.date, // YYYY-MM-DD (ISO format)
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

      // Chamar função do hook
      const result = await addNewDay(submitData);
      
      if (result.success) {
        setSuccessMessage('✅ Dia salvo com sucesso! Semana recalculada automaticamente 🎉');
        
        // Limpar formulário (resetar para hoje)
        const newToday = new Date().toISOString().split('T')[0];
        setFormData({
          date: newToday,
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

        // Fechar modal após 3 segundos
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 3000);

      } else {
        setErrors({ submit: result.error || 'Erro ao salvar dia' });
      }

    } catch (error) {
      setErrors({ submit: 'Erro inesperado. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  // Reset ao fechar
  const handleClose = () => {
    if (!loading) {
      setFormData({
        date: today,
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
      onClose();
    }
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
        {/* Header fixo com X */}
        <div className="w-full flex items-center justify-end px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10" style={{ minHeight: 56 }}>
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
                    Salvar
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
          {/* Botão de fechar no topo direito */}
          <button
            onClick={handleCloseAndReset}
            disabled={loading}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-3xl z-20"
          >
            <X size={32} />
          </button>
          {/* Conteúdo rolável */}
          <div className="flex-1 overflow-y-auto px-10 pt-10 pb-32">
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
          {/* Botão Salvar fixo na base */}
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
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDayForm;