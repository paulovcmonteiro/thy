// src/hooks/useAuth.js

// 1. IMPORTAÇÕES - "Ferramentas do porteiro"
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/config';

const useUserAuth = () => {
  // 2. ESTADOS - "Memória do porteiro"
  const [user, setUser] = useState(null);        // Quem está logado
  const [loading, setLoading] = useState(true);  // Está carregando?
  const [error, setError] = useState(null);      // Tem algum erro?

  // 3. MONITOR AUTOMÁTICO - "Vigia 24h"
  useEffect(() => {
    // Fica "observando" mudanças no login/logout
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);           // Atualiza quem está logado
      setLoading(false);       // Para de carregar
    });

    // "Desliga o vigia" quando componente sai de cena
    return () => unsubscribe();
  }, []);

  // 4. FUNÇÃO DE LOGIN - "Verificar credenciais"
  const login = async (email, password) => {
    try {
      setError(null);                                        // Limpa erros anteriores
      setLoading(true);                                       // Mostra loading
      await signInWithEmailAndPassword(auth, email, password); // Tenta fazer login
    } catch (error) {
      setError(getErrorMessage(error.code));                 // Se der erro, traduz
    } finally {
      setLoading(false);                                      // Para loading
    }
  };

  // 5. FUNÇÃO DE REGISTRO - "Cadastrar novo morador"
  const register = async (email, password) => {
    try {
      setError(null);                                          // Limpa erros
      setLoading(true);                                         // Mostra loading
      await createUserWithEmailAndPassword(auth, email, password); // Cria conta
    } catch (error) {
      setError(getErrorMessage(error.code));                   // Se der erro, traduz
    } finally {
      setLoading(false);                                        // Para loading
    }
  };

  // 6. FUNÇÃO DE LOGOUT - "Expulsar da casa"
  const logout = async () => {
    try {
      await signOut(auth);                      // Faz logout no Firebase
    } catch (error) {
      setError('Erro ao fazer logout');        // Se der erro, mostra mensagem
    }
  };

  // 7. RETORNA TUDO - "Entrega o controle remoto"
  return {
    user,      // Informações de quem está logado
    loading,   // Se está carregando
    error,     // Mensagem de erro (se houver)
    login,     // Função para fazer login
    register,  // Função para criar conta
    logout     // Função para sair
  };
};

// 8. TRADUTOR DE ERROS - "Falar português"
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado';
    case 'auth/wrong-password':
      return 'Senha incorreta';
    case 'auth/email-already-in-use':
      return 'Email já está em uso';
    case 'auth/weak-password':
      return 'Senha muito fraca (mínimo 6 caracteres)';
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/invalid-credential':
      return 'Email ou senha incorretos';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde';
    default:
      return 'Erro de autenticação. Tente novamente';
  }
};

export default useUserAuth;