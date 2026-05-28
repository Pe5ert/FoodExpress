// services/api.js — cliente centralizado para o backend FoodExpress
const API_PRODUCAO = 'https://foodexpress-production-c874.up.railway.app'
const API_LOCAL = 'http://localhost:3001'
const ENV_BASE_URL = import.meta.env.VITE_API_URL || API_PRODUCAO

function normalizarBaseUrl(url) {
  return String(url || '').trim().replace(/\/$/, '')
}


function resolverBasePadrao() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    // Se não for produção, sempre usa API_LOCAL
    if (!hostname.includes('foodexpress-production') && !hostname.includes('vercel.app')) {
      return API_LOCAL;
    }
  }
  return ENV_BASE_URL || API_PRODUCAO;
}

const BASE_URLS = Array.from(new Set([
  normalizarBaseUrl(resolverBasePadrao()),
  normalizarBaseUrl(API_PRODUCAO),
].filter(Boolean)))

export function getApiBaseUrl() {
  return BASE_URLS[0] || API_PRODUCAO
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const usuario = (() => { try { return JSON.parse(localStorage.getItem('usuario') || '{}') } catch { return {} } })()
  let ultimoErro = null

  for (const baseUrl of BASE_URLS) {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(usuario?.email ? { 'X-User-Email': usuario.email } : {}),
          ...(usuario?.nome ? { 'X-User-Name': usuario.nome } : {}),
          ...(options.headers || {}),
        },
      })

      if (!res.ok) {
        const erro = await res.json().catch(() => ({ erro: res.statusText }))
        const message = erro.erro || `Erro ${res.status}`
        const e = new Error(message)
        e.status = res.status
        e.baseUrl = baseUrl
        throw e
      }

      if (res.status === 204) return null
      return res.json()
    } catch (e) {
      ultimoErro = e

      // Só tenta outra porta quando é falha de rede/CORS. Erro HTTP real não deve cair em outra API.
      if (e instanceof TypeError || e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
        continue
      }

      throw e
    }
  }

  throw new Error(
    `Backend offline. O frontend tentou: ${BASE_URLS.join(', ')}. ` +
    'Verifique se a API hospedada está online.'
  )
}

