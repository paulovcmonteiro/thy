import React from 'react';

const MetricsCard = ({ metrics, showTitle = true }) => {
  const { avgGeneral, percentActive, avgActive } = metrics;
  
  return (
    <div className="mb-4 grid grid-cols-3 gap-4 text-center text-sm">
      <div className="bg-gray-50 p-2 rounded">
        {showTitle && <div className="font-semibold text-gray-700">Média Geral</div>}
        <div className="text-lg text-blue-600">{avgGeneral}%</div>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        {showTitle && <div className="font-semibold text-gray-700">% Semanas Ativas</div>}
        <div className="text-lg text-green-600">{percentActive}%</div>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        {showTitle && <div className="font-semibold text-gray-700">Média Ativas</div>}
        <div className="text-lg text-purple-600">{avgActive}%</div>
      </div>
    </div>
  );
};

// Versão compacta para mostrar nas laterais dos gráficos de hábitos
export const CompactMetricsCard = ({ metrics, classification }) => {
  const { avgGeneral, percentActive, avgActive } = metrics;
  
  return (
    <div className="text-right">
      <div className="grid grid-cols-1 gap-1 text-xs">
        <div className="text-gray-600">
          <span className="font-semibold">Média Geral:</span> {avgGeneral}%
        </div>
        <div className="text-green-600">
          <span className="font-semibold">% Ativas:</span> {percentActive}%
        </div>
        <div className="text-blue-600">
          <span className="font-semibold">Média Ativas:</span> {avgActive}%
        </div>
        {classification && (
          <div className="text-gray-500 mt-1">
            {classification.label} {classification.emoji}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;