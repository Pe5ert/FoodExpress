// @ts-nocheck
import { Router, Response } from 'express'
import { db } from '../lib/db'
import { validarCNPJ } from '../lib/validacoes'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { buscarRestauranteDoUsuario, vincularRestauranteAoUsuario } from '../lib/schema'
import { hashSenha } from '../lib/password'

const router = Router()

function normalizarTexto(valor: any) {
  return String(valor || '').trim()
}

function cnpjTemporario(userId: string) {
  return `TEMP-${userId}`.slice(0, 32)
}

function serializarArray(valor: any) {
  if (Array.isArray(valor)) return JSON.stringify(valor)
  if (valor == null) return null
  return String(valor)
}

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return Number.POSITIVE_INFINITY
  if ((lat2 === 0 && lon2 === 0) || (lat1 === 0 && lon1 === 0)) return Number.POSITIVE_INFINITY
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatarDistancia(distanciaKm: number) {
  if (!Number.isFinite(distanciaKm)) return null
  if (distanciaKm < 1) return `${Math.round(distanciaKm * 1000)} m`
  return `${distanciaKm.toFixed(1).replace('.', ',')} km`
}

function ehOperador(req: AuthRequest) {
  return String(req.userRole || '').toLowerCase() === 'operador'
}

async function podeGerenciarRestaurante(req: AuthRequest, restauranteId: string) {
  if (ehOperador(req)) return true
  const rest = await db.execute({
    sql: `SELECT id, user_id, email FROM restaurantes WHERE id = ? LIMIT 1`,
    args: [restauranteId]
  })
  if (!rest.rows.length) return false
  const row = rest.rows[0] as any
  const userId = String(req.userId || '')
  const email = String(req.userEmail || '').toLowerCase()
  return String(row.user_id || '') === userId || (email && String(row.email || '').toLowerCase() === email)
}

// GET /api/restaurantes — listar com filtros públicos
router.get('/', async (req, res: Response) => {
  try {
    const { categoria, ordenar, limite = '50', latitude, longitude } = req.query
    const clienteLat = Number(latitude)
    const clienteLng = Number(longitude)
    const temLocalizacao = Number.isFinite(clienteLat) && Number.isFinite(clienteLng) && !(clienteLat === 0 && clienteLng === 0)
    const limiteFinal = parseInt(limite as string) || 50
    let sql = `SELECT * FROM restaurantes
      WHERE COALESCE(status, 'ativo') IN ('ativo', 'fechado')
        AND EXISTS (
          SELECT 1 FROM cardapio c
          WHERE c.restaurante_id = restaurantes.id
            AND COALESCE(c.disponivel, 1) = 1
        )`
    const args: any[] = []

    if (categoria) {
      const cat = normalizarTexto(categoria).toLowerCase()
      const catSingular = cat.endsWith('s') ? cat.slice(0, -1) : cat
      sql += ` AND (
        lower(nome) LIKE ? OR
        lower(categoria) LIKE ? OR
        lower(descricao) LIKE ? OR
        EXISTS (
          SELECT 1 FROM cardapio c
          WHERE c.restaurante_id = restaurantes.id
            AND COALESCE(c.disponivel, 1) = 1
            AND (lower(c.nome) LIKE ? OR lower(c.categoria) LIKE ? OR lower(c.descricao) LIKE ?)
        )
      )`
      const termo = `%${cat}%`
      const singular = `%${catSingular}%`
      args.push(termo, termo, termo, singular, termo, termo)
    }

    if (!temLocalizacao) {
      const col = ordenar === 'avaliacao' ? 'avaliacao_media' : 'created_at'
      sql += ` ORDER BY ${col} DESC LIMIT ?`
      args.push(limiteFinal)
    } else {
      sql += ' ORDER BY created_at DESC LIMIT ?'
      args.push(Math.max(limiteFinal, 200))
    }

    const result = await db.execute({ sql, args })
    let rows = result.rows as any[]

    if (temLocalizacao) {
      rows = rows.map((rest) => {
        const distanciaKm = calcularDistancia(clienteLat, clienteLng, Number(rest.latitude), Number(rest.longitude))
        return {
          ...rest,
          distancia_km: Number.isFinite(distanciaKm) ? Math.round(distanciaKm * 100) / 100 : null,
          distancia: formatarDistancia(distanciaKm),
        }
      })

      if (ordenar === 'avaliacao') {
        rows.sort((a, b) => Number(b.avaliacao_media || 0) - Number(a.avaliacao_media || 0))
      } else {
        rows.sort((a, b) => {
          const da = a.distancia_km == null ? Number.POSITIVE_INFINITY : Number(a.distancia_km)
          const db = b.distancia_km == null ? Number.POSITIVE_INFINITY : Number(b.distancia_km)
          return da - db
        })
      }
      rows = rows.slice(0, limiteFinal)
    }

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao listar restaurantes' })
  }
})

