// src/hooks/useSidebar.js
import { useState, useEffect } from 'react';

const useSidebar = () => {
  // Estado do menu lateral (aberto/fechado)
  const [isOpen, setIsOpen] = useState(false);
  
  // Seção atualmente ativa
  const [currentSection, setCurrentSection] = useState('ultima-semana');
  
  // Carrega preferência do usuário do localStorage na inicialização
  useEffect(() => {
    const savedPreference = localStorage.getItem('sidebar-preference');
    if (savedPreference === 'open') {
      setIsOpen(true);
    }
  }, []);

  // Função para alternar estado do sidebar
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // Salva preferência no localStorage
    localStorage.setItem('sidebar-preference', newState ? 'open' : 'closed');
  };

  // Função para navegar entre seções
  const navigateToSection = (sectionId) => {
    setCurrentSection(sectionId);
    
    // Em mobile, fecha o sidebar após navegar
    if (window.innerWidth < 768) {
      setIsOpen(false);
      localStorage.setItem('sidebar-preference', 'closed');
    }
  };

  // Função para fechar sidebar (útil para overlay clicks)
  const closeSidebar = () => {
    setIsOpen(false);
    localStorage.setItem('sidebar-preference', 'closed');
  };

  return {
    // Estados
    isOpen,
    currentSection,
    
    // Ações
    toggleSidebar,
    navigateToSection,
    closeSidebar
  };
};

export default useSidebar;