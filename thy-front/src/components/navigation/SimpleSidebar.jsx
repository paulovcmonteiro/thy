// src/components/navigation/SimpleSidebar.jsx - Sidebar simplificada para usuários simples
import React from 'react';
import thyLogo from '../../assets/thy.png';

const SimpleSidebar = ({ isOpen, currentSection, onNavigate, onClose, onLogout }) => {
  // Menu simplificado para usuários simples
  const menuItems = [
    { 
      id: 'meu-habito', 
      label: 'Meu Hábito', 
      icon: '✅',
      description: 'Acompanhar meu progresso diário'
    },
    { 
      id: 'evolucao', 
      label: 'Evolução', 
      icon: '📈',
      description: 'Histórico de progresso'
    }
  ];

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 lg:static lg:inset-0
    `}>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Conteúdo da sidebar */}
      <div className="relative flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src={thyLogo} alt="Thy Logo" className="w-8 h-8" />
            <div>
              <h1 className="text-lg font-bold text-gray-800">Thy</h1>
              <p className="text-xs text-gray-500">Hábitos Simples</p>
            </div>
          </div>
          
          {/* Botão de fechar (apenas mobile) */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-500">✕</span>
          </button>
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

        {/* Footer do sidebar - botão de logout */}
        <div className="p-4 border-t border-gray-100">
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
  );
};

export default SimpleSidebar;