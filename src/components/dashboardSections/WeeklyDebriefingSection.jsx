// components/dashboardSections/WeeklyDebriefingSection.jsx - SUBSTITUI WeeklyReviewSection
import React, { useState, useEffect } from 'react';
import { Calendar, Star, TrendingUp, MessageSquare, Target, Clock } from 'lucide-react';
import CollapsibleSection from '../commonUI/CollapsibleSection';
import { getLastCompletedDebriefing, formatWeekDate } from '../../firebase/debriefingService';

const WeeklyDebriefingSection = ({ isExpanded, onToggle }) => {
  const [lastDebriefing, setLastDebriefing] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carregar último debriefing finalizado
  const loadLastDebriefing = async () => {
    setLoading(true);
    try {
      const result = await getLastCompletedDebriefing();
      
      if (result.success && result.data) {
        setLastDebriefing(result.data);
        console.log('📊 [DebriefingSection] Último debriefing carregado:', result.data);
      } else {
        setLastDebriefing(null);
        console.log('ℹ️ [DebriefingSection] Nenhum debriefing finalizado encontrado');
      }
      
    } catch (error) {
      console.error('❌ [DebriefingSection] Erro ao carregar debriefing:', error);
      setLastDebriefing(null);
    } finally {
      setLoading(false);
    }
  };

  // Carregar quando a seção for expandida
  useEffect(() => {
    if (isExpanded) {
      loadLastDebriefing();
    }
  }, [isExpanded]);

  // Formatar data para exibição
  const formatDisplayDate = (weekDate) => {
    try {
      const date = new Date(weekDate + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        weekday: 'long'
      });
    } catch (error) {
      return weekDate;
    }
  };

  // Renderizar estrelas da avaliação
  const renderStars = (rating) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          ({rating}/5)
        </span>
      </div>
    );
  };

  // Obter texto da avaliação
  const getRatingText = (rating) => {
    const texts = {
      1: 'Muito ruim',
      2: 'Ruim', 
      3: 'Satisfatório',
      4: 'Bom',
      5: 'Muito bom!'
    };
    return texts[rating] || '';
  };

  const content = (
    <div className="space-y-6">
      
      {/* Header com info sobre a funcionalidade */}
      <div className="flex justify-between items-start">
        <p className="text-gray-600">
          Reflexão da última semana finalizada com debriefing completo
        </p>
        <button
          onClick={loadLastDebriefing}
          disabled={loading}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Recarregar'}
        </button>
      </div>

      {/* Conteúdo principal */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Carregando debriefing...</span>
        </div>
      ) : !lastDebriefing ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium">Nenhum debriefing finalizado ainda</p>
          <p className="text-sm">Complete seu primeiro debriefing semanal para ver as reflexões aqui</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Header do debriefing */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-800">
                  📊 Debriefing da Semana
                </h3>
                <p className="text-purple-600">
                  {formatDisplayDate(lastDebriefing.weekDate)}
                </p>
              </div>
              
              {/* Avaliação da semana */}
              {lastDebriefing.weekRating && (
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Avaliação da semana</div>
                  {renderStars(lastDebriefing.weekRating)}
                  <div className="text-sm font-medium text-purple-700 mt-1">
                    {getRatingText(lastDebriefing.weekRating)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grid com as reflexões */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* O que me orgulho */}
            {lastDebriefing.proudOf && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp size={16} />
                  Me orgulho de...
                </h4>
                <p className="text-green-700 text-sm whitespace-pre-wrap">
                  {lastDebriefing.proudOf}
                </p>
              </div>
            )}

            {/* O que não foi tão bom */}
            {lastDebriefing.notSoGood && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Pontos de atenção
                </h4>
                <p className="text-orange-700 text-sm whitespace-pre-wrap">
                  {lastDebriefing.notSoGood}
                </p>
              </div>
            )}

            {/* O que quero melhorar */}
            {lastDebriefing.improveNext && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Target size={16} />
                  Foco para próxima semana
                </h4>
                <p className="text-blue-700 text-sm whitespace-pre-wrap">
                  {lastDebriefing.improveNext}
                </p>
              </div>
            )}
          </div>

          {/* Comentários dos hábitos (se houver) */}
          {lastDebriefing.habitComments && Object.keys(lastDebriefing.habitComments).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-semibold text-gray-800 mb-3">
                💭 Reflexões por Hábito
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(lastDebriefing.habitComments).map(([habitKey, comment]) => {
                  if (!comment || comment.trim() === '') return null;
                  
                  // Mapear chaves para emojis/nomes
                  const habitLabels = {
                    meditar: '🧘 Meditar',
                    medicar: '💊 Medicar',
                    exercitar: '🏃 Exercitar',
                    comunicar: '💬 Comunicar',
                    alimentar: '🍎 Alimentar',
                    estudar: '📚 Estudar',
                    descansar: '😴 Descansar'
                  };
                  
                  return (
                    <div key={habitKey} className="bg-white rounded p-3 border border-gray-200">
                      <h5 className="font-medium text-gray-800 mb-1">
                        {habitLabels[habitKey] || habitKey}
                      </h5>
                      <p className="text-gray-600 text-sm">
                        {comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadados */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                Finalizado em: {lastDebriefing.completedAt ? 
                  new Date(lastDebriefing.completedAt).toLocaleDateString('pt-BR') : 
                  new Date(lastDebriefing.updatedAt).toLocaleDateString('pt-BR')
                }
              </span>
              
              <span>
                Semana: {formatWeekDate(lastDebriefing.weekDate)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <CollapsibleSection
      title="🎯 Debriefing da Semana"
      subtitle="Reflexão e insights da última semana finalizada"
      isExpanded={isExpanded}
      onToggle={onToggle}
      className="mb-6"
      badge={lastDebriefing ? '✅' : '⏳'}
    >
      {content}
    </CollapsibleSection>
  );
};

export default WeeklyDebriefingSection;