// src/Dashboard.jsx - VERSÃO MELHORADA PARA MOBILE
import React, { useState } from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import AddDayForm from './components/habitForms/AddDayForm';
import WeeklyDebriefingForm from './components/habitForms/WeeklyDebriefingForm';
import ProgressOverviewSection from './components/dashboardSections/ProgressOverviewSection';
import WeeklyDebriefingSection from './components/dashboardSections/WeeklyDebriefingSection';
import HabitPerformanceSection from './components/dashboardSections/HabitPerformanceSection';
import HabitInsightsSection from './components/dashboardSections/HabitInsightsSection';
import WeeklySummarySection from './components/dashboardSections/WeeklySummarySection';
import useDashboardData from './hooks/useDashboardData';

const Dashboard = () => {
  const { data, loading, error, refreshData, addNewDay } = useDashboardData();
  
  // Estados para controlar modais
  const [showAddDayForm, setShowAddDayForm] = useState(false);
  const [showWeeklyDebriefing, setShowWeeklyDebriefing] = useState(false);
  
  // Estados para controlar expansão das seções
  const [isProgressExpanded, setIsProgressExpanded] = useState(false);
  const [isDebriefingExpanded, setIsDebriefingExpanded] = useState(false);
  const [isPerformanceExpanded, setIsPerformanceExpanded] = useState(false);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  
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
      
      {/* TÍTULO - Apenas no desktop */}
      <div className="hidden lg:block mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
          Última Semana
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
      <div className="space-y-8">
        <ProgressOverviewSection 
          data={data} 
          isExpanded={isProgressExpanded}
          onToggle={() => setIsProgressExpanded(!isProgressExpanded)}
        />
        <WeeklyDebriefingSection 
          data={data} 
          isExpanded={isDebriefingExpanded}
          onToggle={() => setIsDebriefingExpanded(!isDebriefingExpanded)}
        />
        <HabitPerformanceSection 
          data={data} 
          isExpanded={isPerformanceExpanded}
          onToggle={() => setIsPerformanceExpanded(!isPerformanceExpanded)}
        />
        <HabitInsightsSection 
          data={data} 
          isExpanded={isInsightsExpanded}
          onToggle={() => setIsInsightsExpanded(!isInsightsExpanded)}
        />
        <WeeklySummarySection 
          data={data} 
          isExpanded={isSummaryExpanded}
          onToggle={() => setIsSummaryExpanded(!isSummaryExpanded)}
        />
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