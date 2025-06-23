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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="text-blue-600" />
            Adicionar Dia
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Data e Info Básica */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <h3 className="font-semibold text-blue-800 mb-3">
              📅 Hoje: {todayFormatted}
            </h3>
            
            <div className="grid gap-4">
              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📅 Data *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  max={today} // Não permitir datas futuras
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Não é possível registrar dias futuros
                </p>
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>

              {/* Peso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ⚖️ Peso (kg) - Opcional
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.peso}
                  onChange={(e) => handleInputChange('peso', e.target.value)}
                  placeholder="Ex: 82.5"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.peso ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.peso && <p className="text-red-500 text-sm mt-1">{errors.peso}</p>}
              </div>
            </div>
          </div>

          {/* Hábitos */}
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center justify-between">
              🎯 Hábitos de Hoje
              <span className="text-sm font-normal text-gray-600 bg-gray-200 px-2 py-1 rounded">
                {habitosCompletos}/7 completos
              </span>
            </h3>
            
            <div className="space-y-3">
              {habitsList.map((habit) => (
                <div 
                  key={habit.key}
                  className={`bg-white p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    formData[habit.key] 
                      ? 'border-green-300 bg-green-50 shadow-sm' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleHabitToggle(habit.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      formData[habit.key]
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {formData[habit.key] && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{habit.label}</div>
                      <div className="text-sm text-gray-600">{habit.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 Observações do Dia
            </label>
            <textarea
              value={formData.obs}
              onChange={(e) => handleInputChange('obs', e.target.value)}
              placeholder="Como foi o dia? Algo especial aconteceu?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={loading}
            />
          </div>

          {/* Mensagens de Erro/Sucesso */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar Dia
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDayForm;