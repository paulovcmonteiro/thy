// src/components/navigation/SidebarToggle.jsx - MELHORADO
import React, { useState } from 'react';

const SidebarToggle = ({ isOpen, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determina qual ícone mostrar baseado no estado
  const getIcon = () => {
    if (isOpen) {
      // Quando aberto: sempre mostrar setinhas fechando (mais sutis)
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-600">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 18L15 12L21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      // Quando fechado: mostrar hambúrguer normal ou setinhas abrindo no hover
      if (isHovered) {
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-600">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 18L9 12L3 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      } else {
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-600">
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      }
    }
  };

  // Estilo do botão baseado no estado
  const getButtonStyle = () => {
    const baseStyle = "p-2.5 rounded-lg transition-all duration-300 ease-in-out text-gray-600 hover:text-gray-800 hover:bg-gray-100";
    
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
      <div className="transition-transform duration-300 ease-in-out">
        {getIcon()}
      </div>
    </button>
  );
};

export default SidebarToggle;