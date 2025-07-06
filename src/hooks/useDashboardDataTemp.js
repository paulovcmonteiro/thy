import { useState, useEffect } from 'react';

const useDashboardDataTemp = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshData = () => {
    console.log('Teste de hook funcionando!');
  };

  const addNewDay = async (dayData) => {
    console.log('Teste addNewDay:', dayData);
    return { success: true };
  };

  return { 
    data, 
    loading, 
    error, 
    refreshData,
    addNewDay
  };
};

export default useDashboardDataTemp; 