// ── ROTAS FIXAS ANTES DE /:id ─────────────────────────────────────────────────

// GET /api/restaurantes/meu — busca a loja vinculada ao usuário logado
router.get('/meu', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const rest = await buscarRestauranteDoUsuario(req.userId, String(req.query.email || req.userEmail || ''), req.userName)
    if (!rest) return res.status(404).json({ erro: 'Restaurante não encontrado' }) as any
    await vincularRestauranteAoUsuario(String(rest.id), req.userId, req.userEmail, req.userName)
    const atualizado = await db.execute({ sql: 'SELECT * FROM restaurantes WHERE id = ?', args: [String(rest.id)] })
    res.json(atualizado.rows[0] || rest)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao buscar restaurante do usuário' })
  }
})

// POST /api/restaurantes/cadastro — cria registro inicial ao selecionar role
router.post('/cadastro', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const {
      email,
      nome,
      nomeFicticio,
      cnpj,
      telefone,
      endereco,
      categoria,
      descricao,
      logo,
      capa,
      latitude,
      longitude,
      ownerName,
      ownerEmail,
      ownerPhone,
      senha,
      password,
    } = req.body
    const senhaInformada = String(senha || password || '')
    const senhaHash = senhaInformada ? hashSenha(senhaInformada) : null

    const existente = await buscarRestauranteDoUsuario(userId, email || req.userEmail, ownerName || req.userName)
    if (existente) {
      await vincularRestauranteAoUsuario(String(existente.id), userId, email || req.userEmail, ownerName || req.userName)
      if (senhaHash) {
        await db.execute({ sql: 'UPDATE restaurantes SET senha_hash = ? WHERE id = ?', args: [senhaHash, String(existente.id)] })
        await db.execute({ sql: 'UPDATE gerentes SET senha_hash = ? WHERE restaurante_id = ? OR user_id = ?', args: [senhaHash, String(existente.id), userId] })
      }
      const atualizado = await db.execute({ sql: 'SELECT * FROM restaurantes WHERE id = ?', args: [String(existente.id)] })
      return res.json(atualizado.rows[0] || existente) as any
    }

    const id = `rest_${userId}`
    const nomeLoja = normalizarTexto(nome) || normalizarTexto(nomeFicticio) || 'Minha Loja'
    const emailLoja = normalizarTexto(email) || normalizarTexto(ownerEmail) || `${userId}@loja.local`
    const cnpjLoja = normalizarTexto(cnpj) || cnpjTemporario(userId)

    await db.execute({
      sql: `INSERT INTO restaurantes
            (id, user_id, nome, cnpj, email, telefone, endereco, categoria, descricao, latitude, longitude,
             taxa_comissao, avaliacao_media, status, horario_abertura, horario_fechamento, dias_aberto, formas_pagamento, senha_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 15, 0, 'ativo', '18:00', '23:00', ?, ?, ?)`,
      args: [
        id,
        userId,
        nomeLoja,
        cnpjLoja,
        emailLoja,
        telefone || ownerPhone || '',
        endereco || '',
        categoria || 'Geral',
        descricao || '',
        latitude !== undefined ? Number(latitude) : 0,
        longitude !== undefined ? Number(longitude) : 0,
        JSON.stringify(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']),
        JSON.stringify(['Dinheiro', 'Crédito', 'Débito', 'Pix']),
        senhaHash,
      ]
    })

    await vincularRestauranteAoUsuario(id, userId, ownerEmail || req.userEmail || emailLoja, ownerName || req.userName || nomeLoja)
    if (senhaHash) {
      await db.execute({ sql: 'UPDATE gerentes SET senha_hash = ? WHERE restaurante_id = ? OR user_id = ?', args: [senhaHash, id, userId] })
    }

    const criado = await db.execute({ sql: 'SELECT * FROM restaurantes WHERE id = ?', args: [id] })
    res.status(201).json(criado.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao criar restaurante' })
  }
})

// GET /api/restaurantes/pendentes — operador/master aprova solicitações
router.get('/pendentes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!ehOperador(req)) return res.status(403).json({ erro: 'Apenas operadores podem aprovar restaurantes' }) as any
    const result = await db.execute({
      sql: `SELECT r.*,
                   COUNT(c.id) as total_itens_cardapio
            FROM restaurantes r
            LEFT JOIN cardapio c ON c.restaurante_id = r.id AND COALESCE(c.disponivel, 1) = 1
            WHERE COALESCE(r.status, 'pendente') = 'pendente'
            GROUP BY r.id
            ORDER BY r.created_at ASC`,
      args: []
    })
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao listar restaurantes pendentes' })
  }
})

