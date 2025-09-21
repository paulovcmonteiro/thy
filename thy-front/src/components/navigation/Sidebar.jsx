// src/components/navigation/Sidebar.jsx - ANIMAÇÃO SUAVE
import React from 'react';
import thyLogo from '../../assets/thy.png';

const Sidebar = ({ isOpen, currentSection, onNavigate, onClose, onLogout }) => {
  // Definição dos itens do menu
  const menuItems = [
    { 
      id: 'semana-atual', 
      label: 'Semana Atual', 
      icon: '📅',
      description: 'Progresso da semana em andamento'
    },
    { 
      id: 'semana-anterior', 
      label: 'Semana Anterior', 
      icon: '📋',
      description: 'Análise da última semana completa'
    },
    { 
      id: 'evolucao-geral', 
      label: 'Evolução Geral', 
      icon: '📈',
      description: 'Progresso ao longo do tempo'
    },
    { 
      id: 'performance-habito', 
      label: 'Performance por Hábito', 
      icon: '📊',
      description: 'Análise detalhada por hábito'
    },
    { 
      id: 'conversa-ia', 
      label: 'Conversa com IA', 
      icon: '🤖',
      description: 'Chat contextualizado sobre sua semana'
    },
  ];

  return (
    <div 
      className={`
        h-screen bg-white border-r border-gray-100 flex flex-col
        transition-all duration-500 ease-in-out transform
        ${isOpen 
          ? 'w-72 translate-x-0 opacity-100 shadow-lg' 
          : 'w-0 -translate-x-full opacity-0 shadow-none'
        }
      `}
      style={{
        // Suaviza ainda mais a transição com CSS customizado
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
      }}
    >
      {/* Conteúdo do sidebar - só renderiza quando está abrindo/aberto */}
      {isOpen && (
        <div className="w-72 flex flex-col h-full">
          {/* Header do sidebar com logo */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src={thyLogo} 
                  alt="Thy" 
                  className="h-10 w-auto"
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="Fechar menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 18L15 12L21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Lista de navegação */}
          <nav className="p-4 flex-1">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg text-left 
                    transition-all duration-200 ease-in-out
                    ${currentSection === item.id 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">{item.description}</div>
                  </div>
                  {currentSection === item.id && (
                    <span className="text-blue-500 text-xs">●</span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Footer do sidebar - ações adicionais */}
          <div className="p-4 border-t border-gray-100">
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 text-left transition-colors duration-200">
                <span className="text-lg">⚙️</span>
                <span className="text-sm">Configurações</span>
              </button>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 text-left transition-colors duration-200"
              >
                <span className="text-lg">🚪</span>
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;