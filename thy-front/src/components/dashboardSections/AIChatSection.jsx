// src/components/dashboardSections/AIChatSection.jsx - Conversa com IA
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2, Brain, Calendar, AlertCircle } from 'lucide-react';
import { collectDebriefingData, chatWithAI } from '../../services/aiChatService';
import { getLastCompletedDebriefing } from '../../firebase/debriefingService';
import { getDayHabits } from '../../firebase/habitsService';
import useDashboardData from '../../hooks/useDashboardData';

const AIChatSection = ({ data, isExpanded, onToggle }) => {
  const { data: dashboardData } = useDashboardData();
  
  // Estados principais
  const [chatState, setChatState] = useState('idle'); // idle, loading, ready, error
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Estados dos dados
  const [contextData, setContextData] = useState(null);
  const [lastDebriefing, setLastDebriefing] = useState(null);
  const [previousWeekData, setPreviousWeekData] = useState({});
  
  // Ref para scroll automático
  const messagesEndRef = useRef(null);

  // Scroll automático para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carregar dados quando o componente for montado
  useEffect(() => {
    if (isExpanded && chatState === 'idle') {
      loadDebriefingContext();
    }
  }, [isExpanded]);

  // Função para carregar contexto completo
  const loadDebriefingContext = async () => {
    setChatState('loading');
    
    try {
      // 1. Buscar último debriefing finalizado
      const debriefingResult = await getLastCompletedDebriefing();
      
      if (!debriefingResult.success || !debriefingResult.data) {
        setChatState('error');
        setMessages([{
          id: 1,
          type: 'system',
          content: 'Não foi possível encontrar um debriefing finalizado. Complete um debriefing semanal primeiro.',
          timestamp: new Date()
        }]);
        return;
      }

      const debriefing = debriefingResult.data;
      setLastDebriefing(debriefing);

      // 2. Carregar dados diários da semana
      const weekData = await loadWeekData(debriefing.weekDate);
      setPreviousWeekData(weekData);

      // 3. Coletar todos os dados para IA
      console.log('🔍 [AIChatSection] Chamando collectDebriefingData com:');
      console.log('  - debriefing:', debriefing);
      console.log('  - weekData:', weekData);
      console.log('  - dashboardData:', dashboardData);
      
      const collectedData = collectDebriefingData(debriefing, weekData, dashboardData);
      
      if (!collectedData) {
        console.error('❌ [AIChatSection] collectDebriefingData retornou null');
        setChatState('error');
        setMessages([{
          id: 1,
          type: 'system',
          content: 'Erro ao coletar dados do debriefing. Verifique o console para mais detalhes.',
          timestamp: new Date()
        }]);
        return;
      }

      setContextData(collectedData);
      setChatState('ready');

      // Log para debug (remover depois)
      console.log('🤖 Dados coletados para IA:', collectedData);

      // Mensagem de boas-vindas
      const weekStart = new Date(collectedData.weekData.weekStart).toLocaleDateString('pt-BR');
      const weekEnd = new Date(collectedData.weekData.weekEnd).toLocaleDateString('pt-BR');
      
      setMessages([{
        id: 1,
        type: 'ai',
        content: `Olá! 👋 Estou pronto para conversar sobre sua semana de ${weekStart} a ${weekEnd}. 

Tenho acesso a todos os seus dados dessa semana:
📊 Performance dos ${Object.keys(collectedData.habitAnalysis).length} hábitos
📝 ${collectedData.metadata.totalDaysWithData} dias de dados diários
💭 ${Object.keys(collectedData.weekReflection.habitComments).length} comentários sobre hábitos
⭐ Sua reflexão final (nota ${collectedData.weekReflection.weekRating}/5)

O que você gostaria de saber ou discutir sobre essa semana?`,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Erro ao carregar contexto:', error);
      setChatState('error');
      setMessages([{
        id: 1,
        type: 'system',
        content: 'Erro inesperado ao carregar dados. Tente recarregar a página.',
        timestamp: new Date()
      }]);
    }
  };

  // Carregar dados da semana (similar ao WeeklyDebriefingSection)
  const loadWeekData = async (weekDate) => {
    const weekDates = getWeekDates(weekDate);
    const weekData = {};
    
    for (const dayInfo of weekDates) {
      try {
        const dayData = await getDayHabits(dayInfo.date);
        
        if (dayData.success && dayData.data) {
          weekData[dayInfo.date] = {
            ...dayData.data,
            dayInfo: dayInfo,
            hasData: true
          };
        } else {
          weekData[dayInfo.date] = {
            dayInfo: dayInfo,
            hasData: false
          };
        }
      } catch (error) {
        weekData[dayInfo.date] = {
          dayInfo: dayInfo,
          hasData: false
        };
      }
    }
    
    return weekData;
  };

  // Calcular datas da semana (copiado do WeeklyDebriefingSection)
  const getWeekDates = (weekDate) => {
    if (!weekDate) return [];
    
    try {
      const inputDate = new Date(weekDate + 'T00:00:00');
      const dayOfWeek = inputDate.getDay();
      const daysToSunday = dayOfWeek;
      
      const sunday = new Date(inputDate);
      sunday.setDate(inputDate.getDate() - daysToSunday);
      
      const weekDates = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        
        const dateStr = date.toISOString().split('T')[0];
        const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i];
        
        weekDates.push({
          date: dateStr,
          dayName: dayName,
          dayNumber: date.getDate(),
          isToday: false
        });
      }
      
      return weekDates;
    } catch (error) {
      console.error('Erro ao calcular datas da semana:', error);
      return [];
    }
  };

  // Enviar mensagem para IA
  const sendMessage = async () => {
    if (!inputMessage.trim() || sending || chatState !== 'ready') return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      // TODO: Implementar chamada real para N8N
      // Por enquanto, resposta mockada
      const response = await mockAIResponse(userMessage.content, contextData);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: 'Erro ao enviar mensagem. Tente novamente.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  // Resposta mockada (remover quando integrar com N8N)
  const mockAIResponse = async (message, data) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
    
    if (message.toLowerCase().includes('hábito')) {
      const bestHabit = data.metadata.weekSummary.bestHabit;
      const worstHabit = data.metadata.weekSummary.worstHabit;
      return `Sobre seus hábitos dessa semana:

🏆 **Melhor performance**: ${bestHabit.habit} com ${bestHabit.value}% de completude
⚠️ **Precisa de atenção**: ${worstHabit.habit} com ${worstHabit.value}% de completude

Completude geral da semana: ${data.metadata.weekSummary.weekCompletude}%`;
    }
    
    if (message.toLowerCase().includes('peso')) {
      const weightData = data.evolutionData.weightData;
      if (weightData.length > 0) {
        const currentWeight = weightData[weightData.length - 1];
        return `Sobre seu peso: ${currentWeight.peso}kg na semana analisada. Quer que eu analise a evolução ao longo das últimas semanas?`;
      }
    }
    
    return `Entendi sua pergunta sobre: "${message}". 

Baseado nos seus dados dessa semana, posso te ajudar com análises sobre:
• Performance dos hábitos
• Evolução do peso
• Padrões nas suas observações diárias
• Comparação com semanas anteriores

O que especificamente você gostaria de saber?`;
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Renderizar mensagem
  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : isSystem 
              ? 'bg-orange-100 text-orange-800 border border-orange-200'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {!isUser && !isSystem && (
            <div className="flex items-center gap-2 mb-1">
              <Brain size={16} className="text-purple-600" />
              <span className="text-xs font-medium text-purple-600">IA</span>
            </div>
          )}
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
            {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-purple-600" size={24} />
            Conversa com IA
          </h3>
          <p className="text-gray-600 text-sm">
            Chat contextualizado sobre sua última semana analisada
          </p>
        </div>
        
        {/* Status indicator */}
        {lastDebriefing && (
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              <span>Semana: {new Date(lastDebriefing.weekDate).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className={`text-xs ${chatState === 'ready' ? 'text-green-600' : 'text-gray-500'}`}>
              {chatState === 'ready' ? '✅ Contexto carregado' : 'Carregando...'}
            </div>
          </div>
        )}
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg border border-gray-200 h-96 flex flex-col">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatState === 'loading' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-2 text-purple-600" size={32} />
                <p className="text-gray-600">Carregando contexto da sua semana...</p>
              </div>
            </div>
          )}

          {chatState === 'error' && messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="mx-auto mb-2 text-red-500" size={32} />
                <p className="text-gray-600">Erro ao carregar dados</p>
                <button 
                  onClick={loadDebriefingContext}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {messages.map(renderMessage)}
          
          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-sm text-gray-600">IA está pensando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={chatState === 'ready' ? "Pergunte sobre sua semana..." : "Carregando..."}
              disabled={chatState !== 'ready' || sending}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || chatState !== 'ready' || sending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </button>
          </div>
          
          {chatState === 'ready' && (
            <div className="mt-2 text-xs text-gray-500">
              💡 Pergunte sobre hábitos, peso, observações diárias ou padrões da semana
            </div>
          )}
        </div>
      </div>

      {/* Debug Info (remover depois) */}
      {contextData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">
            Debug - Dados Carregados:
          </h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>📊 Hábitos analisados: {Object.keys(contextData.habitAnalysis).length}</p>
            <p>📅 Dias com dados: {contextData.metadata.totalDaysWithData}</p>
            <p>📝 Dias com observações: {contextData.metadata.totalDaysWithData}</p>
            <p>⭐ Nota da semana: {contextData.weekReflection.weekRating}/5</p>
            <p>💬 Comentários sobre hábitos: {Object.keys(contextData.weekReflection.habitComments).length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatSection;