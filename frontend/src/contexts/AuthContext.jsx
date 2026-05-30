/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import api, { getApiBaseUrl } from '../services/api';

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
    cadastro: Boolean(usuario.cadastro),
    senha: usuario.senha || usuario.password || '',
  })
  return data.token
}

async function enviarCodigoLoginPorEmail(email, perfil = 'cliente') {
  const emailLimpo = String(email || '').trim()
  if (!emailLimpo) throw new Error('E-mail obrigatório para login.')
  return api.auth.login({ email: emailLimpo, perfil })
}

function destinoPorPerfil(perfil) {
  return { cliente: '/', gerente: '/gerente', entregador: '/entregador', restaurante: '/painel-restaurante', operador: '/gerente/aprovacoes' }[perfil] ?? '/'
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

    if (
      localStorage.getItem('preferLocalAuth') === 'true' &&
      localStorage.getItem('token') &&
      localStorage.getItem('usuario')
    ) {
      setAuth0Sincronizado(true);
      return;
    }

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
        const response = await fetch(`${getApiBaseUrl()}/api/auth/auth0-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: auth0Email,
            nome: auth0Name,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const erro = new Error(data?.erro || 'Falha ao sincronizar sessão no backend');
          erro.status = response.status;
          throw erro;
        }

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
      } catch (error) {
        if (
          localStorage.getItem('preferLocalAuth') === 'true' &&
          localStorage.getItem('token') &&
          localStorage.getItem('usuario')
        ) {
          return;
        }
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        setUsuario(null);
        if (error?.status === 409) {
          sessionStorage.setItem(
            'authError',
            `${error.message} Use o login correto com e-mail e senha.`
          );
          navigate('/login', { replace: true });
        }
      } finally {
        ultimaContaAuth0Sincronizada.current = chaveContaAuth0;
        setAuth0Sincronizado(true);
      }
    };

    sincronizarAuth0();
  }, [auth0Configurado, auth0Loading, isAuthenticated, auth0Sub, auth0Email, auth0Name, navigate]);

  const entrar = async (email, perfil, extras = {}) => {
    const novoUsuario = {
      id: idEstavelPorEmail(email, perfil),
      nome: extras.nome || email.split('@')[0] || perfil,
      email,
      telefone: extras.telefone || '',
      veiculo_tipo: extras.veiculo_tipo || extras.veiculo || '',
      veiculo_placa: extras.veiculo_placa || extras.placa || '',
      perfil,
      cadastro: Boolean(extras.cadastro),
      senha: extras.senha || extras.password || '',
    }
    localStorage.setItem('preferLocalAuth', 'true')
    let token
    try {
      token = await criarTokenBackend(novoUsuario)
    } catch (error) {
      localStorage.removeItem('preferLocalAuth')
      throw error
    }
    const { senha: _senha, password: _password, ...usuarioPersistivel } = novoUsuario
    localStorage.setItem('usuario', JSON.stringify(usuarioPersistivel))
    localStorage.setItem('token', token)
    setUsuario(usuarioPersistivel)

    if (perfil === 'gerente') {
      api.restaurantes.meuRestauranteOuCriar(usuarioPersistivel.email, 'Minha Loja')
        .catch(err => console.warn('Restaurante será criado no próximo acesso:', err))
    }

    if (perfil === 'entregador' && novoUsuario.cadastro) {
      await api.entregadores.cadastrarInicial({
        nome: usuarioPersistivel.nome,
        email: usuarioPersistivel.email,
        telefone: usuarioPersistivel.telefone,
        veiculo_tipo: usuarioPersistivel.veiculo_tipo || 'moto',
        veiculo_placa: usuarioPersistivel.veiculo_placa || '',
        senha: novoUsuario.senha,
      }).catch(err => console.warn('Entregador será criado no próximo acesso:', err))
    }

    navigate(destinoPorPerfil(perfil))
  }

  const aplicarSessao = (token, dadosUsuario = {}) => {
    if (!token) throw new Error('Token de sessão não informado.')
    const usuarioSessao = {
      id: dadosUsuario.id,
      nome: dadosUsuario.nome || dadosUsuario.name || dadosUsuario.email?.split('@')[0] || 'Usuário',
      email: dadosUsuario.email || '',
      telefone: dadosUsuario.telefone || '',
      perfil: dadosUsuario.perfil || 'cliente',
    }

    if (!usuarioSessao.id) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        usuarioSessao.id = payload.userId
        usuarioSessao.perfil = payload.role || usuarioSessao.perfil
        usuarioSessao.email = payload.email || usuarioSessao.email
        usuarioSessao.nome = payload.nome || usuarioSessao.nome
      } catch {
        usuarioSessao.id = `${usuarioSessao.perfil}-${normalizarIdentificador(usuarioSessao.email || usuarioSessao.telefone)}`
      }
    }

    localStorage.setItem('usuario', JSON.stringify(usuarioSessao))
    localStorage.setItem('token', token)
    localStorage.setItem('preferLocalAuth', 'true')
    setUsuario(usuarioSessao)
    navigate(destinoPorPerfil(usuarioSessao.perfil), { replace: true })
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
    return api.auth.registrar({
      nome: dados.nome || dados.name,
      email: dados.email,
      telefone: dados.telefone || dados.phone,
      senha: dados.senha || dados.password,
    })
  };

  const cadastrarGerente = async (dados) => {
    const novoUsuario = {
      id: idEstavelPorEmail(dados.emailDono || dados.ownerEmail || dados.email || dados.nomeDono || 'gerente', 'gerente'),
      nome: dados.nomeDono || dados.ownerName,
      email: dados.emailDono || dados.ownerEmail,
      telefone: dados.telefoneDono || dados.ownerPhone,
      perfil: 'gerente',
      cadastro: true,
      senha: dados.senha || dados.password || '',
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
    const { senha: _senha, password: _password, ...usuarioPersistivel } = novoUsuario
    localStorage.setItem('usuario', JSON.stringify(usuarioPersistivel));
    localStorage.setItem('token', token);
    setUsuario(usuarioPersistivel);

    try {
      await api.restaurantes.cadastroInicial({
        email: usuarioPersistivel.email,
        nome: usuarioPersistivel.loja.nome || usuarioPersistivel.nome,
        nomeFicticio: usuarioPersistivel.loja.nomeFicticio,
        cnpj: usuarioPersistivel.loja.cnpj,
        telefone: usuarioPersistivel.loja.telefone,
        endereco: usuarioPersistivel.loja.endereco,
        categoria: usuarioPersistivel.loja.categoria || 'Geral',
        descricao: usuarioPersistivel.loja.descricao || '',
        ownerName: usuarioPersistivel.nome,
        ownerEmail: usuarioPersistivel.email,
        ownerPhone: usuarioPersistivel.telefone,
        senha: novoUsuario.senha,
      })
    } catch (error) {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      setUsuario(null);
      throw error;
    }

    navigate('/gerente');
  };

  const sair = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('preferLocalAuth');
    setUsuario(null);

    if (usuario?.provider === 'auth0' && auth0Configurado) {
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
      return;
    }

    navigate('/login');
  };

  const valor = useMemo(() => ({
    usuario,
    entrar,
    aplicarSessao,
    entrarComGoogle,
    entrarComEmail: enviarCodigoLoginPorEmail,
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
