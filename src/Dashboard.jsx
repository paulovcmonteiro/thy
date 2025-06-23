// src/Dashboard.jsx - CÓDIGO CORRIGIDO COMPLETO
import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import useDashboardData  from './hooks/useDashboardData';

// Importando todas as seções
import DashboardHeader from './components/dashboardSections/DashboardHeader.jsx';
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
      
      <DashboardHeader analysisInfo={data.analysisInfo} />

      {/* BOTÃO PARA ADICIONAR DIA DE HOJE */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              📅 Registrar Hábitos de Hoje
            </h3>
            <p className="text-gray-600 text-sm">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.weeklyCompletionData?.length > 0 
                ? `📊 ${data.weeklyCompletionData.length} semanas registradas`
                : '⚠️ Nenhuma semana registrada ainda'
              }
            </p>
          </div>
          <button
            onClick={() => setShowAddDayForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <Calendar size={20} />
            Adicionar Hoje
          </button>
        </div>
      </div>

      {/* BOTÃO FLUTUANTE */}
      <div className="fixed bottom-6 right-6 z-40">
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