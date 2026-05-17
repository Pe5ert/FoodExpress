/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../services/api';

const AuthContext = createContext();

function normalizarIdentificador(valor) {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'usuario'
}

function idEstavelPorEmail(email, perfil) {
  return `${perfil}-${normalizarIdentificador(email)}`
}

async function criarTokenBackend(usuario) {
  const data = await api.auth.criarSessao({
    userId: usuario.id,
    perfil: usuario.perfil,
    email: usuario.email,
    nome: usuario.nome,
  })
  return data.token
}

export function AuthProvider({ children }) {
  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const auth0Configurado = Boolean(auth0Domain && auth0ClientId);
  const {
    user: auth0User,
    isAuthenticated,
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const [usuario, setUsuario] = useState(() => {
    if (typeof window === 'undefined') return null;
    const usuarioPersistido = localStorage.getItem('usuario');
    return usuarioPersistido ? JSON.parse(usuarioPersistido) : null;
  });
  const [carregando] = useState(false);
  const [auth0Sincronizado, setAuth0Sincronizado] = useState(() => !auth0Configurado);
  const ultimaContaAuth0Sincronizada = useRef(null);
  const navigate = useNavigate();
  const auth0Sub = auth0User?.sub || '';
  const auth0Email = auth0User?.email || '';
  const auth0Name = auth0User?.name || '';

  useEffect(() => {
    if (!auth0Configurado) {
      setAuth0Sincronizado(true);
      return;
    }

    if (auth0Loading) return;

    if (!isAuthenticated || !auth0Sub) {
      ultimaContaAuth0Sincronizada.current = null;
      setAuth0Sincronizado(true);
      return;
    }

    const chaveContaAuth0 = `${auth0Sub}|${auth0Email}|${auth0Name}`;
    if (ultimaContaAuth0Sincronizada.current === chaveContaAuth0) {
      setAuth0Sincronizado(true);
      return;
    }

    const sincronizarAuth0 = async () => {
      setAuth0Sincronizado(false);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/auth0-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: auth0Email,
            nome: auth0Name,
          }),
        });

        if (!response.ok) throw new Error('Falha ao sincronizar sessão no backend');

        const data = await response.json();
        if (data?.token) {
          localStorage.setItem('token', data.token);
        }

        const usuarioCliente = {
          id: data?.usuario?.id || auth0Sub,
          nome: data?.usuario?.nome || auth0Name || (auth0Email ? auth0Email.split('@')[0] : 'Cliente'),
          email: data?.usuario?.email || auth0Email,
          telefone: data?.usuario?.telefone || '',
          perfil: 'cliente',
          provider: 'auth0',
        };

        localStorage.setItem('usuario', JSON.stringify(usuarioCliente));
        setUsuario((atual) => (
          atual?.id === usuarioCliente.id &&
          atual?.email === usuarioCliente.email &&
          atual?.perfil === usuarioCliente.perfil
            ? atual
            : usuarioCliente
        ));
      } catch {
        const usuarioCliente = {
          id: auth0Sub,
          nome: auth0Name || (auth0Email ? auth0Email.split('@')[0] : 'Cliente'),
          email: auth0Email,
          telefone: '',
          perfil: 'cliente',
          provider: 'auth0',
        };
        localStorage.setItem('usuario', JSON.stringify(usuarioCliente));
        setUsuario((atual) => (
          atual?.id === usuarioCliente.id &&
          atual?.email === usuarioCliente.email &&
          atual?.perfil === usuarioCliente.perfil
            ? atual
            : usuarioCliente
        ));
      } finally {
        ultimaContaAuth0Sincronizada.current = chaveContaAuth0;
        setAuth0Sincronizado(true);
      }
    };

    sincronizarAuth0();
  }, [auth0Configurado, auth0Loading, isAuthenticated, auth0Sub, auth0Email, auth0Name]);

  const entrar = async (email, perfil, extras = {}) => {
    const novoUsuario = {
      id: idEstavelPorEmail(email, perfil),
      nome: extras.nome || email.split('@')[0] || perfil,
      email,
      telefone: extras.telefone || '',
      veiculo_tipo: extras.veiculo_tipo || extras.veiculo || '',
      veiculo_placa: extras.veiculo_placa || extras.placa || '',
      perfil,
    }
    const token = await criarTokenBackend(novoUsuario)
    localStorage.setItem('usuario', JSON.stringify(novoUsuario))
    localStorage.setItem('token', token)
    setUsuario(novoUsuario)

    if (perfil === 'gerente') {
      api.restaurantes.meuRestauranteOuCriar(novoUsuario.email, 'Minha Loja')
        .catch(err => console.warn('Restaurante será criado no próximo acesso:', err))
    }

    const destinos = { cliente: '/', gerente: '/gerente', entregador: '/entregador', restaurante: '/painel-restaurante' }
    navigate(destinos[perfil] ?? '/')
  }

  const entrarComGoogle = async () => {
    if (!auth0Configurado) {
      throw new Error('Auth0 não configurado. Defina VITE_AUTH0_DOMAIN e VITE_AUTH0_CLIENT_ID.');
    }

    await loginWithRedirect({
      appState: { returnTo: '/' },
      authorizationParams: {
        connection: 'google-oauth2',
        prompt: 'login',
        redirect_uri: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const cadastrarCliente = async (dados) => {
    const novoUsuario = {
      id: idEstavelPorEmail(dados.email, 'cliente'),
      nome: dados.nome || dados.name,
      email: dados.email,
      telefone: dados.telefone || dados.phone,
      perfil: 'cliente',
    };
    const token = await criarTokenBackend(novoUsuario)
    localStorage.setItem('usuario', JSON.stringify(novoUsuario));
    localStorage.setItem('token', token);
    setUsuario(novoUsuario);
    navigate('/');
  };

  const cadastrarGerente = async (dados) => {
    const novoUsuario = {
      id: idEstavelPorEmail(dados.emailDono || dados.ownerEmail || dados.email || dados.nomeDono || 'gerente', 'gerente'),
      nome: dados.nomeDono || dados.ownerName,
      email: dados.emailDono || dados.ownerEmail,
      telefone: dados.telefoneDono || dados.ownerPhone,
      perfil: 'gerente',
      loja: {
        nome: dados.nomeLoja || dados.storeName,
        nomeFicticio: dados.nomeFicticio || dados.storeFantasyName || dados.fantasia || dados.nomeFantasia,
        endereco: dados.enderecoLoja || dados.storeAddress,
        telefone: dados.telefoneLoja || dados.storePhone,
        cnpj: dados.cnpjLoja || dados.storeCnpj,
        categoria: dados.categoria || 'Geral',
        descricao: dados.descricao || '',
      },
    };
    const token = await criarTokenBackend(novoUsuario)
    localStorage.setItem('usuario', JSON.stringify(novoUsuario));
    localStorage.setItem('token', token);
    setUsuario(novoUsuario);

    try {
      await api.restaurantes.cadastroInicial({
        email: novoUsuario.email,
        nome: novoUsuario.loja.nome || novoUsuario.nome,
        nomeFicticio: novoUsuario.loja.nomeFicticio,
        cnpj: novoUsuario.loja.cnpj,
        telefone: novoUsuario.loja.telefone,
        endereco: novoUsuario.loja.endereco,
        categoria: novoUsuario.loja.categoria || 'Geral',
        descricao: novoUsuario.loja.descricao || '',
        ownerName: novoUsuario.nome,
        ownerEmail: novoUsuario.email,
        ownerPhone: novoUsuario.telefone,
      })
    } catch (error) {
      // Não bloqueia o cadastro se o backend falhar — o gerente ainda pode usar o painel
      console.warn('Não foi possível criar restaurante no backend (será criado no primeiro acesso):', error)
    }

    navigate('/gerente');
  };

  const sair = () => {
    if (usuario?.provider === 'auth0' && auth0Configurado) {
      auth0Logout({
        logoutParams: {
          returnTo: `${window.location.origin}/login`,
        },
      });
    }
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/login');
  };

  const valor = useMemo(() => ({
    usuario,
    entrar,
    entrarComGoogle,
    cadastrarCliente,
    cadastrarGerente,
    sair,
    estaLogado: !!usuario,
    perfil: usuario?.perfil ?? null,
    carregando: carregando || (auth0Configurado && (auth0Loading || !auth0Sincronizado)),
  }), [usuario, carregando, auth0Configurado, auth0Loading, auth0Sincronizado]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
