// src/App.jsx - LAYOUT SEM GAPS
import React from 'react';
import useAuth from './hooks/useAuth';
import useSidebar from './hooks/useSidebar';
import LoginForm from './components/auth/LoginForm';
import SidebarToggle from './components/navigation/SidebarToggle';
import Sidebar from './components/navigation/Sidebar';
import Dashboard from './Dashboard';
import SimpleDashboard from './components/SimpleDashboard';

const App = () => {
  const { user, userType, loading, logout } = useAuth();
  const { 
    isOpen: sidebarOpen, 
    currentSection, 
    toggleSidebar, 
    navigateToSection, 
    closeSidebar 
  } = useSidebar();

  // Função para renderizar dashboard baseado no tipo de usuário
  const renderDashboard = () => {
    if (userType === 'simple') {
      return <SimpleDashboard onLogout={logout} />;
    }
    
    // Default: Dashboard completo para admin
    return <Dashboard currentSection={currentSection} />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver logado, mostrar login
  if (!user) {
    return <LoginForm />;
  }

  // Layout condicional baseado no tipo de usuário
  if (userType === 'simple') {
    // Layout simplificado para usuários simples (sem sidebar/header)
    return (
      <div className="min-h-screen bg-gray-50">
        {renderDashboard()}
      </div>
    );
  }

  // Layout completo para administradores
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (apenas desktop) */}
      <div className="hidden lg:block">
        <Sidebar 
          isOpen={sidebarOpen}
          currentSection={currentSection}
          onNavigate={navigateToSection}
          onClose={closeSidebar}
          onLogout={logout}
        />
      </div>

      {/* Container principal */}
      <div className="flex-1 flex flex-col">
        {/* Header - MANTIDO mas sem espaçamento desnecessário */}
        <header className="w-full flex items-center justify-between px-6 py-2 bg-gray-50 border-b border-gray-100">
          
          {/* Botão toggle - só aparece quando sidebar está fechado */}
          <div className="flex items-center">
            {!sidebarOpen && (
              <div className="hidden lg:flex items-center">
                <SidebarToggle 
                  isOpen={sidebarOpen}
                  onToggle={toggleSidebar}
                />
              </div>
            )}
          </div>

          {/* Lado Direito: Vazio */}
          <div></div>
        </header>

        {/* Dashboard - COM background matching */}
        <div className="flex-1 bg-gray-50">
          {renderDashboard()}
        </div>
      </div>
    </div>
  );
};

export default App;