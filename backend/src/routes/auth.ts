// @ts-nocheck
// backend/src/routes/auth.ts
import { Router } from 'express';
import { db } from '../lib/db';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { enviarCodigoAcesso } from '../lib/email';
import { hashSenha, verificarSenha } from '../lib/password';

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

function hashCodigoVerificacao(token: string, codigo: string) {
  return crypto
    .createHash('sha256')
    .update(`${token}:${String(codigo || '').trim()}`)
    .digest('hex');
}

function codigoConfere(pendente: any, codigo: string) {
  const recebidoHash = hashCodigoVerificacao(String(pendente.token || ''), codigo);
  const salvoHash = String(pendente.codigo_hash || '');
  if (salvoHash) {
    try {
      return crypto.timingSafeEqual(Buffer.from(recebidoHash), Buffer.from(salvoHash));
    } catch {
      return false;
    }
  }
  return String(pendente.codigo || '') === String(codigo || '').trim();
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

async function buscarUsuarioParaLogin(email: string, perfil: string) {
  const emailLimpo = normalizarEmail(email);
  if (perfil === 'cliente') {
    const result = await db.execute({ sql: 'SELECT id, nome, email, telefone, senha_hash FROM clientes WHERE lower(email) = ? LIMIT 1', args: [emailLimpo] });
    const row = result.rows[0] as any;
    return row ? { ...row, perfil: 'cliente' } : null;
  }

  if (perfil === 'gerente' || perfil === 'restaurante') {
    const gerente = await db.execute({ sql: "SELECT id, user_id, nome, email, telefone, restaurante_id, senha_hash FROM gerentes WHERE lower(email) = ? AND COALESCE(status, 'ativo') = 'ativo' LIMIT 1", args: [emailLimpo] });
    if (gerente.rows.length) {
      const row = gerente.rows[0] as any;
      return { id: row.user_id || row.id, nome: row.nome, email: row.email, telefone: row.telefone || '', restaurante_id: row.restaurante_id || '', senha_hash: row.senha_hash || '', perfil: 'gerente' };
    }
    const rest = await db.execute({ sql: 'SELECT id, user_id, nome, email, telefone, senha_hash FROM restaurantes WHERE lower(email) = ? LIMIT 1', args: [emailLimpo] });
    const row = rest.rows[0] as any;
    return row ? { id: row.user_id || row.id, nome: row.nome, email: row.email, telefone: row.telefone || '', restaurante_id: row.id, senha_hash: row.senha_hash || '', perfil: 'gerente' } : null;
  }

  if (perfil === 'entregador') {
    const result = await db.execute({ sql: 'SELECT id, user_id, nome, email, telefone, senha_hash FROM entregadores WHERE lower(email) = ? LIMIT 1', args: [emailLimpo] });
    const row = result.rows[0] as any;
    return row ? { id: row.user_id || row.id, entregador_id: row.id, nome: row.nome, email: row.email, telefone: row.telefone || '', senha_hash: row.senha_hash || '', perfil: 'entregador' } : null;
  }

  if (perfil === 'operador') {
    const result = await db.execute({ sql: "SELECT id, user_id, nome, email, telefone, senha_hash FROM operadores WHERE lower(email) = ? AND COALESCE(status, 'ativo') = 'ativo' LIMIT 1", args: [emailLimpo] });
    const row = result.rows[0] as any;
    return row ? { id: row.user_id || row.id, operador_id: row.id, nome: row.nome, email: row.email, telefone: row.telefone || '', senha_hash: row.senha_hash || '', perfil: 'operador' } : null;
  }

  return null;
}

async function definirSenhaInicial(email: string, perfil: string, senhaHash: string) {
  const emailLimpo = normalizarEmail(email);
  if (perfil === 'cliente') {
    await db.execute({ sql: 'UPDATE clientes SET senha_hash = ? WHERE lower(email) = ?', args: [senhaHash, emailLimpo] });
    return;
  }
  if (perfil === 'entregador') {
    await db.execute({ sql: 'UPDATE entregadores SET senha_hash = ? WHERE lower(email) = ?', args: [senhaHash, emailLimpo] });
    return;
  }
  if (perfil === 'operador') {
    await db.execute({ sql: 'UPDATE operadores SET senha_hash = ? WHERE lower(email) = ?', args: [senhaHash, emailLimpo] });
    return;
  }
  if (perfil === 'gerente' || perfil === 'restaurante') {
    await db.execute({ sql: 'UPDATE gerentes SET senha_hash = ? WHERE lower(email) = ?', args: [senhaHash, emailLimpo] });
    await db.execute({ sql: 'UPDATE restaurantes SET senha_hash = ? WHERE lower(email) = ?', args: [senhaHash, emailLimpo] });
  }
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

function respostaSessaoPerfil(usuario: any) {
  const perfil = usuario.perfil || 'cliente';
  const token = gerarToken(usuario.id, perfil, {
    email: usuario.email || '',
    nome: usuario.nome || '',
  });
  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome || '',
      email: usuario.email || '',
      telefone: usuario.telefone || '',
      perfil,
      restaurante_id: usuario.restaurante_id || undefined,
      entregador_id: usuario.entregador_id || undefined,
      operador_id: usuario.operador_id || undefined,
    }
  };
}

