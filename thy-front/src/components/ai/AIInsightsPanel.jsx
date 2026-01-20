// src/components/ai/AIInsightsPanel.jsx - Painel de insights da IA
import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Loader2, AlertCircle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateDebriefingInsights } from '../../services/aiService';
import { saveAIInsights } from '../../firebase/debriefingService';

const AIInsightsPanel = ({ 
  weekData, 
  habitData, 
  userResponses = {}, 
  allWeeklyData = null, 
  onInsightsGenerated,
  savedInsights = null,
  savedInsightsGeneratedAt = null
}) => {
  const [insights, setInsights] = useState(savedInsights);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar insights salvos quando o componente monta ou quando savedInsights muda
  useEffect(() => {
    if (savedInsights && savedInsights !== insights) {
      setInsights(savedInsights);
      console.log('🤖 [AIInsightsPanel] Insights salvos carregados:', savedInsights.substring(0, 100) + '...');
    }
  }, [savedInsights]);

  // Função para formatar tempo relativo
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'agora há pouco';
      if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `há ${diffInHours}h`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `há ${diffInDays} dias`;
    } catch (error) {
      return '';
    }
  };

  // Componentes customizados para ReactMarkdown com estilização
  const markdownComponents = {
    // Headers
    h1: ({ children }) => (
      <h1 className="text-xl font-bold text-gray-800 mb-3 mt-4 first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold text-purple-800 mb-2 mt-4 first:mt-0 flex items-center gap-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold text-gray-700 mb-2 mt-3">{children}</h3>
    ),
    // Paragraphs
    p: ({ children }) => (
      <p className="text-sm text-gray-700 mb-2 leading-relaxed">{children}</p>
    ),
    // Bold
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-800">{children}</strong>
    ),
    // Italic
    em: ({ children }) => (
      <em className="italic text-gray-600">{children}</em>
    ),
    // Lists
    ul: ({ children }) => (
      <ul className="space-y-1.5 mb-3 ml-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="space-y-1.5 mb-3 ml-1 list-decimal list-inside">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-sm text-gray-700 flex items-start gap-2">
        <span className="text-purple-500 mt-1">•</span>
        <span className="flex-1">{children}</span>
      </li>
    ),
    // Horizontal rule (separators)
    hr: () => (
      <hr className="my-4 border-t border-purple-200" />
    ),
    // Code (inline)
    code: ({ children }) => (
      <code className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs font-mono">
        {children}
      </code>
    ),
    // Blockquote
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-purple-300 pl-3 py-1 my-2 bg-purple-50 rounded-r">
        {children}
      </blockquote>
    ),
  };

  const handleGenerateInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Gerar insights com a IA
      const result = await generateDebriefingInsights(weekData, habitData, userResponses, allWeeklyData);
      
      if (result.success) {
        setInsights(result.insights);
        
        // 2. Salvar insights no Firebase
        try {
          console.log('📅 [DEBUG] weekData completo:', weekData);
          console.log('📅 [DEBUG] weekData.weekStart:', weekData.weekStart, typeof weekData.weekStart);
          console.log('📅 [DEBUG] weekData.weekEnd:', weekData.weekEnd, typeof weekData.weekEnd);
          
          // Usar weekEnd (sábado) em vez de weekStart (domingo) pois debriefings são salvos com data do sábado
          const saveResult = await saveAIInsights(weekData.weekEnd, result.insights);
          if (saveResult.success) {
            console.log('✅ [AIInsightsPanel] Insights salvos no Firebase');
          } else {
            console.warn('⚠️ [AIInsightsPanel] Falha ao salvar insights:', saveResult.error);
          }
        } catch (saveError) {
          console.error('❌ [AIInsightsPanel] Erro ao salvar insights:', saveError);
          // Não mostra erro para o usuário, pois os insights já foram gerados
        }
        
        // 3. Notificar componente pai
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
            <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
              {/* Timestamp dos insights */}
              {savedInsightsGeneratedAt && (
                <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Gerado {formatTimeAgo(savedInsightsGeneratedAt)}</span>
                </div>
              )}
              
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {insights}
                </ReactMarkdown>
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