// ── Restaurantes ──────────────────────────────────────────────────────────────
export const api = {
  auth: {
    criarSessao: (dados) => request('/api/auth/session', { method: 'POST', body: JSON.stringify(dados) }),
    login: (dados) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(dados) }),
    loginConfirmar: (dados) => request('/api/auth/login/confirmar', { method: 'POST', body: JSON.stringify(dados) }),
    registrar: (dados) => request('/api/auth/registrar', { method: 'POST', body: JSON.stringify(dados) }),
    emailConfirmar: (dados) => request('/api/auth/email/confirmar', { method: 'POST', body: JSON.stringify(dados) }),
  },

  restaurantes: {
    listar: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request(`/api/restaurantes${qs ? '?' + qs : ''}`)
    },
    buscarPorId: (id) => request(`/api/restaurantes/${id}`),
    criar: (dados) => request('/api/restaurantes', { method: 'POST', body: JSON.stringify(dados) }),
    atualizar: (id, dados) => request(`/api/restaurantes/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
    aprovar: (id, acao, extras = {}) => request(`/api/restaurantes/${id}/aprovar`, { method: 'POST', body: JSON.stringify({ acao, ...extras }) }),
    pendentes: () => request('/api/restaurantes/pendentes'),
    cadastroInicial: (dados) => request('/api/restaurantes/cadastro', { method: 'POST', body: JSON.stringify(dados) }),
    meuRestaurante: () => request('/api/restaurantes/meu'),
    meuRestaurantePorEmail: (email) => request(`/api/restaurantes/cadastro?email=${encodeURIComponent(email)}`),
    meuRestauranteOuCriar: async (email, nome = 'Minha Loja') => {
      try {
        return await request('/api/restaurantes/meu')
      } catch (error) {
        if (error.message?.toLowerCase().includes('restaurante não encontrado')) {
          return request('/api/restaurantes/cadastro', {
            method: 'POST',
            body: JSON.stringify({ email, nome: nome || 'Minha Loja' })
          })
        }
        throw error
      }
    },
  },

  cnpj: {
    consultar: (cnpj) => request(`/api/cnpj/consulta?cnpj=${encodeURIComponent(cnpj)}`),
  },

  // ── Cardápio ──────────────────────────────────────────────────────────────
  cardapio: {
    listar: (restauranteId, params = {}) => {
      const qs = new URLSearchParams({ restauranteId, ...params }).toString()
      return request(`/api/cardapio?${qs}`)
    },
    buscarPorId: (id) => request(`/api/cardapio/${id}`),
    criar: (dados) => request('/api/cardapio', { method: 'POST', body: JSON.stringify(dados) }),
    atualizar: (id, dados) => request(`/api/cardapio/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
    remover: (id) => request(`/api/cardapio/${id}`, { method: 'DELETE' }),
  },

  // ── Pedidos ───────────────────────────────────────────────────────────────
  pedidos: {
    listar: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request(`/api/pedidos${qs ? '?' + qs : ''}`)
    },
    buscarPorId: (id) => request(`/api/pedidos/${id}`),
    criar: (dados) => request('/api/pedidos', { method: 'POST', body: JSON.stringify(dados) }),
    atualizarStatus: (id, status) => request(`/api/pedidos/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    cancelar: (id) => request(`/api/pedidos/${id}`, { method: 'DELETE' }),
    rastrear: (id) => request(`/api/pedidos/${id}/rastrear`),
    listarDisponiveis: () => request('/api/pedidos/disponiveis'),
    atribuirEntregador: (id, entregadorId) => request(`/api/pedidos/${id}/atribuir-entregador`, { method: 'POST', body: JSON.stringify({ entregadorId }) }),
    atribuirAutomatico: (id) => request(`/api/pedidos/${id}/atribuir-entregador-automatico`, { method: 'POST' }),
  },

  // ── Clientes ──────────────────────────────────────────────────────────────
  clientes: {
    meuPerfil: () => request('/api/clientes'),
    atualizar: (id, dados) => request(`/api/clientes/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
    cadastrarInicial: () => {
      const usuario = (() => { try { return JSON.parse(localStorage.getItem('usuario') || '{}') } catch { return {} } })()
      return request('/api/clientes', { method: 'POST', body: JSON.stringify({ nome: usuario.nome, email: usuario.email }) })
    },
  },

  // ── Entregadores ──────────────────────────────────────────────────────────
  entregadores: {
    listar: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request(`/api/entregadores${qs ? '?' + qs : ''}`)
    },
    meuPerfil: () => request('/api/entregadores/cadastro'),
    cadastrarInicial: (dados) => request('/api/entregadores/cadastro', { method: 'POST', body: JSON.stringify(dados) }),
    atualizarDisponibilidade: (id, disponivel) => request(`/api/entregadores/${id}/disponibilidade`, { method: 'POST', body: JSON.stringify({ disponivel }) }),
    atualizar: (id, dados) => request(`/api/entregadores/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  },

  // ── Avaliações ────────────────────────────────────────────────────────────
  avaliacoes: {
    listar: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request(`/api/avaliacoes${qs ? '?' + qs : ''}`)
    },
    criar: (dados) => request('/api/avaliacoes', { method: 'POST', body: JSON.stringify(dados) }),
  },

  // ── Cupons ────────────────────────────────────────────────────────────────
  cupons: {
    validar: (codigo, total, taxaEntrega = 0) => request(`/api/cupons?codigo=${encodeURIComponent(codigo)}&total=${total}&taxaEntrega=${taxaEntrega}`),
  },

  // ── Disputas ──────────────────────────────────────────────────────────────
  disputas: {
    listar: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request(`/api/disputas${qs ? '?' + qs : ''}`)
    },
    criar: (dados) => request('/api/disputas', { method: 'POST', body: JSON.stringify(dados) }),
    atualizar: (id, dados) => request(`/api/disputas/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  },

  // ── Tickets ───────────────────────────────────────────────────────────────
  tickets: {
    listar: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request(`/api/tickets${qs ? '?' + qs : ''}`)
    },
    criar: (dados) => request('/api/tickets', { method: 'POST', body: JSON.stringify(dados) }),
  },

  // ── Denúncias ─────────────────────────────────────────────────────────────
  denuncias: {
    produtos: {
      listar: (params = {}) => {
        const qs = new URLSearchParams(params).toString()
        return request(`/api/denuncias/produtos${qs ? '?' + qs : ''}`)
      },
      criar: (dados) => request('/api/denuncias/produtos', { method: 'POST', body: JSON.stringify(dados) }),
      atualizar: (id, dados) => request(`/api/denuncias/produtos/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
    },
  },

  // ── Relatórios ────────────────────────────────────────────────────────────
  relatorios: {
    buscar: (tipo, inicio, fim) => {
      const qs = new URLSearchParams({ tipo, ...(inicio ? { inicio } : {}), ...(fim ? { fim } : {}) }).toString()
      return request(`/api/relatorios?${qs}`)
    },
  },

  // ── Rotas ─────────────────────────────────────────────────────────────────
  rotas: {
    calcular: (origem_lat, origem_lng, destino_lat, destino_lng) =>
      request('/api/rotas/calcular', { method: 'POST', body: JSON.stringify({ origem_lat, origem_lng, destino_lat, destino_lng }) }),
  },
}

export default api
