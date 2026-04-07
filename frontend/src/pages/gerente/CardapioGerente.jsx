import { useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, X, Check } from 'lucide-react'
import { categoriasGerenteExemplo } from '../../data/DadosGerente'

// aqui e o back gelado - as categorias e produtos devem vir do backend


function ModalProduto({ produto, onFechar, onSalvar }) {
  const [nome, setNome] = useState(produto?.nome || '')
  const [preco, setPreco] = useState(produto?.preco?.toFixed(2) || '')
  const [emoji, setEmoji] = useState(produto?.emoji || '🍕')

  const handleSalvar = () => {
    if (!nome.trim() || !preco) return
    onSalvar({ ...produto, nome, preco: parseFloat(preco), emoji, disponivel: produto?.disponivel ?? true })
    onFechar()
  }

  return (
    <Motion.div
      className="fixed inset-0 bg-black/50 z-200 flex items-center justify-center p-4"
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
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">Emoji</label>
            <input type="text" value={emoji} onChange={e => setEmoji(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary outline-none focus:border-primary transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">Nome do produto</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Pizza Margherita"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary outline-none focus:border-primary transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">Preço (R$)</label>
            <input type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)} placeholder="0,00"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary outline-none focus:border-primary transition-all" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onFechar} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-bold text-text-secondary cursor-pointer hover:bg-surface-2 transition-all">
            Cancelar
          </button>
          <button onClick={handleSalvar} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
            <Check size={15} /> Salvar
          </button>
        </div>
      </Motion.div>
    </Motion.div>
  )
}

export default function CardapioGerente() {
  const [categorias, setCategorias] = useState(categoriasGerenteExemplo)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null) // null | { produto, categoriaId }

  const toggleDisponivel = (catId, prodId) => {
    setCategorias(prev => prev.map(cat =>
      cat.id !== catId ? cat : {
        ...cat,
        produtos: cat.produtos.map(p => p.id !== prodId ? p : { ...p, disponivel: !p.disponivel })
      }
    ))
  }

  const excluirProduto = (catId, prodId) => {
    if (!confirm('Deseja excluir este produto?')) return
    setCategorias(prev => prev.map(cat =>
      cat.id !== catId ? cat : { ...cat, produtos: cat.produtos.filter(p => p.id !== prodId) }
    ))
  }

  const salvarProduto = (catId, produto) => {
    setCategorias(prev => prev.map(cat => {
      if (cat.id !== catId) return cat
      const existe = cat.produtos.find(p => p.id === produto.id)
      if (existe) {
        return { ...cat, produtos: cat.produtos.map(p => p.id === produto.id ? produto : p) }
      }
      return { ...cat, produtos: [...cat.produtos, { ...produto, id: Date.now() }] }
    }))
  }

  const categoriasFiltradas = categorias.map(cat => ({
    ...cat,
    produtos: cat.produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
  })).filter(cat => cat.produtos.length > 0 || busca === '')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">Cardápio</h1>
          <p className="text-sm text-text-muted font-semibold mt-1">Gerencie os produtos e categorias da sua loja</p>
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
                  <span className="text-2xl shrink-0">{produto.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${produto.disponivel ? 'text-text-primary' : 'text-text-muted line-through'}`}>
                      {produto.nome}
                    </p>
                    <p className="text-xs font-bold text-accent mt-0.5">
                      R$ {produto.preco.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleDisponivel(cat.id, produto.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                        produto.disponivel
                          ? 'text-accent bg-accent/10 border-accent/20 hover:bg-accent/20'
                          : 'text-text-muted bg-surface-2 border-border hover:bg-surface-2'
                      }`}
                    >
                      {produto.disponivel ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {produto.disponivel ? 'Disponível' : 'Indisponível'}
                    </button>
                    <button
                      onClick={() => setModal({ produto, categoriaId: cat.id })}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center cursor-pointer hover:border-primary hover:text-primary hover:bg-primary-light transition-all text-text-secondary"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => excluirProduto(cat.id, produto.id)}
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

      {/* Modal */}
      <AnimatePresence>
        {modal !== null && (
          <ModalProduto
            produto={modal.produto}
            onFechar={() => setModal(null)}
            onSalvar={(prod) => salvarProduto(modal.categoriaId, prod)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