// GET /api/restaurantes/cadastro — compatibilidade: busca por email ou pelo token se enviado
router.get('/cadastro', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const email = String(req.query.email || '')
    if (!email) return res.status(400).json({ erro: 'Email obrigatório' }) as any
    if (!ehOperador(req) && String(req.userEmail || '').toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ erro: 'Você não pode acessar este cadastro' }) as any
    }
    const result = await db.execute({ sql: 'SELECT * FROM restaurantes WHERE email = ? ORDER BY created_at DESC LIMIT 1', args: [email] })
    if (!result.rows.length) return res.status(404).json({ erro: 'Restaurante não encontrado' }) as any
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar restaurante' })
  }
})

// ── ROTAS COM PARÂMETRO DINÂMICO ──────────────────────────────────────────────

// GET /api/restaurantes/:id — buscar por ID
router.get('/:id', async (req, res: Response) => {
  try {
    const id = String(req.params.id)
    const result = await db.execute({ sql: 'SELECT * FROM restaurantes WHERE id = ?', args: [id] })
    if (!result.rows.length) return res.status(404).json({ erro: 'Restaurante não encontrado' }) as any
    const restaurante = result.rows[0] as any
    const status = String(restaurante.status || 'ativo').toLowerCase()
    if (!['ativo', 'fechado'].includes(status)) {
      return res.status(404).json({ erro: 'Restaurante não encontrado' }) as any
    }
    const itens = await db.execute({
      sql: 'SELECT COUNT(*) as total FROM cardapio WHERE restaurante_id = ? AND COALESCE(disponivel, 1) = 1',
      args: [id]
    })
    if (Number((itens.rows[0] as any)?.total || 0) < 1) {
      return res.status(404).json({ erro: 'Restaurante não encontrado' }) as any
    }
    res.json(restaurante)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar restaurante' })
  }
})

// POST /api/restaurantes — criar cadastro completo
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { nome, cnpj, email, telefone, endereco, categoria, latitude, longitude } = req.body
    if (!nome || !cnpj || !email || !endereco) return res.status(400).json({ erro: 'Campos obrigatórios faltando' }) as any
    if (!validarCNPJ(cnpj)) return res.status(400).json({ erro: 'CNPJ inválido' }) as any

    const existente = await db.execute({ sql: 'SELECT id FROM restaurantes WHERE cnpj = ?', args: [cnpj] })
    if (existente.rows.length) return res.status(409).json({ erro: 'CNPJ já cadastrado' }) as any

    const id = `rest_${req.userId}_${Date.now()}`
    await db.execute({
      sql: `INSERT INTO restaurantes
            (id, user_id, nome, cnpj, email, telefone, endereco, categoria, latitude, longitude,
             taxa_comissao, avaliacao_media, status, horario_abertura, horario_fechamento, dias_aberto, formas_pagamento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 15, 0, 'ativo', '18:00', '23:00', ?, ?)`,
      args: [
        id,
        req.userId,
        nome,
        cnpj,
        email,
        telefone || '',
        endereco,
        categoria || 'Geral',
        latitude !== undefined ? Number(latitude) : 0,
        longitude !== undefined ? Number(longitude) : 0,
        JSON.stringify(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']),
        JSON.stringify(['Dinheiro', 'Crédito', 'Débito', 'Pix']),
      ]
    })

    await vincularRestauranteAoUsuario(id, req.userId, req.userEmail || email, req.userName || nome)

    res.status(201).json({ mensagem: 'Restaurante criado com sucesso', id })
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao criar restaurante' })
  }
})

