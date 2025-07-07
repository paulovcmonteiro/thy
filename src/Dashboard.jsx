// src/Dashboard.jsx - VERSÃO SIMPLES SEM MENU DUPLICADO
import React, { useState } from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import AddDayForm from './components/habitForms/AddDayForm';
import WeeklyDebriefingForm from './components/habitForms/WeeklyDebriefingForm';
import ProgressOverviewSection from './components/dashboardSections/ProgressOverviewSection';
import WeeklyDebriefingSection from './components/dashboardSections/WeeklyDebriefingSection';
import HabitPerformanceSection from './components/dashboardSections/HabitPerformanceSection';
import HabitInsightsSection from './components/dashboardSections/HabitInsightsSection';
import WeeklySummarySection from './components/dashboardSections/WeeklySummarySection';
import MobileBottomNav from './components/navigation/MobileBottomNav';
import useDashboardData from './hooks/useDashboardData';
import useSidebar from './hooks/useSidebar';

const Dashboard = () => {
  const { data, loading, error, refreshData, addNewDay } = useDashboardData();
  
  // Hook do sidebar existente (conecta com o menu que já existe)
  const { currentSection } = useSidebar();
  
  // Estados para controlar modais
  const [showAddDayForm, setShowAddDayForm] = useState(false);
  const [showWeeklyDebriefing, setShowWeeklyDebriefing] = useState(false);

  // Estado para navegação mobile apenas
  const [currentMobileSection, setCurrentMobileSection] = useState('dashboard');

  // Função para navegar entre seções (mobile)
  const handleMobileNavigation = (sectionId) => {
    setCurrentMobileSection(sectionId);
  };

  // Função para renderizar seção atual (desktop)
  const renderDesktopSection = () => {
    switch(currentSection) {
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
      case 'ultima-semana':
      default:
        return (
          <WeeklyDebriefingSection 
            data={data} 
            isExpanded={true}
            onToggle={() => {}}
          />
        );
    }
  };

  // Função para renderizar seção atual (mobile)
  const renderMobileSection = () => {
    switch(currentMobileSection) {
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
      case 'ultima-semana':
        return (
          <WeeklyDebriefingSection 
            data={data} 
            isExpanded={true}
            onToggle={() => {}}
          />
        );
      case 'dashboard':
      default:
        // Dashboard: só os botões, nenhuma seção
        return null;
    }
  };

  // Função para obter título da seção atual (desktop)
  const getSectionTitle = () => {
    switch(currentSection) {
      case 'evolucao-geral':
        return 'Evolução Geral';
      case 'performance-habito':
        return 'Performance por Hábito';
      case 'insights-principais':
        return 'Insights Principais';
      case 'ultima-semana':
      default:
        return 'Última Semana';
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
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        currentSection={currentMobileSection}
        onNavigate={handleMobileNavigation}
      />

      {/* TÍTULO - Apenas no desktop */}
      <div className="hidden lg:block mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
          {getSectionTitle()}
        </h1>
        <p className="text-gray-600 mt-1">
          Foco nos seus objetivos atuais
        </p>
      </div>

      {/* SEÇÃO DE BOTÕES PRINCIPAIS */}
      <div className="flex flex-col lg:flex-row justify-center items-center gap-4 mb-8 w-full">
        
        {/* Botão Update do Dia */}
        <button
          onClick={() => setShowAddDayForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xl lg:text-2xl px-8 lg:px-10 py-6 lg:py-8 rounded-3xl shadow-lg transition-all duration-200 flex items-center gap-3 lg:gap-4 font-bold w-full max-w-md lg:max-w-xl justify-center"
          style={{ minHeight: '80px' }}
        >
          <Plus size={32} />
          + Update do dia
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

      {/* CONTEÚDO PRINCIPAL */}
      {/* Desktop: Mostra apenas uma seção */}
      <div className="hidden lg:block">
        {renderDesktopSection()}
      </div>

      {/* Mobile: Mostra seção atual OU dashboard limpo */}
      <div className="lg:hidden">
        {renderMobileSection()}
      </div>

      {/* MODAIS */}
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
  );
};

export default Dashboard;