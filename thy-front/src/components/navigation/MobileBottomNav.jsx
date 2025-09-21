// src/components/navigation/MobileBottomNav.jsx
import React from 'react';

const MobileBottomNav = ({ currentSection, onNavigate }) => {
  const mobileMenuItems = [
    { 
      id: 'semana-atual', 
      label: 'Atual', 
      icon: '📅'
    },
    { 
      id: 'semana-anterior', 
      label: 'Anterior', 
      icon: '📋'
    },
    { 
      id: 'evolucao-geral', 
      label: 'Evolução', 
      icon: '📈'
    },
    { 
      id: 'performance-habito', 
      label: 'Performance', 
      icon: '📊'
    },
    { 
      id: 'conversa-ia', 
      label: 'IA Chat', 
      icon: '🤖'
    },
  ];

  return (
    <div className="lg:hidden">
      {/* Espaçador para evitar que o conteúdo fique atrás da bottom nav */}
      <div className="h-20"></div>
      
      {/* Bottom navigation fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-2 z-30">
        <div className="flex items-center justify-around">
          {mobileMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-colors duration-200 min-w-0 flex-1
                ${currentSection === item.id 
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
  );
};

export default MobileBottomNav;