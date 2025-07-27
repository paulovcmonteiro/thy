// src/components/SimpleDashboard.jsx - Dashboard simplificado para usuários simples
import React, { useState } from 'react';
import { Plus, Edit2, Menu, X } from 'lucide-react';
import SimpleSidebar from './navigation/SimpleSidebar';
import SimpleEvolutionSection from './simple/SimpleEvolutionSection';
import SimpleWeekTable from './simple/SimpleWeekTable';

const SimpleDashboard = ({ onLogout }) => {
  // Função para carregar hábitos do localStorage
  const loadHabitsFromStorage = () => {
    try {
      const savedHabits = localStorage.getItem('simple_dashboard_habits');
      return savedHabits ? JSON.parse(savedHabits) : [];
    } catch (error) {
      console.error('Erro ao carregar hábitos do localStorage:', error);
      return [];
    }
  };

  // Função para salvar hábitos no localStorage
  const saveHabitsToStorage = (habitsData) => {
    try {
      localStorage.setItem('simple_dashboard_habits', JSON.stringify(habitsData));
      console.log('✅ Hábitos salvos no localStorage:', habitsData);
    } catch (error) {
      console.error('❌ Erro ao salvar hábitos no localStorage:', error);
    }
  };

  // Estados para múltiplos hábitos
  const [habits, setHabits] = useState(() => loadHabitsFromStorage());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [habitName, setHabitName] = useState('');
  const [habitEmoji, setHabitEmoji] = useState('✅');
  
  // Estados para sidebar e navegação
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('semana-atual');

  // Lista de emojis populares para escolher
  const emojiOptions = ['✅', '🏃', '💊', '🧘', '📚', '💬', '🍎', '😴', '💡', '🎯'];

  // Funções de navegação
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const navigateToSection = (sectionId) => {
    setCurrentSection(sectionId);
    closeSidebar();
  };

  // Função para obter datas da semana atual
  const getCurrentWeekDates = () => {
    const today = new Date();
    const brasiliaOffset = -3;
    const utcTime = today.getTime() + (today.getTimezoneOffset() * 60000);
    const brasiliaTime = new Date(utcTime + (brasiliaOffset * 3600000));
    
    const currentDay = brasiliaTime.getDay();
    const weekDates = [];
    const sunday = new Date(brasiliaTime);
    sunday.setDate(brasiliaTime.getDate() - currentDay);
    
    for (let i = 0; i <= currentDay; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i];
      
      weekDates.push({
        date: dateStr,
        dayName: dayName,
        dayNumber: date.getDate(),
        isToday: dateStr === brasiliaTime.toISOString().split('T')[0]
      });
    }
    
    return weekDates;
  };

  // Função para obter datas da semana anterior (7 dias completos)
  const getPreviousWeekDates = () => {
    const today = new Date();
    const brasiliaOffset = -3;
    const utcTime = today.getTime() + (today.getTimezoneOffset() * 60000);
    const brasiliaTime = new Date(utcTime + (brasiliaOffset * 3600000));
    
    // Calcular domingo da semana passada
    const currentDay = brasiliaTime.getDay();
    const previousSunday = new Date(brasiliaTime);
    previousSunday.setDate(brasiliaTime.getDate() - currentDay - 7);
    
    const weekDates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(previousSunday);
      date.setDate(previousSunday.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i];
      
      weekDates.push({
        date: dateStr,
        dayName: dayName,
        dayNumber: date.getDate(),
        isToday: false // Semana anterior nunca é "hoje"
      });
    }
    
    return weekDates;
  };

  // Função para criar hábito
  const handleCreateHabit = () => {
    if (habitName.trim()) {
      const newHabit = {
        id: Date.now().toString(), // ID único baseado em timestamp
        name: habitName.trim(),
        emoji: habitEmoji,
        completedDays: [], // Array para guardar dias concluídos
        createdAt: new Date().toISOString()
      };
      
      const updatedHabits = [...habits, newHabit];
      setHabits(updatedHabits);
      saveHabitsToStorage(updatedHabits);
      setShowCreateForm(false);
      setIsEditMode(false);
      setHabitName('');
      setHabitEmoji('✅');
    }
  };

  // Função para iniciar edição do hábito
  const handleEditHabit = (habitId) => {
    const habitToEdit = habits.find(h => h.id === habitId);
    if (habitToEdit) {
      setHabitName(habitToEdit.name);
      setHabitEmoji(habitToEdit.emoji);
      setEditingHabitId(habitId);
      setIsEditMode(true);
      setShowCreateForm(true);
    }
  };

  // Função para salvar edição do hábito
  const handleSaveEdit = () => {
    if (habitName.trim() && editingHabitId) {
      const updatedHabits = habits.map(habit => 
        habit.id === editingHabitId 
          ? {
              ...habit,
              name: habitName.trim(),
              emoji: habitEmoji,
              updatedAt: new Date().toISOString()
            }
          : habit
      );
      
      setHabits(updatedHabits);
      saveHabitsToStorage(updatedHabits);
      setShowCreateForm(false);
      setIsEditMode(false);
      setEditingHabitId(null);
      setHabitName('');
      setHabitEmoji('✅');
    }
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setShowCreateForm(false);
    setIsEditMode(false);
    setEditingHabitId(null);
    setHabitName('');
    setHabitEmoji('✅');
  };

  // Função para deletar hábito
  const handleDeleteHabit = (habitId) => {
    if (window.confirm('⚠️ Tem certeza que deseja deletar este hábito? Esta ação não pode ser desfeita.')) {
      const updatedHabits = habits.filter(habit => habit.id !== habitId);
      setHabits(updatedHabits);
      saveHabitsToStorage(updatedHabits);
    }
  };

  // Função para limpar todos os dados (útil para privacidade)
  const handleClearAllData = () => {
    if (window.confirm('⚠️ Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('simple_dashboard_habits');
      setHabits([]);
      setShowCreateForm(false);
      setIsEditMode(false);
      setEditingHabitId(null);
      setHabitName('');
      setHabitEmoji('✅');
      console.log('🗑️ Todos os dados foram apagados do localStorage');
    }
  };

  // Função para marcar/desmarcar dia de um hábito específico
  const toggleDay = (habitId, dateStr) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const updatedHabit = { ...habit };
        const dayIndex = updatedHabit.completedDays.indexOf(dateStr);
        
        if (dayIndex > -1) {
          // Remove o dia (desmarca)
          updatedHabit.completedDays.splice(dayIndex, 1);
        } else {
          // Adiciona o dia (marca)
          updatedHabit.completedDays.push(dateStr);
        }
        
        // Adicionar timestamp da última atualização
        updatedHabit.lastUpdated = new Date().toISOString();
        return updatedHabit;
      }
      return habit;
    });
    
    setHabits(updatedHabits);
    saveHabitsToStorage(updatedHabits);
  };

  const weekDates = getCurrentWeekDates();
  const previousWeekDates = getPreviousWeekDates();

  // Função para renderizar seção atual
  const renderCurrentSection = () => {
    switch(currentSection) {
      case 'semana-atual':
        return renderCurrentWeekSection();
      case 'semana-anterior':
        return renderPreviousWeekSection();
      case 'evolucao':
        return <SimpleEvolutionSection habits={habits} />;
      default:
        return renderCurrentWeekSection();
    }
  };

  // Função para renderizar seção da semana anterior
  const renderPreviousWeekSection = () => {
    if (habits.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Nenhum hábito criado ainda
          </h2>
          <p className="text-gray-600 mb-6">
            Crie um hábito primeiro para ver o histórico da semana anterior
          </p>
          <button
            onClick={() => {
              setCurrentSection('semana-atual');
              closeSidebar();
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Criar Meu Primeiro Hábito
          </button>
        </div>
      );
    }

    // Calcular data inicial da semana anterior para o título
    const startDate = previousWeekDates[0];
    const endDate = previousWeekDates[6];
    const formatDate = (dateStr) => {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    return (
      <div className="space-y-6">
        {habits.map(habit => (
          <SimpleWeekTable
            key={habit.id}
            habit={habit}
            weekDates={previousWeekDates}
            title={`${habit.emoji} ${habit.name} - Semana Anterior (${formatDate(startDate.date)} - ${formatDate(endDate.date)})`}
            loading={false}
            showTitle={true}
            isEditable={false}
            onDayClick={null}
          />
        ))}

        {/* Mensagem explicativa */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            📊 Visualização do Histórico
          </h3>
          <p className="text-blue-700 text-sm">
            Aqui você pode ver como foi seu desempenho na semana passada. 
            Use esta informação para refletir sobre seus hábitos e planejar melhorias.
          </p>
        </div>
      </div>
    );
  };

  // Função para renderizar seção da semana atual
  const renderCurrentWeekSection = () => {
    return (
      <div className="space-y-6">
        {/* Botão para adicionar hábito */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Semana Atual</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Hábito
          </button>
        </div>

        {/* Formulário para criar/editar hábito */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {isEditMode ? 'Editar Hábito' : 'Criar Novo Hábito'}
            </h2>
            
            <div className="space-y-4">
              {/* Nome do hábito */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do hábito
                </label>
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="Ex: Beber água, Exercitar-se, Ler..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Escolha do emoji */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escolha um emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setHabitEmoji(emoji)}
                      className={`w-10 h-10 text-xl rounded-lg transition-colors ${
                        habitEmoji === emoji 
                          ? 'bg-blue-100 border-2 border-blue-500' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={isEditMode ? handleSaveEdit : handleCreateHabit}
                  disabled={!habitName.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isEditMode ? 'Salvar Alterações' : 'Criar Hábito'}
                </button>
                <button
                  onClick={isEditMode ? handleCancelEdit : () => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de hábitos */}
        {habits.length === 0 && !showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Nenhum hábito criado ainda!
            </h2>
            <p className="text-gray-600 mb-6">
              Clique em "Novo Hábito" acima para começar!
            </p>
          </div>
        )}

        {/* Lista de hábitos criados */}
        {habits.map(habit => (
          <div key={habit.id} className="bg-white rounded-lg shadow-md p-6">
            {/* Header do hábito */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{habit.emoji}</span>
                <h2 className="text-xl font-semibold text-gray-800">
                  {habit.name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditHabit(habit.id)}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  title="Editar hábito"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  title="Deletar hábito"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid da semana */}
            <div className="grid grid-cols-3 lg:grid-cols-7 gap-3">
              {weekDates.map((day) => {
                const isCompleted = habit.completedDays.includes(day.date);
                
                return (
                  <div
                    key={day.date}
                    className={`
                      p-3 rounded-lg border text-center cursor-pointer transition-all
                      ${day.isToday ? 'ring-1 ring-blue-300' : ''}
                      ${isCompleted 
                        ? 'bg-green-100 border-green-300 text-green-800' 
                        : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => toggleDay(habit.id, day.date)}
                  >
                    <div className="text-sm font-medium mb-1">{day.dayName}</div>
                    <div className="text-lg font-bold">{day.dayNumber}</div>
                    <div className="mt-2 flex justify-center">
                      {isCompleted ? (
                        <div className="w-7 h-7 border-2 border-green-500 rounded bg-green-100 flex items-center justify-center shadow-sm">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-7 h-7 border border-gray-200 rounded bg-gray-50 hover:border-gray-300 transition-colors"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Estatísticas simples */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {habit.completedDays.filter(date => 
                    weekDates.some(day => day.date === date)
                  ).length}/{weekDates.length}
                </div>
                <div className="text-sm text-gray-600">
                  dias concluídos esta semana
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SimpleSidebar 
        isOpen={sidebarOpen}
        currentSection={currentSection}
        onNavigate={navigateToSection}
        onClose={closeSidebar}
        onLogout={onLogout}
      />

      {/* Container principal */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header mobile */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {currentSection === 'semana-atual' ? 'Semana Atual' : 
               currentSection === 'semana-anterior' ? 'Semana Anterior' : 'Evolução'}
            </h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {renderCurrentSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SimpleDashboard;