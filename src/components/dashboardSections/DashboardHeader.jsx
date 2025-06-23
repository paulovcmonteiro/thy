import React from 'react';
import { Target } from 'lucide-react';

const DashboardHeader = ({ analysisInfo }) => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
        <Target className="text-blue-600" />
        Análise de Hábitos - {analysisInfo?.userName || 'Usuário'}
      </h1>
      <p className="text-gray-600">
        Período: {analysisInfo?.startDate || 'N/A'} a {analysisInfo?.endDate || 'N/A'}
      </p>
    </div>
  );
};

export default DashboardHeader;