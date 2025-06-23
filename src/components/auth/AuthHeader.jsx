// src/components/auth/AuthHeader.jsx
import React from 'react';
import { Target, LogOut, User } from 'lucide-react';
import useAuth  from '../../hooks/useAuth';

const AuthHeader = () => {
  // Conecta com nosso sistema de autenticação
  const { user, logout } = useAuth();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 mb-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Lado Esquerdo: Logo e Título */}
        <div className="flex items-center gap-2">
          <Target className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Análise de Hábitos</h1>
            <p className="text-sm text-gray-600">Período: 29/12/2024 a 08/06/2025</p>
          </div>
        </div>

        {/* Lado Direito: Info do Usuário e Logout */}
        <div className="flex items-center gap-4">
          
          {/* Informações do usuário logado */}
          <div className="flex items-center gap-2 text-gray-700">
            <User size={20} />
            <span className="text-sm font-medium">
              {user?.email || 'Usuário'}
            </span>
          </div>
          
          {/* Botão de Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthHeader;