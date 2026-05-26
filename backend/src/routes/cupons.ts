// @ts-nocheck
import { Router, Response } from 'express'
import { db } from '../lib/db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

type TipoCupom = 'percentual' | 'fixo' | 'frete_gratis'
type CupomConfig = { desconto: number; tipo: TipoCupom; minimo: number; data_expiracao?: string | null }

const CUPONS_ESTATICOS: Record<string, CupomConfig> = {
  DESC10: { desconto: 10, tipo: 'percentual', minimo: 30 },
  DESC20: { desconto: 20, tipo: 'percentual', minimo: 50 },
  DESC5REAIS: { desconto: 5, tipo: 'fixo', minimo: 25 },
  PRIMEIRA_VEZ: { desconto: 15, tipo: 'percentual', minimo: 0 },
  FRETEGRATIS: { desconto: 0, tipo: 'frete_gratis', minimo: 0 },
  OFERTA30: { desconto: 30, tipo: 'percentual', minimo: 0 },
}

function calcularCupom(codigo: string, cupom: CupomConfig, subtotal: number, taxaEntrega: number) {
  const minimo = Number(cupom.minimo || 0)
  if (subtotal < minimo) {
    return { valido: false, erro: `Valor mínimo é R$ ${minimo.toFixed(2)}` }
  }

  if (cupom.data_expiracao && new Date(cupom.data_expiracao).getTime() < Date.now()) {
    return { valido: false, erro: 'Cupom expirado' }
  }

  let descontoValor = 0
  let freteGratis = false

  if (cupom.tipo === 'percentual') {
    descontoValor = subtotal * (Number(cupom.desconto) / 100)
  } else if (cupom.tipo === 'fixo') {
    descontoValor = Number(cupom.desconto)
  } else if (cupom.tipo === 'frete_gratis') {
    freteGratis = true
    descontoValor = Number(taxaEntrega || 0)
  }

  descontoValor = Math.max(0, Math.min(descontoValor, subtotal + taxaEntrega))

  return {
    valido: true,
    codigo,
    desconto: Number(cupom.desconto || 0),
    desconto_percentual: cupom.tipo === 'percentual' ? Number(cupom.desconto || 0) : 0,
    tipo: cupom.tipo,
    minimo,
    frete_gratis: freteGratis,
    desconto_valor: Number(descontoValor.toFixed(2)),
    mensagem: freteGratis ? 'Frete grátis aplicado' : 'Cupom aplicado',
  }
}

// GET /api/cupons — validar cupom
router.get('/', async (req, res: Response) => {
  try {
    const codigo = String(req.query.codigo || '').trim().toUpperCase()
    const subtotal = parseFloat(String(req.query.total || req.query.subtotal || '0'))
    const taxaEntrega = parseFloat(String(req.query.taxaEntrega || req.query.taxa_entrega || '0'))
    if (!codigo) return res.status(400).json({ valido: false, erro: 'Código não informado' }) as any

    const dbCupom = await db.execute({
      sql: 'SELECT * FROM cupons WHERE codigo = ? AND ativo = 1',
      args: [codigo],
    }).catch(() => null)

    const cupomDb = dbCupom?.rows?.[0] as any
    const cupom: CupomConfig | undefined = cupomDb
      ? {
          desconto: Number(cupomDb.desconto || 0),
          tipo: String(cupomDb.tipo || 'percentual') as TipoCupom,
          minimo: Number(cupomDb.minimo || 0),
          data_expiracao: cupomDb.data_expiracao || null,
        }
      : CUPONS_ESTATICOS[codigo]

    if (!cupom) return res.status(400).json({ valido: false, erro: 'Cupom inválido' }) as any

    const resultado = calcularCupom(codigo, cupom, subtotal, Number.isFinite(taxaEntrega) ? taxaEntrega : 0)
    if (!resultado.valido) return res.status(400).json(resultado) as any

    res.json(resultado)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao validar cupom' })
  }
})

