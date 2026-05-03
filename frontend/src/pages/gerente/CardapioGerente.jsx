import { useState, useEffect, useCallback } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, X, Check, FolderPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

// ── Modal produto ─────────────────────────────────────────────────────────────
function ModalProduto({ produto, categoriaId, categorias, restauranteId, onFechar, onSalvo }) {
  const [nome, setNome] = useState(produto?.nome || '')
  const [preco, setPreco] = useState(produto?.preco ? String(produto.preco) : '')
  const [categoria, setCategoria] = useState(produto?.categoria || categoriaId || '')
  const [descricao, setDescricao] = useState(produto?.descricao || '')
  const [salvando, setSalvando] = useState(false)

  const handleSalvar = async () => {
    if (!nome.trim() || !preco || !categoria.trim()) {
      alert('Preencha nome, preço e categoria.')
      return
    }
    setSalvando(true)
    try {
      if (produto?.id) {
        await api.cardapio.atualizar(produto.id, {
          nome, preco: parseFloat(preco), categoria, descricao,
        })
      } else {
        await api.cardapio.criar({
          restauranteId, nome, preco: parseFloat(preco), categoria, descricao, tempo_preparo: 30,
        })
      }
      onSalvo()
      onFechar()
    } catch (e) {
      alert('Erro ao salvar: ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Motion.div
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onFechar}
    >
      <Motion.div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-bold text-text-primary">
            {produto?.id ? 'Editar produto' : 'Novo produto'}
          </h3>
          <button onClick={onFechar} className="w-8 h-8 rounded-full border border-border flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-all">
            <X size={15} className="text-text-secondary" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">Nome do produto *</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Pizza Margherita"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-white outline-none focus:border-primary transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">Preço (R$) *</label>
            <input type="number" step="0.01" min="0" value={preco} onChange={e => setPreco(e.target.value)} placeholder="0,00"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-white outline-none focus:border-primary transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">Categoria *</label>
            <input list="lista-categorias" value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Ex: Pizzas, Bebidas..."
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-white outline-none focus:border-primary transition-all" />
            <datalist id="lista-categorias">
              {categorias.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">Descrição</label>
            <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Breve descrição do produto"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-white outline-none focus:border-primary transition-all" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onFechar} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-bold text-text-secondary cursor-pointer hover:bg-surface-2 transition-all">
            Cancelar
          </button>
          <button onClick={handleSalvar} disabled={salvando}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 border-none">
            <Check size={15} /> {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </Motion.div>
    </Motion.div>
  )
}

// ── Modal nova categoria ──────────────────────────────────────────────────────
function ModalNovaCategoria({ restauranteId, onFechar, onSalvo }) {
  const [nomeCategoria, setNomeCategoria] = useState('')
  const [nomeProduto, setNomeProduto] = useState('')
  const [preco, setPreco] = useState('')
  const [salvando, setSalvando] = useState(false)

  const handleSalvar = async () => {
    if (!nomeCategoria.trim() || !nomeProduto.trim() || !preco) {
      alert('Preencha o nome da categoria, um produto e seu preço para criar.')
      return
    }
    setSalvando(true)
    try {
      await api.cardapio.criar({
        restauranteId,
        nome: nomeProduto,
        preco: parseFloat(preco),
        categoria: nomeCategoria,
        tempo_preparo: 30,
      })
      onSalvo()
      onFechar()
    } catch (e) {
      alert('Erro ao criar categoria: ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Motion.div
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onFechar}
    >
      <Motion.div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-bold text-text-primary">Nova categoria</h3>
          <button onClick={onFechar} className="w-8 h-8 rounded-full border border-border flex items-center justify-center cursor-pointer hover:bg-surface-2 transition-all">
            <X size={15} className="text-text-secondary" />
          </button>
        </div>
        <p className="text-sm text-text-muted font-semibold mb-4">Para criar uma categoria, adicione um produto inicial.</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">Nome da categoria *</label>
            <input type="text" value={nomeCategoria} onChange={e => setNomeCategoria(e.target.value)} placeholder="Ex: Pizzas, Bebidas, Sobremesas..."
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-white outline-none focus:border-primary transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">Primeiro produto *</label>
            <input type="text" value={nomeProduto} onChange={e => setNomeProduto(e.target.value)} placeholder="Ex: Pizza Margherita"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-white outline-none focus:border-primary transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">Preço (R$) *</label>
            <input type="number" step="0.01" min="0" value={preco} onChange={e => setPreco(e.target.value)} placeholder="0,00"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-white outline-none focus:border-primary transition-all" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onFechar} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-bold text-text-secondary cursor-pointer hover:bg-surface-2 transition-all">
            Cancelar
          </button>
          <button onClick={handleSalvar} disabled={salvando}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 border-none">
            <FolderPlus size={15} /> {salvando ? 'Criando...' : 'Criar categoria'}
          </button>
        </div>
      </Motion.div>
    </Motion.div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function CardapioGerente() {
  const { usuario } = useAuth()
  const [categorias, setCategorias] = useState([])
  const [restauranteId, setRestauranteId] = useState(null)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null)         // { produto, categoriaId } | null
  const [modalCategoria, setModalCategoria] = useState(false)
  const [carregando, setCarregando] = useState(true)

  const carregarCardapio = useCallback((restId) => {
    return api.cardapio.listar(restId).then(itens => {
      const cats = {}
      itens.forEach(item => {
        const cat = item.categoria || 'Geral'
        if (!cats[cat]) cats[cat] = { id: cat, nome: cat, produtos: [] }
        cats[cat].produtos.push({ ...item, preco: Number(item.preco) })
      })
      setCategorias(Object.values(cats))
    })
  }, [])

  useEffect(() => {
    const usr = usuario || JSON.parse(localStorage.getItem('usuario') || '{}')
    if (!usr?.email) { setCarregando(false); return }

    api.restaurantes.meuRestauranteOuCriar(usr.email, usr.nome || usr.email)
      .then(rest => {
        setRestauranteId(rest.id)
        return carregarCardapio(rest.id)
      })
      .catch(err => {
        console.warn('Cardápio: erro ao carregar restaurante:', err)
      })
      .finally(() => setCarregando(false))
  }, [carregarCardapio, usuario])

  const toggleDisponivel = async (prodId, disponivel) => {
    try {
      await api.cardapio.atualizar(prodId, { disponivel: !disponivel })
      setCategorias(prev => prev.map(cat => ({
        ...cat,
        produtos: cat.produtos.map(p => p.id === prodId ? { ...p, disponivel: !p.disponivel } : p)
      })))
    } catch (e) { alert('Erro: ' + e.message) }
  }

  const excluirProduto = async (prodId) => {
    if (!confirm('Deseja excluir este produto?')) return
    try {
      await api.cardapio.remover(prodId)
      setCategorias(prev => prev
        .map(cat => ({ ...cat, produtos: cat.produtos.filter(p => p.id !== prodId) }))
        .filter(cat => cat.produtos.length > 0)
      )
    } catch (e) { alert('Erro: ' + e.message) }
  }

  const nomesCategorias = categorias.map(c => c.nome)

  const categoriasFiltradas = categorias
    .map(cat => ({
      ...cat,
      produtos: cat.produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
    }))
    .filter(cat => cat.produtos.length > 0 || busca === '')

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">Cardápio</h1>
          <p className="text-sm text-text-muted font-semibold mt-1">Gerencie os produtos e categorias da sua loja</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {restauranteId && (
            <>
              <button
                onClick={() => setModalCategoria(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-secondary border border-secondary/30 bg-secondary/8 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-secondary hover:text-white transition-all"
              >
                <FolderPlus size={14} /> Nova categoria
              </button>
              <button
                onClick={() => setModal({ produto: null, categoriaId: nomesCategorias[0] || '' })}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-primary px-4 py-2.5 rounded-xl cursor-pointer hover:bg-primary/90 transition-all border-none"
              >
                <Plus size={14} /> Novo produto
              </button>
            </>
          )}
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar produto..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary bg-white outline-none focus:border-primary transition-all"
        />
      </div>

      {/* Estados */}
      {carregando && (
        <div className="text-center py-16 text-text-muted font-semibold">Carregando cardápio...</div>
      )}

      {!carregando && categoriasFiltradas.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-text-muted font-semibold mb-4">Seu cardápio está vazio.</p>
          {restauranteId && (
            <button
              onClick={() => setModalCategoria(true)}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:bg-primary/90 transition-all border-none"
            >
              <FolderPlus size={16} /> Criar primeira categoria
            </button>
          )}
        </div>
      )}

      {/* Categorias */}
      <div className="flex flex-col gap-4">
        {categoriasFiltradas.map(cat => (
          <Motion.div key={cat.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-text-primary">{cat.nome}</h3>
              <button
                onClick={() => setModal({ produto: null, categoriaId: cat.id })}
                className="flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/20 bg-primary-light px-3 py-1.5 rounded-lg cursor-pointer hover:bg-primary hover:text-white transition-all"
              >
                <Plus size={13} /> Adicionar produto
              </button>
            </div>

            <div className="divide-y divide-border">
              {cat.produtos.map(produto => (
                <div key={produto.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${produto.disponivel ? 'text-text-primary' : 'text-text-muted line-through'}`}>
                      {produto.nome}
                    </p>
                    <p className="text-xs font-bold text-accent mt-0.5">
                      R$ {produto.preco.toFixed(2).replace('.', ',')}
                    </p>
                    {produto.descricao && (
                      <p className="text-xs text-text-muted mt-0.5 truncate">{produto.descricao}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleDisponivel(produto.id, produto.disponivel)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                        produto.disponivel
                          ? 'text-accent bg-accent/10 border-accent/20 hover:bg-accent/20'
                          : 'text-text-muted bg-surface-2 border-border'
                      }`}
                    >
                      {produto.disponivel ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {produto.disponivel ? 'Disponível' : 'Inativo'}
                    </button>
                    <button
                      onClick={() => setModal({ produto, categoriaId: cat.id })}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center cursor-pointer hover:border-primary hover:text-primary hover:bg-primary-light transition-all text-text-secondary"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => excluirProduto(produto.id)}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center cursor-pointer hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all text-text-secondary"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Motion.div>
        ))}
      </div>

      {/* Modais */}
      <AnimatePresence>
        {modal !== null && restauranteId && (
          <ModalProduto
            produto={modal.produto}
            categoriaId={modal.categoriaId}
            categorias={nomesCategorias}
            restauranteId={restauranteId}
            onFechar={() => setModal(null)}
            onSalvo={() => carregarCardapio(restauranteId)}
          />
        )}
        {modalCategoria && restauranteId && (
          <ModalNovaCategoria
            restauranteId={restauranteId}
            onFechar={() => setModalCategoria(false)}
            onSalvo={() => carregarCardapio(restauranteId)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
