// src/firebase/habitsService.js - COMPLETO E CORRIGIDO: 40 PONTOS + BÔNUS INCLUÍDO
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc,
    setDoc, 
    updateDoc,
    deleteDoc,
    orderBy, 
    query,
    where
  } from 'firebase/firestore';
  import { db } from './config';
  
  // 🔄 MUDANÇA PRINCIPAL: NOVAS COLLECTIONS PARA DADOS DIÁRIOS
  const DAILY_HABITS = 'daily_habits';           
  const WEEKLY_AGGREGATES = 'weekly_aggregates'; 
  
  // 🆕 CONFIGURAÇÕES DOS HÁBITOS (suas regras) - CORRIGIDAS
  const habitMaxValues = {
    meditar: 7,    
    medicar: 3,    
    exercitar: 7,  
    comunicar: 5,  
    alimentar: 6,  // 🔧 REDUZIDO de 7 para 6
    estudar: 6,    // 🔧 REDUZIDO de 7 para 6
    descansar: 6   // 🔧 REDUZIDO de 7 para 6
  };
  
  // 📅 FUNÇÕES UTILITÁRIAS DE DATA - CORRIGIDAS
  const getWeekStart = (dateISO) => {
    // ✅ CORREÇÃO: Usar diretamente strings para evitar problemas de timezone
    const [year, month, day] = dateISO.split('-').map(Number);
    
    // Criar data UTC para evitar problemas de timezone
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = date.getUTCDay(); // 0=domingo, 1=segunda, ..., 6=sábado
    
    // ✅ NOVO CÁLCULO: domingo = 0 dias atrás, segunda = 1 dia atrás, etc.
    const diff = -dayOfWeek; // domingo=0, segunda=-1, terça=-2, etc.
    
    // Calcular domingo da semana
    const sunday = new Date(Date.UTC(year, month - 1, day + diff));
    const sundayISO = sunday.toISOString().split('T')[0]; // YYYY-MM-DD do domingo
    
    return sundayISO;
  };
  
  const formatDateDisplay = (dateISO) => {
    const [year, month, day] = dateISO.split('-');
    return `${day}/${month}`; // DD/MM
  };
  
  const addDays = (dateISO, days) => {
    const date = new Date(dateISO);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };
  
  const getDayName = (dateISO) => {
    const date = new Date(dateISO);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };
  
  // 🆕 FUNÇÃO PRINCIPAL: SALVAR DIA + RECALCULAR SEMANA AUTOMATICAMENTE
  export const saveDailyHabits = async (dateISO, habitData) => {
    try {
      // Preparar documento diário
      const dailyDoc = {
        date: dateISO,                           
        dateFormatted: formatDateDisplay(dateISO), 
        weekStart: getWeekStart(dateISO),                    // ✅ Agora será domingo
        dayOfWeek: getDayName(dateISO),         
        
        // Dados dos hábitos (boolean)
        peso: habitData.peso || null,
        meditar: habitData.meditar || false,
        medicar: habitData.medicar || false,
        exercitar: habitData.exercitar || false,
        comunicar: habitData.comunicar || false,
        alimentar: habitData.alimentar || false,
        estudar: habitData.estudar || false,
        descansar: habitData.descansar || false,
        obs: habitData.obs || '',
        sentimento: habitData.sentimento || '', // 🆕 Incluir campo sentimento
        
        // Metadados
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
      // Salvar documento diário
      await setDoc(doc(db, DAILY_HABITS, dateISO), dailyDoc);
  
      // 🔄 NOVO: Recalcular semana automaticamente após salvar dia
      await recalculateWeek(getWeekStart(dateISO));
  
      return {
        success: true,
        data: dailyDoc
      };
  
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Erro ao salvar dia'
      };
    }
  };
  
  // 🆕 FUNÇÃO: RECALCULAR AGREGAÇÃO SEMANAL (SUAS REGRAS)
  const recalculateWeek = async (weekStartISO) => {
    try {
      // Buscar todos os 7 dias da semana (domingo a sábado)
      const weekDays = await getWeekDays(weekStartISO);
  
      if (weekDays.length === 0) {
        return;
      }
  
      // Calcular agregações usando suas regras
      const weekData = await calculateWeeklyAggregate(weekDays, weekStartISO);
      
      // Salvar semana agregada
      await setDoc(doc(db, WEEKLY_AGGREGATES, weekStartISO), weekData);
  
    } catch (error) {
    }
  };
  
  // 🆕 FUNÇÃO: BUSCAR DIAS DE UMA SEMANA (domingo a sábado)
  const getWeekDays = async (weekStartISO) => {
    try {
      const days = [];
      
      // ✅ CORRIGIDO: Buscar 7 dias consecutivos (domingo a sábado)
      for (let i = 0; i < 7; i++) {
        const dayISO = addDays(weekStartISO, i);
        const dayDoc = await getDoc(doc(db, DAILY_HABITS, dayISO));
        
        if (dayDoc.exists()) {
          days.push({ id: dayDoc.id, ...dayDoc.data() });
        } else {
          // 🔄 MUDANÇA: Dia sem dados = todos os hábitos false (sua regra)
          days.push({
            date: dayISO,
            dateFormatted: formatDateDisplay(dayISO),
            peso: null,
            meditar: false,
            medicar: false,
            exercitar: false,
            comunicar: false,
            alimentar: false,
            estudar: false,
            descansar: false,
            obs: ''
          });
        }
      }
      
      return days;
    } catch (error) {
      return [];
    }
  };
  
  // 🆕 FUNÇÃO: CALCULAR AGREGAÇÃO SEMANAL COM SUAS REGRAS ESPECÍFICAS
  const calculateWeeklyAggregate = async (days, weekStartISO) => {
    // 1. PESO: Média dos dias com peso registrado
    const daysWithPeso = days.filter(d => d.peso && d.peso > 0);
    const pesoMedio = daysWithPeso.length > 0 ? 
      daysWithPeso.reduce((sum, d) => sum + d.peso, 0) / daysWithPeso.length : 
      null;
    
    // 2. HÁBITOS: Soma dos dias true, limitado pelo máximo semanal
    const habitCounts = {
      meditar: Math.min(days.filter(d => d.meditar).length, habitMaxValues.meditar),     
      medicar: Math.min(days.filter(d => d.medicar).length, habitMaxValues.medicar),     
      exercitar: Math.min(days.filter(d => d.exercitar).length, habitMaxValues.exercitar), 
      comunicar: Math.min(days.filter(d => d.comunicar).length, habitMaxValues.comunicar), 
      alimentar: Math.min(days.filter(d => d.alimentar).length, habitMaxValues.alimentar), 
      estudar: Math.min(days.filter(d => d.estudar).length, habitMaxValues.estudar),     
      descansar: Math.min(days.filter(d => d.descansar).length, habitMaxValues.descansar)  
    };
  
    // 3. PONTOS BASE (máximo 40: 7+3+7+5+6+6+6)
    const pontosBase = Object.values(habitCounts).reduce((sum, count) => sum + count, 0);
  
    // 4. BÔNUS PESO (suas regras: 0, 3 ou 5 pontos)
    const bonusPeso = await calculatePesoBonus(pesoMedio, weekStartISO);
  
    // 🔧 CORREÇÃO PRINCIPAL: COMPLETUDE INCLUI BÔNUS DE PESO
    const totalPontos = pontosBase + bonusPeso;
    const completude = Math.round((totalPontos / 40) * 100);
  
    const weekData = {
      weekStart: weekStartISO,                    // ✅ Agora será domingo correto
      weekStartFormatted: formatDateDisplay(weekStartISO), 
      weekEnd: addDays(weekStartISO, 6),         // ✅ Sábado da semana
      
      // Dados agregados
      pesoMedio: pesoMedio ? Math.round(pesoMedio * 10) / 10 : null, 
      ...habitCounts,
      
      // 🔧 CORRIGIDO: Cálculos com bônus incluído na completude
      pontosBase,        // 0-40 pontos (base dos hábitos)
      bonusPeso,         // 0-5 pontos (bônus)
      totalPontos,       // pontosBase + bonusPeso
      completude,        // 🔧 BASEADO EM totalPontos/40 (INCLUI BÔNUS)
      
      // Metadados
      updatedAt: new Date().toISOString(),
      source: 'daily_aggregation'
    };
  
    return weekData;
  };
  
  // 🆕 FUNÇÃO: CALCULAR BÔNUS DE PESO (SUAS REGRAS ESPECÍFICAS)
  const calculatePesoBonus = async (currentPesoMedio, weekStartISO) => {
    try {
      if (!currentPesoMedio) {
        return 0;
      }
  
      // Buscar semana anterior (7 dias atrás)
      const previousWeekISO = addDays(weekStartISO, -7);
      const previousWeekDoc = await getDoc(doc(db, WEEKLY_AGGREGATES, previousWeekISO));
      
      if (!previousWeekDoc.exists()) {
        return 0;
      }
  
      const previousPesoMedio = previousWeekDoc.data().pesoMedio;
      if (!previousPesoMedio) {
        return 0;
      }
  
      // Calcular diferença (positivo = perdeu peso)
      const diferenca = previousPesoMedio - currentPesoMedio;
      
      // 🎯 SUAS REGRAS DE BÔNUS:
      if (diferenca >= 0.3) {
        return 5; 
      } else if (diferenca > 0) {
        return 3; 
      } else {
        return 0; 
      }
  
    } catch (error) {
      return 0;
    }
  };
  
  // 🔄 FUNÇÃO PRINCIPAL: BUSCAR SEMANAS AGREGADAS (SUBSTITUI getAllWeeks)
  export const getWeeklyAggregates = async () => {
    try {
      const q = query(
        collection(db, WEEKLY_AGGREGATES),
        orderBy('weekStart', 'asc')  // Ordenar por data de início da semana
      );
      
      const querySnapshot = await getDocs(q);
      const weeks = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // 🔄 CONVERTER PARA FORMATO COMPATÍVEL COM DASHBOARD ATUAL
        weeks.push({
          id: doc.id,
          semana: data.weekStartFormatted,  
          completude: data.completude,      
          peso: data.pesoMedio,            
          
          // Hábitos individuais (para gráficos por hábito)
          meditar: data.meditar,           
          medicar: data.medicar,           
          exercitar: data.exercitar,       
          comunicar: data.comunicar,       
          alimentar: data.alimentar,       
          estudar: data.estudar,           
          descansar: data.descansar,       
          
          // Dados extras (novos, mas compatíveis)
          pontosBase: data.pontosBase,     
          bonusPeso: data.bonusPeso,       
          totalPontos: data.totalPontos,   
          
          // Compatibilidade com formato antigo
          dateOrder: parseInt(data.weekStart.replace(/-/g, '')), 
          obs: '',                         
          createdAt: data.updatedAt,
          updatedAt: data.updatedAt
        });
      });
      
      return weeks;
      
    } catch (error) {
      // Fallback: tentar buscar sem orderBy
      try {
        const simpleQuery = await getDocs(collection(db, WEEKLY_AGGREGATES));
        const simpleWeeks = [];
        
        simpleQuery.forEach((doc) => {
          const data = doc.data();
          simpleWeeks.push({
            id: doc.id,
            semana: data.weekStartFormatted,
            completude: data.completude,
            peso: data.pesoMedio,
            meditar: data.meditar,
            medicar: data.medicar,
            exercitar: data.exercitar,
            comunicar: data.comunicar,
            alimentar: data.alimentar,
            estudar: data.estudar,
            descansar: data.descansar
          });
        });
        
        return simpleWeeks;
        
      } catch (simpleError) {
        return [];
      }
    }
  };
  
  // 🆕 FUNÇÕES AUXILIARES PARA DADOS DIÁRIOS

  // 🆕 Buscar a data mais recente com dados reais (para inicialização do formulário)
  export const getMostRecentDateWithData = async () => {
    try {
      const q = query(
        collection(db, DAILY_HABITS),
        orderBy('date', 'desc') // Ordenar por data decrescente
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'Nenhum dado encontrado'
        };
      }

      // Pegar o primeiro documento (mais recente)
      const mostRecentDoc = querySnapshot.docs[0];
      const mostRecentDate = mostRecentDoc.data().date;

      return {
        success: true,
        data: {
          date: mostRecentDate,
          ...mostRecentDoc.data()
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Buscar um dia específico
  export const getDayHabits = async (dateISO) => {
    try {
      const docRef = doc(db, DAILY_HABITS, dateISO);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() }
        };
      } else {
        return {
          success: false,
          error: `Dia ${dateISO} não encontrado`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Deletar um dia (e recalcular semana)
  export const deleteDayHabits = async (dateISO) => {
    try {
      await deleteDoc(doc(db, DAILY_HABITS, dateISO));
      await recalculateWeek(getWeekStart(dateISO));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // 📝 FUNÇÕES DEPRECIADAS (mantidas para compatibilidade temporária)
  export const addWeek = async (weekData) => {
    return {
      success: false,
      error: 'Função depreciada. Use saveDailyHabits() para salvar dias individuais.'
    };
  };
  
  export const getAllWeeks = async () => {
    return await getWeeklyAggregates();
  };