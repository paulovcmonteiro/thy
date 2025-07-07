// src/Dashboard.jsx - VERSÃO CORRIGIDA COM SEMANA ATUAL
import React, { useState } from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import AddDayForm from './components/habitForms/AddDayForm';
import WeeklyDebriefingForm from './components/habitForms/WeeklyDebriefingForm';
import CurrentWeekSection from './components/dashboardSections/CurrentWeekSection';
import ProgressOverviewSection from './components/dashboardSections/ProgressOverviewSection';
import WeeklyDebriefingSection from './components/dashboardSections/WeeklyDebriefingSection';
import HabitPerformanceSection from './components/dashboardSections/HabitPerformanceSection';
import HabitInsightsSection from './components/dashboardSections/HabitInsightsSection';
import MobileBottomNav from './components/navigation/MobileBottomNav';
import useDashboardData from './hooks/useDashboardData';

const Dashboard = ({ currentSection }) => { // ✅ RECEBE COMO PROP
  const { data, loading, error, refreshData, addNewDay } = useDashboardData();
  
  // Estados para controlar modais
  const [showAddDayForm, setShowAddDayForm] = useState(false);
  const [showWeeklyDebriefing, setShowWeeklyDebriefing] = useState(false);

  // Estado para navegação mobile apenas
  const [currentMobileSection, setCurrentMobileSection] = useState('semana-atual');

  // Função para navegar entre seções (mobile)
  const handleMobileNavigation = (sectionId) => {
    setCurrentMobileSection(sectionId);
  };

  // Função para renderizar seção atual (desktop)
  const renderDesktopSection = () => {
    switch(currentSection) {
      case 'semana-atual':
        return (
          <CurrentWeekSection 
            data={data} 
            isExpanded={true}
            onToggle={() => {}}
          />
        );
      case 'semana-anterior':
        return (
          <WeeklyDebriefingSection 
            data={data} 
            isExpanded={true}
            onToggle={() => {}}
          />
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
        // Fallback para semana atual
        return (
          <CurrentWeekSection 
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
      case 'semana-atual':
        return (
          <CurrentWeekSection 
            data={data} 
            isExpanded={true}
            onToggle={() => {}}
          />
        );
      case 'semana-anterior':
        return (
          <WeeklyDebriefingSection 
            data={data} 
            isExpanded={true}
            onToggle={() => {}}
          />
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
      case 'dashboard':
      default:
        // Dashboard: só os botões, nenhuma seção
        return null;
    }
  };

  // Função para obter título da seção atual (desktop)
  const getSectionTitle = () => {
    switch(currentSection) {
      case 'semana-atual':
        return 'Semana Atual';
      case 'semana-anterior':
        return 'Semana Anterior';
      case 'evolucao-geral':
        return 'Evolução Geral';
      case 'performance-habito':
        return 'Performance por Hábito';
      case 'insights-principais':
        return 'Insights Principais';
      default:
        return 'Semana Atual';
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
      
      {/* Mobile Bottom Navigation - INLINE PARA GARANTIR FUNCIONAMENTO */}
      <div className="lg:hidden">
        <div className="h-20"></div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-2 z-30">
          <div className="flex items-center justify-around">
            {[
              { id: 'semana-atual', label: 'Atual', icon: '📅' },
              { id: 'semana-anterior', label: 'Anterior', icon: '📋' },
              { id: 'evolucao-geral', label: 'Evolução', icon: '📈' },
              { id: 'performance-habito', label: 'Performance', icon: '📊' },
              { id: 'insights-principais', label: 'Insights', icon: '💡' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleMobileNavigation(item.id)}
                className={`
                  flex flex-col items-center p-2 rounded-lg transition-colors duration-200 min-w-0 flex-1
                  ${currentMobileSection === item.id 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-500'
                  }
                `}
              >
                <span className="text-lg mb-1">{item.icon}</span>
                <span className="text-xs font-medium truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TÍTULO - Apenas no desktop quando não for Semana Atual */}
      {currentSection !== 'semana-atual' && (
        <div className="hidden lg:block mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            {getSectionTitle()}
          </h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada dos seus hábitos
          </p>
        </div>
      )}

      {/* SEÇÃO DE BOTÕES PRINCIPAIS - Sempre aparecem quando estiver na dashboard mobile ou na Semana Atual (desktop) */}
      {(currentMobileSection === 'dashboard' || currentMobileSection === 'semana-atual' || currentSection === 'semana-atual') && (
        <div className="flex flex-col lg:flex-row justify-center items-center gap-4 mb-8">
          <button
            onClick={() => setShowAddDayForm(true)}
            className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium w-full lg:w-auto"
          >
            <Plus className="w-6 h-6" />
            Adicionar Hoje
          </button>

          <button
            onClick={() => setShowWeeklyDebriefing(true)}
            className="flex items-center gap-3 bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium w-full lg:w-auto"
          >
            <BarChart3 className="w-6 h-6" />
            Análise Semanal
          </button>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <div className="space-y-6">
        {/* Desktop: Renderiza seção baseada no sidebar */}
        <div className="hidden lg:block">
          {renderDesktopSection()}
        </div>

        {/* Mobile: Renderiza seção baseada na navegação mobile */}
        <div className="lg:hidden">
          {renderMobileSection()}
        </div>
      </div>

      {/* MODAIS */}
      {showAddDayForm && (
        <AddDayForm
          isOpen={showAddDayForm}
          onClose={() => setShowAddDayForm(false)}
          onSubmit={async (dayData) => {
            await addNewDay(dayData);
            setShowAddDayForm(false);
          }}
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