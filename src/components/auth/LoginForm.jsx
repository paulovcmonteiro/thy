// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Target } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const LoginForm = () => {
  // Estados para guardar o que o usuário digita
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Conecta com nosso sistema de autenticação
  const { login, register, loading, error } = useAuth();

  // Função que executa quando usuário clica "Entrar" ou "Criar Conta"
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) {
      await register(email, password);
    } else {
      await login(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">App de Hábitos</h1>
          </div>
          <p className="text-gray-600">
            {isRegistering ? 'Crie sua conta' : 'Entre na sua conta'}
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Campo Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Botão Principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
          </button>

          {/* Alternador Login/Registro */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isRegistering ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;