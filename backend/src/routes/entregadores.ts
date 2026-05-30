// @ts-nocheck
import { Router, Response } from 'express'
import { db } from '../lib/db'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { hashSenha } from '../lib/password'
import crypto from 'crypto'

const router = Router()

function ehOperador(req: AuthRequest) {
  return String(req.userRole || '').toLowerCase() === 'operador'
}

async function podeGerenciarEntregador(req: AuthRequest, entregadorId: string) {
  if (ehOperador(req)) return true
  const result = await db.execute({
    sql: 'SELECT id, user_id, email FROM entregadores WHERE id = ? LIMIT 1',
    args: [entregadorId]
  })
  if (!result.rows.length) return false
  const row = result.rows[0] as any
  const userId = String(req.userId || '')
  const email = String(req.userEmail || '').toLowerCase()
  return String(row.id || '') === userId || String(row.user_id || '') === userId || (email && String(row.email || '').toLowerCase() === email)
}

function normalizarEmail(email?: string) {
  return String(email || '').trim().toLowerCase()
}

function emailLocal(userId: string) {
  return `${String(userId || 'entregador').replace(/[^a-zA-Z0-9._-]/g, '_')}@local.foodexpress`
}

function cpfAutomatico(userId: string) {
  const base = String(userId || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || String(Date.now())
  return `AUTO-${base}`
}

function placaValida(placa: string) {
  const valor = String(placa || '').trim().toUpperCase()
  return /^[A-Z]{3}-?\d{4}$/.test(valor) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(valor)
}

async function vincularEntregador(entregadorId: string, userId?: string, email?: string) {
  if (!entregadorId || !userId) return
  await db.execute({
    sql: `UPDATE entregadores
          SET user_id = COALESCE(NULLIF(user_id, ''), ?),
              email = COALESCE(NULLIF(email, ''), ?),
              ultima_atualizacao = CURRENT_TIMESTAMP
          WHERE id = ?`,
    args: [userId, normalizarEmail(email), entregadorId]
  })
}

// GET /api/entregadores
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!ehOperador(req)) return res.status(403).json({ erro: 'Apenas operadores podem listar entregadores' }) as any
    const { status, limite = '50' } = req.query
    let sql = 'SELECT * FROM entregadores'
    const args: any[] = []
    if (status) { sql += ' WHERE status = ?'; args.push(status) }
    sql += ' ORDER BY created_at DESC LIMIT ?'
    args.push(parseInt(limite as string))
    const result = await db.execute({ sql, args })
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar entregadores' })
  }
})

// POST /api/entregadores/cadastro — cria registro inicial ao selecionar role
router.post('/cadastro', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const { nome, email, telefone, veiculo_tipo, veiculo_placa, veiculo, placa, senha, password } = req.body
    const emailFinal = normalizarEmail(email || req.userEmail) || emailLocal(userId)
    const id = `ent_${userId}`
    const cpfFinal = cpfAutomatico(userId)
    const senhaInformada = String(senha || password || '')
    const senhaHash = senhaInformada ? hashSenha(senhaInformada) : null

    const existente = await db.execute({
      sql: `SELECT * FROM entregadores
            WHERE id = ?
               OR user_id = ?
               OR (email != '' AND lower(email) = ?)
               OR cpf = ?
            ORDER BY created_at DESC LIMIT 1`,
      args: [id, userId, emailFinal, cpfFinal]
    })
    if (existente.rows.length) {
      const ent = existente.rows[0] as any
      await vincularEntregador(ent.id, userId, emailFinal)
      if (senhaHash) {
        await db.execute({ sql: 'UPDATE entregadores SET senha_hash = ? WHERE id = ?', args: [senhaHash, ent.id] })
      }
      const atualizado = await db.execute({ sql: 'SELECT * FROM entregadores WHERE id = ?', args: [ent.id] })
      return res.json(atualizado.rows[0] || ent) as any
    }

    const tipoVeiculo = veiculo_tipo || veiculo || 'moto'
    const placaFinal = tipoVeiculo === 'bicicleta' ? '' : String(veiculo_placa || placa || '').toUpperCase()
    if (tipoVeiculo !== 'bicicleta' && placaFinal && !placaValida(placaFinal)) {
      return res.status(400).json({ erro: 'Placa inválida. Use ABC1234 ou ABC1D23.' }) as any
    }

    try {
      await db.execute({
        sql: `INSERT INTO entregadores (id, user_id, nome, email, telefone, cpf, veiculo_tipo, veiculo_placa, status, latitude, longitude, avaliacao_media, total_entregas, senha_hash)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ausente', 0, 0, 0, 0, ?)`,
        args: [id, userId, nome || req.userName || 'Entregador', emailFinal, telefone || '', cpfFinal, tipoVeiculo, placaFinal, senhaHash]
      })
    } catch (erroInsert: any) {
      // Banco antigo pode ter cadastro parcial ou placeholder duplicado.
      // Em vez de derrubar o backend, recupera o registro correto se ele já existir.
      if (String(erroInsert?.message || '').includes('UNIQUE constraint failed')) {
        const recuperado = await db.execute({
          sql: `SELECT * FROM entregadores
                WHERE id = ? OR user_id = ? OR (email != '' AND lower(email) = ?) OR cpf = ?
                ORDER BY created_at DESC LIMIT 1`,
          args: [id, userId, emailFinal, cpfFinal]
        })
        if (recuperado.rows.length) return res.json(recuperado.rows[0]) as any
      }
      throw erroInsert
    }

    const criado = await db.execute({ sql: 'SELECT * FROM entregadores WHERE id = ?', args: [id] })
    res.status(201).json(criado.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao criar entregador' })
  }
})

