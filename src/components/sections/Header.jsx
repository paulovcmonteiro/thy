import React from 'react';
import { Target } from 'lucide-react';

// Importando dados
import { analysisInfo } from '../../data/habitData.js';

const Header = () => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
        <Target className="text-blue-600" />
        Análise de Hábitos - {analysisInfo.userName}
      </h1>
      <p className="text-gray-600">
        Período: {analysisInfo.startDate} a {analysisInfo.endDate}
      </p>
    </div>
  );
};

export default Header;