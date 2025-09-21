// firebase/debriefingService.js - SERVIÇOS PARA DEBRIEFING SEMANAL
import { 
    collection, 
    addDoc, 
    updateDoc, 
    doc, 
    getDoc, 
    getDocs,
    query, 
    where,
    orderBy,
    limit,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from './config';
  
  // Nome da coleção no Firestore
  const DEBRIEFING_COLLECTION = 'weeklyDebriefings';
  
  /**
   * Salva ou atualiza um debriefing semanal
   * @param {string} weekDate - Data da semana no formato YYYY-MM-DD (sábado)
   * @param {Object} debriefingData - Dados do debriefing
   * @returns {Promise<Object>} Resultado da operação
   */
  export const saveDebriefing = async (weekDate, debriefingData) => {
    try {
      console.log('💾 [debriefingService] Salvando debriefing para semana:', weekDate);
      
      // Validar dados obrigatórios
      if (!weekDate) {
        throw new Error('Campo "weekDate" é obrigatório');
      }
  
      // Verificar se já existe um debriefing para esta semana
      const existingDebriefing = await getDebriefing(weekDate);
      
      const dataToSave = {
        weekDate,
        status: debriefingData.status || 'in_progress',
        
        // Comentários por hábito (Página 2)
        habitComments: debriefingData.habitComments || {},
        
        // Reflexão final (Página 3)
        weekRating: debriefingData.weekRating || null,
        proudOf: debriefingData.proudOf || '',
        notSoGood: debriefingData.notSoGood || '',
        improveNext: debriefingData.improveNext || '',
        
        // Insights da IA (Novos campos)
        aiInsights: debriefingData.aiInsights || null,
        aiInsightsGeneratedAt: debriefingData.aiInsightsGeneratedAt || null,
        
        updatedAt: serverTimestamp()
      };
  
      if (existingDebriefing.success && existingDebriefing.data) {
        // Atualizar debriefing existente
        const docRef = doc(db, DEBRIEFING_COLLECTION, existingDebriefing.data.id);
        await updateDoc(docRef, dataToSave);
        
        console.log('✅ [debriefingService] Debriefing atualizado com sucesso');
        return { 
          success: true, 
          data: { id: existingDebriefing.data.id, ...dataToSave },
          message: 'Debriefing atualizado com sucesso'
        };
      } else {
        // Criar novo debriefing
        dataToSave.createdAt = serverTimestamp();
        
        const docRef = await addDoc(collection(db, DEBRIEFING_COLLECTION), dataToSave);
        
        console.log('✅ [debriefingService] Novo debriefing criado com sucesso');
        return { 
          success: true, 
          data: { id: docRef.id, ...dataToSave },
          message: 'Debriefing criado com sucesso'
        };
      }
  
    } catch (error) {
      console.error('❌ [debriefingService] Erro ao salvar debriefing:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Erro ao salvar debriefing'
      };
    }
  };
  
  /**
   * Busca um debriefing específico por data da semana
   * @param {string} weekDate - Data da semana no formato YYYY-MM-DD
   * @returns {Promise<Object>} Debriefing encontrado ou null
   */
  
  export const getDebriefing = async (weekDate) => {
    try {
      console.log('🔍 [debriefingService] Buscando debriefing para semana:', weekDate);
      
      if (!weekDate) {
        throw new Error('Campo "weekDate" é obrigatório');
      }
  
      // Buscar por data da semana
      const q = query(
        collection(db, DEBRIEFING_COLLECTION),
        where('weekDate', '==', weekDate)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('ℹ️ [debriefingService] Nenhum debriefing encontrado para esta semana');
        return { success: true, data: null };
      }
  
      // Pegar o primeiro (e único) documento
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      
      console.log('✅ [debriefingService] Debriefing encontrado');
      return { 
        success: true, 
        data: {
          id: docSnap.id,
          ...data,
          // Converter timestamps para strings se necessário
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        }
      };
  
    } catch (error) {
      console.error('❌ [debriefingService] Erro ao buscar debriefing:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };
  
  /**
   * Busca o último debriefing finalizado
   * @returns {Promise<Object>} Último debriefing com status 'completed'
   */
  export const getLastCompletedDebriefing = async () => {
    try {
      const q = query(
        collection(db, DEBRIEFING_COLLECTION),
        where('status', '==', 'completed'),
        orderBy('weekDate', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { success: true, data: null };
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return { 
        success: true, 
        data: {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          completedAt: data.completedAt?.toDate?.() || data.completedAt
        }
      };
  
    } catch (error) {
      console.error('Erro ao buscar último debriefing:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };
  
  /**
   * Busca todos os debriefings, ordenados por data (mais recentes primeiro)
   * @returns {Promise<Object>} Lista de debriefings
   */
  export const getAllDebriefings = async () => {
    try {
      console.log('📋 [debriefingService] Buscando todos os debriefings...');
      
      const q = query(
        collection(db, DEBRIEFING_COLLECTION),
        orderBy('weekDate', 'desc') // Mais recentes primeiro
      );
      
      const querySnapshot = await getDocs(q);
      const debriefings = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        debriefings.push({
          id: doc.id,
          ...data,
          // Converter timestamps para strings se necessário
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        });
      });
      
      console.log(`✅ [debriefingService] ${debriefings.length} debriefings encontrados`);
      return { success: true, data: debriefings };
  
    } catch (error) {
      console.error('❌ [debriefingService] Erro ao buscar debriefings:', error);
      return { 
        success: false, 
        error: error.message,
        data: []
      };
    }
  };
  
  /**
   * Verifica se existe algum debriefing em progresso
   * @returns {Promise<Object>} Debriefing em progresso ou null
   */
  export const getInProgressDebriefing = async () => {
    try {
      console.log('🔄 [debriefingService] Verificando debriefings em progresso...');
      
      const q = query(
        collection(db, DEBRIEFING_COLLECTION),
        where('status', '==', 'in_progress'),
        orderBy('weekDate', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('ℹ️ [debriefingService] Nenhum debriefing em progresso');
        return { success: true, data: null };
      }
  
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      console.log('✅ [debriefingService] Debriefing em progresso encontrado');
      return { 
        success: true, 
        data: {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        }
      };
  
    } catch (error) {
      console.error('❌ [debriefingService] Erro ao verificar debriefings em progresso:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };
  
  /**
   * Finaliza um debriefing (muda status para 'completed')
   * @param {string} weekDate - Data da semana
   * @returns {Promise<Object>} Resultado da operação
   */
  export const completeDebriefing = async (weekDate) => {
    try {
      console.log('🏁 [debriefingService] Finalizando debriefing para semana:', weekDate);
      
      const existingDebriefing = await getDebriefing(weekDate);
      
      if (!existingDebriefing.success || !existingDebriefing.data) {
        throw new Error('Debriefing não encontrado para finalizar');
      }
  
      const docRef = doc(db, DEBRIEFING_COLLECTION, existingDebriefing.data.id);
      await updateDoc(docRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ [debriefingService] Debriefing finalizado com sucesso');
      return { 
        success: true,
        message: 'Debriefing finalizado com sucesso'
      };
  
    } catch (error) {
      console.error('❌ [debriefingService] Erro ao finalizar debriefing:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };
  
  /**
   * Utilitário: Converte uma data para o sábado da semana
   * @param {Date|string} date - Data de referência
   * @returns {string} Data do sábado no formato YYYY-MM-DD
   */
  export const getWeekSaturday = (date = new Date()) => {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0 = domingo, 6 = sábado
    
    // Calcular quantos dias até o sábado
    const daysUntilSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
    
    // Adicionar os dias necessários
    targetDate.setDate(targetDate.getDate() + daysUntilSaturday);
    
    return targetDate.toISOString().split('T')[0];
  };
  
  /**
   * Utilitário: Verifica se hoje é sábado
   * @returns {boolean} True se hoje for sábado
   */
  export const isTodaySaturday = () => {
    return new Date().getDay() === 6;
  };
  
  /**
   * Utilitário: Formatar data para exibição
   * @param {string} weekDate - Data no formato YYYY-MM-DD
   * @returns {string} Data formatada para exibição
   */
  export const formatWeekDate = (weekDate) => {
    try {
      const date = new Date(weekDate + 'T00:00:00'); // Evitar problemas de timezone
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return weekDate;
    }
  };
  
  /**
   * Salva insights da IA em um debriefing existente
   * @param {string} weekDate - Data da semana no formato YYYY-MM-DD
   * @param {string} insights - Texto dos insights gerados pela IA
   * @returns {Promise<Object>} Resultado da operação
   */
  export const saveAIInsights = async (weekDate, insights) => {
    try {
      console.log('🤖 [debriefingService] Salvando insights da IA para semana:', weekDate);
      console.log('📅 [DEBUG] weekDate recebido:', weekDate, typeof weekDate);
      
      if (!weekDate || !insights) {
        throw new Error('weekDate e insights são obrigatórios');
      }
  
      // Buscar debriefing existente
      console.log('🔍 [DEBUG] Buscando debriefing para:', weekDate);
      const existingDebriefing = await getDebriefing(weekDate);
      console.log('📊 [DEBUG] Resultado da busca:', {
        success: existingDebriefing.success,
        hasData: !!existingDebriefing.data,
        data: existingDebriefing.data ? {
          id: existingDebriefing.data.id,
          weekDate: existingDebriefing.data.weekDate,
          status: existingDebriefing.data.status
        } : null
      });
      
      if (!existingDebriefing.success || !existingDebriefing.data) {
        throw new Error('Debriefing não encontrado para esta semana');
      }
  
      // Atualizar apenas os campos relacionados à IA
      const docRef = doc(db, DEBRIEFING_COLLECTION, existingDebriefing.data.id);
      await updateDoc(docRef, {
        aiInsights: insights,
        aiInsightsGeneratedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ [debriefingService] Insights da IA salvos com sucesso');
      return { 
        success: true, 
        message: 'Insights salvos com sucesso'
      };
  
    } catch (error) {
      console.error('❌ [debriefingService] Erro ao salvar insights da IA:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Erro ao salvar insights da IA'
      };
    }
  };
  
  export default {
    saveDebriefing,
    getDebriefing,
    getLastCompletedDebriefing,
    getAllDebriefings,
    getInProgressDebriefing,
    completeDebriefing,
    saveAIInsights,
    getWeekSaturday,
    isTodaySaturday,
    formatWeekDate
  };