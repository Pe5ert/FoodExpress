import { useEffect, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, Flag, RefreshCw, Send, ShieldCheck } from 'lucide-react'
import api from '../../services/api'

const statusConfig = {
  aberta: { label: 'Aberta', cor: 'bg-red-50 text-red-600 border-red-100', Icon: AlertTriangle },
  em_analise: { label: 'Em análise', cor: 'bg-yellow-50 text-yellow-700 border-yellow-100', Icon: Clock },
  resolvida: { label: 'Resolvida', cor: 'bg-accent/10 text-accent border-accent/20', Icon: CheckCircle },
  arquivada: { label: 'Arquivada', cor: 'bg-surface-2 text-text-muted border-border', Icon: ShieldCheck },
}

function formatarData(valor) {
  if (!valor) return ''
  const data = new Date(String(valor).replace(' ', 'T'))
  if (Number.isNaN(data.getTime())) return String(valor)
  return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function DenunciasProdutosGerente() {
  const [denuncias, setDenuncias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [processando, setProcessando] = useState('')
  const [respostas, setRespostas] = useState({})

  const carregar = () => {
    setCarregando(true)
    setErro('')
    api.denuncias.produtos.listar()
      .then(lista => {
        const itens = Array.isArray(lista) ? lista : []
        setDenuncias(itens)
        setRespostas(Object.fromEntries(itens.map(d => [d.id, d.resposta || ''])))
      })
      .catch(e => setErro(e.message || 'Não foi possível carregar denúncias.'))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  const atualizar = async (id, dados) => {
    setProcessando(id)
    setErro('')
    try {
      const atualizada = await api.denuncias.produtos.atualizar(id, dados)
      setDenuncias(prev => prev.map(item => item.id === id ? { ...item, ...atualizada } : item))
    } catch (e) {
      setErro(e.message || 'Não foi possível atualizar a denúncia.')
    } finally {
      setProcessando('')
    }
  }

  const abertas = denuncias.filter(d => d.status === 'aberta').length

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-text-primary">Denúncias</h1>
          <p className="mt-1 text-sm font-semibold text-text-muted">
            Produtos reportados por clientes {abertas > 0 ? `· ${abertas} aberta${abertas === 1 ? '' : 's'}` : ''}
          </p>
        </div>
        <button
          onClick={carregar}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-bold text-text-secondary hover:border-primary hover:text-primary"
        >
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      {erro && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="py-16 text-center text-sm font-semibold text-text-muted">Carregando denúncias...</div>
      ) : denuncias.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center">
          <Flag size={32} className="mx-auto mb-3 text-text-muted" />
          <p className="font-bold text-text-primary">Nenhuma denúncia de produto</p>
          <p className="mt-1 text-sm font-semibold text-text-muted">Quando um cliente denunciar um item, ele aparece aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {denuncias.map((denuncia, index) => {
            const cfg = statusConfig[denuncia.status] || statusConfig.aberta
            const StatusIcon = cfg.Icon
            return (
              <Motion.div
                key={denuncia.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-text-muted">Produto denunciado</p>
                    <h2 className="mt-1 font-display text-lg font-extrabold text-text-primary">{denuncia.produto_nome || 'Produto do cardápio'}</h2>
                    {denuncia.restaurante_nome && (
                      <p className="mt-1 text-xs font-semibold text-text-muted">{denuncia.restaurante_nome}</p>
                    )}
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${cfg.cor}`}>
                    <StatusIcon size={12} /> {cfg.label}
                  </span>
                </div>

                <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-text-muted">Motivo</p>
                    <p className="mt-1 text-sm font-bold text-text-primary">{denuncia.motivo}</p>
                  </div>
                  {denuncia.detalhe && (
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wide text-text-muted">Detalhe do cliente</p>
                      <p className="mt-1 text-sm font-semibold leading-relaxed text-text-secondary">{denuncia.detalhe}</p>
                    </div>
                  )}
                  <p className="text-xs font-semibold text-text-muted">Recebida em {formatarData(denuncia.created_at)}</p>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-text-muted">Resposta interna</label>
                  <textarea
                    value={respostas[denuncia.id] || ''}
                    onChange={(e) => setRespostas(prev => ({ ...prev, [denuncia.id]: e.target.value.slice(0, 500) }))}
                    rows={3}
                    placeholder="Ex: foto atualizada, produto pausado, preço corrigido..."
                    className="w-full resize-none rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-text-primary outline-none focus:border-primary placeholder:text-text-muted"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => atualizar(denuncia.id, { status: 'em_analise', resposta: respostas[denuncia.id] || '' })}
                    disabled={processando === denuncia.id}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2.5 text-xs font-extrabold text-yellow-700 disabled:opacity-60"
                  >
                    <Clock size={14} /> Em análise
                  </button>
                  <button
                    onClick={() => atualizar(denuncia.id, { status: 'resolvida', resposta: respostas[denuncia.id] || '' })}
                    disabled={processando === denuncia.id}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-xs font-extrabold text-white disabled:opacity-60"
                  >
                    <CheckCircle size={14} /> Resolver
                  </button>
                  <button
                    onClick={() => atualizar(denuncia.id, { resposta: respostas[denuncia.id] || '' })}
                    disabled={processando === denuncia.id}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-xs font-extrabold text-text-secondary hover:border-primary hover:text-primary disabled:opacity-60"
                  >
                    <Send size={14} /> Salvar
                  </button>
                </div>
              </Motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
