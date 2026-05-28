import { useEffect, useMemo, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { BarChart2, Download, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { dataISOHojeLocal, formatarDataHoraBanco } from '../../utils/datas'

const RELATORIOS = [
  { id: 'vendas', codigo: 'REL001', nome: 'Vendas por período', descricao: 'Total de pedidos, ticket médio, faturamento, status e formas de pagamento' },
  { id: 'desempenho-restaurantes', codigo: 'REL002', nome: 'Desempenho da loja', descricao: 'Pedidos, faturamento, ticket médio, avaliação e preparo da própria loja' },
  { id: 'eficiencia-entregadores', codigo: 'REL003', nome: 'Eficiência de entregadores', descricao: 'Entregas realizadas, ganhos estimados, distância e avaliação' },
  { id: 'mapa-calor', codigo: 'REL004', nome: 'Mapa de calor de pedidos', descricao: 'Concentração por horário e dia da semana' },
  { id: 'taxa-cancelamento', codigo: 'REL005', nome: 'Taxa de cancelamento', descricao: 'Cancelamentos, percentual, valor perdido e pedidos afetados' },
  { id: 'satisfacao-cliente', codigo: 'REL006', nome: 'Satisfação do cliente', descricao: 'Média de avaliações, NPS estimado, promotores e detratores' },
  { id: 'financeiro-comissoes', codigo: 'REL007', nome: 'Financeiro - comissões', descricao: 'Faturamento, comissão, repasse, taxa de entrega e DRE diária' },
  { id: 'produtos-top', codigo: 'REL008', nome: 'Produtos mais vendidos', descricao: 'Ranking de itens, categoria, preço e receita associada' },
  { id: 'tempo-entrega', codigo: 'REL009', nome: 'Tempo de entrega', descricao: 'Preparo médio, entrega média, total médio, mínimo e máximo' },
  { id: 'fidelizacao', codigo: 'REL010', nome: 'Fidelização de clientes', descricao: 'Clientes únicos, recorrentes, VIPs, taxa de retorno e churn operacional' },
  { id: 'cancelamentos-reembolsos', codigo: 'REL011', nome: 'Cancelamentos e reembolsos', descricao: 'Pedidos cancelados, valor médio, motivo e resolução' },
  { id: 'crescimento-base', codigo: 'REL012', nome: 'Crescimento de base', descricao: 'Clientes, pedidos, produtos e avaliações da loja' },
]

const moedaKeys = ['faturamento', 'valor', 'total', 'ticket', 'comissao', 'repasse', 'taxa', 'ganhos', 'receita', 'subtotal', 'desconto']

function rotuloCampo(campo) {
  return String(campo)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

function formatarValor(valor, campo = '') {
  if (valor == null || valor === '') return '—'
  if (String(campo).includes('created_at') || String(campo).includes('ultimo_pedido')) return formatarDataHoraBanco(valor)
  const numero = Number(valor)
  const pareceMoeda = moedaKeys.some(k => String(campo).toLowerCase().includes(k))
  if (Number.isFinite(numero) && pareceMoeda) return `R$ ${numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (Number.isFinite(numero) && typeof valor !== 'string') return numero.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  return String(valor)
}

function linhasPrincipais(dados) {
  if (!dados) return []
  if (Array.isArray(dados)) return dados
  if (Array.isArray(dados.detalhes)) return dados.detalhes
  if (Array.isArray(dados.resumo)) return dados.resumo
  if (dados.indicadores && typeof dados.indicadores === 'object') return [dados.indicadores]
  return []
}

function gerarCSV(linhas) {
  if (!linhas.length) return ''
  const colunas = Array.from(new Set(linhas.flatMap(linha => Object.keys(linha))))
  return [
    colunas.join(','),
    ...linhas.map(linha => colunas.map(coluna => `"${String(linha[coluna] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n')
}

function baixarCSV(conteudo, nomeArquivo) {
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function Metricas({ resumo = [], indicadores = {} }) {
  const metricas = resumo.length
    ? resumo
    : Object.entries(indicadores).map(([indicador, valor]) => ({ indicador, valor }))

  if (!metricas.length) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
      {metricas.slice(0, 8).map((m, index) => (
        <div key={`${m.indicador}-${index}`} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-wide text-text-muted">{rotuloCampo(m.indicador)}</p>
          <p className="mt-2 font-display text-xl font-extrabold text-text-primary break-words">{formatarValor(m.valor, m.indicador)}</p>
          {m.descricao && <p className="mt-1 text-xs font-semibold text-text-muted">{m.descricao}</p>}
        </div>
      ))}
    </div>
  )
}

function Tabela({ titulo, linhas }) {
  const colunas = useMemo(() => Array.from(new Set((linhas || []).flatMap(linha => Object.keys(linha || {})))), [linhas])
  if (!linhas?.length) return null

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden mb-5">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h4 className="font-display text-sm font-extrabold text-text-primary">{titulo}</h4>
        <span className="text-xs font-bold text-text-muted">{linhas.length} registros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              {colunas.map(coluna => (
                <th key={coluna} className="px-4 py-3 text-left text-xs font-extrabold text-text-muted uppercase tracking-wide whitespace-nowrap">
                  {rotuloCampo(coluna)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha, i) => (
              <tr key={i} className="border-b border-border last:border-none hover:bg-surface-2 transition-colors">
                {colunas.map(coluna => (
                  <td key={coluna} className="px-4 py-3 font-semibold text-text-primary whitespace-nowrap">
                    {formatarValor(linha[coluna], coluna)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Series({ series }) {
  if (!series || typeof series !== 'object') return null
  return Object.entries(series).map(([nome, linhas]) => (
    <Tabela key={nome} titulo={rotuloCampo(nome)} linhas={Array.isArray(linhas) ? linhas : []} />
  ))
}

export default function RelatoriosGerente() {
  const { usuario } = useAuth()
  const [tipoSelecionado, setTipoSelecionado] = useState('vendas')
  const [inicio, setInicio] = useState(dataISOHojeLocal(30))
  const [fim, setFim] = useState(dataISOHojeLocal(0))
  const [resultado, setResultado] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const relatorioAtual = RELATORIOS.find(r => r.id === tipoSelecionado) || RELATORIOS[0]
  const dadosRelatorio = resultado?.dados || {}
  const detalhes = useMemo(() => linhasPrincipais(dadosRelatorio), [dadosRelatorio])
  const ehOperador = usuario?.perfil === 'operador'
  const tituloPagina = ehOperador ? 'Relatórios da plataforma' : 'Relatórios da loja'
  const descricaoPagina = ehOperador
    ? 'Visão global da operação para administração interna, suporte e acompanhamento financeiro.'
    : 'Visão filtrada pela loja vinculada ao gerente logado: vendas, clientes, produtos, horários, entregas e financeiro.'

  const carregarRelatorio = async () => {
    setCarregando(true)
    setErro('')
    try {
      const dados = await api.relatorios.buscar(tipoSelecionado, inicio, fim)
      setResultado(dados)
    } catch (e) {
      setErro(e.message || 'Erro ao carregar relatório')
      setResultado(null)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarRelatorio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoSelecionado, inicio, fim])

  const exportarCSV = () => {
    const todasLinhas = [
      ...(dadosRelatorio.resumo || []),
      ...(dadosRelatorio.detalhes || []),
      ...Object.values(dadosRelatorio.series || {}).flatMap(v => Array.isArray(v) ? v : []),
    ]
    const csv = gerarCSV(todasLinhas)
    if (!csv) return
    baixarCSV(csv, `${relatorioAtual.codigo}-${relatorioAtual.id}.csv`)
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-text-primary">{tituloPagina}</h1>
            <p className="text-sm text-text-muted font-semibold mt-1">
              {descricaoPagina}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={carregarRelatorio}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-2">
              <RefreshCw size={15} /> Atualizar
            </button>
            <button type="button" onClick={exportarCSV}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">
              <Download size={15} /> Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Relatórios implementados</p>
          <p className="font-display text-3xl font-extrabold text-text-primary mt-2">12/12</p>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Escopo</p>
          <p className="font-display text-xl font-extrabold text-primary mt-2">{ehOperador ? 'Global' : 'Minha loja'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Período</p>
          <p className="font-display text-base font-extrabold text-text-primary mt-2">{inicio} até {fim}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
          {RELATORIOS.map(relatorio => (
            <button key={relatorio.id} type="button" onClick={() => setTipoSelecionado(relatorio.id)}
              className={`text-left rounded-xl border p-3 transition-all cursor-pointer ${
                tipoSelecionado === relatorio.id
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border bg-white hover:border-primary hover:bg-surface-2 text-text-primary'
              }`}>
              <div className="text-xs font-extrabold uppercase tracking-wide opacity-75">{relatorio.codigo}</div>
              <div className="text-sm font-extrabold mt-1">{relatorio.nome}</div>
              <div className="text-xs font-semibold text-text-muted mt-1">{relatorio.descricao}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-4">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wide">
            Início
            <input type="date" value={inicio} onChange={e => setInicio(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm font-semibold text-text-primary outline-none focus:border-primary" />
          </label>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wide">
            Fim
            <input type="date" value={fim} onChange={e => setFim(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm font-semibold text-text-primary outline-none focus:border-primary" />
          </label>
        </div>
      </div>

      <Motion.div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-5"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold text-text-primary">{relatorioAtual.codigo} — {relatorioAtual.nome}</h3>
            <p className="text-xs text-text-muted font-semibold">{relatorioAtual.descricao}</p>
          </div>
          <BarChart2 size={18} className="text-primary shrink-0" />
        </div>
        {erro ? (
          <div className="p-5 text-sm font-semibold text-red-600 bg-red-50 border-b border-red-100">{erro}</div>
        ) : carregando ? (
          <div className="p-8 text-center text-sm font-semibold text-text-muted">Carregando relatório...</div>
        ) : (
          <div className="p-5 bg-surface-1">
            {dadosRelatorio.alertas?.length > 0 && (
              <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-yellow-800 mb-2">
                  <AlertTriangle size={16} /> Alertas de gestão
                </div>
                <ul className="space-y-1 text-xs font-semibold text-yellow-800">
                  {dadosRelatorio.alertas.map((a, i) => <li key={i}>• {a}</li>)}
                </ul>
              </div>
            )}
            <Metricas resumo={dadosRelatorio.resumo || []} indicadores={dadosRelatorio.indicadores || {}} />
            <div className="flex items-center gap-2 mb-3 text-sm font-extrabold text-text-primary">
              <TrendingUp size={16} className="text-primary" /> Detalhamento
            </div>
            <Tabela titulo="Dados principais" linhas={detalhes} />
            <Series series={dadosRelatorio.series} />
            {!detalhes.length && !dadosRelatorio.resumo?.length && (
              <div className="p-8 text-center text-sm font-semibold text-text-muted">Sem dados para o filtro selecionado.</div>
            )}
          </div>
        )}
      </Motion.div>
    </div>
  )
}