// POST /api/cupons — criar cupom (gerente)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Validar que é gerente
    const role = String(req.userRole || '').toLowerCase()
    if (role !== 'gerente' && role !== 'operador') {
      return res.status(403).json({ erro: 'Apenas gerentes podem criar cupons' })
    }

    const { codigo, desconto = 0, tipo, minimo, data_expiracao } = req.body
    const tiposValidos: TipoCupom[] = ['percentual', 'fixo', 'frete_gratis']

    if (!codigo || !tipo) return res.status(400).json({ erro: 'Campos obrigatórios faltando' }) as any
    if (!tiposValidos.includes(tipo)) return res.status(400).json({ erro: 'Tipo de cupom inválido' }) as any
    if (tipo !== 'frete_gratis' && Number(desconto) <= 0) return res.status(400).json({ erro: 'Desconto deve ser maior que zero' }) as any

    const result = await db.execute({
      sql: 'INSERT INTO cupons (id, codigo, desconto, tipo, minimo, data_expiracao, ativo) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, 1)',
      args: [String(codigo).toUpperCase(), Number(desconto || 0), tipo, Number(minimo || 0), data_expiracao || null]
    })
    res.status(201).json({ mensagem: 'Cupom criado com sucesso', id: result.lastInsertRowid })
  } catch (error: any) {
    if (error?.message?.includes('no such table')) return res.status(500).json({ erro: 'Tabela de cupons não existe. Rode a migration/schema antes de criar cupons.' }) as any
    if (error?.message?.includes('UNIQUE')) return res.status(409).json({ erro: 'Cupom já existe' }) as any
    res.status(500).json({ erro: 'Erro ao criar cupom' })
  }
})

// GET /api/cupons/:id — buscar cupom por ID
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const cupomId = req.params.id
    const result = await db.execute({
      sql: 'SELECT * FROM cupons WHERE id = ?',
      args: [cupomId]
    })
    if (!result.rows.length) {
      return res.status(404).json({ erro: 'Cupom não encontrado' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar cupom' })
  }
})

// PUT /api/cupons/:id — atualizar cupom
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Validar que é gerente
    const role = String(req.userRole || '').toLowerCase()
    if (role !== 'gerente' && role !== 'operador') {
      return res.status(403).json({ erro: 'Apenas gerentes podem atualizar cupons' })
    }

    const cupomId = req.params.id
    const { codigo, desconto, tipo, minimo, data_expiracao, ativo } = req.body

    const cupomAtual = await db.execute({
      sql: 'SELECT * FROM cupons WHERE id = ?',
      args: [cupomId]
    })
    if (!cupomAtual.rows.length) {
      return res.status(404).json({ erro: 'Cupom não encontrado' })
    }

    const atualizacoes: string[] = []
    const args: any[] = []

    if (codigo) {
      atualizacoes.push('codigo = ?')
      args.push(String(codigo).toUpperCase())
    }

    if (desconto !== undefined && Number(desconto) >= 0) {
      atualizacoes.push('desconto = ?')
      args.push(Number(desconto))
    }

    if (tipo && ['percentual', 'fixo', 'frete_gratis'].includes(tipo)) {
      atualizacoes.push('tipo = ?')
      args.push(tipo)
    }

    if (minimo !== undefined) {
      atualizacoes.push('minimo = ?')
      args.push(Number(minimo))
    }

    if (data_expiracao !== undefined) {
      atualizacoes.push('data_expiracao = ?')
      args.push(data_expiracao || null)
    }

    if (ativo !== undefined) {
      atualizacoes.push('ativo = ?')
      args.push(ativo ? 1 : 0)
    }

    if (!atualizacoes.length) {
      return res.status(400).json({ erro: 'Nenhum campo para atualizar' })
    }

    args.push(cupomId)
    await db.execute({
      sql: `UPDATE cupons SET ${atualizacoes.join(', ')} WHERE id = ?`,
      args
    })

    const atualizado = await db.execute({
      sql: 'SELECT * FROM cupons WHERE id = ?',
      args: [cupomId]
    })
    res.json(atualizado.rows[0] || { mensagem: 'Cupom atualizado com sucesso' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar cupom' })
  }
})

// DELETE /api/cupons/:id — remover/desativar cupom
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Validar que é gerente
    const role = String(req.userRole || '').toLowerCase()
    if (role !== 'gerente' && role !== 'operador') {
      return res.status(403).json({ erro: 'Apenas gerentes podem remover cupons' })
    }

    const cupomId = req.params.id
    const cupomAtual = await db.execute({
      sql: 'SELECT * FROM cupons WHERE id = ?',
      args: [cupomId]
    })
    if (!cupomAtual.rows.length) {
      return res.status(404).json({ erro: 'Cupom não encontrado' })
    }

    // Soft delete: apenas desativar
    await db.execute({
      sql: 'UPDATE cupons SET ativo = 0 WHERE id = ?',
      args: [cupomId]
    })

    res.json({ mensagem: 'Cupom desativado com sucesso' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover cupom' })
  }
})

export default router
