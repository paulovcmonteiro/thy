// src/components/ai/AIInsightsPanel.jsx - Painel de insights da IA
import React, { useState } from 'react';
import { Brain, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { generateDebriefingInsights } from '../../services/aiService';

const AIInsightsPanel = ({ weekData, habitData, userResponses = {}, onInsightsGenerated }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateDebriefingInsights(weekData, habitData, userResponses);
      
      if (result.success) {
        setInsights(result.insights);
        onInsightsGenerated?.(result.insights);
      } else {
        setError(result.error || 'Erro ao gerar insights');
      }
    } catch (err) {
      setError('Erro de conexão com a IA');
      console.error('Erro ao gerar insights:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Insights da IA</h3>
            <p className="text-sm text-gray-600">Análise inteligente da sua semana</p>
          </div>
        </div>
        
        <button
          onClick={handleGenerateInsights}
          disabled={loading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${loading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
            }
          `}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {insights ? 'Gerar Novos Insights' : 'Gerar Insights'}
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[120px]">
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Erro ao conectar com a IA</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <p className="text-red-600 text-xs mt-2">
                Verifique se o backend está rodando em localhost:3001
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Analisando seus hábitos...</p>
            <p className="text-xs text-gray-400 mt-1">Isso pode levar alguns segundos</p>
          </div>
        )}

        {insights && !loading && (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {insights}
                </div>
              </div>
            </div>
            
            {/* Feedback buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-purple-100">
              <span className="text-xs text-gray-500">Esse insight foi útil?</span>
              <button className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                👍 Sim
              </button>
              <button className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                👎 Não
              </button>
            </div>
          </div>
        )}

        {!insights && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Brain className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium">Pronto para gerar insights</p>
            <p className="text-xs text-center text-gray-400 mt-1">
              Clique no botão acima para analisar sua semana com IA
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;