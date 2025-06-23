// src/components/auth/AuthHeader.jsx
import React from 'react';
import { Target, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const AuthHeader = () => {
  const { logout } = useAuth();

  return (
    <header className="w-full flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      {/* Logo/ícone à esquerda */}
      <div className="flex items-center">
        <Target className="text-blue-600 w-8 h-8" />
      </div>
      {/* Ícone de sair à direita */}
      <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors" title="Sair">
        <LogOut className="w-7 h-7" />
      </button>
    </header>
  );
};

export default AuthHeader;