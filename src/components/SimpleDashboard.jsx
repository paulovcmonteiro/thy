// src/components/SimpleDashboard.jsx - Dashboard simplificado para usuários simples
import React, { useState } from 'react';
import { Plus, Edit2, Menu } from 'lucide-react';
import SimpleSidebar from './navigation/SimpleSidebar';
import SimpleEvolutionSection from './simple/SimpleEvolutionSection';

const SimpleDashboard = ({ onLogout }) => {
  // Estados para o hábito único
  const [habit, setHabit] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitEmoji, setHabitEmoji] = useState('✅');
  
  // Estados para sidebar e navegação
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('meu-habito');

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

  // Função para criar hábito
  const handleCreateHabit = () => {
    if (habitName.trim()) {
      setHabit({
        name: habitName.trim(),
        emoji: habitEmoji,
        completedDays: [] // Array para guardar dias concluídos
      });
      setShowCreateForm(false);
      setHabitName('');
    }
  };

  // Função para marcar/desmarcar dia
  const toggleDay = (dateStr) => {
    if (!habit) return;
    
    const updatedHabit = { ...habit };
    const dayIndex = updatedHabit.completedDays.indexOf(dateStr);
    
    if (dayIndex > -1) {
      // Remove o dia (desmarca)
      updatedHabit.completedDays.splice(dayIndex, 1);
    } else {
      // Adiciona o dia (marca)
      updatedHabit.completedDays.push(dateStr);
    }
    
    setHabit(updatedHabit);
  };

  const weekDates = getCurrentWeekDates();

  // Função para renderizar seção atual
  const renderCurrentSection = () => {
    switch(currentSection) {
      case 'meu-habito':
        return renderHabitSection();
      case 'evolucao':
        return <SimpleEvolutionSection habit={habit} />;
      default:
        return renderHabitSection();
    }
  };

  // Função para renderizar seção do hábito
  const renderHabitSection = () => {
    return (
      <div className="space-y-6">
        {/* Se não tem hábito criado, mostra formulário */}
        {!habit && !showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Crie seu primeiro hábito!
            </h2>
            <p className="text-gray-600 mb-6">
              Escolha um hábito que você quer acompanhar todos os dias
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              Criar Hábito
            </button>
          </div>
        )}

        {/* Formulário para criar hábito */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Criar Novo Hábito
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
                  onClick={handleCreateHabit}
                  disabled={!habitName.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Criar Hábito
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Se tem hábito criado, mostra a semana */}
        {habit && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header do hábito */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{habit.emoji}</span>
                <h2 className="text-xl font-semibold text-gray-800">
                  {habit.name}
                </h2>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Editar hábito"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>

            {/* Grid da semana */}
            <div className="grid grid-cols-3 lg:grid-cols-7 gap-3">
              {weekDates.map((day) => {
                const isCompleted = habit.completedDays.includes(day.date);
                
                return (
                  <div
                    key={day.date}
                    className={`
                      p-3 rounded-lg border-2 text-center cursor-pointer transition-all
                      ${day.isToday ? 'ring-2 ring-blue-400' : ''}
                      ${isCompleted 
                        ? 'bg-green-100 border-green-300 text-green-800' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => toggleDay(day.date)}
                  >
                    <div className="text-sm font-medium mb-1">{day.dayName}</div>
                    <div className="text-lg font-bold">{day.dayNumber}</div>
                    <div className="text-2xl mt-1">
                      {isCompleted ? '✅' : '⭕'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Estatísticas simples */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {habit.completedDays.length}/{weekDates.length}
                </div>
                <div className="text-sm text-gray-600">
                  dias concluídos esta semana
                </div>
              </div>
            </div>
          </div>
        )}
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
              {currentSection === 'meu-habito' ? 'Meu Hábito' : 'Evolução'}
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