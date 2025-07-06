import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Calendar } from 'lucide-react';
import AddDayForm from '@components/habitForms/AddDayForm';
import WeeklyDebriefingForm from '@components/habitForms/WeeklyDebriefingForm';
import ProgressOverviewSection from '@components/dashboardSections/ProgressOverviewSection';
import WeeklyDebriefingSection from '@components/dashboardSections/WeeklyDebriefingSection';
import HabitPerformanceSection from '@components/dashboardSections/HabitPerformanceSection';
import HabitInsightsSection from '@components/dashboardSections/HabitInsightsSection';
import WeeklySummarySection from '@components/dashboardSections/WeeklySummarySection';
import useDashboardData from '@hooks/useDashboardData';

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
      
      {/* SEÇÃO DE BOTÕES PRINCIPAIS */}
      <div className="flex flex-col lg:flex-row justify-center items-center gap-4 my-12 w-full">
        
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

      {/* BOTÃO FLUTUANTE */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <button
          onClick={() => setShowAddDayForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          title="Adicionar Dia"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* MODAL ADD DAY FORM */}
      {showAddDayForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <AddDayForm 
              isOpen={showAddDayForm}
              onClose={() => setShowAddDayForm(false)}
              addNewDay={addNewDay}
              refreshData={refreshData}
            />
          </div>
        </div>
      )}
      {/* MODAL WEEKLY DEBRIEFING FORM */}
      {showWeeklyDebriefing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <WeeklyDebriefingForm 
              isOpen={showWeeklyDebriefing}
              onClose={() => setShowWeeklyDebriefing(false)}
              refreshData={refreshData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;