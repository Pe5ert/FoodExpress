// @ts-nocheck
// backend/src/routes/auth.ts
import { Router } from 'express';
import { db } from '../lib/db';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { enviarCodigoAcesso } from '../lib/email';

const router = Router();

const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://food-express-pearl.vercel.app').replace(/\/$/, '');
const PERFIS_VALIDOS = new Set(['cliente', 'gerente', 'entregador', 'restaurante', 'operador']);

// ── Helper ───────────────────────────────────────────────────────────────────
function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== 'production') return 'dev_secret';
  throw new Error('JWT_SECRET não configurado');
}

function gerarToken(userId: string, role: string, extras: Record<string, string> = {}) {
  return jwt.sign({ userId, role, ...extras }, getJwtSecret(), { expiresIn: '30d' });
}

function normalizarIdentificador(valor: string) {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'usuario';
}

function idEstavelPorEmail(email: string, perfil: string) {
  return `${perfil}-${normalizarIdentificador(email)}`;
}

function normalizarEmail(email: string) {
  return String(email || '').trim().toLowerCase();
}

function gerarCodigoVerificacao() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function buscarPerfisPorEmail(email: string) {
  const emailLimpo = normalizarEmail(email);
  const perfis: string[] = [];
  if (!emailLimpo) return perfis;

  const cliente = await db.execute({ sql: 'SELECT id FROM clientes WHERE lower(email) = ? LIMIT 1', args: [emailLimpo] });
  if (cliente.rows.length) perfis.push('cliente');

  const entregador = await db.execute({ sql: 'SELECT id FROM entregadores WHERE lower(email) = ? LIMIT 1', args: [emailLimpo] });
  if (entregador.rows.length) perfis.push('entregador');

  const restaurante = await db.execute({ sql: 'SELECT id FROM restaurantes WHERE lower(email) = ? LIMIT 1', args: [emailLimpo] });
  if (restaurante.rows.length) perfis.push('restaurante');

  const gerente = await db.execute({ sql: 'SELECT id FROM gerentes WHERE lower(email) = ? LIMIT 1', args: [emailLimpo] });
  if (gerente.rows.length) perfis.push('gerente');

  const operador = await db.execute({ sql: 'SELECT id FROM operadores WHERE lower(email) = ? LIMIT 1', args: [emailLimpo] });
  if (operador.rows.length) perfis.push('operador');

  return perfis;
}

async function criarOuAtualizarClientePorEmail(row: any) {
  const emailLimpo = normalizarEmail(row.email);
  const telefone = row.telefone || '';
  const nome = row.nome || emailLimpo.split('@')[0];

  const existenteCliente = await db.execute({
    sql: 'SELECT id, nome, email, telefone FROM clientes WHERE lower(email) = ? LIMIT 1',
    args: [emailLimpo]
  });

  if (existenteCliente.rows.length) {
    const cliente = existenteCliente.rows[0] as any;
    if (!cliente.nome && nome) {
      await db.execute({ sql: 'UPDATE clientes SET nome = ? WHERE id = ?', args: [nome, cliente.id] });
    }
    if (!cliente.telefone && telefone) {
      await db.execute({ sql: 'UPDATE clientes SET telefone = ? WHERE id = ?', args: [telefone, cliente.id] });
    }
    const atualizado = await db.execute({ sql: 'SELECT * FROM clientes WHERE id = ?', args: [cliente.id] });
    return atualizado.rows[0] as any;
  }

  const clienteId = `cli_${crypto.randomUUID().slice(0, 8)}`;
  await db.execute({
    sql: `INSERT INTO clientes (id, user_id, nome, email, telefone, total_pedidos)
          VALUES (?, ?, ?, ?, ?, 0)`,
    args: [clienteId, clienteId, nome, emailLimpo, telefone]
  });
  const criado = await db.execute({ sql: 'SELECT * FROM clientes WHERE id = ?', args: [clienteId] });
  return criado.rows[0] as any;
}

