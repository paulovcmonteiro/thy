// src/components/navigation/SidebarToggle.jsx
import React, { useState } from 'react';

const SidebarToggle = ({ isOpen, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determina qual ícone mostrar baseado no estado
  const getIcon = () => {
    if (isOpen) {
      // Quando aberto: sempre mostrar setinhas fechando
      return '<<';
    } else {
      // Quando fechado: mostrar hambúrguer normal ou setinhas abrindo no hover
      return isHovered ? '>>' : '☰';
    }
  };

  // Estilo do botão baseado no estado
  const getButtonStyle = () => {
    const baseStyle = "p-3 rounded-lg transition-all duration-200 text-gray-700 hover:text-gray-900 hover:bg-gray-100";
    
    if (isOpen) {
      return `${baseStyle} bg-gray-50 border border-gray-200`;
    }
    
    return baseStyle;
  };

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={getButtonStyle()}
      title={isOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
    >
      <span className="text-2xl font-medium select-none">
        {getIcon()}
      </span>
    </button>
  );
};

export default SidebarToggle;