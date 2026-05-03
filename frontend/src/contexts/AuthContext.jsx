/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../services/api';

const AuthContext = createContext();

async function base64UrlEncode(value) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function signHmacSha256(message, secret) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  const bytes = new Uint8Array(signature)
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function gerarTokenLocal(payload) {
  const header = await base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = await base64UrlEncode(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  }))
  const secret = import.meta.env.VITE_JWT_SECRET || 'fallback_dev_secret'
  const signature = await signHmacSha256(`${header}.${body}`, secret)
  return `${header}.${body}.${signature}`
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth0Configurado) {
      setAuth0Sincronizado(true);
      return;
    }

    if (auth0Loading) return;

    if (!isAuthenticated || !auth0User) {
      setAuth0Sincronizado(true);
      return;
    }

    const sincronizarAuth0 = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/auth0-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: auth0User.email || '',
            nome: auth0User.name || '',
          }),
        });

        if (!response.ok) throw new Error('Falha ao sincronizar sessão no backend');

        const data = await response.json();
        if (data?.token) {
          localStorage.setItem('token', data.token);
        }

        const usuarioCliente = {
          id: data?.usuario?.id || auth0User.sub || `auth0-${Date.now()}`,
          nome: data?.usuario?.nome || auth0User.name || (auth0User.email ? auth0User.email.split('@')[0] : 'Cliente'),
          email: data?.usuario?.email || auth0User.email || '',
          telefone: data?.usuario?.telefone || '',
          perfil: 'cliente',
          provider: 'auth0',
        };

        localStorage.setItem('usuario', JSON.stringify(usuarioCliente));
        setUsuario(usuarioCliente);
      } catch {
        const usuarioCliente = {
          id: auth0User.sub || `auth0-${Date.now()}`,
          nome: auth0User.name || (auth0User.email ? auth0User.email.split('@')[0] : 'Cliente'),
          email: auth0User.email || '',
          telefone: '',
          perfil: 'cliente',
          provider: 'auth0',
        };
        localStorage.setItem('usuario', JSON.stringify(usuarioCliente));
        setUsuario(usuarioCliente);
      } finally {
        setAuth0Sincronizado(true);
      }
    };

    sincronizarAuth0();
  }, [auth0Configurado, auth0Loading, isAuthenticated, auth0User]);

  const entrar = async (email, perfil) => {
    const novoUsuario = {
      id: perfil + '-' + Date.now(),
      nome: email.split('@')[0] || perfil,
      email,
      perfil,
    }
    const token = await gerarTokenLocal({ userId: novoUsuario.id, role: perfil })
    localStorage.setItem('usuario', JSON.stringify(novoUsuario))
    localStorage.setItem('token', token)
    setUsuario(novoUsuario)

    if (perfil === 'gerente') {
      api.restaurantes.meuRestauranteOuCriar(novoUsuario.email, novoUsuario.nome)
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
      id: 'cliente-' + Date.now(),
      nome: dados.nome || dados.name,
      email: dados.email,
      telefone: dados.telefone || dados.phone,
      perfil: 'cliente',
    };
    const token = await gerarTokenLocal({ userId: novoUsuario.id, role: 'cliente' })
    localStorage.setItem('usuario', JSON.stringify(novoUsuario));
    localStorage.setItem('token', token);
    setUsuario(novoUsuario);
    navigate('/');
  };

  const cadastrarGerente = async (dados) => {
    const novoUsuario = {
      id: 'gerente-' + Date.now(),
      nome: dados.nomeDono || dados.ownerName,
      email: dados.emailDono || dados.ownerEmail,
      telefone: dados.telefoneDono || dados.ownerPhone,
      perfil: 'gerente',
      loja: {
        nome: dados.nomeLoja || dados.storeName,
        nomeFicticio: dados.nomeFicticio || dados.fantasia || dados.nomeFantasia,
        endereco: dados.enderecoLoja || dados.storeAddress,
      },
    };
    const token = await gerarTokenLocal({ userId: novoUsuario.id, role: 'gerente' })
    localStorage.setItem('usuario', JSON.stringify(novoUsuario));
    localStorage.setItem('token', token);
    setUsuario(novoUsuario);

    try {
      await api.restaurantes.cadastroInicial({
        email: novoUsuario.email,
        nome: novoUsuario.loja.nome || novoUsuario.nome,
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