// ── POST /api/auth/registrar ─────────────────────────────────────────────────
// Etapa 1: Salva email como pendente e envia código de confirmação
router.post('/registrar', async (req, res) => {
  try {
    const { email, telefone, nome, senha, password } = req.body;
    if (!email) return res.status(400).json({ erro: 'E-mail obrigatório' });
    const telefoneLimpo = String(telefone || '').replace(/\D/g, '');
    if (telefoneLimpo.length < 10) return res.status(400).json({ erro: 'Telefone obrigatório para contato da entrega' });
    const senhaInformada = String(senha || password || '');
    if (!senhaInformada) return res.status(400).json({ erro: 'Senha obrigatória' });
    if (senhaInformada.length < 6) return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });

    const emailLimpo = email.toLowerCase().trim();

    // Verifica se já existe conta confirmada
    const perfisExistentes = await buscarPerfisPorEmail(emailLimpo);
    if (perfisExistentes.includes('cliente')) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado' });
    }

    const clienteId = `cli_${crypto.randomUUID().slice(0, 8)}`;
    const senhaHash = hashSenha(senhaInformada);
    await db.execute({
      sql: `INSERT INTO clientes (id, user_id, nome, email, telefone, senha_hash, total_pedidos)
            VALUES (?, ?, ?, ?, ?, ?, 0)`,
      args: [clienteId, clienteId, nome || emailLimpo.split('@')[0], emailLimpo, telefone || '', senhaHash]
    });

    const cliente = await db.execute({ sql: 'SELECT id, nome, email, telefone FROM clientes WHERE id = ?', args: [clienteId] });
    res.status(201).json(respostaSessaoCliente(cliente.rows[0] as any));
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
            WHERE token = ? AND tipo = 'email' AND usado = 0 AND expira_em > NOW()`,
      args: [token]
    });
    if (!pending.rows.length || !codigoConfere(pending.rows[0], codigo)) {
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
    const { email, perfil = 'cliente' } = req.body;
    if (!email) return res.status(400).json({ erro: 'E-mail obrigatório' });

    const emailLimpo = normalizarEmail(email);
    const perfilNormalizado = String(perfil || 'cliente').toLowerCase().trim();
    if (!PERFIS_VALIDOS.has(perfilNormalizado)) {
      return res.status(400).json({ erro: 'Perfil inválido' });
    }

    if (perfilNormalizado === 'cliente') {
      const perfisExistentes = await buscarPerfisPorEmail(emailLimpo);
      if (perfisExistentes.some(p => p !== 'cliente')) {
        return res.status(400).json({ erro: 'Este e-mail pertence a outro tipo de conta. Use o perfil correto ou cadastre um e-mail diferente.' });
      }
    }

    const usuarioLogin = await buscarUsuarioParaLogin(emailLimpo, perfilNormalizado);
    if (!usuarioLogin) {
      const mensagens: Record<string, string> = {
        cliente: 'E-mail não cadastrado. Faça o cadastro primeiro.',
        gerente: 'Restaurante não encontrado para este e-mail.',
        restaurante: 'Restaurante não encontrado para este e-mail.',
        entregador: 'Entregador não encontrado para este e-mail.',
        operador: 'Operador não encontrado ou inativo.',
      };
      return res.status(404).json({ erro: mensagens[perfilNormalizado] || 'Conta não encontrada.' });
    }

    const tokenLogin = crypto.randomUUID();
    const codigo = gerarCodigoVerificacao();
    const codigoHash = hashCodigoVerificacao(tokenLogin, codigo);
    const expira = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.execute({
      sql: `INSERT INTO usuarios_pendentes
            (id, email, nome, telefone, token, codigo, codigo_hash, tipo, expira_em, criado_em)
            VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
              nome = VALUES(nome),
              telefone = VALUES(telefone),
              token = VALUES(token),
              codigo = NULL,
              codigo_hash = VALUES(codigo_hash),
              tipo = VALUES(tipo),
              expira_em = VALUES(expira_em),
              usado = 0,
              criado_em = CURRENT_TIMESTAMP`,
      args: [`login_${crypto.randomUUID().slice(0,8)}`, emailLimpo, usuarioLogin.nome || '', usuarioLogin.telefone || '', tokenLogin, codigoHash, `login:${perfilNormalizado}`, expira]
    });

    await enviarCodigoAcesso(emailLimpo, codigo, usuarioLogin.nome || emailLimpo.split('@')[0], 'login');

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
            WHERE token = ? AND tipo LIKE 'login%' AND usado = 0 AND expira_em > NOW()`,
      args: [token]
    });
    if (!pending.rows.length || !codigoConfere(pending.rows[0], codigo)) {
      return res.status(400).json({ erro: 'Código inválido ou expirado' });
    }

    const pendente = pending.rows[0] as any;
    const emailLimpo = normalizarEmail(pendente.email);
    const tipo = String(pendente.tipo || 'login:cliente');
    const perfil = tipo.includes(':') ? tipo.split(':')[1] : 'cliente';
    const usuarioLogin = await buscarUsuarioParaLogin(emailLimpo, perfil);
    if (!usuarioLogin) {
      return res.status(404).json({ erro: 'Conta não encontrada ou inativa.' });
    }

    await db.execute({ sql: 'UPDATE usuarios_pendentes SET usado = 1 WHERE token = ?', args: [token] });
    res.json(respostaSessaoPerfil(usuarioLogin));
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao confirmar login' });
  }
});

