// src/components/auth/AuthHeader.jsx - LAYOUT SIMPLES COM FLEX
import React from 'react';
import { LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useSidebar from '../../hooks/useSidebar';
import SidebarToggle from '../navigation/SidebarToggle';
import Sidebar from '../navigation/Sidebar';

const AuthHeader = () => {
  const { logout } = useAuth();
  const { 
    isOpen: sidebarOpen, 
    currentSection, 
    toggleSidebar, 
    navigateToSection, 
    closeSidebar 
  } = useSidebar();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (apenas desktop) */}
      <div className="hidden lg:block">
        <Sidebar 
          isOpen={sidebarOpen}
          currentSection={currentSection}
          onNavigate={navigateToSection}
          onClose={closeSidebar}
        />
      </div>

      {/* Container principal */}
      <div className="flex-1 flex flex-col">
        {/* Header Principal */}
        <header className="w-full flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          
          {/* Lado Esquerdo: Menu + Logo */}
          <div className="flex items-center gap-6">
            {/* Botão do Menu (apenas desktop) */}
            <div className="hidden lg:flex items-center">
              <SidebarToggle 
                isOpen={sidebarOpen}
                onToggle={toggleSidebar}
              />
            </div>
            
            {/* Logo Thy */}
            <div className="flex items-center">
              <img 
                src="/assets/thy-logo.png" 
                alt="Thy" 
                className="h-8 w-auto"
              />
            </div>
          </div>

          {/* Lado Direito: Info + Logout */}
          <div className="flex items-center gap-4">
            {/* Info da seção atual (só desktop) */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
              <span>📅 {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            
            {/* Botão de sair */}
            <button 
              onClick={logout} 
              className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-50" 
              title="Sair"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Área do conteúdo (Dashboard vai aqui) */}
        <div className="flex-1">
          {/* O Dashboard será renderizado aqui pelo App.jsx */}
        </div>
      </div>
    </div>
  );
};

export default AuthHeader;