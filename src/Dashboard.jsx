// src/Dashboard.jsx (VERSÃO CORRIGIDA - Props corretas para ProgressOverviewSection)
import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import useDashboardData from './hooks/useDashboardData';
import AddDayForm from './components/habitForms/AddDayForm';

// Seções do Dashboard
import ProgressOverviewSection from './components/dashboardSections/ProgressOverviewSection';
import HabitPerformanceSection from './components/dashboardSections/HabitPerformanceSection';
import HabitInsightsSection from './components/dashboardSections/HabitInsightsSection';
import WeeklyReviewSection from './components/dashboardSections/WeeklyReviewSection';
import WeeklySummarySection from './components/dashboardSections/WeeklySummarySection';

const Dashboard = () => {
  const { data, loading, error, refreshData } = useDashboardData();
  const [showAddDayForm, setShowAddDayForm] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    progress: true,
    performance: false,
    insights: false,
    weekly: false,
    summary: false
  });

  // ✅ FUNÇÃO PARA FECHAR FORMULÁRIO E ATUALIZAR DADOS
  const handleCloseForm = () => {
    setShowAddDayForm(false);
    // Atualizar dados apenas quando necessário
    setTimeout(() => {
      refreshData();
    }, 500);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 text-[#4682B4] animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg">
          <p className="text-lg font-semibold mb-2">Erro ao carregar dados</p>
          <p className="mb-4">{error}</p>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-[#4682B4] text-white rounded hover:bg-[#3a6d99]"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // No data state - VERIFICAÇÃO MAIS ROBUSTA
  if (!data || !data.weeklyCompletionData || !data.habitDataByType) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="text-center text-yellow-600 bg-yellow-50 p-6 rounded-lg">
          <p className="text-lg font-semibold mb-2">Nenhum dado encontrado</p>
          <p className="mb-4">Adicione alguns dias para ver o dashboard</p>
          <div className="space-y-2">
            <button 
              onClick={() => setShowAddDayForm(true)}
              className="px-4 py-2 bg-[#4682B4] text-white rounded hover:bg-[#3a6d99] mr-2"
            >
              Adicionar primeiro dia
            </button>
            <button 
              onClick={refreshData}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Recarregar
            </button>
          </div>
        </div>
        
        {/* MODAL DO FORMULÁRIO - MESMO SEM DADOS */}
        <AddDayForm 
          isOpen={showAddDayForm} 
          onClose={handleCloseForm}
        />
      </div>
    );
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // VERIFICAÇÕES DE DADOS SEGURAS
  const hasWeeklyData = data.weeklyCompletionData && data.weeklyCompletionData.length > 0;
  const hasWeightData = data.weightData && data.weightData.length > 0;
  const hasHabitData = data.habitDataByType && data.habitsList && data.habitsList.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      
      {/* BOTÃO PARA ADICIONAR DIA - MOBILE/TABLET/DESKTOP CLEAN */}
      <div className="flex justify-center items-center my-12 w-full">
        <button
          onClick={() => setShowAddDayForm(true)}
          className="bg-[#4682B4] hover:bg-[#3a6d99] text-white text-2xl px-10 py-8 rounded-3xl shadow-lg transition-all duration-200 flex items-center gap-4 font-bold w-full max-w-xl justify-center"
          style={{ minHeight: '90px' }}
        >
          <Plus size={36} />
          Adicionar novo dia
        </button>
      </div>

      {/* BOTÃO FLUTUANTE - ESCONDER NO MOBILE */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <button
          onClick={() => setShowAddDayForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-200"
          title="Adicionar novo dia"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* MODAL DO FORMULÁRIO */}
      <AddDayForm 
        isOpen={showAddDayForm} 
        onClose={handleCloseForm} 
      />

      {/* SEÇÕES DO DASHBOARD - COM VERIFICAÇÕES SEGURAS */}
      
      {/* 1. Visão Geral de Progresso - ✅ PROPS CORRIGIDAS */}
      {hasWeeklyData && (
        <ProgressOverviewSection 
          data={data}
          isExpanded={expandedSections.progress}
          onToggle={() => toggleSection('progress')}
        />
      )}

      {/* 2. Performance por Hábito */}
      {hasHabitData && (
        <HabitPerformanceSection 
          data={data} 
          isExpanded={expandedSections.performance}
          onToggle={() => toggleSection('performance')}
        />
      )}

      {/* 3. Insights por Hábito */}
      {hasWeeklyData && hasHabitData && (
        <HabitInsightsSection 
          data={data} 
          isExpanded={expandedSections.insights}
          onToggle={() => toggleSection('insights')}
        />
      )}

      {/* 4. Análise Semanal */}
      {hasWeeklyData && (
        <WeeklyReviewSection 
          data={data} 
          isExpanded={expandedSections.weekly}
          onToggle={() => toggleSection('weekly')}
        />
      )}

      {/* 5. Resumo Geral */}
      {hasWeeklyData && (
        <WeeklySummarySection 
          data={data} 
          isExpanded={expandedSections.summary}
          onToggle={() => toggleSection('summary')}
        />
      )}

      {/* MENSAGEM SE NÃO HOUVER DADOS SUFICIENTES */}
      {(!hasWeeklyData || !hasHabitData) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-700 mb-2">📊 Dashboard em construção!</p>
          <p className="text-blue-600 text-sm">
            Adicione alguns dias de dados para ver gráficos e análises completas.
          </p>
        </div>
      )}

    </div>
  );
};

export default Dashboard;