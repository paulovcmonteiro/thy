import React, { useState } from 'react';

// Importando todas as seções
import Header from './components/sections/Header.jsx';
import EvolutionSection from './components/sections/EvolutionSection.jsx';
import HabitsSection from './components/sections/HabitsSection.jsx';
import InsightsSection from './components/sections/InsightsSection.jsx';
import WeekAnalysisSection from './components/sections/WeekAnalysisSection.jsx';
import Summary from './components/sections/Summary.jsx';

const PauloHabitAnalysis = () => {
  const [expandedSections, setExpandedSections] = useState({
    section1: true,
    section2: true,
    section3: true,
    section4: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      
      <Header />

      <EvolutionSection
        isExpanded={expandedSections.section1}
        onToggle={() => toggleSection('section1')}
      />

      <HabitsSection
        isExpanded={expandedSections.section2}
        onToggle={() => toggleSection('section2')}
      />

      <InsightsSection
        isExpanded={expandedSections.section3}
        onToggle={() => toggleSection('section3')}
      />

      <WeekAnalysisSection
        isExpanded={expandedSections.section4}
        onToggle={() => toggleSection('section4')}
      />

      <Summary />
      
    </div>
  );
};

export default PauloHabitAnalysis;