// GET /api/entregadores/cadastro — busca entregador do usuário logado
router.get('/cadastro', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const emailFinal = normalizarEmail(req.userEmail) || emailLocal(req.userId!)
    const result = await db.execute({
      sql: `SELECT * FROM entregadores
            WHERE user_id = ? OR (email != '' AND lower(email) = ?)
            ORDER BY created_at DESC LIMIT 1`,
      args: [req.userId, emailFinal]
    })
    if (!result.rows.length) return res.status(404).json({ erro: 'Entregador não encontrado' }) as any
    const ent = result.rows[0] as any
    await vincularEntregador(ent.id, req.userId, emailFinal)
    const atualizado = await db.execute({ sql: 'SELECT * FROM entregadores WHERE id = ?', args: [ent.id] })
    res.json(atualizado.rows[0] || ent)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar entregador' })
  }
})

// GET /api/entregadores/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.execute({ sql: 'SELECT * FROM entregadores WHERE id = ?', args: [req.params.id] })
    if (!result.rows.length) return res.status(404).json({ erro: 'Entregador não encontrado' }) as any
    if (!(await podeGerenciarEntregador(req, String(req.params.id)))) {
      return res.status(403).json({ erro: 'Você não pode acessar este entregador' }) as any
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar entregador' })
  }
})

// POST /api/entregadores
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { nome, cpf, email, telefone, veiculo_tipo, placa_veiculo, veiculo_placa, senha, password } = req.body
    if (!nome || !cpf || !veiculo_tipo) return res.status(400).json({ erro: 'Campos obrigatórios faltando' }) as any

    const placaFinal = veiculo_tipo === 'bicicleta' ? '' : String(veiculo_placa || placa_veiculo || '').toUpperCase()
    if (veiculo_tipo !== 'bicicleta' && placaFinal && !placaValida(placaFinal)) {
      return res.status(400).json({ erro: 'Placa inválida. Use ABC1234 ou ABC1D23.' }) as any
    }

    const existente = await db.execute({ sql: 'SELECT id FROM entregadores WHERE cpf = ?', args: [cpf] })
    if (existente.rows.length) return res.status(409).json({ erro: 'CPF já cadastrado' }) as any

    const senhaInformada = String(senha || password || '')
    const senhaHash = senhaInformada ? hashSenha(senhaInformada) : null

    const id = `ent_${crypto.randomUUID().slice(0, 12)}`
    await db.execute({
      sql: `INSERT INTO entregadores (id, user_id, nome, email, cpf, telefone, veiculo_tipo, veiculo_placa, status, latitude, longitude, avaliacao_media, total_entregas, senha_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ausente', 0, 0, 5.0, 0, ?)`,
      args: [id, req.userId, nome, normalizarEmail(email || req.userEmail), cpf, telefone || '', veiculo_tipo, placaFinal, senhaHash]
    })
    res.status(201).json({ mensagem: 'Entregador criado com sucesso', id })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar entregador' })
  }
})

