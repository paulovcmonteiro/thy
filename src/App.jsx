// src/App.jsx - VERSÃO CORRIGIDA COM LAYOUT FLEXBOX
import React from 'react';
import useAuth from './hooks/useAuth';
import useSidebar from './hooks/useSidebar';
import LoginForm from './components/auth/LoginForm';
import SidebarToggle from './components/navigation/SidebarToggle';
import Sidebar from './components/navigation/Sidebar';
import Dashboard from './Dashboard';

const App = () => {
  const { user, loading, logout } = useAuth();
  const { 
    isOpen: sidebarOpen, 
    currentSection, 
    toggleSidebar, 
    navigateToSection, 
    closeSidebar 
  } = useSidebar();

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

  // Se estiver logado, mostrar app principal com layout flexbox
  return (
    <div className="min-h-screen flex bg-gray-50">
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
        {/* Header */}
        <header className="w-full flex items-center justify-between px-6 py-4 bg-white border-b border-gray-50">
          
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

        {/* Conteúdo principal (Dashboard) */}
        <div className="flex-1">
          <Dashboard currentSection={currentSection} />
        </div>
      </div>
    </div>
  );
};

export default App;