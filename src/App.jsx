// src/App.jsx (CÓDIGO COMPLETO E LIMPO)
import React from 'react';
import useAuth from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import AuthHeader from './components/auth/AuthHeader';
import Dashboard from './Dashboard';

const App = () => {
  const { user, loading } = useAuth();
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver logado, mostrar login
  if (!user) {
    return <LoginForm />;
  }

  // Se estiver logado, mostrar app principal
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />
      <Dashboard />
    </div>
  );
};

export default App;