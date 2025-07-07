// src/components/navigation/Sidebar.jsx
import React from 'react';

const Sidebar = ({ isOpen, currentSection, onNavigate, onClose, onLogout }) => {
  // Definição dos itens do menu
  const menuItems = [
    { 
      id: 'ultima-semana', 
      label: 'Última Semana', 
      icon: '📅',
      description: 'Foco na semana atual'
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
      id: 'insights-principais', 
      label: 'Insights Principais', 
      icon: '💡',
      description: 'Descobertas e padrões'
    }
  ];

  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-50 flex flex-col">
      {/* Header do sidebar com logo */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/assets/thy-logo.png" 
              alt="Thy" 
              className="h-8 w-auto"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-700"
            title="Fechar menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11 4L7 8L11 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 4L3 8L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
              onClick={() => {
                console.log('Clicando em:', item.id);
                onNavigate(item.id);
              }}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors duration-200
                ${currentSection === item.id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-gray-500 mt-1">{item.description}</div>
              </div>
              {currentSection === item.id && (
                <span className="text-blue-500 text-xs">●</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer do sidebar - ações adicionais */}
      <div className="p-4">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 text-left">
            <span className="text-lg">⚙️</span>
            <span className="text-sm">Configurações</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 text-left"
          >
            <span className="text-lg">🚪</span>
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;