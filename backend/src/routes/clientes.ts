// @ts-nocheck
import { Router, Response } from 'express'
import { db } from '../lib/db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

function ehOperador(req: AuthRequest) {
  return String(req.userRole || '').toLowerCase() === 'operador'
}

function podeAcessarCliente(req: AuthRequest, cliente: any) {
  if (ehOperador(req)) return true
  const userId = String(req.userId || '')
  return [cliente?.id, cliente?.user_id].filter(Boolean).map(String).includes(userId)
}

// GET /api/clientes — buscar cliente do usuário logado
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.execute({ sql: 'SELECT * FROM clientes WHERE user_id = ?', args: [req.userId] })
    if (!result.rows.length) return res.status(404).json({ erro: 'Cliente não encontrado' }) as any
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar cliente' })
  }
})

// GET /api/clientes/:id — buscar por ID
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.execute({ sql: 'SELECT * FROM clientes WHERE id = ?', args: [req.params.id] })
    if (!result.rows.length) return res.status(404).json({ erro: 'Cliente não encontrado' }) as any
    if (!podeAcessarCliente(req, result.rows[0])) return res.status(403).json({ erro: 'Você não pode acessar este cliente' }) as any
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar cliente' })
  }
})

// POST /api/clientes — criar cliente ao selecionar role
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const existente = await db.execute({ sql: 'SELECT * FROM clientes WHERE user_id = ?', args: [req.userId] })
    if (existente.rows.length) return res.json(existente.rows[0]) as any

    const { nome, email } = req.body
    const id = `cli_${req.userId}`
    await db.execute({
      sql: 'INSERT INTO clientes (id, user_id, nome, email, total_pedidos) VALUES (?, ?, ?, ?, 0)',
      args: [id, req.userId, nome || 'Usuário', email || '']
    })
    res.status(201).json({ id, nome, email })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar cliente' })
  }
})

// PUT /api/clientes/:id
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const atual = await db.execute({ sql: 'SELECT * FROM clientes WHERE id = ?', args: [req.params.id] })
    if (!atual.rows.length) return res.status(404).json({ erro: 'Cliente não encontrado' }) as any
    if (!podeAcessarCliente(req, atual.rows[0])) return res.status(403).json({ erro: 'Você não pode alterar este cliente' }) as any

    const { nome, email, telefone, endereco_principal, latitude, longitude } = req.body
    const sets: string[] = []
    const args: any[] = []
    if (nome) { sets.push('nome = ?'); args.push(nome) }
    if (email) { sets.push('email = ?'); args.push(email) }
    if (telefone) { sets.push('telefone = ?'); args.push(telefone) }
    if (endereco_principal) { sets.push('endereco_principal = ?'); args.push(endereco_principal) }
    if (latitude !== undefined) { sets.push('latitude = ?'); args.push(latitude) }
    if (longitude !== undefined) { sets.push('longitude = ?'); args.push(longitude) }
    if (!sets.length) return res.status(400).json({ erro: 'Nenhum campo para atualizar' }) as any
    args.push(req.params.id)
    await db.execute({ sql: `UPDATE clientes SET ${sets.join(', ')} WHERE id = ?`, args })
    res.json({ mensagem: 'Cliente atualizado com sucesso' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar cliente' })
  }
})

// DELETE /api/clientes/:id — remover/desativar cliente
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const atual = await db.execute({ sql: 'SELECT * FROM clientes WHERE id = ?', args: [req.params.id] })
    if (!atual.rows.length) return res.status(404).json({ erro: 'Cliente não encontrado' }) as any
    if (!podeAcessarCliente(req, atual.rows[0])) return res.status(403).json({ erro: 'Você não pode deletar este cliente' }) as any

    // Soft delete: apenas desativar o cliente
    await db.execute({
      sql: 'UPDATE clientes SET deletado_em = ? WHERE id = ?',
      args: [new Date().toISOString(), req.params.id]
    })
    res.json({ mensagem: 'Cliente removido com sucesso' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover cliente' })
  }
})

export default router