// PUT /api/entregadores/:id
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!(await podeGerenciarEntregador(req, String(req.params.id)))) {
      return res.status(403).json({ erro: 'Você não pode alterar este entregador' }) as any
    }
    const { nome, email, telefone, veiculo_tipo, veiculo_placa, placa, status, latitude, longitude, avaliacao_media } = req.body
    const sets: string[] = ['ultima_atualizacao = CURRENT_TIMESTAMP']
    const args: any[] = []
    if (nome !== undefined) { sets.push('nome = ?'); args.push(nome) }
    if (email !== undefined) { sets.push('email = ?'); args.push(normalizarEmail(email)) }
    if (telefone !== undefined) { sets.push('telefone = ?'); args.push(telefone) }
    if (veiculo_tipo !== undefined) { sets.push('veiculo_tipo = ?'); args.push(veiculo_tipo) }
    if (veiculo_placa !== undefined || placa !== undefined) {
      const placaFinal = String(veiculo_placa ?? placa ?? '').toUpperCase()
      if (placaFinal && !placaValida(placaFinal)) return res.status(400).json({ erro: 'Placa inválida. Use ABC1234 ou ABC1D23.' }) as any
      sets.push('veiculo_placa = ?'); args.push(placaFinal)
    }
    if (status) { sets.push('status = ?'); args.push(status) }
    if (latitude !== undefined) { sets.push('latitude = ?'); args.push(Number(latitude)) }
    if (longitude !== undefined) { sets.push('longitude = ?'); args.push(Number(longitude)) }
    if (avaliacao_media !== undefined) {
      if (!ehOperador(req)) return res.status(403).json({ erro: 'Avaliação só pode ser alterada pelo sistema' }) as any
      sets.push('avaliacao_media = ?'); args.push(avaliacao_media)
    }
    args.push(req.params.id)
    await db.execute({ sql: `UPDATE entregadores SET ${sets.join(', ')} WHERE id = ?`, args })
    const atualizado = await db.execute({ sql: 'SELECT * FROM entregadores WHERE id = ?', args: [req.params.id] })
    res.json({ mensagem: 'Entregador atualizado com sucesso', entregador: atualizado.rows[0] })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar entregador' })
  }
})

// DELETE /api/entregadores/:id — soft delete
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!(await podeGerenciarEntregador(req, String(req.params.id)))) {
      return res.status(403).json({ erro: 'Você não pode desativar este entregador' }) as any
    }
    await db.execute({ sql: "UPDATE entregadores SET status = 'inativo' WHERE id = ?", args: [req.params.id] })
    res.json({ mensagem: 'Entregador desativado com sucesso' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao desativar entregador' })
  }
})

// POST /api/entregadores/:id/disponibilidade — toggle online/offline (UC013)
router.post('/:id/disponibilidade', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { disponivel } = req.body
    if (typeof disponivel !== 'boolean') return res.status(400).json({ erro: 'Campo disponivel deve ser booleano' }) as any

    const entregador = await db.execute({ sql: 'SELECT id FROM entregadores WHERE id = ?', args: [req.params.id] })
    if (!entregador.rows.length) return res.status(404).json({ erro: 'Entregador não encontrado' }) as any
    if (!(await podeGerenciarEntregador(req, String(req.params.id)))) {
      return res.status(403).json({ erro: 'Você não pode alterar este entregador' }) as any
    }

    const novo_status = disponivel ? 'disponivel' : 'ausente'
    await db.execute({ sql: 'UPDATE entregadores SET status = ?, ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = ?', args: [novo_status, req.params.id] })
    res.json({ mensagem: `Entregador marcado como ${novo_status}`, disponivel, status: novo_status })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar disponibilidade' })
  }
})

export default router