function respostaSessaoCliente(cliente: any) {
  const token = gerarToken(cliente.id, 'cliente', {
    email: cliente.email || '',
    nome: cliente.nome || '',
  });
  return {
    token,
    usuario: {
      id: cliente.id,
      nome: cliente.nome || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      perfil: 'cliente',
    }
  };
}

// ── POST /api/auth/registrar ─────────────────────────────────────────────────
// Etapa 1: Salva email como pendente e envia código de confirmação
router.post('/registrar', async (req, res) => {
  try {
    const { email, telefone, nome } = req.body;
    if (!email) return res.status(400).json({ erro: 'E-mail obrigatório' });

    const emailLimpo = email.toLowerCase().trim();

    // Verifica se já existe conta confirmada
    const perfisExistentes = await buscarPerfisPorEmail(emailLimpo);
    if (perfisExistentes.includes('cliente')) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado' });
    }
    const outrosPerfis = perfisExistentes.filter(p => p !== 'cliente');
    if (outrosPerfis.length) {
      return res.status(409).json({ erro: `Este e-mail já está cadastrado como perfil ${outrosPerfis.join(', ')}.` });
    }

    // Cria registro pendente
    const pendingId = `pend_${crypto.randomUUID().slice(0, 12)}`;
    const tokenAtivacao = crypto.randomUUID();
    const codigo = gerarCodigoVerificacao();
    const expira = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.execute({
      sql: `INSERT OR REPLACE INTO usuarios_pendentes 
            (id, email, nome, telefone, token, codigo, tipo, expira_em, criado_em)
            VALUES (?, ?, ?, ?, ?, ?, 'email', ?, CURRENT_TIMESTAMP)`,
      args: [pendingId, emailLimpo, nome || '', telefone || '', tokenAtivacao, codigo, expira]
    }).catch(async () => {
      // Cria a tabela se não existir
      await db.execute(`
        CREATE TABLE IF NOT EXISTS usuarios_pendentes (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          nome TEXT,
          telefone TEXT,
          token TEXT NOT NULL,
          codigo TEXT,
          tipo TEXT DEFAULT 'email',
          expira_em DATETIME NOT NULL,
          usado INTEGER DEFAULT 0,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await db.execute({
        sql: `INSERT OR REPLACE INTO usuarios_pendentes 
              (id, email, nome, telefone, token, codigo, tipo, expira_em)
              VALUES (?, ?, ?, ?, ?, ?, 'email', ?)`,
        args: [pendingId, emailLimpo, nome || '', telefone || '', tokenAtivacao, codigo, expira]
      });
    });

    await enviarCodigoAcesso(emailLimpo, codigo, nome || emailLimpo.split('@')[0], 'cadastro');

    res.json({
      mensagem: 'Código de confirmação enviado para seu e-mail.',
      token: tokenAtivacao,
      expira_em: expira,
      ...(process.env.NODE_ENV !== 'production' && { devCode: codigo })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao processar cadastro' });
  }
});

// ── POST /api/auth/email/confirmar ───────────────────────────────────────────
router.post('/email/confirmar', async (req, res) => {
  try {
    const { token, codigo } = req.body;
    if (!token || !codigo) return res.status(400).json({ erro: 'Token e código são obrigatórios' });

    const pending = await db.execute({
      sql: `SELECT * FROM usuarios_pendentes
            WHERE token = ? AND codigo = ? AND tipo = 'email' AND usado = 0 AND expira_em > datetime('now')`,
      args: [token, String(codigo).trim()]
    });
    if (!pending.rows.length) {
      return res.status(400).json({ erro: 'Código inválido ou expirado' });
    }

    const row = pending.rows[0] as any;
    const perfisExistentes = await buscarPerfisPorEmail(row.email);
    const outrosPerfis = perfisExistentes.filter(p => p !== 'cliente');
    if (outrosPerfis.length) {
      return res.status(409).json({ erro: `Este e-mail já está cadastrado como perfil ${outrosPerfis.join(', ')}.` });
    }

    const cliente = await criarOuAtualizarClientePorEmail(row);
    await db.execute({ sql: 'UPDATE usuarios_pendentes SET usado = 1 WHERE token = ?', args: [token] });
    res.json(respostaSessaoCliente(cliente));
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao confirmar e-mail' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ erro: 'E-mail obrigatório' });

    const emailLimpo = normalizarEmail(email);

    const perfisExistentes = await buscarPerfisPorEmail(emailLimpo);
    if (perfisExistentes.some(p => p !== 'cliente')) {
      return res.status(400).json({ erro: 'Este e-mail pertence a outro tipo de conta. Use o perfil correto ou cadastre um e-mail diferente.' });
    }

    // Verifica se existe conta confirmada
    const existente = await db.execute({
      sql: 'SELECT id FROM clientes WHERE lower(email) = ?',
      args: [emailLimpo]
    });

    if (!existente.rows.length) {
      return res.status(404).json({ erro: 'E-mail não cadastrado. Faça o cadastro primeiro.' });
    }

    const tokenLogin = crypto.randomUUID();
    const codigo = gerarCodigoVerificacao();
    const expira = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.execute({
      sql: `INSERT OR REPLACE INTO usuarios_pendentes 
            (id, email, token, codigo, tipo, expira_em, criado_em)
            VALUES (?, ?, ?, ?, 'login', ?, CURRENT_TIMESTAMP)`,
      args: [`login_${crypto.randomUUID().slice(0,8)}`, emailLimpo, tokenLogin, codigo, expira]
    });

    await enviarCodigoAcesso(emailLimpo, codigo, emailLimpo.split('@')[0], 'login');

    res.json({
      mensagem: 'Código de acesso enviado para seu e-mail',
      token: tokenLogin,
      expira_em: expira,
      ...(process.env.NODE_ENV !== 'production' && { devCode: codigo })
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao processar login' });
  }
});

// ── POST /api/auth/login/confirmar ───────────────────────────────────────────
router.post('/login/confirmar', async (req, res) => {
  try {
    const { token, codigo } = req.body;
    if (!token || !codigo) return res.status(400).json({ erro: 'Token e código são obrigatórios' });

    const pending = await db.execute({
      sql: `SELECT * FROM usuarios_pendentes
            WHERE token = ? AND codigo = ? AND tipo = 'login' AND usado = 0 AND expira_em > datetime('now')`,
      args: [token, String(codigo).trim()]
    });
    if (!pending.rows.length) {
      return res.status(400).json({ erro: 'Código inválido ou expirado' });
    }

    const emailLimpo = normalizarEmail((pending.rows[0] as any).email);
    const clienteResult = await db.execute({
      sql: 'SELECT * FROM clientes WHERE lower(email) = ? LIMIT 1',
      args: [emailLimpo]
    });
    if (!clienteResult.rows.length) {
      return res.status(404).json({ erro: 'E-mail não cadastrado. Faça o cadastro primeiro.' });
    }

    await db.execute({ sql: 'UPDATE usuarios_pendentes SET usado = 1 WHERE token = ?', args: [token] });
    res.json(respostaSessaoCliente(clienteResult.rows[0] as any));
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao confirmar login' });
  }
});

// ── POST /api/auth/session ───────────────────────────────────────────────────
// Emite JWT no backend para fluxos locais/perfis internos sem expor JWT_SECRET no bundle.
router.post('/session', async (req, res) => {
  try {
    const { email, nome, perfil, userId, cadastro = false } = req.body;
    const emailLimpo = normalizarEmail(String(email || ''));
    const perfilNormalizado = String(perfil || 'cliente').toLowerCase().trim();

    if (!emailLimpo) return res.status(400).json({ erro: 'E-mail obrigatório' });
    if (!PERFIS_VALIDOS.has(perfilNormalizado)) {
      return res.status(400).json({ erro: 'Perfil inválido' });
    }

    const perfisExistentes = await buscarPerfisPorEmail(emailLimpo);
    const perfisCompatíveis = perfilNormalizado === 'gerente'
      ? new Set(['gerente', 'restaurante'])
      : perfilNormalizado === 'restaurante'
        ? new Set(['restaurante', 'gerente'])
        : new Set([perfilNormalizado]);
    const perfisDiferentes = perfisExistentes.filter(p => !perfisCompatíveis.has(p));
    if (perfisDiferentes.length) {
      return res.status(409).json({ erro: `Este e-mail já está cadastrado como perfil ${perfisDiferentes.join(', ')}.` });
    }
    if (perfilNormalizado === 'operador') {
      const operador = await db.execute({
        sql: "SELECT id, nome, email FROM operadores WHERE lower(email) = ? AND COALESCE(status, 'ativo') = 'ativo' LIMIT 1",
        args: [emailLimpo]
      });
      if (!operador.rows.length) {
        return res.status(404).json({ erro: 'Operador não encontrado ou inativo.' });
      }
    }

    if (['gerente', 'restaurante'].includes(perfilNormalizado) && !cadastro) {
      const existente = await db.execute({
        sql: `SELECT id FROM restaurantes
              WHERE lower(email) = ? OR user_id = ?
              LIMIT 1`,
        args: [emailLimpo, userId || idEstavelPorEmail(emailLimpo, perfilNormalizado)]
      });
      if (!existente.rows.length) {
        return res.status(404).json({ erro: 'Restaurante não encontrado. Faça o cadastro do estabelecimento primeiro.' });
      }
    }

    if (perfilNormalizado === 'entregador' && !cadastro) {
      const existente = await db.execute({
        sql: `SELECT id FROM entregadores
              WHERE lower(email) = ? OR user_id = ?
              LIMIT 1`,
        args: [emailLimpo, userId || idEstavelPorEmail(emailLimpo, perfilNormalizado)]
      });
      if (!existente.rows.length) {
        return res.status(404).json({ erro: 'Entregador não encontrado. Faça o cadastro primeiro.' });
      }
    }

    const id = userId || idEstavelPorEmail(emailLimpo, perfilNormalizado);
    const token = gerarToken(id, perfilNormalizado, {
      email: emailLimpo,
      nome: nome || emailLimpo.split('@')[0],
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar sessão' });
  }
});

// ── POST /api/auth/auth0-sync ─────────────────────────────────────────────────
router.post('/auth0-sync', async (req, res) => {
  try {
    const { email, nome } = req.body;
    if (!email) return res.status(400).json({ erro: 'E-mail obrigatório' });

    const emailLimpo = email.toLowerCase().trim();
    const perfisExistentes = await buscarPerfisPorEmail(emailLimpo);
    const perfisDiferentes = perfisExistentes.filter(p => p !== 'cliente');
    if (perfisDiferentes.length) {
      return res.status(409).json({ erro: `Este e-mail já está cadastrado como perfil ${perfisDiferentes.join(', ')}.` });
    }

    const existente = await db.execute({
      sql: 'SELECT * FROM clientes WHERE email = ?',
      args: [emailLimpo]
    });

    if (existente.rows.length) {
      const cliente = existente.rows[0];
      const token = gerarToken(cliente.id, 'cliente', {
        email: cliente.email,
        nome: cliente.nome,
      });
      return res.json({ token, usuario: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone || '',
        perfil: 'cliente'
      }});
    }

    const clienteId = `cli_${crypto.randomUUID().slice(0, 8)}`;
    await db.execute({
      sql: `INSERT INTO clientes (id, user_id, nome, email, telefone, total_pedidos)
            VALUES (?, ?, ?, ?, ?, 0)`,
      args: [clienteId, clienteId, nome || emailLimpo.split('@')[0], emailLimpo, '']
    });

    const token = gerarToken(clienteId, 'cliente', {
      email: emailLimpo,
      nome: nome || emailLimpo.split('@')[0],
    });
    res.json({ token, usuario: {
      id: clienteId,
      nome: nome || emailLimpo.split('@')[0],
      email: emailLimpo,
      telefone: '',
      perfil: 'cliente'
    }});
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao sincronizar usuário Auth0' });
  }
});

export default router;