// ── POST /api/auth/session ───────────────────────────────────────────────────
// Emite JWT no backend para fluxos locais/perfis internos sem expor JWT_SECRET no bundle.
router.post('/session', async (req, res) => {
  try {
    const { email, nome, perfil, userId, cadastro = false, senha, password } = req.body;
    const emailLimpo = normalizarEmail(String(email || ''));
    const perfilNormalizado = String(perfil || 'cliente').toLowerCase().trim();
    const senhaInformada = String(senha || password || '');

    if (!emailLimpo) return res.status(400).json({ erro: 'E-mail obrigatório' });
    if (!PERFIS_VALIDOS.has(perfilNormalizado)) {
      return res.status(400).json({ erro: 'Perfil inválido' });
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

    if (!cadastro) {
      if (!senhaInformada) return res.status(400).json({ erro: 'Senha obrigatória' });
      const usuarioLogin = await buscarUsuarioParaLogin(emailLimpo, perfilNormalizado);
      if (!usuarioLogin) return res.status(404).json({ erro: 'Conta não encontrada ou inativa.' });
      if (!usuarioLogin.senha_hash) {
        if (senhaInformada.length < 6) {
          return res.status(401).json({ erro: 'Esta conta antiga ainda não tinha senha. Digite uma senha com pelo menos 6 caracteres para ativar o acesso.' });
        }
        const senhaHash = hashSenha(senhaInformada);
        await definirSenhaInicial(emailLimpo, perfilNormalizado, senhaHash);
        usuarioLogin.senha_hash = senhaHash;
      }
      if (!verificarSenha(senhaInformada, usuarioLogin.senha_hash)) {
        return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
      }
      return res.json(respostaSessaoPerfil(usuarioLogin));
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

    const perfisExistentes = await buscarPerfisPorEmail(emailLimpo);
    const perfisDiferentes = perfisExistentes.filter(p => p !== 'cliente');
    if (perfisDiferentes.length) {
      return res.status(409).json({ erro: `Este e-mail já está cadastrado como ${perfisDiferentes.join(', ')}. Entre pelo perfil correto com e-mail e senha.` });
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
