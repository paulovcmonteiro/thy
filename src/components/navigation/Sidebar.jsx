// src/components/navigation/Sidebar.jsx
import React from 'react';

const Sidebar = ({ isOpen, currentSection, onNavigate, onClose }) => {
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
    <>
      {/* Overlay escuro (apenas desktop) */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:block hidden"
        onClick={onClose}
      />
      
      {/* Menu lateral */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header do sidebar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Habit Tracker</h2>
              <p className="text-sm text-gray-500 mt-1">Navegação</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              title="Fechar menu"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>

        {/* Lista de navegação */}
        <nav className="p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors duration-200
                  ${currentSection === item.id 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                </div>
                {currentSection === item.id && (
                  <span className="text-blue-500 text-sm">●</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer do sidebar - ações adicionais */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 text-left">
              <span className="text-lg">⚙️</span>
              <span className="text-sm">Configurações</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 text-left">
              <span className="text-lg">🚪</span>
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;