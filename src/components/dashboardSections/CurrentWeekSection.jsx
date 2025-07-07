// src/components/dashboardSections/CurrentWeekSection.jsx
import React from 'react';

const CurrentWeekSection = ({ data, isExpanded, onToggle }) => {
  return (
    <div className="space-y-6">
      {/* Título da Seção */}
      <div className="text-center">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
          Semana Atual
        </h1>
        <p className="text-gray-600">
          Acompanhe seu progresso desta semana em tempo real
        </p>
      </div>

      {/* Conteúdo Temporário - Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Semana Atual em Construção
          </h3>
          <p className="text-gray-500">
            Esta seção mostrará o progresso da semana atual.<br/>
            Em breve teremos gráficos e métricas detalhadas.
          </p>
        </div>
      </div>

      {/* Info de Debug (temporária) */}
      {data && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            Debug - Dados Disponíveis:
          </h4>
          <div className="text-sm text-blue-700">
            <p>Semanas totais: {data.analysisInfo?.totalWeeks || 0}</p>
            <p>Período: {data.analysisInfo?.startDate} até {data.analysisInfo?.endDate}</p>
            <p>Hábitos: {data.habitsList?.length || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentWeekSection;