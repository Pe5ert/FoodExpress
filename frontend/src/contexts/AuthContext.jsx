/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    if (typeof window === 'undefined') return null;
    const usuarioPersistido = localStorage.getItem('usuario');
    return usuarioPersistido ? JSON.parse(usuarioPersistido) : null;
  });
  const [carregando] = useState(false);
  const navigate = useNavigate();

  const entrar = (email, perfil) => {
    const novoUsuario = {
      id: 'fake-' + Date.now(),
      nome: email.split('@')[0],
      email,
      perfil,
    };
    localStorage.setItem('usuario', JSON.stringify(novoUsuario));
    setUsuario(novoUsuario);
    const destinos = { gerente: '/gerente', entregador: '/entregador' };
    navigate(destinos[perfil] ?? '/');
  };

  const cadastrarCliente = (dados) => {
    const novoUsuario = {
      id: 'cliente-' + Date.now(),
      nome: dados.nome || dados.name,
      email: dados.email,
      telefone: dados.telefone || dados.phone,
      perfil: 'cliente',
    };
    localStorage.setItem('usuario', JSON.stringify(novoUsuario));
    setUsuario(novoUsuario);
    navigate('/');
  };

  const cadastrarGerente = (dados) => {
    const novoUsuario = {
      id: 'gerente-' + Date.now(),
      nome: dados.nomeDono || dados.ownerName,
      email: dados.emailDono || dados.ownerEmail,
      telefone: dados.telefoneDono || dados.ownerPhone,
      perfil: 'gerente',
      loja: {
        nome: dados.nomeLoja || dados.storeName,
        endereco: dados.enderecoLoja || dados.storeAddress,
      },
    };
    localStorage.setItem('usuario', JSON.stringify(novoUsuario));
    setUsuario(novoUsuario);
    navigate('/gerente');
  };

  const sair = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/login');
  };

  const valor = {
    usuario,
    entrar,
    cadastrarCliente,
    cadastrarGerente,
    sair,
    estaLogado: !!usuario,
    perfil: usuario?.perfil ?? null,
    carregando,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
