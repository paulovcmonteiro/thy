// src/components/ai/AIInsightsPanel.jsx - Painel de insights da IA
import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Loader2, AlertCircle, Clock } from 'lucide-react';
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

  // Função para limpar formatação Markdown (remover asteriscos)
  const cleanMarkdownText = (text) => {
    return text.replace(/\*\*/g, ''); // Remove todos os **
  };

  // Função para formatar texto em tópicos legíveis
  const formatTextIntoTopics = (text, sectionTitle) => {
    // Seções que devem ser formatadas em tópicos
    const sectionsToFormat = ['Parabéns', 'Motivação'];
    const shouldFormat = sectionsToFormat.some(section => sectionTitle.includes(section));
    
    if (!shouldFormat) return text;
    
    // Quebrar texto por frases (pontos finais, exclamações)
    const sentences = text.split(/[.!]\s+/).filter(sentence => sentence.trim().length > 0);
    
    // Se há múltiplas frases, transformar em lista
    if (sentences.length > 1) {
      return sentences.map(sentence => `- ${sentence.trim()}${sentence.includes('.') || sentence.includes('!') ? '' : '.'}`).join('\n');
    }
    
    return text;
  };

  // Função para renderizar insights estruturados
  const renderStructuredInsights = (text) => {
    // Limpar asteriscos do texto completo antes de processar
    const cleanText = cleanMarkdownText(text);
    const sections = cleanText.split('##').filter(section => section.trim());
    
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0].trim();
      const rawContent = lines.slice(1).join('\n').trim();
      
      // Aplicar formatação em tópicos para seções específicas
      const content = formatTextIntoTopics(rawContent, title);
      
      // Extrair ícone da seção do próprio título (se houver)
      const getIcon = (title) => {
        // Extrair primeiro emoji do título, se houver
        const emojiMatch = title.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
        if (emojiMatch) return emojiMatch[0];
        
        // Fallback para casos sem emoji
        if (title.includes('Parabéns')) return '🎉';
        if (title.includes('Insights')) return '🔍';
        if (title.includes('Comparação')) return '📊';
        if (title.includes('Sugestões')) return '💡';
        if (title.includes('Motivação')) return '🚀';
        return '📋';
      };

      // Identificar cor da seção
      const getColors = (title) => {
        if (title.includes('🎉') || title.includes('Parabéns')) 
          return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' };
        if (title.includes('🔍') || title.includes('Insights')) 
          return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' };
        if (title.includes('📊') || title.includes('Comparação')) 
          return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' };
        if (title.includes('💡') || title.includes('Sugestões')) 
          return { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' };
        if (title.includes('🚀') || title.includes('Motivação')) 
          return { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' };
        return { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' };
      };

      const colors = getColors(title);
      
      return (
        <div key={index} className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{getIcon(title)}</span>
            <h3 className={`font-semibold ${colors.text}`}>
              {title.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()}
            </h3>
          </div>
          
          <div className={`${colors.text} space-y-2`}>
            {content.split('\n').map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return null;
              
              // Renderizar lista com bullets
              if (trimmedLine.startsWith('- ')) {
                const bulletContent = trimmedLine.substring(2);
                
                // Destacar fontes de dados entre parênteses, preservando emojis
                const highlightedContent = bulletContent.replace(
                  /\*(.*?)\*/g, 
                  '<span class="text-xs bg-white/60 px-2 py-1 rounded font-medium">$1</span>'
                );
                
                return (
                  <div key={lineIndex} className="flex items-start gap-2">
                    <span className="text-xs mt-1.5 opacity-60">•</span>
                    <div 
                      className="flex-1 text-sm"
                      dangerouslySetInnerHTML={{ __html: highlightedContent }}
                    />
                  </div>
                );
              }
              
              // Renderizar parágrafo normal, preservando emojis
              return (
                <p key={lineIndex} className="text-sm">
                  {trimmedLine}
                </p>
              );
            })}
          </div>
        </div>
      );
    });
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
              
              <div className="text-gray-700 leading-relaxed space-y-4">
                {renderStructuredInsights(insights)}
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