// services/api.js — cliente centralizado para o backend FoodExpress
// Base URL vem da variável de ambiente, com fallback para localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    })
    if (!res.ok) {
      const erro = await res.json().catch(() => ({ erro: res.statusText }))
      throw new Error(erro.erro || `Erro ${res.status}`)
    }
    return res.json()
  } catch (e) {
    if (e instanceof TypeError && e.message.includes('fetch')) {
      throw new Error('Backend offline. Verifique se npm run dev:backend está rodando.')
    }
    throw e
  }
}

// ── Restaurantes ──────────────────────────────────────────────────────────────
export const api = {
  restaurantes: {
    listar: (params = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request(`/api/restaurantes${qs ? '?' + qs : ''}`)
    },
    buscarPorId: (id) => request(`/api/restaurantes/${id}`),
    criar: (dados) => request('/api/restaurantes', { method: 'POST', body: JSON.stringify(dados) }),
    atualizar: (id, dados) => request(`/api/restaurantes/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
    aprovar: (id, acao, extras = {}) => request(`/api/restaurantes/${id}/aprovar`, { method: 'POST', body: JSON.stringify({ acao, ...extras }) }),
    cadastroInicial: (dados) => request('/api/restaurantes/cadastro', { method: 'POST', body: JSON.stringify(dados) }),
    meuRestaurante: (email) => request(`/api/restaurantes/cadastro?email=${encodeURIComponent(email)}`),
    meuRestauranteOuCriar: async (email, nome = '') => {
      try {
        return await request(`/api/restaurantes/cadastro?email=${encodeURIComponent(email)}`)
      } catch (error) {
        if (error.message?.toLowerCase().includes('restaurante não encontrado')) {
          return request('/api/restaurantes/cadastro', {
            method: 'POST',
            body: JSON.stringify({ email, nome })
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
    validar: (codigo, total) => request(`/api/cupons?codigo=${codigo}&total=${total}`),
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
