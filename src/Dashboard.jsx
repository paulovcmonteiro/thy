// src/Dashboard.jsx - CÓDIGO CORRIGIDO COMPLETO
import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import useDashboardData  from './hooks/useDashboardData';

// Importando todas as seções
// import DashboardHeader from './components/dashboardSections/DashboardHeader.jsx';
import ProgressOverviewSection from './components/dashboardSections/ProgressOverviewSection.jsx';
import HabitPerformanceSection from './components/dashboardSections/HabitPerformanceSection.jsx';
import HabitInsightsSection from './components/dashboardSections/HabitInsightsSection.jsx';
import WeeklyReviewSection from './components/dashboardSections/WeeklyReviewSection.jsx';
import WeeklySummarySection from './components/dashboardSections/WeeklySummarySection.jsx';
import AddDayForm from './components/habitForms/AddDayForm.jsx';

const Dashboard = () => {
  const { data, loading, error, refreshData } = useDashboardData();
  
  // Estados para seções expandidas
  const [expandedSections, setExpandedSections] = useState({
    section1: true,
    section2: true, 
    section3: true,
    section4: true
  });

  // Estado para controlar o modal do formulário diário
  const [showAddDayForm, setShowAddDayForm] = useState(false);

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="text-center text-red-600">
          <p>Erro ao carregar dados: {error}</p>
          <button 
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="text-center text-yellow-600">
          <p>Nenhum dado encontrado</p>
          <button 
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      
      {/* BOTÃO PARA ADICIONAR DIA DE HOJE - MOBILE/TABLET/ DESKTOP CLEAN */}
      <div className="flex justify-center items-center my-12 w-full">
        <button
          onClick={() => setShowAddDayForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-2xl px-10 py-8 rounded-3xl shadow-lg transition-all duration-200 flex items-center gap-4 font-bold w-full max-w-xl justify-center"
          style={{ minHeight: '90px' }}
        >
          <Plus size={36} />
          Hoje
        </button>
      </div>

      {/* BOTÃO FLUTUANTE - ESCONDER NO MOBILE */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <button
          onClick={() => setShowAddDayForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          title="Adicionar Dia"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* SEÇÕES DO DASHBOARD */}
      <ProgressOverviewSection
        isExpanded={expandedSections.section1}
        onToggle={() => toggleSection('section1')}
        weeklyCompletionData={data.weeklyCompletionData}
        weightData={data.weightData}
      />

      <HabitPerformanceSection
        isExpanded={expandedSections.section2}
        onToggle={() => toggleSection('section2')}
        habitDataByType={data.habitDataByType}
        habitsList={data.habitsList}
      />

      <HabitInsightsSection
        isExpanded={expandedSections.section3}
        onToggle={() => toggleSection('section3')}
        weeklyCompletionData={data.weeklyCompletionData}
        weightData={data.weightData}
        habitDataByType={data.habitDataByType}
        habitsList={data.habitsList}
      />

      <WeeklyReviewSection
        isExpanded={expandedSections.section4}
        onToggle={() => toggleSection('section4')}
        weeklyCompletionData={data.weeklyCompletionData}
      />

      <WeeklySummarySection 
        weeklyCompletionData={data.weeklyCompletionData}
        weightData={data.weightData}
      />

      {/* MODAL DO FORMULÁRIO DIÁRIO */}
      <AddDayForm 
        isOpen={showAddDayForm}
        onClose={() => setShowAddDayForm(false)}
      />
      
    </div>
  );
};

export default Dashboard;