// PUT /api/restaurantes/:id — atualizar dados da loja
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    if (!(await podeGerenciarRestaurante(req, id))) {
      return res.status(403).json({ erro: 'Você não pode alterar este restaurante' }) as any
    }
    const {
      nome,
      email,
      telefone,
      endereco,
      categoria,
      logo,
      capa,
      status,
      taxa_comissao,
      latitude,
      longitude,
      horario_abertura,
      horario_fechamento,
      dias_aberto,
      formas_pagamento,
    } = req.body

    const sets: string[] = ['updated_at = CURRENT_TIMESTAMP']
    const args: any[] = []

    if (nome !== undefined) { sets.push('nome = ?'); args.push(nome) }
    if (email !== undefined) { sets.push('email = ?'); args.push(email) }
    if (telefone !== undefined) { sets.push('telefone = ?'); args.push(telefone) }
    if (endereco !== undefined) { sets.push('endereco = ?'); args.push(endereco) }
    if (categoria !== undefined) { sets.push('categoria = ?'); args.push(categoria) }
    if (logo !== undefined) { sets.push('logo = ?'); args.push(logo) }
    if (capa !== undefined) { sets.push('capa = ?'); args.push(capa) }
    if (taxa_comissao !== undefined && !ehOperador(req)) {
      return res.status(403).json({ erro: 'Comissão só pode ser alterada por operador' }) as any
    }
    if (status !== undefined) {
      const statusPermitidos = ['pendente', 'ativo', 'fechado', 'rejeitado', 'inativo']
      if (!statusPermitidos.includes(String(status))) return res.status(400).json({ erro: 'Status inválido' }) as any
      if (!ehOperador(req) && !['ativo', 'fechado'].includes(String(status))) {
        return res.status(403).json({ erro: 'Gerentes só podem abrir ou fechar a própria loja' }) as any
      }
      sets.push('status = ?'); args.push(status)
    }
    if (taxa_comissao !== undefined) { sets.push('taxa_comissao = ?'); args.push(Number(taxa_comissao)) }
    if (latitude !== undefined && latitude !== '') { sets.push('latitude = ?'); args.push(Number(latitude)) }
    if (longitude !== undefined && longitude !== '') { sets.push('longitude = ?'); args.push(Number(longitude)) }
    if (horario_abertura !== undefined) { sets.push('horario_abertura = ?'); args.push(horario_abertura) }
    if (horario_fechamento !== undefined) { sets.push('horario_fechamento = ?'); args.push(horario_fechamento) }
    if (dias_aberto !== undefined) { sets.push('dias_aberto = ?'); args.push(serializarArray(dias_aberto)) }
    if (formas_pagamento !== undefined) { sets.push('formas_pagamento = ?'); args.push(serializarArray(formas_pagamento)) }

    args.push(id)
    await db.execute({ sql: `UPDATE restaurantes SET ${sets.join(', ')} WHERE id = ?`, args })

    const atualizado = await db.execute({ sql: 'SELECT * FROM restaurantes WHERE id = ?', args: [id] })
    if (!atualizado.rows.length) return res.status(404).json({ erro: 'Restaurante não encontrado' }) as any
    res.json({ mensagem: 'Restaurante atualizado com sucesso', restaurante: atualizado.rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: 'Erro ao atualizar restaurante' })
  }
})

// DELETE /api/restaurantes/:id — desativar
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!(await podeGerenciarRestaurante(req, String(req.params.id)))) {
      return res.status(403).json({ erro: 'Você não pode desativar este restaurante' }) as any
    }
    await db.execute({ sql: "UPDATE restaurantes SET status = 'inativo' WHERE id = ?", args: [String(req.params.id)] })
    res.json({ mensagem: 'Restaurante desativado com sucesso' })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao desativar restaurante' })
  }
})

// POST /api/restaurantes/:id/aprovar — mantém compatibilidade com fluxo manual
router.post('/:id/aprovar', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!ehOperador(req)) return res.status(403).json({ erro: 'Apenas operadores podem aprovar restaurantes' }) as any
    const { acao, motivo_rejeicao, taxa_comissao = 15 } = req.body
    if (!['aprovar', 'rejeitar'].includes(acao)) return res.status(400).json({ erro: 'Ação deve ser "aprovar" ou "rejeitar"' }) as any

    const rest = await db.execute({ sql: 'SELECT status FROM restaurantes WHERE id = ?', args: [String(req.params.id)] })
    if (!rest.rows.length) return res.status(404).json({ erro: 'Restaurante não encontrado' }) as any

    if (acao === 'rejeitar' && !motivo_rejeicao) return res.status(400).json({ erro: 'Motivo da rejeição é obrigatório' }) as any
    if (acao === 'aprovar') {
      const itens = await db.execute({ sql: 'SELECT COUNT(*) as total FROM cardapio WHERE restaurante_id = ? AND COALESCE(disponivel, 1) = 1', args: [String(req.params.id)] })
      if (Number((itens.rows[0] as any)?.total || 0) < 1) {
        return res.status(400).json({ erro: 'Adicione ao menos um item de cardápio antes de aprovar o restaurante.' }) as any
      }
    }

    const novo_status = acao === 'aprovar' ? 'ativo' : 'rejeitado'
    if (acao === 'aprovar') {
      await db.execute({ sql: 'UPDATE restaurantes SET status = ?, taxa_comissao = ?, motivo_rejeicao = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [novo_status, taxa_comissao, String(req.params.id)] })
    } else {
      await db.execute({ sql: 'UPDATE restaurantes SET status = ?, motivo_rejeicao = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', args: [novo_status, motivo_rejeicao, String(req.params.id)] })
    }

    res.json({ mensagem: `Restaurante ${acao === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso`, status: novo_status, motivo_rejeicao: motivo_rejeicao || null })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao processar aprovação' })
  }
})

export default router
