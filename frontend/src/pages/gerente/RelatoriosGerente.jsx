import { motion as Motion } from 'framer-motion'
import { DollarSign, ShoppingBag, Star, TrendingUp, TrendingDown } from 'lucide-react'
import { relatoriosGerenteMensais, relatoriosGerenteTopProdutos, relatoriosGerenteCards } from '../../data/DadosGerente'

// aqui e o back gelado - os relatórios devem ser fornecidos pela API do backend

const dadosMensais = relatoriosGerenteMensais
const maxFaturamento = Math.max(...dadosMensais.map(d => d.faturamento))
const topProdutos = relatoriosGerenteTopProdutos
const cards = relatoriosGerenteCards

export default function RelatoriosGerente() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-text-primary">Relatórios</h1>
        <p className="text-sm text-text-muted font-semibold mt-1">Acompanhe o desempenho da sua loja nos últimos meses</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((s, i) => (
          <Motion.div key={s.label} className="bg-white rounded-2xl border border-border shadow-sm p-5"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={17} className={s.cor} />
              </div>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${s.variacao >= 0 ? 'text-accent' : 'text-red-400'}`}>
                {s.variacao >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {Math.abs(s.variacao)}%
              </span>
            </div>
            <div className="font-display text-xl font-extrabold text-text-primary leading-tight">{s.valor}</div>
            <div className="text-xs text-text-muted font-semibold mt-1">{s.label}</div>
            <div className="text-xs text-text-muted opacity-60">{s.periodo}</div>
          </Motion.div>
        ))}
      </div>

      {/* Gráfico de faturamento mensal */}
      <Motion.div className="bg-white rounded-2xl border border-border shadow-sm p-5 mb-6"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="font-display text-base font-bold text-text-primary mb-1">Faturamento mensal</h3>
        <p className="text-xs text-text-muted font-semibold mb-5">Últimos 6 meses</p>

        <div className="flex items-end gap-3 h-40">
          {dadosMensais.map((d, i) => (
            <div key={d.mes} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-xs font-bold text-text-muted">
                R$ {(d.faturamento / 1000).toFixed(1)}k
              </span>
              <Motion.div
                className="w-full bg-primary/80 hover:bg-primary rounded-t-lg transition-colors cursor-pointer"
                style={{ height: `${(d.faturamento / maxFaturamento) * 100}%`, transformOrigin: 'bottom' }}
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                transition={{ delay: 0.4 + i * 0.07, duration: 0.4, ease: 'easeOut' }}
                title={`${d.mes}: R$ ${d.faturamento.toLocaleString('pt-BR')}`}
              />
              <span className="text-xs font-bold text-text-muted">{d.mes}</span>
            </div>
          ))}
        </div>
      </Motion.div>

      {/* Top produtos */}
      <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display text-base font-bold text-text-primary">Produtos mais vendidos</h3>
          <p className="text-xs text-text-muted font-semibold">Este mês</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                {['#', 'Produto', 'Vendas', 'Receita'].map(col => (
                  <th key={col} className="px-5 py-3 text-left text-xs font-extrabold text-text-muted uppercase tracking-wide whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProdutos.map((p, i) => (
                <Motion.tr key={p.nome} className="border-b border-border last:border-none hover:bg-surface-2 transition-colors"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.06 }}>
                  <td className="px-5 py-3.5 font-bold text-text-muted">#{i + 1}</td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2 font-semibold text-text-primary">
                      <span className="text-lg">{p.emoji}</span>{p.nome}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-text-secondary">{p.vendas} un.</td>
                  <td className="px-5 py-3.5 font-display font-extrabold text-accent whitespace-nowrap">
                    R$ {p.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </Motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Motion.div>
    </div>
  )
}
