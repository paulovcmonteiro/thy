// data/habitData.js
// Todos os dados dos hábitos organizados em um local

export const weeklyCompletionData = [
    {semana: '29/12', completude: 21}, {semana: '05/01', completude: 27}, {semana: '12/01', completude: 60}, 
    {semana: '19/01', completude: 35}, {semana: '26/01', completude: 58}, {semana: '02/02', completude: 75}, 
    {semana: '09/02', completude: 45}, {semana: '16/02', completude: 48}, {semana: '23/02', completude: 55}, 
    {semana: '02/03', completude: 0}, {semana: '09/03', completude: 0}, {semana: '16/03', completude: 0}, 
    {semana: '23/03', completude: 34}, {semana: '30/03', completude: 28}, {semana: '06/04', completude: 6}, 
    {semana: '13/04', completude: 40}, {semana: '20/04', completude: 0}, {semana: '27/04', completude: 13}, 
    {semana: '04/05', completude: 28}, {semana: '11/05', completude: 32}, {semana: '18/05', completude: 62}, 
    {semana: '25/05', completude: 55}, {semana: '01/06', completude: 67}, {semana: '08/06', completude: 70}
  ];
  
  export const weightData = [
    {semana: '29/12', peso: 88.4}, {semana: '12/01', peso: 86.9}, {semana: '19/01', peso: 86.5}, 
    {semana: '26/01', peso: 85.7}, {semana: '02/02', peso: 84.6}, {semana: '09/02', peso: 84.5}, 
    {semana: '16/02', peso: 84.3}, {semana: '23/03', peso: 84.0}, {semana: '30/03', peso: 84.0}, 
    {semana: '13/04', peso: 84.8}, {semana: '27/04', peso: 85.3}, {semana: '11/05', peso: 82.9}, 
    {semana: '18/05', peso: 82.3}, {semana: '25/05', peso: 82.1}, {semana: '01/06', peso: 82.2}, 
    {semana: '08/06', peso: 82.1}
  ];
  
  // Dados individuais de cada hábito
  export const habitDataByType = {
    meditar: {
      name: 'Meditar',
      maxDays: 7,
      color: '#3b82f6',
      borderColor: 'border-blue-300',
      data: [
        {semana: '29/12', valor: 0.0}, {semana: '05/01', valor: 14.3}, {semana: '12/01', valor: 71.4}, 
        {semana: '19/01', valor: 14.3}, {semana: '26/01', valor: 28.6}, {semana: '02/02', valor: 57.1}, 
        {semana: '09/02', valor: 0.0}, {semana: '16/02', valor: 0.0}, {semana: '23/02', valor: 57.1}, 
        {semana: '02/03', valor: 0.0}, {semana: '09/03', valor: 0.0}, {semana: '16/03', valor: 0.0}, 
        {semana: '23/03', valor: 28.6}, {semana: '30/03', valor: 14.3}, {semana: '06/04', valor: 0.0}, 
        {semana: '13/04', valor: 14.3}, {semana: '20/04', valor: 0.0}, {semana: '27/04', valor: 0.0}, 
        {semana: '04/05', valor: 0.0}, {semana: '11/05', valor: 0.0}, {semana: '18/05', valor: 14.3}, 
        {semana: '25/05', valor: 14.3}, {semana: '01/06', valor: 71.4}, {semana: '08/06', valor: 71.4}
      ]
    },
    
    medicar: {
      name: 'Medicar',
      maxDays: 3,
      color: '#10b981',
      borderColor: 'border-green-300',
      data: [
        {semana: '29/12', valor: 100.0}, {semana: '05/01', valor: 100.0}, {semana: '12/01', valor: 100.0}, 
        {semana: '19/01', valor: 100.0}, {semana: '26/01', valor: 100.0}, {semana: '02/02', valor: 100.0}, 
        {semana: '09/02', valor: 100.0}, {semana: '16/02', valor: 100.0}, {semana: '23/02', valor: 100.0}, 
        {semana: '02/03', valor: 0.0}, {semana: '09/03', valor: 0.0}, {semana: '16/03', valor: 0.0}, 
        {semana: '23/03', valor: 100.0}, {semana: '30/03', valor: 100.0}, {semana: '06/04', valor: 100.0}, 
        {semana: '13/04', valor: 100.0}, {semana: '20/04', valor: 0.0}, {semana: '27/04', valor: 100.0}, 
        {semana: '04/05', valor: 100.0}, {semana: '11/05', valor: 100.0}, {semana: '18/05', valor: 100.0}, 
        {semana: '25/05', valor: 100.0}, {semana: '01/06', valor: 100.0}, {semana: '08/06', valor: 100.0}
      ]
    },
    
    exercitar: {
      name: 'Exercitar',
      maxDays: 7,
      color: '#f59e0b',
      borderColor: 'border-orange-300',
      data: [
        {semana: '29/12', valor: 28.6}, {semana: '05/01', valor: 28.6}, {semana: '12/01', valor: 42.9}, 
        {semana: '19/01', valor: 28.6}, {semana: '26/01', valor: 42.9}, {semana: '02/02', valor: 42.9}, 
        {semana: '09/02', valor: 57.1}, {semana: '16/02', valor: 57.1}, {semana: '23/02', valor: 57.1}, 
        {semana: '02/03', valor: 0.0}, {semana: '09/03', valor: 0.0}, {semana: '16/03', valor: 0.0}, 
        {semana: '23/03', valor: 57.1}, {semana: '30/03', valor: 57.1}, {semana: '06/04', valor: 0.0}, 
        {semana: '13/04', valor: 71.4}, {semana: '20/04', valor: 0.0}, {semana: '27/04', valor: 28.6}, 
        {semana: '04/05', valor: 28.6}, {semana: '11/05', valor: 42.9}, {semana: '18/05', valor: 57.1}, 
        {semana: '25/05', valor: 71.4}, {semana: '01/06', valor: 42.9}, {semana: '08/06', valor: 57.1}
      ]
    },
    
    comunicar: {
      name: 'Comunicar',
      maxDays: 5,
      color: '#ef4444',
      borderColor: 'border-red-300',
      data: [
        {semana: '29/12', valor: 0.0}, {semana: '05/01', valor: 0.0}, {semana: '12/01', valor: 60.0}, 
        {semana: '19/01', valor: 20.0}, {semana: '26/01', valor: 20.0}, {semana: '02/02', valor: 40.0}, 
        {semana: '09/02', valor: 40.0}, {semana: '16/02', valor: 60.0}, {semana: '23/02', valor: 60.0}, 
        {semana: '02/03', valor: 0.0}, {semana: '09/03', valor: 0.0}, {semana: '16/03', valor: 0.0}, 
        {semana: '23/03', valor: 60.0}, {semana: '30/03', valor: 40.0}, {semana: '06/04', valor: 0.0}, 
        {semana: '13/04', valor: 80.0}, {semana: '20/04', valor: 0.0}, {semana: '27/04', valor: 0.0}, 
        {semana: '04/05', valor: 0.0}, {semana: '11/05', valor: 60.0}, {semana: '18/05', valor: 60.0}, 
        {semana: '25/05', valor: 80.0}, {semana: '01/06', valor: 80.0}, {semana: '08/06', valor: 80.0}
      ]
    },
    
    alimentar: {
      name: 'Alimentar',
      maxDays: 7,
      color: '#8b5cf6',
      borderColor: 'border-purple-300',
      data: [
        {semana: '29/12', valor: 28.6}, {semana: '05/01', valor: 28.6}, {semana: '12/01', valor: 57.1}, 
        {semana: '19/01', valor: 42.9}, {semana: '26/01', valor: 57.1}, {semana: '02/02', valor: 57.1}, 
        {semana: '09/02', valor: 57.1}, {semana: '16/02', valor: 71.4}, {semana: '23/02', valor: 42.9}, 
        {semana: '02/03', valor: 0.0}, {semana: '09/03', valor: 0.0}, {semana: '16/03', valor: 0.0}, 
        {semana: '23/03', valor: 14.3}, {semana: '30/03', valor: 0.0}, {semana: '06/04', valor: 0.0}, 
        {semana: '13/04', valor: 14.3}, {semana: '20/04', valor: 0.0}, {semana: '27/04', valor: 0.0}, 
        {semana: '04/05', valor: 0.0}, {semana: '11/05', valor: 42.9}, {semana: '18/05', valor: 42.9}, 
        {semana: '25/05', valor: 57.1}, {semana: '01/06', valor: 57.1}, {semana: '08/06', valor: 42.9}
      ]
    },
    
    estudar: {
      name: 'Estudar',
      maxDays: 7,
      color: '#06b6d4',
      borderColor: 'border-cyan-300',
      data: [
        {semana: '29/12', valor: 0.0}, {semana: '05/01', valor: 0.0}, {semana: '12/01', valor: 42.9}, 
        {semana: '19/01', valor: 0.0}, {semana: '26/01', valor: 0.0}, {semana: '02/02', valor: 42.9}, 
        {semana: '09/02', valor: 57.1}, {semana: '16/02', valor: 0.0}, {semana: '23/02', valor: 28.6}, 
        {semana: '02/03', valor: 0.0}, {semana: '09/03', valor: 0.0}, {semana: '16/03', valor: 0.0}, 
        {semana: '23/03', valor: 14.3}, {semana: '30/03', valor: 14.3}, {semana: '06/04', valor: 0.0}, 
        {semana: '13/04', valor: 71.4}, {semana: '20/04', valor: 0.0}, {semana: '27/04', valor: 0.0}, 
        {semana: '04/05', valor: 0.0}, {semana: '11/05', valor: 0.0}, {semana: '18/05', valor: 57.1}, 
        {semana: '25/05', valor: 42.9}, {semana: '01/06', valor: 85.7}, {semana: '08/06', valor: 57.1}
      ]
    },
    
    descansar: {
      name: 'Descansar',
      maxDays: 7,
      color: '#84cc16',
      borderColor: 'border-lime-300',
      data: [
        {semana: '29/12', valor: 0.0}, {semana: '05/01', valor: 14.3}, {semana: '12/01', valor: 42.9}, 
        {semana: '19/01', valor: 14.3}, {semana: '26/01', valor: 42.9}, {semana: '02/02', valor: 57.1}, 
        {semana: '09/02', valor: 14.3}, {semana: '16/02', valor: 57.1}, {semana: '23/02', valor: 42.9}, 
        {semana: '02/03', valor: 0.0}, {semana: '09/03', valor: 0.0}, {semana: '16/03', valor: 0.0}, 
        {semana: '23/03', valor: 28.6}, {semana: '30/03', valor: 28.6}, {semana: '06/04', valor: 0.0}, 
        {semana: '13/04', valor: 0.0}, {semana: '20/04', valor: 0.0}, {semana: '27/04', valor: 14.3}, 
        {semana: '04/05', valor: 14.3}, {semana: '11/05', valor: 42.9}, {semana: '18/05', valor: 57.1}, 
        {semana: '25/05', valor: 42.9}, {semana: '01/06', valor: 57.1}, {semana: '08/06', valor: 57.1}
      ]
    }
  };
  
  // Lista ordenada dos hábitos para facilitar iteração
  export const habitsList = [
    'meditar',
    'medicar', 
    'exercitar',
    'comunicar',
    'alimentar',
    'estudar',
    'descansar'
  ];
  
  // Informações do período analisado
  export const analysisInfo = {
    startDate: '29/12/2024',
    endDate: '08/06/2025',
    totalWeeks: 24,
    userName: 'Paulo'
  };