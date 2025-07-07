// src/Dashboard.jsx - NOVA VERSÃO COM NAVEGAÇÃO LATERAL
import React, { useState } from 'react';
import { Plus, BarChart3 } from 'lucide-react';

// Hooks
import useDashboardData from './hooks/useDashboardData';
import useSidebar from './hooks/useSidebar';

// Componentes de navegação
import MobileBottomNav from './components/navigation/MobileBottomNav';

// Formulários
import AddDayForm from './components/habitForms/AddDayForm';
import WeeklyDebriefingForm from './components/habitForms/WeeklyDebriefingForm';

// Seções do dashboard
import ProgressOverviewSection from './components/dashboardSections/ProgressOverviewSection';
import WeeklyDebriefingSection from './components/dashboardSections/WeeklyDebriefingSection';
import HabitPerformanceSection from './components/dashboardSections/HabitPerformanceSection';
import HabitInsightsSection from './components/dashboardSections/HabitInsightsSection';
// Nota: WeeklySummarySection foi removido conforme solicitado

const Dashboard = () => {
  // Hooks de dados e navegação
  const { data, loading, error, refreshData, addNewDay } = useDashboardData();
  const { currentSection, navigateToSection } = useSidebar();
  
  // Estados para controlar modais
  const [showAddDayForm, setShowAddDayForm] = useState(false);
  const [showWeeklyDebriefing, setShowWeeklyDebriefing] = useState(false);

  // Função para renderizar a seção atual
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'ultima-semana':
        return (
          <div className="space-y-8">
            {/* Foco na semana atual - Seção padrão quando entra */}
            <WeeklyDebriefingSection 
              data={data} 
              isExpanded={true} // Sempre expandido na view focada
              onToggle={() => {}} // Não precisa de toggle na view focada
            />
          </div>
        );
      
      case 'evolucao-geral':
        return (
          <ProgressOverviewSection 
            data={data} 
            isExpanded={true}
            onToggle={() => {}}
          />
        );
      
      case 'performance-habito':
        return (
          <HabitPerformanceSection 
            data={data} 
            isExpanded={true}
            onToggle={() => {}}
          />
        );
      
      case 'insights-principais':
        return (
          <HabitInsightsSection 
            data={data} 
            isExpanded={true}
            onToggle={() => {}}
          />
        );
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Seção não encontrada</p>
          </div>
        );
    }
  };

  // Função para obter o título da seção atual
  const getSectionTitle = () => {
    switch (currentSection) {
      case 'ultima-semana':
        return 'Última Semana';
      case 'evolucao-geral':
        return 'Evolução Geral';
      case 'performance-habito':
        return 'Performance por Hábito';
      case 'insights-principais':
        return 'Insights Principais';
      default:
        return 'Dashboard';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="text-center text-blue-600">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando dados dos hábitos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="text-center text-red-600">
          <p className="mb-4">Erro: {error}</p>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        currentSection={currentSection}
        onNavigate={navigateToSection}
      />

      {/* Conteúdo Principal */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Header da página */}
        <div className="flex items-center justify-between mb-8">
          {/* Título da seção atual */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              {getSectionTitle()}
            </h1>
            {currentSection === 'ultima-semana' && (
              <p className="text-gray-600 mt-1">
                Foco nos seus objetivos atuais
              </p>
            )}
          </div>
        </div>

        {/* Botões de Ação Principal */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-4 my-8 w-full">
          {/* Botão Adicionar Hoje */}
          <button
            onClick={() => setShowAddDayForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xl lg:text-2xl px-8 lg:px-10 py-6 lg:py-8 rounded-3xl shadow-lg transition-all duration-200 flex items-center gap-3 lg:gap-4 font-bold w-full max-w-md lg:max-w-xl justify-center"
            style={{ minHeight: '80px' }}
          >
            <Plus size={32} />
            Adicionar Hoje
          </button>
          
          {/* Botão Debriefing da Semana */}
          <button
            onClick={() => setShowWeeklyDebriefing(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xl lg:text-2xl px-8 lg:px-10 py-6 lg:py-8 rounded-3xl shadow-lg transition-all duration-200 flex items-center gap-3 lg:gap-4 font-bold w-full max-w-md lg:max-w-xl justify-center"
            style={{ minHeight: '80px' }}
          >
            <BarChart3 size={32} />
            Debriefing da Semana
          </button>
        </div>

        {/* Conteúdo da Seção Atual */}
        <div className="space-y-8">
          {renderCurrentSection()}
        </div>

        {/* Modais */}
        {showAddDayForm && (
          <AddDayForm
            isOpen={showAddDayForm}
            onClose={() => setShowAddDayForm(false)}
            onSubmit={addNewDay}
            existingDays={data?.existingDays || []}
          />
        )}

        {showWeeklyDebriefing && (
          <WeeklyDebriefingForm
            isOpen={showWeeklyDebriefing}
            onClose={() => setShowWeeklyDebriefing(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;