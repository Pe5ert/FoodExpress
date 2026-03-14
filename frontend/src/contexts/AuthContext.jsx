import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioPersistido = localStorage.getItem('usuario');
    if (usuarioPersistido) {
      setUsuario(JSON.parse(usuarioPersistido));
    }
    setCarregando(false);
  }, []);

  const entrar = (email, perfil) => {
    const usuarioFake = {
      id: 'fake-' + Date.now(),
      nome: email.split('@')[0],
      email,
      perfil,
    };
    localStorage.setItem('usuario', JSON.stringify(usuarioFake));
    setUsuario(usuarioFake);
    navigate('/');
  };

  const cadastrarCliente = (dados) => {
    const usuarioFake = {
      id: 'cliente-' + Date.now(),
      nome: dados.name || dados.nome,
      email: dados.email,
      telefone: dados.phone || dados.telefone,
      perfil: 'cliente',
    };
    localStorage.setItem('usuario', JSON.stringify(usuarioFake));
    setUsuario(usuarioFake);
    navigate('/');
  };

  const cadastrarGerente = (dados) => {
    const usuarioFake = {
      id: 'gerente-' + Date.now(),
      nome: dados.ownerName || dados.nomeDono,
      email: dados.ownerEmail || dados.emailDono,
      telefone: dados.ownerPhone || dados.telefoneDono,
      perfil: 'gerente',
      loja: {
        nome: dados.storeName || dados.nomeLoja,
        endereco: dados.storeAddress || dados.enderecoLoja,
      },
    };
    localStorage.setItem('usuario', JSON.stringify(usuarioFake));
    setUsuario(usuarioFake);
    navigate('/');
  };

  const sair = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/login');
  };

  // aliases inglês para compatibilidade
  const login = entrar;
  const logout = sair;
  const signupCliente = cadastrarCliente;
  const signupGerente = cadastrarGerente;
  const user = usuario ? { ...usuario, name: usuario.nome, role: usuario.perfil } : null;

  const valor = {
    usuario,
    entrar,
    cadastrarCliente,
    cadastrarGerente,
    sair,
    estaLogado: !!usuario,
    perfil: usuario ? usuario.perfil : null,
    carregando,
    // aliases inglês
    user,
    login,
    logout,
    signupCliente,
    signupGerente,
    isLoggedIn: !!usuario,
    role: usuario ? usuario.perfil : null,
    loading: carregando,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
